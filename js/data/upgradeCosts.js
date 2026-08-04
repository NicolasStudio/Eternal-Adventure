/*
    Custo (em ouro) para melhorar um item de UMA qualidade para a próxima.

    A chave usada é a qualidade ATUAL do item (antes da melhoria).
    Ex: upgradeCosts.weapon.ordinary é o custo para ir de
    "ordinary" -> "mediocre".

    "exceptional" é a qualidade máxima, por isso custa 0
    (não existe próxima melhoria).
*/
const upgradeCosts = {

    weapon: {
        none: 250,
        ordinary: 700,
        mediocre: 1400,
        exceptional: 0
    },

    armor: {
        none: 200,
        ordinary: 650,
        mediocre: 1200,
        exceptional: 0
    }

};

export default upgradeCosts;
