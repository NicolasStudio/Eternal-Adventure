/* ==========================================================
   ATRIBUTOS DO PET POR NÍVEL
   Cada ganho é SOMADO ao nível 1 (pet.js) — só a habilidade especial
   vem do estágio. Ganhos só em níveis PARES, pontos por raridade
   (3★=1, 4★=2, 5★=3); valores aqui são PONTOS (vida = LIFE_PER_POINT
   HP/ponto, resto = 1/ponto). Pet que já passou do nível recebe tudo
   de uma vez, calculado a partir do nível atual.

   Depois do nível LIFE_BOOST_AFTER_LEVEL (18) cada ponto de Vida vale
   LIFE_BOOST_MULTIPLIER vezes mais — compensa a XP mais cara dessa
   faixa (ver HARD_XP_* em PetService.js).

   Perfil: wolf=Dano(baixo) · fairy=Vida+pouco Armadura/Ataque ·
   spider=Dano+Agilidade+pouca Vida · bear=Vida+Armadura · snake=Vida+Dano+Agilidade ·
   drake=tudo alto (6★ — ver Yggdrasil em pet.js)
========================================================== */

export const PET_MAX_LEVEL = 50;
export const LIFE_PER_POINT = 5;
export const LIFE_BOOST_AFTER_LEVEL = 18;
export const LIFE_BOOST_MULTIPLIER = 3;

export default {

    2: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
        drake: {life: 1, attack: 1, armor: 1, agility: 1},
    },

    4: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 1, attack: 1, armor: 1, agility: 0},
        drake: {life: 1, attack: 1, armor: 2, agility: 1},
    },

    6: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 0},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 0},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
        drake: {life: 2, attack: 1, armor: 2, agility: 1},
    },

    8: {
        wolf: {life: 1, attack: 0, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
        drake: {life: 2, attack: 1, armor: 1, agility: 1},
    },

    10: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 1, agility: 0},
        spider: {life: 1, attack: 2, armor: 0, agility: 2},
        spiderHalloween: {life: 1, attack: 2, armor: 0, agility: 2},
        bear: {life: 1, attack: 1, armor: 1, agility: 0},
        snake: {life: 1, attack: 0, armor: 1, agility: 1},
        drake: {life: 1, attack: 2, armor: 2, agility: 1},
    },

    12: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
        drake: {life: 3, attack: 3, armor: 2, agility: 3},
    },

    14: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 1, attack: 0, armor: 0, agility: 1},
        spiderHalloween: {life: 1, attack: 0, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
        drake: {life: 1, attack: 1, armor: 1, agility: 3},
    },

    16: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 0, attack: 1, armor: 1, agility: 1},
        drake: {life: 2, attack: 2, armor: 2, agility: 1},
    },

    18: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 1, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 1, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 2},
        drake: {life: 3, attack: 2, armor: 2, agility: 2},
    },

    20: {
        wolf: {life: 1, attack: 0, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 2, armor: 0, agility: 2},
        spiderHalloween: {life: 0, attack: 2, armor: 0, agility: 2},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
        drake: {life: 2, attack: 2, armor: 2, agility: 0},
    },

    22: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 1, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 1, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 2},
        drake: {life: 2, attack: 3, armor: 1, agility: 1},
    },

    24: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 1, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 1, agility: 0},
        drake: {life: 2, attack: 3, armor: 2, agility: 0},
    },

    26: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 0, attack: 1, armor: 0, agility: 1},
        spider: {life: 1, attack: 1, armor: 0, agility: 0},
        spiderHalloween: {life: 1, attack: 1, armor: 0, agility: 0},
        bear: {life: 1, attack: 1, armor: 2, agility: 1},
        snake: {life: 1, attack: 1, armor: 0, agility: 2},
        drake: {life: 2, attack: 1, armor: 2, agility: 1},
    },

    28: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 1, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 1, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 1, attack: 1, armor: 0, agility: 1},
        drake: {life: 2, attack: 3, armor: 1, agility: 1},
    },

    30: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 1, attack: 2, armor: 0, agility: 2},
        spiderHalloween: {life: 1, attack: 2, armor: 0, agility: 2},
        bear: {life: 1, attack: 1, armor: 1, agility: 0},
        snake: {life: 2, attack: 0, armor: 2, agility: 2},
        drake: {life: 2, attack: 2, armor: 1, agility: 2},
    },

    32: {
        wolf: {life: 1, attack: 0, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 2, attack: 1, armor: 0, agility: 1},
        drake: {life: 3, attack: 2, armor: 1, agility: 2},
    },

    34: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 1, attack: 0, armor: 0, agility: 1},
        spiderHalloween: {life: 1, attack: 0, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 2, attack: 1, armor: 1, agility: 2},
        drake: {life: 3, attack: 3, armor: 2, agility: 3},
    },

    36: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 1, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 1, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 0, attack: 1, armor: 1, agility: 1},
        drake: {life: 2, attack: 2, armor: 1, agility: 2},
    },

    38: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 1, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 1, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 2, attack: 3, armor: 1, agility: 2},
        drake: {life: 2, attack: 2, armor: 2, agility: 2},
    },

    40: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 2, armor: 0, agility: 2},
        spiderHalloween: {life: 0, attack: 2, armor: 0, agility: 2},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 2, attack: 3, armor: 0, agility: 1},
        drake: {life: 3, attack: 3, armor: 2, agility: 2},
    },

    42: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 2, attack: 3, armor: 1, agility: 2},
        drake: {life: 2, attack: 2, armor: 1, agility: 3},
    },

    44: {
        wolf: {life: 0, attack: 0, armor: 0, agility: 1},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 1, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 1, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 2, attack: 3, armor: 1, agility: 0},
        drake: {life: 2, attack: 2, armor: 2, agility: 2},
    },

    46: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 0},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 0},
        bear: {life: 1, attack: 0, armor: 1, agility: 0},
        snake: {life: 2, attack: 3, armor: 1, agility: 1},
        drake: {life: 3, attack: 3, armor: 1, agility: 2},
    },

    48: {
        wolf: {life: 1, attack: 0, armor: 0, agility: 0},
        fairy: {life: 0, attack: 0, armor: 0, agility: 0},
        spider: {life: 0, attack: 1, armor: 0, agility: 1},
        spiderHalloween: {life: 0, attack: 1, armor: 0, agility: 1},
        bear: {life: 1, attack: 0, armor: 2, agility: 0},
        snake: {life: 2, attack: 2, armor: 0, agility: 1},
        drake: {life: 2, attack: 2, armor: 2, agility: 2},
    },

    50: {
        wolf: {life: 0, attack: 1, armor: 0, agility: 0},
        fairy: {life: 0, attack: 1, armor: 1, agility: 1},
        spider: {life: 1, attack: 2, armor: 0, agility: 2},
        spiderHalloween: {life: 1, attack: 2, armor: 0, agility: 2},
        bear: {life: 1, attack: 2, armor: 1, agility: 1},
        snake: {life: 2, attack: 1, armor: 2, agility: 1},
        drake: {life: 4, attack: 3, armor: 2, agility: 3},
    },

};
