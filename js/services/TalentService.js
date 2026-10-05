export const TALENTS = [
    { id: "attack", stat: "attack", label: "Dano de ataque", icon: "assets/img/assets/talent-tree/up-sword.png" },
    { id: "armor", stat: "armor", label: "Armadura", icon: "assets/img/assets/talent-tree/up-shild.png" },
    { id: "agility", stat: "agility", label: "Velocidade", icon: "assets/img/assets/talent-tree/up-speed.png" }
];

export const MAX_LEVEL = 3;
// Ganho do atributo e custo de vida são independentes: o atributo sobe
// pouco, mas a vida perdida pesa mais.
export const GAIN_PERCENT_PER_LEVEL = 1;
export const LIFE_LOSS_PERCENT_PER_LEVEL = 3;
export const REQUIRED_CLEARS = 3;
export const UPGRADE_COSTS = [50000, 70000, 100000];
export const RESET_COST = 100000;

// Cada grupo = 3 fases + o boss da própria região. Completo (3 vitórias em
// cada) vale 1 ponto. Caverna tem 6 fases e 2 bosses, então dá 2 pontos.
export const POINT_GROUPS = [
    { phases: ["forest_1", "forest_2", "forest_3"], boss: "forest_boss" },
    { phases: ["cave_1", "cave_2", "cave_3"], boss: "cave_boss" },
    { phases: ["cave_4", "cave_5", "cave_6"], boss: "cave_boss2" },
    { phases: ["ocean_1", "ocean_2", "ocean_3"], boss: "ocean_boss" },
    { phases: ["desert_1", "desert_2", "desert_3"], boss: "desert_boss" },
    { phases: ["vulcan_1", "vulcan_2", "vulcan_3"], boss: "vulcan_boss" },
    { phases: ["mansion_1", "mansion_2", "mansion_3"], boss: "mansion_boss" },
    { phases: ["Floresta_1", "Floresta_2", "Floresta_3"], boss: "Floresta_boss" },
    { phases: ["hell_1", "hell_2", "hell_3"], boss: "Hell_boss" }
];

export default class TalentService {

    static getLevels(player) {
        return { attack: 0, armor: 0, agility: 0, ...(player.progress.talents ?? {}) };
    }

    static getEarnedPoints(player) {
        return POINT_GROUPS.filter(group => this.isGroupComplete(player, group)).length;
    }

    static isGroupComplete(player, group) {
        return [...group.phases, group.boss].every(id => player.getDungeonClears(id) >= REQUIRED_CLEARS);
    }

    static getSpentPoints(player) {
        const levels = this.getLevels(player);
        return TALENTS.reduce((total, talent) => total + (levels[talent.id] ?? 0), 0);
    }

    static getAvailablePoints(player) {
        return this.getEarnedPoints(player) - this.getSpentPoints(player);
    }

    // Preço do próximo nível do talento (1º = 50k, 2º = 70k, 3º = 100k).
    // null quando já está no nível máximo.
    static getUpgradeCost(player, talentId) {
        const level = this.getLevels(player)[talentId] ?? 0;
        return level < MAX_LEVEL ? UPGRADE_COSTS[level] : null;
    }

    static canInvest(player, talentId) {
        const levels = this.getLevels(player);
        const cost = this.getUpgradeCost(player, talentId);
        return this.getAvailablePoints(player) > 0
            && (levels[talentId] ?? 0) < MAX_LEVEL
            && player.gold >= cost;
    }

    static invest(player, talentId) {

        if (!this.canInvest(player, talentId)) {
            return { ok: false, message: "Sem pontos disponíveis ou ouro insuficiente." };
        }

        const cost = this.getUpgradeCost(player, talentId);
        player.gold -= cost;

        const levels = this.getLevels(player);
        player.progress.talents = { ...levels, [talentId]: levels[talentId] + 1 };

        this.sync(player);

        player.notify();

        return { ok: true };

    }

    // Vida perdida e atributo ganho são calculados sobre a vida máxima "crua"
    // (sem os cortes dos talentos). Idempotente: só aplica a diferença em
    // relação ao que já foi aplicado.
    static sync(player) {

        const levels = this.getLevels(player);
        const applied = player.talentApplied ?? { lifeLost: 0, attack: 0, armor: 0, agility: 0 };

        const rawMaxHP = player.maxHP + applied.lifeLost;

        const desiredGain = {};
        let totalLost = 0;

        TALENTS.forEach(talent => {
            const level = levels[talent.id] ?? 0;
            totalLost += Math.floor(rawMaxHP * (LIFE_LOSS_PERCENT_PER_LEVEL / 100) * level);
            desiredGain[talent.id] = Math.floor(rawMaxHP * (GAIN_PERCENT_PER_LEVEL / 100) * level);
        });

        const lifeDiff = totalLost - applied.lifeLost;

        player.maxHP = Math.max(1, player.maxHP - lifeDiff);
        player.currentHP = Math.min(player.currentHP, player.maxHP);

        TALENTS.forEach(talent => {
            const diff = desiredGain[talent.id] - (applied[talent.id] ?? 0);
            player.baseStats[talent.stat] = (player.baseStats[talent.stat] ?? 0) + diff;
            applied[talent.id] = desiredGain[talent.id];
        });

        applied.lifeLost = totalLost;
        player.talentApplied = applied;

    }

    // Devolve todos os pontos gastos: zera os níveis e a sync desfaz a
    // vida/atributo convertidos. Não custa nada — os pontos vêm das regiões.
    static reset(player) {

        if (player.gold < RESET_COST) {
            return { ok: false, message: "Ouro insuficiente pra resetar." };
        }

        player.gold -= RESET_COST;
        player.progress.talents = { attack: 0, armor: 0, agility: 0 };

        this.sync(player);

        player.notify();

        return { ok: true };

    }

    static lifeLostFor(player, talentId) {
        const applied = player.talentApplied ?? { lifeLost: 0 };
        const rawMaxHP = player.maxHP + applied.lifeLost;
        const level = this.getLevels(player)[talentId] ?? 0;
        return Math.floor(rawMaxHP * (LIFE_LOSS_PERCENT_PER_LEVEL / 100) * level);
    }

    static describe(talent) {
        return `Converte ${GAIN_PERCENT_PER_LEVEL}% da sua vida em ${talent.label}`;
    }

}
