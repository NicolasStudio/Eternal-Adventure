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

    getFinalStats() {

        const base = this.getBaseStats();
        const equipment = this.getEquipmentStats();

        return {

            attack: (base.attack || 0) + (equipment.attack || 0),

            armor: (base.armor || 0) + (equipment.armor || 0),

            agility: (base.agility || 0) + (equipment.agility || 0),

            criticalChance: (base.criticalChance || 0) + (equipment.criticalChance || 0),

            lifeSteal: (base.lifeSteal || 0) + (equipment.lifeSteal || 0),

            penetration: (base.penetration || 0) + (equipment.penetration || 0)

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

}