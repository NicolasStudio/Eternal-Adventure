import {
    db, ref, set, update, remove, onValue, off, onDisconnect,
    get, runTransaction, serverTimestamp
} from "./FirebaseService.js";
import AuthService from "./AuthService.js";
import monstersRaid from "../data/monstersRaid.js";
import { sanitizeRemote } from "./MatchSanitizer.js";

// Tempo que um candidato reivindicado (claimedBy preenchido) espera
// virar uma partida de verdade antes de se liberar sozinho — mesmo
// mecanismo do PvpLobbyService.js (cobre quem estava montando o grupo
// caindo da conexão bem entre "reivindicar" e "terminar de montar").
const STALE_CLAIM_TIMEOUT_MS = 8000;

// Tamanho do squad — também é o número de vagas mostrado na fila e na
// tela de confirmação entre andares.
export const SQUAD_SIZE = 4;

// Mínimo pro host começar sem esperar o squad completo (ver
// forceStartSquad) — mesmo mínimo já aceito entre andares pelo botão
// "Continuar com X jogadores" (allowShortSquad), só que aqui pra
// formar a partida logo de cara.
export const MIN_SQUAD_SIZE = 3;

/*
    Mesmo esquema de pareamento do 2x2 (ver PvpLobbyService.js), só que
    formando um SQUAD de 4 jogadores contra 1 boss em vez de dois times
    de 2 — não existe "lado B" de jogadores aqui, só um monstro de
    monstersRaid.js escolhido pela própria seed da partida (determinístico
    nos 4 clientes, sem precisar gravar o monstro inteiro no Firebase).

    Fila e partidas usam as MESMAS árvores do PVP (pvpLobby/pvpMatches),
    só um novo namespace de modo ("raid") — nunca esbarra em quem está
    procurando 1x1/2x2.
*/
export default class RaidLobbyService {

    static playerId = null;
    static lobbyListener = null;
    static selfMatchListener = null;
    static staleClaimTimer = null;
    static cancelFloorWait = null;


    static lobbyPath() {
        return "pvpLobby/raid";
    }

    static matchesPath() {
        return "pvpMatches/raid";
    }

    static scheduleStaleClaimRelease(selfPath) {

        if (this.staleClaimTimer) return;

        this.staleClaimTimer = setTimeout(async () => {

            this.staleClaimTimer = null;

            const snapshot = await get(ref(db, selfPath));
            const data = snapshot.val();

            if (data?.claimedBy && !data?.matchedWith) {
                await set(ref(db, `${selfPath}/claimedBy`), null);
            }

        }, STALE_CLAIM_TIMEOUT_MS);

    }

    static clearStaleClaimTimer() {

        if (!this.staleClaimTimer) return;

        clearTimeout(this.staleClaimTimer);
        this.staleClaimTimer = null;

    }

    // Entra na fila da raid. onMatchFound(match, matchId) é chamado
    // quando um squad de 4 (incluindo este jogador) se forma — seja
    // porque ele formou, seja porque outra pessoa formou e o incluiu.
    // onKicked() é chamado quando o host me tira da fila (ver kickFromQueue).
    static async joinQueue(combatant, onMatchFound, onOpponentJoined, onQueueChanged, onKicked) {

        if (this.playerId) {
            await this.leaveQueue();
        }

        const uid = AuthService.getCurrentUser()?.uid;
        if (!uid) throw new Error("Entre na sua conta pra jogar.");
        this.playerId = uid;

        const selfRef = ref(db, `${this.lobbyPath()}/${this.playerId}`);

        await set(selfRef, {
            ...combatant,
            joinedAt: serverTimestamp()
            // Sem "matchedWith: null" de propósito — mesmo motivo do
            // PvpLobbyService.js: o Firebase apaga campos null, então a
            // ausência do campo (não "=== null") é o que se testa abaixo.
        });

        onDisconnect(selfRef).remove();

        this.selfMatchListener = onValue(selfRef, async (snapshot) => {

            const data = snapshot.val();

            // Meu nó sumiu sem eu ter saído (leaveQueue para de escutar
            // ANTES de apagar) — foi o host que me removeu da fila.
            if (!data || data.kicked) {
                this.stopListening();
                this.playerId = null;
                await remove(selfRef);
                onKicked?.();
                return;
            }

            if (data?.matchedWith) {

                this.clearStaleClaimTimer();

                const matchSnapshot = await get(ref(db, `${this.matchesPath()}/${data.matchId}`));
                // O squad foi gravado por outros navegadores — nunca chega
                // cru na tela (ver MatchSanitizer.js).
                const match = sanitizeRemote(matchSnapshot.val());

                if (match) {
                    this.stopListening();
                    onMatchFound(match, data.matchId);
                }

            } else if (data?.claimedBy) {

                this.scheduleStaleClaimRelease(`${this.lobbyPath()}/${this.playerId}`);

            } else {

                this.clearStaleClaimTimer();

            }

        });

        // Escuta a fila inteira: assim que houver 3 outros candidatos
        // livres (eu + 3 = squad de 4), tenta formar a partida.
        const lobbyRef = ref(db, this.lobbyPath());

        this.lobbyListener = onValue(lobbyRef, async (snapshot) => {

            const all = snapshot.val() ?? {};

            const waiting = Object.entries(sanitizeRemote(all))
                .filter(([, entry]) => !entry.matchedWith)
                .sort(([, a], [, b]) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0))
                // O primeiro da fila (quem entrou antes) é o host: só ele
                // pode tirar alguém da fila e convidar (ver RaidView).
                .map(([id, entry], index) => ({ id, name: entry.name, level: entry.level, isSelf: id === this.playerId, isHost: index === 0 }));

            onQueueChanged?.(waiting);

            const others = Object.entries(all)
                .filter(([id, entry]) => id !== this.playerId && !entry.matchedWith && !entry.claimedBy)
                .sort(([idA], [idB]) => idA < idB ? -1 : 1);

            const requiredOthers = SQUAD_SIZE - 1;

            if (others.length < requiredOthers) {
                onOpponentJoined?.(others.length > 0);
                return;
            }

            onOpponentJoined?.(true);

            const selfSnapshot = await get(selfRef);
            if (selfSnapshot.val()?.matchedWith) return;

            // Só quem tem o ID "menor" entre TODOS os candidatos
            // (incluindo eu mesmo) tenta montar o squad de 4 — evita que
            // duas pessoas tentem formar grupos ao mesmo tempo com gente
            // sobreposta (mesma regra do 2x2 em PvpLobbyService.js).
            const allWaitingIds = [this.playerId, ...others.map(([id]) => id)].sort();

            if (allWaitingIds[0] !== this.playerId) return;

            const candidateEntries = others.slice(0, 3);
            const candidateIds = candidateEntries.map(([id]) => id);
            const candidateData = Object.fromEntries(candidateEntries);

            // joinedAt junto: é ele que ordena os `seat` (quem é o host).
            await this.tryMatchSquad(candidateIds, candidateData, { ...combatant, joinedAt: all[this.playerId]?.joinedAt ?? 0 });

        });

    }

    // Reivindica os 3 candidatos um de cada vez (mesma lógica do 2x2 em
    // PvpLobbyService.tryMatchTeam). Se qualquer reivindicação falhar no
    // meio do caminho, libera as que já tinham dado certo e desiste —
    // quem ainda estiver esperando tenta de novo no próximo tick.
    static async tryMatchSquad(candidateIds, candidateData, selfCombatant) {

        const claimedIds = [];
        const claimDisconnectRefs = [];

        for (const candidateId of candidateIds) {

            // Só o campo claimedBy: se já houver reivindicação, a transação aborta.
            const claimResult = await runTransaction(
                ref(db, `${this.lobbyPath()}/${candidateId}/claimedBy`),
                (current) => current ? undefined : this.playerId
            );

            if (!claimResult.committed) {

                for (const releasedId of claimedIds) {
                    await set(ref(db, `${this.lobbyPath()}/${releasedId}/claimedBy`), null);
                }

                claimDisconnectRefs.forEach(disconnectRef => onDisconnect(disconnectRef).cancel());

                return;

            }

            const claimDisconnectRef = ref(db, `${this.lobbyPath()}/${candidateId}/claimedBy`);
            onDisconnect(claimDisconnectRef).remove();
            claimDisconnectRefs.push(claimDisconnectRef);

            claimedIds.push(candidateId);

        }

        // Reivindicou os 3 — monta o squad inteiro (eu + os 3) e cria a
        // partida. O boss é escolhido pela seed, não gravado por
        // inteiro — cada cliente resolve o mesmo monstro localmente a
        // partir de monstersRaid.js (mesmo princípio do chosenBossDungeon
        // do PvpView, que também é derivado da seed em vez de transmitido).
        const matchId = "m_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        const seed = Math.floor(Math.random() * 2 ** 31);

        // O cooperativo agora é uma sequência fixa de andares (ver campo
        // `floor` em monstersRaid.js) — o boss da partida sempre começa
        // no andar 1, não é mais sorteado pela seed.
        const bossId = (monstersRaid.find(m => m.floor === 1) ?? monstersRaid[0]).id;

        // `seat` = ordem de entrada na fila: o host da fila continua host
        // na partida, e o menor seat ainda ativo assume se ele sair (ver
        // getHostId).
        const allCombatants = [
            { ...selfCombatant, id: this.playerId },
            ...claimedIds.map(id => ({ ...candidateData[id], id }))
        ]
            .sort((a, b) => (a.joinedAt ?? 0) - (b.joinedAt ?? 0) || (a.id < b.id ? -1 : 1))
            .map((c, seat) => ({ ...c, seat }));

        // squad é um objeto indexado por ID (não array) — mesmo motivo
        // do teamA/teamB em PvpLobbyService.js: o Firebase não guarda
        // arrays de verdade, converte pra objeto com chaves numéricas.
        const squad = {};
        allCombatants.forEach(c => { squad[c.id] = c; });

        const allIds = [this.playerId, ...claimedIds];

        const updates = {
            [`${this.matchesPath()}/${matchId}`]: {
                squad,
                players: Object.fromEntries(allIds.map(id => [id, true])),
                bossId,
                seed,
                floor: 1,
                createdAt: serverTimestamp()
            }
        };

        for (const id of allIds) {
            updates[`${this.lobbyPath()}/${id}/matchedWith`] = true;
            updates[`${this.lobbyPath()}/${id}/matchId`] = matchId;
        }

        await update(ref(db), updates);

        claimDisconnectRefs.forEach(disconnectRef => onDisconnect(disconnectRef).cancel());

    }

    // Host decide começar com quem já está na fila, sem esperar o 4º —
    // precisa de pelo menos MIN_SQUAD_SIZE no total (eu + outros). Lê o
    // estado atual uma vez (em vez de depender do listener do
    // joinQueue) porque é uma ação pontual de clique, não contínua.
    // tryMatchSquad já lida com qualquer quantidade de candidatos (não
    // é hardcoded pra 4), então só precisa reaproveitar ele aqui.
    static async forceStartSquad() {

        if (!this.playerId) return { ok: false };

        const selfPath = `${this.lobbyPath()}/${this.playerId}`;
        const selfSnapshot = await get(ref(db, selfPath));
        const selfData = selfSnapshot.val();

        if (!selfData || selfData.matchedWith) return { ok: false };

        const lobbySnapshot = await get(ref(db, this.lobbyPath()));
        const all = lobbySnapshot.val() ?? {};

        const others = Object.entries(all)
            .filter(([id, entry]) => id !== this.playerId && !entry.matchedWith && !entry.claimedBy)
            .sort(([idA], [idB]) => idA < idB ? -1 : 1);

        const minOthers = MIN_SQUAD_SIZE - 1;

        if (others.length < minOthers) return { ok: false };

        const candidateEntries = others.slice(0, SQUAD_SIZE - 1);
        const candidateIds = candidateEntries.map(([id]) => id);
        const candidateData = Object.fromEntries(candidateEntries);

        await this.tryMatchSquad(candidateIds, candidateData, { ...selfData, joinedAt: selfData.joinedAt ?? 0 });

        return { ok: true };

    }

    // Host tirando alguém da fila. Transaction (não um remove direto) pra
    // nunca apagar quem já foi pareado numa partida no meio do caminho.
    static async kickFromQueue(targetId) {

        if (!targetId || targetId === this.playerId) return;

        const snapshot = await get(ref(db, `${this.lobbyPath()}/${targetId}`));
        const current = snapshot.val();

        if (!current || current.matchedWith) return;

        await set(ref(db, `${this.lobbyPath()}/${targetId}/kicked`), true);

    }

    static async leaveQueue() {

        this.stopListening();

        if (this.playerId) {
            await remove(ref(db, `${this.lobbyPath()}/${this.playerId}`));
        }

        this.playerId = null;

    }

    static stopListening() {

        this.clearStaleClaimTimer();

        if (this.lobbyListener) {
            off(ref(db, this.lobbyPath()));
            this.lobbyListener = null;
        }

        if (this.selfMatchListener && this.playerId) {
            off(ref(db, `${this.lobbyPath()}/${this.playerId}`));
            this.selfMatchListener = null;
        }

    }

    static async cleanupMatch(matchId) {
        if (this.playerId) {
            this.disarmLeaveOnDisconnect(matchId, this.playerId);
        }
        await remove(ref(db, `${this.matchesPath()}/${matchId}`));
        if (this.playerId) {
            await remove(ref(db, `${this.lobbyPath()}/${this.playerId}`));
        }
    }

    // Solta só o que é MEU (gatilho de desconexão e nó da fila), sem
    // apagar a partida — pra quando eu saio dela mas os outros continuam.
    static async releaseSelf(matchId) {

        if (!this.playerId) return;

        this.disarmLeaveOnDisconnect(matchId, this.playerId);
        await remove(ref(db, `${this.lobbyPath()}/${this.playerId}`));

    }

    // Arma uma marcação automática de "saí" pro caso da minha conexão
    // cair no meio dos andares (aba fechada, sem internet, crash) sem eu
    // ter clicado em "Sair do Cooperativo" — sem isso, os outros 3
    // ficariam esperando pra sempre um "pronto" que nunca chega.
    static armLeaveOnDisconnect(matchId, playerId) {
        onDisconnect(ref(db, `${this.matchesPath()}/${matchId}/left/${playerId}`)).set(true);
    }

    // Desarma o gatilho acima quando eu saio do jeito normal (terminei a
    // raid, ou cliquei em "Sair do Cooperativo") — nesses casos já não
    // preciso mais que uma queda de conexão futura escreva nada aqui.
    static disarmLeaveOnDisconnect(matchId, playerId) {
        onDisconnect(ref(db, `${this.matchesPath()}/${matchId}/left/${playerId}`)).cancel();
    }

    // Confirma "Continuar" no andar atual, junto com meu HP no momento
    // (depois de eu decidir curar ou não no inventário) — é esse valor
    // que os outros clientes vão usar como meu HP inicial no próximo
    // andar, já que cada um só sabe da própria cura.
    //
    // combatant: meu snapshot ATUAL (RaidCombatService.snapshotCombatant)
    // — substitui o que foi tirado ao entrar na fila. Sem isso, trocar de
    // pet (ou equipamento) entre andares deixava cada cliente simulando
    // com dados diferentes: Vida Máxima e nome do pet antigos, habilidade
    // do pet novo só no MEU navegador. Vai na mesma escrita do
    // floorReady, então o andar nunca avança comigo "pronto" mas com o
    // snapshot velho. O snapshot novo precisa trazer o `seat` de antes
    // (quem chama repassa), senão a ordem do host se perde.
    static async markFloorReady(matchId, playerId, currentHP, combatant = null) {

        const updates = {
            [`floorReady/${playerId}`]: true,
            [`hp/${playerId}`]: currentHP
        };

        if (combatant) {
            updates[`squad/${playerId}`] = { ...combatant, id: playerId };
        }

        await update(ref(db, `${this.matchesPath()}/${matchId}`), updates);

    }

    // Quem ainda está no squad (não saiu), na ordem de entrada (`seat`).
    static getActiveMembers(matchData) {

        const left = matchData?.left ?? {};

        return Object.values(matchData?.squad ?? {})
            .filter(member => !left[member.id])
            .sort((a, b) => (a.seat ?? 0) - (b.seat ?? 0) || (a.id < b.id ? -1 : 1));

    }

    // Host entre os andares: quem está há mais tempo no squad. Se ele
    // sair, o próximo da ordem assume sozinho.
    static getHostId(matchData) {
        return this.getActiveMembers(matchData)[0]?.id ?? null;
    }

    // Marca que eu saí do cooperativo no meio dos andares — os outros
    // continuam sem mim (não conto mais pro "todo mundo pronto"). Se eu
    // for o último do squad a sair, apaga a partida inteira.
    static async leaveMatchFloor(matchId, playerId) {

        const matchRef = ref(db, `${this.matchesPath()}/${matchId}`);

        await set(ref(db, `${this.matchesPath()}/${matchId}/left/${playerId}`), true);

        if (this.playerId === playerId) {
            this.disarmLeaveOnDisconnect(matchId, playerId);
            await remove(ref(db, `${this.lobbyPath()}/${playerId}`));
        }

        const data = (await get(matchRef)).val();

        if (data && this.getActiveMembers(data).length === 0) {
            await remove(matchRef);
        }

    }

    // Host tirando alguém da sala entre os andares: conta como saída
    // (abre a vaga) e deixa marcado que foi expulsão, pra tela de quem
    // saiu avisar o motivo certo.
    static async kickFromMatch(matchId, targetId) {

        if (!targetId || targetId === this.playerId) return;

        await update(ref(db, `${this.matchesPath()}/${matchId}`), {
            [`left/${targetId}`]: true,
            [`kicked/${targetId}`]: true
        });

    }

    // Host liberando o squad pra seguir com menos de 4 (ninguém aceitou
    // o convite, ou ele não quis convidar). Vale só pro andar em espera.
    static async allowShortSquad(matchId, expectedFloor) {
        await set(ref(db, `${this.matchesPath()}/${matchId}/proceedShort`), expectedFloor);
    }

    // Convidado entrando numa partida já em andamento, na vaga de quem
    // saiu entre os andares. Já entra confirmado ("pronto") com o HP
    // atual dele. Falha se a partida acabou, já avançou de andar ou a
    // vaga foi preenchida.
    static async joinMatchAsReplacement(matchId, waitFloor, combatant, currentHP) {

        if (this.playerId) {
            await this.leaveQueue();
        }

        const playerId = AuthService.getCurrentUser()?.uid;
        if (!playerId) return { ok: false, reason: "missing" };

        const matchRef = ref(db, `${this.matchesPath()}/${matchId}`);
        const playerPath = ref(db, `${this.matchesPath()}/${matchId}/players/${playerId}`);

        // As regras só deixam escrever na partida quem já é participante,
        // então entro em players antes da transação.
        try {
            await set(playerPath, true);
        } catch {
            return { ok: false, reason: "missing" };
        }

        let failure = null;

        const result = await runTransaction(matchRef, (current) => {

            // Cache local vazio na primeira rodada: devolver o próprio
            // null força o servidor a responder com o valor real.
            if (current === null) {
                failure = "missing";
                return current;
            }

            if (current.floor !== waitFloor) {
                failure = "advanced";
                return;
            }

            if (this.getActiveMembers(current).length >= SQUAD_SIZE) {
                failure = "full";
                return;
            }

            failure = null;

            current.squad = current.squad ?? {};
            current.squad[playerId] = { ...combatant, id: playerId, seat: Date.now() };
            current.hp = { ...(current.hp ?? {}), [playerId]: currentHP };
            current.floorReady = { ...(current.floorReady ?? {}), [playerId]: true };

            return current;

        });

        if (failure || !result.committed) {
            await remove(playerPath);
            return { ok: false, reason: failure ?? "missing" };
        }

        this.playerId = playerId;

        return { ok: true, data: sanitizeRemote(result.snapshot.val()) };

    }

    // Espera todo mundo que AINDA está no squad confirmar "Continuar" no
    // andar `expectedFloor`. Quem sai (botão ou queda de conexão) não
    // encerra mais a run: abre uma vaga, que o host pode preencher com
    // um convite (joinMatchAsReplacement) ou dispensar (allowShortSquad)
    // — com vaga aberta, o andar só avança depois de uma das duas coisas.
    //
    // Só o primeiro cliente que perceber a condição cumprida tenta
    // comitar a transaction (mesma ideia do tryMatchSquad acima); se a
    // transaction dele perder a corrida pra outro cliente, busca o valor
    // já atualizado direto do servidor em vez de confiar que o onValue
    // vai disparar de novo sozinho.
    //
    // onProgress(matchData) é chamado a cada atualização, pra alimentar a
    // lista de confirmações/vagas na tela. Resolve com { aborted: true }
    // se a partida sumiu ou eu fui marcado como fora (kicked: true quando
    // foi o host que me tirou — ver kickFromMatch), { left: true } se
    // eu mesmo saí (ver cancelFloorWait), ou { data } com a partida já no
    // andar seguinte.
    static waitForFloorAdvance(matchId, expectedFloor, onProgress) {

        return new Promise(resolve => {

            const matchRef = ref(db, `${this.matchesPath()}/${matchId}`);
            let settled = false;
            let checking = false;

            const finish = (value) => {
                if (settled) return;
                settled = true;
                this.cancelFloorWait = null;
                off(matchRef);
                resolve(value);
            };

            this.cancelFloorWait = () => finish({ left: true });

            const canAdvance = (data) => {

                const active = this.getActiveMembers(data);
                const ready = data.floorReady ?? {};

                return active.length > 0
                    && active.every(member => ready[member.id])
                    && (active.length >= SQUAD_SIZE || data.proceedShort === expectedFloor);

            };

            onValue(matchRef, async (snapshot) => {

                if (settled || checking) return;

                const data = sanitizeRemote(snapshot.val());

                if (!data || data.left?.[this.playerId]) {
                    finish({ aborted: true, kicked: !!data?.kicked?.[this.playerId] });
                    return;
                }

                if (data.floor > expectedFloor) {
                    finish({ data });
                    return;
                }

                onProgress?.(data);

                if (!canAdvance(data)) {
                    return;
                }

                checking = true;

                const result = await runTransaction(matchRef, (current) => {

                    if (!current || current.floor !== expectedFloor || !canAdvance(current)) {
                        return;
                    }

                    current.floor = expectedFloor + 1;
                    current.floorReady = {};
                    current.proceedShort = null;

                    return current;

                });

                checking = false;

                // Se minha transaction não comitou, outro cliente já
                // avançou o andar antes de mim — busco o valor real
                // direto do servidor em vez de esperar passivamente o
                // onValue disparar de novo por conta própria.
                const finalValue = sanitizeRemote(result.committed
                    ? result.snapshot.val()
                    : (await get(matchRef)).val());

                if (finalValue && finalValue.floor > expectedFloor) {
                    finish({ data: finalValue });
                }

            });

        });

    }

}
