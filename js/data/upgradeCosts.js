/*
    Custo (em ouro) para melhorar um item de UMA qualidade para a próxima.

    A chave usada é a qualidade ATUAL do item (antes da melhoria).
    Ex: upgradeCosts.weapon.ordinary é o custo para ir de
    "ordinary" -> "mediocre".

    "exceptional" -> "lendary" só existe pra itens de raridade Lendária
    (ver UpgradeService.getQualityOrder) — nas outras raridades
    "exceptional" é o máximo e esse custo nunca é cobrado.
    "lendary" é a qualidade máxima de todas, por isso custa 0.
*/
const upgradeCosts = {

    weapon: {
        none: 800,
        ordinary: 1500,
        mediocre: 3000,
        exceptional: 125000,
        lendary: 0
    },

    armor: {
        none: 800,
        ordinary: 1500,
        mediocre: 3000,
        exceptional: 125000,
        lendary: 0
    }

};

export default upgradeCosts;
