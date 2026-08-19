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
import upClasse from "./upClasse.js";
import cards from "../data/cards.js";
import ItemValueService from "../services/ItemValueService.js";
import baseStatsL1 from "../data/baseStatsL1.js";
import { CURRENT_BALANCE_VERSION } from "../services/StatsMigrationService.js";

export default class Player {
    constructor(characterClass, name) {
        this.class = characterClass;
        this.name = name?.trim().slice(0, 8) || characterClass.name;
        this.level = 1;
        this.gold = 100;
        this.currentXP = 0;
        this.currentHP = 100;
        this.maxHP = 100;
        this.listeners = [];
        this.health = new HealthSystem(this, () => this.notify());
        this.health.startRegeneration();
        this.baseStats = this.createBaseStats();
        this.inventory = [];
        this.progress = {
            dungeons: {},
            soulChoice: null
        };
        this.equipment = {
            weapon: null,
            helmet: null,
            chest: null,
            leg: null,
            boot: null
        };
        this.stats = new PlayerStats(this);

        // Baú diário (Pokébox): fica pronto imediatamente numa partida nova.
        this.chest = {
            readyAt: Date.now()
        };

        // Álbum/bestiário: ids das cartas já descobertas (sem duplicar).
        this.album = [];

        // Transcendência (final secreto): null até o jogador escolher.
        // Guarda o objeto inteiro de upClasse.js (imagem, hud, bônus).
        this.transcendence = null;

        // Marca a curva de status (levels.js) usada pra construir esse
        // personagem. Todo personagem NOVO já nasce na versão atual —
        // só quem carrega um save de antes de uma mudança de balanceamento
        // passa pelo StatsMigrationService (ver SaveService.deserialize).
        this.balanceVersion = CURRENT_BALANCE_VERSION;
    }

    // Nível máximo + todas as cartas do bestiário coletadas — a condição
    // pro final secreto aparecer.
    canMakeSoulChoice() {

        if (this.progress.soulChoice) return false;

        if (this.level < 100) return false;

        const totalCards = cards.length;

        return this.album.length >= totalCards;

    }

    getTranscendenceFor(sideId) {

        const prefix = sideId === "dark" ? "dark" : "light";

        const classKey = {
            warrior: prefix === "light" ? "light_Warrior" : "dark_Warrior",
            mage: prefix === "light" ? "light_mage" : "dark_mage",
            archer: prefix === "light" ? "light_archer" : "dark_archer"
        }[this.class.id];

        return upClasse[classKey] ?? null;

    }

    // Só define QUAL dungeon vai aparecer (luz ou trevas) — o bônus de
    // verdade (status + troca de retrato) só é aplicado depois que o
    // jogador vence essa dungeon, em applyClassUpgrade().
    makeSoulChoice(sideId) {

        if (this.progress.soulChoice) return false;

        const prefix = sideId === "dark" ? "dark" : "light";

        this.progress.soulChoice = prefix;

        this.notify();

        return true;

    }

    // Chamado a partir de completeDungeon() na primeira vez que o
    // jogador vence o Portal da Luz/Trevas. Soma os status do upClasse.js
    // em cima do que o personagem já tem, e troca retrato/HUD.
    applyClassUpgrade() {

        if (this.transcendence) return false;

        if (!this.progress.soulChoice) return false;

        const transcendence = this.getTranscendenceFor(this.progress.soulChoice);

        if (!transcendence) return false;

        Object.entries(transcendence.states).forEach(([key, value]) => {

            if (key === "life") {
                this.maxHP += value;
                this.currentHP += value;
                return;
            }

            this.baseStats[key] = (this.baseStats[key] ?? 0) + value;

        });

        this.transcendence = transcendence;

        this.notify();

        return true;

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
        const stats = baseStatsL1[this.class.id];
        return stats
            ? { ...stats }
            : { attack: 0, armor: 0, agility: 0, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 };
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

    removeItem(item, amount = 1) {

        if (!item) return;

        const inventoryItem = this.inventory.find(i => i.uid === item.uid);

        if (!inventoryItem) return;

        const currentQuantity = inventoryItem.quantity ?? 1;

        const toRemove = Math.min(amount, currentQuantity);

        if (currentQuantity > toRemove) {

            inventoryItem.quantity -= toRemove;

        } else {

            this.inventory = this.inventory.filter(i => i.uid !== item.uid);

        }

        this.notify();

    }

    sellItem(item, amount = 1) {

        if (!item) return false;

        if (!item.sellValue) return false;

        const inventoryItem = this.inventory.find(i => i.uid === item.uid);

        if (!inventoryItem) return false;

        const toSell = Math.min(amount, inventoryItem.quantity ?? 1);

        this.addGold(ItemValueService.getSellValue(inventoryItem) * toSell);

        this.removeItem(inventoryItem, toSell);

        return true;

    }

    // Vende de uma vez todos os itens vendíveis de uma raridade —
    // pensado pra inventários grandes, onde vender item por item fica
    // impraticável. Retorna quantos itens (contando pilhas de
    // consumível) e quanto ouro foram vendidos.
    sellItemsByRarity(rarityId) {

        const matching = this.inventory.filter(
            item => item.sellValue > 0 && item.rarity?.id === rarityId && item.slot
        );

        let totalGold = 0;
        let totalCount = 0;

        // Vende de trás pra frente — cada sellItem() já remove o item
        // do array this.inventory, então percorrer por índice
        // crescente pularia itens depois de uma remoção.
        for (let i = matching.length - 1; i >= 0; i--) {

            const item = matching[i];
            const quantity = item.quantity ?? 1;

            totalGold += ItemValueService.getSellValue(item) * quantity;
            totalCount += quantity;

            this.sellItem(item, quantity);

        }

        return { count: totalCount, gold: totalGold };

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

    // Aplica o bônus de uma pedra de encantamento permanentemente no
    // personagem (canalizado através da arma, mas o efeito fica com
    // você, não preso no item — trocar de arma depois não tira o bônus
    // já aplicado). Consome 1 unidade da pedra do inventário.
    //
    // Cada arma só pode ter UM encantamento por tipo de atributo (vida,
    // armadura, ataque, agilidade) — usar uma pedra melhor do MESMO tipo
    // SUBSTITUI o bônus anterior daquela arma (não soma os dois); usar
    // uma pedra igual ou pior que a já aplicada é bloqueado.
    applyEnchantment(stone, weapon) {

        if (!stone?.stats) return { success: false, reason: "Pedra inválida." };

        if (!weapon) return { success: false, reason: "Selecione uma arma." };

        const inventoryStone = this.inventory.find(i => i.uid === stone.uid);

        if (!inventoryStone) return { success: false, reason: "Pedra inválida." };

        const weaponInstance =
            this.equipment.weapon?.uid === weapon.uid
                ? this.equipment.weapon
                : this.inventory.find(i => i.uid === weapon.uid);

        if (!weaponInstance) return { success: false, reason: "Arma inválida." };

        if (!weaponInstance.enchantments) {
            weaponInstance.enchantments = {};
        }

        const [statKey, newValue] = Object.entries(inventoryStone.stats)[0];

        const currentValue = weaponInstance.enchantments[statKey] ?? 0;

        if (newValue <= currentValue) {
            return {
                success: false,
                reason: `Essa arma já tem um encantamento de ${this.getEnchantStatName(statKey)} igual ou melhor.`
            };
        }

        // Se já havia um encantamento mais fraco desse mesmo tipo nessa
        // arma, primeiro desfaz o bônus antigo antes de aplicar o novo
        // (upgrade, não soma dos dois).
        const delta = newValue - currentValue;

        if (statKey === "life") {
            this.maxHP += delta;
            this.currentHP += delta;
        } else {
            this.baseStats[statKey] = (this.baseStats[statKey] ?? 0) + delta;
        }

        weaponInstance.enchantments[statKey] = newValue;

        this.removeItem(inventoryStone);

        return { success: true, statKey, value: newValue };

    }

    getEnchantStatName(stat) {
        switch (stat) {
            case "life": return "Vida";
            case "armor": return "Armadura";
            case "attack": return "Ataque";
            case "agility": return "Agilidade";
            default: return stat;
        }
    }

    completeDungeon(dungeonId) {

        if (!dungeonId) return;

        const previousClears = this.progress.dungeons[dungeonId]?.clears ?? 0;

        this.progress.dungeons[dungeonId] = {
            completed: true,
            clears: previousClears + 1
        };

        // Primeira vitória no Portal da Luz/Trevas — é aqui que a
        // melhoria de classe (status somados + retrato novo) acontece de
        // verdade, não no momento da escolha.
        if (
            previousClears === 0 &&
            (dungeonId === "light_dungeon" || dungeonId === "dark_dungeon")
        ) {
            this.applyClassUpgrade();
        }

        this.notify();

    }

    hasCompletedDungeon(dungeonId) {

        return this.progress.dungeons[dungeonId]?.completed === true;

    }

    getDungeonClears(dungeonId) {

        return this.progress.dungeons[dungeonId]?.clears ?? 0;

    }

    // Skip só libera depois de 3 conclusões reais — inclusive em
    // dungeons de chefe.
    canSkipDungeon(dungeon) {

        if (!dungeon) return false;

        return this.getDungeonClears(dungeon.id) >= 3;

    }
}