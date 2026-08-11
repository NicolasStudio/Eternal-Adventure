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
        none: 800,
        ordinary: 1500,
        mediocre: 3000,
        exceptional: 0
    },

    armor: {
        none: 800,
        ordinary: 1500,
        mediocre: 3000,
        exceptional: 0
    }

};

export default upgradeCosts;
