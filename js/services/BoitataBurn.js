/* ==========================================================
   BOITATÁ — QUEIMADURA
   Tudo que é específico da habilidade do pet Boitatá fica aqui:
   a efetividade elemental e o cálculo/mensagem de cada tick.
   (O restante do jogo só chama estas funções.)

   Regra: a queimadura é ativada no PRIMEIRO golpe do dono que
   acerta, e depois causa dano uma vez a cada turno DO PRÓPRIO DONO
   (nunca no turno do monstro/chefe nem de outros jogadores) até o
   combate terminar. É dano direto — não passa pela armadura.

   Efetividade contra o elemento do alvo (chefes do Cooperativo):
     Água     -70% de dano
     Planta   +70% de dano
     Fogo, Luz, Escuridão e alvos sem elemento: dano padrão.
========================================================== */

const EFFECTIVENESS = {
    water: 0.3,
    plant: 1.7
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
