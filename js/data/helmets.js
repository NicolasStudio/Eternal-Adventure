import rarities from "./rarities.js";

const helmets = {

/* ==========================================
       WARRIOR
========================================== */
    helmet_warrior_common: {

        id: "helmet_warrior_common",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-comum.png",

        stats: {
            armor: 3,
            lifeSteal: 1
        },

        value: 80,
        sellValue: 40

    },

    helmet_warrior_uncommon: {

        id: "helmet_warrior_uncommon",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-incomum.png",

        stats: {
            armor: 5,
            lifeSteal: 2
        },

        value: 240,
        sellValue: 120

    },

    helmet_warrior_rare: {

        id: "helmet_warrior_rare",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-rare.png",

        stats: {
            armor: 8,
            lifeSteal: 3
        },

        value: 720,
        sellValue: 360

    },

    helmet_warrior_mystic: {

        id: "helmet_warrior_mystic",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-mistico.png",

        stats: {
            armor: 12,
            lifeSteal: 5
        },

        value: 2160,
        sellValue: 1080

    },

    helmet_warrior_legendary: {

        id: "helmet_warrior_legendary",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-lendario.png",

        stats: {
            armor: 18,
            lifeSteal: 7
        },

        value: 6480,
        sellValue: 3240

    },

    helmet_warrior_ultraje: {

        id: "helmet_warrior_ultraje",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-ultraje.png",

        stats: {
            armor: 25,
            lifeSteal: 10
        },

        value: 0,
        sellValue: 0

    },
        
/* ==========================================
       MAGE
========================================== */
    helmet_mage_common: {

        id: "helmet_mage_common",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-comum.png",

        stats: {
            armor: 2,
            penetration: 1
        },

        value: 80,
        sellValue: 40

    },

    helmet_mage_uncommon: {

        id: "helmet_mage_uncommon",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-incomum.png",

        stats: {
            armor: 4,
            penetration: 2
        },

        value: 240,
        sellValue: 120

    },

    helmet_mage_rare: {

        id: "helmet_mage_rare",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-rare.png",

        stats: {
            armor: 6,
            penetration: 4
        },

        value: 720,
        sellValue: 360

    },

    helmet_mage_mystic: {

        id: "helmet_mage_mystic",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-mistico.png",

        stats: {
            armor: 9,
            penetration: 6
        },

        value: 2160,
        sellValue: 1080

    },

    helmet_mage_legendary: {

        id: "helmet_mage_legendary",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-lendario.png",

        stats: {
            armor: 14,
            penetration: 9
        },

        value: 6480,
        sellValue: 3240

    },

    helmet_mage_ultraje: {

        id: "helmet_mage_ultraje",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-ultraje.png",

        stats: {
            armor: 20,
            penetration: 13
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       ARCHER
========================================== */
    helmet_archer_common: {

        id: "helmet_archer_common",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-comum.png",

        stats: {
            armor: 2,
            criticalChance: 2
        },

        value: 80,
        sellValue: 40

    },

    helmet_archer_uncommon: {

        id: "helmet_archer_uncommon",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-incomum.png",

        stats: {
            armor: 4,
            criticalChance: 4
        },

        value: 240,
        sellValue: 120

    },

    helmet_archer_rare: {

        id: "helmet_archer_rare",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-rare.png",

        stats: {
            armor: 6,
            criticalChance: 6
        },

        value: 720,
        sellValue: 360

    },

    helmet_archer_mystic: {

        id: "helmet_archer_mystic",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-mistico.png",

        stats: {
            armor: 9,
            criticalChance: 9
        },

        value: 2160,
        sellValue: 1080

    },

    helmet_archer_legendary: {

        id: "helmet_archer_legendary",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-lendario.png",

        stats: {
            armor: 14,
            criticalChance: 13
        },

        value: 6480,
        sellValue: 3240

    },

    helmet_archer_ultraje: {

        id: "helmet_archer_ultraje",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-ultraje.png",

        stats: {
            armor: 20,
            criticalChance: 18
        },

        value: 0,
        sellValue: 0

    },
};

export default helmets;