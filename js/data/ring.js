import rarities from "./rarities.js";

const ring = {

    ringCommon: {
        id: "ringCommon",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.common,
        icon: "assets/img/assets/items/ring/ring-rarity-comum.png",
        
        stats: {
            life: 1,
            armor: 1
        },

        value: 80,
        sellValue: 40
    },

    ringIncommon: {
        id: "ringIncommon",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/ring/ring-rarity-incomum.png",

        stats: {
            life: 3,
            armor: 1
        },

        value: 240,
        sellValue: 120
    },

    ringRare: {
        id: "ringRare",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/ring/ring-rarity-rare.png",

        stats: {
            life: 5,
            armor: 2
        },

        value: 720,
        sellValue: 360
    },

    ringMystic: {
        id: "ringMystic",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/ring/ring-rarity-mistico.png",

        stats: {
            life: 13,
            armor: 6
        },

        value: 2160,
        sellValue: 1080
    },

    ringLegendary: {
        id: "ringLegendary",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/ring/ring-rarity-lendario.png",

        stats: {
            life:20,
            armor: 8
        },

        value: 0,
        sellValue: 13240
    },

    ringUltraje: {
        id: "ringUltraje",
        name: "Anel do Primeiro Imperador",
        type: "ring",
        slot: "ring",
        class: "all", // todas as classes podem usar
        description: "Um anel do primeiro imperador.",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/ring/ring-rarity-ultraje.png",

        stats: {
            life: 35,
            armor: 10
        },

        value: 0,
        sellValue: 0
    }

}

export default ring;