/* ==========================================================
   MÍMICO — IMITAÇÃO
   Em todo golpe (seu ou do oponente), soma Imitação% do Ataque/
   Armadura/Agilidade de quem ela enfrenta aos PRÓPRIOS atributos —
   vira status normal pra aquele confronto, afetando quanto ela bate,
   aguenta e esquiva. Recalculado a cada golpe a partir do oponente
   DAQUELA troca (importa no 2x2, onde ela alterna de alvo).

   Antes era dano verdadeiro por % da Vida Máxima do alvo, mas contra
   chefes isso passava de 600-1000 de dano por golpe. Copiar os
   status de combate fica naturalmente mais contido.

   (Campo interno continua "reflection" — só o nome exibido virou
   "Imitação", já que "Reflexo" remetia a esquiva.)
========================================================== */

export default class MimicService {

    // opponentValue: Ataque/Armadura/Agilidade "cru" de quem ela está
    // enfrentando nesse golpe. reflectionRatio: atributo "Imitação" do
    // Mímico (0-100, não é fração).
    static getCopiedBonus(opponentValue, reflectionRatio) {

        if (!(reflectionRatio > 0) || !(opponentValue > 0)) return 0;

        return Math.max(0, Math.round(opponentValue * reflectionRatio / 100));

    }

    // Imitação% do Ataque/Armadura/Agilidade "crus" do oponente — só os
    // BÔNUS (nunca soma sozinho com o status "próprio" de quem chama,
    // de propósito: cada motor decide como combinar isso com os
    // multiplicadores que já tem, ex: o débuff de Miasma, que só reduz
    // o Ataque PRÓPRIO do Mímico, nunca a parte copiada). Sem Imitação
    // (reflectionRatio 0), os três bônus saem zerados.
    static applyCopy(opponent, reflectionRatio) {

        const opponentAttack = opponent.attack ?? opponent.dano ?? 0;
        const opponentArmor = opponent.armor ?? opponent.armadura ?? 0;
        const opponentAgility = opponent.agility ?? opponent.agilidade ?? 0;

        return {
            bonusAttack: this.getCopiedBonus(opponentAttack, reflectionRatio),
            bonusArmor: this.getCopiedBonus(opponentArmor, reflectionRatio),
            bonusAgility: this.getCopiedBonus(opponentAgility, reflectionRatio)
        };

    }

    // Segundo a mais na caixa de ataque quando ela traz a linha extra
    // da Imitação — não dava tempo de ler no tempo normal do golpe.
    static extraToastSeconds(entry) {
        return entry?.mimicBonus > 0 ? 1 : 0;
    }

    // bonusAttack: quanto do Ataque usado nesse golpe veio da cópia
    // (ver applyCopy). subject: quem fez a Imitação nessa frase —
    // "Você" (padrão) ou o NOME de quem fez (oponente no PVP, aliado
    // no 2x2/Cooperativo).
    static buildMessage(bonusAttack, { subject = "Você", opponentName = "o alvo" } = {}) {

        if (!(bonusAttack > 0)) return "";

        return `<span class="combat-mimic">Imitação!</span> ${subject} atacou com <strong>+${bonusAttack}</strong> de Ataque copiado de ${opponentName}.`;

    }

}
