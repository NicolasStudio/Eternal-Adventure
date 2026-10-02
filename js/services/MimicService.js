/* ==========================================================
   MÍMICO — IMITAÇÃO
   Tudo que é específico da habilidade do Mímico fica aqui: o cálculo
   do bônus e a mensagem. (Os motores de combate só chamam estas
   funções — nenhum guarda a regra sozinho.)

   Regra: em TODO golpe (seu ou do oponente), o Mímico soma Imitação%
   do Ataque/Armadura/Agilidade de quem ela está enfrentando aos
   PRÓPRIOS Ataque/Armadura/Agilidade — vira parte normal dos status
   dela pra aquele confronto, não é mais dano à parte. Isso afeta os
   TRÊS lados: quanto ela bate (Ataque, passa pela mitigação normal),
   quanto ela aguenta (Armadura, sofre menos de quem ela copiou) e
   quanto ela esquiva/é difícil de acertar (Agilidade).

   Recalculado a cada golpe a partir do oponente DAQUELA troca (não
   trava no início da luta) — importa no 2x2, onde ela pode alternar
   entre os 2 inimigos do outro time.

   Era dano verdadeiro baseado em % da Vida Máxima do alvo — contra
   chefes (dezenas de milhares de vida) isso chegava a 600-1000+ de
   dano por golpe, bem desproporcional. Copiar os status de combate
   (não a vida) fica naturalmente mais contido, porque Ataque/Armadura
   já são números pequenos e equilibrados pela própria mitigação.

   (O campo interno continua se chamando "reflection" no código —
   só o nome exibido pro jogador virou "Imitação", porque "Reflexo"
   remetia a esquiva/reação rápida.)
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
