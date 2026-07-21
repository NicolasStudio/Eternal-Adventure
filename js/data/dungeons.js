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
                rarity: "uncommon"
            },
            items.smallPotion
        ]
    },

    {
        id: "forest_2",
        name: "Bosque II",
        level: 5,
        boss: false,
        page: 1,
        fights: 5,

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
        level: 10,
        boss: false,
        page: 1,
        fights: 5,

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
        name: "Boss do Bosque",
        level: 15,
        boss: true,
        page: 2,
        fights: 1,

        image: "assets/img/assets/card_dungeon/card_grove_end.png",
        background: "assets/img/backgrounds/page_1/grove_end.png",

        drops: [
            {
                type: ["weapon"],
                rarity: "uncommon"
            },
            items.smallPotion
        ]
    }

];

export default dungeons;