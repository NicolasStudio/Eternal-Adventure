import items from "./items.js";
import enchantmentStone from "./enchantmentStone.js";
import pets from "./pet.js";

const monstersRaid = [

    // ============================================
    // NÍVEL 150 - RAID 
    // ============================================
    {
        id: "drake_water",
        element: "water",
        name: "Dragão Abissal",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-water.png",
        floor: 1,

        status: {
            vidaMaxima: 17000,
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
                    { item: { ...pets.boitataPet1, icon: "assets/img/assets/eggs_drop/egg-snake.png" }, chance: 5 },
                    { type: ["boot"], rarity: "legendary", chance: 5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 67 }
                ]
            }
        ]
    },

    {
        id: "drake_fire",
        element: "fire",
        name: "Dragão Infernal",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-fire.png",
        floor: 2,

        status: {
            vidaMaxima: 18000,
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
            armadura: 240,
            agilidade: 250,
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
                    { item: { ...pets.boitataPet1, icon: "assets/img/assets/eggs_drop/egg-snake.png" }, chance: 5 },
                    { type: ["leg"], rarity: "legendary", chance: 5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 67 }
                ]
            }
        ]
    },

    {
        id: "drake_bug",
        element: "bug",
        name: "Dragão Varejeiro",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-bug.png",
        floor: 3,

        status: {
            vidaMaxima: 20000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 300,
                },
                {
                    nomeAtaque: "Ferroada Acida",
                    dano: 320,
                },
                {
                    nomeAtaque: "Jato Acido",
                    dano: 320,
                },
            ],
            armadura: 255,
            agilidade: 260,
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
                    { item: { ...pets.boitataPet1, icon: "assets/img/assets/eggs_drop/egg-snake.png" }, chance: 5 },
                    { type: ["ring"], rarity: "legendary", chance: 5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 67 }
                ]
            }
        ]
    },

    {
        id: "drake_energy",
        element: "energy",
        name: "Dragão de Indra",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-energy.png",
        floor: 4,

        status: {
            vidaMaxima: 22000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 300,
                },
                {
                    nomeAtaque: "Choque Elétrico",
                    dano: 320,
                },
                {
                    nomeAtaque: "Trovão",
                    dano: 320,
                },
            ],
            armadura: 255,
            agilidade: 260,
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
                    { item: { ...pets.boitataPet1, icon: "assets/img/assets/eggs_drop/egg-snake.png" }, chance: 5 },
                    { type: ["amulet"], rarity: "legendary", chance: 5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 67 }
                ]
            }
        ]
    },

    {
        id: "drake_light",
        element: "light",
        name: "Dragão Solaria",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-light.png",
        floor: 5,

        status: {
            vidaMaxima: 30000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 520,
                },
                {
                    nomeAtaque: "Iluminar",
                    dano: 550,
                },
                {
                    nomeAtaque: "Raio Aurora",
                    dano: 600,
                },
            ],
            armadura: 310,
            agilidade: 270,
            xp: 0,
            ouro: 95000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: { ...pets.boitataPet1, icon: "assets/img/assets/eggs_drop/egg-snake.png" }, chance: 5 },
                    { type: ["chest"], rarity: "legendary", chance: 5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 67 }
                ]
            }
        ]
    },

    {
        id: "drake_dark",
        element: "dark",
        name: "Dragão de Tenebris",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-dark.png",
        floor: 6,

        status: {
            vidaMaxima: 34000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 560,
                },
                {
                    nomeAtaque: "Ofuscar",
                    dano: 580,
                },
                {
                    nomeAtaque: "Raio Negro",
                    dano: 630,
                },
            ],
            armadura: 340,
            agilidade: 290,
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
                    { item: { ...pets.boitataPet1, icon: "assets/img/assets/eggs_drop/egg-snake.png" }, chance: 5 },
                    { type: ["helmet"], rarity: "legendary", chance: 5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 67 }
                ]
            }
        ]
    },

    {
        id: "drake_plant",
        element: "plant",
        name: "Dragão Yggdrasil",
        level: 180,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-plant.png",
        floor: 7,

        status: {
            vidaMaxima: 40000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 600,
                },
                {
                    nomeAtaque: "Chicote de Vinha",
                    dano: 650,
                },
                {
                    nomeAtaque: "Raio Solar",
                    dano: 700,
                },
            ],
            armadura: 450,
            agilidade: 320,
            xp: 0,
            ouro: 120000
        },

        drops: [
            {
                item: items.largePotion,
                quantidade: 10
            },
            {
                pool: [
                    { item: { ...pets.boitataPet1, icon: "assets/img/assets/eggs_drop/egg-snake.png" }, chance: 5 },
                    { type: ["weapon"], rarity: "legendary", chance: 5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 67 }
                ]
            }
        ]
    },

];

export default monstersRaid;