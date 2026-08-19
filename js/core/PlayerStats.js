export default class PlayerStats {

    constructor(player) {
        this.player = player;
    }

    getBaseStats() {
        return this.player.baseStats;
    }

    getEquipmentStats() {

        const stats = {};

        Object.values(this.player.equipment).forEach(item => {

            if (!item) return;

            Object.entries(item.stats).forEach(([key, value]) => {

                if (!(key in stats)) {
                    stats[key] = 0;
                }

                stats[key] += value;

            });

        });

        return stats;
    }

    // Maior raridade entre os itens equipados no momento — é ela que
    // define o teto de crítico/penetração/roubo de vida (qualityStep
    // já cresce junto com a raridade, então dá pra usar como ranking).
    getHighestEquippedRarity() {

        let highest = null;

        Object.values(this.player.equipment).forEach(item => {

            if (!item?.rarity) return;

            if (!highest || item.rarity.qualityStep > highest.qualityStep) {
                highest = item.rarity;
            }

        });

        return highest;

    }

    getFinalStats() {

        const base = this.getBaseStats();
        const equipment = this.getEquipmentStats();

        const rawCriticalChance = (base.criticalChance || 0) + (equipment.criticalChance || 0);
        const rawLifeSteal = (base.lifeSteal || 0) + (equipment.lifeSteal || 0);
        const rawPenetration = (base.penetration || 0) + (equipment.penetration || 0);
        const rawAbsorption = (base.absorption || 0) + (equipment.absorption || 0);

        // Sem nenhum item equipado não existe teto — ele só entra em
        // cena quando há raridade de item pra basear o limite.
        const cap = this.getHighestEquippedRarity()?.secondaryCap;

        return {

            attack: (base.attack || 0) + (equipment.attack || 0),

            armor: (base.armor || 0) + (equipment.armor || 0),

            agility: (base.agility || 0) + (equipment.agility || 0),

            criticalChance: cap != null ? Math.min(rawCriticalChance, cap) : rawCriticalChance,

            lifeSteal: cap != null ? Math.min(rawLifeSteal, cap) : rawLifeSteal,

            penetration: cap != null ? Math.min(rawPenetration, cap) : rawPenetration,

            absorption: cap != null ? Math.min(rawAbsorption, cap) : rawAbsorption

        };
    }

    get attack() {
        return this.getFinalStats().attack;
    }

    get armor() {
        return this.getFinalStats().armor;
    }

    get agility() {
        return this.getFinalStats().agility;
    }

    get criticalChance() {
        return this.getFinalStats().criticalChance;
    }

    get lifeSteal() {
        return this.getFinalStats().lifeSteal;
    }

    get penetration() {
        return this.getFinalStats().penetration;
    }

    get absorption() {
        return this.getFinalStats().absorption;
    }

}