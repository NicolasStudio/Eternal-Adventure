import rarities from "./rarities.js";

const amulet = {

    amuletPrimalCommon: {
        id: "amuletPrimalCommon",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.common,
        icon: "assets/img/assets/items/amulet/amulet-primal-rarity-comum.png",

        stats: {
            attack: 1,
            agility: 1
        },

        value: 80,
        sellValue: 40
    },

    amuletPrimalIncommon: {
        id: "amuletPrimalIncommon",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/amulet/amulet-primal-rarity-incomum.png",

        stats: {
            attack: 1,
            agility: 2
        },

        value: 240,
        sellValue: 120
    },

    amuletPrimalRare: {
        id: "amuletPrimalRare",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/amulet/amulet-primal-rarity-rare.png",

        stats: {
            attack: 2,
            agility: 4
        },

        value: 720,
        sellValue: 360
    },

    amuletPrimalMystic: {
        id: "amuletPrimalMystic",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/amulet/amulet-primal-rarity-mistico.png",

        stats: {
            attack: 6,
            agility: 8
        },

        value: 2160,
        sellValue: 1080
    },

    amuletPrimalLegendary: {
        id: "amuletPrimalLegendary",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/amulet/amulet-primal-rarity-lendario.png",

        stats: {
            attack: 10,
            agility: 13
        },

        value: 0,
        sellValue: 13240
    },

    amuletPrimalUltraje: {
        id: "amuletPrimalUltraje",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/amulet/amulet-primal-rarity-ultraje.png",

        stats: {
            attack: 15,
            agility: 15
        },

        value: 0,
        sellValue: 0
    },

    amuletModernCommon: {
        id: "amuletModernCommon",
        name: "Amuleto Moderno",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto moderno.",
        rarity: rarities.common,
        icon: "assets/img/assets/items/amulet/amulet-modern-rarity-comum.png",

        stats: {
            life: 1,
            armor: 1
        },

        value: 80,
        sellValue: 40
    },

    amuletModernIncommon: {
        id: "amuletModernIncommon",
        name: "Amuleto Moderno",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto moderno.",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/amulet/amulet-modern-rarity-incomum.png",

        stats: {
            life: 3,
            armor: 1
        },

        value: 240,
        sellValue: 120
    },

    amuletModernRare: {
        id: "amuletModernRare",
        name: "Amuleto Moderno",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto moderno.",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/amulet/amulet-modern-rarity-rare.png",

        stats: {
            life: 5,
            armor: 2
        },

        value: 720,
        sellValue: 360
    },

    amuletModernMystic: {
        id: "amuletModernMystic",
        name: "Amuleto Moderno",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto moderno.",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/amulet/amulet-modern-rarity-mistico.png",

        stats: {
            life: 13,
            armor: 6
        },

        value: 2160,
        sellValue: 1080
    },

    amuletModernLegendary: {
        id: "amuletModernLegendary",
        name: "Amuleto Moderno",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto moderno.",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/amulet/amulet-modern-rarity-lendario.png",

        stats: {
            life: 20,
            armor: 8
        },

        value: 0,
        sellValue: 13240
    },

    amuletModernUltraje: {
        id: "amuletModernUltraje",
        name: "Amuleto Moderno",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto moderno.",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/amulet/amulet-modern-rarity-ultraje.png",

        stats: {
            life: 35,
            armor: 10
        },

        value: 0,
        sellValue: 0
    }

}

export default amulet;
