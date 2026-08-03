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
                type: ["helmet", "weapon"],
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
            vidaMaxima: 30,
            dano: 13,
            nomeAtaque: "Mordida",
            armadura: 5,
            agilidade: 4,
            xp: 25,
            ouro: 30
        },

        drops: [
            {
                type: ["leg"],
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
            armadura: 2,
            agilidade: 4,
            xp: 25,
            ouro: 35
        },

        drops: [
            {
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
            vidaMaxima: 50,
            dano: 32,
            nomeAtaque: "Picada",
            armadura: 4,
            agilidade: 5,
            xp: 155,
            ouro: 85
        },

        drops: [
            {
                type: ["boot"],
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
            vidaMaxima: 52,
            dano: 27,
            nomeAtaque: "Dentada",
            armadura: 8,
            agilidade: 6,
            xp: 63,
            ouro: 80
        },

        drops: [
            {

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
                quantidade: 2
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
            vidaMaxima: 70,
            dano: 37,
            nomeAtaque: "Golpe de Garra",
            armadura: 7,
            agilidade: 6,
            xp: 130,
            ouro: 150
        },

        drops: [
            {
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
            dano: 40,
            nomeAtaque: "Dilacerar",
            armadura: 8,
            agilidade: 12,
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
            dano: 45,
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
            dano: 45,
            nomeAtaque: "Multiplos Cortes",
            armadura: 10,
            agilidade: 12,
            xp: 125,
            ouro: 160
        },

        drops: [
            {
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
            dano: 42,
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
            vidaMaxima: 100,
            dano: 45,
            nomeAtaque: "Estocada",
            armadura: 13,
            agilidade: 9,
            xp: 125,
            ouro: 180
        },

        drops: [
            {
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
            dano: 52,
            nomeAtaque: "Investida",
            armadura: 16,
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
            dano: 38,
            nomeAtaque: "Arranhar",
            armadura: 16,
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
    // NÍVEL 18 - Desafio Difícil
    // ============================================
    {
        id: "kid-zombie",
        name: "Kid Zombie",
        level: 21,
        type: "beast",

        sprite: "assets/img/monsters/creature_6/kid-zombie.png",

        status: {
            vidaMaxima: 110,
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
            vidaMaxima: 130,
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
            vidaMaxima: 162,
            dano: 47,
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
    // NÍVEL 20 - Boss (Desafio Épico)
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

    // ============================================
    // NÍVEL 23 - Desafio Intermediário
    // ============================================
    {
        id: "duende_1",
        name: "Duende Sorrateiro",
        level: 23,
        type: "beast",

        sprite: "assets/img/monsters/creature_7/duende_1.png",

        status: {
            vidaMaxima: 130,
            dano: 78,
            nomeAtaque: "Arranhar",
            armadura: 30,
            agilidade: 40,
            xp: 525,
            ouro: 350
        },

        drops: [
            {
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "duende_2",
        name: "Duende Traiçoeiro",
        level: 23,
        type: "beast",

        sprite: "assets/img/monsters/creature_7/duende_2.png",

        status: {
            vidaMaxima: 130,
            dano: 80,
            nomeAtaque: "Esfaquear",
            armadura: 30,
            agilidade: 40,
            xp: 525,
            ouro: 350
        },

        drops: [
            {
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "duende_3",
        name: "Duende Noel",
        level: 23,
        type: "beast",

        sprite: "assets/img/monsters/creature_7/duende_3.png",

        status: {
            vidaMaxima: 130,
            dano: 82,
            nomeAtaque: "Presente de Grego",
            armadura: 30,
            agilidade: 40,
            xp: 525,
            ouro: 350
        },

        drops: [
            {
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "duende_4",
        name: "Duende Emo",
        level: 23,
        type: "beast",

        sprite: "assets/img/monsters/creature_7/duende_4.png",

        status: {
            vidaMaxima: 130,
            dano: 84,
            nomeAtaque: "Farmar Aura",
            armadura: 30,
            agilidade: 40,
            xp: 525,
            ouro: 350
        },

        drops: [
            {
                type: ["boot"],
                rarity: "rare"
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    // ============================================
    // NÍVEL 25 - Desafio Intermediário
    // ============================================
    {
        id: "scarab",
        name: "Escaravelho",
        level: 25,
        type: "beast",

        sprite: "assets/img/monsters/creature_8/scarab.png",

        status: {
            vidaMaxima: 200,
            dano: 90,
            nomeAtaque: "Ferroar",
            armadura: 40,
            agilidade: 40,
            xp: 725,
            ouro: 500
        },

        drops: [
            {

            },
            {
                item: items.mediumPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "scorpion",
        name: "Escorpião",
        level: 25,
        type: "beast",

        sprite: "assets/img/monsters/creature_8/scorpion.png",

        status: {
            vidaMaxima: 180,
            dano: 95,
            nomeAtaque: "Ferroar",
            armadura: 35,
            agilidade: 45,
            xp: 755,
            ouro: 520
        },

        drops: [
            {
                type: ["leg"],
                rarity: "rare"
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "basilisk",
        name: "Basilisco",
        level: 25,
        type: "beast",

        sprite: "assets/img/monsters/creature_8/basilisk.png",

        status: {
            vidaMaxima: 220,
            dano: 98,
            nomeAtaque: "Picar",
            armadura: 35,
            agilidade: 50,
            xp: 855,
            ouro: 570
        },

        drops: [
            {
                type: ["leg"],
                rarity: "rare"
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            }
        ]
    },

    // ============================================
    // NÍVEL 27 - Desafio Intermediário
    // ============================================
    {
        id: "goblin_donatello",
        name: "Goblin Donatello",
        level: 27,
        type: "beast",

        sprite: "assets/img/monsters/creature_9/goblin_donatello.png",

        status: {
            vidaMaxima: 230,
            dano: 95,
            nomeAtaque: "Tacada de Bastão",
            armadura: 45,
            agilidade: 50,
            xp: 825,
            ouro: 700
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "goblin_leonardo",
        name: "Goblin Leonardo",
        level: 27,
        type: "beast",

        sprite: "assets/img/monsters/creature_9/goblin_leonardo.png",

        status: {
            vidaMaxima: 250,
            dano: 95,
            nomeAtaque: "Fatiar",
            armadura: 45,
            agilidade: 50,
            xp: 825,
            ouro: 700
        },

        drops: [
            {
                type: ["helmet"],
                rarity: "rare"
            },
            {
            }
        ]
    },

    {
        id: "goblin_rafael",
        name: "Goblin Rafael",
        level: 27,
        type: "beast",

        sprite: "assets/img/monsters/creature_9/goblin_rafael.png",

        status: {
            vidaMaxima: 230,
            dano: 95,
            nomeAtaque: "Perfurar",
            armadura: 45,
            agilidade: 50,
            xp: 825,
            ouro: 700
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            }
        ]
    },

    {
        id: "goblin_michelangelo",
        name: "Goblin Michelangelo",
        level: 27,
        type: "beast",

        sprite: "assets/img/monsters/creature_9/goblin_michelangelo.png",

        status: {
            vidaMaxima: 220,
            dano: 95,
            nomeAtaque: "Golpear",
            armadura: 45,
            agilidade: 50,
            xp: 825,
            ouro: 700
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            }
        ]
    },

    // ============================================
    // NÍVEL 30 - Boss (Desafio Épico)
    // ============================================
    {
        id: "king-the-goblins",
        name: "Rei dos Goblins",
        level: 30,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss_3/king-the-goblins.png",

        status: {
            vidaMaxima: 450,
            dano: 120,
            nomeAtaque: "Magia Negra",
            armadura: 30,
            agilidade: 54,
            xp: 1075,
            ouro: 880
        },

        drops: [
            {
                type: ["chest"],
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
