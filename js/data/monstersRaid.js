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
                    dano: 280,
                },
                {
                    nomeAtaque: "Jato d'gua",
                    dano: 300,
                },
                {
                    nomeAtaque: "Hidro Bomba",
                    dano: 340,
                },
            ],
            armadura: 220,
            agilidade: 200,
            xp: 0,
            ouro: 70000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 69 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 15 },
                    { type: ["boot"], rarity: "legendary", chance: 5 }
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
            vidaMaxima: 17000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 300,
                },
                {
                    nomeAtaque: "Baforada",
                    dano: 320,
                },
                {
                    nomeAtaque: "Chamas infernais",
                    dano: 320,
                },
            ],
            armadura: 230,
            agilidade: 240,
            xp: 0,
            ouro: 70000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 69 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 15 },
                    { type: ["leg"], rarity: "legendary", chance: 5 }
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
                    dano: 330,
                },
                {
                    nomeAtaque: "Iluminar",
                    dano: 350,
                },
                {
                    nomeAtaque: "Raio Aurora",
                    dano: 380,
                },
            ],
            armadura: 240,
            agilidade: 200,
            xp: 0,
            ouro: 80000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 69 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 15 },
                    { type: ["chest"], rarity: "legendary", chance: 5 }
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
                    dano: 350,
                },
                {
                    nomeAtaque: "Ofuscar",
                    dano: 360,
                },
                {
                    nomeAtaque: "Raio Negro",
                    dano: 380,
                },
            ],
            armadura: 250,
            agilidade: 250,
            xp: 0,
            ouro: 80000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 69 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 15 },
                    { type: ["helmet"], rarity: "legendary", chance: 5 }
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
            vidaMaxima: 22000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 340,
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
            armadura: 255,
            agilidade: 280,
            xp: 0,
            ouro: 100000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: enchantmentStone.quartzoRosaUm, chance: 69 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 10 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 15 },
                    { type: ["weapon"], rarity: "legendary", chance: 5 }
                ]
            }
        ]
    },

];

export default monstersRaid;