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
            vidaMaxima: 40,
            dano: 6,
            nomeAtaque: "Mordida",
            armadura: 2,
            agilidade: 8,
            xp: 30,
            ouro: 10
        },

        drops: [
            {
                type: ["weapon", "boot"],
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
            vidaMaxima: 65,
            dano: 8,
            nomeAtaque: "Investida",
            armadura: 4,
            agilidade: 4,
            xp: 40,
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
        level: 3,
        type: "beast",

        sprite: "assets/img/monsters/creature_1/three_wolf.png",

        status: {
            vidaMaxima: 110,
            dano: 16,
            nomeAtaque: "Mordida Tripla",
            armadura: 5,
            agilidade: 10,
            xp: 65,
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
    // NÍVEL 5 - Intermediário (Desafio moderado)
    // ============================================
    {
        id: "beetle",
        name: "Besouro",
        level: 5,
        type: "beast",

        sprite: "assets/img/monsters/creature_2/beetle.png",

        status: {
            vidaMaxima: 130,
            dano: 12,
            nomeAtaque: "Mordida",
            armadura: 10,
            agilidade: 5,
            xp: 60,
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
        level: 5,
        type: "beast",

        sprite: "assets/img/monsters/creature_2/spider.png",

        status: {
            vidaMaxima: 80,
            dano: 14,
            nomeAtaque: "Picada",
            armadura: 3,
            agilidade: 16,
            xp: 70,
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
            vidaMaxima: 200,
            dano: 22,
            nomeAtaque: "Picada",
            armadura: 9,
            agilidade: 10,
            xp: 95,
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
    // NÍVEL 10 - Desafio Médio
    // ============================================
    {
        id: "beaver",
        name: "Castor",
        level: 10,
        type: "beast",

        sprite: "assets/img/monsters/creature_3/beaver.png",

        status: {
            vidaMaxima: 220,
            dano: 26,
            nomeAtaque: "Dentada",
            armadura: 8,
            agilidade: 14,
            xp: 120,
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
        level: 10,
        type: "beast",

        sprite: "assets/img/monsters/creature_3/crocodile.png",

        status: {
            vidaMaxima: 300,
            dano: 30,
            nomeAtaque: "Investida",
            armadura: 15,
            agilidade: 6,
            xp: 135,
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
        level: 10,
        type: "beast",

        sprite: "assets/img/monsters/creature_3/bear.png",

        status: {
            vidaMaxima: 380,
            dano: 38,
            nomeAtaque: "Golpe de Garra",
            armadura: 17,
            agilidade: 9,
            xp: 170,
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
    // NÍVEL 13 - Boss Intermediário
    // ============================================
    {
        id: "werewolf",
        name: "Lobisomem",
        level: 13,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss/werewolf.png",

        status: {
            vidaMaxima: 550,
            dano: 50,
            nomeAtaque: "Dilacerar",
            armadura: 22,
            agilidade: 16,
            xp: 270,
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
    // NÍVEL 15 - Desafio Intermediário
    // ============================================
    {
        id: "goblin",
        name: "Goblin",
        level: 15,
        type: "beast",

        sprite: "assets/img/monsters/creature_4/goblin.png",

        status: {
            vidaMaxima: 320,
            dano: 36,
            nomeAtaque: "Cortar",
            armadura: 16,
            agilidade: 14,
            xp: 170,
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
        level: 15,
        type: "beast",

        sprite: "assets/img/monsters/creature_4/elf.png",

        status: {
            vidaMaxima: 280,
            dano: 38,
            nomeAtaque: "Multiplos Cortes",
            armadura: 14,
            agilidade: 20,
            xp: 180,
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
        level: 15,
        type: "beast",

        sprite: "assets/img/monsters/creature_4/troll.png",

        status: {
            vidaMaxima: 420,
            dano: 40,
            nomeAtaque: "Porretada",
            armadura: 20,
            agilidade: 8,
            xp: 190,
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
    // NÍVEL 18 - Desafio Avançado
    // ============================================
    {
        id: "goblin_2",
        name: "Goblin da Caverna",
        level: 18,
        type: "beast",

        sprite: "assets/img/monsters/creature_5/goblin_2.png",

        status: {
            vidaMaxima: 380,
            dano: 42,
            nomeAtaque: "Estocada",
            armadura: 17,
            agilidade: 15,
            xp: 195,
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
            vidaMaxima: 460,
            dano: 46,
            nomeAtaque: "Investida",
            armadura: 22,
            agilidade: 8,
            xp: 210,
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
            vidaMaxima: 500,
            dano: 44,
            nomeAtaque: "Arranhar",
            armadura: 24,
            agilidade: 6,
            xp: 220,
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
            vidaMaxima: 400,
            dano: 44,
            nomeAtaque: "Morder",
            armadura: 18,
            agilidade: 14,
            xp: 210,
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
            vidaMaxima: 480,
            dano: 46,
            nomeAtaque: "Morder",
            armadura: 20,
            agilidade: 10,
            xp: 230,
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
            vidaMaxima: 580,
            dano: 50,
            nomeAtaque: "Esmagar",
            armadura: 24,
            agilidade: 7,
            xp: 260,
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
            vidaMaxima: 750,
            dano: 60,
            nomeAtaque: "Dilacerar",
            armadura: 28,
            agilidade: 14,
            xp: 400,
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
