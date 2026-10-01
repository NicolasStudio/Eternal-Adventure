/* ==========================================================
   MÍMICO — IMITAÇÃO
   Tudo que é específico da habilidade do Mímico fica aqui: o cálculo
   do bônus e a mensagem. (Os motores de combate só chamam estas
   funções — nenhum guarda a regra sozinho.)

   Regra: em todo golpe SEU que acerta (não dodgado), o Mímico soma
   dano VERDADEIRO extra = Imitação% do ATAQUE do alvo — sem precisar
   de sorte (ao contrário de Crítico/Absorção/Miasma, que são chance),
   e ignorando Armadura/Absorção por completo (senão uma % pequena
   quase não apareceria contra alvo bem defendido). Não é afetado por
   nada que reduza o PRÓPRIO Ataque do Mímico (ex: Miasma) — é
   calculado só a partir do Ataque do INIMIGO.

   (O campo interno continua se chamando "reflection" no código —
   só o nome exibido pro jogador virou "Imitação", porque "Reflexo"
   remetia a esquiva/reação rápida.)
========================================================== */

export default class MimicService {

    // enemyAttack: Ataque (ou "dano", no caso de monstro de dungeon) do
    // alvo nesse golpe. reflectionRatio: atributo "Imitação" do atacante
    // (0-100, não é fração).
    static getBonusDamage(enemyAttack, reflectionRatio) {

        if (!(reflectionRatio > 0) || !(enemyAttack > 0)) return 0;

        return Math.max(0, Math.round(enemyAttack * reflectionRatio / 100));

    }

    // Segundo a mais na caixa de ataque quando ela traz a linha extra
    // da Imitação — não dava tempo de ler no tempo normal do golpe.
    static extraToastSeconds(entry) {
        return entry?.mimicBonus > 0 ? 1 : 0;
    }

    // subject: quem fez a Imitação nessa frase — "Você" (padrão, quando
    // é o próprio jogador lendo) ou o NOME de quem fez (quando é outra
    // pessoa, ex: o oponente no PVP, ou um aliado no 2x2/Cooperativo).
    // attackName: nome do golpe do ALVO que foi copiado — só existe pra
    // monstro/chefe (nomeAtaque/attacks nomeados). Jogador não tem
    // golpe nomeado (PVP), então cai na frase genérica.
    static buildMessage(bonusDamage, { subject = "Você", attackName = null } = {}) {

        if (!(bonusDamage > 0)) return "";

        // O selo "Imitação!" já diz QUAL habilidade é — a frase não
        // precisa repetir o nome dela, só o que aconteceu.
        const source = attackName
            ? `usou <strong>${attackName}</strong>`
            : `copiou o Ataque do alvo`;

        return `<span class="combat-mimic">Imitação!</span> ${subject} ${source}, causando <strong>${bonusDamage}</strong> de dano verdadeiro.`;

    }

}
