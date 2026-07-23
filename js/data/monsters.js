import items from "./items.js";

const monsters = [

    {
        id: "wolf",
        name: "Lobo Cinzento",
        level: 1,
        type: "beast",

        sprite: "assets/img/monsters/creature_1/wolf.png",

        status: {
            vidaMaxima: 50,
            dano: 7,
            nomeAtaque: "Mordida",
            armadura: 3,
            agilidade: 7,
            xp: 20,
            ouro: 12
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
            vidaMaxima: 80,
            dano: 8,
            nomeAtaque: "Investida",
            armadura: 4,
            agilidade: 4,
            xp: 35,
            ouro: 22
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

    {
        id: "threeWolf",
        name: "Fera Tricefálica",
        level: 3,
        type: "beast",

        sprite: "assets/img/monsters/creature_1/three_wolf.png",

        status: {
            vidaMaxima: 120,
            dano: 18,
            nomeAtaque: "Mordida Tripla",
            armadura: 5,
            agilidade: 10,
            xp: 55,
            ouro: 50
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

    {
        id: "beetle",
        name: "Besouro",
        level: 5,
        type: "beast",

        sprite: "assets/img/monsters/creature_2/beetle.png",

        status: {
            vidaMaxima: 120,
            dano: 4,
            nomeAtaque: "Mordida",
            armadura: 9,
            agilidade: 7,
            xp: 60,
            ouro: 25
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
            dano: 10,
            nomeAtaque: "Investida",
            armadura: 3,
            agilidade: 12,
            xp: 75,
            ouro: 30
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
            vidaMaxima: 180,
            dano: 20,
            nomeAtaque: "Picada",
            armadura: 8,
            agilidade: 12,
            xp: 95,
            ouro: 90
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
        id: "beaver",
        name: "Castor",
        level: 10,
        type: "beast",

        sprite: "assets/img/monsters/creature_3/beaver.png",

        status: {
            vidaMaxima: 150,
            dano: 15,
            nomeAtaque: "Dentada",
            armadura: 7,
            agilidade: 13,
            xp: 80,
            ouro: 75
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
        name: "Crocrodilo",
        level: 10,
        type: "beast",

        sprite: "assets/img/monsters/creature_3/crocodile.png",

        status: {
            vidaMaxima: 180,
            dano: 15,
            nomeAtaque: "Investida",
            armadura: 10,
            agilidade: 3,
            xp: 85,
            ouro: 75
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
        name: "Urso Negro",
        level: 10,
        type: "beast",

        sprite: "assets/img/monsters/creature_3/bear.png",

        status: {
            vidaMaxima: 220,
            dano: 18,
            nomeAtaque: "Picada",
            armadura: 13,
            agilidade: 15,
            xp: 120,
            ouro: 120
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
        id: "werewolf",
        name: "Lobisomem",
        level: 15,
        type: "beast",

        sprite: "assets/img/monsters/creature_boss/werewolf.png",

        status: {
            vidaMaxima: 250,
            dano: 28,
            nomeAtaque: "Dilacerar ",
            armadura: 15,
            agilidade: 16,
            xp: 180,
            ouro: 200
        },

        drops: [
            {
                type: ["weapon"],
                rarity: "uncommon"
            },
            {
                item: items.smallPotion,
                quantidade: 3
            }
        ]
    }

];

export default monsters;