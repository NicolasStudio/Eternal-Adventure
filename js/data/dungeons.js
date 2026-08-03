import items from "./items.js";

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

];

export default dungeons;