import items from "./items.js";
import enchantmentStone from "./enchantmentStone.js";
import pets from "./pet.js";
import ring from "./ring.js";
import amulet from "./amulet.js";

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
            vidaMaxima: 20903,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 318,
                },
                {
                    nomeAtaque: "Jato d'gua",
                    dano: 341,
                },
                {
                    nomeAtaque: "Hidro Bomba",
                    dano: 386,
                },
            ],
            armadura: 271,
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
                    { type: ["boot"], rarity: "legendary", chance: 7 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 65 }
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
            vidaMaxima: 21417,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 338,
                },
                {
                    nomeAtaque: "Baforada",
                    dano: 361,
                },
                {
                    nomeAtaque: "Chamas infernais",
                    dano: 361,
                },
            ],
            armadura: 286,
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
                    { type: ["leg"], rarity: "legendary", chance: 7 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 65 }
                ]
            }
        ]
    },

    {
        id: "drake_skull",
        element: "skull",
        name: "Dragão Caveira",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-skull.png",
        floor: 3,

        status: {
            vidaMaxima: 22400,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 340,
                },
                {
                    nomeAtaque: "Olhar da Morte",
                    dano: 362,
                },
                {
                    nomeAtaque: "Baforada da Morte",
                    dano: 362,
                },
            ],
            armadura: 286,
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
                    { item: ring.ringSkullLegendary, chance: 3.5 },
                    { item: amulet.amuletSkullLegendary, chance: 3.5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 65 }
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
        floor: 4,

        status: {
            vidaMaxima: 22449,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 357,
                },
                {
                    nomeAtaque: "Ferroada Acida",
                    dano: 380,
                },
                {
                    nomeAtaque: "Jato Acido",
                    dano: 380,
                },
            ],
            armadura: 286,
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
                    { item: ring.ringPrimalLegendary, chance: 3.5 },
                    { item: amulet.amuletPrimalLegendary, chance: 3.5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 65 }
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
        floor: 5,

        status: {
            vidaMaxima: 24496,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 353,
                },
                {
                    nomeAtaque: "Choque Elétrico",
                    dano: 377,
                },
                {
                    nomeAtaque: "Trovão",
                    dano: 377,
                },
            ],
            armadura: 284,
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
                    { item: ring.ringModernLegendary, chance: 3.5 },
                    { item: amulet.amuletModernLegendary, chance: 3.5 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 65 }
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
        floor: 6,

        status: {
            vidaMaxima: 22004,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 489,
                },
                {
                    nomeAtaque: "Iluminar",
                    dano: 517,
                },
                {
                    nomeAtaque: "Raio Aurora",
                    dano: 564,
                },
            ],
            armadura: 227,
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
                    { type: ["chest"], rarity: "legendary", chance: 7 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 65 }
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
        floor: 7,

        status: {
            vidaMaxima: 24288,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 477,
                },
                {
                    nomeAtaque: "Ofuscar",
                    dano: 494,
                },
                {
                    nomeAtaque: "Raio Negro",
                    dano: 537,
                },
            ],
            armadura: 243,
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
                    { type: ["helmet"], rarity: "legendary", chance: 7 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 65 }
                ]
            }
        ]
    },

    {
        id: "drake_sakura",
        element: "plant",
        name: "Dragão de Sakura",
        level: 180,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake-sakura.png",
        floor: 8,

        status: {
            vidaMaxima: 22443,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 433,
                },
                {
                    nomeAtaque: "Chicote de Vinha",
                    dano: 451,
                },
                {
                    nomeAtaque: "Dança das Pétalas",
                    dano: 500,
                },
            ],
            armadura: 265,
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
                    { item: ring.ringLoveLegendary, chance: 2.75 },
                    { item: amulet.amuletLoveLegendary, chance: 2.75 },
                    { item: ring.ringLuckLegendary, chance: 2.75 },
                    { item: amulet.amuletLuckLegendary, chance: 2.75 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 65 }
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
        floor: 8,

        status: {
            vidaMaxima: 24443,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 453,
                },
                {
                    nomeAtaque: "Chicote de Vinha",
                    dano: 491,
                },
                {
                    nomeAtaque: "Raio Solar",
                    dano: 529,
                },
            ],
            armadura: 275,
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
                    { type: ["weapon"], rarity: "legendary", chance: 7 },
                    { item: enchantmentStone.quartzoRosaTres, chance: 10 },
                    { item: enchantmentStone.quartzoRosaDois, chance: 13 },
                    { item: enchantmentStone.quartzoRosaUm, chance: 65 }
                ]
            },
            // Ovo do Yggdrasil: sorteio à parte (2%), além do pool acima —
            // não tira a chance de nenhum outro drop.
            {
                item: { ...pets.yggdrasilPet1, icon: "assets/img/assets/eggs_drop/egg-yggdrasil.png" },
                chance: 2
            }
        ]
    },

];

export default monstersRaid;