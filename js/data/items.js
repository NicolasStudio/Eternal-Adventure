const items = {

    smallPotion: {
        id: "smallPotion",
        name: "Poção Pequena",
        icon: "Eternal-Adventure/assets/img/assets/items/consumables/small_potion.png",

        type: "item",
        stackable: true,

        rarity: {
            id: "common",
            name: "Comum",
            color: "#FFFFFF"
        },

        quality: null,

        heal: 20,

        effect: "Recupera 20 pontos de Vida.",

        sellValue: 5
    },

    mediumPotion: {
        id: "mediumPotion",
        name: "Poção Média",
        icon: "Eternal-Adventure/assets/img/assets/items/consumables/medium_potion.png",

        type: "item",
        stackable: true,

        rarity: {
            id: "uncommon",
            name: "Incomum",
            color: "#69d823"
        },

        quality: null,

        heal: 150,

        effect: "Recupera 150 pontos de Vida.",

        sellValue: 15
    },

    largePotion: {
        id: "largePotion",
        name: "Poção Grande",
        icon: "Eternal-Adventure/assets/img/assets/items/consumables/large_potion.png",

        type: "item",
        stackable: true,

        rarity: {
            id: "rare",
            name: "Raro",
            color: "#0050fc"
        },

        quality: null,

        heal: 300,

        effect: "Recupera 300 pontos de Vida.",

        sellValue: 35
    }

};

export default items;