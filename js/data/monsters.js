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
                quantidade: 2
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
    }

];

export default monsters;
