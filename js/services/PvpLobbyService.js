import {
    db, ref, set, update, remove, onValue, off, onDisconnect,
    get, runTransaction, serverTimestamp
} from "./FirebaseService.js";
import { TEAM_SIM_VERSION } from "./PvpCombatService.js";

// Tempo que um candidato reivindicado (claimedBy preenchido) espera
// virar uma partida de verdade antes de se liberar sozinho. Cobre o
// caso de quem estava montando o grupo cair da conexão bem entre
// "reivindicar" e "terminar de montar" — sem isso, quem foi
// reivindicado ficava invisível pra qualquer pareamento futuro pro
// resto da sessão (ninguém mais tenta de novo por ele).
const STALE_CLAIM_TIMEOUT_MS = 8000;

// Matchmaking por Poder (PowerService): só pareia quem estiver a no
// máximo essa diferença de Poder — ex: com 10k, aceita de 5k a 15k.
// No 2x2 vale entre TODOS os 4 (maior - menor <= limite).
export const PVP_POWER_RANGE = 5000;

// 2x2 apenas: quanto mais tempo na fila, mais largo o limite de Poder
// — sem isso, com poucos jogadores online (precisa de 4 dentro do
// limite entre si) a fila nunca fechava. Sobe POWER_RANGE_STEP a cada
// POWER_RANGE_STEP_MS de espera, até POWER_RANGE_MAX — que é atingido
// com 2 minutos de espera (4 passos de 30s: 5000 → 20000).
const POWER_RANGE_STEP_MS = 30 * 1000;
const POWER_RANGE_STEP = 3750;
const POWER_RANGE_MAX = 20000;

// De quanto em quanto tempo o 2x2 reavalia a fila sozinho (o limite de
// Poder cresce com o tempo, então a fila pode passar a fechar mesmo
// sem ninguém novo entrar ou sair).
const RECHECK_INTERVAL_MS = 10 * 1000;

// Entrada sem `power` (cliente desatualizado) nunca é compatível —
// melhor não parear do que colocar um nível 100 contra um nível 1.
function isPowerCompatible(a, b, range = PVP_POWER_RANGE) {
    if (typeof a?.power !== "number" || typeof b?.power !== "number") return false;
    return Math.abs(a.power - b.power) <= range;
}

// Limita a busca de grupos 2x2 (combinações de 3 entre os candidatos)
// pra não explodir se a fila ficar grande.
const MAX_TEAM_CANDIDATES = 30;

/*
    Evita "roubar" o mesmo adversário: 1x1 reivindica via transação no
    nó do OUTRO jogador (só vira par se `matchedWith` dele ainda estiver
    vazio — o Firebase garante que só uma transação concorrente vence).
    2x2 reivindica 3 jogadores da mesma forma, mas só quem tem o menor
    ID entre os compatíveis tenta formar o grupo, pra não multiplicar o
    risco de corrida; se uma das 3 reivindicações falhar, desfaz as
    outras e tenta de novo depois. Só entram candidatos dentro do
    PVP_POWER_RANGE do meu Poder. Cada modo tem fila própria
    (pvpLobby/1v1, pvpLobby/2v2), sem cruzar uma com a outra.
*/
export default class PvpLobbyService {

    static playerId = null;
    static mode = null;
    static lobbyListener = null;
    static selfMatchListener = null;
    static staleClaimTimer = null;

    // Só 2x2: hora de entrada na fila (limite de Poder crescente), trava
    // de "já estou montando um grupo", ouvinte de reconexão, reavaliação
    // periódica e último retrato da fila.
    static queuedAt = 0;
    static forming = false;
    static connectedListener = null;
    static recheckTimer = null;
    static lastLobby = null;

    static generateId() {
        return "p_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    static lobbyPath() {
        return `pvpLobby/${this.mode}`;
    }

    static matchesPath() {
        return `pvpMatches/${this.mode}`;
    }

    // Limite de Poder atual (2x2 cresce com a espera; 1x1 é fixo).
    static getPowerRange() {

        if (this.mode !== "2v2") return PVP_POWER_RANGE;

        const steps = Math.floor((Date.now() - this.queuedAt) / POWER_RANGE_STEP_MS);

        return Math.min(POWER_RANGE_MAX, PVP_POWER_RANGE + Math.max(0, steps) * POWER_RANGE_STEP);

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

                if (this.mode === "2v2") {

                    // Só apaga se a reivindicação ainda for a MESMA que
                    // foi vista — senão poderia desfazer uma reivindicação
                    // nova (e válida) de outra pessoa.
                    const observed = data.claimedBy;

                    // A reivindicação é minha (montando o grupo agora):
                    // quem cuida dela é o próprio tryMatchTeam.
                    if (observed === this.playerId) return;

                    await runTransaction(
                        ref(db, `${selfPath}/claimedBy`),
                        (current) => current === observed ? null : undefined
                    );

                } else {

                    await set(ref(db, `${selfPath}/claimedBy`), null);

                }

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

        this.queuedAt = Date.now();
        this.forming = false;
        this.lastLobby = null;

        // Escuta a PRÓPRIA entrada: se alguém me marcar como pareado
        // (matchedWith preenchido), busca a partida e avisa quem
        // chamou joinQueue().
        let matchHandled = false;

        this.selfMatchListener = onValue(selfRef, async (snapshot) => {

            const data = snapshot.val();

            if (data?.matchedWith) {

                // 2x2: o ouvinte pode disparar de novo enquanto a partida
                // ainda está sendo buscada — sem isso, onMatchFound rodava
                // duas vezes.
                if (this.mode === "2v2" && matchHandled) return;

                this.clearStaleClaimTimer();

                if (this.mode === "2v2") matchHandled = true;

                const matchSnapshot = await get(ref(db, `${this.matchesPath()}/${data.matchId}`));
                const match = matchSnapshot.val();

                if (match) {

                    this.stopListening();
                    onMatchFound(match, data.matchId);

                } else if (this.mode === "2v2" && this.playerId) {

                    // Marcado como pareado mas a partida não existe mais
                    // (já foi apagada): limpa a marca e volta pra fila —
                    // senão ficava preso e ninguém mais pareava comigo.
                    matchHandled = false;

                    await update(ref(db), {
                        [`${this.lobbyPath()}/${this.playerId}/matchedWith`]: null,
                        [`${this.lobbyPath()}/${this.playerId}/matchId`]: null
                    });

                }

            } else if (data?.claimedBy) {

                // Fui reivindicado por alguém que está montando um
                // grupo — dá um tempo pra partida virar de verdade
                // (matchedWith aparecer). Se não aparecer nesse prazo,
                // quem reivindicou provavelmente caiu da conexão no meio
                // do processo — libera a reivindicação sozinho pra não
                // ficar invisível pro resto da sessão.
                // (2x2: quando a reivindicação é MINHA, montando o grupo,
                // não há o que liberar por timeout.)
                if (!(this.mode === "2v2" && data.claimedBy === this.playerId)) {
                    this.scheduleStaleClaimRelease(`${this.lobbyPath()}/${this.playerId}`);
                }

            } else {

                this.clearStaleClaimTimer();

            }

        });

        // 2x2: uma queda de conexão, mesmo curta, faz o servidor apagar a
        // minha entrada (onDisconnect) — ao reconectar a tela continuava
        // em "Procurando" sem eu existir mais na fila. Recria a entrada.
        if (this.mode === "2v2") {

            const selfId = this.playerId;

            this.connectedListener = onValue(ref(db, ".info/connected"), async (snapshot) => {

                if (!snapshot.val() || this.playerId !== selfId) return;

                const existing = await get(selfRef);

                if (existing.exists() || this.playerId !== selfId) return;

                await set(selfRef, { ...combatant, joinedAt: serverTimestamp() });
                onDisconnect(selfRef).remove();

            });

        }

        // Escuta a fila inteira: assim que aparecerem candidatos o
        // bastante (1 pro 1v1, 3 pro 2v2), tenta formar a partida.
        const lobbyRef = ref(db, this.lobbyPath());

        const evaluateLobby = async (all) => {

            const twoVsTwo = this.mode === "2v2";
            const range = twoVsTwo ? this.getPowerRange() : PVP_POWER_RANGE;

            const others = Object.entries(all)
                .filter(([id, entry]) => id !== this.playerId && !entry.matchedWith && !entry.claimedBy)
                .filter(([, entry]) => isPowerCompatible(combatant, entry, range))
                // 2x2: só junta quem roda a MESMA versão da simulação
                // (senão os 4 navegadores calculariam lutas diferentes).
                .filter(([, entry]) => !twoVsTwo || entry.simVersion === TEAM_SIM_VERSION)
                .sort(([idA], [idB]) => idA < idB ? -1 : 1);

            const requiredOthers = twoVsTwo ? 3 : 1;

            if (others.length < requiredOthers) {
                onOpponentJoined?.(others.length > 0, others.length);
                return;
            }

            onOpponentJoined?.(true, others.length);

            const selfSnapshot = await get(selfRef);
            const selfData = selfSnapshot.val();

            if (selfData?.matchedWith) return;

            if (twoVsTwo) {

                // Já reivindicado por outra pessoa (ou por mim mesmo,
                // montando um grupo): não inicia outro.
                if (selfData?.claimedBy) return;

                // Só tenta montar se EU for o menor ID do grupo
                // encontrado — evita que duas pessoas tentem formar o
                // mesmo time ao mesmo tempo (se ainda assim correrem,
                // as transações de claim resolvem).
                const candidateEntries = this.findTeamCandidates(combatant, others, range);

                if (!candidateEntries) return;

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

        };

        this.lobbyListener = onValue(lobbyRef, async (snapshot) => {

            const all = snapshot.val() ?? {};

            this.lastLobby = all;

            await evaluateLobby(all);

        });

        // 2x2: o limite de Poder cresce com o tempo de espera, então
        // reavalia a fila periodicamente mesmo sem ninguém novo entrar.
        if (this.mode === "2v2") {

            this.recheckTimer = setInterval(() => {

                if (!this.playerId || this.forming || !this.lastLobby) return;

                evaluateLobby(this.lastLobby);

            }, RECHECK_INTERVAL_MS);

        }

    }

    // Procura 3 candidatos que, junto comigo, fiquem todos dentro do
    // limite de Poder entre si, e em que eu seja o menor ID. Entre os
    // grupos válidos prefere o de menor diferença de Poder. Devolve as
    // 3 entradas [id, data] ou null.
    static findTeamCandidates(selfCombatant, others, range = PVP_POWER_RANGE) {

        const pool = others
            .filter(([id]) => id > this.playerId)
            .slice(0, MAX_TEAM_CANDIDATES);

        let best = null;
        let bestSpread = Infinity;

        for (let i = 0; i < pool.length; i++) {
            for (let j = i + 1; j < pool.length; j++) {
                for (let k = j + 1; k < pool.length; k++) {

                    const group = [pool[i], pool[j], pool[k]];
                    const powers = [selfCombatant.power, ...group.map(([, data]) => data.power)];
                    const spread = Math.max(...powers) - Math.min(...powers);

                    if (spread <= range && spread < bestSpread) {
                        best = group;
                        bestSpread = spread;
                    }

                }
            }
        }

        return best;

    }

    // Das 3 formas de dividir 4 jogadores em 2 duplas, escolhe a de
    // menor diferença de Poder somado entre os times.
    static splitBalancedTeams(combatants) {

        const [first, ...rest] = combatants;
        const total = team => team.reduce((sum, c) => sum + (c.power ?? 0), 0);

        let bestSplit = null;
        let bestDiff = Infinity;

        rest.forEach((partner, index) => {
            const teamA = [first, partner];
            const teamB = rest.filter((_, i) => i !== index);
            const diff = Math.abs(total(teamA) - total(teamB));
            if (diff < bestDiff) {
                bestDiff = diff;
                bestSplit = { teamA, teamB };
            }
        });

        return bestSplit;

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

    // Reivindica UMA entrada da fila (transação): só marca se ela ainda
    // existir e estiver livre.
    static async claimEntry(entryId, claimerId) {

        const result = await runTransaction(ref(db, `${this.lobbyPath()}/${entryId}`), (current) => {

            if (!current || current.matchedWith || current.claimedBy) {
                return; // aborta — alguém já pegou, ou ele saiu da fila
            }

            current.claimedBy = claimerId;

            return current;

        });

        return result.committed;

    }

    // Libera uma reivindicação SÓ se ainda for a minha — nunca desfaz a
    // de outra pessoa (nem recria uma entrada que já saiu da fila).
    static async releaseClaim(entryId, claimerId) {

        await runTransaction(
            ref(db, `${this.lobbyPath()}/${entryId}/claimedBy`),
            (current) => current === claimerId ? null : undefined
        );

    }

    // Versão 2x2: reivindica A MIM MESMO e os 3 candidatos, um de cada
    // vez. Reivindicar a si mesmo impede que eu entre em duas partidas
    // (ser reivindicado por outra pessoa E montar o meu próprio grupo).
    // Se qualquer passo falhar no meio, libera tudo que já tinha sido
    // reivindicado e desiste — quem ainda estiver esperando tenta de
    // novo no próximo evento da fila.
    static async tryMatchTeam(candidateIds, candidateData, selfCombatant) {

        if (this.forming) return;

        const selfId = this.playerId;
        const lobby = this.lobbyPath();
        const matchesPath = this.matchesPath();
        const claimedIds = [];
        const claimDisconnectRefs = [];
        let created = false;

        this.forming = true;

        try {

            for (const entryId of [selfId, ...candidateIds]) {

                // Cancelei a busca enquanto montava o grupo.
                if (this.playerId !== selfId) return;

                if (!(await this.claimEntry(entryId, selfId))) return;

                // Rede de segurança: se EU cair da conexão no meio, o
                // Firebase libera a reivindicação sozinho, do lado do
                // servidor (senão o candidato ficava invisível pro resto
                // da sessão).
                const claimRef = ref(db, `${lobby}/${entryId}/claimedBy`);
                onDisconnect(claimRef).remove();
                claimDisconnectRefs.push(claimRef);

                claimedIds.push(entryId);

            }

            // Confere, ANTES de gravar, que os 4 continuam na fila e
            // reivindicados por mim — a gravação final não é condicional e
            // recriaria como "fantasma" a entrada de quem saiu nesse meio
            // tempo, montando uma partida com alguém que não existe mais.
            const snapshots = await Promise.all(claimedIds.map(id => get(ref(db, `${lobby}/${id}`))));

            const stillValid = this.playerId === selfId && snapshots.every(snapshot => {
                const entry = snapshot.val();
                return entry && entry.claimedBy === selfId && !entry.matchedWith;
            });

            if (!stillValid) return;

            // Monta os times equilibrando o Poder somado de cada dupla e
            // cria a partida de verdade.
            const matchId = "m_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
            const seed = Math.floor(Math.random() * 2 ** 31);

            // teamA/teamB são objetos indexados por ID (não arrays!) —
            // o Firebase não guarda arrays de verdade, ele converte pra
            // um objeto com chaves numéricas na volta, o que quebraria
            // qualquer código que espere .length ou spread nesses dados.
            const allCombatants = [
                { ...selfCombatant, id: selfId },
                ...candidateIds.map(id => ({ ...candidateData[id], id }))
            ];

            const split = this.splitBalancedTeams(allCombatants);
            const toTeamObject = team => Object.fromEntries(team.map(c => [c.id, c]));

            // Cria a partida E marca os 4 jogadores como pareados num
            // commit atômico só (update multi-caminho: 1 + 4×2 = 9
            // caminhos) — ou tudo é gravado, ou nada.
            const updates = {
                [`${matchesPath}/${matchId}`]: {
                    teamA: toTeamObject(split.teamA),
                    teamB: toTeamObject(split.teamB),
                    seed,
                    createdAt: serverTimestamp()
                }
            };

            for (const id of claimedIds) {
                updates[`${lobby}/${id}/matchedWith`] = true;
                updates[`${lobby}/${id}/matchId`] = matchId;
            }

            await update(ref(db), updates);

            created = true;

        } catch (error) {

            console.warn("Falha ao montar a partida 2x2:", error);

        } finally {

            // Não deu certo: solta o que eu tinha reivindicado (só o que
            // ainda for meu).
            if (!created) {
                await Promise.all(claimedIds.map(id => this.releaseClaim(id, selfId).catch(() => {})));
            }

            claimDisconnectRefs.forEach(claimRef => onDisconnect(claimRef).cancel());

            this.forming = false;

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

        this.clearStaleClaimTimer();

        if (this.lobbyListener) {
            off(ref(db, this.lobbyPath()));
            this.lobbyListener = null;
        }

        if (this.selfMatchListener && this.playerId) {
            off(ref(db, `${this.lobbyPath()}/${this.playerId}`));
            this.selfMatchListener = null;
        }

        if (this.connectedListener) {
            off(ref(db, ".info/connected"));
            this.connectedListener = null;
        }

        if (this.recheckTimer) {
            clearInterval(this.recheckTimer);
            this.recheckTimer = null;
        }

        this.lastLobby = null;

    }

    // Limpeza pós-partida — remove a partida já resolvida do banco,
    // pra não acumular lixo (o banco gratuito tem limite de espaço).
    static async cleanupMatch(matchId) {
        // Caminhos e id capturados ANTES de qualquer await: se o jogador
        // já tiver entrado em outra fila (outro modo/outro id) quando o
        // segundo remove() rodar, não pode apagar a entrada nova.
        const matchPath = `${this.matchesPath()}/${matchId}`;
        const entryPath = this.playerId ? `${this.lobbyPath()}/${this.playerId}` : null;

        await remove(ref(db, matchPath));
        if (entryPath) {
            await remove(ref(db, entryPath));
        }
    }

}
