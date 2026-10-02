// Atributos de nível 1, antes de qualquer bônus de level up — usados
// tanto por Player.createBaseStats() quanto pelo StatsMigrationService
// (que precisa do mesmo ponto de partida pra recalcular saves antigos).
export default {
    warrior: { attack: 5, armor: 5, agility: 1, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    archer: { attack: 6, armor: 3, agility: 7, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    mage: { attack: 8, armor: 2, agility: 5, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    barbarian: { attack: 7, armor: 4, agility: 4, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    // Dano médio (menos que Mago/Arqueiro), um pouco mais de Vida (ver
    // levels.js) e Agilidade rápida mas atrás do Arqueiro. O único
    // especial da classe é o Miasma, que vem 100% do equipamento.
    putrid: { attack: 6, armor: 3, agility: 4, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    // Dano baixo (o mais baixo do jogo) — compensado pela Mímica, que
    // soma % do Ataque/Armadura/Agilidade do inimigo aos dela em todo
    // golpe (ver MimicService.js). Armadura é a maior do jogo ("item de
    // ataque é um espelho") e Agilidade fica acima da média. O Ataque
    // próprio é reforçado até o nível 25 (levels.js) pra não punir o
    // início, quando o inimigo ainda bate fraco e a cópia rende pouco.
    mimic: { attack: 5, armor: 5, agility: 5, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
};
