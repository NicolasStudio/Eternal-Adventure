/* ==========================================================
   PÚTRIDO — MIASMA
   Tudo que é específico da habilidade do Pútrido fica aqui: o
   sorteio, o débuff em si e a mensagem. (Os motores de combate só
   chamam estas funções — nenhum guarda a regra sozinho.)

   Regra: em todo golpe SEU que acerta (não dodgado), o Pútrido tem
   MIASMA_CHANCE% de chance de intoxicar o alvo. Quando ativa, o
   alvo fica marcado — na PRÓXIMA vez que ele atacar, a Chance
   Crítica/Roubo de Vida/Penetração saem pela metade; na PRÓXIMA vez
   que ele apanhar, a Absorção sai pela metade. As duas marcas são
   independentes (uma pode ser consumida antes da outra, dependendo
   de quem age primeiro) — assim o efeito sempre se aplica de
   verdade, não importa a ordem de turno.
========================================================== */

const DEBUFF_MULTIPLIER = 0.5;

export default class MiasmaService {

    // roll: um número [0,1) já sorteado por quem chamou (Math.random()
    // no combate contra monstro, ou o rng() com semente no PVP/
    // Cooperativo — nunca gerado aqui, pra não desincronizar os
    // clientes numa simulação determinística).
    static procs(miasmaChance, roll) {
        return miasmaChance > 0 && roll * 100 < miasmaChance;
    }

    // Cria o "estado" de marcação de um combatente — cada lado do
    // combate guarda o seu.
    static createFlags() {
        return { attack: false, defend: false };
    }

    static applyDebuff(flags) {
        if (!flags) return;
        flags.attack = true;
        flags.defend = true;
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

    static buildProcMessage(targetName) {
        return `<span class="combat-miasma">Miasma!</span> ${targetName} foi intoxicado — os atributos especiais dele saem pela metade no próximo golpe.`;
    }

}
