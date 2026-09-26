import PetService from "./PetService.js";

/* ==========================================================
   PODER — número único que resume a força do personagem.
   Só é exibido (Status do personagem); NÃO entra em nenhum
   cálculo de combate. Todos os pesos ficam aqui em cima pra
   facilitar o balanceamento.

   Só os atributos primários contam: Ataque + Armadura + Agilidade.
========================================================== */

// Multiplicador por raridade do item equipado.
const RARITY_MULTIPLIER = {
    common: 10,
    uncommon: 12,
    rare: 25,
    mystic: 35,
    legendary: 50,
    ultraje: 70
};

// Atributos base do personagem (nível 1 + bônus de level up) valem
// o mesmo que um item comum.
const BASE_MULTIPLIER = 10;

// Valor fixo somado por nível do jogador.
const LEVEL_MULTIPLIER = 80;

// Pet: (atributos + dano da habilidade) x multiplicador das estrelas,
// mais um bônus fixo pelo estágio (índice em PetService.getStages:
// 0 = Filhote, 1 = Jovem, 2 = Adulto). Ovo não dá poder.
const PET_STAR_MULTIPLIER = { 3: 12, 4: 15, 5: 18 };
const DEFAULT_PET_STAR_MULTIPLIER = 12;
const PET_STAGE_BONUS = [25, 75, 150];

// Só a parte POSITIVA de cada atributo conta — penalidade (ex:
// Espada Comum tem -4 de agilidade) não "apaga" o poder do item.
const PRIMARY_STATS = ["attack", "armor", "agility"];
const sumPrimary = (stats = {}) =>
    PRIMARY_STATS.reduce((total, key) => total + Math.max(0, stats[key] ?? 0), 0);

export default class PowerService {

    static getBasePower(player) {
        return sumPrimary(player.baseStats) * BASE_MULTIPLIER;
    }

    static getLevelPower(player) {
        return player.level * LEVEL_MULTIPLIER;
    }

    static getItemPower(item) {
        if (!item?.rarity) return 0;
        const multiplier = RARITY_MULTIPLIER[item.rarity.id] ?? BASE_MULTIPLIER;
        return sumPrimary(item.stats) * multiplier;
    }

    static getEquipmentPower(player) {
        return Object.entries(player.equipment)
            .filter(([slot]) => slot !== "pet")
            .reduce((total, [, item]) => total + this.getItemPower(item), 0);
    }

    // Usa pet.stats (já escalado pela fome, igual ao que ele dá ao
    // jogador) — pet com fome baixa mostra menos poder.
    static getPetPower(player) {

        const pet = player.equipment.pet;

        if (!pet || pet.shocked === false) return 0; // ovo não conta

        const stage = PetService.getCurrentStage(pet);

        if (!stage) return 0;

        const stageIndex = PetService.getStages(pet.family).indexOf(stage);
        const starCount = (pet.stars?.match(/★/g) ?? []).length;
        const multiplier = PET_STAR_MULTIPLIER[starCount] ?? DEFAULT_PET_STAR_MULTIPLIER;
        const scaled = PetService.getScaledStats(pet);

        // A queimadura do Boitatá entra na conta igual à mordida dos
        // outros pets (senão ele apareceria bem mais fraco do que é).
        const abilityDamage = scaled.biteDamage + scaled.burnDamage;

        const statsPower = (sumPrimary(pet.stats) + abilityDamage) * multiplier;

        return statsPower + (PET_STAGE_BONUS[stageIndex] ?? 0);

    }

    static getBreakdown(player) {

        const breakdown = {
            base: this.getBasePower(player),
            level: this.getLevelPower(player),
            equipment: this.getEquipmentPower(player),
            pet: this.getPetPower(player)
        };

        breakdown.total = breakdown.base + breakdown.level + breakdown.equipment + breakdown.pet;

        return breakdown;

    }

    static getPower(player) {
        return this.getBreakdown(player).total;
    }

}
