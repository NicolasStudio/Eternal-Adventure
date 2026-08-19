import {
    db, ref, set, update, remove, onValue, off, onDisconnect,
    get, runTransaction, serverTimestamp
} from "./FirebaseService.js";

// Tempo que um candidato reivindicado (claimedBy preenchido) espera
// virar uma partida de verdade antes de se liberar sozinho. Cobre o
// caso de quem estava montando o grupo cair da conexão bem entre
// "reivindicar" e "terminar de montar" — sem isso, quem foi
// reivindicado ficava invisível pra qualquer pareamento futuro pro
// resto da sessão (ninguém mais tenta de novo por ele).
const STALE_CLAIM_TIMEOUT_MS = 8000;

/*
    Como o pareamento evita jogadores "roubarem" o mesmo adversário ao
    mesmo tempo:

    1x1 — quando o cliente A vê o cliente B esperando na fila, ele
    tenta uma TRANSAÇÃO no nó do PRÓPRIO B (não no seu) — "só marca B
    como pareado comigo SE `matchedWith` de B ainda estiver vazio". Se
    dois jogadores tentarem parear com B ao mesmo tempo, o Firebase
    garante que só uma dessas transações tem sucesso.

    2x2 — a mesma ideia, só que reivindicando 3 outros jogadores em
    vez de 1. Pra evitar que várias pessoas tentem montar um grupo de
    4 ao mesmo tempo (o que multiplicaria o risco de corrida), só o
    jogador com o ID "menor" entre TODOS os que estão esperando tenta
    formar o grupo — todo mundo mais espera ser encontrado. Se, no
    meio do caminho, uma das 3 reivindicações falhar (alguém saiu da
    fila ou foi pego por outra tentativa), as que já tinham sido
    feitas são liberadas e a formação é abandonada — tenta de novo no
    próximo jogador que entrar ou sair da fila.

    Cada MODO tem sua própria fila, separada por caminho
    (pvpLobby/1v1, pvpLobby/2v2) — um jogador procurando 1x1 nunca
    esbarra com alguém procurando 2x2.
*/
export default class PvpLobbyService {

    static playerId = null;
    static mode = null;
    static lobbyListener = null;
    static selfMatchListener = null;
    static staleClaimTimer = null;

    static generateId() {
        return "p_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    static lobbyPath() {
        return `pvpLobby/${this.mode}`;
    }

    static matchesPath() {
        return `pvpMatches/${this.mode}`;
    }

    static scheduleStaleClaimRelease(selfPath) {

        if (this.staleClaimTimer) return; // já tem um agendado, não empilha

        this.staleClaimTimer = setTimeout(async () => {

            this.staleClaimTimer = null;

            const snapshot = await get(ref(db, selfPath));
            const data = snapshot.val();

            // Só libera se continuar "preso" do mesmo jeito — reivindicado,
            // mas nunca virou partida de verdade. Se já foi pareado (ou
            // já saiu da fila) nesse meio-tempo, não mexe em nada.
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

    // Entra na fila de espera de um MODO específico ("1v1" ou "2v2").
    // onMatchFound(matchData) é chamado quando uma partida envolvendo
    // este jogador é criada — seja porque ELE formou ela, seja porque
    // outra pessoa formou e o incluiu.
    static async joinQueue(mode, combatant, onMatchFound, onOpponentJoined) {

        // Reentrada: se já existia uma busca ativa (ex.: o jogador saiu
        // da tela de PVP e voltou sem cancelar, ou clicou em "Entrar na
        // Fila" de novo antes da primeira chamada terminar) e ela não
        // foi desfeita direito, isso deixava DUAS entradas na fila pro
        // MESMO jogador físico — e se as duas caíssem no mesmo
        // pareamento, o jogador via a si mesmo do lado inimigo (mesmo
        // nome/status atacando ele próprio). Desfaz a anterior primeiro,
        // sempre.
        if (this.playerId) {
            await this.leaveQueue();
        }

        this.mode = mode;
        this.playerId = this.generateId();

        const selfRef = ref(db, `${this.lobbyPath()}/${this.playerId}`);

        await set(selfRef, {
            ...combatant,
            joinedAt: serverTimestamp()
            // Sem "matchedWith: null" de propósito — o Firebase APAGA
            // qualquer campo escrito como null, não guarda um "null"
            // de verdade. Enquanto esse jogador não for pareado, o
            // campo simplesmente não existe (é isso que os outros
            // trechos abaixo checam: ausência, não "=== null").
        });

        onDisconnect(selfRef).remove();

        // Escuta a PRÓPRIA entrada: se alguém me marcar como pareado
        // (matchedWith preenchido), busca a partida e avisa quem
        // chamou joinQueue().
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

                // Fui reivindicado por alguém que está montando um
                // grupo (1x1 ou 2x2) — dá um tempo pra partida virar de
                // verdade (matchedWith aparecer). Se não aparecer nesse
                // prazo, quem reivindicou provavelmente caiu da conexão
                // no meio do processo — libera a reivindicação sozinho
                // pra não ficar invisível pro resto da sessão.
                this.scheduleStaleClaimRelease(`${this.lobbyPath()}/${this.playerId}`);

            } else {

                this.clearStaleClaimTimer();

            }

        });

        // Escuta a fila inteira: assim que aparecerem candidatos o
        // bastante (1 pro 1v1, 3 pro 2v2), tenta formar a partida.
        const lobbyRef = ref(db, this.lobbyPath());

        this.lobbyListener = onValue(lobbyRef, async (snapshot) => {

            const all = snapshot.val() ?? {};
            const others = Object.entries(all)
                .filter(([id, entry]) => id !== this.playerId && !entry.matchedWith && !entry.claimedBy)
                .sort(([idA], [idB]) => idA < idB ? -1 : 1);

            const requiredOthers = this.mode === "2v2" ? 3 : 1;

            if (others.length < requiredOthers) {
                onOpponentJoined?.(others.length > 0);
                return;
            }

            onOpponentJoined?.(true);

            const selfSnapshot = await get(selfRef);
            if (selfSnapshot.val()?.matchedWith) return;

            if (this.mode === "2v2") {

                // Só quem tem o ID "menor" entre TODOS os candidatos
                // (incluindo eu mesmo) tenta montar o grupo de 4 —
                // evita que duas pessoas tentem formar times ao
                // mesmo tempo com gente sobreposta.
                const allWaitingIds = [this.playerId, ...others.map(([id]) => id)].sort();

                if (allWaitingIds[0] !== this.playerId) return;

                const candidateEntries = others.slice(0, 3);
                const candidateIds = candidateEntries.map(([id]) => id);
                const candidateData = Object.fromEntries(candidateEntries);

                await this.tryMatchTeam(candidateIds, candidateData, combatant);

            } else {

                const [opponentId, opponentData] = others[0];

                // Só quem tem o ID "menor" na comparação com o
                // candidato inicia o pareamento.
                if (this.playerId > opponentId) return;

                await this.tryMatch(opponentId, opponentData, combatant);

            }

        });

    }

    static async tryMatch(opponentId, opponentCombatant, selfCombatant) {

        const opponentRef = ref(db, `${this.lobbyPath()}/${opponentId}`);

        const matchId = "m_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        const seed = Math.floor(Math.random() * 2 ** 31);

        // Passo 1: reivindica o oponente com uma transação — usa um
        // campo separado ("claimedBy"), de propósito, pra NÃO avisar
        // o oponente ainda (a partida nem existe de verdade ainda).
        const claimResult = await runTransaction(opponentRef, (current) => {

            if (!current || current.matchedWith || current.claimedBy) {
                return; // aborta — alguém já pegou, ou ele saiu da fila
            }

            current.claimedBy = this.playerId;

            return current;

        });

        if (!claimResult.committed) {
            return; // perdeu a corrida, tenta de novo no próximo tick
        }

        // Rede de segurança: se EU cair da conexão entre reivindicar o
        // oponente e terminar de montar a partida (passo abaixo), o
        // Firebase libera a reivindicação sozinho, do lado do servidor.
        // Sem isso, o oponente ficava com "claimedBy" preso pra sempre —
        // invisível pra qualquer pareamento futuro (o filtro em
        // joinQueue ignora quem tem claimedBy), preso na fila "pra
        // sempre procurando" sem ninguém tentar parear com ele de novo.
        const opponentClaimRef = ref(db, `${this.lobbyPath()}/${opponentId}/claimedBy`);
        onDisconnect(opponentClaimRef).remove();

        // Passo 2+3 num commit atômico só (update multi-caminho) — ou
        // a partida inteira é criada E os dois lados marcados como
        // pareados de uma vez, ou (se a conexão cair no meio) nada
        // disso é gravado. Antes eram 5 escritas sequenciais separadas;
        // uma queda de conexão entre elas deixava a partida criada mas
        // só UM dos dois lados marcado como pareado — o outro nunca
        // recebia o aviso e ficava esperando pra sempre.
        await update(ref(db), {
            [`${this.matchesPath()}/${matchId}`]: {
                combatantA: { ...selfCombatant, id: this.playerId },
                combatantB: { ...opponentCombatant, id: opponentId },
                seed,
                createdAt: serverTimestamp()
            },
            [`${this.lobbyPath()}/${opponentId}/matchedWith`]: this.playerId,
            [`${this.lobbyPath()}/${opponentId}/matchId`]: matchId,
            [`${this.lobbyPath()}/${this.playerId}/matchedWith`]: opponentId,
            [`${this.lobbyPath()}/${this.playerId}/matchId`]: matchId
        });

        onDisconnect(opponentClaimRef).cancel();

    }

    // Versão 2x2: reivindica os 3 candidatos um de cada vez. Se
    // qualquer reivindicação falhar no meio do caminho, libera as que
    // já tinham dado certo (não deixa ninguém "preso" reivindicado
    // por uma partida que nunca vai se formar) e desiste — quem
    // ainda estiver esperando tenta de novo no próximo tick.
    static async tryMatchTeam(candidateIds, candidateData, selfCombatant) {

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

            // Rede de segurança: se EU cair da conexão entre reivindicar
            // esse candidato e terminar de montar o grupo inteiro, o
            // Firebase libera a reivindicação sozinho. Sem isso, um
            // candidato já reivindicado quando a conexão de quem estava
            // montando o grupo cai fica invisível pra qualquer
            // pareamento futuro pelo resto da sessão — "preso pra
            // sempre procurando".
            const claimDisconnectRef = ref(db, `${this.lobbyPath()}/${candidateId}/claimedBy`);
            onDisconnect(claimDisconnectRef).remove();
            claimDisconnectRefs.push(claimDisconnectRef);

            claimedIds.push(candidateId);

        }

        // Reivindicou os 3 — monta os times (eu + o 1º candidato vs
        // os outros 2) e cria a partida de verdade.
        const matchId = "m_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        const seed = Math.floor(Math.random() * 2 ** 31);

        // teamA/teamB são objetos indexados por ID (não arrays!) —
        // o Firebase não guarda arrays de verdade, ele converte pra
        // um objeto com chaves numéricas na volta, o que quebraria
        // qualquer código que espere .length ou spread nesses dados.
        const allCombatants = [
            { ...selfCombatant, id: this.playerId },
            ...claimedIds.map(id => ({ ...candidateData[id], id }))
        ];

        const teamA = {
            [allCombatants[0].id]: allCombatants[0],
            [allCombatants[1].id]: allCombatants[1]
        };
        const teamB = {
            [allCombatants[2].id]: allCombatants[2],
            [allCombatants[3].id]: allCombatants[3]
        };

        const allIds = [this.playerId, ...claimedIds];

        // Cria a partida E marca os 4 jogadores como pareados num
        // commit atômico só (update multi-caminho: 1 + 4×2 = 9
        // caminhos). Antes disso era uma sequência de 9 escritas
        // separadas — se a conexão caísse no meio (ex: depois de
        // marcar 2 dos 4 como pareados), os outros 2 ficavam com a
        // partida já criada mas nunca marcados, esperando pra sempre
        // sem ninguém mais tentar parear com eles.
        const updates = {
            [`${this.matchesPath()}/${matchId}`]: {
                teamA,
                teamB,
                seed,
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

    // Sai da fila manualmente (ex: jogador cancelou a busca).
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

    // Limpeza pós-partida — remove a partida já resolvida do banco,
    // pra não acumular lixo (o banco gratuito tem limite de espaço).
    static async cleanupMatch(matchId) {
        await remove(ref(db, `${this.matchesPath()}/${matchId}`));
        if (this.playerId) {
            await remove(ref(db, `${this.lobbyPath()}/${this.playerId}`));
        }
    }

}
