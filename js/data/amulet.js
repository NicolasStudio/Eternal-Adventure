import rarities from "./rarities.js";

const amulet = {

    amuletCommon: {
        id: "amuletCommon",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.common,
        icon: "assets/img/assets/items/amulet/amulet-rarity-comum.png",
        
        stats: {
            attack: 1,
            agility: 1
        },

        value: 80,
        sellValue: 40
    },

    amuletIncommon: {
        id: "amuletIncommon",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/amulet/amulet-rarity-incomum.png",

        stats: {
            attack: 1,
            agility: 2
        },

        value: 240,
        sellValue: 120
    },
    
    amuletRare: {
        id: "amuletRare",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/amulet/amulet-rarity-rare.png",

        stats: {
            attack: 2,
            agility: 4
        },

        value: 720,
        sellValue: 360
    },

    amuletMystic: {
        id: "amuletMystic",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/amulet/amulet-rarity-mistico.png",

        stats: {
            attack: 6,
            agility: 8
        },

        value: 2160,
        sellValue: 1080
    },

    amuletLegendary: {
        id: "amuletLegendary",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/amulet/amulet-rarity-lendario.png",

        stats: {
            attack: 10,
            agility: 13
        },

        value: 0,
        sellValue: 13240
    },

    amuletUltraje: {
        id: "amuletUltraje",
        name: "Amuleto Primal",
        type: "amulet",
        slot: "amulet",
        class: "all", // todas as classes podem usar
        description: "Um amuleto primitivo.",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/amulet/amulet-rarity-ultraje.png",

        stats: {
            attack: 15,
            agility: 15
        },

        value: 0,
        sellValue: 0
    }
}

export default amulet;