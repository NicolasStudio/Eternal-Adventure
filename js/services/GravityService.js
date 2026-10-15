/* ==========================================================
   SINGULARIDADE — PRESSÃO GRAVITACIONAL / GRAVIDADE MÁXIMA
   Em todo golpe SEU que acerta, GRAVITY_CHANCE% de somar 1 acúmulo de
   Pressão Gravitacional no alvo. Ao chegar em STACK_THRESHOLD acúmulos,
   eles são consumidos (volta pra 0) e o alvo recebe Gravidade Máxima,
   com DOIS efeitos pendentes independentes:
   1. Perde a PRÓXIMA ação de ataque por completo — igual a Paralisia do
      Eletro, sem sortear nada, o turno inteiro se perde.
   2. O PRÓXIMO ataque que ele RECEBER (de qualquer atacante) considera
      só metade da Armadura dele nesse golpe — depois disso a Armadura
      volta ao normal.
   Os dois podem resolver em qualquer ordem (depende de quem age
   primeiro) e são consumidos de forma independente um do outro.
========================================================== */

export const STACK_THRESHOLD = 3;
export const ARMOR_HALF_MULTIPLIER = 0.5;

export default class GravityService {

    // roll: um número [0,1) já sorteado por quem chamou (Math.random()
    // no combate contra monstro, ou o rng() com semente no PVP/
    // Cooperativo — nunca gerado aqui, mesma regra do resto).
    static procs(gravityChance, roll) {
        return gravityChance > 0 && roll * 100 < gravityChance;
    }

    // Cria o "estado" de Gravidade de um combatente — cada lado do
    // combate guarda o seu.
    static createFlags() {
        return { stacks: 0, stunned: false, armorHalved: false };
    }

    // Soma 1 acúmulo (chamado só quando procs() deu true). Ao chegar em
    // STACK_THRESHOLD, reseta pra 0 e liga os dois pendentes da Gravidade
    // Máxima de uma vez. Devolve { stacks, triggered } — stacks é o valor
    // ANTES do reset (1..STACK_THRESHOLD, pra mensagem saber "chegou em
    // 3/3"), triggered diz se essa foi a marca que disparou tudo.
    static applyStack(flags) {

        if (!flags) return { stacks: 0, triggered: false };

        const stacks = Math.min(STACK_THRESHOLD, (flags.stacks ?? 0) + 1);
        const triggered = stacks >= STACK_THRESHOLD;

        if (triggered) {
            flags.stacks = 0;
            flags.stunned = true;
            flags.armorHalved = true;
        } else {
            flags.stacks = stacks;
        }

        return { stacks, triggered };

    }

    // Consome o pendente de "perder a próxima ação" — igual
    // ParalysisService.consumePending, não sorteia nada.
    static consumePendingStun(flags) {
        if (!flags?.stunned) return false;
        flags.stunned = false;
        return true;
    }

    // Consome o pendente de "Armadura pela metade nesse golpe" — devolve
    // o multiplicador a aplicar na Armadura do DEFENSOR desse golpe (1
    // se não havia nada pendente).
    static consumeArmorHalf(flags) {
        if (!flags?.armorHalved) return 1;
        flags.armorHalved = false;
        return ARMOR_HALF_MULTIPLIER;
    }

    static buildStunMessage(name) {
        return `<span class="combat-gravity">Gravidade Máxima!</span> ${name} ficou pesado demais e perdeu a ação de ataque!`;
    }

    static buildArmorHalfMessage(targetName) {
        return `<span class="combat-gravity">Gravidade Máxima!</span> A Armadura de ${targetName} contou só pela metade nesse golpe.`;
    }

    // entry: resultado/log do golpe que somou o acúmulo (usa
    // gravityStacks/gravityTriggered, gravados pelos motores).
    static buildProcMessage(targetName, entry = {}) {

        const stacks = entry.gravityStacks ?? 1;

        if (entry.gravityTriggered) {
            return `<span class="combat-gravity">Pressão Gravitacional!</span> ${targetName} atingiu o limite (${STACK_THRESHOLD}/${STACK_THRESHOLD}) e recebeu Gravidade Máxima — vai perder a próxima ação de ataque, e o próximo golpe nele conta só metade da Armadura.`;
        }

        return `<span class="combat-gravity">Pressão Gravitacional!</span> ${targetName} acumulou (${stacks}/${STACK_THRESHOLD}).`;

    }

    static extraToastSeconds(entry) {
        return entry?.gravityProc || entry?.gravityStunned || entry?.gravityArmorHalved ? 1.5 : 0;
    }

}
