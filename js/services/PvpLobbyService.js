import {
    db, ref, set, remove, onValue, off, onDisconnect,
    get, runTransaction, serverTimestamp
} from "./FirebaseService.js";

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

    static generateId() {
        return "p_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    static lobbyPath() {
        return `pvpLobby/${this.mode}`;
    }

    static matchesPath() {
        return `pvpMatches/${this.mode}`;
    }

    // Entra na fila de espera de um MODO específico ("1v1" ou "2v2").
    // onMatchFound(matchData) é chamado quando uma partida envolvendo
    // este jogador é criada — seja porque ELE formou ela, seja porque
    // outra pessoa formou e o incluiu.
    static async joinQueue(mode, combatant, onMatchFound, onOpponentJoined) {

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

                const matchSnapshot = await get(ref(db, `${this.matchesPath()}/${data.matchId}`));
                const match = matchSnapshot.val();

                if (match) {
                    this.stopListening();
                    onMatchFound(match, data.matchId);
                }

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

        // Passo 2: cria a partida de verdade.
        await set(ref(db, `${this.matchesPath()}/${matchId}`), {
            combatantA: { ...selfCombatant, id: this.playerId },
            combatantB: { ...opponentCombatant, id: opponentId },
            seed,
            createdAt: serverTimestamp()
        });

        // Passo 3: SÓ AGORA marca os dois lados como pareados.
        await set(ref(db, `${this.lobbyPath()}/${opponentId}/matchedWith`), this.playerId);
        await set(ref(db, `${this.lobbyPath()}/${opponentId}/matchId`), matchId);
        await set(ref(db, `${this.lobbyPath()}/${this.playerId}/matchedWith`), opponentId);
        await set(ref(db, `${this.lobbyPath()}/${this.playerId}/matchId`), matchId);

    }

    // Versão 2x2: reivindica os 3 candidatos um de cada vez. Se
    // qualquer reivindicação falhar no meio do caminho, libera as que
    // já tinham dado certo (não deixa ninguém "preso" reivindicado
    // por uma partida que nunca vai se formar) e desiste — quem
    // ainda estiver esperando tenta de novo no próximo tick.
    static async tryMatchTeam(candidateIds, candidateData, selfCombatant) {

        const claimedIds = [];

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

                return;

            }

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

        await set(ref(db, `${this.matchesPath()}/${matchId}`), {
            teamA,
            teamB,
            seed,
            createdAt: serverTimestamp()
        });

        const allIds = [this.playerId, ...claimedIds];

        for (const id of allIds) {
            await set(ref(db, `${this.lobbyPath()}/${id}/matchedWith`), true);
            await set(ref(db, `${this.lobbyPath()}/${id}/matchId`), matchId);
        }

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
