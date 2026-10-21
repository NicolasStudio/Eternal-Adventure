// Fusão de Equipamentos: combina 4 itens da mesma categoria+raridade+
// nível de fusão num só, aprimorado. Toda a lógica de negócio mora aqui
// (nada de cálculo espalhado em BlacksmithFusion.js) — mesmo espírito de
// UpgradeService.js, só que pra essa mecânica nova.

// Slots que entram na Fusão. Anel/Amuleto incluídos — o bônus deixou de
// depender de um "atributo principal" único por slot (ver SPECIAL_STATS
// abaixo): agora soma em TODOS os atributos não-especiais do item, então
// não importa se a peça tem 1 stat (arma: só Ataque) ou 3 (Anel/Amuleto
// do Crânio: Ataque+Armadura+Sorte) — todos ganham o mesmo +7/nível.
const FUSABLE_SLOTS = ["weapon", "helmet", "chest", "leg", "boot", "ring", "amulet"];

// Atributos "especiais" (% exclusiva da classe) NUNCA recebem bônus de
// Fusão — mesma lista usada por UpgradeService pra saber quais status só
// melhoram com Qualidade "Excepcional" (ver SECONDARY_STATS lá, que
// importa essa constante em vez de duplicá-la). Sorte NÃO entra aqui de
// propósito: é um atributo "normal" (como Ataque/Armadura), não um
// especial de classe, então itens com Sorte (Anel/Amuleto do Crânio)
// ganham bônus de Fusão nela também.
const SPECIAL_STATS = ["criticalChance", "lifeSteal", "penetration", "absorption", "miasmaChance", "reflection", "confusionChance", "paralysisChance", "doubleStrikeChance", "gravityChance"];

// Quanto cada nível de fusão soma em cada atributo não-especial — 7 por
// nível (+1 = 7, +5 = 35), mostrados separados do valor base na tooltip
// (ex: Katana Rara +1 "+33  +7" no Ataque).
const FUSION_BONUS_PER_LEVEL = 7;

// Chance-base de sucesso por NÍVEL DE ORIGEM dos 4 itens selecionados
// (antes da fusão, não depois): +0→+1 = 60% ... +4→+5 = 10%. Ajustável
// sem tocar em mais nada (único lugar que define isso).
const BASE_CHANCE_BY_LEVEL = {
    0: 60,
    1: 45,
    2: 30,
    3: 20,
    4: 10
};

// Nível máximo de fusão — itens já nesse nível não podem ser fundidos de
// novo (ver validateSelection).
const MAX_FUSION_LEVEL = 5;

// Nível de fusão acima do maior mapeado em BASE_CHANCE_BY_LEVEL: cada
// nível extra cai mais isso, até o piso de CHANCE_FLOOR.
const BASE_CHANCE_STEP_BEYOND_TABLE = 5;

// Sorte (ver PlayerStats.js) soma chance de sucesso: cada ponto vale
// LUCK_CHANCE_PER_POINT%, até um teto de LUCK_CHANCE_CAP pontos
// percentuais — evita que Sorte sozinha torne a fusão trivial em níveis
// altos. Ambos ajustáveis conforme o balanceamento pedir.
const LUCK_CHANCE_PER_POINT = 0.1;
const LUCK_CHANCE_CAP = 20;

// A chance final nunca sai desse intervalo — nem 0% (garantiria falha
// sempre) nem 100% (removeria o risco da mecânica).
const CHANCE_FLOOR = 5;
const CHANCE_CEIL = 95;

// Custo em ouro por raridade dos 4 itens — fixo, independe do nível de
// fusão (conforme o spec).
const FUSION_COST_BY_RARITY = {
    common: 30000,
    uncommon: 60000,
    rare: 90000,
    mystic: 120000,
    legendary: 150000
};

const REQUIRED_ITEM_COUNT = 4;

export default class FusionService {

    static get specialStats() {
        return SPECIAL_STATS;
    }

    // Um atributo recebe bônus de Fusão se NÃO for um especial de classe
    // (Crítico, Roubo de Vida, Miasma, etc — ver SPECIAL_STATS).
    static isFusionBonusStat(key) {
        return !SPECIAL_STATS.includes(key);
    }

    // Quais atributos de UM item específico ganham bônus de Fusão: os
    // não-zero, não-especiais — ex: arma só tem Ataque, Anel do Crânio
    // tem Ataque+Armadura+Sorte. Usado pelo preview da tela de Fusão
    // (ver BlacksmithFusion.js) pra listar todos de uma vez.
    static getBonusStatKeys(item) {

        if (!item?.baseStats) return [];

        return Object.entries(item.baseStats)
            .filter(([key, value]) => value !== 0 && this.isFusionBonusStat(key))
            .map(([key]) => key);

    }

    static isFusable(item) {
        return FUSABLE_SLOTS.includes(item?.slot);
    }

    static getFusionBonus(item) {
        return (item?.fusionLevel ?? 0) * FUSION_BONUS_PER_LEVEL;
    }

    static get bonusPerLevel() {
        return FUSION_BONUS_PER_LEVEL;
    }

    static get maxFusionLevel() {
        return MAX_FUSION_LEVEL;
    }

    static getBaseChance(fusionLevel) {

        if (fusionLevel in BASE_CHANCE_BY_LEVEL) {
            return BASE_CHANCE_BY_LEVEL[fusionLevel];
        }

        const mappedLevels = Object.keys(BASE_CHANCE_BY_LEVEL).map(Number);
        const highestLevel = Math.max(...mappedLevels);
        const highestChance = BASE_CHANCE_BY_LEVEL[highestLevel];
        const extraLevels = fusionLevel - highestLevel;

        return Math.max(CHANCE_FLOOR, highestChance - extraLevels * BASE_CHANCE_STEP_BEYOND_TABLE);

    }

    static getSuccessChance(fusionLevel, luck = 0) {

        const base = this.getBaseChance(fusionLevel);
        const luckBonus = Math.min(LUCK_CHANCE_CAP, Math.max(0, luck) * LUCK_CHANCE_PER_POINT);

        return Math.min(CHANCE_CEIL, Math.max(CHANCE_FLOOR, base + luckBonus));

    }

    static getFusionCost(rarityId) {
        return FUSION_COST_BY_RARITY[rarityId] ?? 0;
    }

    // Rank de qualidade (maior = melhor) — stepMultiplier de quality.js
    // já é um ordinal crescente (Nenhuma=0 ... Lendário=4), reaproveitado
    // direto em vez de inventar uma tabela nova.
    static getQualityRank(item) {
        return item?.quality?.stepMultiplier ?? 0;
    }

    static getEnchantmentValue(item) {

        if (!item?.enchantments) return 0;

        return Object.values(item.enchantments).reduce(
            (sum, value) => sum + (Number(value) || 0),
            0
        );

    }

    // Dentre os 4 selecionados, qual vira a BASE do resultado — o
    // "melhor": maior qualidade primeiro, desempate pelo maior valor
    // total de encantamento, desempate final pela ordem de seleção
    // (Array.prototype.sort é estável, então empate total mantém o
    // primeiro item clicado na frente).
    static pickBestItem(items) {

        return [...items].sort((a, b) => {

            const qualityDiff = this.getQualityRank(b) - this.getQualityRank(a);
            if (qualityDiff !== 0) return qualityDiff;

            return this.getEnchantmentValue(b) - this.getEnchantmentValue(a);

        })[0];

    }

    // Regras de elegibilidade (seção 3 do spec da Fusão). NÃO bloqueia
    // por `item.used` de propósito — esse selo é compartilhado com
    // equipar/melhorar/encantar, e o PRÓPRIO resultado de uma fusão já
    // nasce `used` (ver resolveFusion); bloquear por isso impediria
    // fundir duas vezes o mesmo tipo de item (quebrando a progressão
    // +1→+2→+3) e deixaria de fora qualquer equipamento que o jogador já
    // tenha usado alguma vez — ou seja, quase tudo que vale a pena
    // fundir. `used` continua só como selo informativo.
    // Devolve { ok: true, cost, bonusStats } ou { ok: false, reason }.
    static validateSelection(items, player) {

        if (!Array.isArray(items) || items.length !== REQUIRED_ITEM_COUNT) {
            return { ok: false, reason: `Selecione exatamente ${REQUIRED_ITEM_COUNT} equipamentos.` };
        }

        const [first] = items;

        if (!this.isFusable(first)) {
            return { ok: false, reason: "Essa categoria de item não pode ser fundida." };
        }

        if (!items.every(item => item.slot === first.slot)) {
            return { ok: false, reason: "Os equipamentos precisam ser da mesma categoria." };
        }

        // Anel/Amuleto têm 3 variantes com combinações de atributos
        // diferentes (Primal, Moderno/Primeiro Imperador, Crânio) que
        // dividem o mesmo slot — sem essa trava, dava pra misturar as 3
        // numa fusão só, o que não faz sentido (o resultado "herda" os
        // atributos do item base, os outros 3 só contam pra chance/custo).
        // Pra arma/armadura isso nunca bloqueia nada: dentro da mesma
        // raridade+classe só existe UM nome possível por slot.
        if (!items.every(item => item.name === first.name)) {
            return { ok: false, reason: "Os equipamentos precisam ser exatamente a mesma peça." };
        }

        if (!items.every(item => item.rarity?.id === first.rarity?.id)) {
            return { ok: false, reason: "Os equipamentos precisam ter a mesma raridade." };
        }

        if (!items.every(item => (item.fusionLevel ?? 0) === (first.fusionLevel ?? 0))) {
            return { ok: false, reason: "Os equipamentos precisam estar no mesmo nível de fusão." };
        }

        if ((first.fusionLevel ?? 0) >= MAX_FUSION_LEVEL) {
            return { ok: false, reason: `Esses equipamentos já estão no nível máximo de fusão (+${MAX_FUSION_LEVEL}).` };
        }

        const equippedUids = new Set(
            Object.values(player?.equipment ?? {})
                .filter(Boolean)
                .map(equipped => equipped.uid)
        );

        if (items.some(item => equippedUids.has(item.uid))) {
            return { ok: false, reason: "Desequipe os itens selecionados antes de fundir." };
        }

        // Os 4 uids precisam ser distintos (clicar duas vezes no mesmo
        // slot do inventário não pode contar como "4 itens").
        if (new Set(items.map(item => item.uid)).size !== REQUIRED_ITEM_COUNT) {
            return { ok: false, reason: "Selecione 4 equipamentos diferentes." };
        }

        const cost = this.getFusionCost(first.rarity?.id);

        if ((player?.gold ?? 0) < cost) {
            return { ok: false, reason: "Ouro insuficiente." };
        }

        return { ok: true, cost, bonusStats: this.getBonusStatKeys(first) };

    }

    // Resolve uma fusão de ponta a ponta: valida, sorteia, aplica sucesso
    // ou falha, mexe no inventário/ouro do player. NUNCA toca em DOM/
    // Toast — devolve um resultado estruturado pra UI decidir o que
    // mostrar. `rng` é injetável só pra teste determinístico (Monte
    // Carlo) — por padrão usa Math.random de verdade.
    static resolveFusion({ items, protectionItem, player, luck = 0, rng = Math.random }) {

        const validation = this.validateSelection(items, player);

        if (!validation.ok) {
            return { blocked: true, reason: validation.reason };
        }

        const bestItem = this.pickBestItem(items);
        const chance = this.getSuccessChance(bestItem.fusionLevel ?? 0, luck);
        const success = rng() * 100 < chance;

        // O ouro sai sempre, sucesso ou falha (confirmado com o usuário).
        player.removeGold(validation.cost);

        if (success) {

            const consumed = items.filter(item => item.uid !== bestItem.uid);

            bestItem.fusionLevel = (bestItem.fusionLevel ?? 0) + 1;
            bestItem.used = true;

            // Conquistas "Fuuuuusão" — maior nível já alcançado, mesmo que
            // o item seja vendido/fundido de novo depois.
            player.progress.stats.highestFusionLevel = Math.max(player.progress.stats.highestFusionLevel ?? 0, bestItem.fusionLevel);

            consumed.forEach(item => player.removeItem(item));

            return {
                blocked: false,
                success: true,
                chance,
                resultItem: bestItem,
                consumedIds: consumed.map(item => item.uid),
                protectionConsumed: false
            };

        }

        // Falha com item de proteção equipado no 5º slot: só ele é
        // consumido, os 4 itens da fusão continuam intactos e elegíveis.
        if (protectionItem) {

            player.removeItem(protectionItem);

            return {
                blocked: false,
                success: false,
                chance,
                resultItem: null,
                consumedIds: [],
                protectionConsumed: true
            };

        }

        // Falha sem proteção: perde os 4 itens.
        items.forEach(item => player.removeItem(item));

        return {
            blocked: false,
            success: false,
            chance,
            resultItem: null,
            consumedIds: items.map(item => item.uid),
            protectionConsumed: false
        };

    }

}
