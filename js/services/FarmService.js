import farmCrops from "../data/farmCrops.js";
import seeds from "../data/seeds.js";
import SaveService from "./SaveService.js";

const PLOT_COUNT = 24;
const BASE_PLOT_COST = 30000;
const DOUBLE_PLOTS = 8; // canteiros 0..7 dobram de custo a cada um
const SOFT_GROWTH = 1.5; // a partir do canteiro 8, cresce só 50% por canteiro

// Ciclo de umidade em 2 estágios: molhada dura 4h e vira normal
// sozinha; normal (seja por ter acabado de secar da rega, seja por
// nunca ter sido regada) leva mais 3h pra virar seca.
const WATERED_DURATION_MS = 4 * 60 * 60 * 1000; // 4h molhada antes de virar normal
const NORMAL_TO_DRY_MS = 3 * 60 * 60 * 1000; // 3h em terra normal antes de secar

const SOIL_GRASS = "assets/img/assets/farm/earth/grass.png";
const SOIL_EARTH = "assets/img/assets/farm/earth/earth.png";
const SOIL_WATER = "assets/img/assets/farm/earth/earth-water.png";
const SOIL_DRY = "assets/img/assets/farm/earth/earth-dry.png";

// Multiplicador de tempo de crescimento aplicado UMA VEZ, no instante
// do plantio, conforme a umidade da terra NAQUELE momento — plantar em
// terra seca atrasa a colheita (debuff), em terra molhada adianta
// (buff); terra normal não muda nada. Fixo pro resto do ciclo: regar
// ou deixar secar DEPOIS de plantado não recalcula esse valor.
const GROWTH_MODIFIER = {
    dry: 1.5,
    normal: 1,
    watered: 0.5
};

// Controla o estado dos 24 canteiros da Fazenda (player.farm.plots) —
// arar, plantar, regar, remover semente e colher. Cada canteiro só
// guarda { tilled, seedId, plantedAt, wateredAt, growthModifier }; tudo
// o mais (estágio visual, umidade atual, se já pode colher) é DERIVADO
// a partir desses timestamps, nunca guardado solto — assim não tem
// como o estado salvo e o visual desalinharem.
export default class FarmService {

    static get PLOT_COUNT() {
        return PLOT_COUNT;
    }

    // Custo em ouro pra arar CADA canteiro (índice 0-23): dobra nos 8
    // primeiros (30k -> 3,84M), depois cresce só 50% por canteiro — sem
    // isso, duplicar até o 24º chegaria a ~251 bilhões de ouro.
    static getPlotCost(index) {

        if (index < DOUBLE_PLOTS) {
            return BASE_PLOT_COST * Math.pow(2, index);
        }

        const costAtSoftStart = BASE_PLOT_COST * Math.pow(2, DOUBLE_PLOTS - 1);

        return Math.round(costAtSoftStart * Math.pow(SOFT_GROWTH, index - DOUBLE_PLOTS + 1));

    }

    static getCrop(seedId) {

        const seed = Object.values(seeds).find(s => s.id === seedId);

        if (!seed) return null;

        return farmCrops[seed.cropId] ?? null;

    }

    // Umidade da terra: "none" (grama, nem se aplica), "watered" (regada
    // há menos de 4h), "normal" (mais de 4h desde a rega mas ainda
    // dentro das 3h seguintes, OU nunca foi regada desde que foi arada)
    // ou "dry" (passou das 4h+3h = 7h desde a última rega, ou 3h desde
    // que foi arada sem nunca ter sido regada). Não depende de ter
    // semente — dá pra regar/deixar a terra secar ANTES de plantar, e o
    // estado nesse instante vira o buff/debuff de crescimento (ver
    // plantSeed).
    static getMoistureState(plot) {

        if (!plot.tilled) return "none";

        if (plot.wateredAt) {

            const elapsedSinceWatered = Date.now() - plot.wateredAt;

            if (elapsedSinceWatered < WATERED_DURATION_MS) return "watered";

            const elapsedSinceNormal = elapsedSinceWatered - WATERED_DURATION_MS;

            return elapsedSinceNormal < NORMAL_TO_DRY_MS ? "normal" : "dry";

        }

        // Nunca foi regada — o relógio de secar corre a partir de
        // quando foi arada (plots antigos sem tilledAt gravado nunca
        // secam sozinhos até serem regados ao menos uma vez).
        if (!plot.tilledAt) return "normal";

        return (Date.now() - plot.tilledAt) < NORMAL_TO_DRY_MS ? "normal" : "dry";

    }

    // Estágio atual (0-4 → stage-1..stage-5) a partir do tempo decorrido
    // desde o plantio, ajustado pelo growthModifier fixado no plantio.
    static getStageIndex(plot) {

        const crop = this.getCrop(plot.seedId);

        if (!crop || !plot.plantedAt) return 0;

        const effectiveGrowTime = crop.growTimeMs * (plot.growthModifier ?? 1);
        const elapsed = Date.now() - plot.plantedAt;
        const stepMs = effectiveGrowTime / 4;

        return Math.max(0, Math.min(4, Math.floor(elapsed / stepMs)));

    }

    static isReadyToHarvest(plot) {
        return !!plot.seedId && this.getStageIndex(plot) >= 4;
    }

    static getSoilImage(plot) {

        if (!plot.tilled) return SOIL_GRASS;

        const moisture = this.getMoistureState(plot);

        if (moisture === "dry") return SOIL_DRY;
        if (moisture === "watered") return SOIL_WATER;

        return SOIL_EARTH;

    }

    static getStageImage(plot) {

        const crop = this.getCrop(plot.seedId);

        if (!crop) return null;

        return crop.stageImages[this.getStageIndex(plot)];

    }

    /* =====================================================
       AÇÕES — cada uma retorna { ok, message } pronto pro Toast.
       Confirmações (custo de arar, perda de semente) ficam na UI
       (FarmView + FarmConfirmModal) — aqui é só a mutação de estado.
    ===================================================== */

    // Grama vira terra arada, cobrando o custo progressivo do canteiro.
    static till(player, index) {

        const plot = player.farm.plots[index];

        if (plot.tilled) {
            return { ok: false, message: "Este terreno já foi arado." };
        }

        const cost = this.getPlotCost(index);

        if (!player.removeGold(cost)) {
            return { ok: false, message: "Ouro insuficiente para arar este terreno." };
        }

        plot.tilled = true;
        plot.tilledAt = Date.now();

        player.notify();
        SaveService.autoSave(player);

        return { ok: true, message: "Você arou o solo!" };

    }

    static removeSeed(player, index) {

        const plot = player.farm.plots[index];

        plot.seedId = null;
        plot.plantedAt = null;
        plot.growthModifier = null;

        player.notify();
        SaveService.autoSave(player);

        return { ok: true, message: "Você removeu a semente antes da colheita." };

    }

    // Pode plantar em terra seca, normal ou molhada — a umidade NAQUELE
    // instante só decide o buff/debuff de crescimento (GROWTH_MODIFIER),
    // nunca impede o plantio.
    static plantSeed(player, index, seedItem) {

        const plot = player.farm.plots[index];

        if (!plot.tilled || plot.seedId) {
            return { ok: false, message: "Isso não pode ser feito!" };
        }

        const crop = farmCrops[seedItem.cropId];

        if (!crop) return { ok: false, message: "Semente inválida." };

        const moisture = this.getMoistureState(plot);

        player.removeItem(seedItem, 1);

        plot.seedId = seedItem.id;
        plot.plantedAt = Date.now();
        plot.growthModifier = GROWTH_MODIFIER[moisture] ?? 1;

        player.notify();
        SaveService.autoSave(player);

        return { ok: true, message: `${crop.name} plantado!` };

    }

    // Rega terra normal OU seca (não precisa mais estar seca) — só
    // rejeita grama (não arada) e terra já molhada.
    static water(player, index) {

        const plot = player.farm.plots[index];

        const moisture = this.getMoistureState(plot);

        if (moisture !== "normal" && moisture !== "dry") {
            return { ok: false, message: "Essa terra não pode ser molhada." };
        }

        plot.wateredAt = Date.now();

        player.notify();
        SaveService.autoSave(player);

        return { ok: true, message: "Você molhou o solo!" };

    }

    static harvest(player, index) {

        const plot = player.farm.plots[index];

        if (!plot.seedId) {
            return { ok: false, message: "Isso não pode ser feito!" };
        }

        if (!this.isReadyToHarvest(plot)) {
            return { ok: false, message: "Ainda não está pronto, aguarde mais um tempo!" };
        }

        const crop = this.getCrop(plot.seedId);

        for (let i = 0; i < crop.harvestYield; i++) {
            player.addItem(crop.harvestedItem);
        }

        player.farm.petXP = (player.farm.petXP ?? 0) + crop.petXP;

        plot.seedId = null;
        plot.plantedAt = null;
        plot.growthModifier = null;

        player.notify();
        SaveService.autoSave(player);

        return { ok: true, message: "Você realizou a colheita, itens foram adicionados no seu inventário!" };

    }

}
