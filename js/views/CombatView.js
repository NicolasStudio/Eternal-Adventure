import monsters from "../data/monsters.js";
import CombatEngine from "../combat/CombatEngine.js";
import LootSystem from "../combat/LootSystem.js";
import LevelUpModal from "../ui/components/modals/LevelUpModal.js";
import RewardModal from "../ui/components/modals/RewardModal.js";
import ContinueDungeonModal from "../ui/components/modals/ContinueDungeonModal.js";
import InventoryPromptModal from "../ui/components/modals/InventoryPromptModal.js";
import DungeonCompleteModal from "../ui/components/modals/DungeonCompleteModal.js";


export default class CombatView {
    constructor(game) {
        this.game = game;
        this.currentDungeon = null;
        this.currentFloor = 1;
        this.currentMonster = null;
        this.engine = null;
        this.messages = [];
        this.pendingMessages = [];
        this.messageDelay = 1000;
        this.turnDelay = 800;
        this.rewardModal = new RewardModal(game);
        this.levelUpModal = new LevelUpModal(this.game);
        this.continueDungeonModal = new ContinueDungeonModal();
        this.inventoryPromptModal = new InventoryPromptModal();
        this.dungeonCompleteModal = new DungeonCompleteModal();
    }

    queueMessage(message) {
        this.pendingMessages.push(message);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateCombatLog() {
        const log = document.querySelector(".combat-log");
        if (!log) return;
        log.innerHTML = `
            <header class="combat-sidebar-header">Combate</header>
            <hr>
            ${this.messages.map(message => `<div class="combat-message">${message}</div>`).join("")}
        `;
        log.scrollTop = log.scrollHeight;
    }

    async flushMessages() {
        while (this.pendingMessages.length) {
            this.messages.push(this.pendingMessages.shift());
            this.updateCombatLog();
            await this.sleep(this.messageDelay);
        }
    }

    async enter(dungeon) {

        this.currentDungeon = dungeon;
        this.currentFloor = 1;

        await this.enterFloor();

    }

    async enterFloor() {

        const monsterId =
            this.currentDungeon.monsters[this.currentFloor - 1];

        this.currentMonster = structuredClone(
            monsters.find(monster => monster.id === monsterId)
        );

        this.currentMonster.status.vidaAtual =
            this.currentMonster.status.vidaMaxima;

        this.engine = new CombatEngine(
            this.game.player,
            this.currentMonster
        );

        const initiative = this.engine.rollInitiative();

        this.engine.currentTurn = initiative;

        this.messages = [];
        this.pendingMessages = [];

        // <<< IMPORTANTE
        this.game.hudScreen.currentView = "dungeon";
        this.game.hudScreen.refreshCurrentView();

        if (this.currentFloor === 1) {

            this.queueMessage(
                `Você entrou em <strong>${this.currentDungeon.name}</strong>.`
            );

        }

        this.queueMessage(`Andar ${this.currentFloor}`);

        this.queueMessage(`${this.currentMonster.name} apareceu!`);

        this.queueMessage(
            initiative === "player"
                ? "Você tomou a iniciativa!"
                : `${this.currentMonster.name} tomou a iniciativa!`
        );

        await this.flushMessages();

        await this.combatLoop();

    }

    async combatLoop() {

        while (true) {

            await this.playTurn();

            const state = this.engine.checkCombatState();

            if (state.finished) {

                this.queueMessage(
                    state.winner === "player"
                        ? `${this.currentMonster.name} foi derrotado!`
                        : "Você foi derrotado!"
                );

                await this.flushMessages();

                if (state.winner === "player") {

                    const reward = LootSystem.generate(
                        this.currentMonster,
                        this.game.player
                    );

                    // ==========================
                    // RECOMPENSA
                    // ==========================
                    await this.rewardModal.show(reward);

                    const levelUps = this.game.player.collectReward(reward);

                    this.game.hudScreen.refreshCurrentView();

                    for (const levelUp of levelUps) {

                        await this.levelUpModal.show(
                            levelUp.level,
                            levelUp.bonus
                        );


                    }

                    // ==========================
                    // DUNGEON CONCLUÍDA
                    // ==========================
                    if (this.currentFloor >= this.currentDungeon.fights) {

                        await this.finishDungeon();

                        return;

                    }

                    // Fecha o combate
                    await this.closeCombat();

                    // ==========================
                    // CONTINUAR DUNGEON?
                    // ==========================
                    const continueDungeon =
                        await this.continueDungeonModal.show();

                    if (!continueDungeon) {

                        this.game.hudScreen.exitCombat();

                        return;

                    }

                    // ==========================
                    // ABRIR INVENTÁRIO?
                    // ==========================
                    const openInventory =
                        await this.inventoryPromptModal.show();

                    if (openInventory) {

                        this.game.hudScreen.enterPreparationMode();

                        return;

                    }

                    // ==========================
                    // PRÓXIMO ANDAR
                    // ==========================
                    await this.startNextFloor();

                } else {

                    await this.closeCombat();

                    this.game.hudScreen.exitCombat();

                    // Futuramente:
                    // await this.showGameOver();

                }

                break;

            }

            this.engine.nextTurn();

            await this.sleep(this.turnDelay);

        }

    }

    async playTurn() {
        const result = this.engine.attack();
        this.game.hudScreen.playerHUD.updateHP();
        this.game.hudScreen.monsterHUD.updateHP();
        this.queueMessage(this.engine.createAttackMessage(result));
        await this.flushMessages();
    }

    async closeCombat() {
        await this.sleep(400);
        const combatWindow = document.querySelector(".combat-window");
        if (combatWindow) {
            combatWindow.style.transition = "opacity .35s ease";
            combatWindow.style.opacity = "0";
        }
        await this.sleep(350);
        this.messages = [];
        this.pendingMessages = [];
        this.currentMonster = null;
        this.engine = null;
        const log = document.querySelector(".combat-log");
        if (log) {
            log.innerHTML = "";
        }
        if (combatWindow) {
            combatWindow.remove();
        }
        this.game.hudScreen.monsterHUD.hide();
    }

    async startNextFloor() {

        if (!this.currentDungeon) return;

        this.currentFloor++;

        await this.enterFloor();

    }

    async finishDungeon() {

        const dungeon = this.currentDungeon;

        await this.dungeonCompleteModal.show(dungeon);

        await this.closeCombat();

        this.game.hudScreen.exitCombat();

    }

    exit() {
        this.currentDungeon = null;
        this.currentFloor = 1;
        this.currentMonster = null;
        this.engine = null;
        this.messages = [];
        this.pendingMessages = [];
    }

    render() {
        if (!this.currentDungeon || !this.currentMonster) {
            return "";
        }
        return `
            <section class="combat-window">
                <div class="combat-main">
                    ${this.renderArena()}
                    <aside class="combat-sidebar">
                        ${this.renderLog()}
                    </aside>
                </div>
            </section>
        `;
    }

    renderArena() {
        if (!this.currentMonster) {
            return "";
        }
        return `
            <section class="combat-arena">
                <div class="monster-stage">
                    <img class="combat-monster" src="${this.currentMonster.sprite}" alt="${this.currentMonster.name}">
                </div>
            </section>
        `;
    }

    renderLog() {
        return `
            <section class="combat-log">
                <header class="combat-sidebar-header">Combate</header>
                <hr>
                ${this.messages.map(message => `<div class="combat-message">${message}</div>`).join("")}
            </section>
        `;
    }
}