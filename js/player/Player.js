import weapons from "../data/weapons.js";
import helmets from "../data/helmets.js";
import chests from "../data/chest.js";
import legs from "../data/legs.js";
import boots from "../data/boots.js";
import PlayerStats from "../core/PlayerStats.js";
import HealthSystem from "../player/HealthSystem.js";
import experience from "../data/experience.js";
import levels  from "../data/levels.js";
import qualities from "../data/quality.js";

export default class Player {
    constructor(characterClass) {
        this.class = characterClass;
        this.level = 1;
        this.gold = 0;
        this.currentXP = 0;
        this.currentHP = 100;
        this.maxHP = 100;
        this.listeners = [];
        this.health = new HealthSystem(this, () => this.notify());
        this.health.startRegeneration();
        this.baseStats = this.createBaseStats();
        this.inventory = [];
        this.progress = {
            dungeons: {}
        };
        this.equipment = {
            weapon: null,
            helmet: null,
            chest: null,
            legs: null,
            boots: null
        };
        this.stats = new PlayerStats(this);

        // Baú diário (Pokébox): fica pronto imediatamente numa partida nova.
        this.chest = {
            readyAt: Date.now()
        };

        // Álbum/bestiário: ids das cartas já descobertas (sem duplicar).
        this.album = [];
    }

    unlockCard(id) {
        if (!this.album.includes(id)) {
            this.album.push(id);
        }
    }

    hasCard(id) {
        return this.album.includes(id);
    }

    addListener(callback) {
        if (typeof callback === "function") {
            this.listeners.push(callback);
        }
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    notify() {
        this.listeners.forEach(listener => listener(this));

    }

    createBaseStats() {
        switch (this.class.id) {
            case "warrior":
                return { attack: 6, armor: 5, agility: 2, criticalChance: 0, lifeSteal: 0, penetration: 0 };
            case "archer":
                return { attack: 7, armor: 3, agility: 8, criticalChance: 0, lifeSteal: 0, penetration: 0 };
            case "mage":
                return { attack: 9, armor: 2, agility: 4, criticalChance: 0, lifeSteal: 0, penetration: 0 };
            default:
                return { attack: 0, armor: 0, agility: 0, criticalChance: 0, lifeSteal: 0, penetration: 0 };
        }
    }

    getRequiredXP() {

        const nextLevel = experience[this.level + 1];

        return nextLevel ? nextLevel.required : 0;

    }

    addItem(item) {

        if (!item) return;

        const stackable = item.type === "item";

        if (stackable) {

            const existingItem = this.inventory.find(
                inventoryItem => inventoryItem.id === item.id
            );

            if (existingItem) {

                existingItem.quantity++;

                this.notify();

                return;

            }

        }

        const clone = structuredClone(item);

        // Equipamentos (armas, elmos, peitorais, pernas, botas) sempre
        // começam com qualidade "Nenhuma" até serem melhorados na Ferraria.
        if (clone.slot && !clone.quality) {
            clone.quality = structuredClone(qualities.none);
        }

        // baseStats guarda os atributos ORIGINAIS do item (antes de
        // qualquer melhoria). Toda melhoria de qualidade recalcula
        // clone.stats a partir daqui, então isso só é gravado uma vez.
        if (clone.slot && clone.stats && !clone.baseStats) {
            clone.baseStats = structuredClone(clone.stats);
        }

        this.inventory.push({

            ...clone,

            uid: crypto.randomUUID(),

            quantity:1

        });

        this.notify();

    }

    equipItem(item) {

        if (!item) return false;

        if (item.class !== this.class.id) {
            return false;
        }

        const slot = item.slot;

        if (this.equipment[slot]) {
            this.addItem(this.equipment[slot]);
        }

        this.inventory = this.inventory.filter(i => i.uid !== item.uid);

        this.equipment[slot] = item;

        this.notify();

        return true;

    }

    unequipItem(slot) {

        const item = this.equipment[slot];

        if (!item) return false;

        this.addItem(item);

        this.equipment[slot] = null;

        this.notify();

        return true;

    }

    removeItem(item) {

        if (!item) return;

        const inventoryItem = this.inventory.find(i => i.uid === item.uid);

        if (!inventoryItem) return;

        if (inventoryItem.quantity > 1) {

            inventoryItem.quantity--;

        } else {

            this.inventory = this.inventory.filter(i => i.uid !== item.uid);

        }

        this.notify();

    }

    sellItem(item) {

        if (!item) return false;

        if (!item.sellValue) return false;

        const inventoryItem = this.inventory.find(i => i.uid === item.uid);

        if (!inventoryItem) return false;

        this.addGold(inventoryItem.sellValue);

        this.removeItem(inventoryItem);

        return true;

    }

    addXP(amount) {

        if (!amount || amount <= 0) return;

        this.currentXP += amount;

        const levelUps = [];

        while (true) {

            const requiredXP = this.getRequiredXP();

            if (requiredXP <= 0) break;

            if (this.currentXP < requiredXP) break;

            this.currentXP -= requiredXP;

            this.level++;

            const bonus = this.applyLevelBonus();

            levelUps.push({
                level: this.level,
                bonus
            });

        }

        this.notify();

        return levelUps;

    }

    applyLevelBonus() {

        const bonus = levels[this.level]?.[this.class.id];

        if (!bonus) return null;

        this.maxHP += bonus.life;
        this.currentHP = this.maxHP;

        Object.keys(bonus).forEach(stat => {

            if (stat === "life") return;

            this.baseStats[stat] += bonus[stat];

        });

        return structuredClone(bonus);

    }

    addGold(amount) {
        if (!amount || amount <= 0) return;
        this.gold += amount;
        this.notify();
    }

    removeGold(amount) {

        if (!amount || amount <= 0) return false;

        if (this.gold < amount) {
            return false;
        }

        this.gold -= amount;

        this.notify();

        return true;

    }

    canAfford(amount) {

        return this.gold >= amount;

    }
    collectReward(reward) {

        if (!reward) return [];

        const levelUps = this.addXP(reward.xp);

        this.addGold(reward.gold);

        reward.items.forEach(item => {

            for (let i = 0; i < item.quantity; i++) {

                this.addItem(item);

            }

        });

        this.notify();

        return levelUps;

    }

    completeDungeon(dungeonId) {

        if (!dungeonId) return;

        this.progress.dungeons[dungeonId] = {
            completed: true
        };

        this.notify();

    }

    hasCompletedDungeon(dungeonId) {

        return this.progress.dungeons[dungeonId]?.completed === true;

    }
}