// Qual atributo especial cada classe tem — usado só pra saber onde o
// bônus de Sorte (ver getFinalStats) deve entrar. Uma classe por
// atributo, sempre (nenhuma tem dois, nenhum atributo é dividido entre
// duas classes).
const SPECIAL_STAT_BY_CLASS = {
    warrior: "absorption",
    archer: "criticalChance",
    mage: "penetration",
    barbarian: "lifeSteal",
    putrid: "miasmaChance",
    mimic: "reflection",
    crazy: "confusionChance",
    spark: "paralysisChance",
    samurai: "doubleStrikeChance",
    singularity: "gravityChance"
};

// Quanto de % de atributo especial cada ponto de Sorte rende: 0,5% a
// cada 50 pontos = 0,01% por ponto. Contínuo (não em degraus de 50) —
// confirmado com o usuário.
const SORTE_SPECIAL_PERCENT_PER_POINT = 0.5 / 50;

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

        // Sem teto artificial de propósito: o valor final é exatamente a
        // soma do que os itens equipados (+ Quartzo Rosa, em base.X) dão.
        // Mudar 1% num item muda 1% no jogador, sem nada escondendo a
        // diferença — um teto por raridade já existiu aqui e causava
        // confusão (mudança no item sem efeito nenhum no personagem,
        // porque ficava presa embaixo do teto). Math.max(0, ...) só evita
        // valor negativo (ex: uma migração de save antiga fora de
        // sincronia) — nenhum desses atributos tem fonte legítima negativa.
        const withBaseBonus = (statKey) => Math.max(0, equipment[statKey] || 0) + Math.max(0, base[statKey] || 0);

        const sorte = (base.sorte || 0) + (equipment.sorte || 0);

        // Sorte converte em % extra no atributo especial DA CLASSE ATUAL
        // (0,01% por ponto = 0,5% a cada 50) — só pra tornar Sorte
        // vantajosa de ter (hoje só vem de Anel/Amuleto do Crânio, ver
        // FusionService.js). Soma DEPOIS do teto de raridade (igual ao
        // bônus do Quartzo Rosa, não entra no clampEquipment) — sem isso,
        // num personagem já com equipamento Lendário no teto, ter Sorte
        // não faria diferença nenhuma no combate, só na Fusão.
        const sorteSpecialStat = SPECIAL_STAT_BY_CLASS[this.player.class?.id];
        const sorteSpecialBonus = sorte * SORTE_SPECIAL_PERCENT_PER_POINT;
        const withSpecialBonus = (statKey) => withBaseBonus(statKey) + (statKey === sorteSpecialStat ? sorteSpecialBonus : 0);

        return {

            attack: (base.attack || 0) + (equipment.attack || 0),

            armor: (base.armor || 0) + (equipment.armor || 0),

            agility: (base.agility || 0) + (equipment.agility || 0),

            // Sorte (ver FusionService.js) — só vem de equipamento/talento,
            // sem curva por nível/classe (todo mundo começa em 0, igual
            // Ataque/Armadura/Agilidade: sem teto de raridade, diferente
            // das stats de chance abaixo que usam withBaseBonus/cap).
            // Não entra no cálculo de Poder (ver PowerService.js), mesmo
            // tratamento de Crítico/Roubo de Vida/Penetração/Absorção.
            sorte,

            criticalChance: withSpecialBonus("criticalChance"),

            lifeSteal: withSpecialBonus("lifeSteal"),

            penetration: withSpecialBonus("penetration"),

            absorption: withSpecialBonus("absorption"),

            // Só o Pútrido tem fonte real disso (equipamento dele) — em
            // qualquer outra classe fica 0 pelo mesmo fallback das outras.
            miasmaChance: withSpecialBonus("miasmaChance"),

            // Só o Mímico tem fonte real disso (ver MimicService.js) —
            // mesma regra do Miasma, fica 0 pra qualquer outra classe.
            reflection: withSpecialBonus("reflection"),

            // Só a Louca tem fonte real disso (ver ConfusionService.js)
            // — mesma regra do Miasma/Reflection, fica 0 pra qualquer
            // outra classe.
            confusionChance: withSpecialBonus("confusionChance"),

            // Só o Eletro tem fonte real disso (ver ParalysisService.js)
            // — mesma regra do Miasma/Reflection/Confusão, fica 0 pra
            // qualquer outra classe.
            paralysisChance: withSpecialBonus("paralysisChance"),

            // Só o Samurai tem fonte real disso (ver DoubleStrikeService.js)
            // — mesma regra do Miasma/Reflection/Confusão/Paralisia, fica
            // 0 pra qualquer outra classe.
            doubleStrikeChance: withSpecialBonus("doubleStrikeChance"),

            // Só a Singularidade tem fonte real disso (ver GravityService.js)
            // — mesma regra do Miasma/Reflection/Confusão/Paralisia/Golpe
            // Duplo, fica 0 pra qualquer outra classe.
            gravityChance: withSpecialBonus("gravityChance")

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

    get sorte() {
        return this.getFinalStats().sorte;
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

    get miasmaChance() {
        return this.getFinalStats().miasmaChance;
    }

    get reflection() {
        return this.getFinalStats().reflection;
    }

    get confusionChance() {
        return this.getFinalStats().confusionChance;
    }

    get paralysisChance() {
        return this.getFinalStats().paralysisChance;
    }

    get doubleStrikeChance() {
        return this.getFinalStats().doubleStrikeChance;
    }

    get gravityChance() {
        return this.getFinalStats().gravityChance;
    }

}