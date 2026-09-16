// Sementes compráveis no Mercado (aba "Sementes", a partir do nível 30 —
// ver MarketViewBuy.js). São `type:"item"` de propósito: empilham pelo
// mesmo mecanismo de poção/pedra (Player.addItem) e caem sozinhas na aba
// "Itens" do inventário (CharacterView.getFilteredInventory() já filtra
// por type==="item", não precisa de aba própria lá). `category:"seed"` é
// só um marcador extra pra identificar semente sem mexer nesse filtro —
// usado pelo Mercado (aba própria) e pela Fazenda (seletor de plantio).
// `cropId` liga a semente à config de crescimento em farmCrops.js.
const seeds = {

    seed_potato: {
        id: "seed_potato",
        name: "Semente de Batata",
        type: "item",
        category: "seed",
        cropId: "potato",
        icon: "assets/img/assets/farm/seed/seed-potato.png",
        effect: "Plante num canteiro da Fazenda para cultivar Batatas.",
        value: 150,
        sellValue: 75
    },

    seed_leek: {
        id: "seed_leek",
        name: "Semente de Alho-Poró",
        type: "item",
        category: "seed",
        cropId: "leek",
        icon: "assets/img/assets/farm/seed/seed-leek.png",
        effect: "Plante num canteiro da Fazenda para cultivar Alho-Poró.",
        value: 450,
        sellValue: 225
    },

    seed_onion: {
        id: "seed_onion",
        name: "Semente de Cebola",
        type: "item",
        category: "seed",
        cropId: "onion",
        icon: "assets/img/assets/farm/seed/seed-onion.png",
        effect: "Plante num canteiro da Fazenda para cultivar Cebolas.",
        value: 800,
        sellValue: 400
    },

    seed_strawberry: {
        id: "seed_strawberry",
        name: "Semente de Morango",
        type: "item",
        category: "seed",
        cropId: "strawberry",
        icon: "assets/img/assets/farm/seed/seed-strawberry.png",
        effect: "Plante num canteiro da Fazenda para cultivar Morangos.",
        value: 1200,
        sellValue: 600
    }

};

export default seeds;
