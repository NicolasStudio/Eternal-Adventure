import levels from "../data/levels.js";
import legacyLevels_v1 from "../data/legacyLevels_v1.js";
import legacyLevels_v2 from "../data/legacyLevels_v2.js";
import legacyLevels_v3 from "../data/legacyLevels_v3.js";
import legacyLevels_v4 from "../data/legacyLevels_v4.js";
import legacyLevels_v5 from "../data/legacyLevels_v5.js";
import legacyLevels_v6 from "../data/legacyLevels_v6.js";
import legacyLevels_v7 from "../data/legacyLevels_v7.js";
import legacyLevels_v8 from "../data/legacyLevels_v8.js";
import legacyLevels_v9 from "../data/legacyLevels_v9.js";
import legacyLevels_v10 from "../data/legacyLevels_v10.js";
import legacyLevels_v11 from "../data/legacyLevels_v11.js";
import legacyLevels_v12 from "../data/legacyLevels_v12.js";
import baseStatsL1 from "../data/baseStatsL1.js";

// Sobe quando a curva de levels.js muda de um jeito que exige recalcular
// saves existentes (ver LEGACY_TABLES abaixo pra cada versão antiga).
// Não é SAVE_VERSION (esse é sobre o formato do arquivo, não balanceamento).
//
// v1 curva original · v2 Guerreiro ganha Absorção, Bárbaro criado · v3
// Crítico/Roubo de Vida/Penetração/Absorção saem do level up, viram 100%
// equipamento · v4 Pútrido Agilidade 114→96 · v5 Mímico Vida/nível 12→9 ·
// v6 Guerreiro +27 Vida/−8 Agilidade (lv 70-100) · v7 Pútrido +20 Vida/
// +3 Atq/+4 Def/+4 Agi (lv 70-100) + itens Místicos · v8 Pútrido +5 Def
// (lv 78-83) · v9 Pútrido +12 Vida/+1 Atq/+1 Def (lv 44-65) · v10 Pútrido
// +100 Vida (lv 50-100), Miasma passa a reduzir Armadura em PVE · v11
// Pútrido +100 Vida/+40 Agilidade (curva inteira) · v12 Mago +300 Vida
// (curva inteira) · v13 Mago +1 Agilidade em 11 níveis (66,67,70,77,78,
// 84,88,92,94,98,100), Bárbaro enfraquecido nos níveis 94-98
export const CURRENT_BALANCE_VERSION = 13;

// miasmaChance/reflection entram aqui só pra não serem DESCARTADOS na
// migração (a tabela de migração nunca tem esses campos, então sempre
// passam direto como "extra" — preserva o que o Pútrido/Mímico já
// tinham ganho de equipamento, ex: Quartzo Rosa ou Imitação do item).
// Nenhuma curva de level up (nem antiga nem atual) dá pontos neles,
// então isso nunca soma nada por conta própria.
const STAT_KEYS = ["attack", "armor", "agility", "criticalChance", "lifeSteal", "penetration", "absorption", "miasmaChance", "reflection"];

const LEGACY_TABLES = {
    1: legacyLevels_v1,
    2: legacyLevels_v2,
    3: legacyLevels_v3,
    4: legacyLevels_v4,
    5: legacyLevels_v5,
    6: legacyLevels_v6,
    7: legacyLevels_v7,
    8: legacyLevels_v8,
    9: legacyLevels_v9,
    10: legacyLevels_v10,
    11: legacyLevels_v11,
    12: legacyLevels_v12
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

        // Cada tabela só guarda a classe que mudou naquela versão, então
        // a de fromVersion pode não ter esta classe. Nesse caso a curva
        // dela ficou igual até a próxima tabela que a inclui — é essa a
        // referência certa (ex: Mago salvo na v5 usa o snapshot da v11).
        let legacyTable = null;

        for (let version = fromVersion; version < CURRENT_BALANCE_VERSION; version++) {

            if (LEGACY_TABLES[version]?.[2]?.[classId]) {

                legacyTable = LEGACY_TABLES[version];
                break;

            }

        }

        // Classe que não mudou desde fromVersion — nada pra migrar.
        if (!legacyTable) {

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

            // Nenhum atributo-base deveria conseguir ficar negativo — nada
            // no jogo tira pontos desses status, só soma. Se o "extra"
            // calculado vier negativo por qualquer inconsistência no save
            // (nível/baseStats fora de sincronia de uma sessão antiga,
            // por exemplo), trava em 0 em vez de arrastar esse número
            // negativo pra curva nova.
            baseStats[key] = Math.max(0, (newCumulative[key] ?? 0) + extra);

        }

        const extraLife = (savedMaxHP ?? oldCumulative.life) - oldCumulative.life;
        const maxHP = newCumulative.life + extraLife;

        return { baseStats, maxHP };

    }

}
