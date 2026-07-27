const rarities = {
    common: {
        id: "common",
        name: "Comum",
        color: "#FFFFFF",
        dropChance: 50,
        qualityStep: 2
    },

    uncommon: {
        id: "uncommon",
        name: "Incomum",
        color: "#69d823",
        dropChance: 25,
        qualityStep: 3
    },

    rare: {
        id: "rare",
        name: "Raro",
        color: "#0050fc",
        dropChance: 15,
        qualityStep: 5
    },

    mystic: {
        id: "mystic",
        name: "Místico",
        color: "#a950f7",
        dropChance: 7,
        qualityStep: 7
    },

    legendary: {
        id: "legendary",
        name: "Lendário",
        color: "#ff711f",
        dropChance: 2.5,
        qualityStep: 10
    },

    ultraje: {
        id: "ultraje",
        name: "Ultraje",
        color: "#ff0000",
        dropChance: 0,
        qualityStep: 12
    }   
};

export default rarities;