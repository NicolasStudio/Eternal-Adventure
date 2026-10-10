import rarities from "./rarities.js";

const ring = {

    ringPrimalCommon: {
        id: "ringPrimalCommon",
        name: "Anel Primal",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel primitivo.",
        rarity: rarities.common,
        icon: "assets/img/assets/items/ring/ring-primal-rarity-comum.png",

        stats: {
            attack: 1,
            agility: 1
        },

        value: 80,
        sellValue: 40
    },

    ringPrimalIncommon: {
        id: "ringPrimalIncommon",
        name: "Anel Primal",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel primitivo.",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/ring/ring-primal-rarity-incomum.png",

        stats: {
            attack: 1,
            agility: 2
        },

        value: 240,
        sellValue: 120
    },

    ringPrimalRare: {
        id: "ringPrimalRare",
        name: "Anel Primal",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel primitivo.",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/ring/ring-primal-rarity-rare.png",

        stats: {
            attack: 2,
            agility: 4
        },

        value: 720,
        sellValue: 360
    },

    ringPrimalMystic: {
        id: "ringPrimalMystic",
        name: "Anel Primal",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel primitivo.",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/ring/ring-primal-rarity-mistico.png",

        stats: {
            attack: 6,
            agility: 8
        },

        value: 2160,
        sellValue: 1080
    },

    ringPrimalLegendary: {
        id: "ringPrimalLegendary",
        name: "Anel Primal",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel primitivo.",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/ring/ring-primal-rarity-lendario.png",

        stats: {
            attack: 10,
            agility: 13
        },

        value: 0,
        sellValue: 13240
    },

    ringPrimalUltraje: {
        id: "ringPrimalUltraje",
        name: "Anel Primal",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel primitivo.",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/ring/ring-primal-rarity-ultraje.png",

        stats: {
            attack: 15,
            agility: 15
        },

        value: 0,
        sellValue: 0
    },

    ringModernCommon: {
        id: "ringModernCommon",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.common,
        icon: "assets/img/assets/items/ring/ring-modern-rarity-comum.png",

        stats: {
            life: 1,
            armor: 1
        },

        value: 80,
        sellValue: 40
    },

    ringModernIncommon: {
        id: "ringModernIncommon",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/ring/ring-modern-rarity-incomum.png",

        stats: {
            life: 3,
            armor: 1
        },

        value: 240,
        sellValue: 120
    },

    ringModernRare: {
        id: "ringModernRare",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/ring/ring-modern-rarity-rare.png",

        stats: {
            life: 5,
            armor: 2
        },

        value: 720,
        sellValue: 360
    },

    ringModernMystic: {
        id: "ringModernMystic",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/ring/ring-modern-rarity-mistico.png",

        stats: {
            life: 13,
            armor: 6
        },

        value: 2160,
        sellValue: 1080
    },

    ringModernLegendary: {
        id: "ringModernLegendary",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/ring/ring-modern-rarity-lendario.png",

        stats: {
            life: 20,
            armor: 8
        },

        value: 0,
        sellValue: 13240
    },

    ringModernUltraje: {
        id: "ringModernUltraje",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/ring/ring-modern-rarity-ultraje.png",

        stats: {
            life: 35,
            armor: 10
        },

        value: 0,
        sellValue: 0
    }

}

export default ring;
