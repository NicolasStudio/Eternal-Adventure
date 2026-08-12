import items from "./items.js";
import enchantmentStone from "./enchantmentStone.js";

const monsters = [

    // ============================================
    // NÍVEL 1 - Bosque 
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
                type: ["weapon"],
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
            },
            {
                item: items.smallPotion,
                quantidade: 1
            }
        ]
    },

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
                type: ["helmet"],
                rarity: "common"
            },
            {
                item: items.smallPotion,
                quantidade: 2
            }
        ]
    },

    // ============================================
    // NÍVEL 3 - Bosque 
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
    // NÍVEL 7 - Bosque 
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
    // NÍVEL 10 - Boss Bosque
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
    // NÍVEL 13 - Caverna
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
    // NÍVEL 15 - Caverna
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
    // NÍVEL 18 - Caverna
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
    // NÍVEL 20 - Boss Caverna
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
    // NÍVEL 23 - Caverna
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
    // NÍVEL 25 - Caverna
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
    // NÍVEL 27 - Caverna
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
    // NÍVEL 30 - Boss Caverna 2
    // ============================================
    {
        id: "king-the-goblins",
        name: "Rei dos Goblins",
        level: 30,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss_3/king-the-goblins.png",

        status: {
            vidaMaxima: 420,
            dano: 115,
            nomeAtaque: "Magia Negra",
            armadura: 35,
            agilidade: 50,
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

    // ============================================
    // NÍVEL 33 - Oceano
    // ============================================
    {
        id: "crab",
        name: "Caranguejo",
        level: 33,
        type: "beast",

        sprite: "assets/img/monsters/creature_10/crab.png",

        status: {
            vidaMaxima: 294,
            dano: 96,
            nomeAtaque: "Pinçar",
            armadura: 43,
            agilidade: 62,
            xp: 250,
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
        id: "lobster",
        name: "Lagosta",
        level: 33,
        type: "beast",

        sprite: "assets/img/monsters/creature_10/lobster.png",

        status: {
            vidaMaxima: 301,
            dano: 98,
            nomeAtaque: "Pinçar",
            armadura: 41,
            agilidade: 64,
            xp: 250,
            ouro: 720
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
        id: "crab_knife",
        name: "Caranguejo Armado",
        level: 33,
        type: "beast",

        sprite: "assets/img/monsters/creature_10/crab_knife.png",

        status: {
            vidaMaxima: 283,
            dano: 99,
            nomeAtaque: "Fatiar",
            armadura: 41,
            agilidade: 62,
            xp: 250,
            ouro: 750
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
    // NÍVEL 35 - Oceano
    // ============================================
    {
        id: "mermaid",
        name: "Sereia",
        level: 35,
        type: "beast",

        sprite: "assets/img/monsters/creature_11/mermaid.png",

        status: {
            vidaMaxima: 312,
            dano: 107,
            nomeAtaque: "Arranhar",
            armadura: 42,
            agilidade: 64,
            xp: 250,
            ouro: 750
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
        id: "nautilus",
        name: "Nautilus",
        level: 35,
        type: "beast",

        sprite: "assets/img/monsters/creature_11/nautilus.png",

        status: {
            vidaMaxima: 320,
            dano: 109,
            nomeAtaque: "Morder",
            armadura: 43,
            agilidade: 64,
            xp: 250,
            ouro: 750
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
        id: "octopus",
        name: "Polvo",
        level: 35,
        type: "beast",

        sprite: "assets/img/monsters/creature_11/octopus.png",

        status: {
            vidaMaxima: 333,
            dano: 97,
            nomeAtaque: "Estrangular",
            armadura: 44,
            agilidade: 64,
            xp: 250,
            ouro: 800
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            }
        ]
    },

    // ============================================
    // NÍVEL 37 - Oceano
    // ============================================
    {
        id: "reptile_1",
        name: "Zargul, Presa-Torta",
        level: 37,
        type: "beast",

        sprite: "assets/img/monsters/creature_12/reptile_1.png",

        status: {
            vidaMaxima: 316,
            dano: 102,
            nomeAtaque: "Perfurar",
            armadura: 42,
            agilidade: 69,
            xp: 250,
            ouro: 750
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
        id: "reptile_2",
        name: "Alegna, Boca-Torta",
        level: 37,
        type: "beast",

        sprite: "assets/img/monsters/creature_12/reptile_2.png",

        status: {
            vidaMaxima: 317,
            dano: 108,
            nomeAtaque: "Perfurar",
            armadura: 43,
            agilidade: 66,
            xp: 250,
            ouro: 750
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
        id: "reptile_3",
        name: "Ghoul, o Sanguinário",
        level: 37,
        type: "beast",

        sprite: "assets/img/monsters/creature_12/reptile_3.png",

        status: {
            vidaMaxima: 332,
            dano: 101,
            nomeAtaque: "Cortar",
            armadura: 41,
            agilidade: 65,
            xp: 250,
            ouro: 750
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
        id: "reptile_4",
        name: "Kissame, o Raivoso",
        level: 37,
        type: "beast",

        sprite: "assets/img/monsters/creature_12/reptile_4.png",

        status: {
            vidaMaxima: 337,
            dano: 106,
            nomeAtaque: "Fatiar",
            armadura: 42,
            agilidade: 67,
            xp: 250,
            ouro: 750
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
        id: "reptile_5",
        name: "Y-Gago, o Falante",
        level: 37,
        type: "beast",

        sprite: "assets/img/monsters/creature_12/reptile_5.png",

        status: {
            vidaMaxima: 328,
            dano: 104,
            nomeAtaque: "Magia Negra dos Oceanos",
            armadura: 44,
            agilidade: 68,
            xp: 250,
            ouro: 750
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
        id: "reptile_6",
        name: "Serpo, Ofidiano",
        level: 37,
        type: "beast",

        sprite: "assets/img/monsters/creature_12/reptile_6.png",

        status: {
            vidaMaxima: 320,
            dano: 108,
            nomeAtaque: "Decepar",
            armadura: 43,
            agilidade: 69,
            xp: 250,
            ouro: 750
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
        id: "reptile_7",
        name: "Morgath, o Sábio",
        level: 37,
        type: "beast",

        sprite: "assets/img/monsters/creature_12/reptile_7.png",

        status: {
            vidaMaxima: 339,
            dano: 104,
            nomeAtaque: "Pregar",
            armadura: 45,
            agilidade: 65,
            xp: 250,
            ouro: 750
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            }
        ]
    },

    // ============================================
    // NÍVEL 40 - Boss Oceano
    // ============================================
    {
        id: "king_of_the_reptiles",
        name: "Rei dos Répteis",
        level: 40,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss_4/king_of_the_reptiles.png",

        status: {
            vidaMaxima: 405,
            dano: 119,
            nomeAtaque: "Fatiar",
            armadura: 54,
            agilidade: 79,
            xp: 1108,
            ouro: 880
        },

        drops: [
            {
                type: ["boot"],
                rarity: "mystic"
            },
            {
                item: items.tripleMediumPotion,
                quantidade: 1
            }
        ]
    },

    // ============================================
    // NÍVEL 43 - Deserto
    // ============================================
    {
        id: "tree_men",
        name: "Homem Árvore",
        level: 43,
        type: "beast",

        sprite: "assets/img/monsters/creature_13/tree_men.png",

        status: {
            vidaMaxima: 348,
            dano: 111,
            nomeAtaque: "Arranhar",
            armadura: 54,
            agilidade: 76,
            xp: 525,
            ouro: 850
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
        id: "sludge_men",
        name: "Homem Musgo",
        level: 43,
        type: "beast",

        sprite: "assets/img/monsters/creature_13/sludge_men.png",

        status: {
            vidaMaxima: 353,
            dano: 123,
            nomeAtaque: "Pancada",
            armadura: 57,
            agilidade: 75,
            xp: 525,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            }
        ]
    },

    {
        id: "tree_men_warrior",
        name: "Homem Árvore Guerreiro",
        level: 43,
        type: "beast",

        sprite: "assets/img/monsters/creature_13/tree_men_warrior.png",

        status: {
            vidaMaxima: 336,
            dano: 111,
            nomeAtaque: "Fatiar",
            armadura: 53,
            agilidade: 78,
            xp: 525,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 4
            }
        ]
    },

    // ============================================
    // NÍVEL 45 - Deserto
    // ============================================
    {
        id: "swamp_spectral_wolf",
        name: "Lobo Espectral do Pântano",
        level: 45,
        type: "beast",

        sprite: "assets/img/monsters/creature_14/swamp_spectral_wolf.png",

        status: {
            vidaMaxima: 326,
            dano: 116,
            nomeAtaque: "Morder",
            armadura: 57,
            agilidade: 80,
            xp: 525,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            }
        ]
    },

    {
        id: "sandman",
        name: "Homem de Areia",
        level: 45,
        type: "beast",

        sprite: "assets/img/monsters/creature_14/sandman.png",

        status: {
            vidaMaxima: 337,
            dano: 124,
            nomeAtaque: "Pancada",
            armadura: 58,
            agilidade: 76,
            xp: 525,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            }
        ]
    },

    {
        id: "shadowy_tree",
        name: "Árvore Sombria",
        level: 45,
        type: "beast",

        sprite: "assets/img/monsters/creature_14/shadowy_tree.png",

        status: {
            vidaMaxima: 370,
            dano: 126,
            nomeAtaque: "Pancada",
            armadura: 55,
            agilidade: 77,
            xp: 525,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            }
        ]
    },

    // ============================================
    // NÍVEL 47 - Deserto
    // ============================================
    {
        id: "gargoyle",
        name: "Gárgula",
        level: 47,
        type: "beast",

        sprite: "assets/img/monsters/creature_15/gargoyle.png",

        status: {
            vidaMaxima: 394,
            dano: 124,
            nomeAtaque: "Rasgar",
            armadura: 54,
            agilidade: 78,
            xp: 525,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            }
        ]
    },

    {
        id: "orc_warrior",
        name: "Orc Guerreiro da Areia",
        level: 47,
        type: "beast",

        sprite: "assets/img/monsters/creature_15/orc_warrior.png",

        status: {
            vidaMaxima: 387,
            dano: 129,
            nomeAtaque: "Fatiar",
            armadura: 58,
            agilidade: 83,
            xp: 525,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            }
        ]
    },

    {
        id: "cyclops",
        name: "Ciclope",
        level: 47,
        type: "beast",

        sprite: "assets/img/monsters/creature_15/cyclops.png",

        status: {
            vidaMaxima: 369,
            dano: 137,
            nomeAtaque: "Pancada",
            armadura: 55,
            agilidade: 81,
            xp: 505,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            }
        ]
    },

    // ============================================
    // NÍVEL 50 - Boss Deserto
    // ============================================
    {
        id: "minotaur",
        name: "Minotauro",
        level: 50,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss_5/minotaur.png",

        status: {
            vidaMaxima: 445,
            dano: 140,
            nomeAtaque: "Fatiar",
            armadura: 68,
            agilidade: 86,
            xp: 1408,
            ouro: 880
        },

        drops: [
            {
                type: ["leg"],
                rarity: "mystic"
            },
            {
                item: items.tripleMediumPotion,
                quantidade: 2
            }
        ]
    },

    // ============================================
    // NÍVEL 53 - Vulcão
    // ============================================
    {
        id: "skeletal_steed",
        name: "Cavalo Esqueleto",
        level: 53,
        type: "beast",

        sprite: "assets/img/monsters/creature_16/skeletal_steed.png",

        status: {
            vidaMaxima: 421,
            dano: 138,
            nomeAtaque: "Coice",
            armadura: 62,
            agilidade: 96,
            xp: 725,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.tcRubiUm, chance: 75 },
                    { item: enchantmentStone.tcRubiDois, chance: 20 },
                    { item: enchantmentStone.tcRubiTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "colossal_thorn_beast",
        name: "Besta Espinhosa Colossal",
        level: 53,
        type: "beast",

        sprite: "assets/img/monsters/creature_16/colossal_thorn_beast.png",

        status: {
            vidaMaxima: 413,
            dano: 125,
            nomeAtaque: "Perfurar",
            armadura: 58,
            agilidade: 93,
            xp: 725,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            },
            {
                pool: [
                    { item: enchantmentStone.tcRubiUm, chance: 75 },
                    { item: enchantmentStone.tcRubiDois, chance: 20 },
                    { item: enchantmentStone.tcRubiTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "colossal_werewolf",
        name: "lobisomem colossal",
        level: 53,
        type: "beast",

        sprite: "assets/img/monsters/creature_16/colossal_werewolf.png",

        status: {
            vidaMaxima: 373,
            dano: 129,
            nomeAtaque: "Dilacerar",
            armadura: 58,
            agilidade: 93,
            xp: 725,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 4
            },
            {
                pool: [
                    { item: enchantmentStone.tcRubiUm, chance: 75 },
                    { item: enchantmentStone.tcRubiDois, chance: 20 },
                    { item: enchantmentStone.tcRubiTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 55 - Vulcão
    // ============================================
    {
        id: "blood_monster",
        name: "Monstro de Sangue",
        level: 55,
        type: "beast",

        sprite: "assets/img/monsters/creature_17/blood_monster.png",

        status: {
            vidaMaxima: 422,
            dano: 136,
            nomeAtaque: "Arranhar",
            armadura: 60,
            agilidade: 94,
            xp: 725,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.tcRubiUm, chance: 75 },
                    { item: enchantmentStone.tcRubiDois, chance: 20 },
                    { item: enchantmentStone.tcRubiTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "colossal_beast",
        name: "Besta Colossal de Sangue",
        level: 55,
        type: "beast",

        sprite: "assets/img/monsters/creature_17/colossal_beast.png",

        status: {
            vidaMaxima: 398,
            dano: 149,
            nomeAtaque: "Devorar",
            armadura: 62,
            agilidade: 98,
            xp: 125,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            },
            {
                pool: [
                    { item: enchantmentStone.tcRubiUm, chance: 75 },
                    { item: enchantmentStone.tcRubiDois, chance: 20 },
                    { item: enchantmentStone.tcRubiTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "stalker_zombie",
        name: "Caçador Zumbi",
        level: 55,
        type: "beast",

        sprite: "assets/img/monsters/creature_17/stalker_zombie.png",

        status: {
            vidaMaxima: 391,
            dano: 144,
            nomeAtaque: "Dilacerar",
            armadura: 59,
            agilidade: 96,
            xp: 725,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 4
            },
            {
                pool: [
                    { item: enchantmentStone.tcRubiUm, chance: 75 },
                    { item: enchantmentStone.tcRubiDois, chance: 20 },
                    { item: enchantmentStone.tcRubiTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 57 - Vulcão
    // ============================================
    {
        id: "orc_zumbie",
        name: "Orc Zumbi",
        level: 57,
        type: "beast",

        sprite: "assets/img/monsters/creature_18/orc_zumbie.png",

        status: {
            vidaMaxima: 459,
            dano: 145,
            nomeAtaque: "Arranhar",
            armadura: 61,
            agilidade: 102,
            xp: 725,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.tcRubiUm, chance: 75 },
                    { item: enchantmentStone.tcRubiDois, chance: 20 },
                    { item: enchantmentStone.tcRubiTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "zombie_ghoul",
        name: "Ghoul Zumbi",
        level: 57,
        type: "beast",

        sprite: "assets/img/monsters/creature_18/zombie_ghoul.png",

        status: {
            vidaMaxima: 449,
            dano: 148,
            nomeAtaque: "Perfurar",
            armadura: 59,
            agilidade: 95,
            xp: 725,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            },
            {
                pool: [
                    { item: enchantmentStone.tcRubiUm, chance: 75 },
                    { item: enchantmentStone.tcRubiDois, chance: 20 },
                    { item: enchantmentStone.tcRubiTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "demonic_ogre",
        name: "Ogro Demônio",
        level: 57,
        type: "beast",

        sprite: "assets/img/monsters/creature_18/demonic_ogre.png",

        status: {
            vidaMaxima: 413,
            dano: 137,
            nomeAtaque: "Dilacerar",
            armadura: 59,
            agilidade: 104,
            xp: 725,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 4
            },
            {
                pool: [
                    { item: enchantmentStone.tcRubiUm, chance: 75 },
                    { item: enchantmentStone.tcRubiDois, chance: 20 },
                    { item: enchantmentStone.tcRubiTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 60 - Boss Vulcão
    // ============================================
    {
        id: "headless_warrior",
        name: "Guerreiro Sem Cabeça",
        level: 60,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss_6/headless_warrior.png",

        status: {
            vidaMaxima: 491,
            dano: 154,
            nomeAtaque: "Martelar",
            armadura: 70,
            agilidade: 103,
            xp: 1638,
            ouro: 880
        },

        drops: [
            {
                type: ["chest"],
                rarity: "mystic"
            },
            {
                item: items.tripleMediumPotion,
                quantidade: 3
            }
        ]
    },

    // ============================================
    // NÍVEL 63 - Mansão
    // ============================================
    {
        id: "queen_dead",
        name: "Rainha Morta",
        level: 63,
        type: "beast",

        sprite: "assets/img/monsters/creature_19/queen_dead.png",

        status: {
            vidaMaxima: 488,
            dano: 146,
            nomeAtaque: "Arranhar",
            armadura: 71,
            agilidade: 104,
            xp: 825,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "reptilian_ghoul",
        name: "Ghoul Reptiliano",
        level: 63,
        type: "beast",

        sprite: "assets/img/monsters/creature_19/reptilian_ghoul.png",

        status: {
            vidaMaxima: 491,
            dano: 149,
            nomeAtaque: "Empalar",
            armadura: 68,
            agilidade: 102,
            xp: 825,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 3
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "lich_wraith",
        name: "Espectro Lich",
        level: 63,
        type: "beast",

        sprite: "assets/img/monsters/creature_19/lich_wraith.png",

        status: {
            vidaMaxima: 465,
            dano: 144,
            nomeAtaque: "Dilacerar",
            armadura: 71,
            agilidade: 109,
            xp: 825,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 4
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 65 - Mansão
    // ============================================
    {
        id: "employee_vampire",
        name: "Funcionária Vampira I",
        level: 65,
        type: "beast",

        sprite: "assets/img/monsters/creature_20/employee_vampire.png",

        status: {
            vidaMaxima: 465,
            dano: 146,
            nomeAtaque: "Esfaquear",
            armadura: 75,
            agilidade: 107,
            xp: 825,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "employee2_vampire",
        name: "Funcionária Vampira II",
        level: 65,
        type: "beast",

        sprite: "assets/img/monsters/creature_20/employee2_vampire.png",

        status: {
            vidaMaxima: 442,
            dano: 142,
            nomeAtaque: "Esfaquear",
            armadura: 68,
            agilidade: 108,
            xp: 725,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "employee3_vampire",
        name: "Funcionária Vampira III",
        level: 65,
        type: "beast",

        sprite: "assets/img/monsters/creature_20/employee3_vampire.png",

        status: {
            vidaMaxima: 495,
            dano: 151,
            nomeAtaque: "Esfaquear",
            armadura: 68,
            agilidade: 106,
            xp: 825,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 67 - Mansão
    // ============================================
    {
        id: "boy_vampire",
        name: "Menino Vampiro",
        level: 67,
        type: "beast",

        sprite: "assets/img/monsters/creature_21/boy_vampire.png",

        status: {
            vidaMaxima: 525,
            dano: 158,
            nomeAtaque: "Morder",
            armadura: 74,
            agilidade: 114,
            xp: 525,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "girl_vampire",
        name: "Menina Vampira",
        level: 67,
        type: "beast",

        sprite: "assets/img/monsters/creature_21/girl_vampire.png",

        status: {
            vidaMaxima: 448,
            dano: 163,
            nomeAtaque: "Morder",
            armadura: 72,
            agilidade: 110,
            xp: 525,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "vampire_2",
        name: "Vampira",
        level: 67,
        type: "beast",

        sprite: "assets/img/monsters/creature_21/vampire_2.png",

        status: {
            vidaMaxima: 468,
            dano: 161,
            nomeAtaque: "Esfaquear",
            armadura: 68,
            agilidade: 109,
            xp: 825,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "vampire",
        name: "Vampiro",
        level: 67,
        type: "beast",

        sprite: "assets/img/monsters/creature_21/vampire.png",

        status: {
            vidaMaxima: 482,
            dano: 168,
            nomeAtaque: "Morder",
            armadura: 74,
            agilidade: 107,
            xp: 825,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.olbapImperialUm, chance: 75 },
                    { item: enchantmentStone.olbapImperialDois, chance: 20 },
                    { item: enchantmentStone.olbapImperialTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 70 - Boss Mansão
    // ============================================
    {
        id: "dracula",
        name: "Drácula",
        level: 70,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss_7/dracula.png",

        status: {
            vidaMaxima: 557,
            dano: 201,
            nomeAtaque: "Fatiar",
            armadura: 77,
            agilidade: 114,
            xp: 1638,
            ouro: 880
        },

        drops: [
            {
                type: ["helmet"],
                rarity: "mystic"
            },
            {
                item: items.tripleMediumPotion,
                quantidade: 5
            }
        ]
    },

    // ============================================
    // NÍVEL 73 - Folclore
    // ============================================
    {
        id: "corpo_seco",
        name: "Corpo Seco",
        level: 73,
        type: "beast",

        sprite: "assets/img/monsters/creature_22/corpo_seco.png",

        status: {
            vidaMaxima: 438,
            dano: 154,
            nomeAtaque: "Arranhar",
            armadura: 59,
            agilidade: 94,
            xp: 825,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.marcoSafiraUm, chance: 75 },
                    { item: enchantmentStone.marcoSafiraDois, chance: 20 },
                    { item: enchantmentStone.marcoSafiraTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "bradador",
        name: "Bradador",
        level: 73,
        type: "beast",

        sprite: "assets/img/monsters/creature_22/bradador.png",

        status: {
            vidaMaxima: 470,
            dano: 161,
            nomeAtaque: "Arranhar",
            armadura: 58,
            agilidade: 97,
            xp: 825,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.marcoSafiraUm, chance: 75 },
                    { item: enchantmentStone.marcoSafiraDois, chance: 20 },
                    { item: enchantmentStone.marcoSafiraTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "jurupari",
        name: "Jurupari",
        level: 73,
        type: "beast",

        sprite: "assets/img/monsters/creature_22/jurupari.png",

        status: {
            vidaMaxima: 483,
            dano: 159,
            nomeAtaque: "Arranhar",
            armadura: 57,
            agilidade: 89,
            xp: 825,
            ouro: 950
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.marcoSafiraUm, chance: 75 },
                    { item: enchantmentStone.marcoSafiraDois, chance: 20 },
                    { item: enchantmentStone.marcoSafiraTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 75 - Folclore
    // ============================================
    {
        id: "saci",
        name: "Saci",
        level: 75,
        type: "beast",

        sprite: "assets/img/monsters/creature_23/saci.png",

        status: {
            vidaMaxima: 488,
            dano: 156,
            nomeAtaque: "Tiro de Zarabatana",
            armadura: 60,
            agilidade: 99,
            xp: 925,
            ouro: 950
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.marcoSafiraUm, chance: 75 },
                    { item: enchantmentStone.marcoSafiraDois, chance: 20 },
                    { item: enchantmentStone.marcoSafiraTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "bicho_papao",
        name: "Bicho Papão",
        level: 75,
        type: "beast",

        sprite: "assets/img/monsters/creature_23/bicho_papao.png",

        status: {
            vidaMaxima: 497,
            dano: 165,
            nomeAtaque: "Devorar",
            armadura: 61,
            agilidade: 91,
            xp: 925,
            ouro: 850
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.marcoSafiraUm, chance: 75 },
                    { item: enchantmentStone.marcoSafiraDois, chance: 20 },
                    { item: enchantmentStone.marcoSafiraTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "boto",
        name: "Boto",
        level: 75,
        type: "beast",

        sprite: "assets/img/monsters/creature_23/boto.png",

        status: {
            vidaMaxima: 491,
            dano: 159,
            nomeAtaque: "Pegar Mulher Casada",
            armadura: 60,
            agilidade: 90,
            xp: 925,
            ouro: 950
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.marcoSafiraUm, chance: 75 },
                    { item: enchantmentStone.marcoSafiraDois, chance: 20 },
                    { item: enchantmentStone.marcoSafiraTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 77 - Folclore
    // ============================================
    {
        id: "boitata",
        name: "Boitatá",
        level: 77,
        type: "beast",

        sprite: "assets/img/monsters/creature_24/boitata.png",

        status: {
            vidaMaxima: 483,
            dano: 184,
            nomeAtaque: "Mordida Flamejante",
            armadura: 57,
            agilidade: 93,
            xp: 925,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.marcoSafiraUm, chance: 75 },
                    { item: enchantmentStone.marcoSafiraDois, chance: 20 },
                    { item: enchantmentStone.marcoSafiraTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "headless_mule",
        name: "Mula sem cabeça",
        level: 77,
        type: "beast",

        sprite: "assets/img/monsters/creature_24/headless_mule.png",

        status: {
            vidaMaxima: 477,
            dano: 158,
            nomeAtaque: "Coice",
            armadura: 57,
            agilidade: 98,
            xp: 925,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.marcoSafiraUm, chance: 75 },
                    { item: enchantmentStone.marcoSafiraDois, chance: 20 },
                    { item: enchantmentStone.marcoSafiraTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "curupira",
        name: "Curupira",
        level: 77,
        type: "beast",

        sprite: "assets/img/monsters/creature_24/curupira.png",

        status: {
            vidaMaxima: 520,
            dano: 185,
            nomeAtaque: "Perufrar",
            armadura: 61,
            agilidade: 96,
            xp: 925,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.marcoSafiraUm, chance: 75 },
                    { item: enchantmentStone.marcoSafiraDois, chance: 20 },
                    { item: enchantmentStone.marcoSafiraTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 80 - Boss Mansão
    // ============================================
    {
        id: "cuca",
        name: "Cuca",
        level: 80,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss_8/cuca.png",

        status: {
            vidaMaxima: 600,
            dano: 226,
            nomeAtaque: "Te pega daqui",
            armadura: 66,
            agilidade: 100,
            xp: 1925,
            ouro: 1050
        },

        drops: [
            {
                type: ["weapon"],
                rarity: "mystic"
            },
            {
                item: items.tripleMediumPotion,
                quantidade: 5
            }
        ]
    },

    // ============================================
    // NÍVEL 83 - Inferno
    // ============================================
    {
        id: "diabrete_um",
        name: "Kid Diabrete",
        level: 83,
        type: "beast",

        sprite: "assets/img/monsters/creature_25/diabrete_um.png",

        status: {
            vidaMaxima: 627,
            dano: 218,
            nomeAtaque: "Espetar",
            armadura: 77,
            agilidade: 108,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "diabrete_dois",
        name: "Diabrete I",
        level: 83,
        type: "beast",

        sprite: "assets/img/monsters/creature_25/diabrete_dois.png",

        status: {
            vidaMaxima: 624,
            dano: 205,
            nomeAtaque: "Chifrar",
            armadura: 73,
            agilidade: 105,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "diabrete_tres",
        name: "Diabrete II",
        level: 83,
        type: "beast",

        sprite: "assets/img/monsters/creature_25/diabrete_tres.png",

        status: {
            vidaMaxima: 588,
            dano: 208,
            nomeAtaque: "Espetar",
            armadura: 74,
            agilidade: 112,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "diabrete_quatro",
        name: "Diabrete III",
        level: 83,
        type: "beast",

        sprite: "assets/img/monsters/creature_25/diabrete_quatro.png",

        status: {
            vidaMaxima: 603,
            dano: 207,
            nomeAtaque: "Dilacerar",
            armadura: 78,
            agilidade: 112,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 85 - Inferno
    // ============================================
    {
        id: "gargoyle_um",
        name: "Gárgula Infernal I",
        level: 85,
        type: "beast",

        sprite: "assets/img/monsters/creature_26/gargoyle_um.png",

        status: {
            vidaMaxima: 570,
            dano: 208,
            nomeAtaque: "Espetar",
            armadura: 77,
            agilidade: 109,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "gargoyle_dois",
        name: "Gárgula Infernal II",
        level: 85,
        type: "beast",

        sprite: "assets/img/monsters/creature_26/gargoyle_dois.png",

        status: {
            vidaMaxima: 658,
            dano: 221,
            nomeAtaque: "Perfurar",
            armadura: 79,
            agilidade: 112,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "gargoyle_tres",
        name: "Gárgula Infernal III",
        level: 85,
        type: "beast",

        sprite: "assets/img/monsters/creature_26/gargoyle_tres.png",

        status: {
            vidaMaxima: 583,
            dano: 198,
            nomeAtaque: "Empalar",
            armadura: 75,
            agilidade: 106,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "gargoyle_quatro",
        name: "Gárgula Infernal IV",
        level: 83,
        type: "beast",

        sprite: "assets/img/monsters/creature_26/gargoyle_quatro.png",

        status: {
            vidaMaxima: 619,
            dano: 222,
            nomeAtaque: "Dilacerar",
            armadura: 76,
            agilidade: 112,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 87 - Inferno
    // ============================================
    {
        id: "boy_demoniac",
        name: "Garoto Demônio",
        level: 87,
        type: "beast",

        sprite: "assets/img/monsters/creature_27/boy_demoniac.png",

        status: {
            vidaMaxima: 589,
            dano: 234,
            nomeAtaque: "Cortar",
            armadura: 80,
            agilidade: 110,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "girl_demoniac",
        name: "Garota Demônio",
        level: 87,
        type: "beast",

        sprite: "assets/img/monsters/creature_27/girl_demoniac.png",

        status: {
            vidaMaxima: 644,
            dano: 223,
            nomeAtaque: "Magia de Fogo",
            armadura: 77,
            agilidade: 110,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "woman_demoniac",
        name: "Demônio ♀",
        level: 87,
        type: "beast",

        sprite: "assets/img/monsters/creature_27/woman_demoniac.png",

        status: {
            vidaMaxima: 614,
            dano: 212,
            nomeAtaque: "Dissecar",
            armadura: 74,
            agilidade: 116,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    {
        id: "men_demoniac",
        name: "Demônio ♂",
        level: 87,
        type: "beast",

        sprite: "assets/img/monsters/creature_27/men_demoniac.png",

        status: {
            vidaMaxima: 645,
            dano: 222,
            nomeAtaque: "Dilacerar",
            armadura: 72,
            agilidade: 108,
            xp: 1125,
            ouro: 1050
        },

        drops: [
            {
            },
            {
                item: items.mediumPotion,
                quantidade: 2
            },
            {
                pool: [
                    { item: enchantmentStone.essenciaTurmalinaUm, chance: 75 },
                    { item: enchantmentStone.essenciaTurmalinaDois, chance: 20 },
                    { item: enchantmentStone.essenciaTurmalinaTres, chance: 5 }
                ]
            }
        ]
    },

    // ============================================
    // NÍVEL 90 - Boss Inferno
    // ============================================
    {
        id: "daibo",
        name: "Diabo",
        level: 90,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss_9/daibo.png",

        status: {
            vidaMaxima: 646,
            dano: 222,
            nomeAtaque: "Ataque Infernal",
            armadura: 77,
            agilidade: 115,
            xp: 2125,
            ouro: 1050
        },

        drops: [
            {
                // type: ["weapon"],
                // rarity: "mystic"
            },
            {
                item: items.tripleMediumPotion,
                quantidade: 5
            }
        ]
    },

    // ============================================
    // FINAL SECRETO — NÍVEL 100 (não entram no álbum)
    // ============================================
    {
        id: "fallen_angel_of_light",
        name: "Anjo Caído da Luz",
        level: 100,
        type: "beast",
        excludeFromAlbum: true,

        sprite: "assets/img/monsters/creature_up_class/fallen_angel_of_light.png",

        status: {
            vidaMaxima: 745,
            dano: 218,
            nomeAtaque: "Julgamento Divino",
            armadura: 95,
            agilidade: 117,
            xp: 5000,
            ouro: 5000
        },

        drops: [
            {
            }
        ]
    },

    {
        id: "dark_fallen_angel",
        name: "Anjo Caído das Trevas",
        level: 100,
        type: "beast",
        excludeFromAlbum: true,

        sprite: "assets/img/monsters/creature_up_class/dark_fallen_angel.png",

        status: {
            vidaMaxima: 715,
            dano: 228,
            nomeAtaque: "Abraço Sombrio",
            armadura: 90,
            agilidade: 121,
            xp: 5000,
            ouro: 5000
        },

        drops: [
            {
            }
        ]
    },
];

export default monsters;