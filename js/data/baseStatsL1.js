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
    // O canhão de vidro do jogo: maior Ataque e Agilidade, menor
    // Armadura e Vida de todas as 7 classes (ver levels.js — no nível
    // 100 fecha em Vida 850/Ataque 172/Armadura 15/Agilidade 170).
    // Ganhou um pouco mais de Armadura e um pouco menos de Ataque a
    // partir do nível 51 (era Ataque 180/Armadura 8 no nível 100),
    // depois de simulações mostrarem ela perdendo quase sempre contra
    // Guerreiro e Pútrido em níveis altos. O especial dela é Confusão
    // (ver ConfusionService.js), 100% vindo do equipamento, igual o
    // Miasma do Pútrido.
    crazy: { attack: 8, armor: 1, agility: 7, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    // Parecido com o Mago: dano alto, mas um pouco abaixo (ver
    // levels.js — no nível 100 fecha em Vida 1200/Ataque 150/Armadura
    // 60/Agilidade 120, contra Vida 1291/Ataque 162/Armadura 14/
    // Agilidade 90 do Mago). Diferente dele, Armadura e Agilidade ficam
    // medianas em vez de extremas — não é um canhão de vidro. O
    // especial dele é Paralisia (ver ParalysisService.js), 100% vindo
    // do equipamento, igual a Confusão da Louca.
    spark: { attack: 7, armor: 4, agility: 5, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    // Ataque médio — desenhado "pela metade" de propósito (ver
    // levels.js — no nível 100 fecha em Vida 1150/Ataque 105/Armadura
    // 62/Agilidade 138), compensado pelo Golpe Duplo (ver
    // DoubleStrikeService.js): chance de acertar o MESMO dano uma
    // segunda vez no mesmo golpe, 100% vindo do equipamento. Agilidade
    // alta, mas bem atrás do Arqueiro; Armadura e Vida medianas.
    samurai: { attack: 6, armor: 4, agility: 6, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
    // Dano um pouco acima do Bárbaro (ver levels.js — no nível 100 fecha
    // em Vida 1700/Ataque 132/Armadura 56/Agilidade 62, contra Vida 988/
    // Ataque 124/Armadura 67/Agilidade 113 do Bárbaro). Armadura parecida
    // com a do Pútrido (56). Agilidade baixa, só na frente do Guerreiro
    // (o mais lento do jogo). Vida um pouco abaixo do Guerreiro (1750). O
    // especial dela é Pressão Gravitacional (ver GravityService.js), 100%
    // vindo do equipamento, igual os outros especiais por %.
    singularity: { attack: 7, armor: 3, agility: 2, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0 },
};
