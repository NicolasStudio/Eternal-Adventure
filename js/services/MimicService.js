/* ==========================================================
   MÍMICO — IMITAÇÃO
   Tudo que é específico da habilidade do Mímico fica aqui: o cálculo
   do bônus e a mensagem. (Os motores de combate só chamam estas
   funções — nenhum guarda a regra sozinho.)

   Regra: em todo golpe SEU que acerta (não dodgado), o Mímico soma
   dano VERDADEIRO extra = (Imitação ÷ divisor)% da VIDA MÁXIMA do
   alvo — sem precisar de sorte (ao contrário de Crítico/Absorção/
   Miasma, que são chance), e ignorando Armadura/Absorção por completo.

   O divisor depende de QUEM é o alvo (mesma ideia da Absorção):
     contra a máquina (monstro, chefe do Cooperativo): ÷ HP_DIVISOR_PVE
       — 35% de Imitação = 3,5% da Vida Máxima do alvo por golpe;
     contra jogador (PVP): ÷ HP_DIVISOR_PVP — 35% = ~1,17%.
   Dano verdadeiro vale ~4x um golpe normal no fim do jogo (todo mundo
   tem 230–330 de Armadura), então o valor que dava chance contra os
   Anjos fazia o Mímico vencer ~95% no PVP. Sem Imitação nenhuma, ele
   vence <1% — a força da classe está toda aqui. Valores por simulação.

   Era % do ATAQUE do alvo (vencia 100% no PVP). Não é afetado por nada
   que reduza o PRÓPRIO Ataque do Mímico (ex: Miasma) — é calculado só
   a partir da vida do ALVO.

   (O campo interno continua se chamando "reflection" no código —
   só o nome exibido pro jogador virou "Imitação", porque "Reflexo"
   remetia a esquiva/reação rápida.)
========================================================== */

// Imitação% ÷ isso = % da Vida Máxima do alvo. PVE ÷15 já deixava o
// Mímico sem chance contra os Anjos; PVP ÷30 deixa ele em ~43–58% de
// vitórias (÷20 ainda ficava em ~68–81%).
export const HP_DIVISOR_PVE = 10;
export const HP_DIVISOR_PVP = 30;

export default class MimicService {

    // targetMaxHP: Vida Máxima do alvo (vidaMaxima, no caso de monstro de
    // dungeon). reflectionRatio: atributo "Imitação" do atacante (0-100,
    // não é fração). divisor: HP_DIVISOR_PVE ou HP_DIVISOR_PVP, conforme
    // o alvo seja a máquina ou outro jogador.
    static getBonusDamage(targetMaxHP, reflectionRatio, divisor) {

        if (!(reflectionRatio > 0) || !(targetMaxHP > 0)) return 0;

        return Math.max(0, Math.round(targetMaxHP * reflectionRatio / divisor / 100));

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
            : `imitou a vitalidade do alvo`;

        return `<span class="combat-mimic">Imitação!</span> ${subject} ${source}, causando <strong>${bonusDamage}</strong> de dano verdadeiro.`;

    }

}
