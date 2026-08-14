import {
    db, ref, set, remove, onValue, off, onDisconnect,
    get, runTransaction, serverTimestamp
} from "./FirebaseService.js";

/*
    Como o pareamento evita dois jogadores "roubarem" o mesmo
    adversário ao mesmo tempo:

    Quando o cliente A vê o cliente B esperando na fila, ele tenta uma
    TRANSAÇÃO no nó do PRÓPRIO B (não no seu) — "só marca B como
    pareado comigo SE `matchedWith` de B ainda estiver vazio". Se dois
    jogadores tentarem parear com B ao mesmo tempo, o Firebase garante
    que só uma dessas transações tem sucesso — a outra falha, vê que
    B já foi pareado por outra pessoa, e tenta de novo com outro
    candidato (ou espera).

    Cada MODO (1v1, e futuramente 2v2) tem sua própria fila, separada
    por caminho (pvpLobby/1v1, pvpLobby/2v2) — assim um jogador
    procurando 1x1 nunca esbarra com alguém procurando 2x2, e no dia
    de implementar o 2x2 de verdade não precisa mexer em nada do 1x1.
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

    // Entra na fila de espera de um MODO específico ("1v1" por
    // enquanto — "2v2" já é aceito aqui na estrutura, só que a lógica
    // de formar times ainda não existe). onMatchFound(matchData) é
    // chamado quando ALGUÉM (o próprio jogador tentando parear com
    // outro, ou outro jogador tentando parear com ele) fecha uma
    // partida envolvendo este jogador.
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

        // Se a aba fechar, a internet cair, etc — remove da fila
        // automaticamente, sem deixar "fantasma" esperando pra sempre.
        onDisconnect(selfRef).remove();

        // Escuta a PRÓPRIA entrada: se alguém me marcar como pareado
        // (matchedWith preenchido), significa que uma partida foi
        // criada — busca ela e avisa quem chamou joinQueue().
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

        // Escuta a fila inteira: assim que aparecer outro jogador
        // esperando, tenta parear com ele.
        const lobbyRef = ref(db, this.lobbyPath());

        this.lobbyListener = onValue(lobbyRef, async (snapshot) => {

            const all = snapshot.val() ?? {};
            const others = Object.entries(all)
                .filter(([id, entry]) => id !== this.playerId && !entry.matchedWith && !entry.claimedBy)
                .sort(([idA], [idB]) => idA < idB ? -1 : 1);

            if (others.length === 0) {
                onOpponentJoined?.(false);
                return;
            }

            onOpponentJoined?.(true);

            const [opponentId, opponentData] = others[0];

            // Evita que os DOIS lados tentem parear ao mesmo tempo (o
            // que criava duas partidas diferentes se sobrescrevendo):
            // só quem tem o ID "menor" na comparação com o candidato
            // inicia o pareamento — o outro lado só espera ser
            // encontrado, sem tentar nada por conta própria.
            if (this.playerId > opponentId) {
                return;
            }

            // Já fui pareado por alguém enquanto isso? Não tenta de novo.
            const selfSnapshot = await get(selfRef);
            if (selfSnapshot.val()?.matchedWith) return;

            await this.tryMatch(opponentId, opponentData, combatant);

        });

    }

    static async tryMatch(opponentId, opponentCombatant, selfCombatant) {

        const opponentRef = ref(db, `${this.lobbyPath()}/${opponentId}`);

        const matchId = "m_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        const seed = Math.floor(Math.random() * 2 ** 31);

        // Passo 1: reivindica o oponente com uma transação (só um dos
        // dois lados consegue, se os dois tentarem ao mesmo tempo) —
        // usa um campo separado ("claimedBy"), de propósito, pra NÃO
        // avisar o oponente ainda. Se avisássemos já aqui (setando
        // matchedWith), o listener dele podia disparar e tentar ler
        // a partida ANTES dela existir de verdade — essa era a causa
        // do bug de "só um dos dois encontra".
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

        // Passo 2: cria a partida de verdade — nesse ponto já temos
        // certeza de que ninguém mais pode ter reivindicado o oponente.
        await set(ref(db, `${this.matchesPath()}/${matchId}`), {
            combatantA: { ...selfCombatant, id: this.playerId },
            combatantB: { ...opponentCombatant, id: opponentId },
            seed,
            createdAt: serverTimestamp()
        });

        // Passo 3: SÓ AGORA marca os dois lados como pareados — a
        // partida já existe garantido quando os listeners dispararem.
        await set(ref(db, `${this.lobbyPath()}/${opponentId}/matchedWith`), this.playerId);
        await set(ref(db, `${this.lobbyPath()}/${opponentId}/matchId`), matchId);
        await set(ref(db, `${this.lobbyPath()}/${this.playerId}/matchedWith`), opponentId);
        await set(ref(db, `${this.lobbyPath()}/${this.playerId}/matchId`), matchId);

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
