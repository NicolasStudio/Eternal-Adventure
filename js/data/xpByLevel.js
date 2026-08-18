/*
    XP concedida por monstro, de acordo com o NÍVEL do monstro (não o
    nível do jogador) — fórmula simples: nível × 10.

    A partir do nível 70, a XP recebe um reforço extra em cima disso
    (multiplicador crescente), pra compensar o quanto fica mais lento
    upar no fim de jogo.

    Chefes de dungeon dão 3.5x esse valor (aplicado em
    LootSystem.js, não aqui — essa tabela guarda só o valor "base").
*/
const LATE_GAME_LEVEL = 70;
const LATE_GAME_BONUS_PER_LEVEL = 0.02; // +2% por nível acima de 70

const xpByLevel = {};

for (let level = 1; level <= 100; level++) {

    const base = level * 10;

    const lateGameMultiplier = level > LATE_GAME_LEVEL
        ? 1 + (level - LATE_GAME_LEVEL) * LATE_GAME_BONUS_PER_LEVEL
        : 1;

    xpByLevel[level] = Math.round(base * lateGameMultiplier);

}

export default xpByLevel;
