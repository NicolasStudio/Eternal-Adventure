import qualities from "../data/quality.js";
import upgradeCosts from "../data/upgradeCosts.js";
import FusionService from "./FusionService.js";

// Ordem fixa de progressão da qualidade de um item.
const QUALITY_ORDER = ["none", "ordinary", "mediocre", "exceptional"];

// Itens de raridade Lendária ganham mais um grau depois de Excepcional.
// As outras raridades continuam parando em Excepcional.
const LEGENDARY_EXTRA_QUALITY = "lendary";
const LEGENDARY_RARITY = "legendary";

// Qualidades em que os status SECUNDÁRIOS recebem o bônus de melhoria.
// "lendary" mantém o mesmo bônus de "Excepcional" (não soma mais nada
// — o teto de cada raridade já foi calibrado pra esse valor).
const SECONDARY_BONUS_QUALITIES = ["exceptional", LEGENDARY_EXTRA_QUALITY];

// Status secundários só passam a receber bônus de melhoria quando o
// item chega em "Excepcional". Antes disso, só os principais
// (attack, armor, agility) ganham pontos a cada melhoria. Inclui
// miasmaChance (especial do Pútrido, na arma e na touca), reflection
// (especial do Mímico, na arma e no elmo), confusionChance (especial
// da Louca, na arma e nos óculos), paralysisChance (especial do
// Eletro, na arma e no óculos), doubleStrikeChance (especial do
// Samurai, na katana e na máscara) e gravityChance (especial da
// Singularidade, na marreta e na tiara) — sem isso, esses especiais
// nunca melhoram com a Qualidade. Mesma lista que FusionService usa pra
// saber quais atributos NUNCA recebem bônus de Fusão — fonte única em
// FusionService.specialStats, pra nunca ficar fora de sincronia.
const SECONDARY_STATS = FusionService.specialStats;

// Bônus de "Excepcional" pra status SECUNDÁRIOS, por raridade. Não
// reaproveita a fórmula dos principais (qualityStep × stepMultiplier) de
// propósito — daria um valor gigante numa peça só. Crítico/Roubo de
// Vida/Penetração/Absorção/etc só vêm de Arma+Chapéu (Arma+Elmo no
// Bárbaro) — os dois itens de cada classe são calibrados pra, completos,
// somarem um valor-alvo igual pra todas as classes (hoje 48% no
// Lendário/55% no Ultraje — ver js/data/weapons.js e helmets.js).
//
// Atenção Mímico: Imitação (reflection) copia o valor INTEIRO pra
// Ataque, Armadura E Agilidade do oponente ao mesmo tempo (ver
// MimicService.getCopiedBonus) — cada ponto percentual vale ~3x o de
// qualquer outro atributo especial. Calibrar a arma/elmo dele pro MESMO
// valor-alvo das outras classes, sem levar isso em conta, provavelmente
// deixa o Mímico mais forte que as outras 9 — vale conferir com
// simulação antes de confiar nesse número pra ele.
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

    // Ordem de qualidades que ESSE item pode percorrer.
    static getQualityOrder(item) {

        return item?.rarity?.id === LEGENDARY_RARITY
            ? [...QUALITY_ORDER, LEGENDARY_EXTRA_QUALITY]
            : QUALITY_ORDER;

    }

    // Retorna o objeto da PRÓXIMA qualidade, ou null se já está no máximo.
    static getNextQuality(item) {

        const current = this.getCurrentQuality(item);

        const order = this.getQualityOrder(item);

        const index = order.indexOf(current.id);

        if (index === -1 || index >= order.length - 1) {
            return null;
        }

        return qualities[order[index + 1]];

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

            if (!SECONDARY_BONUS_QUALITIES.includes(quality?.id)) return 0;

            return SECONDARY_EXCEPTIONAL_BONUS[item?.rarity?.id] ?? 0;

        }

        return this.getStatBonusFor(item, quality);

    }

    // Recalcula item.stats a partir do item.baseStats (o valor original,
    // sem melhoria nenhuma) + o bônus da qualidade atual + o bônus de
    // Fusão (ver FusionService.js), se houver. Só os atributos que o
    // item já possui (valor != 0) recebem bônus de qualidade; o bônus de
    // Fusão soma em TODO atributo não-zero que não seja especial de
    // classe (ver FusionService.isFusionBonusStat) — uma arma só tem
    // Ataque, mas Anel/Amuleto do Crânio ganham em Ataque, Armadura E
    // Sorte ao mesmo tempo.
    //
    // Status secundários (criticalChance, lifeSteal, penetration) só
    // começam a ganhar bônus de qualidade quando ela chega em
    // "Excepcional". Antes disso (Ordinário, Medíocre) só os principais
    // (attack, armor, agility) recebem os pontos da melhoria.
    //
    // SEMPRE recalculado do zero a partir de baseStats — nunca somado em
    // cima de item.stats já mutado — pra o bônus de Fusão nunca dobrar
    // em reload/requip/novo upgrade de qualidade.
    static applyStats(item) {

        if (!item?.baseStats) return;

        const quality = this.getCurrentQuality(item);
        const fusionBonus = FusionService.getFusionBonus(item);

        const stats = {};

        Object.entries(item.baseStats).forEach(([key, value]) => {

            if (value === 0) {
                stats[key] = 0;
                return;
            }

            stats[key] = value + this.getBonusForStat(item, quality, key);

            if (fusionBonus > 0 && FusionService.isFusionBonusStat(key)) {
                stats[key] += fusionBonus;
            }

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

        // Selo [USADO] do tooltip (ver ItemTooltip.js) — mesma regra do
        // Player.equipItem: upgradar também marca o item como usado.
        item.used = true;

        return true;

    }

}
