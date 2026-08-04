const rarities = {
    common: {
        id: "common",
        name: "Comum",
        color: "#FFFFFF",
        dropChance: 50,
        qualityStep: 2,
        secondaryCap: 8
    },

    uncommon: {
        id: "uncommon",
        name: "Incomum",
        color: "#69d823",
        dropChance: 25,
        qualityStep: 3,
        secondaryCap: 14
    },

    rare: {
        id: "rare",
        name: "Raro",
        color: "#0050fc",
        dropChance: 15,
        qualityStep: 5,
        secondaryCap: 20
    },

    mystic: {
        id: "mystic",
        name: "Místico",
        color: "#a950f7",
        dropChance: 7,
        qualityStep: 7,
        secondaryCap: 28
    },

    legendary: {
        id: "legendary",
        name: "Lendário",
        color: "#ff711f",
        dropChance: 2.5,
        qualityStep: 10,
        secondaryCap: 35
    },

    ultraje: {
        id: "ultraje",
        name: "Ultraje",
        color: "#ff0000",
        dropChance: 0,
        qualityStep: 12,
        secondaryCap: 45
    }   
};

export default rarities;