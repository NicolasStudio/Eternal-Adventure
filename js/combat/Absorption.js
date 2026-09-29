/* ==========================================================
   ABSORÇÃO
   Regra única usada por todos os motores de combate (dungeon —
   CombatEngine.js —, PVP e Cooperativo): a Absorção é a CHANCE de, a
   cada golpe recebido, absorver parte do dano — quem absorve toma só
   o resto. Não é esquiva (o golpe acerta) nem cura depois (o dano já
   entra reduzido, então não tem como morrer "antes de curar").
========================================================== */

// Fração do golpe absorvida quando a Absorção ativa.
export const ABSORPTION_RATIO = 0.5;

// Nunca passa disso, mesmo somando muito equipamento.
export const ABSORPTION_CAP = 95;

// Quanto do golpe foi absorvido (0 se não ativou).
export function absorbedAmount(preAbsorption, activated) {
    return activated ? Math.floor(preAbsorption * ABSORPTION_RATIO) : 0;
}
