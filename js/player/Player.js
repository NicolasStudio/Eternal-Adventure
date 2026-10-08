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
import { MIN_CARDS_FOR_SECRET_ENDING } from "../data/cards.js";
import dungeons from "../data/dungeons.js";
import ItemValueService from "../services/ItemValueService.js";
import baseStatsL1 from "../data/baseStatsL1.js";
import { CURRENT_BALANCE_VERSION } from "../services/StatsMigrationService.js";
import pets from "../data/pet.js";
import TalentService from "../services/TalentService.js";

export default class Player {
    constructor(characterClass, name) {
        this.class = characterClass;
        this.name = name?.trim().slice(0, 8) || characterClass.name;
        this.level = 1;
        this.gold = 200;
        this.currentXP = 0;
        this.currentHP = 100;
        this.maxHP = 100;
        this.listeners = [];
        // Enquanto true, notify() vira no-op — usado pra agrupar várias
        // mutações (ex: os itens de uma recompensa) numa única
        // notificação no final, em vez de uma por item/ouro/XP.
        this.suppressNotify = false;
        this.health = new HealthSystem(this, () => this.notify());
        this.health.startRegeneration();
        this.baseStats = this.createBaseStats();
        this.inventory = [];
        this.progress = {
            dungeons: {},
            soulChoice: null,
            // Uma vez que o jogador confirma "sim, quero ver mesmo com
            // spoiler" no álbum, essa escolha fica valendo pra sempre —
            // não faz sentido pedir a mesma confirmação de novo toda vez
            // que o álbum é reaberto.
            albumRevealed: false,
            // Ids das conquistas já desbloqueadas (ver AchievementService) —
            // permanente: uma vez destravada, nunca volta a ficar bloqueada,
            // mesmo que o estado que a disparou mude depois.
            achievements: [],
            // Contadores que nenhum outro lugar do jogo guarda sozinho —
            // só existem pra alimentar as conquistas que dependem de
            // HISTÓRICO (não de um snapshot do estado atual).
            stats: {
                killedMonsters: [],
                deaths: 0,
                hospitalHeals: 0,
                goldFromSelling: 0,
                pvpWins: 0,
                enchantStoneFamiliesUsed: [],
                usedLevel3Stone: false,
                eggsHatched: 0,
                petFeedCount: 0,
                seedsPlanted: 0,
                harvests: 0,
                harvestedFoodCount: 0,
                waterCount: 0,
                harvestedWithDrySoil: false,
                harvestedStrawberry: false,
                removedPlantedSeed: false,
                harvestedByCrop: {},
                harvestedCorn: false,
                harvestedPumpkinAtNight: false,
                pestsRemoved: 0
            }
        };
        this.equipment = {
            weapon: null,
            helmet: null,
            chest: null,
            leg: null,
            boot: null,
            ring: null,
            amulet: null,
            pet: null
        };

        // Bônus de Vida Máxima já aplicado pelo pet equipado (ver
        // PetService.syncMaxHPBonus) — guardado aqui pra sincronizar
        // sem acumular em dobro toda vez que a fome muda.
        this.petLifeBonusApplied = 0;

        // Mesma ideia do petLifeBonusApplied, só que pro Anel/Amuleto
        // (únicos itens de equipamento — fora o pet — que dão Vida
        // Máxima; ver syncEquipmentLifeBonus()).
        this.equipmentLifeBonusApplied = 0;
        this.talentApplied = { lifeLost: 0, attack: 0, armor: 0, agility: 0 };
        this.stats = new PlayerStats(this);

        // Baú diário (Pokébox): fica pronto imediatamente numa partida nova.
        this.chest = {
            readyAt: Date.now()
        };

        // Álbum/bestiário: ids das cartas já descobertas (sem duplicar).
        this.album = [];

        // Fazenda: 24 canteiros (grade 6x4), todos como grama (não
        // arados) numa partida nova. Cada canteiro só guarda os
        // timestamps — estágio de crescimento, se está seco/molhado
        // etc. é tudo derivado a partir deles (ver FarmService.js).
        // petXP é só uma barra acumulada pra um futuro sistema de pet.
        this.farm = {
            plots: Array.from({ length: 24 }, () => ({
                tilled: false,
                tilledAt: null,
                seedId: null,
                plantedAt: null,
                wateredAt: null,
                growthModifier: null,
                pestAt: null,
                pestLostMs: null
            })),
            // Relógio preguiçoso do nascimento de pragas — mesmo espírito
            // do lastHungerTickAt do pet (ver PetService), roda mesmo com
            // a Fazenda fechada (ver FarmService.applyPestSpawn).
            lastPestSpawnAt: Date.now(),
            petXP: 0
        };

        // Transcendência (final secreto): null até o jogador escolher.
        // Guarda o objeto inteiro de upClasse.js (imagem, hud, bônus).
        this.transcendence = null;

        // Marca a curva de status (levels.js) usada pra construir esse
        // personagem. Todo personagem NOVO já nasce na versão atual —
        // só quem carrega um save de antes de uma mudança de balanceamento
        // passa pelo StatsMigrationService (ver SaveService.deserialize).
        this.balanceVersion = CURRENT_BALANCE_VERSION;
    }

    // Nível máximo + o mínimo de cartas no álbum (MIN_CARDS_FOR_SECRET_ENDING)
    // + todas as fases (dungeons não-ocultas) em 3/3 conclusões — a
    // condição pro final secreto aparecer.
    canMakeSoulChoice() {

        if (this.progress.soulChoice) return false;

        if (this.level < 100) return false;

        if (this.album.length < MIN_CARDS_FOR_SECRET_ENDING) return false;

        return dungeons
            .filter(dungeon => !dungeon.hidden)
            .every(dungeon => this.getDungeonClears(dungeon.id) >= 3);

    }

    getTranscendenceFor(sideId) {

        const prefix = sideId === "dark" ? "dark" : "light";

        const classKey = {
            warrior: prefix === "light" ? "light_Warrior" : "dark_Warrior",
            mage: prefix === "light" ? "light_mage" : "dark_mage",
            archer: prefix === "light" ? "light_archer" : "dark_archer",
            barbarian: prefix === "light" ? "light_barbarian" : "dark_barbarian",
            putrid: prefix === "light" ? "light_putrid" : "dark_putrid",
            mimic: prefix === "light" ? "light_mimic" : "dark_mimic"
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

        // Guarda os valores que foram somados, pra syncTranscendenceStats()
        // saber, numa próxima carga, o que mudou no upClasse.js desde então.
        this.progress.transcendenceApplied = { ...transcendence.states };

        this.notify();

        return true;

    }

    // Corrige o bônus de transcendência de um personagem que já transcendeu:
    // soma só a DIFERENÇA entre o que está no upClasse.js agora e o que foi
    // somado na época. Personagem antigo, sem registro, ganha a linha de base
    // com os valores atuais (sem somar nada agora).
    syncTranscendenceStats() {

        const transcendence = this.transcendence;

        if (!transcendence) return false;

        const applied = this.progress.transcendenceApplied;

        if (!applied) {
            this.progress.transcendenceApplied = { ...transcendence.states };
            return false;
        }

        let changed = false;

        Object.entries(transcendence.states).forEach(([key, value]) => {

            const delta = value - (applied[key] ?? 0);

            if (!delta) return;

            changed = true;

            if (key === "life") {
                this.maxHP += delta;
                this.currentHP += delta;
                return;
            }

            this.baseStats[key] = (this.baseStats[key] ?? 0) + delta;

        });

        this.progress.transcendenceApplied = { ...transcendence.states };

        return changed;

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
        if (this.suppressNotify) return;
        this.listeners.forEach(listener => listener(this));

    }

    createBaseStats() {
        const stats = baseStatsL1[this.class.id];
        return stats
            ? { ...stats }
            : { attack: 0, armor: 0, agility: 0, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 };
    }

    getRequiredXP() {

        // Sem o talento único "Rompendo Limites", o nível trava em 100
        // mesmo que a tabela de experience.js tenha entradas até 110.
        if (this.level >= TalentService.getMaxLevel(this)) return 0;

        const nextLevel = experience[this.level + 1];

        return nextLevel ? nextLevel.required : 0;

    }

    // quantity > 1 só faz sentido pra itens empilháveis (poções,
    // sementes) — equipamento sempre entra como 1 unidade.
    addItem(item, quantity = 1) {

        if (!item) return;

        const stackable = item.type === "item";

        if (stackable) {

            const existingItem = this.inventory.find(
                inventoryItem => inventoryItem.id === item.id
            );

            if (existingItem) {

                existingItem.quantity += quantity;

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

            quantity: stackable ? quantity : 1

        });

        this.notify();

    }

    equipItem(item) {

        if (!item) return false;

        // Itens sem `class` (ex: pet) ou com class "all" (anel/amuleto —
        // ver ring.js/amulet.js) valem pra qualquer classe — só barra
        // quando o item REALMENTE exige uma classe específica.
        if (item.class && item.class !== "all" && item.class !== this.class.id) {
            return false;
        }

        const slot = item.slot;

        if (this.equipment[slot]) {
            this.addItem(this.equipment[slot]);
        }

        this.inventory = this.inventory.filter(i => i.uid !== item.uid);

        this.equipment[slot] = item;

        this.syncEquipmentLifeBonus();

        this.notify();

        return true;

    }

    unequipItem(slot) {

        const item = this.equipment[slot];

        if (!item) return false;

        this.addItem(item);

        this.equipment[slot] = null;

        this.syncEquipmentLifeBonus();

        this.notify();

        return true;

    }

    // Anel/Amuleto (ver ring.js/amulet.js) são os únicos itens de
    // equipamento — fora o pet, que já tem seu próprio mecanismo em
    // PetService.syncEquippedPetContribution — que podem dar Vida
    // Máxima. Como "life" não é um dos status normais que PlayerStats
    // soma (ver getFinalStats()), precisa desse ajuste à parte, idêntico
    // em espírito ao do pet: só aplica a DIFERENÇA entre o que já estava
    // aplicado e o valor atual, nunca acumula em dobro.
    syncEquipmentLifeBonus() {

        const newBonus = (this.equipment.ring?.stats?.life ?? 0) + (this.equipment.amulet?.stats?.life ?? 0);
        const oldBonus = this.equipmentLifeBonusApplied ?? 0;

        if (newBonus === oldBonus) return;

        const diff = newBonus - oldBonus;

        this.maxHP = Math.max(1, this.maxHP + diff);
        this.currentHP = Math.min(this.maxHP, Math.max(0, this.currentHP + diff));
        this.equipmentLifeBonusApplied = newBonus;

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

        const soldValue = ItemValueService.getSellValue(inventoryItem) * toSell;

        this.addGold(soldValue);

        this.progress.stats.goldFromSelling = (this.progress.stats.goldFromSelling ?? 0) + soldValue;

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

        if (!amount || amount <= 0) return [];

        // Sem próximo nível pra subir, XP acumulada nunca seria gasta —
        // deixar currentXP crescer sem limite só deixaria a barra
        // estranha. Nível máximo não ganha mais experiência.
        if (this.getRequiredXP() <= 0) return [];

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

        // O loop só para antes de gastar tudo em dois casos: faltou XP pro
        // próximo nível (normal), ou bateu o teto de nível. No segundo caso
        // o que sobrou em currentXP não tem mais pra onde ir — descarta,
        // senão fica acumulado pra sempre (ver comentário da guarda acima).
        if (this.getRequiredXP() <= 0) {
            this.currentXP = 0;
        }

        if (levelUps.length > 0) {
            TalentService.sync(this);
        }

        // Ovo do primeiro pet, uma única vez, ao alcançar o nível 30 —
        // usa >=30 (não ===30) pra cobrir o caso raro de uma XP grande
        // pular direto de, por exemplo, 28 pro 35. Anexado no ÚLTIMO
        // levelUp (o nível final alcançado) pra o modal de level up
        // mostrar o ganho do ovo junto.
        if (levelUps.length > 0 && this.level >= 30 && !this.progress.stats.wolfEggGranted) {

            this.progress.stats.wolfEggGranted = true;

            const eggTemplate = pets.wolfPet1;

            this.addItem({ ...eggTemplate, icon: eggTemplate.image });

            levelUps[levelUps.length - 1].petReward = {
                name: eggTemplate.name,
                image: eggTemplate.image
            };

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

    // Desfaz, nível por nível, o applyLevelBonus() de tudo que está acima
    // de `cap` — usado quando o talento único "Rompendo Limites" é
    // resetado (ver TalentService.clearUniqueTalent): sem ele, o nível
    // trava em 100 de novo, então os níveis 101+ (e os status que vieram
    // deles) não fazem mais sentido pro personagem.
    revertLevelsAbove(cap) {

        while (this.level > cap) {

            const bonus = levels[this.level]?.[this.class.id];

            if (bonus) {

                this.maxHP = Math.max(1, this.maxHP - bonus.life);

                Object.keys(bonus).forEach(stat => {
                    if (stat === "life") return;
                    this.baseStats[stat] = Math.max(0, (this.baseStats[stat] ?? 0) - bonus[stat]);
                });

            }

            this.level--;

        }

        this.currentHP = Math.min(this.currentHP, this.maxHP);

    }

    // Desfaz os encantamentos de Anel e Amuleto (equipados ou no
    // inventário) — usado quando "Rei dos Encantamentos" é resetado (ver
    // TalentService.clearUniqueTalent): sem o talento, esses dois não
    // podem mais ser encantados, então o bônus que já tinham some junto.
    // A pedra gasta pra chegar lá não volta, igual nenhum outro reset
    // devolve o ouro investido.
    //
    // `types` limita quais acessórios são desfeitos — o talento hoje só
    // libera o Anel, e o carregamento usa ["amulet"] pra tirar o que foi
    // encantado quando o Amuleto ainda era permitido (ver
    // SaveService.deserialize). Devolve true se desfez alguma coisa.
    revertAccessoryEnchantments(types = ["ring", "amulet"]) {

        const items = new Map();

        [this.equipment.ring, this.equipment.amulet, ...this.inventory].forEach(item => {
            if (item?.enchantments && types.includes(item.type) && Object.keys(item.enchantments).length) {
                items.set(item.uid, item);
            }
        });

        items.forEach(item => {

            Object.entries(item.enchantments).forEach(([statKey, value]) => {

                if (statKey === "life") {
                    this.maxHP = Math.max(1, this.maxHP - value);
                    return;
                }

                if (statKey === "special") {
                    const specialKey = this.getSpecialStatKey();
                    if (specialKey) this.baseStats[specialKey] = Math.max(0, (this.baseStats[specialKey] ?? 0) - value);
                    return;
                }

                this.baseStats[statKey] = Math.max(0, (this.baseStats[statKey] ?? 0) - value);

            });

            item.enchantments = {};

        });

        this.currentHP = Math.min(this.currentHP, this.maxHP);

        return items.size > 0;

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

        // addXP/addGold/addItem cada um chama notify() sozinho — uma
        // recompensa com vários itens dispararia uma leva de checagens
        // de conquista (uma por unidade) antes mesmo de terminar de
        // aplicar a recompensa inteira. Suprime todas e notifica uma
        // vez só no final, já com o estado completo.
        this.suppressNotify = true;

        let levelUps;

        try {

            levelUps = this.addXP(reward.xp);

            this.addGold(reward.gold);

            reward.items.forEach(item => {

                for (let i = 0; i < item.quantity; i++) {

                    this.addItem(item);

                }

            });

        } finally {

            this.suppressNotify = false;

        }

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

        if (!weapon) return { success: false, reason: "Selecione um equipamento." };

        const inventoryStone = this.inventory.find(i => i.uid === stone.uid);

        if (!inventoryStone) return { success: false, reason: "Pedra inválida." };

        // Normalmente só a arma estava equipável aqui, mas "Rei dos
        // Encantamentos" (ver TalentService.js) também deixa encantar o
        // Anel equipado — por isso procura em QUALQUER slot, não só em
        // equipment.weapon.
        const equippedMatch = Object.values(this.equipment).find(item => item?.uid === weapon.uid);
        const weaponInstance = equippedMatch ?? this.inventory.find(i => i.uid === weapon.uid);

        if (!weaponInstance) return { success: false, reason: "Equipamento inválido." };

        if (!TalentService.getEnchantableTypes(this).includes(weaponInstance.type)) {
            return { success: false, reason: "Esse equipamento não pode ser encantado." };
        }

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
        } else if (statKey === "special") {
            // Quartzo Rosa: o bônus é sempre "special" na pedra/arma, mas
            // vira o atributo secundário real da classe do jogador
            // (Guerreiro = Absorção, Mago = Penetração, Bárbaro = Roubo de
            // Vida, Arqueiro = Crítico, Pútrido = Miasma) — mesmo teto de secondaryCap das
            // demais fontes desse atributo (ver PlayerStats.getFinalStats).
            const specialKey = this.getSpecialStatKey();
            if (specialKey) {
                this.baseStats[specialKey] = (this.baseStats[specialKey] ?? 0) + delta;
            }
        } else {
            this.baseStats[statKey] = (this.baseStats[statKey] ?? 0) + delta;
        }

        weaponInstance.enchantments[statKey] = newValue;

        // Rastreia a FAMÍLIA da pedra (rubi/safira/imperial/turmalina) e
        // se algum dia já usou uma de nível 3 — só pra alimentar as
        // conquistas de encantamento, nada aqui afeta o jogo em si.
        const stoneMatch = inventoryStone.id?.match(/^(.+)-(\d)$/);

        if (stoneMatch) {

            const [, family, levelText] = stoneMatch;

            this.progress.stats.enchantStoneFamiliesUsed ??= [];

            if (!this.progress.stats.enchantStoneFamiliesUsed.includes(family)) {
                this.progress.stats.enchantStoneFamiliesUsed.push(family);
            }

            if (Number(levelText) >= 3) {
                this.progress.stats.usedLevel3Stone = true;
            }

        }

        this.removeItem(inventoryStone);

        return { success: true, statKey, value: newValue };

    }

    getEnchantStatName(stat) {
        switch (stat) {
            case "life": return "Vida";
            case "armor": return "Armadura";
            case "attack": return "Ataque";
            case "agility": return "Agilidade";
            case "special": return this.getSpecialStatName();
            default: return stat;
        }
    }

    // Atributo secundário que o Quartzo Rosa (pedra "special") aprimora
    // pra classe atual do jogador.
    getSpecialStatKey() {
        return {
            warrior: "absorption",
            mage: "penetration",
            archer: "criticalChance",
            barbarian: "lifeSteal",
            // Pútrido: o especial dele é o Miasma (enfraquece os 4
            // especiais do INIMIGO — ver MiasmaService.js); ele mesmo não
            // tem Crítico/Roubo de Vida/Penetração/Absorção.
            putrid: "miasmaChance",
            // Mímico: o especial dele é a Imitação (soma % do Ataque/
            // Armadura/Agilidade do inimigo aos dele — ver MimicService.js).
            mimic: "reflection"
        }[this.class.id] ?? null;
    }

    getSpecialStatName() {
        switch (this.getSpecialStatKey()) {
            case "absorption": return "Absorção";
            case "penetration": return "Penetração";
            case "criticalChance": return "Chance Crítica";
            case "lifeSteal": return "Roubo de Vida";
            case "miasmaChance": return "Miasma";
            case "reflection": return "Imitação";
            default: return "Atributo Especial";
        }
    }

    completeDungeon(dungeonId) {

        if (!dungeonId) return;

        const previousClears = this.progress.dungeons[dungeonId]?.clears ?? 0;

        this.progress.dungeons[dungeonId] = {
            completed: true,
            clears: previousClears + 1
        };

        // Portal da Luz/Trevas — é aqui que a melhoria de classe (status
        // somados + retrato novo) acontece de verdade, não no momento da
        // escolha. Tenta em TODA vitória (não só a primeira): applyClassUpgrade()
        // já se protege sozinho contra aplicar duas vezes (if (this.transcendence)
        // return false), então repetir aqui é inofensivo pra quem já recebeu — mas
        // é o que permite quem ficou travado por um bug (ex: classe sem entrada no
        // mapa de getTranscendenceFor) finalmente receber a melhoria na próxima vitória,
        // sem precisar recriar o personagem.
        if (dungeonId === "light_dungeon" || dungeonId === "dark_dungeon") {
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

    // Só pra alimentar as conquistas de caça (ver AchievementService) —
    // guarda o id sem duplicar, não afeta o combate em si.
    registerKill(monsterId) {

        if (!monsterId) return;

        this.progress.stats.killedMonsters ??= [];

        if (!this.progress.stats.killedMonsters.includes(monsterId)) {
            this.progress.stats.killedMonsters.push(monsterId);
        }

    }

    registerDeath() {

        this.progress.stats.deaths = (this.progress.stats.deaths ?? 0) + 1;

    }
}