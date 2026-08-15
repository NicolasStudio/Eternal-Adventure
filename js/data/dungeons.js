import items from "./items.js";
import enchantmentStone from "./enchantmentStone.js";

const dungeons = [

// ===========================
//         BOSQUE
// ===========================
    {
        id: "forest_1",
        name: "Bosque I",
        level: 1,
        boss: false,
        page: 1,
        fights: 5,

        monsters: [
            "wolf",
            "boar",
            "wolf",
            "boar",
            "threeWolf"
        ],

        image: "assets/img/assets/card_dungeon/card_grove_1.png",
        background: "assets/img/backgrounds/page_1/grove_1.png",

        drops: [
            {
                type: ["helmet", "weapon"],
                rarity: "common"
            },
            items.smallPotion
        ]
    },

    {
        id: "forest_2",
        name: "Bosque II",
        level: 3,
        boss: false,
        page: 1,
        fights: 5,

        monsters: [
            "beetle",
            "spider",
            "beetle",
            "spider",
            "ant"
        ],


        image: "assets/img/assets/card_dungeon/card_grove_2.png",
        background: "assets/img/backgrounds/page_1/grove_2.png",

        drops: [
            {
                type: ["leg", "boot"],
                rarity: "common"
            },
            items.smallPotion
        ]
    },

    {
        id: "forest_3",
        name: "Bosque III",
        level: 7,
        boss: false,
        page: 1,
        fights: 5,

        monsters: [
            "beaver",
            "crocodile",
            "beaver",
            "crocodile",
            "bear"
        ],

        image: "assets/img/assets/card_dungeon/card_grove_3.png",
        background: "assets/img/backgrounds/page_1/grove_3.png",

        drops: [
            {
                type: ["chest"],
                rarity: "common"
            },
            items.smallPotion
        ]
    },

    // Boss
    {
        id: "forest_boss",
        name: "Boss",
        isBoss: true,
        maxFloor: 1,
        level: 10,
        boss: true,
        page: 2,
        fights: 1,
        
        monsters: [
            "werewolf"
        ],

        image: "assets/img/assets/card_dungeon/card_grove_end.png",
        background: "assets/img/backgrounds/page_1/grove_end.png",

        drops: [
            {
                type: ["weapon"],
                rarity: "uncommon"
            },
            items.smallPotion
        ]
    },

    {
        id: "cave_1",
        name: "Caverna I",
        level: 13,
        boss: false,
        page: 3,
        fights: 5,

        monsters: [
            "goblin",
            "elf",
            "elf",
            "goblin",
            "troll"
        ],

        image: "assets/img/assets/card_dungeon/card_cave_1.png",
        background: "assets/img/backgrounds/page_2/cave_4.png",

        drops: [
            {
                type: ["leg"],
                rarity: "uncommon"
            },
            items.smallPotion
        ]
    },

    {
        id: "cave_2",
        name: "Caverna II",
        level: 15,
        boss: false,
        page: 3,
        fights: 5,

        monsters: [
            "goblin_2",
            "ogre_2",
            "goblin_2",
            "ogre_2",
            "ogre"
        ],

        image: "assets/img/assets/card_dungeon/card_cave_2.png",
        background: "assets/img/backgrounds/page_2/cave_5.png",

        drops: [
            {
                type: ["chest"],
                rarity: "uncommon"
            },
            items.smallPotion
        ]
    },

    {
        id: "cave_3",
        name: "Caverna III",
        level: 18,
        boss: false,
        page: 3,
        fights: 5,

        monsters: [
            "kid-zombie",
            "zombie",
            "kid-zombie",
            "zombie",
            "big-zombie"
        ],

        image: "assets/img/assets/card_dungeon/card_cave_3.png",
        background: "assets/img/backgrounds/page_2/cave_6.png",

        drops: [
            {
                type: ["helmet", "boot"],
                rarity: "uncommon"
            },
            items.smallPotion
        ]
    },

    // Boss
    {
        id: "cave_boss",
        name: "Boss",
        isBoss: true,
        maxFloor: 1,
        level: 20,
        boss: true,
        page: 4,
        fights: 1,
        
        monsters: [
            "skullKingIII"
        ],

        image: "assets/img/assets/card_dungeon/card_cave_end.png",
        background: "assets/img/backgrounds/page_2/cave_end.png",

        drops: [
            {
                type: ["weapon"],
                rarity: "rare"
            },
            items.mediumPotion
        ]
    },

    {
        id: "cave_4",
        name: "Caverna IV",
        level: 23,
        boss: false,
        page: 5,
        fights: 4,

        monsters: [
            "duende_1",
            "duende_2",
            "duende_3",
            "duende_4"
        ],

        image: "assets/img/assets/card_dungeon/card_cave_4.png",
        background: "assets/img/backgrounds/page_3/cave_7.png",

        drops: [
            {
                type: ["boot"],
                rarity: "rare"
            },
            items.smallPotion
        ]
    },

    {
        id: "cave_5",
        name: "Caverna V",
        level: 25,
        boss: false,
        page: 5,
        fights: 3,
        
        monsters: [
            "scarab",
            "scorpion",
            "basilisk"
        ],

        image: "assets/img/assets/card_dungeon/card_cave_5.png",
        background: "assets/img/backgrounds/page_3/cave_8.png",

        drops: [
            {
                type: ["leg"],
                rarity: "rare"
            },
            items.smallPotion
        ]
    },

    {
        id: "cave_6",
        name: "Caverna VI",
        level: 27,
        boss: false,
        page: 5,
        fights: 4,
        
        monsters: [
            "goblin_donatello",
            "goblin_leonardo",
            "goblin_michelangelo",
            "goblin_rafael"
        ],

        image: "assets/img/assets/card_dungeon/card_cave_6.png",
        background: "assets/img/backgrounds/page_3/cave_9.png",

        drops: [
            {
                type: ["helmet"],
                rarity: "rare"
            },
            items.smallPotion
        ]
    },

    // Boss
    {
        id: "cave_boss2",
        name: "Boss",
        isBoss: true,
        maxFloor: 1,
        level: 30,
        boss: true,
        page: 6,
        fights: 1,
        
        monsters: [
            "king-the-goblins"
        ],

        image: "assets/img/assets/card_dungeon/card_cave_end_2.png",
        background: "assets/img/backgrounds/page_3/cave_end2.png",

        drops: [
            {
                type: ["chest"],
                rarity: "rare"
            },
            items.mediumPotion
        ]
    },

    {
        id: "ocean_1",
        name: "Oceano I",
        level: 33,
        boss: false,
        page: 7,
        fights: 5,

        monsters: [
            "crab",
            "lobster",
            "crab",
            "lobster",
            "crab_knife"
        ],

        image: "assets/img/assets/card_dungeon/card_ocean_10.png",
        background: "assets/img/backgrounds/page_4/ocean_10.png",

        drops: [
            {
                // type: ["boot"],
                // rarity: "rare"
            },
            items.mediumPotion
        ]
    },

    {
        id: "ocean_2",
        name: "Oceano II",
        level: 35,
        boss: false,
        page: 7,
        fights: 5,

        monsters: [
            "mermaid",
            "nautilus",
            "mermaid",
            "nautilus",
            "octopus"
        ],

        image: "assets/img/assets/card_dungeon/card_ocean_11.png",
        background: "assets/img/backgrounds/page_4/ocean_11.png",

        drops: [
            {
                // type: ["boot"],
                // rarity: "rare"
            },
            items.mediumPotion
        ]
    },

    {
        id: "ocean_3",
        name: "Oceano III",
        level: 37,
        boss: false,
        page: 7,
        fights: 7,

        monsters: [
            "reptile_1",
            "reptile_2",
            "reptile_3",
            "reptile_4",
            "reptile_5",
            "reptile_6",
            "reptile_7"
        ],

        image: "assets/img/assets/card_dungeon/card_ocean_12.png",
        background: "assets/img/backgrounds/page_4/ocean_12.png",

        drops: [
            {
            },
            items.mediumPotion
        ]
    },

    // Boss
    {
        id: "ocean_boss",
        name: "Boss",
        isBoss: true,
        maxFloor: 1,
        level: 40,
        boss: true,
        page: 8,
        fights: 1,
        
        monsters: [
            "king_of_the_reptiles"
        ],

        image: "assets/img/assets/card_dungeon/card_ocean_end.png",
        background: "assets/img/backgrounds/page_4/ocean_end.png",

        drops: [
            {
                type: ["boot"],
                rarity: "mystic"
            },
            items.tripleMediumPotion
        ]
    },

    {
        id: "desert_1",
        name: "Deserto I",
        level: 43,
        boss: false,
        page: 9,
        fights: 5,

        monsters: [
            "tree_men",
            "sludge_men",
            "sludge_men",
            "tree_men",
            "tree_men_warrior",
        ],

        image: "assets/img/assets/card_dungeon/card_desert_1.png",
        background: "assets/img/backgrounds/page_5/desert_13.png",

        drops: [
            {
            },
            items.mediumPotion
        ]
    },

    {
        id: "desert_2",
        name: "Deserto II",
        level: 45,
        boss: false,
        page: 9,
        fights: 5,

        monsters: [
            "swamp_spectral_wolf",
            "swamp_spectral_wolf",
            "sandman",
            "sandman",
            "shadowy_tree",
        ],

        image: "assets/img/assets/card_dungeon/card_desert_2.png",
        background: "assets/img/backgrounds/page_5/desert_14.png",

        drops: [
            {
            },
            items.mediumPotion
        ]
    },

    {
        id: "desert_3",
        name: "Deserto III",
        level: 47,
        boss: false,
        page: 9,
        fights: 5,

        monsters: [
            "gargoyle",
            "gargoyle",
            "gargoyle",
            "orc_warrior",
            "cyclops",
        ],

        image: "assets/img/assets/card_dungeon/card_desert_3.png",
        background: "assets/img/backgrounds/page_5/desert_15.png",

        drops: [
            {
            },
            items.mediumPotion
        ]
    },

    // Boss
    {
        id: "desert_boss",
        name: "Boss",
        isBoss: true,
        maxFloor: 1,
        level: 50,
        boss: true,
        page: 10,
        fights: 1,
        
        monsters: [
            "minotaur"
        ],

        image: "assets/img/assets/card_dungeon/card_desert_end.png",
        background: "assets/img/backgrounds/page_5/desert_end.png",

        drops: [
            {
                type: ["leg"],
                rarity: "mystic"
            },
            items.tripleMediumPotion
        ]
    },

    {
        id: "vulcan_1",
        name: "Vulcão I",
        level: 53,
        boss: false,
        page: 11,
        fights: 5,

        monsters: [
            "skeletal_steed",
            "skeletal_steed",
            "colossal_thorn_beast",
            "colossal_thorn_beast",
            "colossal_werewolf",
        ],

        image: "assets/img/assets/card_dungeon/card_vulcan_1.png",
        background: "assets/img/backgrounds/page_6/vulcan_16.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.tcRubiUm,
            enchantmentStone.tcRubiDois,
            enchantmentStone.tcRubiTres
        ]
    },

    {
        id: "vulcan_2",
        name: "Vulcão II",
        level: 55,
        boss: false,
        page: 11,
        fights: 5,

        monsters: [
            "blood_monster",
            "colossal_beast",
            "blood_monster",
            "colossal_beast",
            "stalker_zombie",
        ],

        image: "assets/img/assets/card_dungeon/card_vulcan_2.png",
        background: "assets/img/backgrounds/page_6/vulcan_17.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.tcRubiUm,
            enchantmentStone.tcRubiDois,
            enchantmentStone.tcRubiTres
        ]
    },

    {
        id: "vulcan_3",
        name: "Vulcão III",
        level: 57,
        boss: false,
        page: 11,
        fights: 5,

        monsters: [
            "orc_zumbie",
            "orc_zumbie",
            "zombie_ghoul",
            "zombie_ghoul",
            "demonic_ogre",
        ],

        image: "assets/img/assets/card_dungeon/card_vulcan_3.png",
        background: "assets/img/backgrounds/page_6/vulcan_18.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.tcRubiUm,
            enchantmentStone.tcRubiDois,
            enchantmentStone.tcRubiTres
        ]
    },
    
    // Boss
    {
        id: "vulcan_boss",
        name: "Boss",
        isBoss: true,
        maxFloor: 1,
        level: 60,
        boss: true,
        page: 12,
        fights: 1,
        
        monsters: [
            "headless_warrior"
        ],

        image: "assets/img/assets/card_dungeon/card_vulcan_end.png",
        background: "assets/img/backgrounds/page_6/vulcan_end.png",

        drops: [
            {
                type: ["chest"],
                rarity: "mystic"
            },
            items.tripleMediumPotion
        ]
    },

    {
        id: "mansion_1",
        name: "Mansão I",
        level: 63,
        boss: false,
        page: 13,
        fights: 5,

        monsters: [
            "queen_dead",
            "queen_dead",
            "reptilian_ghoul",
            "reptilian_ghoul",
            "lich_wraith",
        ],

        image: "assets/img/assets/card_dungeon/card_mansion_1.png",
        background: "assets/img/backgrounds/page_7/mansion_1.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.olbapImperialUm,
            enchantmentStone.olbapImperialDois,
            enchantmentStone.olbapImperialTres
        ]
    },

    {
        id: "mansion_2",
        name: "Mansão II",
        level: 65,
        boss: false,
        page: 13,
        fights: 3,

        monsters: [
            "employee_vampire",
            "employee2_vampire",
            "employee3_vampire"
        ],

        image: "assets/img/assets/card_dungeon/card_mansion_2.png",
        background: "assets/img/backgrounds/page_7/mansion_2.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.olbapImperialUm,
            enchantmentStone.olbapImperialDois,
            enchantmentStone.olbapImperialTres
        ]
    },

    {
        id: "mansion_3",
        name: "Mansão III",
        level: 67,
        boss: false,
        page: 13,
        fights: 4,

        monsters: [
            "boy_vampire",
            "girl_vampire",
            "vampire_2",
            "vampire",

        ],

        image: "assets/img/assets/card_dungeon/card_mansion_3.png",
        background: "assets/img/backgrounds/page_7/mansion_3.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.olbapImperialUm,
            enchantmentStone.olbapImperialDois,
            enchantmentStone.olbapImperialTres
        ]
    },

    // Boss
    {
        id: "mansion_boss",
        name: "Boss",
        isBoss: true,
        maxFloor: 1,
        level: 70,
        boss: true,
        page: 14,
        fights: 1,
        
        monsters: [
            "dracula"
        ],

        image: "assets/img/assets/card_dungeon/card_mansion_end.png",
        background: "assets/img/backgrounds/page_7/mansion_end.png",

        drops: [
            {
                type: ["helmet"],
                rarity: "mystic"
            },
            items.tripleMediumPotion
        ]
    },

    {
        id: "Floresta_1",
        name: "Floresta I",
        level: 73,
        boss: false,
        page: 15,
        fights: 5,

        monsters: [
            "corpo_seco",
            "corpo_seco",
            "corpo_seco",
            "bradador",
            "jurupari",

        ],

        image: "assets/img/assets/card_dungeon/card_forest_1.png",
        background: "assets/img/backgrounds/page_8/forest_1.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.marcoSafiraUm,
            enchantmentStone.marcoSafiraDois,
            enchantmentStone.marcoSafiraTres
        ]
    },

    {
        id: "Floresta_2",
        name: "Floresta II",
        level: 75,
        boss: false,
        page: 15,
        fights: 5,

        monsters: [
            "saci",
            "bicho_papao",
            "bicho_papao",
            "saci",
            "boto",

        ],

        image: "assets/img/assets/card_dungeon/card_forest_2.png",
        background: "assets/img/backgrounds/page_8/forest_2.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.marcoSafiraUm,
            enchantmentStone.marcoSafiraDois,
            enchantmentStone.marcoSafiraTres
        ]
    },

    {
        id: "Floresta_3",
        name: "Floresta III",
        level: 77,
        boss: false,
        page: 15,
        fights: 5,

        monsters: [
            "boitata",
            "headless_mule",
            "boitata",
            "headless_mule",
            "curupira",

        ],

        image: "assets/img/assets/card_dungeon/card_forest_3.png",
        background: "assets/img/backgrounds/page_8/forest_3.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.marcoSafiraUm,
            enchantmentStone.marcoSafiraDois,
            enchantmentStone.marcoSafiraTres
        ]
    },

    // Boss
    {
        id: "Floresta_boss",
        name: "Boss",
        isBoss: true,
        maxFloor: 1,
        level: 80,
        boss: true,
        page: 16,
        fights: 1,
        
        monsters: [
            "cuca"
        ],

        image: "assets/img/assets/card_dungeon/card_forest_end.png",
        background: "assets/img/backgrounds/page_8/forest_end.png",

        drops: [
            {
                type: ["weapon"],
                rarity: "mystic"
            },
            items.tripleMediumPotion
        ]
    },

    {
        id: "hell_1",
        name: "Inferno I",
        level: 83,
        boss: false,
        page: 17,
        fights: 4,

        monsters: [
            "diabrete_um",
            "diabrete_dois",
            "diabrete_tres",
            "diabrete_quatro",

        ],

        image: "assets/img/assets/card_dungeon/card_hell_1.png",
        background: "assets/img/backgrounds/page_9/hell_1.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.essenciaTurmalinaUm,
            enchantmentStone.essenciaTurmalinaDois,
            enchantmentStone.essenciaTurmalinaTres
        ]
    },

    {
        id: "hell_2",
        name: "Inferno II",
        level: 85,
        boss: false,
        page: 17,
        fights: 4,

        monsters: [
            "gargoyle_um",
            "gargoyle_dois",
            "gargoyle_tres",
            "gargoyle_quatro",

        ],

        image: "assets/img/assets/card_dungeon/card_hell_2.png",
        background: "assets/img/backgrounds/page_9/hell_2.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.essenciaTurmalinaUm,
            enchantmentStone.essenciaTurmalinaDois,
            enchantmentStone.essenciaTurmalinaTres
        ]
    },

    {
        id: "hell_3",
        name: "Inferno III",
        level: 87,
        boss: false,
        page: 17,
        fights: 4,

        monsters: [
            "boy_demoniac",
            "girl_demoniac",
            "woman_demoniac",
            "men_demoniac",

        ],

        image: "assets/img/assets/card_dungeon/card_hell_3.png",
        background: "assets/img/backgrounds/page_9/hell_3.png",

        drops: [
            {
            },
            items.mediumPotion,
            enchantmentStone.essenciaTurmalinaUm,
            enchantmentStone.essenciaTurmalinaDois,
            enchantmentStone.essenciaTurmalinaTres
        ]
    },

    // Boss
    {
        id: "Hell_boss",
        name: "Boss",
        isBoss: true,
        maxFloor: 1,
        level: 90,
        boss: true,
        page: 18,
        fights: 1,
        
        monsters: [
            "daibo"
        ],

        image: "assets/img/assets/card_dungeon/card_hell_end.png",
        background: "assets/img/backgrounds/page_9/hell_end.png",

        drops: [
            {
                // type: ["weapon"],
                // rarity: "mystic"
            },
            items.tripleMediumPotion
        ]
    },

    // ============================================
    // FINAL SECRETO — NÍVEL 100
    // `hidden: true` faz essas duas ficarem fora da paginação normal —
    // só aparecem via DungeonView, na página especial revelada depois
    // da escolha da alma (luz ou trevas).
    // ============================================
    {
        id: "light_dungeon",
        name: "Portal da Luz",
        level: 100,
        boss: true,
        hidden: true,
        page: null,
        fights: 1,

        monsters: [
            "fallen_angel_of_light"
        ],

        image: "assets/img/assets/card_dungeon/card_light_combat.png",
        background: "assets/img/backgrounds/page_up_class/light_combat.png",

        drops: [
            {
            }
        ]
    },

    {
        id: "dark_dungeon",
        name: "Portal das Trevas",
        level: 100,
        boss: true,
        hidden: true,
        page: null,
        fights: 1,

        monsters: [
            "dark_fallen_angel"
        ],

        image: "assets/img/assets/card_dungeon/card_dark_combat.png",
        background: "assets/img/backgrounds/page_up_class/dark_combat.png",

        drops: [
            {
            }
        ]
    },
];

export default dungeons;