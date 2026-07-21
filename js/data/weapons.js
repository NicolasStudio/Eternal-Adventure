import rarities from "./rarities.js";

const weapons = {

/* ==========================================
       WARRIOR
========================================== */
    sword_common: {

        id: "sword_common",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.common,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/sword-rarity-comum.png",

        stats: {
            attack: 5,
            armor: 0,
            agility: -2,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 1
        },

        value: 20,
        sellValue: 10

    },

    sword_uncommon: {

        id: "sword_uncommon",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.uncommon,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/sword-rarity-incomum.png",

        stats: {
            attack: 12,
            armor: 0,
            agility: -3,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 2
        },

        value: 60,
        sellValue: 30

    },

    sword_rare: {

        id: "sword_rare",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.rare,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/sword-rarity-raro.png",

        stats: {
            attack: 22,
            armor: 0,
            agility: -4,
            criticalChance: 0,
            lifeSteal: 1,
            penetration: 5
        },

        value: 180,
        sellValue: 90

    },

    sword_mystic: {

        id: "sword_mystic",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.mystic,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/sword-rarity-mistico.png",

        stats: {
            attack: 34,
            armor: 0,
            agility: -5,
            criticalChance: 0,
            lifeSteal: 2,
            penetration: 8
        },

        value: 540,
        sellValue: 270

    },

    sword_legendary: {

        id: "sword_legendary",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.legendary,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/sword-rarity-lendario.png",

        stats: {
            attack: 48,
            armor: 0,
            agility: -6,
            criticalChance: 0,
            lifeSteal: 4,
            penetration: 12
        },

        value: 1620,
        sellValue: 810

    },

    sword_ultraje: {

        id: "sword_ultraje",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.ultraje,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/sword-rarity-ultraje.png",

        stats: {
            attack: 65,
            armor: 0,
            agility: -8,
            criticalChance: 0,
            lifeSteal: 6,
            penetration: 18
        },

        value: 4860,
        sellValue: 2430

    },

/* ==========================================
       MAGE
========================================== */
    scepter_common: {

        id: "scepter_common",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.common,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/scepter-rarity-comum.png",
        stats: {
            attack: 6,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 1
        },
        value: 20,
        sellValue: 10
    },

    scepter_uncommon: {

        id: "scepter_uncommon",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.uncommon,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/scepter-rarity-incomum.png",
        stats: {
            attack: 12,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 3
        },
        value: 60,
        sellValue: 30
    },

    scepter_rare: {

        id: "scepter_rare",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.rare,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/scepter-rarity-raro.png",
        stats: {
            attack: 22,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 1,
            penetration: 6
        },
        value: 180,
        sellValue: 90
    },

    scepter_mystic: {

        id: "scepter_mystic",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.mystic,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/scepter-rarity-mistico.png",
        stats: {
            attack: 34,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 2,
            penetration: 10
        },
        value: 540,
        sellValue: 270  
    },

    scepter_legendary: {

        id: "scepter_legendary",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.legendary,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/scepter-rarity-lendario.png",
        stats: {
            attack: 48,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 4,
            penetration: 15
        },
        value: 1620,
        sellValue: 810
    },

    scepter_ultraje: {

        id: "scepter_ultraje",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.ultraje,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/scepter-rarity-ultraje.png",
        stats: {
            attack: 65,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 7,
            penetration: 22
        },
        value: 4860,
        sellValue: 2430
    },

/* ==========================================
       ARCHER
========================================== */
    arch_common: {

        id: "arch_common",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.common,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/arch-rarity-comum.png",
        stats: {
            attack: 5,
            armor: 0,
            agility: 2,
            criticalChance: 2,
            lifeSteal: 0,
            penetration: 0
        },
        value: 20,
        sellValue: 10
    },

    arch_uncommon: {

        id: "arch_uncommon",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.uncommon,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/arch-rarity-incomum.png",
        stats: {
            attack: 10,
            armor: 0,
            agility: 4,
            criticalChance: 4,
            lifeSteal: 0,
            penetration: 1
        },
        value: 60,
        sellValue: 30
    },

    arch_rare: {

        id: "arch_rare",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.rare,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/arch-rarity-raro.png",
        stats: {
            attack: 18,
            armor: 0,
            agility: 7,
            criticalChance: 7,
            lifeSteal: 0,
            penetration: 2
        },
        value: 180,
        sellValue: 90
    },

    arch_mystic: {

        id: "arch_mystic",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.mystic,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/arch-rarity-mistico.png",
        stats: {
            attack: 28,
            armor: 0,
            agility: 10,
            criticalChance: 10,
            lifeSteal: 1,
            penetration: 4
        },
        value: 540,
        sellValue: 270  
    },

    arch_legendary: {

        id: "arch_legendary",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.legendary,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/arch-rarity-lendario.png",
        stats: {
            attack: 40,
            armor: 0,
            agility: 13,
            criticalChance: 14,
            lifeSteal: 2,
            penetration: 6
        },
        value: 1620,
        sellValue: 810
    },

    arch_ultraje: {

        id: "arch_ultraje",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.ultraje,
        icon: "Eternal-Adventure/assets/img/assets/items/weapons/arch-rarity-ultraje.png",
        stats: {
            attack: 55,
            armor: 0,
            agility: 16,
            criticalChance: 18,
            lifeSteal: 3,
            penetration: 8
        },
        value: 4860,
        sellValue: 2430
    }
};

export default weapons;