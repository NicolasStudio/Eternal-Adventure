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
        const bossId = monstersRaid[seed % monstersRaid.length].id;

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
        await remove(ref(db, `${this.matchesPath()}/${matchId}`));
        if (this.playerId) {
            await remove(ref(db, `${this.lobbyPath()}/${this.playerId}`));
        }
    }

}
