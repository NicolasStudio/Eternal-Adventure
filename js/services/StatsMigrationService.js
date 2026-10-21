import levels from "../data/levels.js";
import legacyLevels_v1 from "../data/legacy/legacyLevels_v1.js";
import legacyLevels_v2 from "../data/legacy/legacyLevels_v2.js";
import legacyLevels_v3 from "../data/legacy/legacyLevels_v3.js";
import legacyLevels_v4 from "../data/legacy/legacyLevels_v4.js";
import legacyLevels_v5 from "../data/legacy/legacyLevels_v5.js";
import legacyLevels_v6 from "../data/legacy/legacyLevels_v6.js";
import legacyLevels_v7 from "../data/legacy/legacyLevels_v7.js";
import legacyLevels_v8 from "../data/legacy/legacyLevels_v8.js";
import legacyLevels_v9 from "../data/legacy/legacyLevels_v9.js";
import legacyLevels_v10 from "../data/legacy/legacyLevels_v10.js";
import legacyLevels_v11 from "../data/legacy/legacyLevels_v11.js";
import legacyLevels_v12 from "../data/legacy/legacyLevels_v12.js";
import legacyLevels_v13 from "../data/legacy/legacyLevels_v13.js";
import legacyLevels_v14 from "../data/legacy/legacyLevels_v14.js";
import legacyLevels_v15 from "../data/legacy/legacyLevels_v15.js";
import legacyLevels_v16 from "../data/legacy/legacyLevels_v16.js";
import legacyLevels_v17 from "../data/legacy/legacyLevels_v17.js";
import legacyLevels_v18 from "../data/legacy/legacyLevels_v18.js";
import legacyLevels_v19 from "../data/legacy/legacyLevels_v19.js";
import legacyLevels_v20 from "../data/legacy/legacyLevels_v20.js";
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
// 84,88,92,94,98,100), Bárbaro enfraquecido nos níveis 94-98 · v14 Arqueiro
// perde 6 de Armadura na curva de nível (parte de um corte maior que também
// tirou de itens lendários e da transcendência — ver helmets/chest/legs/
// boots.js e upClasse.js, sincronizados à parte) · v15 Guerreiro +200 Vida
// (lv 5-100) e perde 50 de Agilidade (itens místicos/lendários de Calças/
// Botas e upgrade de classe — ver legs/boots.js e upClasse.js) · v16
// Guerreiro +64 de Armadura e Arqueiro -19 (itens lendários de Capacete/
// Peitoral/Calças/Botas, transcendência e a curva de nível — ver
// helmets/chest/legs/boots.js e upClasse.js, sincronizados à parte) · v17
// Arqueiro: os 11 níveis de corte de Armadura do v16 saem da curva de
// nível e viram corte extra nos itens lendários (Capacete/Peitoral/
// Calças/Botas) — total de Armadura dele não muda, só a fonte. Guerreiro
// fica como estava no v16, sem mudança nenhuma aqui · v18 Pútrido +18 de
// Ataque entre os níveis 80-100, e mais +15 por cima disso entre os
// níveis 85-100 (as duas camadas somam nesse trecho) · v19 Louca +7 de
// Armadura/-8 de Ataque até o nível 100 (mais +2/-2 entre 101-110),
// depois de simulações de PVP mostrarem ela perdendo quase sempre pro
// Guerreiro e pro Pútrido em níveis altos · v20 Louca -45 de Agilidade
// até o nível 100 (mais -4 entre 101-110) — personagens de fim de jogo
// (equipamento + anel/amuleto + pet + talentos) estavam passando de
// 500 de Agilidade, desproporcional mesmo pra uma classe desenhada
// pra ser a mais ágil · v21 rebalanceamento de TODAS as classes por
// simulação de PVP 1x1 (Lv20-100): Vida/Ataque/Armadura ganhos por nível
// multiplicados por faixa (2-20/21-40/41-60/61-80/81-110), Agilidade
// intacta — Pútrido/Mago/Eletro/Singularidade caem, Mímico/Arqueiro/
// Bárbaro/Guerreiro/Louca/Samurai sobem (ver legacyLevels_v20.js).
// Guerreiro ainda troca resistência por dano: Armadura da curva ×0,45
// (e das peças de armadura dele — ver helmets/chest/legs/boots.js) e
// Ataque da curva ×1,50, pra encurtar as lutas mais longas do jogo.
// Mago e Mímico +12% de Vida/Ataque/Armadura do 81 ao 110 (compensado
// pelo Cetro/Espelho Lendários mais fracos — ver weapons.js)
export const CURRENT_BALANCE_VERSION = 21;

// miasmaChance/reflection/confusionChance/paralysisChance/
// doubleStrikeChance/gravityChance entram aqui só pra não serem
// DESCARTADOS na migração (a tabela de migração nunca tem esses
// campos, então sempre passam direto como "extra" — preserva o que o
// Pútrido/Mímico/Louca/Eletro/Samurai/Singularidade já tinham ganho de
// fora do level up). Nenhuma curva de level up (nem antiga nem atual)
// dá pontos neles, então isso nunca soma nada por conta própria.
const STAT_KEYS = ["attack", "armor", "agility", "criticalChance", "lifeSteal", "penetration", "absorption", "miasmaChance", "reflection", "confusionChance", "paralysisChance", "doubleStrikeChance", "gravityChance"];

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
    12: legacyLevels_v12,
    13: legacyLevels_v13,
    14: legacyLevels_v14,
    15: legacyLevels_v15,
    16: legacyLevels_v16,
    17: legacyLevels_v17,
    18: legacyLevels_v18,
    19: legacyLevels_v19,
    20: legacyLevels_v20
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

    // Melhor encanto de cada tipo (life/attack/armor/agility/special)
    // entre TODOS os itens do personagem — equipados e no inventário.
    static enchantBonusesFromItems(player) {

        const best = {};

        [...Object.values(player.equipment ?? {}), ...(player.inventory ?? [])].forEach(item => {
            Object.entries(item?.enchantments ?? {}).forEach(([key, value]) => {
                const amount = Number(value) || 0;
                if (amount > (best[key] ?? 0)) best[key] = amount;
            });
        });

        return best;

    }

    // Recalcula baseStats/maxHP DO ZERO a partir das fontes que existem
    // de verdade, em vez de confiar no valor acumulado no save:
    //
    //   curva ATUAL até o nível + Upgrade de Classe + o MELHOR encanto de
    //   cada tipo (um só por personagem)
    //
    // Fica de fora (quem chama soma depois — ver
    // SaveService.recalculateStats): Vida de Anel/Amuleto e do pet, e os
    // talentos (TalentService.sync reaplica sobre a Vida nova).
    //
    // Corrige dois problemas de uma vez: curva de levels.js que mudou SEM
    // subir CURRENT_BALANCE_VERSION (quem migrou antes ficava com os
    // números velhos — aconteceu entre 20/10 e 21/10) e encanto acumulado
    // (antes cada ARMA tinha o próprio limite, mas o bônus ia pro
    // PERSONAGEM — encantar 2 armas somava 2 Rubis, e o bônus ficava
    // mesmo depois de fundir/vender a arma).
    //
    // progress.enchantBonuses é o registro do melhor encanto de cada tipo
    // que o personagem já aplicou (ver Player.applyEnchantment). Save sem
    // esse registro começa pelo que os itens dele ainda têm.
    //
    // Qualquer fonte NOVA de status permanente precisa entrar aqui também,
    // senão some no próximo carregamento.
    static recalculate(player) {

        const curve = this.cumulative(levels, player.class.id, player.level);

        // Bônus do Upgrade de Classe só existe depois de vencer a dungeon
        // (player.transcendence) — transcendenceApplied é o que
        // syncTranscendenceStats() já alinhou ao upClasse.js atual.
        const transcendence = player.transcendence ? (player.progress.transcendenceApplied ?? {}) : {};

        const enchant = this.enchantBonusesFromItems(player);

        Object.entries(player.progress.enchantBonuses ?? {}).forEach(([key, value]) => {
            enchant[key] = Math.max(enchant[key] ?? 0, Number(value) || 0);
        });

        player.progress.enchantBonuses = enchant;

        const specialKey = player.getSpecialStatKey();
        const baseStats = {};

        Object.entries(curve).forEach(([key, value]) => {
            if (key !== "life") baseStats[key] = value;
        });

        Object.entries(transcendence).forEach(([key, value]) => {
            if (key !== "life") baseStats[key] = (baseStats[key] ?? 0) + (Number(value) || 0);
        });

        Object.entries(enchant).forEach(([key, value]) => {
            if (key === "life") return;
            const statKey = key === "special" ? specialKey : key;
            if (statKey) baseStats[statKey] = (baseStats[statKey] ?? 0) + value;
        });

        const maxHP = curve.life + (Number(transcendence.life) || 0) + (enchant.life ?? 0);

        return { baseStats, maxHP };

    }

}
