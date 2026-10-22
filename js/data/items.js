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
        buyValue: 50,
        sellValue: 17
    },

    tripleSmallPotion: {
        id: "tripleSmallPotion",
        name: "Tripla Poção Pequena",
        icon: "assets/img/assets/items/consumables/triple_small_potion.png",
        type: "item",
        stackable: true,

        rarity: {
            id: "uncommon",
            name: "Incomum",
            color: "#69d823"
        },

        quality: null,
        heal: 75,
        effect: "Recupera 75 pontos de Vida.",
        buyValue: 150,
        sellValue: 50
    },

    mediumPotion: {
        id: "mediumPotion",
        name: "Poção Média",
        icon: "assets/img/assets/items/consumables/medium_potion.png",
        type: "item",
        stackable: true,

        rarity: {
            id: "rare",
            name: "Raro",
            color: "#0050fc"
        },

        quality: null,
        heal: 200,
        effect: "Recupera 200 pontos de Vida.",
        buyValue: 250,
        sellValue: 100
    },

    tripleMediumPotion: {
        id: "tripleMediumPotion",
        name: "Tripla Poção Média",
        icon: "assets/img/assets/items/consumables/triple_medium_potion.png",
        type: "item",
        stackable: true,

        rarity: {
            id: "mystic",
            name: "Místico",
            color: "#a950f7"
        },

        quality: null,
        heal: 600,
        effect: "Recupera 600 pontos de Vida.",
        buyValue: 800,
        sellValue: 250
    },

    largePotion: {
        id: "largePotion",
        name: "Poção Grande",
        icon: "assets/img/assets/items/consumables/large_potion.png",
        type: "item",
        stackable: true,

        rarity: {
            id: "legendary",
            name: "Lendário",
            color: "#ff711f"
        },

        quality: null,
        heal: 1000,
        effect: "Recupera 1000 pontos de Vida.",
        buyValue: 2500,
        sellValue: 500
    },

    tripleLargePotion: {
        id: "tripleLargePotion",
        name: "Tripla Poção Grande",
        icon: "assets/img/assets/items/consumables/triple_large_potion.png",
        type: "item",
        stackable: true,

        rarity: {
            id: "ultraje",
            name: "Ultraje",
            color: "#ff0000"
        },

        quality: null,
        heal: 3000,
        effect: "Recupera 3000 pontos de Vida.",
        buyValue: 7500,
        sellValue: 3050
    },

    // Pote de XP — consumível que dá experiência direto, usado pelo
    // inventário igual uma poção (campo `xp`, ver
    // CharacterView.useXpPotion). Ainda sem drop nem loja: por enquanto só
    // entra no jogo dado à mão. Sem sellValue: não dá pra vender.
    xpPotion5: {
        id: "xpPotion5",
        name: "Pote de XP Nível 5",
        icon: "assets/img/assets/items/pot_xp/pot_xp5.png",
        type: "item",
        stackable: true,

        rarity: {
            id: "legendary",
            name: "Lendário",
            color: "#ff711f"
        },

        quality: null,
        xp: 20000,
        effect: "Concede 20.000 de experiência."
    },

    // Fusão de Equipamentos (ver FusionService.js/BlacksmithFusion.js) —
    // `fusionProtection: true` é o único campo que a Fusão checa pra
    // aceitar um item no 5º slot (não precisa ser este item específico,
    // qualquer item com essa flag serve). Esse aqui NÃO cura (sem campo
    // `heal`) — por isso fica fora da aba "Itens" do botão genérico de
    // "usar" (ver CharacterView.js, que só mostra o botão de uso pra
    // item com `heal`), só pode ser consumido de verdade dentro da tela
    // de Fusão.
    luckProtection: {
        id: "luckProtection",
        name: "Proteção de Sorte",
        icon: "assets/img/assets/items/fusion/luck-protect.png",
        type: "item",
        stackable: true,

        quality: null,
        fusionProtection: true,
        effect: "Protege você de uma falha, evitando que você perca seus itens durante uma fusão. Quando a fusão falha, esse item é destruído no lugar dos seus equipamentos — porém isso NÃO vale para o ouro gasto.",
        buyValue: 30000,
        sellValue: 10000
    },

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