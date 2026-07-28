import items from "./items.js";

const monsters = [

    // ============================================
    // NÍVEL 1 - Iniciantes (Fácil)
    // ============================================
    {
        id: "wolf",
        name: "Lobo Cinzento",
        level: 1,
        type: "beast",

        sprite: "assets/img/monsters/creature_1/wolf.png",

        status: {
            vidaMaxima: 18,
            dano: 12,
            nomeAtaque: "Mordida",
            armadura: 3,
            agilidade: 3,
            xp: 25,
            ouro: 10
        },

        drops: [
            {
                type: ["weapon", "helmet"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 1
            }
        ]
    },

    {
        id: "boar",
        name: "Javali",
        level: 1,
        type: "beast",

        sprite: "assets/img/monsters/creature_1/boar.png",

        status: {
            vidaMaxima: 18,
            dano: 12,
            nomeAtaque: "Investida",
            armadura: 3,
            agilidade: 3,
            xp: 25,
            ouro: 18
        },

        drops: [
            {
                type: ["helmet", "weapon"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    // ============================================
    // NÍVEL 3 - Médio Iniciante
    // ============================================
    {
        id: "threeWolf",
        name: "Fera Tricefálica",
        level: 1,
        type: "beast",

        sprite: "assets/img/monsters/creature_1/three_wolf.png",

        status: {
            vidaMaxima: 36,
            dano: 18,
            nomeAtaque: "Mordida Tripla",
            armadura: 3,
            agilidade: 3,
            xp: 50,
            ouro: 45
        },

        drops: [
            {
                type: ["helmet", "weapon"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 3
            }
        ]
    },

    // ============================================
    // NÍVEL 3 - Intermediário (Desafio moderado)
    // ============================================
    {
        id: "beetle",
        name: "Besouro",
        level: 3,
        type: "beast",

        sprite: "assets/img/monsters/creature_2/beetle.png",

        status: {
            vidaMaxima: 30,
            dano: 15,
            nomeAtaque: "Mordida",
            armadura: 3,
            agilidade: 4,
            xp: 25,
            ouro: 30
        },

        drops: [
            {
                type: ["leg", "boot"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 3
            }
        ]
    },

    {
        id: "spider",
        name: "Aranha",
        level: 3,
        type: "beast",

        sprite: "assets/img/monsters/creature_2/spider.png",

        status: {
            vidaMaxima: 27,
            dano: 17,
            nomeAtaque: "Picada",
            armadura: 3,
            agilidade: 4,
            xp: 25,
            ouro: 35
        },

        drops: [
            {
                type: ["leg", "boot"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "ant",
        name: "Rei Formiga",
        level: 5,
        type: "beast",

        sprite: "assets/img/monsters/creature_2/ant.png",

        status: {
            vidaMaxima: 54,
            dano: 30,
            nomeAtaque: "Picada",
            armadura: 4,
            agilidade: 5,
            xp: 125,
            ouro: 85
        },

        drops: [
            {
                type: ["leg", "boot"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 3
            }
        ]
    },
    
    // ============================================
    // NÍVEL 7 - Desafio Médio
    // ============================================
    {
        id: "beaver",
        name: "Castor",
        level: 7,
        type: "beast",

        sprite: "assets/img/monsters/creature_3/beaver.png",

        status: {
            vidaMaxima: 36,
            dano: 20,
            nomeAtaque: "Dentada",
            armadura: 5,
            agilidade: 6,
            xp: 63,
            ouro: 80
        },

        drops: [
            {
                type: ["chest"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "crocodile",
        name: "Crocodilo",
        level: 7,
        type: "beast",

        sprite: "assets/img/monsters/creature_3/crocodile.png",

        status: {
            vidaMaxima: 36,
            dano: 20,
            nomeAtaque: "Investida",
            armadura: 5,
            agilidade: 6,
            xp: 63,
            ouro: 100
        },

        drops: [
            {
                type: ["chest"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 3
            }
        ]
    },

    {
        id: "bear",
        name: "Urso Marrom",
        level: 7,
        type: "beast",

        sprite: "assets/img/monsters/creature_3/bear.png",

        status: {
            vidaMaxima: 80,
            dano: 30,
            nomeAtaque: "Golpe de Garra",
            armadura: 5,
            agilidade: 6,
            xp: 125,
            ouro: 150
        },

        drops: [
            {
                type: ["chest"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 4
            }
        ]
    },

    // ============================================
    // NÍVEL 10 - Boss Intermediário
    // ============================================
    {
        id: "werewolf",
        name: "Lobisomem",
        level: 10,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss/werewolf.png",

        status: {
            vidaMaxima: 120,
            dano: 40,
            nomeAtaque: "Dilacerar",
            armadura: 5,
            agilidade: 7,
            xp: 438,
            ouro: 240
        },

        drops: [
            {
                type: ["weapon"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 4
            }
        ]
    },

    // ============================================
    // NÍVEL 13 - Desafio Intermediário
    // ============================================
    {
        id: "goblin",
        name: "Goblin",
        level: 13,
        type: "beast",

        sprite: "assets/img/monsters/creature_4/goblin.png",

        status: {
            vidaMaxima: 54,
            dano: 28,
            nomeAtaque: "Cortar",
            armadura: 6,
            agilidade: 9,
            xp: 125,
            ouro: 150
        },

        drops: [
            {
                type: ["leg"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "elf",
        name: "Elfo das Cavernas",
        level: 13,
        type: "beast",

        sprite: "assets/img/monsters/creature_4/elf.png",

        status: {
            vidaMaxima: 54,
            dano: 28,
            nomeAtaque: "Multiplos Cortes",
            armadura: 6,
            agilidade: 9,
            xp: 125,
            ouro: 160
        },

        drops: [
            {
                type: ["leg"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "troll",
        name: "Troll",
        level: 13,
        type: "beast",

        sprite: "assets/img/monsters/creature_4/troll.png",

        status: {
            vidaMaxima: 108,
            dano: 39,
            nomeAtaque: "Porretada",
            armadura: 6,
            agilidade: 9,
            xp: 250,
            ouro: 180
        },

        drops: [
            {
                type: ["leg"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 4
            }
        ]
    },

    // ============================================
    // NÍVEL 15 - Desafio Avançado
    // ============================================
    {
        id: "goblin_2",
        name: "Goblin da Caverna",
        level: 15,
        type: "beast",

        sprite: "assets/img/monsters/creature_5/goblin_2.png",

        status: {
            vidaMaxima: 54,
            dano: 30,
            nomeAtaque: "Estocada",
            armadura: 7,
            agilidade: 9,
            xp: 125,
            ouro: 180
        },

        drops: [
            {
                type: ["chest"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 3
            }
        ]
    },

    {
        id: "ogre_2",
        name: "Ogro Bestial",
        level: 18,
        type: "beast",

        sprite: "assets/img/monsters/creature_5/ogre_2.png",

        status: {
            vidaMaxima: 63,
            dano: 34,
            nomeAtaque: "Investida",
            armadura: 8,
            agilidade: 11,
            xp: 125,
            ouro: 200
        },

        drops: [
            {
                type: ["chest"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 4
            }
        ]
    },

    {
        id: "ogre",
        name: "Ogro",
        level: 18,
        type: "beast",

        sprite: "assets/img/monsters/creature_5/ogre.png",

        status: {
            vidaMaxima: 135,
            dano: 48,
            nomeAtaque: "Arranhar",
            armadura: 8,
            agilidade: 11,
            xp: 250,
            ouro: 210
        },

        drops: [
            {
                type: ["chest"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 5
            }
        ]
    },

    // ============================================
    // NÍVEL 21 - Desafio Difícil
    // ============================================
    {
        id: "kid-zombie",
        name: "Kid Zombie",
        level: 21,
        type: "beast",

        sprite: "assets/img/monsters/creature_6/kid-zombie.png",

        status: {
            vidaMaxima: 72,
            dano: 38,
            nomeAtaque: "Morder",
            armadura: 9,
            agilidade: 12,
            xp: 250,
            ouro: 200
        },

        drops: [
            {
                type: ["helmet", "boot"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 3
            }
        ]
    },

    {
        id: "zombie",
        name: "Zombie",
        level: 21,
        type: "beast",

        sprite: "assets/img/monsters/creature_6/zombie.png",

        status: {
            vidaMaxima: 72,
            dano: 38,
            nomeAtaque: "Morder",
            armadura: 9,
            agilidade: 12,
            xp: 250,
            ouro: 220
        },

        drops: [
            {
                type: ["helmet", "boot"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 4
            }
        ]
    },

    {
        id: "big-zombie",
        name: "Big Zombie",
        level: 21,
        type: "beast",

        sprite: "assets/img/monsters/creature_6/big-zombie.png",

        status: {
            vidaMaxima: 150,
            dano: 53,
            nomeAtaque: "Esmagar",
            armadura: 9,
            agilidade: 12,
            xp: 500,
            ouro: 250
        },

        drops: [
            {
                type: ["helmet", "boot"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 5
            }
        ]
    },

    // ============================================
    // NÍVEL 25 - Boss Final (Desafio Épico)
    // ============================================
    {
        id: "skullKingIII",
        name: "Rei Caveira III",
        level: 25,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss_2/skullKingIII.png",

        status: {
            vidaMaxima: 300,
            dano: 68,
            nomeAtaque: "Dilacerar",
            armadura: 10,
            agilidade: 14,
            xp: 875,
            ouro: 380
        },

        drops: [
            {
                type: ["weapon"],
                rarity: "rare"
            },
            {
                item: items.mediumPotion,
                quantidade: 4
            }
        ]
    },

];

export default monsters;