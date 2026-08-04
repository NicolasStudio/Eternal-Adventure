const items = {

    smallPotion: {
        id: "smallPotion",
        name: "Poção Pequena",
        icon: "assets/img/assets/items/consumables/small_potion.png",

        type: "item",
        stackable: true,

        rarity: {
            id: "common",
            name: "Comum",
            color: "#FFFFFF"
        },

        quality: null,

        heal: 25,

        effect: "Recupera 25 pontos de Vida.",

        buyValue: 25,
        sellValue: 7
    },

    mediumPotion: {
        id: "mediumPotion",
        name: "Poção Média",
        icon: "assets/img/assets/items/consumables/medium_potion.png",

        type: "item",
        stackable: true,

        rarity: {
            id: "uncommon",
            name: "Incomum",
            color: "#69d823"
        },

        quality: null,

        heal: 100,

        effect: "Recupera 100 pontos de Vida.",

        buyValue: 150,
        sellValue: 20
    },

    // largePotion: {
    //     id: "largePotion",
    //     name: "Poção Grande",
    //     icon: "assets/img/assets/items/consumables/large_potion.png",

    //     type: "item",
    //     stackable: true,

    //     rarity: {
    //         id: "rare",
    //         name: "Raro",
    //         color: "#0050fc"
    //     },

    //     quality: null,

    //     heal: 300,

    //     effect: "Recupera 300 pontos de Vida.",

    //     buyValue: 70,
    //     sellValue: 35
    // }

};

/**
 * Retorna todos os itens em formato de Array.
 */
export function getAllItems() {

    return Object.values(items);

}

/**
 * Busca um item pelo ID.
 */
export function getItemById(id) {

    return Object.values(items).find(item => item.id === id) ?? null;

}

export default items;