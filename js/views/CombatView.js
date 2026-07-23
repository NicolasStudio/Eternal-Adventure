import monsters from "../data/monsters.js";
import CombatEngine from "../combat/CombatEngine.js";
import LootSystem from "../combat/LootSystem.js";
import LevelUpModal from "../ui/components/modals/LevelUpModal.js";
import RewardModal from "../ui/components/modals/RewardModal.js";
import CombatToast from "../combat/CombatToast.js";
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
        this.turnDelay = 900;
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

        while (this.currentFloor <= this.currentDungeon.fights) {

            const result = await this.enterFloor();

            if (!result) {
                return;
            }

            this.currentFloor++;
        }

        await this.finishDungeon();

    }

    async enterFloor() {

        const monsterId = this.currentDungeon.monsters[this.currentFloor - 1];

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

        // Atualiza a HUD para renderizar a arena e o monstro
        this.game.hudScreen.currentView = "dungeon";
        this.game.hudScreen.refreshCurrentView();

        // Aguarda um frame para garantir que o DOM foi atualizado
        await new Promise(resolve => requestAnimationFrame(resolve));

        if (this.currentFloor === 1) {

            await CombatToast.show(
                `Entrou em ${this.currentDungeon.name}`,
                "system"
            );

        }

        await CombatToast.show(
            `Andar ${this.currentFloor}`,
            "system"
        );

        await CombatToast.show(
            `${this.currentMonster.name} apareceu!`,
            "system"
        );

        await CombatToast.show(
            initiative === "player"
                ? "Você iniciou o combate!"
                : `${this.currentMonster.name} iniciou o combate!`,
            "system"
        );

        return await this.combatLoop();

    }

    async combatLoop() {

        while (true) {

            await this.playTurn();

            const state = this.engine.checkCombatState();

            if (!state.finished) {

                this.engine.nextTurn();

                await this.sleep(this.turnDelay);

                continue;

            }

            await CombatToast.show(

                state.winner === "player"
                    ? `${this.currentMonster.name} derrotado!`
                    : "Você foi derrotado!",

                "system"

            );

            if (state.winner === "player") {

                const reward = LootSystem.generate(
                    this.currentMonster,
                    this.game.player
                );

                await this.rewardModal.show(reward);

                const levelUps =
                    this.game.player.collectReward(reward);

                this.game.hudScreen.refreshCurrentView();

                for (const levelUp of levelUps) {

                    await this.levelUpModal.show(
                        levelUp.level,
                        levelUp.bonus
                    );

                }

                // Último andar
                if (this.currentFloor >= this.currentDungeon.fights) {

                    await this.finishDungeon();

                    return;

                }

                // =====================================================
                // PRIMEIRO PERGUNTA SE DESEJA ABRIR O INVENTÁRIO
                // =====================================================

                const openInventory =
                    await this.inventoryPromptModal.show();

                if (openInventory) {

                    this.game.hudScreen.enterPreparationMode();

                    await new Promise(resolve => {

                        this.game.hudScreen.onPreparationFinished = resolve;

                    });

                    this.game.hudScreen.exitPreparationMode();

                    this.game.hudScreen.currentView = "dungeon";
                    this.game.hudScreen.refreshCurrentView();

                }

                // =====================================================
                // DEPOIS PERGUNTA SE DESEJA CONTINUAR
                // =====================================================

                const continueDungeon =
                    await this.continueDungeonModal.show();

                if (!continueDungeon) {

                    await this.closeCombat();

                    this.game.hudScreen.exitCombat();

                    return false;

                }

                return true;

            }

            // Derrota

            await this.closeCombat();

            this.game.hudScreen.exitCombat();

            return false;

        }

    }

    async playTurn() {
        const result = this.engine.attack();

        this.game.hudScreen.playerHUD.updateHP();
        this.game.hudScreen.monsterHUD.updateHP();

        const message = this.engine.createAttackMessage(result);

        const type =
            result.attacker === "player"
                ? "player"
                : "enemy";

        await CombatToast.show(message, type);

    }

    async closeCombat() {

        CombatToast.clear();

        this.currentMonster = null;

        this.engine = null;

        this.game.hudScreen.monsterHUD.hide();

    }

    async startNextFloor() {

        this.currentFloor++;

        await this.enterFloor();

    }

async finishDungeon() {
    const dungeon = this.currentDungeon;

    await this.dungeonCompleteModal.show(dungeon);

    await this.closeCombat();

    this.game.hudScreen.exitCombat();

    return false;

}

    exit(){

        this.currentDungeon = null;

        this.currentFloor = 1;

        this.currentMonster = null;

        this.engine = null;

    }

    render() {

        if (!this.currentDungeon || !this.currentMonster) {

            return "";

        }

        return `
            <section class="combat-window">

                <div class="combat-main">

                    ${this.renderArena()}

                </div>

            </section>
        `;

    }

    renderArena() {
        if (!this.currentDungeon || !this.currentMonster) {
            return "";
        }

            return `
                <section class="combat-arena">

                    <div class="monster-stage">

                        <img
                            class="combat-monster"
                            src="${this.currentMonster.sprite}"
                            alt="${this.currentMonster.name}">

                    </div>

                    <div id="combat-toast-container"></div>

                </section>
            `;

    }

}