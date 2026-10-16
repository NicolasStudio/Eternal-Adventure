import PvpLobbyService, { PVP_POWER_RANGE } from "../services/PvpLobbyService.js";
import PowerService from "../services/PowerService.js";
import PvpCombatService from "../services/PvpCombatService.js";
import { buildCombatInfo, buildCombatTimeline } from "../combat/CombatInfo.js";
import CombatInfoModal from "../ui/components/modals/CombatInfoModal.js";
import PvpModeChoiceModal from "../ui/components/modals/PvpModeChoiceModal.js";
import Toast from "../ui/components/Toast.js";
import CombatToast from "../combat/CombatToast.js";
import HealFlash from "../combat/HealFlash.js";
import HitFlash from "../combat/HitFlash.js";
import BoitataBurn from "../services/BoitataBurn.js";
import MiasmaService from "../services/MiasmaService.js";
import MimicService from "../services/MimicService.js";
import ConfusionService from "../services/ConfusionService.js";
import ParalysisService from "../services/ParalysisService.js";
import DoubleStrikeService from "../services/DoubleStrikeService.js";
import GravityService, { STACK_THRESHOLD as GRAVITY_STACK_THRESHOLD } from "../services/GravityService.js";
import dungeons from "../data/dungeons.js";

// Só os chefes "normais" (não o final secreto, que fica de fora da
// cerimônia de propósito — não faz sentido revelar aquele cenário
// antes da hora numa luta de PVP comum).
const BOSS_DUNGEONS = dungeons.filter(dungeon => dungeon.boss && !dungeon.hidden);

// Nome/imagem dos outros jogadores vêm do banco — no 2x2 nunca entram
// como HTML sem passar por aqui.
function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}

// Os 4 clientes precisam montar os times na MESMA ordem (a simulação é
// determinística e depende dela) — não confia na ordem em que o Firebase
// devolve as chaves.
function sortedTeam(team) {
    return Object.entries(team ?? {})
        .sort(([idA], [idB]) => idA < idB ? -1 : 1)
        .map(([id, combatant]) => ({ ...combatant, id }));
}

export default class PvpView {

    constructor(game) {
        this.game = game;
        this.state = "lobby"; // lobby | mode | idle | searching | found | ceremony | battle | result | ranked-locked
        this.mode = null; // "1v1" | "2v2" | "3v3"
        this.opponentWaiting = false;
        this.matchData = null;
        this.matchId = null;
        this.combatResult = null;
        this.isPlayerA = null; // 1v1
        this.myTeamKey = null; // 2v2: "a" | "b"
        this.chosenBossDungeon = null;
        this.opponentHP = null; // 1v1
        this.teamHP = {}; // 2v2: { [combatantId]: currentHP } pros 4
        this.flowId = 0; // 2v2: muda quando o jogador sai no meio da partida
        this.flowActive = false;
        this.candidateCount = 0; // 2v2: jogadores compatíveis na fila
        this.searchTimer = null;
        this.searchStartedAt = 0;
        // "Informações do Combate" (ver js/combat/CombatInfo.js) — mesmo
        // modal do Cooperativo/PvE, aberto a partir da tela de resultado
        // (renderResult/renderResultTeam). Nunca guarda nada: cada
        // combatResult novo substitui o anterior.
        this.combatInfoModal = new CombatInfoModal();
        // Modal do lobby (ver renderLobby): Combate Livre / Combate
        // Ranqueado (este travado por enquanto).
        this.modeChoiceModal = new PvpModeChoiceModal();
    }

    get player() {
        return this.game.player;
    }

    // "2v2"/"3v3" compartilham todo o fluxo de time (fila com range de
    // Poder crescente, cartões de vida, resultado em time) — só muda a
    // quantidade de gente. "1v1" não entra aqui.
    isTeamMode() {
        return this.mode === "2v2" || this.mode === "3v3";
    }

    // Quantos jogadores por lado (1v1 = 1, 2v2 = 2, 3v3 = 3).
    getTeamSize() {
        return { "2v2": 2, "3v3": 3 }[this.mode] ?? 1;
    }

    // Combate Livre escolhido no modal do lobby — segue pro picker de
    // modo de sempre (1x1/2x2/3x3). O fundo CONTINUA sendo o lobby
    // (lobby_pvp.png) por todo o picker/fila/partida encontrada — só
    // muda pra arena de verdade quando o combate em si começa (ver
    // onMatchFound/onTeamMatchFound, que trocam o fundo depois da
    // cerimônia).
    enterFreeMode() {
        this.state = "mode";
        this.refresh();
    }

    // Combate Ranqueado escolhido no modal do lobby — "Modo Torneio"
    // ainda travado (ver renderRankedLocked), com a tela fixa
    // arena_pvp.png (diferente do Combate Livre, que mantém o lobby).
    enterRankedLocked() {
        this.state = "ranked-locked";
        this.game.hudScreen.setBackground("assets/img/backgrounds/arena_pvp.png");
        this.refresh();
    }

    // Volta pro lobby (lobby_pvp.png) a partir do picker de modo ou da
    // tela travada do Ranqueado.
    backToLobby() {
        this.state = "lobby";
        this.mode = null;
        this.game.hudScreen.setBackground("assets/img/backgrounds/lobby_pvp.png");
        this.refresh();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Depois de 1 minuto de luta, a animação acelera pra 2x sozinha —
    // de propósito sem nenhum botão/toggle pro jogador, só evita que
    // um combate com muitos turnos arraste por tempo demais.
    getBattleSpeedMultiplier(battleStartTime) {
        return (Date.now() - battleStartTime) > 60000 ? 2 : 1;
    }

    // Durante a cerimônia e a batalha, a tela sai do formato de modal
    // e ocupa a área de conteúdo inteira, igual ao combate normal
    // contra monstro.
    render() {

        if (this.state === "ceremony") return this.renderCeremony();
        if (this.state === "battle") return this.renderBattleArena();

        return `
            <section class="pvp-window">
                <header class="dungeon-header">
                    <h2>Arena PVP</h2>
                    <button class="close-btn dungeon-close pvp-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <div class="pvp-body">
                    ${this.renderState()}
                </div>
            </section>
        `;
    }

    renderState() {
        switch (this.state) {
            case "lobby": return this.renderLobby();
            case "ranked-locked": return this.renderRankedLocked();
            case "idle": return this.renderIdle();
            case "searching": return this.renderSearching();
            case "found": return this.isTeamMode() ? this.renderFoundTeam() : this.renderFound();
            case "result": return this.isTeamMode() ? this.renderResultTeam() : this.renderResult();
            default: return this.renderModeSelect();
        }
    }

    // Primeira tela ao abrir o PVP (fundo lobby_pvp.png, ver
    // HudScreen.changeView) — só um convite pra abrir o modal de
    // escolha (Combate Livre / Combate Ranqueado).
    renderLobby() {
        return `
            <div class="pvp-lobby">
                <i class="fa-solid fa-hand-fist pvp-icon"></i>
                <p class="pvp-description">Prepare-se para a batalha. Escolha como quer entrar na arena hoje.</p>
                <button class="pvp-lobby-enter-button">Entrar</button>
            </div>
        `;
    }

    // Combate Ranqueado ainda não existe de verdade — leva pra essa
    // tela fixa (fundo arena_pvp.png, igual o Combate Livre) com o
    // aviso de "em breve" e um resumo das regras já definidas, pra
    // quando for implementado.
    renderRankedLocked() {
        return `
            <div class="pvp-ranked-locked">
                <i class="fa-solid fa-lock pvp-ranked-locked-icon"></i>
                <h3 class="pvp-found-title">Modo Torneio</h3>
                <p class="pvp-description">Em breve. O Combate Ranqueado ainda está em construção.</p>
                <p class="pvp-ranked-locked-rules">
                    Quando estiver pronto: modos 1x1, 2x2 e 3x3 próprios, pareamento mais
                    restrito (até 2.500 de diferença de Poder), arena sempre fixa, e pontos
                    de ranking na vitória — 1 ponto no 1x1, 2 no 2x2 e 3 no 3x3.
                </p>
                <button class="pvp-lobby-back-button">Voltar</button>
            </div>
        `;
    }

    renderModeSelect() {
        return `
            <div class="pvp-mode-select">
                <i class="fa-solid fa-hand-fist pvp-icon"></i>
                <p class="pvp-description">Escolha o modo de combate:</p>
                <div class="pvp-mode-options">
                    <button class="pvp-mode-btn" data-mode="1v1">
                        <span class="pvp-mode-label">1x1</span>
                        <span class="pvp-mode-sub">Um contra um</span>
                    </button>
                    <button class="pvp-mode-btn" data-mode="2v2">
                        <span class="pvp-mode-label">2x2</span>
                        <span class="pvp-mode-sub">Duplas</span>
                    </button>
                    <button class="pvp-mode-btn" data-mode="3v3">
                        <span class="pvp-mode-label">3x3</span>
                        <span class="pvp-mode-sub">Trios</span>
                    </button>
                </div>
                <button class="pvp-lobby-back-button">Voltar ao lobby</button>
            </div>
        `;
    }

    renderIdle() {
        return `
            <div class="pvp-idle">
                <i class="fa-solid fa-hand-fist pvp-icon"></i>
                <p class="pvp-description">
                    ${this.isTeamMode()
                        ? `Entre na fila e você será agrupado automaticamente com ${this.getTeamSize() === 3 ? "outros dois jogadores" : "outro jogador"} contra ${this.getTeamSize() === 3 ? "um trio adversário" : "uma dupla adversária"}, decidido pelos status de cada personagem no momento da partida. Quanto mais você espera, mais ampla fica a busca por Poder.`
                        : "Entre na fila e enfrente outro jogador em um combate automático, decidido pelos status do seu personagem no momento da partida."}
                </p>
                <button class="pvp-join-button">Entrar na Fila</button>
            </div>
        `;
    }

    renderSearching() {
        if (this.isTeamMode()) return this.renderSearchingTeam();
        return `
            <div class="pvp-searching">
                <div class="pvp-spinner"></div>
                <p class="pvp-status-text">
                    ${this.opponentWaiting
                        ? (this.mode === "2v2" ? "Jogadores encontrados, preparando a partida..." : "Oponente encontrado, preparando a partida...")
                        : (this.mode === "2v2" ? "Procurando outros jogadores..." : "Procurando um oponente...")}
                </p>
                ${this.renderPowerRange()}
                <button class="pvp-cancel-button">Cancelar</button>
            </div>
        `;
    }

    // Modo de time: mostra quantos jogadores compatíveis já estão na
    // fila (precisa de teamSize*2-1 além de você: 3 no 2x2, 5 no 3x3),
    // o tempo de espera e o limite de Poder atual — que cresce sozinho
    // com a espera. Só esses três trechos são atualizados depois
    // (updateSearchInfo), sem refazer a tela toda.
    renderSearchingTeam() {
        return `
            <div class="pvp-searching">
                <div class="pvp-spinner"></div>
                <p class="pvp-status-text" id="pvp-search-status">${this.getTeamSearchStatus()}</p>
                <p class="pvp-power-range">
                    <i class="fa-regular fa-clock"></i>
                    Tempo de espera: <strong id="pvp-search-elapsed">${this.getSearchElapsed()}</strong>
                </p>
                ${this.renderPowerRange(PvpLobbyService.getPowerRange())}
                <button class="pvp-cancel-button">Cancelar</button>
            </div>
        `;
    }

    getRequiredCandidates() {
        return this.getTeamSize() * 2 - 1;
    }

    getTeamSearchStatus() {
        const needed = this.getRequiredCandidates();
        return `Procurando jogadores compatíveis... (${Math.min(this.candidateCount, needed)}/${needed} na fila)`;
    }

    getSearchElapsed() {
        const seconds = Math.max(0, Math.floor((Date.now() - this.searchStartedAt) / 1000));
        return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    }

    updateSearchInfo() {

        if (this.state !== "searching" || !this.isTeamMode()) return;

        const status = document.getElementById("pvp-search-status");
        const elapsed = document.getElementById("pvp-search-elapsed");
        const range = document.getElementById("pvp-power-range");

        if (status) status.textContent = this.getTeamSearchStatus();
        if (elapsed) elapsed.textContent = this.getSearchElapsed();
        if (range) range.outerHTML = this.renderPowerRange(PvpLobbyService.getPowerRange());

    }

    startSearchTimer() {

        this.stopSearchTimer();

        this.searchStartedAt = Date.now();
        this.searchTimer = setInterval(() => this.updateSearchInfo(), 1000);

    }

    stopSearchTimer() {

        if (!this.searchTimer) return;

        clearInterval(this.searchTimer);
        this.searchTimer = null;

    }

    // Chamado pelo HudScreen ao sair da tela de PVP. No modo de time
    // (2x2/3x3), interrompe a cerimônia/luta em andamento (os passos
    // assíncronos conferem o flowId e param sozinhos) e libera a
    // partida no banco. No 1x1 não faz nada.
    abortFlow() {

        if (!this.isTeamMode()) return;

        this.stopSearchTimer();

        if (!this.flowActive) return;

        this.flowId++;
        this.flowActive = false;

        // Ainda dentro do mesmo tick, com o modo/jogador de agora.
        if (this.matchId) PvpLobbyService.cleanupMatch(this.matchId);

    }

    renderFound() {
        const { combatantA, combatantB } = this.matchData;
        return `
            <div class="pvp-found">
                <h3 class="pvp-found-title">Partida Encontrada!</h3>
                <div class="pvp-versus">
                    <span class="pvp-fighter-name">${combatantA.name}</span>
                    <span class="pvp-vs">VS</span>
                    <span class="pvp-fighter-name">${combatantB.name}</span>
                </div>
            </div>
        `;
    }

    renderFoundTeam() {

        // Usa os times JÁ resolvidos do ponto de vista do jogador
        // (getMy/EnemyTeamCombatants dependem de myTeamKey, definido
        // antes de entrar no estado "found") em vez de teamA/teamB crus
        // — assim "Sua dupla" é sempre a sua, não a dupla "A" do banco.
        const myTeam = this.getMyTeamCombatants();
        const enemyTeam = this.getEnemyTeamCombatants();
        const myId = PvpLobbyService.playerId;

        const fighter = (c) => {
            const isYou = c.id === myId;
            const level = Math.floor(Number(c.level)) || 0;
            return `
                <div class="pvp-found-fighter${isYou ? " is-you" : ""}">
                    <img class="pvp-found-avatar" src="${escapeHtml(c.hud ?? c.image ?? "")}" alt="">
                    <div class="pvp-found-fighter-info">
                        <span class="pvp-fighter-name">${escapeHtml(c.name)}${isYou ? ` <span class="pvp-found-you">(você)</span>` : ""}</span>
                        ${level ? `<span class="pvp-found-level">LV ${level}</span>` : ""}
                    </div>
                </div>
            `;
        };

        const myLabel = this.getTeamSize() === 3 ? "Seu time" : "Sua dupla";

        return `
            <div class="pvp-found">
                <h3 class="pvp-found-title">Partida Encontrada!</h3>
                <div class="pvp-versus pvp-versus-team">
                    <div class="pvp-team-column pvp-team-mine">
                        <span class="pvp-team-label">${myLabel}</span>
                        ${myTeam.map(fighter).join("")}
                    </div>
                    <span class="pvp-vs">VS</span>
                    <div class="pvp-team-column pvp-team-enemy">
                        <span class="pvp-team-label">Oponentes</span>
                        ${enemyTeam.map(fighter).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    renderCeremony() {
        return `
            <section class="pvp-ceremony-window">
                <p class="pvp-ceremony-label">Sorteando a arena...</p>
                <div class="pvp-ceremony-frame">
                    <img id="pvp-ceremony-image" src="${this.chosenBossDungeon?.image ?? BOSS_DUNGEONS[0].image}" alt="Arena">
                </div>
            </section>
        `;
    }

    // 2x2: cartão de vida no mesmo estilo do HUD do jogador (retrato,
    // nome, nível e barra de HP). Meu cartão é o próprio PlayerHUD; aqui
    // ficam o do meu aliado (coluna da esquerda) e os dos dois inimigos
    // (coluna da direita).
    renderTeamCard(combatant) {

        const id = escapeHtml(combatant.id);
        const maxHP = Math.max(1, Math.floor(Number(combatant.maxHP)) || 1);
        const hp = Math.max(0, Math.min(maxHP, Math.round(this.teamHP[combatant.id] ?? maxHP)));
        const level = Math.floor(Number(combatant.level)) || 0;

        return `
            <aside class="hud-panel pvp2v2-card" data-combatant-id="${id}">
                <div class="hud-player-header">
                    <img class="hud-avatar" src="${escapeHtml(combatant.hud ?? combatant.image ?? "")}" alt="">
                    <div class="hud-info">
                        <h2 class="hud-name">${escapeHtml(combatant.name)}</h2>
                        ${level ? `<span class="hud-level">LV ${level}</span>` : ""}
                    </div>
                </div>
                <div class="hud-bar">
                    <span class="hud-label">HP</span>
                    <div id="pvp-card-fill-${id}" class="hud-fill hp" style="width:${(hp / maxHP) * 100}%;"></div>
                    <span id="pvp-card-text-${id}" class="hud-text">${hp} / ${maxHP}</span>
                </div>
            </aside>
        `;

    }

    // 2x2 tem 1 aliado, 3x3 tem 2 — mapeia todos os colegas de time que
    // não sou eu, em vez de assumir exatamente 1 (find).
    renderAllyCards() {

        if (!this.isTeamMode() || !this.matchData) return "";

        const allies = this.getMyTeamCombatants().filter(c => c.id !== PvpLobbyService.playerId);

        return allies.map(ally => this.renderTeamCard(ally)).join("");

    }

    renderEnemyCards() {

        if (!this.isTeamMode() || !this.matchData) return "";

        return `
            <div class="pvp2v2-enemy-cards">
                ${this.getEnemyTeamCombatants().map(c => this.renderTeamCard(c)).join("")}
            </div>
        `;

    }

    // Atualiza a barra do cartão de um aliado/inimigo (o meu é o PlayerHUD).
    updateTeamCard(combatantId) {

        const combatant = [...this.getMyTeamCombatants(), ...this.getEnemyTeamCombatants()]
            .find(c => c.id === combatantId);

        if (!combatant || combatantId === PvpLobbyService.playerId) return;

        const maxHP = Math.max(1, Math.floor(Number(combatant.maxHP)) || 1);
        const hp = Math.max(0, Math.min(maxHP, Math.round(this.teamHP[combatantId] ?? maxHP)));

        const fill = document.getElementById(`pvp-card-fill-${combatantId}`);
        const text = document.getElementById(`pvp-card-text-${combatantId}`);

        if (fill) fill.style.width = `${(hp / maxHP) * 100}%`;
        if (text) text.textContent = `${hp} / ${maxHP}`;

    }

    // Chamado pelo HudScreen enquanto this.game.hudScreen.inPvpCombat
    // estiver true — mesmo espírito do DungeonHeader durante combate PVE.
    renderArenaHeader() {

        if (this.isTeamMode()) {
            const myTeam = this.getMyTeamCombatants();
            const enemyTeam = this.getEnemyTeamCombatants();
            const myId = PvpLobbyService.playerId;
            const label = (c) => escapeHtml(c.name) + (c.id === myId ? " (você)" : "");
            const myNames = myTeam.map(label).join(" & ");
            const enemyNames = enemyTeam.map(c => escapeHtml(c.name)).join(" & ");
            return `
                <section class="pvp2v2-header-inline">
                    <h2 class="pvp2v2-title">Arena PVP · ${this.mode === "3v3" ? "3x3" : "2x2"}</h2>
                    <span class="pvp2v2-subtitle"><strong>${myNames}</strong> vs ${enemyNames}</span>
                </section>
            `;
        }

        const opponent = this.currentOpponentSnapshot();
        return `
            <section class="combat-header-inline">
                <h2 class="combat-title">Arena PVP</h2>
                <span class="combat-floor">vs ${opponent?.name ?? "..."}</span>
            </section>
        `;
    }

    // Reaproveita exatamente as mesmas classes CSS do combate contra
    // monstro (.combat-window/.combat-arena/.monster-stage) — o
    // adversário aparece onde o monstro apareceria. No 2x2, os dois
    // inimigos aparecem lado a lado num container próprio.
    renderBattleArena() {

        if (this.isTeamMode()) {

            const enemyTeam = this.getEnemyTeamCombatants();

            return `
                <section class="pvp2v2-window">
                    <div class="pvp2v2-arena">
                        <div class="pvp2v2-portraits${enemyTeam.length > 2 ? " is-trio" : ""}">
                            ${enemyTeam.map(c => `
                                <div class="pvp2v2-portrait-slot" data-combatant-id="${escapeHtml(c.id)}">
                                    <img src="${escapeHtml(c.image ?? "")}" alt="${escapeHtml(c.name)}">
                                    <span class="pvp2v2-portrait-name">${escapeHtml(c.name)}</span>
                                </div>
                            `).join("")}
                        </div>
                        <div id="combat-toast-container"></div>
                    </div>
                </section>
            `;

        }

        const opponent = this.currentOpponentSnapshot();
        return `
            <section class="combat-window">
                <div class="combat-main">
                    <section class="combat-arena">
                        <div class="monster-stage">
                            <img class="combat-monster" src="${opponent?.image ?? ""}" alt="${opponent?.name ?? ""}">
                        </div>
                        <div id="combat-toast-container"></div>
                    </section>
                </div>
            </section>
        `;
    }

    renderResult() {

        const { combatantA, combatantB } = this.matchData;
        const iWon = (this.combatResult.winner === "a") === this.isPlayerA;

        return `
            <div class="pvp-result">
                <h3 class="pvp-result-title ${iWon ? "win" : "lose"}">
                    ${iWon ? "Vitória!" : "Derrota"}
                </h3>
                <div class="pvp-versus">
                    <span class="pvp-fighter-name ${this.combatResult.winner === "a" ? "winner" : ""}">${combatantA.name}</span>
                    <span class="pvp-vs">VS</span>
                    <span class="pvp-fighter-name ${this.combatResult.winner === "b" ? "winner" : ""}">${combatantB.name}</span>
                </div>
                <div class="pvp-log">
                    ${this.combatResult.log.slice(-12).map(entry => this.renderLogLine(entry, combatantA, combatantB)).join("")}
                </div>
                <button class="pvp-combat-info-button">Informações do Combate</button>
                <button class="pvp-back-button">Voltar</button>
            </div>
        `;

    }

    renderResultTeam() {

        const teamA = sortedTeam(this.matchData.teamA);
        const teamB = sortedTeam(this.matchData.teamB);
        const iWon = this.combatResult.winner === this.myTeamKey;

        const allCombatants = [...teamA, ...teamB];
        const nameOf = (id) => escapeHtml(allCombatants.find(c => c.id === id)?.name ?? "???");
        const petNameOf = (id) => escapeHtml(allCombatants.find(c => c.id === id)?.petName ?? "O pet");

        return `
            <div class="pvp-result">
                <h3 class="pvp-result-title ${iWon ? "win" : "lose"}">
                    ${iWon ? "Vitória!" : "Derrota"}
                </h3>
                <div class="pvp-versus pvp-versus-team">
                    <div class="pvp-team-column ${this.combatResult.winner === "a" ? "winner" : ""}">
                        ${teamA.map(c => `<span class="pvp-fighter-name">${escapeHtml(c.name)}</span>`).join("")}
                    </div>
                    <span class="pvp-vs">VS</span>
                    <div class="pvp-team-column ${this.combatResult.winner === "b" ? "winner" : ""}">
                        ${teamB.map(c => `<span class="pvp-fighter-name">${escapeHtml(c.name)}</span>`).join("")}
                    </div>
                </div>
                <div class="pvp-log">
                    ${this.combatResult.log.slice(-12).map(entry => this.renderLogLineTeam(entry, nameOf, petNameOf)).join("")}
                </div>
                <button class="pvp-combat-info-button">Informações do Combate</button>
                <button class="pvp-back-button">Voltar</button>
            </div>
        `;

    }

    renderLogLine(entry, combatantA, combatantB) {
        const name = entry.turn === "a" ? combatantA.name : combatantB.name;
        const defenderName = entry.turn === "a" ? combatantB.name : combatantA.name;
        // Confusão "errou o ataque" — antes mesmo da esquiva (ver
        // ConfusionService.js).
        if (entry.confusionOutcome === "miss") {
            return `<div class="pvp-log-line pvp-log-dodge">${name} errou o ataque, confuso!</div>`;
        }
        // Paralisia "perdeu o ataque" — antes mesmo da esquiva (ver
        // ParalysisService.js).
        if (entry.paralyzed) {
            return `<div class="pvp-log-line pvp-log-dodge">${name} ficou paralisado e perdeu o ataque!</div>`;
        }
        // Gravidade Máxima "perdeu o turno" — mesma prioridade da
        // Paralisia acima (ver GravityService.js).
        if (entry.gravityStunned) {
            return `<div class="pvp-log-line pvp-log-dodge">${name} ficou pesado demais e perdeu o ataque!</div>`;
        }
        if (entry.dodged) {
            return `<div class="pvp-log-line pvp-log-dodge">${name} esquivou!</div>`;
        }
        if (entry.burn) {
            const petName = (entry.turn === "a" ? combatantA : combatantB).petName ?? "O pet";
            return `<div class="pvp-log-line pvp-log-pet-bite">${petName} queimou ${defenderName}: ${entry.damage} de dano.</div>`;
        }
        if (entry.revive) {
            const petName = (entry.turn === "a" ? combatantA : combatantB).petName ?? "O pet";
            return `<div class="pvp-log-line pvp-log-pet-bite">${petName} reviveu ${name} com ${entry.heal} HP.</div>`;
        }
        if (entry.petBite) {
            const petName = (entry.turn === "a" ? combatantA : combatantB).petName ?? "O pet";
            const parts = [];
            if (entry.damage > 0) parts.push(`causou ${entry.damage} de dano`);
            if (entry.heal > 0) parts.push(`curou ${entry.heal} HP`);
            return `<div class="pvp-log-line pvp-log-pet-bite">${petName} agiu! ${parts.join(" e ")}.</div>`;
        }
        // Golpe Duplo do Samurai: segunda entrada própria no log, mesmo
        // dano repetido (ver DoubleStrikeService.js) — sem crítico/
        // absorção/life steal de novo.
        if (entry.doubleStrike) {
            return `<div class="pvp-log-line"><span class="combat-double-strike">Golpe Duplo!</span> ${name} acertou ${defenderName} de novo: ${entry.damage} de dano</div>`;
        }
        const crit = entry.critical ? ` <span class="pvp-log-critical">(Crítico!)</span>` : "";
        const steal = entry.lifeSteal > 0 ? ` <span class="pvp-log-heal">(+${entry.lifeSteal} HP roubado)</span>` : "";
        const absorbed = entry.absorbed > 0
            ? ` <span class="pvp-log-absorption">(${defenderName} absorveu ${entry.absorbed})</span>`
            : "";
        const confusion = entry.confusionProc || entry.confusionOutcome
            ? ` <span class="combat-confusion">(Confusão!)</span>`
            : "";
        const paralysis = entry.paralysisProc
            ? ` <span class="combat-paralysis">(Paralisia!)</span>`
            : "";
        const doubleStrike = entry.doubleStrikeProc
            ? ` <span class="combat-double-strike">(Golpe Duplo!)</span>`
            : "";
        const gravityArmorHalved = entry.gravityArmorHalved
            ? ` <span class="combat-gravity">(Gravidade Máxima: Armadura pela metade!)</span>`
            : "";
        const gravity = entry.gravityProc
            ? ` <span class="combat-gravity">(Pressão Gravitacional ${entry.gravityStacks}/${GRAVITY_STACK_THRESHOLD}!)</span>`
            : "";
        if (entry.confusionOutcome === "self") {
            return `<div class="pvp-log-line">${name} se atacou sem querer: ${entry.damage} de dano${crit}${confusion}</div>`;
        }
        return `<div class="pvp-log-line">${name} causou ${entry.damage} de dano${crit}${steal}${absorbed}${confusion}${paralysis}${doubleStrike}${gravityArmorHalved}${gravity}</div>`;
    }

    renderLogLineTeam(entry, nameOf, petNameOf) {
        const attackerName = nameOf(entry.attackerId);
        const targetName = nameOf(entry.targetId);
        // Confusão "errou o ataque" — antes mesmo da esquiva (ver
        // ConfusionService.js).
        if (entry.confusionOutcome === "miss") {
            return `<div class="pvp-log-line pvp-log-dodge">${attackerName} errou o ataque, confuso!</div>`;
        }
        // Paralisia "perdeu o ataque" — antes mesmo da esquiva (ver
        // ParalysisService.js).
        if (entry.paralyzed) {
            return `<div class="pvp-log-line pvp-log-dodge">${attackerName} ficou paralisado e perdeu o ataque!</div>`;
        }
        // Gravidade Máxima "perdeu o turno" — mesma prioridade da
        // Paralisia acima (ver GravityService.js).
        if (entry.gravityStunned) {
            return `<div class="pvp-log-line pvp-log-dodge">${attackerName} ficou pesado demais e perdeu o ataque!</div>`;
        }
        if (entry.dodged) {
            return `<div class="pvp-log-line pvp-log-dodge">${targetName} esquivou de ${attackerName}!</div>`;
        }
        if (entry.burn) {
            return `<div class="pvp-log-line pvp-log-pet-bite">${petNameOf(entry.attackerId)} de ${attackerName} queimou ${targetName}: ${entry.damage} de dano.</div>`;
        }
        if (entry.revive) {
            return `<div class="pvp-log-line pvp-log-pet-bite">${petNameOf(entry.attackerId)} reviveu ${attackerName} com ${entry.heal} HP.</div>`;
        }
        if (entry.petBite) {
            const healTargetName = entry.healedIds?.[0] ? nameOf(entry.healedIds[0]) : null;
            const parts = [];
            if (entry.damage > 0) parts.push(`causou ${entry.damage} de dano em ${targetName}`);
            if (entry.heal > 0 && healTargetName) parts.push(`curou ${healTargetName} em ${entry.heal} HP`);
            return `<div class="pvp-log-line pvp-log-pet-bite">Pet de ${attackerName} agiu! ${parts.join(" e ")}.</div>`;
        }
        // Golpe Duplo do Samurai: segunda entrada própria no log, mesmo
        // dano repetido (ver DoubleStrikeService.js) — sem crítico/
        // absorção/life steal de novo.
        if (entry.doubleStrike) {
            return `<div class="pvp-log-line"><span class="combat-double-strike">Golpe Duplo!</span> ${attackerName} acertou ${targetName} de novo: ${entry.damage} de dano</div>`;
        }
        const crit = entry.critical ? ` <span class="pvp-log-critical">(Crítico!)</span>` : "";
        const steal = entry.lifeSteal > 0 ? ` <span class="pvp-log-heal">(+${entry.lifeSteal} HP roubado)</span>` : "";
        const absorbed = entry.absorbed > 0
            ? ` <span class="pvp-log-absorption">(${targetName} absorveu ${entry.absorbed})</span>`
            : "";
        const confusion = entry.confusionProc || entry.confusionOutcome
            ? ` <span class="combat-confusion">(Confusão!)</span>`
            : "";
        const paralysis = entry.paralysisProc
            ? ` <span class="combat-paralysis">(Paralisia!)</span>`
            : "";
        const doubleStrike = entry.doubleStrikeProc
            ? ` <span class="combat-double-strike">(Golpe Duplo!)</span>`
            : "";
        const gravityArmorHalved = entry.gravityArmorHalved
            ? ` <span class="combat-gravity">(Gravidade Máxima: Armadura pela metade!)</span>`
            : "";
        const gravity = entry.gravityProc
            ? ` <span class="combat-gravity">(Pressão Gravitacional ${entry.gravityStacks}/${GRAVITY_STACK_THRESHOLD}!)</span>`
            : "";
        if (entry.confusionOutcome === "self") {
            return `<div class="pvp-log-line">${attackerName} se atacou sem querer: ${entry.damage} de dano${crit}${confusion}</div>`;
        }
        return `<div class="pvp-log-line">${attackerName} causou ${entry.damage} de dano em ${targetName}${crit}${steal}${absorbed}${confusion}${paralysis}${doubleStrike}${gravityArmorHalved}${gravity}</div>`;
    }

    currentOpponentSnapshot() {
        if (!this.matchData) return null;
        return this.isPlayerA ? this.matchData.combatantB : this.matchData.combatantA;
    }

    getMyTeamCombatants() {
        if (!this.matchData) return [];
        const team = this.myTeamKey === "a" ? this.matchData.teamA : this.matchData.teamB;
        return sortedTeam(team);
    }

    getEnemyTeamCombatants() {
        if (!this.matchData) return [];
        const team = this.myTeamKey === "a" ? this.matchData.teamB : this.matchData.teamA;
        return sortedTeam(team);
    }

    // Adapta o combatente pro formato que o MonsterHUD já sabe
    // renderizar (mesmo componente do combate PVE, sem precisar
    // duplicar nada nele). Só usado no 1x1 — o 2x2 tem seu próprio
    // painel (renderBattleArena cuida disso pros 2 inimigos).
    opponentAsMonster() {
        const opponent = this.currentOpponentSnapshot();
        if (!opponent) return null;
        return {
            name: opponent.name,
            status: {
                vidaAtual: this.opponentHP ?? opponent.maxHP,
                vidaMaxima: opponent.maxHP
            }
        };
    }

    renderPowerRange(range = PVP_POWER_RANGE) {
        const power = PowerService.getPower(this.player);
        const format = value => value.toLocaleString("pt-BR");
        return `
            <p class="pvp-power-range" id="pvp-power-range">
                <i class="fa-solid fa-fire-flame-curved"></i>
                Seu Poder: <strong>${format(power)}</strong>
                <span>Buscando entre ${format(Math.max(0, power - range))} e ${format(power + range)}</span>
            </p>
        `;
    }

    async joinQueue() {

        this.state = "searching";
        this.opponentWaiting = false;
        this.candidateCount = 0;

        if (this.isTeamMode()) this.startSearchTimer();

        this.refresh();

        const combatant = PvpCombatService.snapshotCombatant(this.player);

        await PvpLobbyService.joinQueue(
            this.mode,
            combatant,
            (matchData, matchId) => this.onMatchFound(matchData, matchId),
            (waiting, count) => {
                this.opponentWaiting = waiting;
                if (this.isTeamMode()) {
                    // Só atualiza os textos (sem refazer a tela toda).
                    this.candidateCount = count ?? 0;
                    this.updateSearchInfo();
                    return;
                }
                if (this.state === "searching") this.refresh();
            }
        );

    }

    async cancelQueue() {
        this.stopSearchTimer();
        await PvpLobbyService.leaveQueue();
        this.state = "idle";
        this.refresh();
    }

    async onMatchFound(matchData, matchId) {

        if (this.isTeamMode()) {
            return this.onTeamMatchFound(matchData, matchId);
        }

        this.matchData = matchData;
        this.matchId = matchId;

        this.isPlayerA = matchData.combatantA.id === PvpLobbyService.playerId;

        this.state = "found";
        this.refresh();

        await this.sleep(1500);

        // A arena é sorteada, mas com a MESMA semente da partida — os
        // jogadores todos veem exatamente o mesmo cenário, sem
        // precisar combinar nada entre si.
        const chosenIndex = Math.abs(matchData.seed) % BOSS_DUNGEONS.length;
        this.chosenBossDungeon = BOSS_DUNGEONS[chosenIndex];

        this.game.hudScreen.inPvpCombat = true;
        this.game.hudScreen.updateMusic();
        this.state = "ceremony";
        this.refresh();

        await this.runCeremonyAnimation(chosenIndex);

        this.game.hudScreen.setBackground(this.chosenBossDungeon.background);

        await this.startSoloBattle();

        await this.sleep(900);

        this.game.hudScreen.inPvpCombat = false;
        this.game.hudScreen.updateMusic();
        this.state = "result";
        this.refresh();

        PvpLobbyService.cleanupMatch(matchId);

    }

    // Fluxo do modo de time (2x2/3x3, separado do 1x1 de propósito):
    // confere que a partida é válida e que eu faço parte dela, e a cada
    // etapa assíncrona confere se o jogador não saiu da tela
    // (abortFlow) — se saiu, para sem mexer em mais nada.
    async onTeamMatchFound(matchData, matchId) {

        this.stopSearchTimer();

        const flow = ++this.flowId;
        const aborted = () => flow !== this.flowId;
        const myId = PvpLobbyService.playerId;
        const teamSize = this.getTeamSize();

        const teamAIds = Object.keys(matchData?.teamA ?? {});
        const teamBIds = Object.keys(matchData?.teamB ?? {});

        if (teamAIds.length !== teamSize || teamBIds.length !== teamSize
            || !(teamAIds.includes(myId) || teamBIds.includes(myId))) {

            Toast.show("Não foi possível iniciar a partida. Entre na fila de novo.");
            PvpLobbyService.cleanupMatch(matchId);
            this.state = "idle";
            this.refresh();
            return;

        }

        this.matchData = matchData;
        this.matchId = matchId;
        this.teamHP = {};
        this.myTeamKey = teamAIds.includes(myId) ? "a" : "b";
        this.flowActive = true;

        let finished = false;

        try {

            this.state = "found";
            this.refresh();

            await this.sleep(1500);
            if (aborted()) return;

            // Mesma semente da partida — todos veem o mesmo cenário.
            const chosenIndex = Math.abs(matchData.seed) % BOSS_DUNGEONS.length;
            this.chosenBossDungeon = BOSS_DUNGEONS[chosenIndex];

            this.game.hudScreen.inPvpCombat = true;
            this.game.hudScreen.updateMusic();
            this.state = "ceremony";
            this.refresh();

            await this.runCeremonyAnimation(chosenIndex);
            if (aborted()) return;

            this.game.hudScreen.setBackground(this.chosenBossDungeon.background);

            await this.startTeamBattle(aborted);
            if (aborted()) return;

            await this.sleep(900);
            if (aborted()) return;

            finished = true;

        } catch (error) {

            console.error("Erro na partida em equipe:", error);

        }

        // O jogador saiu da tela no meio: o abortFlow já limpou tudo.
        if (aborted()) return;

        this.flowActive = false;
        this.game.hudScreen.inPvpCombat = false;
        this.game.hudScreen.updateMusic();

        PvpLobbyService.cleanupMatch(matchId);

        if (!finished) {
            Toast.show("A partida foi interrompida por um erro.");
            this.state = "idle";
            this.refresh();
            return;
        }

        this.state = "result";
        this.refresh();

    }

    async startSoloBattle() {

        // O resultado já é calculado aqui — determinístico, os dois
        // clientes chegam exatamente no mesmo resultado sozinhos (ver
        // PvpCombatService). A "batalha" que o jogador vê na tela é só
        // a ANIMAÇÃO desse resultado já pronto, turno por turno.
        const result = PvpCombatService.simulate(
            this.matchData.combatantA,
            this.matchData.combatantB,
            this.matchData.seed
        );
        this.combatResult = result;

        const opponent = this.currentOpponentSnapshot();
        this.opponentHP = opponent.maxHP;

        this.state = "battle";
        this.refresh();

        await CombatToast.show(`Partida contra ${opponent.name} começou!`, "system", 2);

        await this.playBattleLog(result.log);

        const iWon = (result.winner === "a") === this.isPlayerA;
        await CombatToast.show(iWon ? `${opponent.name} derrotado!` : "Você foi derrotado!", "system", 2);

        // Só pra alimentar a conquista de PVP — notify() explícito
        // porque vencer uma partida, sozinho, não muda nada em
        // player.gold/level/etc que já dispararia isso.
        if (iWon) {
            this.player.progress.stats.pvpWins = (this.player.progress.stats.pvpWins ?? 0) + 1;
            this.player.notify();
        }

    }

    async startTeamBattle(aborted = () => false) {

        const teamA = sortedTeam(this.matchData.teamA);
        const teamB = sortedTeam(this.matchData.teamB);

        const result = PvpCombatService.simulateTeam(teamA, teamB, this.matchData.seed);
        this.combatResult = result;

        this.teamHP = {};
        [...teamA, ...teamB].forEach(c => { this.teamHP[c.id] = c.maxHP; });

        this.state = "battle";
        this.refresh();

        const enemyNames = this.getEnemyTeamCombatants().map(c => escapeHtml(c.name)).join(" e ");
        await CombatToast.show(`Partida contra ${enemyNames} começou!`, "system", 2);
        if (aborted()) return;

        await this.playTeamBattleLog(result.log, aborted);
        if (aborted()) return;

        const iWon = result.winner === this.myTeamKey;
        const teamLabel = this.getTeamSize() === 3 ? "Seu time" : "Sua dupla";
        await CombatToast.show(iWon ? `${teamLabel} venceu!` : `${teamLabel} foi derrotado!`, "system", 2);
        if (aborted()) return;

        if (iWon) {
            this.player.progress.stats.pvpWins = (this.player.progress.stats.pvpWins ?? 0) + 1;
            this.player.notify();
        }

    }

    // Sorteio estilo "caça-níquel": troca a imagem rapidamente entre
    // os chefes disponíveis, desacelerando aos poucos, até parar na
    // arena escolhida de verdade (a mesma pra todos os jogadores).
    async runCeremonyAnimation(chosenIndex) {

        const totalSteps = 18;
        let delay = 60;

        for (let i = 0; i < totalSteps; i++) {

            const isLastStep = i === totalSteps - 1;
            const index = isLastStep
                ? chosenIndex
                : Math.floor(Math.random() * BOSS_DUNGEONS.length);

            const image = document.getElementById("pvp-ceremony-image");

            if (image) {
                image.src = BOSS_DUNGEONS[index].image;
            }

            await this.sleep(delay);

            delay += 10;

        }

        await this.sleep(700);

    }

    buildAttackMessage(entry) {

        const isMe = (entry.turn === "a") === this.isPlayerA;
        const opponentName = this.currentOpponentSnapshot()?.name ?? "Adversário";

        // Confusão "errou o ataque" — antes mesmo da esquiva, tem
        // mensagem própria (ver ConfusionService.js e CombatEngine.js).
        if (entry.confusionOutcome === "miss") {
            return isMe
                ? ConfusionService.buildOutcomeMessage("miss", "Você")
                : ConfusionService.buildOutcomeMessage("miss", opponentName);
        }

        // Paralisia "perdeu o ataque" — antes mesmo da esquiva, tem
        // mensagem própria (ver ParalysisService.js).
        if (entry.paralyzed) {
            return ParalysisService.buildOutcomeMessage(isMe ? "Você" : opponentName);
        }

        // Gravidade Máxima "perdeu o turno" — mesma prioridade da
        // Paralisia acima (ver GravityService.js).
        if (entry.gravityStunned) {
            return GravityService.buildStunMessage(isMe ? "Você" : opponentName);
        }

        if (entry.dodged) {
            return isMe
                ? `<span class="combat-dodge">${opponentName} esquivou do seu ataque!</span>`
                : `<span class="combat-dodge">Você esquivou do ataque!</span>`;
        }

        if (entry.burn) {
            const petName = (isMe ? this.player.equipment.pet?.name : this.currentOpponentSnapshot()?.petName) ?? "O pet";
            return BoitataBurn.buildMessage({
                petName: isMe ? petName : `${petName} de ${opponentName}`,
                targetName: isMe ? opponentName : "você",
                damage: entry.damage,
                first: entry.burnStart
            });
        }

        if (entry.revive) {
            const petName = (isMe ? this.player.equipment.pet?.name : this.currentOpponentSnapshot()?.petName) ?? "O pet";
            return isMe
                ? `<span class="combat-pet-bite">${petName}</span> reviveu você com <strong>${entry.heal}</strong> HP!`
                : `<span class="combat-pet-bite">${petName}</span> reviveu ${opponentName} com <strong>${entry.heal}</strong> HP!`;
        }

        if (entry.petBite) {
            const petName = (isMe ? this.player.equipment.pet?.name : this.currentOpponentSnapshot()?.petName) ?? "O pet";
            const damage = entry.damage > 0
                ? (isMe ? ` Causou <strong>${entry.damage}</strong> de dano.` : ` Você recebeu <strong>${entry.damage}</strong> de dano.`)
                : "";
            const heal = entry.heal > 0
                ? (isMe ? ` Curou <strong>${entry.heal}</strong> HP.` : ` ${opponentName} curou <strong>${entry.heal}</strong> HP.`)
                : "";
            return isMe
                ? `<span class="combat-pet-bite">${petName} agiu!</span>${damage}${heal}`
                : `<span class="combat-pet-bite">${petName} de ${opponentName} agiu!</span>${damage}${heal}`;
        }

        // Golpe Duplo do Samurai: segunda entrada própria no log, mesmo
        // dano repetido (ver DoubleStrikeService.js) — sem crítico/
        // absorção/life steal de novo, mensagem própria em vez da linha
        // normal de dano.
        if (entry.doubleStrike) {
            return `${DoubleStrikeService.buildMessage(isMe ? opponentName : "você")} Causou <strong>${entry.damage}</strong> de dano.`;
        }

        // Confusão "ataca a si mesmo" ou "acerta o oponente mesmo
        // confuso" — prefixo próprio antes da linha de dano normal (ver
        // CombatEngine.createAttackMessage, mesmo padrão).
        const confusionSelfPrefix = entry.confusionOutcome === "self"
            ? `${ConfusionService.buildOutcomeMessage("self", isMe ? "Você" : opponentName)}<br>`
            : "";
        const confusionOpponentPrefix = entry.confusionOutcome === "opponent"
            ? `${ConfusionService.buildOutcomeMessage("opponent", isMe ? "Você" : opponentName, isMe ? opponentName : "você")}<br>`
            : "";

        if (isMe) {

            let message = confusionSelfPrefix + confusionOpponentPrefix;

            message += MiasmaService.buildWeakenedMessage(entry, "você", opponentName);

            if (entry.critical) {
                message += `<span class="combat-critical">Golpe Crítico!</span><br>`;
            }

            message += entry.confusionOutcome === "self"
                ? `Você causou <strong>${entry.damage}</strong> de dano em si mesmo.`
                : `Você causou <strong>${entry.damage}</strong> de dano.`;

            if (entry.lifeSteal > 0) {
                message += `<br><span class="combat-life-steal">Life Steal!</span> Recuperou <strong>${entry.lifeSteal}</strong> HP.`;
            }

            if (entry.mimicBonus > 0) {
                message += `<br>${MimicService.buildMessage(entry.mimicBonus, { opponentName })}`;
            }

            if (entry.miasmaProc) {
                message += `<br>${MiasmaService.buildProcMessage(opponentName, entry)}`;
            }

            if (entry.confusionProc) {
                message += `<br>${ConfusionService.buildProcMessage(opponentName)}`;
            }

            if (entry.paralysisProc) {
                message += `<br>${ParalysisService.buildProcMessage(opponentName)}`;
            }

            if (entry.doubleStrikeProc) {
                message += `<br>${DoubleStrikeService.buildMessage(opponentName)}`;
            }

            if (entry.gravityArmorHalved) {
                message += `<br>${GravityService.buildArmorHalfMessage(opponentName)}`;
            }

            if (entry.gravityProc) {
                message += `<br>${GravityService.buildProcMessage(opponentName, entry)}`;
            }

            return message;

        }

        let hitMessage = confusionSelfPrefix + confusionOpponentPrefix;

        hitMessage += MiasmaService.buildWeakenedMessage(entry, opponentName, "você");

        if (entry.critical) {
            hitMessage += `<span class="combat-critical">Ataque Crítico!</span><br>`;
        }

        hitMessage += entry.confusionOutcome === "self"
            ? ` ${opponentName} causou <strong>${entry.damage}</strong> de dano nele mesmo.`
            : ` Você recebeu um golpe de <strong>${opponentName}</strong>, <strong>${entry.damage}</strong> de dano.`;

        if (entry.absorbed > 0) {
            hitMessage += `<br><span class="combat-absorption">Absorção!</span> Absorveu <strong>${entry.absorbed}</strong> do golpe.`;
        }

        if (entry.mimicBonus > 0) {
            // Aqui é o OPONENTE que fez a Imitação copiando OS SEUS
            // status — subject é quem agiu, opponentName é de quem foi
            // copiado (ver MimicService.buildMessage).
            hitMessage += `<br>${MimicService.buildMessage(entry.mimicBonus, { subject: opponentName, opponentName: "você" })}`;
        }

        if (entry.miasmaProc) {
            hitMessage += `<br>${MiasmaService.buildProcMessage("você", entry)}`;
        }

        if (entry.confusionProc) {
            hitMessage += `<br>${ConfusionService.buildProcMessage("você")}`;
        }

        if (entry.paralysisProc) {
            hitMessage += `<br>${ParalysisService.buildProcMessage("você")}`;
        }

        if (entry.doubleStrikeProc) {
            hitMessage += `<br>${DoubleStrikeService.buildMessage("você")}`;
        }

        if (entry.gravityArmorHalved) {
            hitMessage += `<br>${GravityService.buildArmorHalfMessage("você")}`;
        }

        if (entry.gravityProc) {
            hitMessage += `<br>${GravityService.buildProcMessage("você", entry)}`;
        }

        return hitMessage;

    }

    buildToastType(entry) {

        const isMe = (entry.turn === "a") === this.isPlayerA;

        let type = isMe ? "player" : "enemy";

        if (entry.dodged) {
            type += " dodge";
        } else if (entry.petBite || entry.burn) {
            type += " pet-bite";
        } else if (isMe && entry.lifeSteal > 0) {
            type = "lifeSteal player";
        } else if (!isMe && entry.absorbed > 0) {
            type = "absorption enemy";
        } else if (entry.critical) {
            type += " critico";
        }

        return type;

    }

    // Versões do texto/tipo de mensagem pro 2x2 — os nomes envolvidos
    // vêm de attackerId/targetId (não mais "a"/"b" genérico), e "isMe"
    // agora compara o id de verdade, não o lado inteiro do combate.
    buildTeamAttackMessage(entry, nameOf, petNameOf) {

        const isMe = entry.attackerId === PvpLobbyService.playerId;
        const targetIsMe = entry.targetId === PvpLobbyService.playerId;
        const attackerName = nameOf(entry.attackerId);
        const targetName = nameOf(entry.targetId);

        if (entry.burn) {
            const petName = petNameOf(entry.attackerId);
            return BoitataBurn.buildMessage({
                petName: isMe ? petName : `${petName} de ${attackerName}`,
                targetName: targetIsMe ? "você" : targetName,
                damage: entry.damage,
                first: entry.burnStart
            });
        }

        // Confusão "errou o ataque" — antes mesmo da esquiva, tem
        // mensagem própria (ver ConfusionService.js).
        if (entry.confusionOutcome === "miss") {
            return ConfusionService.buildOutcomeMessage("miss", isMe ? "Você" : attackerName);
        }

        // Paralisia "perdeu o ataque" — antes mesmo da esquiva, tem
        // mensagem própria (ver ParalysisService.js).
        if (entry.paralyzed) {
            return ParalysisService.buildOutcomeMessage(isMe ? "Você" : attackerName);
        }

        // Gravidade Máxima "perdeu o turno" — mesma prioridade da
        // Paralisia acima (ver GravityService.js).
        if (entry.gravityStunned) {
            return GravityService.buildStunMessage(isMe ? "Você" : attackerName);
        }

        if (entry.dodged) {
            if (targetIsMe) return `<span class="combat-dodge">Você esquivou do ataque de ${attackerName}!</span>`;
            return `<span class="combat-dodge">${targetName} esquivou do ataque de ${attackerName}!</span>`;
        }

        if (entry.revive) {
            return isMe
                ? `<span class="combat-pet-bite">${petNameOf(entry.attackerId)}</span> reviveu você com <strong>${entry.heal}</strong> HP!`
                : `<span class="combat-pet-bite">${petNameOf(entry.attackerId)}</span> reviveu ${attackerName} com <strong>${entry.heal}</strong> HP!`;
        }

        if (entry.petBite) {
            const petLabel = isMe ? "Seu pet" : `Pet de ${attackerName}`;
            const healTargetId = entry.healedIds?.[0];
            const healTargetIsMe = healTargetId === PvpLobbyService.playerId;
            const healTargetName = healTargetId ? (healTargetIsMe ? "você" : nameOf(healTargetId)) : null;
            const damage = entry.damage > 0
                ? (targetIsMe ? ` Você recebeu <strong>${entry.damage}</strong> de dano.` : ` Causou <strong>${entry.damage}</strong> de dano em ${targetName}.`)
                : "";
            const heal = entry.heal > 0 && healTargetName ? ` Curou ${healTargetName} em <strong>${entry.heal}</strong> HP.` : "";
            return `<span class="combat-pet-bite">${petLabel} agiu!</span>${damage}${heal}`;
        }

        // Golpe Duplo do Samurai: segunda entrada própria no log, mesmo
        // dano repetido (ver DoubleStrikeService.js) — sem crítico/
        // absorção/life steal de novo, mensagem própria em vez da linha
        // normal de dano.
        if (entry.doubleStrike) {
            const damageLabel = targetIsMe
                ? `Você recebeu <strong>${entry.damage}</strong> de dano.`
                : `Causou <strong>${entry.damage}</strong> de dano em ${targetName}.`;
            return `${DoubleStrikeService.buildMessage(targetIsMe ? "você" : targetName)} ${damageLabel}`;
        }

        // Confusão "ataca a si mesmo" ou "acerta o alvo mesmo confuso" —
        // prefixo próprio antes da linha de dano normal (ver
        // CombatEngine.createAttackMessage, mesmo padrão).
        const confusionSelfPrefix = entry.confusionOutcome === "self"
            ? `${ConfusionService.buildOutcomeMessage("self", isMe ? "Você" : attackerName)}<br>`
            : "";
        const confusionOpponentPrefix = entry.confusionOutcome === "opponent"
            ? `${ConfusionService.buildOutcomeMessage("opponent", isMe ? "Você" : attackerName, targetIsMe ? "você" : targetName)}<br>`
            : "";

        if (isMe) {

            let message = confusionSelfPrefix + confusionOpponentPrefix;

            message += MiasmaService.buildWeakenedMessage(entry, "você", targetName);

            if (entry.critical) {
                message += `<span class="combat-critical">Golpe Crítico!</span><br>`;
            }

            message += entry.confusionOutcome === "self"
                ? `Você causou <strong>${entry.damage}</strong> de dano em si mesmo.`
                : `Você causou <strong>${entry.damage}</strong> de dano em <strong>${targetName}</strong>.`;

            if (entry.lifeSteal > 0) {
                message += `<br><span class="combat-life-steal">Life Steal!</span> Recuperou <strong>${entry.lifeSteal}</strong> HP.`;
            }

            if (entry.mimicBonus > 0) {
                message += `<br>${MimicService.buildMessage(entry.mimicBonus, { opponentName: targetName })}`;
            }

            if (entry.miasmaProc) {
                message += `<br>${MiasmaService.buildProcMessage(targetName, entry)}`;
            }

            if (entry.confusionProc) {
                message += `<br>${ConfusionService.buildProcMessage(targetName)}`;
            }

            if (entry.paralysisProc) {
                message += `<br>${ParalysisService.buildProcMessage(targetName)}`;
            }

            if (entry.doubleStrikeProc) {
                message += `<br>${DoubleStrikeService.buildMessage(targetName)}`;
            }

            if (entry.gravityArmorHalved) {
                message += `<br>${GravityService.buildArmorHalfMessage(targetName)}`;
            }

            if (entry.gravityProc) {
                message += `<br>${GravityService.buildProcMessage(targetName, entry)}`;
            }

            return message;

        }

        if (targetIsMe) {

            let hitMessage = confusionSelfPrefix + confusionOpponentPrefix;

            hitMessage += MiasmaService.buildWeakenedMessage(entry, attackerName, "você");

            if (entry.critical) {
                hitMessage += `<span class="combat-critical">Ataque Crítico!</span><br>`;
            }

            hitMessage += entry.confusionOutcome === "self"
                ? ` ${attackerName} causou <strong>${entry.damage}</strong> de dano nele mesmo.`
                : ` Você recebeu um golpe de <strong>${attackerName}</strong>, <strong>${entry.damage}</strong> de dano.`;

            if (entry.absorbed > 0) {
                hitMessage += `<br><span class="combat-absorption">Absorção!</span> Absorveu <strong>${entry.absorbed}</strong> do golpe.`;
            }

            if (entry.mimicBonus > 0) {
                hitMessage += `<br>${MimicService.buildMessage(entry.mimicBonus, { subject: attackerName, opponentName: "você" })}`;
            }

            if (entry.miasmaProc) {
                hitMessage += `<br>${MiasmaService.buildProcMessage("você", entry)}`;
            }

            if (entry.confusionProc) {
                hitMessage += `<br>${ConfusionService.buildProcMessage("você")}`;
            }

            if (entry.paralysisProc) {
                hitMessage += `<br>${ParalysisService.buildProcMessage("você")}`;
            }

            if (entry.doubleStrikeProc) {
                hitMessage += `<br>${DoubleStrikeService.buildMessage("você")}`;
            }

            if (entry.gravityArmorHalved) {
                hitMessage += `<br>${GravityService.buildArmorHalfMessage("você")}`;
            }

            if (entry.gravityProc) {
                hitMessage += `<br>${GravityService.buildProcMessage("você", entry)}`;
            }

            return hitMessage;

        }

        // Ataque entre outras duas pessoas que não sou eu (ex: meu
        // aliado atacando, ou o inimigo atacando meu aliado).
        const crit = entry.critical ? ` <span class="pvp-log-critical">(Crítico!)</span>` : "";
        const mimic = entry.mimicBonus > 0 ? ` <span class="combat-mimic">(Imitação!)</span>` : "";
        const miasma = entry.miasmaProc ? ` <span class="combat-miasma">(Miasma!)</span>` : "";
        const confusion = entry.confusionProc || entry.confusionOutcome
            ? ` <span class="combat-confusion">(Confusão!)</span>`
            : "";
        const paralysis = entry.paralysisProc
            ? ` <span class="combat-paralysis">(Paralisia!)</span>`
            : "";
        const doubleStrike = entry.doubleStrikeProc
            ? ` <span class="combat-double-strike">(Golpe Duplo!)</span>`
            : "";
        const gravityArmorHalved = entry.gravityArmorHalved
            ? ` <span class="combat-gravity">(Gravidade Máxima: Armadura pela metade!)</span>`
            : "";
        const gravity = entry.gravityProc
            ? ` <span class="combat-gravity">(Pressão Gravitacional ${entry.gravityStacks}/${GRAVITY_STACK_THRESHOLD}!)</span>`
            : "";
        if (entry.confusionOutcome === "self") {
            return `${attackerName} se atacou sem querer, causando ${entry.damage} de dano${crit}${confusion}.`;
        }
        return `${attackerName} causou ${entry.damage} de dano em ${targetName}${crit}${mimic}${miasma}${confusion}${paralysis}${doubleStrike}${gravityArmorHalved}${gravity}.`;

    }

    buildTeamToastType(entry) {

        const isMe = entry.attackerId === PvpLobbyService.playerId;
        const targetIsMe = entry.targetId === PvpLobbyService.playerId;
        const isAlly = this.getMyTeamCombatants().some(c => c.id === entry.attackerId);

        let type = isAlly ? "player" : "enemy";

        if (entry.dodged) {
            type += " dodge";
        } else if (entry.petBite || entry.burn) {
            type += " pet-bite";
        } else if (isMe && entry.lifeSteal > 0) {
            type = "lifeSteal player";
        } else if (targetIsMe && entry.absorbed > 0) {
            type = "absorption enemy";
        } else if (entry.critical) {
            // Crítico de qualquer um (eu, aliado ou inimigo) usa a
            // caixa de crítico — o lado da tela continua vindo de type.
            type += " critico";
        }

        return type;

    }

    // Anima o resultado já calculado, turno por turno, exatamente como
    // um combate normal — barra de vida do jogador some/some do
    // adversário reagem a cada golpe, com a mesma caixa de mensagem
    // (CombatToast). A vida real do personagem, fora da arena, nunca
    // é afetada de verdade — é restaurada ao valor de antes assim que
    // a luta acaba, ganhando ou perdendo.
    async playBattleLog(log) {

        const originalHP = this.game.player.currentHP;
        const battleStartTime = Date.now();

        for (const entry of log) {

            const isMe = (entry.turn === "a") === this.isPlayerA;

            if (!entry.dodged) {

                if (isMe) {

                    this.opponentHP = Math.max(0, this.opponentHP - entry.damage);

                } else {

                    this.game.player.currentHP = Math.max(0, this.game.player.currentHP - entry.damage);

                    HitFlash.play(".hud-avatar");

                }

                if (entry.lifeSteal > 0 && isMe) {
                    this.game.player.currentHP = Math.min(
                        this.game.player.maxHP,
                        this.game.player.currentHP + entry.lifeSteal
                    );
                    HealFlash.play(".hud-avatar");
                }

                // Mordida do pet com cura (ex: Duende) — sempre cura quem
                // MORDEU, não quem apanhou (mesmo lado do Roubo de Vida).
                if (entry.heal > 0) {
                    if (isMe) {
                        this.game.player.currentHP = Math.min(this.game.player.maxHP, this.game.player.currentHP + entry.heal);
                        HealFlash.play(".hud-avatar");
                    } else {
                        const opponentMax = this.currentOpponentSnapshot()?.maxHP ?? this.opponentHP;
                        this.opponentHP = Math.min(opponentMax, this.opponentHP + entry.heal);
                        HealFlash.play(".combat-monster");
                    }
                }

            }

            this.game.hudScreen.playerHUD.updateHP?.();
            this.game.hudScreen.monsterHUD.updateHP();

            const speed = this.getBattleSpeedMultiplier(battleStartTime);

            await CombatToast.show(this.buildAttackMessage(entry), this.buildToastType(entry), 2 + MiasmaService.extraToastSeconds(entry) + MimicService.extraToastSeconds(entry) + ConfusionService.extraToastSeconds(entry) + ParalysisService.extraToastSeconds(entry) + DoubleStrikeService.extraToastSeconds(entry) + GravityService.extraToastSeconds(entry), speed);

            await this.sleep(500 / speed);

        }

        this.game.player.currentHP = originalHP;
        this.game.hudScreen.playerHUD.updateHP?.();

    }

    // Mesma ideia do playBattleLog, mas pro 2x2: precisa atualizar a
    // vida de um combatente específico (attackerId/targetId), não só
    // "eu" e "o oponente" — e a barrinha de vida embaixo do retrato
    // certo, não a MonsterHUD genérica.
    async playTeamBattleLog(log, aborted = () => false) {

        const allCombatants = [...this.getMyTeamCombatants(), ...this.getEnemyTeamCombatants()];
        const nameOf = (id) => escapeHtml(allCombatants.find(c => c.id === id)?.name ?? "???");
        const petNameOf = (id) => escapeHtml(allCombatants.find(c => c.id === id)?.petName ?? "O pet");
        const originalHP = this.game.player.currentHP;
        const battleStartTime = Date.now();

        try {
            for (const entry of log) {

                if (aborted()) return;

                if (!entry.dodged) {

                    this.teamHP[entry.targetId] = Math.max(0, (this.teamHP[entry.targetId] ?? 0) - entry.damage);

                    // Só pisca quando entrou dano de verdade (mordida de pet
                    // que só cura não é golpe).
                    if (entry.damage > 0) this.flashTeamCombatantHit(entry.targetId);

                    if (entry.targetId === PvpLobbyService.playerId) {
                        this.game.player.currentHP = this.teamHP[entry.targetId];
                    }

                    if (entry.lifeSteal > 0) {

                        const attackerMax = allCombatants.find(c => c.id === entry.attackerId)?.maxHP ?? 0;

                        this.teamHP[entry.attackerId] = Math.min(
                            attackerMax,
                            (this.teamHP[entry.attackerId] ?? 0) + entry.lifeSteal
                        );

                        if (entry.attackerId === PvpLobbyService.playerId) {
                            this.game.player.currentHP = this.teamHP[entry.attackerId];
                        }

                        this.flashTeamCombatantHeal(entry.attackerId);

                    }

                    // Cura da habilidade do pet (ex: Duende) — só o alvo
                    // sorteado em healedIds (ver simulateTeam()), nunca o
                    // time inteiro.
                    if (entry.heal > 0 && entry.healedIds?.length) {

                        for (const id of entry.healedIds) {

                            const maxHp = allCombatants.find(c => c.id === id)?.maxHP ?? 0;

                            this.teamHP[id] = Math.min(maxHp, (this.teamHP[id] ?? 0) + entry.heal);

                            if (id === PvpLobbyService.playerId) {
                                this.game.player.currentHP = this.teamHP[id];
                            }

                            this.flashTeamCombatantHeal(id);

                        }

                    }

                    // Atualiza os cartões de vida (aliado e inimigos) de
                    // quem participou do golpe.
                    [entry.attackerId, entry.targetId, ...(entry.healedIds ?? [])]
                        .forEach(id => this.updateTeamCard(id));

                }

                this.game.hudScreen.playerHUD.updateHP?.();

                const speed = this.getBattleSpeedMultiplier(battleStartTime);

                await CombatToast.show(this.buildTeamAttackMessage(entry, nameOf, petNameOf), this.buildTeamToastType(entry), 2 + MiasmaService.extraToastSeconds(entry) + MimicService.extraToastSeconds(entry) + ConfusionService.extraToastSeconds(entry) + ParalysisService.extraToastSeconds(entry) + DoubleStrikeService.extraToastSeconds(entry) + GravityService.extraToastSeconds(entry), speed);

                await this.sleep(450 / speed);

            }

        } finally {

            // Termina, dá erro ou o jogador sai no meio: a vida real do
            // personagem sempre volta ao valor de antes da luta.
            this.game.player.currentHP = originalHP;
            this.game.hudScreen.playerHUD.updateHP?.();

        }

    }

    // Pisca quem levou dano no 2x2: eu (avatar do HUD), o cartão do
    // aliado/inimigo e, no caso do inimigo, também o retrato na arena.
    flashTeamCombatantHit(combatantId) {

        if (combatantId === PvpLobbyService.playerId) {
            HitFlash.play(".hud-avatar");
            return;
        }

        HitFlash.play(`.pvp2v2-card[data-combatant-id="${CSS.escape(combatantId)}"] .hud-avatar`);

        const isEnemy = this.getEnemyTeamCombatants().some(c => c.id === combatantId);

        if (isEnemy) {
            HitFlash.play(`.pvp2v2-portrait-slot[data-combatant-id="${CSS.escape(combatantId)}"] img`);
        }

    }

    // Pisca quem foi curado no 2x2: eu (avatar do HUD), o cartão do
    // aliado/inimigo e, no caso do inimigo, também o retrato na arena.
    flashTeamCombatantHeal(combatantId) {

        if (combatantId === PvpLobbyService.playerId) {
            HealFlash.play(".hud-avatar");
            return;
        }

        HealFlash.play(`.pvp2v2-card[data-combatant-id="${CSS.escape(combatantId)}"] .hud-avatar`);

        const isEnemy = this.getEnemyTeamCombatants().some(c => c.id === combatantId);

        if (isEnemy) {
            HealFlash.play(`.pvp2v2-portrait-slot[data-combatant-id="${CSS.escape(combatantId)}"] img`);
        }

    }

    refresh() {
        this.game.hudScreen.refreshCurrentView();
    }

    registerEvents(container) {

        if (!PvpView.closeDelegationBound) {

            document.addEventListener("click", (event) => {

                if (!event.target.closest(".pvp-close")) return;

                this.combatInfoModal.hide();
                this.game.hudScreen.changeView("");

            });

            PvpView.closeDelegationBound = true;

        }

        container.querySelector(".pvp-lobby-enter-button")?.addEventListener("click", () => {
            this.modeChoiceModal.show({
                onFree: () => this.enterFreeMode(),
                onRanked: () => this.enterRankedLocked()
            });
        });

        container.querySelector(".pvp-lobby-back-button")?.addEventListener("click", () => {
            this.backToLobby();
        });

        container.querySelectorAll(".pvp-mode-btn").forEach(button => {
            button.addEventListener("click", () => {
                if (button.disabled) return;
                this.mode = button.dataset.mode;
                this.state = "idle";
                this.refresh();
            });
        });

        container.querySelector(".pvp-join-button")?.addEventListener("click", () => {
            this.joinQueue();
        });

        container.querySelector(".pvp-cancel-button")?.addEventListener("click", () => {
            this.cancelQueue();
        });

        container.querySelector(".pvp-back-button")?.addEventListener("click", () => {
            this.combatInfoModal.hide();
            this.game.hudScreen.changeView("");
        });

        container.querySelector(".pvp-combat-info-button")?.addEventListener("click", () => {

            // 1x1 não tem id real de combatente no log (ver
            // PvpCombatService.simulate) — "a"/"b" já servem de id ali,
            // e isPlayerA diz qual dos dois sou eu. O 2x2 usa o id de
            // verdade (PvpLobbyService.playerId), igual o Cooperativo.
            const playerId = this.isTeamMode()
                ? PvpLobbyService.playerId
                : (this.isPlayerA ? "a" : "b");

            const info = buildCombatInfo(this.combatResult.log, playerId);
            const timeline = buildCombatTimeline(this.combatResult.log, playerId);

            this.combatInfoModal.show(info, timeline);

        });

    }

}
