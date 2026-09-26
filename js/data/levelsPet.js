/* ==========================================================
   ATRIBUTOS DO PET POR NÍVEL

   Os atributos do pet NÃO são mais fixos por estágio: cada ganho
   abaixo é SOMADO aos atributos do nível 1 (o estágio inicial em
   pet.js). Só a habilidade especial continua vindo do estágio.

   - Ganhos só nos níveis PARES (2, 4, 6 ... 50).
   - Pontos por ganho, pela raridade: 3★ = 1 | 4★ = 2 | 5★ = 3.
   - Os valores abaixo estão em PONTOS. Vida vale LIFE_PER_POINT HP por
     ponto; ataque, armadura e agilidade valem 1 por ponto.
   - Nível máximo do pet: PET_MAX_LEVEL.
   - Um pet que já está num nível X recebe, na hora, tudo que a tabela
     dá até o X (o cálculo é sempre feito a partir do nível atual).

   Perfil de cada família:
     wolf   = Dano (baixo, é 3★)
     fairy  = Vida e um pouco de armadura/ataque
     spider = Dano e Agilidade
     bear   = Vida e Armadura
     snake  = Vida, Dano e Agilidade
========================================================== */

export const PET_MAX_LEVEL = 50;
export const LIFE_PER_POINT = 5;

export default {

    2: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    4: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 1, agility: 0},
    },

    6: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 1, attack: 1, armor: 0, agility: 0},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    8: {
        wolf: {life: 1, attack: 0, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    10: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 1, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 1, armor: 0, agility: 0},
        snake: {life: 1, attack: 0, armor: 1, agility: 1},
    },

    12: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    14: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 1, attack: 0, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    16: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 0, attack: 1, armor: 1, agility: 1},
    },

    18: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    20: {
        wolf: {life: 1, attack: 0, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    22: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    24: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 1, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 1, agility: 0},
    },

    26: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 1, attack: 1, armor: 0, agility: 0},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    28: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    30: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 1, armor: 0, agility: 0},
        snake: {life: 1, attack: 0, armor: 1, agility: 1},
    },

    32: {
        wolf: {life: 1, attack: 0, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    34: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 1, attack: 0, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    36: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 1, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 0, attack: 1, armor: 1, agility: 1},
    },

    38: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    40: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    42: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    44: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 1, agility: 0},
    },

    46: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 1, attack: 1, armor: 0, agility: 0},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    48: {
        wolf: {life: 1, attack: 0, armor: 0, agility: 0},
        fairy: {life: 1, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
    },

    50: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 1, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 1, armor: 0, agility: 0},
        snake: {life: 1, attack: 0, armor: 1, agility: 1},
    },

};
