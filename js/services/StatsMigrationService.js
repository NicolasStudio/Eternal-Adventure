import levels from "../data/levels.js";
import legacyLevels_v1 from "../data/legacyLevels_v1.js";
import legacyLevels_v2 from "../data/legacyLevels_v2.js";
import legacyLevels_v3 from "../data/legacyLevels_v3.js";
import legacyLevels_v4 from "../data/legacyLevels_v4.js";
import legacyLevels_v5 from "../data/legacyLevels_v5.js";
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
//     Crítico/Roubo de Vida/Penetração/Absorção ainda vinham (em parte)
//     de level up.
// v3: Crítico/Roubo de Vida/Penetração/Absorção deixam de vir de level
//     up — passam a vir 100% de Arma + Chapéu (Arma + Elmo, no caso do
//     Bárbaro), pra ficar visível pro jogador de onde cada ponto vem.
// v4: Pútrido teve a curva de Agilidade reduzida (soma dos 99 níveis:
//     114 -> 96) — o Poder dele estava empatando com classes de dano
//     alto (Ataque bem menor) só por causa do excesso de Agilidade/
//     Armadura na base. Não afeta nenhuma outra classe (ver
//     legacyLevels_v3.js).
// v5: Mímico teve a Vida por nível reduzida (12 -> 9/nível, soma dos 99
//     níveis: 1188 -> 891) — tirando 297 de Vida Máxima no nível 100.
//     Não afeta nenhuma outra classe (ver legacyLevels_v4.js).
// v6: Guerreiro ganhou +27 de Vida e perdeu 8 de Agilidade (dos 18
//     tirados no total, os outros 10 saíram do equipamento) nos níveis
//     70-100 — pra aguentar melhor os chefes dessa faixa, em troca de
//     um pouco de esquiva. Só esse trecho de níveis muda (ver
//     legacyLevels_v5.js).
export const CURRENT_BALANCE_VERSION = 6;

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
    5: legacyLevels_v5
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
