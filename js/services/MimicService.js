/* ==========================================================
   MÍMICO — IMITAÇÃO
   Tudo que é específico da habilidade do Mímico fica aqui: o cálculo
   do bônus e a mensagem. (Os motores de combate só chamam estas
   funções — nenhum guarda a regra sozinho.)

   Regra: em todo golpe SEU, a Imitação soma Imitação% do ATAQUE do
   alvo ao SEU PRÓPRIO Ataque, ANTES da mitigação — sem precisar de
   sorte (ao contrário de Crítico/Absorção/Miasma, que são chance).
   Esse bônus vira parte do golpe normal: passa por Crítico, Armadura
   e Absorção igual qualquer outro dano (não é mais dano à parte, nem
   ignora Armadura). Usa o Ataque "cru" do alvo (não afetado por nada
   que reduza o PRÓPRIO Ataque do Mímico, ex: Miasma).

   (O campo interno continua se chamando "reflection" no código —
   só o nome exibido pro jogador virou "Imitação", porque "Reflexo"
   remetia a esquiva/reação rápida.)
========================================================== */

export default class MimicService {

    // enemyAttack: Ataque (ou "dano", no caso de monstro de dungeon) do
    // alvo nesse golpe. reflectionRatio: atributo "Imitação" do atacante
    // (0-100, não é fração). Retorna quanto ENTRA no Ataque do Mímico
    // antes da mitigação — não é mais o dano final, por isso o motor
    // de combate recalcula depois quanto disso sobrou no golpe (pra
    // mensagem) proporcionalmente.
    static getBonusAttack(enemyAttack, reflectionRatio) {

        if (!(reflectionRatio > 0) || !(enemyAttack > 0)) return 0;

        return Math.max(0, Math.round(enemyAttack * reflectionRatio / 100));

    }

    // Segundo a mais na caixa de ataque quando ela traz a linha extra
    // da Imitação — não dava tempo de ler no tempo normal do golpe.
    static extraToastSeconds(entry) {
        return entry?.mimicBonus > 0 ? 1 : 0;
    }

    // bonusDamage: fatia do dano FINAL (já mitigado/absorvido) que veio
    // da Imitação — não é mais um valor à parte, é proporcional ao que
    // o bônus representou dentro do Ataque total daquele golpe.
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

        return `<span class="combat-mimic">Imitação!</span> ${subject} ${source}, roubando <strong>${bonusDamage}</strong> de dano do Ataque do alvo.`;

    }

}
