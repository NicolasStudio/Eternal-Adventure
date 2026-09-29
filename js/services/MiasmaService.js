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

    static buildProcMessage(targetName) {
        return `<span class="combat-pet-bite">Miasma!</span> ${targetName} foi intoxicado — os atributos especiais dele saem pela metade no próximo golpe.`;
    }

}
