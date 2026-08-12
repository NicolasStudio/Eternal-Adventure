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
        icon: "assets/img/assets/items/weapons/sword-rarity-comum.png",

        stats: {
            attack: 4,
            armor: 0,
            agility: -4,
            criticalChance: 0,
            lifeSteal: 1,
            penetration: 0
        },

        value: 120,
        sellValue: 60

    },

    sword_uncommon: {

        id: "sword_uncommon",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/sword-rarity-incomum.png",

        stats: {
            attack: 10,
            armor: 0,
            agility: -2,
            criticalChance: 0,
            lifeSteal: 1,
            penetration: 0
        },

        value: 360,
        sellValue: 180

    },

    sword_rare: {

        id: "sword_rare",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/sword-rarity-raro.png",

        stats: {
            attack: 17,
            armor: 0,
            agility: -2,
            criticalChance: 0,
            lifeSteal: 3,
            penetration: 0
        },

        value: 1080,
        sellValue: 540

    },

    sword_mystic: {

        id: "sword_mystic",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/sword-rarity-mistico.png",

        stats: {
            attack: 34,
            armor: 0,
            agility: -5,
            criticalChance: 0,
            lifeSteal: 7,
            penetration: 0
        },

        value: 3240,
        sellValue: 1620

    },

    sword_legendary: {

        id: "sword_legendary",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/sword-rarity-lendario.png",

        stats: {
            attack: 48,
            armor: 0,
            agility: -6,
            criticalChance: 0,
            lifeSteal: 12,
            penetration: 0
        },

        value: 9720,
        sellValue: 4860

    },

    sword_ultraje: {

        id: "sword_ultraje",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/sword-rarity-ultraje.png",

        stats: {
            attack: 65,
            armor: 0,
            agility: -8,
            criticalChance: 0,
            lifeSteal: 18,
            penetration: 0
        },

        value: 0,
        sellValue: 0

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
        icon: "assets/img/assets/items/weapons/scepter-rarity-comum.png",
        stats: {
            attack: 6,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 1
        },
        value: 120,
        sellValue: 60
    },

    scepter_uncommon: {

        id: "scepter_uncommon",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/scepter-rarity-incomum.png",
        stats: {
            attack: 12,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 1
        },
        value: 360,
        sellValue: 180
    },

    scepter_rare: {

        id: "scepter_rare",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/scepter-rarity-raro.png",
        stats: {
            attack: 24,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 3
        },
        value: 1080,
        sellValue: 540
    },

    scepter_mystic: {

        id: "scepter_mystic",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/scepter-rarity-mistico.png",
        stats: {
            attack: 36,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 7
        },
        value: 3240,
        sellValue: 1620  
    },

    scepter_legendary: {

        id: "scepter_legendary",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/scepter-rarity-lendario.png",
        stats: {
            attack: 48,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 12
        },
        value: 9720,
        sellValue: 4860
    },

    scepter_ultraje: {

        id: "scepter_ultraje",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/scepter-rarity-ultraje.png",
        stats: {
            attack: 65,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 18
        },
        value: 0,
        sellValue: 0
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
        icon: "assets/img/assets/items/weapons/arch-rarity-comum.png",
        stats: {
            attack: 5,
            armor: 0,
            agility: 2,
            criticalChance: 1,
            lifeSteal: 0,
            penetration: 0
        },
        value: 120,
        sellValue: 60
    },

    arch_uncommon: {

        id: "arch_uncommon",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/arch-rarity-incomum.png",
        stats: {
            attack: 9,
            armor: 0,
            agility: 4,
            criticalChance: 1,
            lifeSteal: 0,
            penetration: 0
        },
        value: 360,
        sellValue: 180
    },

    arch_rare: {

        id: "arch_rare",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/arch-rarity-raro.png",
        stats: {
            attack: 18,
            armor: 0,
            agility: 7,
            criticalChance: 3,
            lifeSteal: 0,
            penetration: 0
        },
        value: 1080,
        sellValue: 540
    },

    arch_mystic: {

        id: "arch_mystic",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/arch-rarity-mistico.png",
        stats: {
            attack: 28,
            armor: 0,
            agility: 4,
            criticalChance: 7,
            lifeSteal: 0,
            penetration: 0
        },
        value: 3240,
        sellValue: 1620  
    },

    arch_legendary: {

        id: "arch_legendary",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/arch-rarity-lendario.png",
        stats: {
            attack: 40,
            armor: 0,
            agility: 5,
            criticalChance: 12,
            lifeSteal: 0,
            penetration: 0
        },
        value: 9720,
        sellValue: 4860
    },

    arch_ultraje: {

        id: "arch_ultraje",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/arch-rarity-ultraje.png",
        stats: {
            attack: 55,
            armor: 0,
            agility: 6,
            criticalChance: 18,
            lifeSteal: 0,
            penetration: 0
        },
        value: 0,
        sellValue: 0
    }
};

export default weapons;