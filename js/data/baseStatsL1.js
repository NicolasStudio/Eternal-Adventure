// Atributos de nível 1, antes de qualquer bônus de level up — usados
// tanto por Player.createBaseStats() quanto pelo StatsMigrationService
// (que precisa do mesmo ponto de partida pra recalcular saves antigos).
export default {
    warrior: { attack: 5, armor: 5, agility: 1, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    archer: { attack: 6, armor: 3, agility: 7, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    mage: { attack: 8, armor: 2, agility: 5, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    barbarian: { attack: 7, armor: 4, agility: 4, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
};
