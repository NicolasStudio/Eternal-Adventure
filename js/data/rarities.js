// minLevel: nível mínimo do PERSONAGEM pra poder EQUIPAR um item dessa
// raridade (ver Player.equipItem) — não tem a ver com em que nível a
// dungeon começa a soltar o item, só com poder usá-lo depois de já tê-lo
// em mãos. Ultraje ainda não existe em drop nenhum (dropChance 0 — deve
// virar prêmio de torneio no futuro); 100 é só um teto seguro provisório.
const rarities = {
    common: {
        id: "common",
        name: "Comum",
        color: "#FFFFFF",
        dropChance: 50,
        qualityStep: 2,
        minLevel: 1
    },

    uncommon: {
        id: "uncommon",
        name: "Incomum",
        color: "#69d823",
        dropChance: 25,
        qualityStep: 3,
        minLevel: 10
    },

    rare: {
        id: "rare",
        name: "Raro",
        color: "#0050fc",
        dropChance: 15,
        qualityStep: 5,
        minLevel: 20
    },

    mystic: {
        id: "mystic",
        name: "Místico",
        color: "#a950f7",
        dropChance: 7,
        qualityStep: 7,
        minLevel: 40
    },

    legendary: {
        id: "legendary",
        name: "Lendário",
        color: "#ff711f",
        dropChance: 5,
        qualityStep: 10,
        minLevel: 100
    },

    ultraje: {
        id: "ultraje",
        name: "Ultraje",
        color: "#ff0000",
        dropChance: 0,
        qualityStep: 12,
        minLevel: 100
    }
};

export default rarities;