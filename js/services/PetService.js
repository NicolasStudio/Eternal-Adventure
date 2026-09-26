import pets from "../data/pet.js";
import levelsPet, { PET_MAX_LEVEL, LIFE_PER_POINT } from "../data/levelsPet.js";
import SaveService from "./SaveService.js";

const HUNGER_DECAY_STEP_MS = 50 * 60 * 1000; // 50min
const HUNGER_DECAY_AMOUNT = 10;

// Teto de fome por raridade — pet de mais estrelas aguenta mais fome
// acumulada (maior "reservatório"), não decai mais devagar. Contagem de
// estrelas lida direto do campo `stars` ("★★★" = 3, etc.), então basta
// dar o número certo de estrelas ao pet em pet.js pra ele cair na faixa
// certa, sem precisar mexer aqui a cada pet novo.
const MAX_HUNGER_BY_STARS = { 3: 100, 4: 250, 5: 500 };
const DEFAULT_MAX_HUNGER = 100;

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

    // 0 no nível máximo (não existe próximo nível) — a tela usa isso
    // pra mostrar "MAX" em vez de uma barra de XP.
    static getXpForNextLevel(level) {

        if (level >= PET_MAX_LEVEL) return 0;

        return Math.round(XP_BASE * Math.pow(Math.max(1, level), XP_EXPONENT));

    }

    static isMaxLevel(petInstance) {
        return (petInstance?.level ?? 0) >= PET_MAX_LEVEL;
    }

    // Pet salvo antes da trava (ex: nível 60) volta pro nível máximo,
    // sem XP sobrando. Os stats são sempre calculados a partir do nível,
    // então nada mais precisa ser corrigido.
    static normalizeLevel(petInstance) {

        if (!petInstance || (petInstance.level ?? 0) <= PET_MAX_LEVEL) return;

        petInstance.level = PET_MAX_LEVEL;
        petInstance.xp = 0;

        this.syncDisplayFromStage(petInstance);

    }

    // Atributos do pet NO NÍVEL dado: os do nível 1 (primeiro estágio em
    // pet.js) + tudo que js/data/levelsPet.js dá até esse nível. Sempre
    // calculado do nível atual — um pet nível 17 já recebe na hora
    // tudo até o 17, e mudar a tabela vale pra todos os pets existentes
    // sem precisar migrar save nenhum.
    static getStatsForLevel(family, level) {

        const base = this.getStages(family)[0]?.stats ?? {};
        const capped = Math.min(level ?? 1, PET_MAX_LEVEL);
        const points = { life: 0, attack: 0, armor: 0, agility: 0 };

        for (const [gainLevel, byFamily] of Object.entries(levelsPet)) {

            if (Number(gainLevel) > capped) continue;

            const gain = byFamily[family];

            if (!gain) continue;

            Object.keys(points).forEach(key => { points[key] += gain[key] ?? 0; });

        }

        return {
            ...base,
            life: (base.life ?? 0) + points.life * LIFE_PER_POINT,
            attack: (base.attack ?? 0) + points.attack,
            armor: (base.armor ?? 0) + points.armor,
            agility: (base.agility ?? 0) + points.agility
        };

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

    static getMaxHunger(petInstance) {
        const starCount = (petInstance?.stars?.match(/★/g) ?? []).length;
        return MAX_HUNGER_BY_STARS[starCount] ?? DEFAULT_MAX_HUNGER;
    }

    static getHungerMultiplier(petInstance) {
        return this.getHunger(petInstance) / this.getMaxHunger(petInstance);
    }

    /* =====================================================
       STATS DADOS AO JOGADOR
    ===================================================== */

    // Stats fixos do estágio atual, escalados pela % de fome — sempre
    // arredondado pra baixo (nunca um valor quebrado passando pro
    // jogador). biteDamage é a Mordida já escalada junto — SÓ pets com
    // habilidade de dano FIXO (campo `damage`, ex: Lobo) têm um valor
    // aqui; pets de cura pura (campo `heal`, ex: Duende) não têm mais
    // dano nenhum embutido na mordida, só o efeito de cura (ver
    // healAmount abaixo).
    //
    // mimicRatio é diferente: a habilidade de Mímico (ex: Aranha) não
    // tem dano fixo nenhum, ela copia uma FRAÇÃO do dano que o golpe
    // PRINCIPAL daquele turno realmente causou (já com armadura/crítico/
    // absorção aplicados — "os 50 que bateram", não o ataque bruto).
    // Por isso não dá pra resolver esse número aqui: quem chama
    // getScaledStats não sabe ainda quanto vai bater. Só devolvemos a
    // fração (já reduzida pela fome, igual todo o resto) — cada combate
    // (CombatEngine.petBite, PvpCombatService.simulate*, RaidCombatService.
    // simulateRaid) multiplica isso pelo dano de verdade daquele golpe.
    static getScaledStats(petInstance) {

        const stage = this.getCurrentStage(petInstance);
        const multiplier = this.getHungerMultiplier(petInstance);
        const scale = (value) => Math.floor((value ?? 0) * multiplier);
        const ability = stage?.habilities?.hability;
        const stats = this.getStatsForLevel(petInstance.family, petInstance.level);

        if (!stage) {
            return { life: 0, attack: 0, armor: 0, agility: 0, criticalChance: 0, lifeSteal: 0, penetration: 0, absorption: 0, biteDamage: 0, healAmount: 0, mimicRatio: 0, burnDamage: 0 };
        }

        return {
            life: scale(stats.life),
            attack: scale(stats.attack),
            armor: scale(stats.armor),
            agility: scale(stats.agility),
            criticalChance: scale(stats.criticalChance),
            lifeSteal: scale(stats.lifeSteal),
            penetration: scale(stats.penetration),
            absorption: scale(stats.absorption),
            biteDamage: scale(ability?.damage),
            healAmount: scale(ability?.heal),
            mimicRatio: (ability?.mimicRatio ?? 0) * multiplier,
            // Boitatá: dano de UM tick da queimadura (ver BoitataBurn.js).
            burnDamage: scale(ability?.burnDamage)
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

        this.normalizeLevel(pet);

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
        eggItem.lastHungerTickAt = Date.now();

        // Precisa vir ANTES de setar `fome`: syncDisplayFromStage é
        // quem atualiza `stars` pro estágio já chocado, e getMaxHunger
        // lê `stars` pra saber o teto de fome certo (pet de 4/5
        // estrelas tem reservatório maior — ver MAX_HUNGER_BY_STARS).
        this.syncDisplayFromStage(eggItem);

        eggItem.fome = this.getMaxHunger(eggItem);

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
        petInstance.stats = this.getStatsForLevel(petInstance.family, petInstance.level);

    }

    // Sobe de nível o quanto der com a XP acumulada — pode subir mais
    // de um nível de uma vez, igual Player.addXP.
    static applyPetXP(petInstance, amount) {

        this.normalizeLevel(petInstance);

        // No nível máximo não existe mais XP a ganhar.
        if (this.isMaxLevel(petInstance)) {
            petInstance.xp = 0;
            return;
        }

        petInstance.xp = (petInstance.xp ?? 0) + amount;

        let leveledUp = false;

        while (!this.isMaxLevel(petInstance)) {

            const required = this.getXpForNextLevel(petInstance.level);

            if (petInstance.xp < required) break;

            petInstance.xp -= required;
            petInstance.level++;
            leveledUp = true;

        }

        if (this.isMaxLevel(petInstance)) {
            petInstance.xp = 0;
        }

        // Só resincroniza nome/imagem/stats quando o nível realmente
        // mudou — evita recomputar (e reatribuir `stats`) toda vez que
        // o pet só ganha XP sem chegar a subir de nível.
        if (leveledUp) {
            this.syncDisplayFromStage(petInstance);
        }

    }

    // Quantas unidades faltam pra fome bater no teto do pet (arredondado
    // pra cima, nunca mais que o que o jogador tem) — teto do range do
    // botão "Alimentar", pra nunca sugerir desperdiçar alimento à toa.
    static getUnitsNeededToFillHunger(petInstance, foodItem) {

        const feedValue = foodItem?.petFeedValue ?? 0;

        if (feedValue <= 0) return 0;

        this.applyHungerDecay(petInstance);

        const missing = this.getMaxHunger(petInstance) - petInstance.fome;

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
    // primeiro em cada unidade, o que sobrar (se a fome já bater no
    // teto do pet) vira XP direto. Usado tanto por "Alimentar" (o jogador escolhe
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
        let requestedUnits = Math.max(0, Math.min(Math.floor(units), owned));

        // No nível máximo a sobra de alimento não vira XP, então só
        // gasta o necessário pra encher a fome (nunca desperdiça).
        if (this.isMaxLevel(petInstance)) {

            const needed = this.getUnitsNeededToFillHunger(petInstance, foodItem);

            if (needed <= 0) {
                return { ok: false, message: "Seu pet já está no nível máximo e com a fome cheia." };
            }

            requestedUnits = Math.min(requestedUnits, needed);

        }

        if (requestedUnits <= 0) {
            return { ok: false, message: "Escolha ao menos 1 unidade." };
        }

        this.applyHungerDecay(petInstance);

        const maxHunger = this.getMaxHunger(petInstance);

        let hungerGained = 0;
        let xpGained = 0;

        for (let i = 0; i < requestedUnits; i++) {

            const missingNow = maxHunger - petInstance.fome;
            const usedForHunger = Math.min(feedValue, missingNow);
            const overflow = feedValue - usedForHunger;

            petInstance.fome = Math.min(maxHunger, petInstance.fome + usedForHunger);

            if (overflow > 0) this.applyPetXP(petInstance, overflow);

            hungerGained += usedForHunger;
            xpGained += overflow;

        }

        player.removeItem(foodItem, requestedUnits);

        // Só conta como "alimentar" de verdade se a fome subiu — usar
        // "Upar Pet" com a fome já no teto (puro XP via sobra) não pode
        // contar pra achievement/estatística de alimentação.
        if (hungerGained > 0) {
            player.progress.stats.petFeedCount = (player.progress.stats.petFeedCount ?? 0) + 1;
        }

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
