/* ==========================================================
   PÚTRIDO — MIASMA
   Tudo que é específico da habilidade do Pútrido fica aqui: o
   sorteio, o débuff em si e a mensagem. (Os motores de combate só
   chamam estas funções — nenhum guarda a regra sozinho.)

   Regra: em todo golpe SEU que acerta (não dodgado), o Pútrido tem
   MIASMA_CHANCE% de chance de intoxicar o alvo. Cada ativação faz
   três coisas:

   1. Acúmulo de Intoxicação (até o fim da luta): soma 1 acúmulo, até
      STACK_MAX (4); o total tira STACK_PERCENTS[acúmulos]% do Ataque,
      da Agilidade E da Armadura do alvo — em PVP e em PVE, as duas
      tabelas têm valor próprio (ver STACK_PERCENTS/PVE_STACK_PERCENTS).

   2. Especiais enfraquecidos (até o fim da luta): com 1+ acúmulo, a
      Chance Crítica/Roubo de Vida/Penetração/Absorção do alvo valem
      PERSISTENT_SPECIAL_MULTIPLIER (50%). Não aumenta com mais
      acúmulos. É o que faz do Pútrido o contrapeso da Absorção do
      Guerreiro — só pesa no PVP, já que monstro/chefe não têm esses
      atributos (ver hasAnySpecials).

   3. Marca (um golpe só): na PRÓXIMA vez que o alvo atacar, Crítico/
      Roubo de Vida/Penetração saem ainda pela metade; na PRÓXIMA vez
      que ele apanhar, a Absorção sai pela metade. As duas marcas são
      independentes (uma pode ser consumida antes da outra, dependendo
      de quem age primeiro).
========================================================== */

const DEBUFF_MULTIPLIER = 0.5;

// % de Ataque, Agilidade e Armadura a menos por quantidade de acúmulos
// (índice) — vale pro PVP (1x1/2x2).
export const STACK_PERCENTS = [0, 3, 6, 9, 15];

// Mesma coisa, mas pro PVE (Dungeons e Cooperativo) — valores maiores,
// já que lá a Camada 2/3 (especiais) nunca pesa (ninguém tem Crítico/
// Roubo de Vida/Penetração/Absorção fora de jogador), então essa é a
// única camada que o Pútrido tem contra monstro/chefe.
export const PVE_STACK_PERCENTS = [0, 5, 10, 15, 20];

export const STACK_MAX = STACK_PERCENTS.length - 1;

// Quanto sobra dos atributos especiais de quem tem 1+ acúmulo.
export const PERSISTENT_SPECIAL_MULTIPLIER = 0.5;

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
    // percents: qual tabela usar — STACK_PERCENTS (padrão, PVP) ou
    // PVE_STACK_PERCENTS (passada explicitamente por quem chama em
    // Dungeons/Cooperativo).
    static statMultiplier(flags, percents = STACK_PERCENTS) {
        return 1 - (percents[flags?.stacks ?? 0] ?? 0) / 100;
    }

    // Multiplicador permanente dos atributos especiais (1 = sem
    // Intoxicação). Não consome nada — vale a luta inteira, e soma com
    // a marca de um golpe (consumeAttack/DefendMultiplier).
    static persistentSpecialMultiplier(flags) {
        return (flags?.stacks ?? 0) > 0 ? PERSISTENT_SPECIAL_MULTIPLIER : 1;
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
            message += `<em>(Miasma: ${attackerName} está intoxicado — Crítico, Roubo de Vida e Penetração cortados pela metade neste golpe.)</em><br>`;
        }
        if (miasmaDefendWeakened) {
            message += `<em>(Miasma: ${targetName} está intoxicado — Absorção cortada pela metade neste golpe.)</em><br>`;
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
    // percents: mesma tabela usada no statMultiplier do combate que
    // chamou isso — precisa bater, senão a mensagem mostra um número
    // diferente do que foi de fato aplicado.
    static buildProcMessage(targetName, entry = {}, percents = STACK_PERCENTS) {
        const stacks = entry.miasmaStacks ?? 1;
        const specialsLeft = Math.round((1 - PERSISTENT_SPECIAL_MULTIPLIER) * 100);
        const specials = entry.miasmaTargetHasSpecials
            ? ` Atributos especiais −${specialsLeft}% até o fim da luta, e pela metade no próximo golpe.`
            : "";
        return `<span class="combat-miasma">Miasma!</span> ${targetName} foi intoxicado (${stacks}/${STACK_MAX}) — −${percents[stacks]}% de Ataque, Agilidade e Armadura até o fim da luta.${specials}`;
    }

}
