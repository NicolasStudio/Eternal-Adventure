/* ==========================================================
   SAMURAI — GOLPE DUPLO
   Em todo golpe SEU que acerta, DOUBLE_STRIKE_CHANCE% de acertar o
   MESMO golpe uma segunda vez, na mesma rodada — não é um multiplicador
   de dano (tipo o Crítico), é literalmente um segundo golpe, repetindo
   o MESMO valor de dano já calculado pro primeiro (sem rolar Crítico/
   Roubo de Vida/Absorção de novo, sem chance de errar) e entrando como
   uma entrada própria no log de combate.
   Diferente da Confusão/Paralisia, não existe estado pendente nenhum
   aqui — resolve tudo na hora, no mesmo golpe, sem afetar o PRÓXIMO
   ataque de ninguém.
========================================================== */

export default class DoubleStrikeService {

    // roll: um número [0,1) já sorteado por quem chamou (Math.random()
    // no combate contra monstro, ou o rng() com semente no PVP/
    // Cooperativo — nunca gerado aqui, mesma regra da Confusão/Miasma).
    static procs(doubleStrikeChance, roll) {
        return doubleStrikeChance > 0 && roll * 100 < doubleStrikeChance;
    }

    // Aviso de que o Golpe Duplo ativou nesse golpe — igual ao Crítico,
    // é só informativo (o dano em si já foi somado por quem chamou).
    static buildMessage(targetName) {
        return `<span class="combat-double-strike">Golpe Duplo!</span> Acertou ${targetName} mais uma vez, repetindo o mesmo dano.`;
    }

    static extraToastSeconds(entry) {
        return entry?.doubleStrikeProc ? 1 : 0;
    }

}
