import levels from "../data/levels.js";
import legacyLevels_v1 from "../data/legacyLevels_v1.js";
import baseStatsL1 from "../data/baseStatsL1.js";

// Sobe toda vez que a curva de levels.js (ou o formato de baseStats)
// muda de um jeito que precisa recalcular personagens já existentes —
// não é a mesma coisa que SAVE_VERSION (esse é sobre o FORMATO do
// arquivo de save, não sobre o balanceamento das classes).
//
// v1: curva original (Guerreiro com Roubo de Vida como especial, sem
//     Absorção, sem Bárbaro).
// v2: reequilíbrio — Guerreiro ganha Absorção como especial (Roubo de
//     Vida vira secundário), Arqueiro/Mago suavizados, Bárbaro criado.
export const CURRENT_BALANCE_VERSION = 2;

const STAT_KEYS = ["attack", "armor", "agility", "criticalChance", "lifeSteal", "penetration", "absorption"];

const LEGACY_TABLES = {
    1: legacyLevels_v1
};

export default class StatsMigrationService {

    // Soma o levels.js (ou uma tabela antiga equivalente) do nível 1 até
    // `level`, pra uma classe — o mesmo cálculo que Player.applyLevelBonus()
    // faz um nível de cada vez durante o jogo normal, só que de uma vez.
    static cumulative(table, classId, level) {

        const base1 = baseStatsL1[classId];

        const stats = { life: 100, ...(base1 ?? {}) };

        for (const key of STAT_KEYS) stats[key] ??= 0;

        for (let lvl = 2; lvl <= level; lvl++) {

            const bonus = table[lvl]?.[classId];

            if (!bonus) continue;

            stats.life += bonus.life ?? 0;

            for (const key of STAT_KEYS) stats[key] += bonus[key] ?? 0;

        }

        return stats;

    }

    // Recalcula baseStats/maxHP de um personagem salvo numa versão de
    // balanceamento antiga, MANTENDO qualquer bônus que ele já tinha
    // ganho além da curva pura de level up (pedra de encantamento,
    // transcendência) — em vez de jogar tudo fora e recomeçar do zero,
    // calcula o "extra" (salvo − o que a curva ANTIGA dava sozinha) e
    // soma esse extra em cima da curva NOVA.
    //
    // Sem isso, migrar um Guerreiro nível 80 pra curva nova apagaria
    // qualquer encantamento que ele já tivesse aplicado.
    static migrate(classId, level, savedBaseStats, savedMaxHP, fromVersion) {

        const legacyTable = LEGACY_TABLES[fromVersion];

        // Classe nova (ex: Bárbaro) ou versão sem tabela de referência
        // guardada — não existiam saves antes dela, nada pra migrar.
        if (!legacyTable || !legacyTable[2]?.[classId]) {

            return {
                baseStats: savedBaseStats,
                maxHP: savedMaxHP
            };

        }

        const oldCumulative = this.cumulative(legacyTable, classId, level);
        const newCumulative = this.cumulative(levels, classId, level);

        const baseStats = {};

        for (const key of STAT_KEYS) {

            const extra = (savedBaseStats?.[key] ?? 0) - (oldCumulative[key] ?? 0);

            baseStats[key] = (newCumulative[key] ?? 0) + extra;

        }

        const extraLife = (savedMaxHP ?? oldCumulative.life) - oldCumulative.life;
        const maxHP = newCumulative.life + extraLife;

        return { baseStats, maxHP };

    }

}
