/*
    XP concedida por monstro, de acordo com o NÍVEL do monstro (não o
    nível do jogador). Cresce de forma linear e previsível — cada
    nível vale +5 XP a mais que o anterior — então dá pra olhar essa
    tabela e saber exatamente quanto qualquer monstro de qualquer
    nível vai dar, sem precisar calcular nada.

    Chefes de dungeon dão 3.5x esse valor (aplicado em
    LootSystem.js, não aqui — essa tabela guarda só o valor "base").

    Pra ajustar o ritmo de XP do jogo inteiro, mexe só aqui — não
    precisa tocar em cada um dos monstros individualmente.
*/
const xpByLevel = {};

for (let level = 1; level <= 100; level++) {
    xpByLevel[level] = 20 + level * 5;
}

export default xpByLevel;
