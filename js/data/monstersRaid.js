import items from "./items.js";
import enchantmentStone from "./enchantmentStone.js";

const monstersRaid = [

    // ============================================
    // NÍVEL 150 - RAID 
    // ============================================
    {
        id: "drake_water",
        name: "Dragão Abissal",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-water.png",
        floor: 1,

        status: {
            vidaMaxima: 15000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 250,
                },
                {
                    nomeAtaque: "Jato d'gua",
                    dano: 280,
                },
                {
                    nomeAtaque: "Hidro Bomba",
                    dano: 320,
                },
            ],
            armadura: 220,
            agilidade: 200,
            xp: 0,
            ouro: 10000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 80 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 6 },
                    { type: ["boot"], rarity: "legendary", chance: 3 }
                ]
            }
        ]
    },

    {
        id: "drake_fire",
        name: "Dragão Infernal",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-fire.png",
        floor: 2,

        status: {
            vidaMaxima: 16000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 250,
                },
                {
                    nomeAtaque: "Baforada",
                    dano: 280,
                },
                {
                    nomeAtaque: "Chamas infernais",
                    dano: 320,
                },
            ],
            armadura: 220,
            agilidade: 200,
            xp: 0,
            ouro: 10000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 80 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 6 },
                    { type: ["leg"], rarity: "legendary", chance: 3 }
                ]
            }
        ]
    },

    {
        id: "drake_light",
        name: "Dragão Solaria",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-light.png",
        floor: 3,

        status: {
            vidaMaxima: 18000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 270,
                },
                {
                    nomeAtaque: "Iluminar",
                    dano: 300,
                },
                {
                    nomeAtaque: "Raio Aurora",
                    dano: 340,
                },
            ],
            armadura: 230,
            agilidade: 200,
            xp: 0,
            ouro: 10000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 80 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 6 },
                    { type: ["chest"], rarity: "legendary", chance: 3 }
                ]
            }
        ]
    },

    {
        id: "drake_dark",
        name: "Dragão de Tenebris",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-dark.png",
        floor: 4,

        status: {
            vidaMaxima: 18000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 270,
                },
                {
                    nomeAtaque: "Ofuscar",
                    dano: 300,
                },
                {
                    nomeAtaque: "Raio Negro",
                    dano: 340,
                },
            ],
            armadura: 230,
            agilidade: 200,
            xp: 0,
            ouro: 10000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 80 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 6 },
                    { type: ["helmet"], rarity: "legendary", chance: 3 }
                ]
            }
        ]
    },

    {
        id: "drake_plant",
        name: "Dragão Yggdrasil",
        level: 180,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-plant.png",
        floor: 5,

        status: {
            vidaMaxima: 20000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 250,
                },
                {
                    nomeAtaque: "Chicote de Vinha",
                    dano: 350,
                },
                {
                    nomeAtaque: "Raio Solar",
                    dano: 400,
                },
            ],
            armadura: 235,
            agilidade: 220,
            xp: 0,
            ouro: 10000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 80 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 6 },
                    { type: ["weapon"], rarity: "legendary", chance: 3 }
                ]
            }
        ]
    },

];

export default monstersRaid;