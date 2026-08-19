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
            lifeSteal: 0,
            penetration: 0,
            absorption: 2
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
            lifeSteal: 0,
            penetration: 0,
            absorption: 5
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
            lifeSteal: 0,
            penetration: 0,
            absorption: 6
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
            lifeSteal: 0,
            penetration: 0,
            absorption: 10
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
            lifeSteal: 0,
            penetration: 0,
            absorption: 11
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
            lifeSteal: 0,
            penetration: 0,
            absorption: 15
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
            penetration: 2
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
            penetration: 5
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
            attack: 22,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 6
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
            attack: 34,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 10
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
            penetration: 11
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
            penetration: 15
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
            criticalChance: 2,
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
            criticalChance: 5,
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
            criticalChance: 6,
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
            agility: 8,
            criticalChance: 10,
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
            agility: 9,
            criticalChance: 11,
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
            agility: 11,
            criticalChance: 15,
            lifeSteal: 0,
            penetration: 0
        },
        value: 0,
        sellValue: 0
    },

/* ==========================================
       BARBARIAN
========================================== */
    ax_common: {

        id: "ax_common",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/ax-rarity-comum.png",
        stats: {
            attack: 4,
            armor: 0,
            agility: 1,
            criticalChance: 0,
            lifeSteal: 2,
            penetration: 0,
            absorption: 0
        },
        value: 120,
        sellValue: 60
    },

    ax_uncommon: {

        id: "ax_uncommon",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/ax-rarity-incomum.png",
        stats: {
            attack: 9,
            armor: 0,
            agility: 2,
            criticalChance: 0,
            lifeSteal: 5,
            penetration: 0,
            absorption: 0
        },
        value: 360,
        sellValue: 180
    },

    ax_rare: {

        id: "ax_rare",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/ax-rarity-raro.png",
        stats: {
            attack: 15,
            armor: 0,
            agility: 3,
            criticalChance: 0,
            lifeSteal: 6,
            penetration: 0,
            absorption: 0
        },
        value: 1080,
        sellValue: 540
    },

    ax_mystic: {

        id: "ax_mystic",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/ax-rarity-mistico.png",
        stats: {
            attack: 30,
            armor: 0,
            agility: 5,
            criticalChance: 0,
            lifeSteal: 10,
            penetration: 0,
            absorption: 0
        },
        value: 3240,
        sellValue: 1620
    },

    ax_legendary: {

        id: "ax_legendary",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/ax-rarity-lendario.png",
        stats: {
            attack: 42,
            armor: 0,
            agility: 7,
            criticalChance: 0,
            lifeSteal: 11,
            penetration: 0,
            absorption: 0
        },
        value: 9720,
        sellValue: 4860
    },

    ax_ultraje: {

        id: "ax_ultraje",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/ax-rarity-ultraje.png",
        stats: {
            attack: 57,
            armor: 0,
            agility: 9,
            criticalChance: 0,
            lifeSteal: 15,
            penetration: 0,
            absorption: 0
        },
        value: 0,
        sellValue: 0
    }
};

export default weapons;