import qualities from "../data/quality.js";
import upgradeCosts from "../data/upgradeCosts.js";

// Ordem fixa de progressão da qualidade de um item.
const QUALITY_ORDER = ["none", "ordinary", "mediocre", "exceptional"];

// Status secundários só passam a receber bônus de melhoria quando o
// item chega em "Excepcional". Antes disso, só os principais
// (attack, armor, agility) ganham pontos a cada melhoria.
const SECONDARY_STATS = ["criticalChance", "lifeSteal", "penetration", "absorption"];

// Bônus de "Excepcional" pra status SECUNDÁRIOS (% com teto por
// raridade — ver rarities.js/secondaryCap), por raridade do item.
// NÃO reaproveita a fórmula dos principais (qualityStep × stepMultiplier)
// de propósito — daria um valor gigante de uma vez só numa única peça.
//
// Desde a v3 do balanceamento, Crítico/Roubo de Vida/Penetração/Absorção
// não vêm mais de level up NENHUM — só de Arma + Chapéu (ou Arma + Elmo,
// no caso do Bárbaro). Os valores BASE desses dois itens (weapons.js/
// helmets.js) foram recalibrados junto com esse bônus pra que as DUAS
// peças, completas E no Excepcional, cheguem exatamente no teto da
// raridade (rarities.js/secondaryCap) — nem uma peça sozinha chega perto,
// nem sobra bônus desperdiçado pelo teto.
const SECONDARY_EXCEPTIONAL_BONUS = {
    common: 2,
    uncommon: 3,
    rare: 5,
    mystic: 6,
    legendary: 8,
    ultraje: 10
};

export default class UpgradeService {

    // Retorna a qualidade atual do item (item recém dropado = "none").
    static getCurrentQuality(item) {

        return item?.quality ?? qualities.none;

    }

    // Retorna o objeto da PRÓXIMA qualidade, ou null se já está no máximo.
    static getNextQuality(item) {

        const current = this.getCurrentQuality(item);

        const index = QUALITY_ORDER.indexOf(current.id);

        if (index === -1 || index >= QUALITY_ORDER.length - 1) {
            return null;
        }

        return qualities[QUALITY_ORDER[index + 1]];

    }

    static canUpgrade(item) {

        return this.getNextQuality(item) !== null;

    }

    // Quanto cada atributo (não-zero) do item ganha nessa qualidade.
    // Ex: raridade comum (qualityStep 2) na qualidade medíocre (stepMultiplier 2) = +4
    static getStatBonus(item) {

        const quality = this.getCurrentQuality(item);
        const step = item?.rarity?.qualityStep ?? 0;

        return step * quality.stepMultiplier;

    }

    static getStatBonusFor(item, quality) {

        const step = item?.rarity?.qualityStep ?? 0;

        return step * (quality?.stepMultiplier ?? 0);

    }

    // Bônus que UM status específico ganha numa dada qualidade.
    // Status secundários (criticalChance, lifeSteal, penetration) só
    // recebem bônus a partir da qualidade "Excepcional" — antes disso
    // o bônus deles é sempre 0, mesmo com a raridade/qualidade calculando
    // um valor maior que zero pros status principais.
    static getBonusForStat(item, quality, statKey) {

        if (SECONDARY_STATS.includes(statKey)) {

            if (quality?.id !== "exceptional") return 0;

            return SECONDARY_EXCEPTIONAL_BONUS[item?.rarity?.id] ?? 0;

        }

        return this.getStatBonusFor(item, quality);

    }

    // Recalcula item.stats a partir do item.baseStats (o valor original,
    // sem melhoria nenhuma) + o bônus da qualidade atual.
    // Só os atributos que o item já possui (valor != 0) recebem o bônus.
    //
    // Status secundários (criticalChance, lifeSteal, penetration) só
    // começam a ganhar bônus quando a qualidade chega em "Excepcional".
    // Antes disso (Ordinário, Medíocre) só os principais (attack, armor,
    // agility) recebem os pontos da melhoria.
    static applyStats(item) {

        if (!item?.baseStats) return;

        const quality = this.getCurrentQuality(item);

        const stats = {};

        Object.entries(item.baseStats).forEach(([key, value]) => {

            if (value === 0) {
                stats[key] = 0;
                return;
            }

            stats[key] = value + this.getBonusForStat(item, quality, key);

        });

        item.stats = stats;

    }

    // category: "weapon" ou "armor" -> usado pra buscar o preço certo em upgradeCosts.js
    static getUpgradeCost(item, category = "weapon") {

        const current = this.getCurrentQuality(item);

        const table = upgradeCosts[category] ?? upgradeCosts.weapon;

        return table[current.id] ?? 0;

    }

    // Cobra o ouro do player e aplica a melhoria no item (mutação direta,
    // funciona tanto se o item está no inventário quanto equipado, pois
    // é sempre a mesma referência do objeto).
    static upgrade(item, category, player) {

        if (!item || !player) return false;

        const next = this.getNextQuality(item);

        if (!next) return false;

        const cost = this.getUpgradeCost(item, category);

        if (!player.removeGold(cost)) {
            return false;
        }

        item.quality = next;

        this.applyStats(item);

        return true;

    }

}
