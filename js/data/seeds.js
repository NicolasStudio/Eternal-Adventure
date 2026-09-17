// Sementes compráveis no Mercado (aba "Sementes", a partir do nível 30 —
// ver MarketViewBuy.js). São `type:"item"` de propósito: empilham pelo
// mesmo mecanismo de poção/pedra (Player.addItem) e caem na aba "Comidas"
// do inventário (CharacterView.isFood() já reconhece category:"seed").
// `cropId` liga a semente à config de crescimento em farmCrops.js.
// `sellValue` é metade do `value` (preço de compra), igual toda semente.
const seeds = {

    seed_potato: {
        id: "seed_potato",
        name: "Semente de Batata",
        type: "item",
        category: "seed",
        cropId: "potato",
        icon: "assets/img/assets/farm/seed/seed-potato.png",
        effect: "Plante num canteiro da Fazenda para cultivar Batatas.",
        value: 100,
        sellValue: 50
    },

    seed_wheat: {
        id: "seed_wheat",
        name: "Semente de Trigo",
        type: "item",
        category: "seed",
        cropId: "wheat",
        icon: "assets/img/assets/farm/seed/seed-wheat.png",
        effect: "Plante num canteiro da Fazenda para cultivar Trigo.",
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
        value: 320,
        sellValue: 160
    },

    seed_onion: {
        id: "seed_onion",
        name: "Semente de Cebola",
        type: "item",
        category: "seed",
        cropId: "onion",
        icon: "assets/img/assets/farm/seed/seed-onion.png",
        effect: "Plante num canteiro da Fazenda para cultivar Cebolas.",
        value: 640,
        sellValue: 320
    },

    seed_corn: {
        id: "seed_corn",
        name: "Semente de Milho",
        type: "item",
        category: "seed",
        cropId: "corn",
        icon: "assets/img/assets/farm/seed/seed-corn.png",
        effect: "Plante num canteiro da Fazenda para cultivar Milho.",
        value: 800,
        sellValue: 400
    },

    seed_grape: {
        id: "seed_grape",
        name: "Semente de Uva",
        type: "item",
        category: "seed",
        cropId: "grape",
        icon: "assets/img/assets/farm/seed/seed-grape.png",
        effect: "Plante num canteiro da Fazenda para cultivar Uvas.",
        value: 1300,
        sellValue: 650
    },

    seed_strawberry: {
        id: "seed_strawberry",
        name: "Semente de Morango",
        type: "item",
        category: "seed",
        cropId: "strawberry",
        icon: "assets/img/assets/farm/seed/seed-strawberry.png",
        effect: "Plante num canteiro da Fazenda para cultivar Morangos.",
        value: 1800,
        sellValue: 900
    },

    seed_pumpkin: {
        id: "seed_pumpkin",
        name: "Semente de Abóbora",
        type: "item",
        category: "seed",
        cropId: "pumpkin",
        icon: "assets/img/assets/farm/seed/seed-pumpkin.png",
        effect: "Plante num canteiro da Fazenda para cultivar Abóboras.",
        value: 3000,
        sellValue: 1500
    }

};

export default seeds;
