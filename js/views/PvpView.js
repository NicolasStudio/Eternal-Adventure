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
        this.isPlayerA = null;
        this.chosenBossDungeon = null;
        this.opponentHP = null;
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
            case "found": return this.renderFound();
            case "result": return this.renderResult();
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
                    <button class="pvp-mode-btn pvp-mode-locked" data-mode="2v2">
                        <span class="pvp-mode-label">2x2</span>
                        <span class="pvp-mode-sub">Em breve</span>
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
                    Entre na fila e enfrente outro jogador em um combate
                    automático, decidido pelos status do seu personagem
                    no momento da partida.
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
                        ? "Oponente encontrado, preparando a partida..."
                        : "Procurando um oponente..."}
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
    // adversário aparece onde o monstro apareceria.
    renderBattleArena() {
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

    renderLogLine(entry, combatantA, combatantB) {
        const name = entry.turn === "a" ? combatantA.name : combatantB.name;
        if (entry.dodged) {
            return `<div class="pvp-log-line pvp-log-dodge">${name} esquivou!</div>`;
        }
        const crit = entry.critical ? " <strong>(Crítico!)</strong>" : "";
        const steal = entry.lifeSteal > 0 ? ` <span class="pvp-log-heal">(+${entry.lifeSteal} HP roubado)</span>` : "";
        return `<div class="pvp-log-line">${name} causou ${entry.damage} de dano${crit}${steal}</div>`;
    }

    currentOpponentSnapshot() {
        if (!this.matchData) return null;
        return this.isPlayerA ? this.matchData.combatantB : this.matchData.combatantA;
    }

    // Adapta o combatente pro formato que o MonsterHUD já sabe
    // renderizar (mesmo componente do combate PVE, sem precisar
    // duplicar nada nele).
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
        this.isPlayerA = matchData.combatantA.id === PvpLobbyService.playerId;

        this.state = "found";
        this.refresh();

        await this.sleep(1500);

        // A arena é sorteada, mas com a MESMA semente da partida — os
        // dois jogadores veem exatamente o mesmo cenário, sem precisar
        // combinar nada entre si.
        const chosenIndex = Math.abs(matchData.seed) % BOSS_DUNGEONS.length;
        this.chosenBossDungeon = BOSS_DUNGEONS[chosenIndex];

        this.game.hudScreen.inPvpCombat = true;
        this.state = "ceremony";
        this.refresh();

        await this.runCeremonyAnimation(chosenIndex);

        this.game.hudScreen.setBackground(this.chosenBossDungeon.background);

        // O resultado já é calculado aqui — determinístico, os dois
        // clientes chegam exatamente no mesmo resultado sozinhos (ver
        // PvpCombatService). A "batalha" que o jogador vê na tela é só
        // a ANIMAÇÃO desse resultado já pronto, turno por turno.
        const result = PvpCombatService.simulate(
            matchData.combatantA,
            matchData.combatantB,
            matchData.seed
        );
        this.combatResult = result;

        const opponent = this.currentOpponentSnapshot();
        this.opponentHP = opponent.maxHP;

        this.state = "battle";
        this.refresh();

        await CombatToast.show(`Partida contra ${opponent.name} começou!`, "system");

        await this.playBattleLog(result.log);

        const iWon = (result.winner === "a") === this.isPlayerA;
        await CombatToast.show(iWon ? `${opponent.name} derrotado!` : "Você foi derrotado!", "system");

        await this.sleep(900);

        this.game.hudScreen.inPvpCombat = false;
        this.state = "result";
        this.refresh();

        PvpLobbyService.cleanupMatch(matchId);

    }

    // Sorteio estilo "caça-níquel": troca a imagem rapidamente entre
    // os chefes disponíveis, desacelerando aos poucos, até parar na
    // arena escolhida de verdade (a mesma pros dois jogadores).
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

            await CombatToast.show(this.buildAttackMessage(entry), this.buildToastType(entry));

            await this.sleep(500);

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

                const mode = button.dataset.mode;

                if (mode === "2v2") {
                    Toast.show("Modo 2x2 em breve! Por enquanto, só 1x1 está disponível.");
                    return;
                }

                this.mode = mode;
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
