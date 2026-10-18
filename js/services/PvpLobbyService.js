import {
    db, ref, set, update, remove, onValue, off, onDisconnect,
    get, runTransaction, serverTimestamp
} from "./FirebaseService.js";
import AuthService from "./AuthService.js";
import { TEAM_SIM_VERSION } from "./PvpCombatService.js";
import { sanitizeRemote } from "./MatchSanitizer.js";

// Tempo que um candidato reivindicado (claimedBy preenchido) espera
// virar uma partida de verdade antes de se liberar sozinho. Cobre o
// caso de quem estava montando o grupo cair da conexão bem entre
// "reivindicar" e "terminar de montar" — sem isso, quem foi
// reivindicado ficava invisível pra qualquer pareamento futuro pro
// resto da sessão (ninguém mais tenta de novo por ele).
const STALE_CLAIM_TIMEOUT_MS = 8000;

// Matchmaking por Poder (PowerService): só pareia quem estiver a no
// máximo essa diferença de Poder — ex: com 10k, aceita de 5k a 15k.
// No modo de time (2x2/3x3) vale entre TODOS os jogadores do grupo
// (maior - menor <= limite). Mantido como export pra não quebrar quem
// já importa (ex: PvpView.js, valor default de renderPowerRange).
export const PVP_POWER_RANGE = 5000;

// Modo de time (2x2/3x3) apenas: quanto mais tempo na fila, mais largo
// o limite de Poder — sem isso, com poucos jogadores online (precisa
// de vários dentro do limite entre si) a fila nunca fechava. Sobe
// POWER_RANGE_STEP a cada POWER_RANGE_STEP_MS de espera, até
// POWER_RANGE_MAX. Mesmo passo de tempo (30s) vale pros dois tipos de
// fila — só o Poder em si muda (ver MODE_CONFIG).
const POWER_RANGE_STEP_MS = 30 * 1000;

// Cada "mode" de verdade (string usada em pvpLobby/{mode} e
// pvpMatches/{mode}) tem seu próprio tamanho de time e limite de Poder
// — Combate Ranqueado ("-ranked") é mais restrito: 2.500 em vez de
// 5.000, crescendo até 10.000 em vez de 20.000 (mesma proporção de 4x
// o Livre já usa, só com teto final mais baixo pra ficar competitivo
// de verdade). Isso generaliza TEAM_SIZES + PVP_POWER_RANGE/STEP/MAX
// (que existiam soltos antes, só pro Livre) sem mudar nada do
// comportamento do Livre em si.
const MODE_CONFIG = {
    "1v1": { teamSize: 1, powerRange: 5000, rangeStep: 0, rangeMax: 5000 },
    "2v2": { teamSize: 2, powerRange: 5000, rangeStep: 3750, rangeMax: 20000 },
    "3v3": { teamSize: 3, powerRange: 5000, rangeStep: 3750, rangeMax: 20000 },
    "1v1-ranked": { teamSize: 1, powerRange: 2500, rangeStep: 0, rangeMax: 2500 },
    "2v2-ranked": { teamSize: 2, powerRange: 2500, rangeStep: 1875, rangeMax: 10000 },
    "3v3-ranked": { teamSize: 3, powerRange: 2500, rangeStep: 1875, rangeMax: 10000 }
};

// Pontos de ranking por vitória, por tamanho de time (1 no 1x1, 2 no
// 2x2, 3 no 3x3) — usado por quem resolve a partida (ver PvpView.js).
export const RANKED_POINTS_BY_TEAM_SIZE = { 1: 1, 2: 2, 3: 3 };

// De quanto em quanto tempo o modo de time reavalia a fila sozinho (o
// limite de Poder cresce com o tempo, então a fila pode passar a
// fechar mesmo sem ninguém novo entrar ou sair).
const RECHECK_INTERVAL_MS = 10 * 1000;

// Entrada sem `power` (cliente desatualizado) nunca é compatível —
// melhor não parear do que colocar um nível 100 contra um nível 1.
function isPowerCompatible(a, b, range = PVP_POWER_RANGE) {
    if (typeof a?.power !== "number" || typeof b?.power !== "number") return false;
    return Math.abs(a.power - b.power) <= range;
}

// Limita a busca de grupos do modo de time (combinações entre os
// candidatos) pra não explodir se a fila ficar grande.
const MAX_TEAM_CANDIDATES = 30;

/*
    Evita "roubar" o mesmo adversário: 1x1 reivindica via transação no
    nó do OUTRO jogador (só vira par se `matchedWith` dele ainda estiver
    vazio — o Firebase garante que só uma transação concorrente vence).
    O modo de time (2x2/3x3) reivindica os demais jogadores do grupo da
    mesma forma, mas só quem tem o menor ID entre os compatíveis tenta
    formar o grupo, pra não multiplicar o risco de corrida; se uma das
    reivindicações falhar, desfaz as outras e tenta de novo depois. Só
    entram candidatos dentro do PVP_POWER_RANGE do meu Poder. Cada modo
    tem fila própria (pvpLobby/1v1, pvpLobby/2v2, pvpLobby/3v3), sem
    cruzar uma com a outra.
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


    static lobbyPath() {
        return `pvpLobby/${this.mode}`;
    }

    static matchesPath() {
        return `pvpMatches/${this.mode}`;
    }

    // 2x2 e 3x3 (Livre OU Ranqueado) compartilham todo o fluxo de time
    // (fila com range de Poder crescente, reivindicação em grupo,
    // divisão balanceada) — só muda quantos jogadores por lado.
    static isTeamMode() {
        return this.getTeamSize() > 1;
    }

    static getModeConfig() {
        return MODE_CONFIG[this.mode] ?? MODE_CONFIG["1v1"];
    }

    static getTeamSize() {
        return this.getModeConfig().teamSize;
    }

    // "-ranked" no fim do mode é a única diferença entre a fila do
    // Combate Livre e a do Ranqueado (ver lobbyPath/matchesPath) —
    // nunca cruzam porque vivem em caminhos diferentes no banco.
    static isRanked() {
        return !!this.mode && this.mode.endsWith("-ranked");
    }

    // Limite de Poder atual (modo de time cresce com a espera; 1x1 é
    // fixo). Ranqueado usa os mesmos passos de tempo do Livre, só com
    // valores base/teto mais baixos (ver MODE_CONFIG).
    static getPowerRange() {

        const config = this.getModeConfig();

        if (!this.isTeamMode()) return config.powerRange;

        const steps = Math.floor((Date.now() - this.queuedAt) / POWER_RANGE_STEP_MS);

        return Math.min(config.rangeMax, config.powerRange + Math.max(0, steps) * config.rangeStep);

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

                if (this.isTeamMode()) {

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

    // Entra na fila de espera de um MODO específico ("1v1", "2v2" ou "3v3").
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
        const uid = AuthService.getCurrentUser()?.uid;
        if (!uid) throw new Error("Entre na sua conta pra jogar.");
        this.playerId = uid;

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

                // Modo de time: o ouvinte pode disparar de novo enquanto
                // a partida ainda está sendo buscada — sem isso,
                // onMatchFound rodava duas vezes.
                if (this.isTeamMode() && matchHandled) return;

                this.clearStaleClaimTimer();

                if (this.isTeamMode()) matchHandled = true;

                const matchSnapshot = await get(ref(db, `${this.matchesPath()}/${data.matchId}`));
                // Os combatentes foram gravados por outros navegadores —
                // nunca chegam crus na tela (ver MatchSanitizer.js).
                const match = sanitizeRemote(matchSnapshot.val());

                if (match) {

                    this.stopListening();
                    onMatchFound(match, data.matchId);

                } else if (this.isTeamMode() && this.playerId) {

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
                // (Modo de time: quando a reivindicação é MINHA, montando
                // o grupo, não há o que liberar por timeout.)
                if (!(this.isTeamMode() && data.claimedBy === this.playerId)) {
                    this.scheduleStaleClaimRelease(`${this.lobbyPath()}/${this.playerId}`);
                }

            } else {

                this.clearStaleClaimTimer();

            }

        });

        // Modo de time: uma queda de conexão, mesmo curta, faz o servidor
        // apagar a minha entrada (onDisconnect) — ao reconectar a tela
        // continuava em "Procurando" sem eu existir mais na fila. Recria
        // a entrada.
        if (this.isTeamMode()) {

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
        // bastante (1 pro 1v1, teamSize*2-1 pro modo de time: 3 no 2x2,
        // 5 no 3x3), tenta formar a partida.
        const lobbyRef = ref(db, this.lobbyPath());

        const evaluateLobby = async (all) => {

            const teamMode = this.isTeamMode();
            const teamSize = this.getTeamSize();
            const range = this.getPowerRange();

            const others = Object.entries(all)
                .filter(([id, entry]) => id !== this.playerId && !entry.matchedWith && !entry.claimedBy)
                .filter(([, entry]) => isPowerCompatible(combatant, entry, range))
                // Modo de time: só junta quem roda a MESMA versão da
                // simulação (senão os navegadores calculariam lutas
                // diferentes).
                .filter(([, entry]) => !teamMode || entry.simVersion === TEAM_SIM_VERSION)
                .sort(([idA], [idB]) => idA < idB ? -1 : 1);

            const requiredOthers = teamMode ? (teamSize * 2 - 1) : 1;

            if (others.length < requiredOthers) {
                onOpponentJoined?.(others.length > 0, others.length);
                return;
            }

            onOpponentJoined?.(true, others.length);

            const selfSnapshot = await get(selfRef);
            const selfData = selfSnapshot.val();

            if (selfData?.matchedWith) return;

            if (teamMode) {

                // Já reivindicado por outra pessoa (ou por mim mesmo,
                // montando um grupo): não inicia outro.
                if (selfData?.claimedBy) return;

                // Só tenta montar se EU for o menor ID do grupo
                // encontrado — evita que duas pessoas tentem formar o
                // mesmo time ao mesmo tempo (se ainda assim correrem,
                // as transações de claim resolvem).
                const candidateEntries = this.findTeamCandidates(combatant, others, range, teamSize);

                if (!candidateEntries) return;

                const candidateIds = candidateEntries.map(([id]) => id);
                const candidateData = Object.fromEntries(candidateEntries);

                await this.tryMatchTeam(candidateIds, candidateData, combatant, teamSize);

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

        // Modo de time: o limite de Poder cresce com o tempo de espera,
        // então reavalia a fila periodicamente mesmo sem ninguém novo
        // entrar.
        if (this.isTeamMode()) {

            this.recheckTimer = setInterval(() => {

                if (!this.playerId || this.forming || !this.lastLobby) return;

                evaluateLobby(this.lastLobby);

            }, RECHECK_INTERVAL_MS);

        }

    }

    // Procura "teamSize*2-1" candidatos (3 no 2x2, 5 no 3x3) que, junto
    // comigo, fiquem todos dentro do limite de Poder entre si, e em que
    // eu seja o menor ID. Entre os grupos válidos prefere o de menor
    // diferença de Poder. Devolve as entradas [id, data] escolhidas ou
    // null. Generaliza o antigo loop triplo (hardcoded pro 2x2) com uma
    // busca recursiva de combinações, do mesmo tamanho que o 2x2 tinha
    // quando teamSize=2 (mesmo resultado, mesma ordem de desempate).
    static findTeamCandidates(selfCombatant, others, range = PVP_POWER_RANGE, teamSize = 2) {

        const otherCount = teamSize * 2 - 1;

        const pool = others
            .filter(([id]) => id > this.playerId)
            .slice(0, MAX_TEAM_CANDIDATES);

        let best = null;
        let bestSpread = Infinity;

        const combine = (start, picked) => {

            if (picked.length === otherCount) {

                const powers = [selfCombatant.power, ...picked.map(([, data]) => data.power)];
                const spread = Math.max(...powers) - Math.min(...powers);

                if (spread <= range && spread < bestSpread) {
                    best = [...picked];
                    bestSpread = spread;
                }

                return;

            }

            // Poda: não sobra candidato suficiente pra completar o grupo.
            if (pool.length - start < otherCount - picked.length) return;

            for (let i = start; i < pool.length; i++) {
                picked.push(pool[i]);
                combine(i + 1, picked);
                picked.pop();
            }

        };

        combine(0, []);

        return best;

    }

    // Dentre todas as formas de dividir "teamSize*2" jogadores em 2
    // times de "teamSize", escolhe a de menor diferença de Poder somado
    // entre os lados. Generaliza a antiga versão (só 2x2, "escolhe 1
    // parceiro pro primeiro jogador") — pra teamSize=2 dá exatamente o
    // mesmo resultado (mesma ordem de desempate).
    static splitBalancedTeams(combatants, teamSize = 2) {

        const [first, ...rest] = combatants;
        const total = team => team.reduce((sum, c) => sum + (c.power ?? 0), 0);
        const partnersNeeded = teamSize - 1;

        let bestSplit = null;
        let bestDiff = Infinity;

        // "first" sempre fica no time A — escolhe quem mais acompanha
        // ele dentre o resto; o restante vira o time B.
        const combine = (start, picked) => {

            if (picked.length === partnersNeeded) {

                const teamA = [first, ...picked];
                const teamB = rest.filter(c => !picked.includes(c));
                const diff = Math.abs(total(teamA) - total(teamB));

                if (diff < bestDiff) {
                    bestDiff = diff;
                    bestSplit = { teamA, teamB };
                }

                return;

            }

            if (rest.length - start < partnersNeeded - picked.length) return;

            for (let i = start; i < rest.length; i++) {
                picked.push(rest[i]);
                combine(i + 1, picked);
                picked.pop();
            }

        };

        combine(0, []);

        return bestSplit;

    }

    static async tryMatch(opponentId, opponentCombatant, selfCombatant) {

        const matchId = "m_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        const seed = Math.floor(Math.random() * 2 ** 31);

        // Passo 1: reivindica o oponente com uma transação — usa um
        // campo separado ("claimedBy"), de propósito, pra NÃO avisar
        // o oponente ainda (a partida nem existe de verdade ainda).
        // Só o campo claimedBy: se já houver reivindicação, a transação aborta.
        const claimResult = await runTransaction(
            ref(db, `${this.lobbyPath()}/${opponentId}/claimedBy`),
            (current) => current ? undefined : this.playerId
        );

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
                players: { [this.playerId]: true, [opponentId]: true },
                ranked: this.isRanked(),
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

        const result = await runTransaction(
            ref(db, `${this.lobbyPath()}/${entryId}/claimedBy`),
            (current) => current ? undefined : claimerId
        );

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

    // Modo de time: reivindica A MIM MESMO e os demais candidatos (2 no
    // 2x2, 4 no 3x3), um de cada vez. Reivindicar a si mesmo impede que
    // eu entre em duas partidas (ser reivindicado por outra pessoa E
    // montar o meu próprio grupo). Se qualquer passo falhar no meio,
    // libera tudo que já tinha sido reivindicado e desiste — quem ainda
    // estiver esperando tenta de novo no próximo evento da fila.
    static async tryMatchTeam(candidateIds, candidateData, selfCombatant, teamSize = 2) {

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

            // Confere, ANTES de gravar, que todos continuam na fila e
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

            const split = this.splitBalancedTeams(allCombatants, teamSize);
            const toTeamObject = team => Object.fromEntries(team.map(c => [c.id, c]));

            // Cria a partida E marca todos os jogadores como pareados num
            // commit atômico só (update multi-caminho) — ou tudo é
            // gravado, ou nada.
            const updates = {
                [`${matchesPath}/${matchId}`]: {
                    teamA: toTeamObject(split.teamA),
                    teamB: toTeamObject(split.teamB),
                    players: Object.fromEntries(claimedIds.map(id => [id, true])),
                    ranked: this.isRanked(),
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

            console.warn("Falha ao montar a partida em equipe:", error);

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
