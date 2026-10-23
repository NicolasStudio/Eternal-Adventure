// Produtos de animais do Celeiro (ver FarmView.js) — diferente da
// colheita da Fazenda (farmCrops.js), esses itens NUNCA têm
// petFeedValue: não servem de alimento pro pet nem têm nenhum outro uso,
// só dá pra vender (sellValue). category:"food" é só pra cair na aba
// "Comidas" do inventário (CharacterView.isFood() reconhece essa
// categoria, igual já faz com "seed"/"ration"), não quer dizer "pode
// comer".
const animalProducts = {

    egg: {
        id: "egg",
        name: "Ovo",
        type: "item",
        category: "food",
        icon: "assets/img/assets/farm/food/egg.png",
        effect: "Um ovo colhido da galinha do Celeiro. Não pode ser usado, só vendido.",
        sellValue: 50
    },

    eggLuck: {
        id: "egg_luck",
        name: "Ovo Sortudo",
        type: "item",
        category: "food",
        icon: "assets/img/assets/farm/food/egg-luck.png",
        effect: "Um ovo raro, com uma pontinha de sorte, bem mais valioso que o normal. Não pode ser usado, só vendido.",
        sellValue: 500
    }

};

export default animalProducts;
