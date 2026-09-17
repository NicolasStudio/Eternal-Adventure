import pets from "../data/pet.js";
import SaveService from "./SaveService.js";

const HUNGER_DECAY_STEP_MS = 50 * 60 * 1000; // 50min
const HUNGER_DECAY_AMOUNT = 10;
const MAX_HUNGER = 100;

// Curva de XP genérica — funciona pra QUALQUER pet/família sem precisar
// de uma tabela de XP própria por espécie.
const XP_BASE = 30;
const XP_EXPONENT = 1.6;

// Controla o pet-instância que mora no inventário/equipamento do
// jogador (seu próprio uid, level, xp, fome, lastHungerTickAt). Os
// dados "de espécie" (imagem, stats fixos, habilidade) ficam em
// js/data/pet.js — aqui só deriva/muta o que é único de cada pet, do
// mesmo jeito que o FarmService faz com os canteiros.
export default class PetService {

    /* =====================================================
       ESTÁGIO / ESPÉCIE
    ===================================================== */

    static getStages(family) {
        return Object.values(pets)
            .filter(p => p.family === family && p.shocked)
            .sort((a, b) => a.nivel - b.nivel);
    }

    static getEggTemplate(family) {
        return Object.values(pets).find(p => p.family === family && !p.shocked) ?? null;
    }

    // Estágio ativo = maior estágio chocado cujo nivel seja <= o nível
    // atual do pet — fica fixo depois do último estágio (ex: nível 32
    // pro Lobo Adulto); só muda de verdade trocando de família/espécie.
    static getCurrentStage(petInstance) {

        const stages = this.getStages(petInstance.family);

        let current = stages[0] ?? null;

        for (const stage of stages) {
            if (stage.nivel <= petInstance.level) current = stage;
        }

        return current;

    }

    static getXpForNextLevel(level) {
        return Math.round(XP_BASE * Math.pow(Math.max(1, level), XP_EXPONENT));
    }

    /* =====================================================
       FOME
    ===================================================== */

    // Decaimento preguiçoso: avança em blocos INTEIROS de 50min (-10
    // cada), preservando o resto do tempo que ainda não completou um
    // bloco — não "perde" progresso parcial toda vez que é checado.
    static applyHungerDecay(petInstance) {

        const now = Date.now();
        const last = petInstance.lastHungerTickAt ?? now;
        const elapsed = now - last;
        const ticks = Math.floor(elapsed / HUNGER_DECAY_STEP_MS);

        if (ticks <= 0) return;

        petInstance.fome = Math.max(0, petInstance.fome - ticks * HUNGER_DECAY_AMOUNT);
        petInstance.lastHungerTickAt = last + ticks * HUNGER_DECAY_STEP_MS;

        // Guardado no PRÓPRIO pet (igual xp/fome/lastHungerTickAt) em vez
        // de progress.stats — assim a conquista "Jejum intermitente?" olha
        // qualquer pet já possuído (inventário + equipado), sem precisar
        // encanar `player` por toda a cadeia de chamadas só de decaimento.
        if (petInstance.fome === 0) petInstance.hungerHitZero = true;

    }

    static getHunger(petInstance) {
        this.applyHungerDecay(petInstance);
        return petInstance.fome;
    }

    static getHungerMultiplier(petInstance) {
        return this.getHunger(petInstance) / MAX_HUNGER;
    }

    /* =====================================================
       STATS DADOS AO JOGADOR
    ===================================================== */

    // Stats fixos do estágio atual, escalados pela % de fome — sempre
    // arredondado pra baixo (nunca um valor quebrado passando pro
    // jogador). biteDamage é a Mordida já escalada junto — pets com
    // habilidade de cura (ex: Duende, campo `heal` em vez de `damage`)
    // usam o mesmo número pros dois efeitos: a Mordida causa ESSE dano
    // no inimigo E cura essa mesma quantidade (ver healAmount abaixo).
    static getScaledStats(petInstance) {

        const stage = this.getCurrentStage(petInstance);
        const multiplier = this.getHungerMultiplier(petInstance);
        const scale = (value) => Math.floor((value ?? 0) * multiplier);
        const ability = stage?.habilities?.hability;

        if (!stage) {
            return { life: 0, attack: 0, armor: 0, agility: 0, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0, biteDamage: 0, healAmount: 0 };
        }

        return {
            life: scale(stage.stats.life),
            attack: scale(stage.stats.attack),
            armor: scale(stage.stats.armor),
            agility: scale(stage.stats.agility),
            criticalChance: scale(stage.stats.criticalChance),
            lifeSteal: scale(stage.stats.lifeSteal),
            penetration: scale(stage.stats.penetration),
            absorption: scale(stage.stats.absorption),
            biteDamage: scale(ability?.damage ?? ability?.heal),
            healAmount: scale(ability?.heal)
        };

    }

    // Chamado sempre que o pet equipado pode ter mudado (equipar/
    // desequipar, alimentar, ou o tick periódico do HUD) — dois efeitos:
    //
    // 1) Reescreve `pet.stats` (o item que está em player.equipment.pet)
    //    com os valores JÁ escalados pela fome atual. PlayerStats.
    //    getEquipmentStats() já soma item.stats de QUALQUER equipamento
    //    de forma genérica — não precisa saber nada sobre pet/fome, só
    //    precisa que os números que já estão ali estejam em dia. Isso
    //    evita importar PetService dentro de PlayerStats.js, que criaria
    //    um ciclo (PlayerStats -> PetService -> SaveService -> Player ->
    //    PlayerStats, já que Player instancia PlayerStats no construtor).
    //
    // 2) Reconcilia player.maxHP/currentHP com a Vida dada pelo pet —
    //    idempotente (só ajusta a DIFERENÇA entre o que já estava
    //    aplicado e o valor atual), nunca acumula em dobro.
    static syncEquippedPetContribution(player) {

        const pet = player.equipment.pet;
        const scaled = pet ? this.getScaledStats(pet) : null;

        if (pet && scaled) {

            pet.stats = {
                life: scaled.life,
                attack: scaled.attack,
                armor: scaled.armor,
                agility: scaled.agility,
                criticalChance: scaled.criticalChance,
                lifeSteal: scaled.lifeSteal,
                penetration: scaled.penetration,
                absorption: scaled.absorption
            };

        }

        const newBonus = scaled?.life ?? 0;
        const oldBonus = player.petLifeBonusApplied ?? 0;

        if (newBonus === oldBonus) return;

        const diff = newBonus - oldBonus;

        player.maxHP = Math.max(1, player.maxHP + diff);
        player.currentHP = Math.min(player.maxHP, Math.max(0, player.currentHP + diff));
        player.petLifeBonusApplied = newBonus;

        player.notify();

    }

    /* =====================================================
       AÇÕES
    ===================================================== */

    // Ovo -> primeiro estágio chocado da família. Muta o MESMO item
    // (mesmo uid) — ele "evolui" no inventário, não vira outro objeto.
    static hatch(player, eggItem) {

        if (!eggItem || eggItem.shocked) {
            return { ok: false, message: "Isso não pode ser chocado." };
        }

        const firstStage = this.getStages(eggItem.family)[0];

        if (!firstStage) {
            return { ok: false, message: "Não foi possível chocar esse ovo." };
        }

        eggItem.shocked = true;
        eggItem.slot = "pet";
        eggItem.level = firstStage.nivel;
        eggItem.xp = 0;
        eggItem.fome = MAX_HUNGER;
        eggItem.lastHungerTickAt = Date.now();

        this.syncDisplayFromStage(eggItem);

        player.progress.stats.eggsHatched = (player.progress.stats.eggsHatched ?? 0) + 1;

        player.notify();
        SaveService.autoSave(player);

        return { ok: true, message: `${eggItem.name} chocou!` };

    }

    // Nome/imagem/estrelas/descrição do pet sempre refletem o estágio
    // de evolução ATUAL (maior nivel <= petInstance.level) — chamado
    // ao chocar e sempre que o pet sobe de nível (ver applyPetXP),
    // pra imagem/nome trocarem sozinhos ao cruzar cada estágio (ex: o
    // Lobo muda em 1, 18 e 32). Os stats/habilidade já eram derivados
    // ao vivo (getScaledStats); isso cobre o que faltava.
    static syncDisplayFromStage(petInstance) {

        const stage = this.getCurrentStage(petInstance);

        if (!stage) return;

        petInstance.name = stage.name;
        petInstance.image = stage.image;
        petInstance.icon = stage.image;
        petInstance.description = stage.description;
        petInstance.stars = stage.stars;

        // Cópia "crua" dos stats do estágio — só fica de verdade em dia
        // (escalada pela fome) quando equipado, ver
        // syncEquippedPetContribution; isso evita ficar com números
        // desatualizados enquanto o pet não está equipado.
        petInstance.stats = { ...stage.stats };

    }

    // Sobe de nível o quanto der com a XP acumulada — pode subir mais
    // de um nível de uma vez, igual Player.addXP.
    static applyPetXP(petInstance, amount) {

        petInstance.xp = (petInstance.xp ?? 0) + amount;

        let leveledUp = false;

        while (true) {

            const required = this.getXpForNextLevel(petInstance.level);

            if (petInstance.xp < required) break;

            petInstance.xp -= required;
            petInstance.level++;
            leveledUp = true;

        }

        // Só resincroniza nome/imagem/stats quando o nível realmente
        // mudou — evita recomputar (e reatribuir `stats`) toda vez que
        // o pet só ganha XP sem chegar a subir de nível.
        if (leveledUp) {
            this.syncDisplayFromStage(petInstance);
        }

    }

    // Quantas unidades faltam pra fome bater 100 (arredondado pra cima,
    // nunca mais que o que o jogador tem) — teto do range do botão
    // "Alimentar", pra nunca sugerir desperdiçar alimento à toa.
    static getUnitsNeededToFillHunger(petInstance, foodItem) {

        const feedValue = foodItem?.petFeedValue ?? 0;

        if (feedValue <= 0) return 0;

        this.applyHungerDecay(petInstance);

        const missing = MAX_HUNGER - petInstance.fome;

        if (missing <= 0) return 0;

        return Math.min(foodItem.quantity ?? 1, Math.ceil(missing / feedValue));

    }

    // Teto do range do botão "Upar Pet" — todo o estoque do alimento
    // selecionado, já que ali o jogador escolhe de propósito gastar
    // mais do que precisa só pra render XP.
    static getOwnedUnits(foodItem) {
        return foodItem?.quantity ?? 0;
    }

    // Consome EXATAMENTE `units` do alimento selecionado — a fome sobe
    // primeiro em cada unidade, o que sobrar (se a fome já bater 100)
    // vira XP direto. Usado tanto por "Alimentar" (o jogador escolhe
    // até a quantidade JUSTA pra encher a fome) quanto por "Upar Pet"
    // (o jogador escolhe livremente até todo o estoque, de propósito
    // gerando XP com a sobra).
    static feedUnits(player, petInstance, foodItem, units) {

        if (!petInstance || !petInstance.shocked) {
            return { ok: false, message: "Escolha um pet chocado pra alimentar." };
        }

        const feedValue = foodItem?.petFeedValue ?? 0;

        if (feedValue <= 0) {
            return { ok: false, message: "Esse item não serve de alimento pro pet." };
        }

        const owned = foodItem.quantity ?? 1;
        const requestedUnits = Math.max(0, Math.min(Math.floor(units), owned));

        if (requestedUnits <= 0) {
            return { ok: false, message: "Escolha ao menos 1 unidade." };
        }

        this.applyHungerDecay(petInstance);

        let hungerGained = 0;
        let xpGained = 0;

        for (let i = 0; i < requestedUnits; i++) {

            const missingNow = MAX_HUNGER - petInstance.fome;
            const usedForHunger = Math.min(feedValue, missingNow);
            const overflow = feedValue - usedForHunger;

            petInstance.fome = Math.min(MAX_HUNGER, petInstance.fome + usedForHunger);

            if (overflow > 0) this.applyPetXP(petInstance, overflow);

            hungerGained += usedForHunger;
            xpGained += overflow;

        }

        player.removeItem(foodItem, requestedUnits);

        player.progress.stats.petFeedCount = (player.progress.stats.petFeedCount ?? 0) + 1;

        if (player.equipment.pet?.uid === petInstance.uid) {
            this.syncEquippedPetContribution(player);
        }

        player.notify();
        SaveService.autoSave(player);

        return {
            ok: true,
            message: xpGained > 0
                ? `${requestedUnits}x ${foodItem.name} usada(s)! (+${hungerGained} fome, +${xpGained} XP)`
                : `${requestedUnits}x ${foodItem.name} usada(s)! (+${hungerGained} fome)`
        };

    }

}
