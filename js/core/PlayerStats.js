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

        // Sem nenhum item equipado não existe teto — ele só entra em
        // cena quando há raridade de item pra basear o limite.
        const cap = this.getHighestEquippedRarity()?.secondaryCap;

        // Math.min sozinho só trava o TETO — sem o Math.max(0, ...),
        // qualquer coisa que deixasse esses valores negativos (ex: uma
        // migração de save antiga fora de sincronia) passava direto pro
        // jogador como "-2%" em vez de simplesmente não existir. Nenhum
        // desses quatro atributos tem uma fonte legítima de valor negativo.
        //
        // O teto só se aplica ao que vem do EQUIPAMENTO (o que a
        // raridade atual permite rolar) — o bônus do Quartzo Rosa
        // (base.X, permanente e ganho à parte, não vem do item) some por
        // cima, sem limite, senão upar a pedra em uma arma já no teto de
        // raridade simplesmente não fazia nada.
        const clampEquipment = (raw) => cap != null ? Math.max(0, Math.min(raw, cap)) : Math.max(0, raw);
        const withBaseBonus = (statKey) => clampEquipment(equipment[statKey] || 0) + Math.max(0, base[statKey] || 0);

        return {

            attack: (base.attack || 0) + (equipment.attack || 0),

            armor: (base.armor || 0) + (equipment.armor || 0),

            agility: (base.agility || 0) + (equipment.agility || 0),

            criticalChance: withBaseBonus("criticalChance"),

            lifeSteal: withBaseBonus("lifeSteal"),

            penetration: withBaseBonus("penetration"),

            absorption: withBaseBonus("absorption")

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