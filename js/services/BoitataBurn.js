/* ==========================================================
   BOITATÁ — QUEIMADURA
   Ativa no PRIMEIRO golpe do dono que acerta; depois causa dano
   direto (ignora armadura) a cada turno DO DONO até o combate
   acabar. Efetividade por elemento do alvo: Água −70%, Planta/Inseto
   +70%, resto dano padrão.
========================================================== */

const EFFECTIVENESS = {
    water: 0.3,
    plant: 1.7,
    bug: 1.7
};

export default class BoitataBurn {

    static getMultiplier(element) {
        return EFFECTIVENESS[element] ?? 1;
    }

    // Dano de UM tick, já com a efetividade do elemento do alvo.
    static getTickDamage(burnDamage, element = null) {

        if (!(burnDamage > 0)) return 0;

        return Math.max(1, Math.round(burnDamage * this.getMultiplier(element)));

    }

    static getEffectivenessNote(element) {

        const multiplier = this.getMultiplier(element);

        if (multiplier > 1) return "Muito efetivo!";
        if (multiplier < 1) return "Pouco efetivo...";

        return "";

    }

    // Mensagem (HTML do toast) de um tick. `first` = tick que acabou de
    // ativar a queimadura naquele combate.
    static buildMessage({ petName, targetName = "o inimigo", damage, element = null, first = false }) {

        const headline = first
            ? `<span class="combat-pet-bite">${petName}</span> incendiou ${targetName}!`
            : `<span class="combat-pet-bite">${petName}</span> mantém ${targetName} em chamas!`;

        const note = this.getEffectivenessNote(element);

        return `${headline} Queimadura: <strong>${damage}</strong> de dano.${note ? `<br><em>${note}</em>` : ""}`;

    }

}
