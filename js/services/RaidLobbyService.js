import {
    db, ref, set, update, remove, onValue, off, onDisconnect,
    get, runTransaction, serverTimestamp
} from "./FirebaseService.js";
import monstersRaid from "../data/monstersRaid.js";

// Tempo que um candidato reivindicado (claimedBy preenchido) espera
// virar uma partida de verdade antes de se liberar sozinho — mesmo
// mecanismo do PvpLobbyService.js (cobre quem estava montando o grupo
// caindo da conexão bem entre "reivindicar" e "terminar de montar").
const STALE_CLAIM_TIMEOUT_MS = 8000;

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

    static generateId() {
        return "p_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

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
    static async joinQueue(combatant, onMatchFound, onOpponentJoined) {

        if (this.playerId) {
            await this.leaveQueue();
        }

        this.playerId = this.generateId();

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

            if (data?.matchedWith) {

                this.clearStaleClaimTimer();

                const matchSnapshot = await get(ref(db, `${this.matchesPath()}/${data.matchId}`));
                const match = matchSnapshot.val();

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
            const others = Object.entries(all)
                .filter(([id, entry]) => id !== this.playerId && !entry.matchedWith && !entry.claimedBy)
                .sort(([idA], [idB]) => idA < idB ? -1 : 1);

            const requiredOthers = 3;

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

            await this.tryMatchSquad(candidateIds, candidateData, combatant);

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

            const candidateRef = ref(db, `${this.lobbyPath()}/${candidateId}`);

            const claimResult = await runTransaction(candidateRef, (current) => {

                if (!current || current.matchedWith || current.claimedBy) {
                    return;
                }

                current.claimedBy = this.playerId;

                return current;

            });

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

        const allCombatants = [
            { ...selfCombatant, id: this.playerId },
            ...claimedIds.map(id => ({ ...candidateData[id], id }))
        ];

        // squad é um objeto indexado por ID (não array) — mesmo motivo
        // do teamA/teamB em PvpLobbyService.js: o Firebase não guarda
        // arrays de verdade, converte pra objeto com chaves numéricas.
        const squad = {};
        allCombatants.forEach(c => { squad[c.id] = c; });

        const allIds = [this.playerId, ...claimedIds];

        const updates = {
            [`${this.matchesPath()}/${matchId}`]: {
                squad,
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
    static async markFloorReady(matchId, playerId, currentHP) {

        await update(ref(db, `${this.matchesPath()}/${matchId}`), {
            [`floorReady/${playerId}`]: true,
            [`hp/${playerId}`]: currentHP
        });

    }

    // Marca que eu saí do cooperativo no meio dos andares — os outros
    // continuam sem mim (não conto mais pro "todo mundo pronto"). Se eu
    // for o último do squad a sair, apaga a partida inteira.
    static async leaveMatchFloor(matchId, playerId, squadIds) {

        await set(ref(db, `${this.matchesPath()}/${matchId}/left/${playerId}`), true);

        if (this.playerId === playerId) {
            this.disarmLeaveOnDisconnect(matchId, playerId);
            await remove(ref(db, `${this.lobbyPath()}/${playerId}`));
        }

        const snapshot = await get(ref(db, `${this.matchesPath()}/${matchId}/left`));
        const left = snapshot.val() ?? {};
        const allLeft = squadIds.every(id => left[id]);

        if (allLeft) {
            await remove(ref(db, `${this.matchesPath()}/${matchId}`));
        }

    }

    // Espera até que TODOS os 4 do squad original confirmem "Continuar"
    // no andar `expectedFloor` pra então avançar de fase — não basta
    // maioria: se qualquer um dos 4 sair (botão ou queda de conexão)
    // antes de todos confirmarem, resolve como abandono e quem ainda
    // está esperando não segue em frente.
    //
    // Só o primeiro cliente que perceber a condição cumprida tenta
    // comitar a transaction (mesma ideia do tryMatchSquad acima); se a
    // transaction dele perder a corrida pra outro cliente, busca o valor
    // já atualizado direto do servidor em vez de confiar que o onValue
    // vai disparar de novo sozinho.
    //
    // onProgress(readyCount, total) é chamado a cada atualização, pra
    // alimentar o "aguardando X/4 jogadores" na tela. Resolve com
    // { aborted: true } se alguém abandonou, ou { data } com a partida
    // já no andar seguinte.
    static waitForFloorAdvance(matchId, squadIds, expectedFloor, onProgress) {

        return new Promise(resolve => {

            const matchRef = ref(db, `${this.matchesPath()}/${matchId}`);
            let settled = false;
            let checking = false;

            const finish = (value) => {
                if (settled) return;
                settled = true;
                off(matchRef);
                resolve(value);
            };

            onValue(matchRef, async (snapshot) => {

                if (settled || checking) return;

                const data = snapshot.val();

                if (!data) {
                    finish({ aborted: true });
                    return;
                }

                if (data.floor > expectedFloor) {
                    finish({ data });
                    return;
                }

                const left = data.left ?? {};

                if (squadIds.some(id => left[id])) {
                    finish({ aborted: true });
                    return;
                }

                const ready = data.floorReady ?? {};
                const readyCount = squadIds.filter(id => ready[id]).length;

                onProgress?.(readyCount, squadIds.length);

                if (readyCount < squadIds.length) {
                    return;
                }

                checking = true;

                const result = await runTransaction(matchRef, (current) => {

                    if (!current || current.floor !== expectedFloor) {
                        return;
                    }

                    current.floor = expectedFloor + 1;
                    current.floorReady = {};

                    return current;

                });

                checking = false;

                // Se minha transaction não comitou, outro cliente já
                // avançou o andar antes de mim — busco o valor real
                // direto do servidor em vez de esperar passivamente o
                // onValue disparar de novo por conta própria.
                const finalValue = result.committed
                    ? result.snapshot.val()
                    : (await get(matchRef)).val();

                if (finalValue && finalValue.floor > expectedFloor) {
                    finish({ data: finalValue });
                }

            });

        });

    }

}
