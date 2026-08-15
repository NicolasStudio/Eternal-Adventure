import PvpLobbyService from "../services/PvpLobbyService.js";
import PvpCombatService from "../services/PvpCombatService.js";
import Toast from "../ui/components/Toast.js";
import CombatToast from "../combat/CombatToast.js";
import dungeons from "../data/dungeons.js";

// Só os chefes "normais" (não o final secreto, que fica de fora da
// cerimônia de propósito — não faz sentido revelar aquele cenário
// antes da hora numa luta de PVP comum).
const BOSS_DUNGEONS = dungeons.filter(dungeon => dungeon.boss && !dungeon.hidden);

export default class PvpView {

    constructor(game) {
        this.game = game;
        this.state = "mode"; // mode | idle | searching | found | ceremony | battle | result
        this.mode = null; // "1v1" | "2v2"
        this.opponentWaiting = false;
        this.matchData = null;
        this.matchId = null;
        this.combatResult = null;
        this.isPlayerA = null; // 1v1
        this.myTeamKey = null; // 2v2: "a" | "b"
        this.chosenBossDungeon = null;
        this.opponentHP = null; // 1v1
        this.teamHP = {}; // 2v2: { [combatantId]: currentHP } pros 4
    }

    get player() {
        return this.game.player;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
                    <button class="dungeon-close pvp-close">
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
            case "idle": return this.renderIdle();
            case "searching": return this.renderSearching();
            case "found": return this.mode === "2v2" ? this.renderFoundTeam() : this.renderFound();
            case "result": return this.mode === "2v2" ? this.renderResultTeam() : this.renderResult();
            default: return this.renderModeSelect();
        }
    }

    renderModeSelect() {
        return `
            <div class="pvp-mode-select">
                <i class="fa-solid fa-swords pvp-icon"></i>
                <p class="pvp-description">Escolha o modo de combate:</p>
                <div class="pvp-mode-options">
                    <button class="pvp-mode-btn" data-mode="1v1">
                        <span class="pvp-mode-label">1x1</span>
                        <span class="pvp-mode-sub">Um contra um</span>
                    </button>
                    <button class="pvp-mode-btn" data-mode="2v2">
                        <span class="pvp-mode-label">2x2</span>
                        <span class="pvp-mode-sub">Dois contra dois</span>
                    </button>
                </div>
            </div>
        `;
    }

    renderIdle() {
        return `
            <div class="pvp-idle">
                <i class="fa-solid fa-swords pvp-icon"></i>
                <p class="pvp-description">
                    ${this.mode === "2v2"
                        ? "Entre na fila e você será agrupado automaticamente com outro jogador contra uma dupla adversária, decidido pelos status de cada personagem no momento da partida."
                        : "Entre na fila e enfrente outro jogador em um combate automático, decidido pelos status do seu personagem no momento da partida."}
                </p>
                <button class="pvp-join-button">Entrar na Fila</button>
            </div>
        `;
    }

    renderSearching() {
        return `
            <div class="pvp-searching">
                <div class="pvp-spinner"></div>
                <p class="pvp-status-text">
                    ${this.opponentWaiting
                        ? (this.mode === "2v2" ? "Jogadores encontrados, preparando a partida..." : "Oponente encontrado, preparando a partida...")
                        : (this.mode === "2v2" ? "Procurando outros jogadores..." : "Procurando um oponente...")}
                </p>
                <button class="pvp-cancel-button">Cancelar</button>
            </div>
        `;
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
        const teamA = Object.values(this.matchData.teamA);
        const teamB = Object.values(this.matchData.teamB);
        return `
            <div class="pvp-found">
                <h3 class="pvp-found-title">Partida Encontrada!</h3>
                <div class="pvp-versus pvp-versus-team">
                    <div class="pvp-team-column">
                        ${teamA.map(c => `<span class="pvp-fighter-name">${c.name}</span>`).join("")}
                    </div>
                    <span class="pvp-vs">VS</span>
                    <div class="pvp-team-column">
                        ${teamB.map(c => `<span class="pvp-fighter-name">${c.name}</span>`).join("")}
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

    // Chamado pelo HudScreen enquanto this.game.hudScreen.inPvpCombat
    // estiver true — mesmo espírito do DungeonHeader durante combate PVE.
    renderArenaHeader() {

        if (this.mode === "2v2") {
            const enemyTeam = this.getEnemyTeamCombatants();
            const names = enemyTeam.map(c => c.name).join(" & ");
            return `
                <section class="pvp2v2-header-inline">
                    <h2 class="pvp2v2-title">Arena PVP · 2x2</h2>
                    <span class="pvp2v2-subtitle">vs ${names}</span>
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

        if (this.mode === "2v2") {

            const enemyTeam = this.getEnemyTeamCombatants();

            return `
                <section class="pvp2v2-window">
                    <div class="pvp2v2-arena">
                        <div class="pvp2v2-portraits">
                            ${enemyTeam.map(c => `
                                <div class="pvp2v2-portrait-slot" data-combatant-id="${c.id}">
                                    <img src="${c.image ?? ""}" alt="${c.name}">
                                    <span class="pvp2v2-portrait-name">${c.name}</span>
                                    <div class="pvp2v2-mini-hp">
                                        <div class="pvp2v2-mini-hp-fill" id="pvp-hp-${c.id}" style="width:100%;"></div>
                                    </div>
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
                <button class="pvp-back-button">Voltar</button>
            </div>
        `;

    }

    renderResultTeam() {

        const teamA = Object.values(this.matchData.teamA);
        const teamB = Object.values(this.matchData.teamB);
        const iWon = this.combatResult.winner === this.myTeamKey;

        const allCombatants = [...teamA, ...teamB];
        const nameOf = (id) => allCombatants.find(c => c.id === id)?.name ?? "???";

        return `
            <div class="pvp-result">
                <h3 class="pvp-result-title ${iWon ? "win" : "lose"}">
                    ${iWon ? "Vitória!" : "Derrota"}
                </h3>
                <div class="pvp-versus pvp-versus-team">
                    <div class="pvp-team-column ${this.combatResult.winner === "a" ? "winner" : ""}">
                        ${teamA.map(c => `<span class="pvp-fighter-name">${c.name}</span>`).join("")}
                    </div>
                    <span class="pvp-vs">VS</span>
                    <div class="pvp-team-column ${this.combatResult.winner === "b" ? "winner" : ""}">
                        ${teamB.map(c => `<span class="pvp-fighter-name">${c.name}</span>`).join("")}
                    </div>
                </div>
                <div class="pvp-log">
                    ${this.combatResult.log.slice(-12).map(entry => this.renderLogLineTeam(entry, nameOf)).join("")}
                </div>
                <button class="pvp-back-button">Voltar</button>
            </div>
        `;

    }

    renderLogLine(entry, combatantA, combatantB) {
        const name = entry.turn === "a" ? combatantA.name : combatantB.name;
        if (entry.dodged) {
            return `<div class="pvp-log-line pvp-log-dodge">${name} esquivou!</div>`;
        }
        const crit = entry.critical ? " <strong>(Crítico!)</strong>" : "";
        const steal = entry.lifeSteal > 0 ? ` <span class="pvp-log-heal">(+${entry.lifeSteal} HP roubado)</span>` : "";
        return `<div class="pvp-log-line">${name} causou ${entry.damage} de dano${crit}${steal}</div>`;
    }

    renderLogLineTeam(entry, nameOf) {
        const attackerName = nameOf(entry.attackerId);
        const targetName = nameOf(entry.targetId);
        if (entry.dodged) {
            return `<div class="pvp-log-line pvp-log-dodge">${targetName} esquivou de ${attackerName}!</div>`;
        }
        const crit = entry.critical ? " <strong>(Crítico!)</strong>" : "";
        const steal = entry.lifeSteal > 0 ? ` <span class="pvp-log-heal">(+${entry.lifeSteal} HP roubado)</span>` : "";
        return `<div class="pvp-log-line">${attackerName} causou ${entry.damage} de dano em ${targetName}${crit}${steal}</div>`;
    }

    currentOpponentSnapshot() {
        if (!this.matchData) return null;
        return this.isPlayerA ? this.matchData.combatantB : this.matchData.combatantA;
    }

    getMyTeamCombatants() {
        if (!this.matchData) return [];
        const team = this.myTeamKey === "a" ? this.matchData.teamA : this.matchData.teamB;
        return Object.values(team ?? {});
    }

    getEnemyTeamCombatants() {
        if (!this.matchData) return [];
        const team = this.myTeamKey === "a" ? this.matchData.teamB : this.matchData.teamA;
        return Object.values(team ?? {});
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

    async joinQueue() {

        this.state = "searching";
        this.opponentWaiting = false;
        this.refresh();

        const combatant = PvpCombatService.snapshotCombatant(this.player);

        await PvpLobbyService.joinQueue(
            this.mode,
            combatant,
            (matchData, matchId) => this.onMatchFound(matchData, matchId),
            (waiting) => {
                this.opponentWaiting = waiting;
                if (this.state === "searching") this.refresh();
            }
        );

    }

    async cancelQueue() {
        await PvpLobbyService.leaveQueue();
        this.state = "idle";
        this.refresh();
    }

    async onMatchFound(matchData, matchId) {

        this.matchData = matchData;
        this.matchId = matchId;

        if (this.mode === "2v2") {
            this.myTeamKey = Object.keys(matchData.teamA).includes(PvpLobbyService.playerId) ? "a" : "b";
        } else {
            this.isPlayerA = matchData.combatantA.id === PvpLobbyService.playerId;
        }

        this.state = "found";
        this.refresh();

        await this.sleep(1500);

        // A arena é sorteada, mas com a MESMA semente da partida — os
        // jogadores todos veem exatamente o mesmo cenário, sem
        // precisar combinar nada entre si.
        const chosenIndex = Math.abs(matchData.seed) % BOSS_DUNGEONS.length;
        this.chosenBossDungeon = BOSS_DUNGEONS[chosenIndex];

        this.game.hudScreen.inPvpCombat = true;
        this.state = "ceremony";
        this.refresh();

        await this.runCeremonyAnimation(chosenIndex);

        this.game.hudScreen.setBackground(this.chosenBossDungeon.background);

        if (this.mode === "2v2") {
            await this.startTeamBattle();
        } else {
            await this.startSoloBattle();
        }

        await this.sleep(900);

        this.game.hudScreen.inPvpCombat = false;
        this.state = "result";
        this.refresh();

        PvpLobbyService.cleanupMatch(matchId);

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

    }

    async startTeamBattle() {

        const teamA = Object.values(this.matchData.teamA);
        const teamB = Object.values(this.matchData.teamB);

        const result = PvpCombatService.simulateTeam(teamA, teamB, this.matchData.seed);
        this.combatResult = result;

        this.teamHP = {};
        [...teamA, ...teamB].forEach(c => { this.teamHP[c.id] = c.maxHP; });

        this.state = "battle";
        this.refresh();

        const enemyNames = this.getEnemyTeamCombatants().map(c => c.name).join(" e ");
        await CombatToast.show(`Partida contra ${enemyNames} começou!`, "system", 2);

        await this.playTeamBattleLog(result.log);

        const iWon = result.winner === this.myTeamKey;
        await CombatToast.show(iWon ? "Sua dupla venceu!" : "Sua dupla foi derrotada!", "system", 2);

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

        if (entry.dodged) {
            return isMe
                ? `<span class="combat-dodge">${opponentName} esquivou do seu ataque!</span>`
                : `<span class="combat-dodge">Você esquivou do ataque!</span>`;
        }

        if (isMe) {

            let message = "";

            if (entry.critical) {
                message += `<span class="combat-critical">Golpe Crítico!</span><br>`;
            }

            message += `Você causou <strong>${entry.damage}</strong> de dano.`;

            if (entry.lifeSteal > 0) {
                message += `<br><span class="combat-life-steal">Life Steal!</span> Recuperou <strong>${entry.lifeSteal}</strong> HP.`;
            }

            return message;

        }

        if (entry.critical) {
            return `<span class="combat-critical">Ataque Crítico!</span><br> Você recebeu um golpe de <strong>${opponentName}</strong>, <strong>${entry.damage}</strong> de dano.`;
        }

        return `Você recebeu um golpe de <strong>${opponentName}</strong>, <strong>${entry.damage}</strong> de dano.`;

    }

    buildToastType(entry) {

        const isMe = (entry.turn === "a") === this.isPlayerA;

        let type = isMe ? "player" : "enemy";

        if (entry.dodged) {
            type += " dodge";
        } else if (isMe) {
            if (entry.lifeSteal > 0) type = "lifeSteal player";
            else if (entry.critical) type = "critico player";
        }

        return type;

    }

    // Versões do texto/tipo de mensagem pro 2x2 — os nomes envolvidos
    // vêm de attackerId/targetId (não mais "a"/"b" genérico), e "isMe"
    // agora compara o id de verdade, não o lado inteiro do combate.
    buildTeamAttackMessage(entry, nameOf) {

        const isMe = entry.attackerId === PvpLobbyService.playerId;
        const targetIsMe = entry.targetId === PvpLobbyService.playerId;
        const attackerName = nameOf(entry.attackerId);
        const targetName = nameOf(entry.targetId);

        if (entry.dodged) {
            if (targetIsMe) return `<span class="combat-dodge">Você esquivou do ataque de ${attackerName}!</span>`;
            return `<span class="combat-dodge">${targetName} esquivou do ataque de ${attackerName}!</span>`;
        }

        if (isMe) {

            let message = "";

            if (entry.critical) {
                message += `<span class="combat-critical">Golpe Crítico!</span><br>`;
            }

            message += `Você causou <strong>${entry.damage}</strong> de dano em <strong>${targetName}</strong>.`;

            if (entry.lifeSteal > 0) {
                message += `<br><span class="combat-life-steal">Life Steal!</span> Recuperou <strong>${entry.lifeSteal}</strong> HP.`;
            }

            return message;

        }

        if (targetIsMe) {

            if (entry.critical) {
                return `<span class="combat-critical">Ataque Crítico!</span><br> Você recebeu um golpe de <strong>${attackerName}</strong>, <strong>${entry.damage}</strong> de dano.`;
            }

            return `Você recebeu um golpe de <strong>${attackerName}</strong>, <strong>${entry.damage}</strong> de dano.`;

        }

        // Ataque entre outras duas pessoas que não sou eu (ex: meu
        // aliado atacando, ou o inimigo atacando meu aliado).
        const crit = entry.critical ? " (Crítico!)" : "";
        return `${attackerName} causou ${entry.damage} de dano em ${targetName}${crit}.`;

    }

    buildTeamToastType(entry) {

        const isMe = entry.attackerId === PvpLobbyService.playerId;
        const isAlly = this.getMyTeamCombatants().some(c => c.id === entry.attackerId);

        let type = isAlly ? "player" : "enemy";

        if (entry.dodged) {
            type += " dodge";
        } else if (isMe) {
            if (entry.lifeSteal > 0) type = "lifeSteal player";
            else if (entry.critical) type = "critico player";
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

        for (const entry of log) {

            const isMe = (entry.turn === "a") === this.isPlayerA;

            if (!entry.dodged) {

                if (isMe) {
                    this.opponentHP = Math.max(0, this.opponentHP - entry.damage);
                } else {
                    this.game.player.currentHP = Math.max(0, this.game.player.currentHP - entry.damage);
                }

                if (entry.lifeSteal > 0 && isMe) {
                    this.game.player.currentHP = Math.min(
                        this.game.player.maxHP,
                        this.game.player.currentHP + entry.lifeSteal
                    );
                }

            }

            this.game.hudScreen.playerHUD.updateHP?.();
            this.game.hudScreen.monsterHUD.updateHP();

            await CombatToast.show(this.buildAttackMessage(entry), this.buildToastType(entry), 2);

            await this.sleep(500);

        }

        this.game.player.currentHP = originalHP;
        this.game.hudScreen.playerHUD.updateHP?.();

    }

    // Mesma ideia do playBattleLog, mas pro 2x2: precisa atualizar a
    // vida de um combatente específico (attackerId/targetId), não só
    // "eu" e "o oponente" — e a barrinha de vida embaixo do retrato
    // certo, não a MonsterHUD genérica.
    async playTeamBattleLog(log) {

        const allCombatants = [...this.getMyTeamCombatants(), ...this.getEnemyTeamCombatants()];
        const nameOf = (id) => allCombatants.find(c => c.id === id)?.name ?? "???";
        const originalHP = this.game.player.currentHP;

        for (const entry of log) {

            if (!entry.dodged) {

                this.teamHP[entry.targetId] = Math.max(0, (this.teamHP[entry.targetId] ?? 0) - entry.damage);

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

                }

                // Atualiza a barrinha de vida mini embaixo do retrato,
                // se esse combatente for um dos inimigos exibidos na
                // arena (os aliados não têm retrato próprio na tela).
                const enemyIds = this.getEnemyTeamCombatants().map(c => c.id);

                [entry.attackerId, entry.targetId].forEach(id => {
                    if (!enemyIds.includes(id)) return;
                    const fill = document.getElementById(`pvp-hp-${id}`);
                    const maxHp = allCombatants.find(c => c.id === id)?.maxHP ?? 1;
                    if (fill) fill.style.width = `${Math.max(0, (this.teamHP[id] / maxHp) * 100)}%`;
                });

            }

            this.game.hudScreen.playerHUD.updateHP?.();

            await CombatToast.show(this.buildTeamAttackMessage(entry, nameOf), this.buildTeamToastType(entry), 2);

            await this.sleep(450);

        }

        this.game.player.currentHP = originalHP;
        this.game.hudScreen.playerHUD.updateHP?.();

    }

    refresh() {
        this.game.hudScreen.refreshCurrentView();
    }

    registerEvents(container) {

        if (!PvpView.closeDelegationBound) {

            document.addEventListener("click", (event) => {

                if (!event.target.closest(".pvp-close")) return;

                this.game.hudScreen.changeView("");

            });

            PvpView.closeDelegationBound = true;

        }

        container.querySelectorAll(".pvp-mode-btn").forEach(button => {
            button.addEventListener("click", () => {
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
            this.game.hudScreen.changeView("");
        });

    }

}
