import experience from "./experience.js";

/*
    XP concedida por monstro, de acordo com o NÍVEL do monstro (não o
    nível do jogador). Calculada a partir do que o jogo realmente
    exige pra subir de nível (experience.js) — não é um número solto,
    é o valor bruto exigido pra alcançar o PRÓXIMO nível, dividido
    por um "ritmo de farm" (quantos monstros deveriam bastar pra
    subir um nível).

    Isso é importante: o campo "required" de experience.js NÃO é uma
    diferença entre níveis, é o valor cheio que o jogo compara contra
    a XP atual do personagem (que reseta a cada level up). Uma tabela
    de recompensa que não seguir essa mesma escala deixa o jogo
    ou impossível de upar (recompensa pequena demais) ou upando
    instantaneamente (recompensa grande demais).

    Pra ajustar o ritmo de XP do jogo inteiro, mexe só no
    KILLS_PER_LEVEL abaixo — não precisa tocar em cada monstro.
*/
const KILLS_PER_LEVEL = 8;

const xpByLevel = {};

for (let level = 1; level <= 100; level++) {

    // XP exigida pra alcançar o PRÓXIMO nível a partir deste — é
    // esse valor que precisa ser "dividido" entre os monstros mortos.
    const nextLevelData = experience[level + 1] ?? experience[level];
    const requiredForNext = nextLevelData?.required ?? experience[level].required;

    xpByLevel[level] = Math.max(10, Math.round(requiredForNext / KILLS_PER_LEVEL));

}

export default xpByLevel;
