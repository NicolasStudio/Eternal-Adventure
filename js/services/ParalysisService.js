/* ==========================================================
   ELETRO — PARALISIA
   Em todo golpe SEU que acerta, PARALYSIS_CHANCE% de paralisar o alvo —
   sem acúmulo, uma marca só (mesmo padrão da Confusão da Louca, ver
   ConfusionService.js). A marca fica pendente até o PRÓXIMO ataque de
   quem foi paralisado, que nem chega a acontecer: o turno inteiro é
   perdido, sem rolar esquiva, crítico ou qualquer outro sorteio desse
   golpe. Diferente da Confusão (que sorteia 1 de 3 resultados quando
   consumida), a Paralisia não sorteia nada ao consumir — paralisado
   SEMPRE perde o golpe, sem meio-termo.
========================================================== */

// No Cooperativo (4 jogadores x 1 chefe), a chance efetiva de travar o
// chefe soma rápido demais — com 4 atacantes tentando a cada rodada, a
// chance de PELO MENOS UM acertar a Paralisia antes do turno do chefe
// fica perto de 100% mesmo com paralysisChance moderado, travando o
// chefe quase a luta inteira (um problema que só existe em N atacantes
// contra 1 alvo — não acontece no PVP nem no Dungeon, que são 1 contra
// 1). Esse multiplicador só se aplica no RaidCombatService (ver
// chamada de ParalysisService.procs lá) — reduz a chance POR GOLPE sem
// zerar a utilidade da Paralisia no Cooperativo.
export const RAID_CHANCE_MULTIPLIER = 0.35;

export default class ParalysisService {

    // roll: um número [0,1) já sorteado por quem chamou (Math.random()
    // no combate contra monstro, ou o rng() com semente no PVP/
    // Cooperativo — nunca gerado aqui, mesma regra da Confusão/Miasma).
    static procs(paralysisChance, roll) {
        return paralysisChance > 0 && roll * 100 < paralysisChance;
    }

    // Cria o "estado" de Paralisia de um combatente — cada lado do
    // combate guarda o seu, igual a Confusão/Miasma.
    static createFlags() {
        return { pending: false };
    }

    static applyPending(flags) {
        if (!flags) return;
        flags.pending = true;
    }

    // Consome a marca pendente (se existir) — SEM sortear nada (ver
    // comentário no topo do arquivo). Devolve true se o golpe ATUAL de
    // quem estava paralisado foi perdido, false se não havia marca
    // nenhuma (ataque segue normal).
    static consumePending(flags) {

        if (!flags?.pending) return false;

        flags.pending = false;

        return true;

    }

    // Aviso de que a Paralisia ACABOU DE ATIVAR nesse golpe (fica
    // pendente pro próximo ataque do alvo).
    static buildProcMessage(targetName) {
        return `<span class="combat-paralysis">Paralisia!</span> ${targetName} ficou paralisado — o próximo ataque será perdido.`;
    }

    // Aviso de que a marca pendente foi CONSUMIDA nesse golpe — o
    // ataque de quem estava paralisado se perdeu por completo.
    static buildOutcomeMessage(attackerName) {
        return `<span class="combat-paralysis">Paralisado!</span> ${attackerName} não conseguiu se mexer e perdeu o ataque.`;
    }

    // Segundos a mais na caixa de ataque quando ela traz texto de
    // Paralisia (ativou ou foi consumida) — mesma ideia da Confusão.
    static extraToastSeconds(entry) {
        return entry?.paralysisProc || entry?.paralyzed ? 1.5 : 0;
    }

}
