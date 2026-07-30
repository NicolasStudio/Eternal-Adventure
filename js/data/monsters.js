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
                quantidade: 1
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
                quantidade: 2
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
            vidaMaxima: 36,
            dano: 16,
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
                quantidade: 1
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
            dano: 22,
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
                quantidade: 1
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
            dano: 35,
            nomeAtaque: "Picada",
            armadura: 5,
            agilidade: 5,
            xp: 155,
            ouro: 85
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
            vidaMaxima: 51,
            dano: 25,
            nomeAtaque: "Dentada",
            armadura: 8,
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
                quantidade: 1
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
            vidaMaxima: 60,
            dano: 27,
            nomeAtaque: "Investida",
            armadura: 8,
            agilidade: 6,
            xp: 70,
            ouro: 100
        },

        drops: [
            {
                type: ["chest"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 1
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
            dano: 34,
            nomeAtaque: "Golpe de Garra",
            armadura: 7,
            agilidade: 6,
            xp: 130,
            ouro: 150
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
            vidaMaxima: 150,
            dano: 50,
            nomeAtaque: "Dilacerar",
            armadura: 8,
            agilidade: 9,
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
                quantidade: 2
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
            vidaMaxima: 60,
            dano: 35,
            nomeAtaque: "Cortar",
            armadura: 10,
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
                quantidade: 1
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
            vidaMaxima: 64,
            dano: 40,
            nomeAtaque: "Multiplos Cortes",
            armadura: 10,
            agilidade: 12,
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
                quantidade: 1
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
            vidaMaxima: 130,
            dano: 45,
            nomeAtaque: "Porretada",
            armadura: 12,
            agilidade: 9,
            xp: 280,
            ouro: 180
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
            vidaMaxima: 65,
            dano: 45,
            nomeAtaque: "Estocada",
            armadura: 13,
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
                quantidade: 1
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
            vidaMaxima: 100,
            dano: 45,
            nomeAtaque: "Investida",
            armadura: 15,
            agilidade: 8,
            xp: 185,
            ouro: 220
        },

        drops: [
            {
                type: ["chest"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 2
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
            vidaMaxima: 150,
            dano: 55,
            nomeAtaque: "Arranhar",
            armadura: 15,
            agilidade: 15,
            xp: 280,
            ouro: 230
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
            vidaMaxima: 90,
            dano: 60,
            nomeAtaque: "Morder",
            armadura: 18,
            agilidade: 15,
            xp: 280,
            ouro: 220
        },

        drops: [
            {
                type: ["helmet", "boot"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 1
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
            vidaMaxima: 115,
            dano: 60,
            nomeAtaque: "Morder",
            armadura: 9,
            agilidade: 12,
            xp: 290,
            ouro: 230
        },

        drops: [
            {
                type: ["helmet", "boot"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 2
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
            dano: 55,
            nomeAtaque: "Esmagar",
            armadura: 20,
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
                quantidade: 3
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
            dano: 73,
            nomeAtaque: "Dilacerar",
            armadura: 28,
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
                quantidade: 2
            }
        ]
    },

];

export default monsters;