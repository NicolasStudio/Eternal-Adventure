/* ==========================================================
   LOUCA — CONFUSÃO
   Em todo golpe SEU que acerta, CONFUSION_CHANCE% de confundir o alvo —
   sem acúmulo, uma marca só (diferente do Miasma do Pútrido). A marca
   fica pendente até o PRÓXIMO ataque de quem foi confundido, que sai
   com um dos 3 resultados abaixo (33% cada), em vez do ataque normal:
   1. Ataca o alvo de sempre, mas com Ataque x OPPONENT_MULTIPLIER.
   2. Ataca A SI MESMO (vira o próprio alvo do golpe), com Ataque x
      SELF_MULTIPLIER — passa pela mitigação/esquiva/crítico normais,
      só que contra a própria Armadura/Agilidade de quem bateu.
   3. Erra o ataque por completo (shape igual a uma esquiva, dano 0).
   Continua passando pela esquiva/crítico/absorção normais nos dois
   primeiros casos — só o alvo e o multiplicador de Ataque mudam.
========================================================== */

export const OUTCOME_OPPONENT = "opponent";
export const OUTCOME_SELF = "self";
export const OUTCOME_MISS = "miss";

export const OPPONENT_MULTIPLIER = 1.2;
export const SELF_MULTIPLIER = 1.5;

export default class ConfusionService {

    // roll: um número [0,1) já sorteado por quem chamou (Math.random()
    // no combate contra monstro, ou o rng() com semente no PVP/
    // Cooperativo — nunca gerado aqui, mesma regra do Miasma).
    static procs(confusionChance, roll) {
        return confusionChance > 0 && roll * 100 < confusionChance;
    }

    // Cria o "estado" de Confusão de um combatente — cada lado do
    // combate guarda o seu, igual o Miasma.
    static createFlags() {
        return { pending: false };
    }

    static applyPending(flags) {
        if (!flags) return;
        flags.pending = true;
    }

    // Consome a marca pendente (se existir) e sorteia qual dos 3
    // resultados vale pro golpe ATUAL de quem estava confuso. Devolve
    // null se não havia confusão pendente — ataque segue normal.
    // outcomeRoll: mesmo cuidado do procs() acima, sorteado por quem
    // chamou (só consome quando flags.pending é true, pra não gastar
    // um rng() à toa num golpe sem confusão nenhuma).
    static consumePending(flags, outcomeRoll) {

        if (!flags?.pending) return null;

        flags.pending = false;

        if (outcomeRoll < 1 / 3) return OUTCOME_OPPONENT;
        if (outcomeRoll < 2 / 3) return OUTCOME_SELF;
        return OUTCOME_MISS;

    }

    static multiplierFor(outcome) {
        if (outcome === OUTCOME_SELF) return SELF_MULTIPLIER;
        if (outcome === OUTCOME_OPPONENT) return OPPONENT_MULTIPLIER;
        return 1;
    }

    // Aviso de que a Confusão ACABOU DE ATIVAR nesse golpe (fica
    // pendente pro próximo ataque do alvo).
    static buildProcMessage(targetName) {
        return `<span class="combat-confusion">Confusão!</span> ${targetName} ficou confuso — o próximo ataque pode sair errado.`;
    }

    // Aviso de que a marca pendente foi CONSUMIDA nesse golpe — o
    // resultado já decidido (self/opponent/miss).
    static buildOutcomeMessage(outcome, attackerName, targetName) {

        if (outcome === OUTCOME_SELF) {
            return `<span class="combat-confusion">Confuso!</span> ${attackerName} se atacou sem querer!`;
        }

        if (outcome === OUTCOME_MISS) {
            return `<span class="combat-confusion">Confuso!</span> ${attackerName} errou o ataque, perdido na própria confusão.`;
        }

        return `<span class="combat-confusion">Confuso!</span> ${attackerName} atacou sem controle, mas acertou ${targetName} mesmo assim.`;

    }

    // Segundos a mais na caixa de ataque quando ela traz texto de
    // Confusão (ativou ou foi consumida) — mensagem longa, não dava
    // tempo de ler no tempo normal do golpe.
    static extraToastSeconds(entry) {
        return entry?.confusionProc || entry?.confusionOutcome ? 1.5 : 0;
    }

}
