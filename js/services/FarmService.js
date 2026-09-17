import farmCrops from "../data/farmCrops.js";
import seeds from "../data/seeds.js";
import SaveService from "./SaveService.js";

const PLOT_COUNT = 24;
const PLOT_COST_STEP = 100000; // cada canteiro custa +100k que o anterior

// Ciclo de umidade em 2 estágios: molhada dura 4h e vira normal
// sozinha; normal (seja por ter acabado de secar da rega, seja por
// nunca ter sido regada) leva mais 3h pra virar seca.
const WATERED_DURATION_MS = 4 * 60 * 60 * 1000; // 4h molhada antes de virar normal
const NORMAL_TO_DRY_MS = 3 * 60 * 60 * 1000; // 3h em terra normal antes de secar

const SOIL_GRASS = "assets/img/assets/farm/earth/grass.png";
const SOIL_EARTH = "assets/img/assets/farm/earth/earth.png";
const SOIL_WATER = "assets/img/assets/farm/earth/earth-water.png";
const SOIL_DRY = "assets/img/assets/farm/earth/earth-dry.png";
const PEST_IMAGE = "assets/img/assets/farm/earth/pest.png";

const PEST_SPAWN_INTERVAL_MS = 5 * 60 * 60 * 1000; // 5h

// Praga ativa atrasa o crescimento em 15% — não é um multiplicador
// fixo tipo GROWTH_MODIFIER (aquele é travado no instante do plantio);
// aqui o atraso só conta enquanto a praga está mesmo presente, então é
// acumulado em plot.pestLostMs (ver getPestLostMs/removePest) toda vez
// que uma infestação termina, e somado ao vivo enquanto está ativa.
const PEST_GROWTH_PENALTY = 0.15;

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

    // Custo em ouro pra arar CADA canteiro (índice 0-23): cresce linear,
    // +100k por canteiro (1º = 100k, 2º = 200k, ..., 24º = 2,4M).
    static getPlotCost(index) {
        return PLOT_COST_STEP * (index + 1);
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
    // desde o plantio, ajustado pelo growthModifier fixado no plantio e
    // pelo tempo perdido pra praga (ver getPestLostMs).
    static getStageIndex(plot) {

        const crop = this.getCrop(plot.seedId);

        if (!crop || !plot.plantedAt) return 0;

        const effectiveGrowTime = crop.growTimeMs * (plot.growthModifier ?? 1);
        const elapsed = Math.max(0, (Date.now() - plot.plantedAt) - this.getPestLostMs(plot));
        const stepMs = effectiveGrowTime / 4;

        return Math.max(0, Math.min(4, Math.floor(elapsed / stepMs)));

    }

    static isReadyToHarvest(plot) {
        return !!plot.seedId && this.getStageIndex(plot) >= 4;
    }

    // Quanto falta (em ms) pra colheita — mesma conta de
    // getStageIndex, só que sem truncar em estágios. 0 se já pronta,
    // sem semente, ou sem plantedAt.
    static getRemainingMs(plot) {

        const crop = this.getCrop(plot.seedId);

        if (!crop || !plot.plantedAt) return 0;

        const effectiveGrowTime = crop.growTimeMs * (plot.growthModifier ?? 1);
        const elapsed = Math.max(0, (Date.now() - plot.plantedAt) - this.getPestLostMs(plot));

        return Math.max(0, effectiveGrowTime - elapsed);

    }

    /* =====================================================
       PRAGA
    ===================================================== */

    static hasPest(plot) {
        return !!plot.pestAt;
    }

    // Tempo total (ms) já perdido pra praga NESSE plantio: o que já foi
    // fechado em infestações anteriores (plot.pestLostMs, gravado por
    // removePest) + 15% do tempo da infestação ATUAL, se houver uma
    // rolando agora. Nunca é guardado "ao vivo" — sempre derivado, igual
    // todo o resto do FarmService.
    static getPestLostMs(plot) {

        const closed = plot.pestLostMs ?? 0;
        const ongoing = plot.pestAt ? (Date.now() - plot.pestAt) * PEST_GROWTH_PENALTY : 0;

        return closed + ongoing;

    }

    // Roda em todo tick da Fazenda (aberta ou não — decaimento preguiçoso
    // igual PetService.applyHungerDecay): avança em blocos INTEIROS do
    // intervalo, e cada bloco nasce uma praga em todo canteiro semeado
    // que ainda não tem uma. Não reinfesta canteiro já com praga — só um
    // por vez, até o jogador tirar com a Anti-Praga.
    static applyPestSpawn(player) {

        const now = Date.now();
        const last = player.farm.lastPestSpawnAt ?? now;
        const elapsed = now - last;
        const ticks = Math.floor(elapsed / PEST_SPAWN_INTERVAL_MS);

        if (ticks <= 0) return;

        let spawned = false;

        player.farm.plots.forEach(plot => {

            if (plot.tilled && plot.seedId && !plot.pestAt) {
                plot.pestAt = now;
                spawned = true;
            }

        });

        player.farm.lastPestSpawnAt = last + ticks * PEST_SPAWN_INTERVAL_MS;

        if (spawned) {
            player.notify();
            SaveService.autoSave(player);
        }

    }

    // Ação da ferramenta Anti-Praga: só funciona em canteiro COM praga —
    // fecha a infestação atual (soma o que ela perdeu em pestLostMs) e
    // libera o canteiro de novo.
    static removePest(player, index) {

        const plot = player.farm.plots[index];

        if (!plot.pestAt) {
            return { ok: false, message: "Só funciona em pragas!" };
        }

        plot.pestLostMs = (plot.pestLostMs ?? 0) + (Date.now() - plot.pestAt) * PEST_GROWTH_PENALTY;
        plot.pestAt = null;

        player.progress.stats.pestsRemoved = (player.progress.stats.pestsRemoved ?? 0) + 1;

        player.notify();
        SaveService.autoSave(player);

        return { ok: true, message: "Você eliminou as Pragas!" };

    }

    static getPestImage() {
        return PEST_IMAGE;
    }

    // "Noite" pra fins de conquista (ex: colher Abóbora à noite) —
    // horário local do jogador, 18h-6h.
    static isNightTime() {
        const hour = new Date().getHours();
        return hour >= 18 || hour < 6;
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
        plot.pestAt = null;
        plot.pestLostMs = null;

        player.progress.stats.removedPlantedSeed = true;

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

        player.progress.stats.seedsPlanted = (player.progress.stats.seedsPlanted ?? 0) + 1;

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

        player.progress.stats.waterCount = (player.progress.stats.waterCount ?? 0) + 1;

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
        const moisture = this.getMoistureState(plot);

        for (let i = 0; i < crop.harvestYield; i++) {
            player.addItem(crop.harvestedItem);
        }

        player.farm.petXP = (player.farm.petXP ?? 0) + crop.petXP;

        player.progress.stats.harvests = (player.progress.stats.harvests ?? 0) + 1;
        player.progress.stats.harvestedFoodCount = (player.progress.stats.harvestedFoodCount ?? 0) + crop.harvestYield;

        // Contagem POR cultura (Mió/Pop corn/Intrigado/Seu-Bolinha/
        // Abrobra — ver AchievementService) — cada crop.id vira uma
        // chave nesse mapa, sem precisar de um contador solto por
        // cultura no progress.stats.
        player.progress.stats.harvestedByCrop ??= {};
        player.progress.stats.harvestedByCrop[crop.id] = (player.progress.stats.harvestedByCrop[crop.id] ?? 0) + crop.harvestYield;

        if (moisture === "dry") player.progress.stats.harvestedWithDrySoil = true;
        if (crop.id === "strawberry") player.progress.stats.harvestedStrawberry = true;
        if (crop.id === "corn") player.progress.stats.harvestedCorn = true;
        if (crop.id === "pumpkin" && this.isNightTime()) player.progress.stats.harvestedPumpkinAtNight = true;

        plot.seedId = null;
        plot.plantedAt = null;
        plot.growthModifier = null;
        plot.pestAt = null;
        plot.pestLostMs = null;

        player.notify();
        SaveService.autoSave(player);

        return { ok: true, message: "Você realizou a colheita, itens foram adicionados no seu inventário!" };

    }

}
