/* ==========================================================
   PÚTRIDO — MIASMA
   Tudo que é específico da habilidade do Pútrido fica aqui: o
   sorteio, o débuff em si e a mensagem. (Os motores de combate só
   chamam estas funções — nenhum guarda a regra sozinho.)

   Regra: em todo golpe SEU que acerta (não dodgado), o Pútrido tem
   MIASMA_CHANCE% de chance de intoxicar o alvo. Cada ativação faz
   duas coisas:

   1. Marca (um golpe só): na PRÓXIMA vez que o alvo atacar, a Chance
      Crítica/Roubo de Vida/Penetração dele saem pela metade; na
      PRÓXIMA vez que ele apanhar, a Absorção sai pela metade. As duas
      marcas são independentes (uma pode ser consumida antes da outra,
      dependendo de quem age primeiro). Só pesa contra quem TEM esses
      atributos — na prática, jogadores (PVP).

   2. Acúmulo de Intoxicação (até o fim da luta): cada ativação soma 1
      acúmulo, até STACK_MAX; cada acúmulo tira STACK_PERCENT% do
      Ataque e da Agilidade do alvo. É o que dá efeito contra monstro
      e chefe (que não têm atributos especiais pra cortar).
      Valores escolhidos por simulação (2% x3): mais que isso deixava
      o Pútrido dominante no PVP, já que as lutas são longas e o alvo
      chega no máximo de acúmulos logo no começo.
========================================================== */

const DEBUFF_MULTIPLIER = 0.5;

export const STACK_PERCENT = 2;
export const STACK_MAX = 3;

export default class MiasmaService {

    // roll: um número [0,1) já sorteado por quem chamou (Math.random()
    // no combate contra monstro, ou o rng() com semente no PVP/
    // Cooperativo — nunca gerado aqui, pra não desincronizar os
    // clientes numa simulação determinística).
    static procs(miasmaChance, roll) {
        return miasmaChance > 0 && roll * 100 < miasmaChance;
    }

    // Cria o "estado" de Miasma de um combatente — cada lado do
    // combate guarda o seu.
    static createFlags() {
        return { attack: false, defend: false, stacks: 0 };
    }

    // Aplica a marca e soma um acúmulo (travado em STACK_MAX). Devolve
    // quantos acúmulos o alvo ficou — é o que a mensagem mostra.
    static applyDebuff(flags) {
        if (!flags) return 0;
        flags.attack = true;
        flags.defend = true;
        flags.stacks = Math.min(STACK_MAX, (flags.stacks ?? 0) + 1);
        return flags.stacks;
    }

    // Multiplicador de Ataque e Agilidade do combatente pelos acúmulos
    // (1 = sem Intoxicação). Não consome nada — vale a luta inteira.
    static statMultiplier(flags) {
        return 1 - (STACK_PERCENT * (flags?.stacks ?? 0)) / 100;
    }

    // Consome a marca de ataque (se existir) e devolve o multiplicador
    // a aplicar em Crítico/Roubo de Vida/Penetração DESSE golpe.
    static consumeAttackMultiplier(flags) {
        if (!flags?.attack) return 1;
        flags.attack = false;
        return DEBUFF_MULTIPLIER;
    }

    // Consome a marca de defesa (se existir) e devolve o multiplicador
    // a aplicar na Absorção ao apanhar ESSE golpe.
    static consumeDefendMultiplier(flags) {
        if (!flags?.defend) return 1;
        flags.defend = false;
        return DEBUFF_MULTIPLIER;
    }

    // Se a marca consumida cortou alguma coisa de verdade — monstro e
    // chefe não têm esses atributos, então avisar "pela metade" seria
    // prometer um efeito que não existe.
    static hasAttackSpecials(combatant) {
        return (combatant?.criticalChance ?? 0) > 0
            || (combatant?.lifeSteal ?? 0) > 0
            || (combatant?.penetration ?? 0) > 0;
    }

    static hasDefendSpecials(combatant) {
        return (combatant?.absorption ?? 0) > 0;
    }

    static hasAnySpecials(combatant) {
        return this.hasAttackSpecials(combatant) || this.hasDefendSpecials(combatant);
    }

    // Aviso de que uma marca foi CONSUMIDA nesse golpe — sempre dizendo
    // de QUEM é o atributo cortado (o intoxicado), nunca "seu"/"desse
    // golpe" genérico: quem lê é tanto o Pútrido quanto a vítima.
    // attackWeakened: o ATACANTE estava intoxicado (Crítico/Roubo de
    // Vida/Penetração dele pela metade). defendWeakened: o ALVO estava
    // intoxicado (Absorção dele pela metade). Nomes já no formato da
    // frase ("você" minúsculo pro próprio jogador).
    static buildWeakenedMessage({ miasmaAttackWeakened, miasmaDefendWeakened }, attackerName, targetName) {
        let message = "";
        if (miasmaAttackWeakened) {
            message += `<em>(Miasma: ${attackerName} está intoxicado — Crítico, Roubo de Vida e Penetração pela metade neste golpe.)</em><br>`;
        }
        if (miasmaDefendWeakened) {
            message += `<em>(Miasma: ${targetName} está intoxicado — Absorção pela metade neste golpe.)</em><br>`;
        }
        return message;
    }

    // Segundos a mais na caixa de ataque quando ela traz texto de
    // Miasma (ativou ou foi consumido) — é mensagem longa, não dava
    // tempo de ler no tempo normal do golpe.
    static extraToastSeconds(entry) {
        return entry?.miasmaProc || entry?.miasmaAttackWeakened || entry?.miasmaDefendWeakened ? 1.5 : 0;
    }

    // entry: resultado/log do golpe que ativou o Miasma (usa
    // miasmaStacks e miasmaTargetHasSpecials, gravados pelos motores).
    static buildProcMessage(targetName, entry = {}) {
        const stacks = entry.miasmaStacks ?? 1;
        const specials = entry.miasmaTargetHasSpecials
            ? " Atributos especiais pela metade no próximo golpe."
            : "";
        return `<span class="combat-miasma">Miasma!</span> ${targetName} foi intoxicado (${stacks}/${STACK_MAX}) — −${STACK_PERCENT * stacks}% de Ataque e Agilidade até o fim da luta.${specials}`;
    }

}
