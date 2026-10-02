import rarities from "./rarities.js";

const weapons = {

/* ==========================================
       WARRIOR
========================================== */
    sword_common: {

        id: "sword_common",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/sword-rarity-comum.png",

        stats: {
            attack: 4,
            armor: 0,
            agility: -4,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 2
        },

        value: 120,
        sellValue: 60

    },

    sword_uncommon: {

        id: "sword_uncommon",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/sword-rarity-incomum.png",

        stats: {
            attack: 10,
            armor: 0,
            agility: -2,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 5
        },

        value: 360,
        sellValue: 180

    },

    sword_rare: {

        id: "sword_rare",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/sword-rarity-raro.png",

        stats: {
            attack: 17,
            armor: 0,
            agility: -2,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 6
        },

        value: 1080,
        sellValue: 540

    },

    sword_mystic: {

        id: "sword_mystic",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/sword-rarity-mistico.png",

        stats: {
            attack: 40,
            armor: 0,
            agility: -5,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 10
        },

        value: 3240,
        sellValue: 1620

    },

    sword_legendary: {

        id: "sword_legendary",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/sword-rarity-lendario.png",

        stats: {
            attack: 52,
            armor: 0,
            agility: -8,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 11
        },

        value: 0,
        sellValue: 18860

    },

    sword_ultraje: {

        id: "sword_ultraje",
        name: "Espada",
        type: "weapon",
        slot: "weapon",
        class: "warrior",
        weaponType: "sword",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/sword-rarity-ultraje.png",

        stats: {
            attack: 65,
            armor: 0,
            agility: -8,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 15
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       MAGE
========================================== */
    scepter_common: {

        id: "scepter_common",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/scepter-rarity-comum.png",
        stats: {
            attack: 6,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 2
        },
        value: 120,
        sellValue: 60
    },

    scepter_uncommon: {

        id: "scepter_uncommon",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/scepter-rarity-incomum.png",
        stats: {
            attack: 12,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 5
        },
        value: 360,
        sellValue: 180
    },

    scepter_rare: {

        id: "scepter_rare",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/scepter-rarity-raro.png",
        stats: {
            attack: 25,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 6
        },
        value: 1080,
        sellValue: 540
    },

    scepter_mystic: {

        id: "scepter_mystic",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/scepter-rarity-mistico.png",
        stats: {
            attack: 38,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 10
        },
        value: 3240,
        sellValue: 1620  
    },

    scepter_legendary: {

        id: "scepter_legendary",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/scepter-rarity-lendario.png",
        stats: {
            attack: 48,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 11
        },
        value: 0,
        sellValue: 18860
    },

    scepter_ultraje: {

        id: "scepter_ultraje",
        name: "Cetro",
        type: "weapon",
        slot: "weapon",
        class: "mage",
        weaponType: "scepter",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/scepter-rarity-ultraje.png",
        stats: {
            attack: 68,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 15
        },
        value: 0,
        sellValue: 0
    },

/* ==========================================
       ARCHER
========================================== */
    arch_common: {

        id: "arch_common",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/arch-rarity-comum.png",
        stats: {
            attack: 5,
            armor: 0,
            agility: 2,
            criticalChance: 2,
            lifeSteal: 0,
            penetration: 0
        },
        value: 120,
        sellValue: 60
    },

    arch_uncommon: {

        id: "arch_uncommon",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/arch-rarity-incomum.png",
        stats: {
            attack: 9,
            armor: 0,
            agility: 4,
            criticalChance: 5,
            lifeSteal: 0,
            penetration: 0
        },
        value: 360,
        sellValue: 180
    },

    arch_rare: {

        id: "arch_rare",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/arch-rarity-raro.png",
        stats: {
            attack: 18,
            armor: 0,
            agility: 7,
            criticalChance: 6,
            lifeSteal: 0,
            penetration: 0
        },
        value: 1080,
        sellValue: 540
    },

    arch_mystic: {

        id: "arch_mystic",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/arch-rarity-mistico.png",
        stats: {
            attack: 28,
            armor: 0,
            agility: 8,
            criticalChance: 10,
            lifeSteal: 0,
            penetration: 0
        },
        value: 3240,
        sellValue: 1620  
    },

    arch_legendary: {

        id: "arch_legendary",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/arch-rarity-lendario.png",
        stats: {
            attack: 40,
            armor: 0,
            agility: 9,
            criticalChance: 11,
            lifeSteal: 0,
            penetration: 0
        },
        value: 0,
        sellValue: 18860
    },

    arch_ultraje: {

        id: "arch_ultraje",
        name: "Arco",
        type: "weapon",
        slot: "weapon",
        class: "archer",
        weaponType: "arch",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/arch-rarity-ultraje.png",
        stats: {
            attack: 55,
            armor: 0,
            agility: 11,
            criticalChance: 15,
            lifeSteal: 0,
            penetration: 0
        },
        value: 0,
        sellValue: 0
    },

/* ==========================================
       BARBARIAN
========================================== */
    ax_common: {

        id: "ax_common",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/ax-rarity-comum.png",
        stats: {
            attack: 4,
            armor: 0,
            agility: 1,
            criticalChance: 0,
            lifeSteal: 2,
            penetration: 0,
            absorption: 0
        },
        value: 120,
        sellValue: 60
    },

    ax_uncommon: {

        id: "ax_uncommon",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/ax-rarity-incomum.png",
        stats: {
            attack: 9,
            armor: 0,
            agility: 2,
            criticalChance: 0,
            lifeSteal: 5,
            penetration: 0,
            absorption: 0
        },
        value: 360,
        sellValue: 180
    },

    ax_rare: {

        id: "ax_rare",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/ax-rarity-raro.png",
        stats: {
            attack: 15,
            armor: 0,
            agility: 3,
            criticalChance: 0,
            lifeSteal: 6,
            penetration: 0,
            absorption: 0
        },
        value: 1080,
        sellValue: 540
    },

    ax_mystic: {

        id: "ax_mystic",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/ax-rarity-mistico.png",
        stats: {
            attack: 30,
            armor: 0,
            agility: 5,
            criticalChance: 0,
            lifeSteal: 10,
            penetration: 0,
            absorption: 0
        },
        value: 3240,
        sellValue: 1620
    },

    ax_legendary: {

        id: "ax_legendary",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/ax-rarity-lendario.png",
        stats: {
            attack: 42,
            armor: 0,
            agility: 7,
            criticalChance: 0,
            lifeSteal: 11,
            penetration: 0,
            absorption: 0
        },
        value: 0,
        sellValue: 18860
    },

    ax_ultraje: {

        id: "ax_ultraje",
        name: "Machado",
        type: "weapon",
        slot: "weapon",
        class: "barbarian",
        weaponType: "ax",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/ax-rarity-ultraje.png",
        stats: {
            attack: 57,
            armor: 0,
            agility: 9,
            criticalChance: 0,
            lifeSteal: 15,
            penetration: 0,
            absorption: 0
        },
        value: 0,
        sellValue: 0
    },

/* ==========================================
       PUTRID
========================================== */
    stink_common: {

        id: "stink_common",
        name: "Fedor",
        type: "weapon",
        slot: "weapon",
        class: "putrid",
        weaponType: "stink",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/stink-rarity-comum.png",

        stats: {
            attack: 4,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            miasmaChance: 2
        },

        value: 120,
        sellValue: 60

    },

    stink_uncommon: {

        id: "stink_uncommon",
        name: "Fedor",
        type: "weapon",
        slot: "weapon",
        class: "putrid",
        weaponType: "stink",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/stink-rarity-incomum.png",

        stats: {
            attack: 9,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            miasmaChance: 5
        },

        value: 360,
        sellValue: 180

    },

    stink_rare: {

        id: "stink_rare",
        name: "Fedor",
        type: "weapon",
        slot: "weapon",
        class: "putrid",
        weaponType: "stink",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/stink-rarity-rare.png",

        stats: {
            attack: 15,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            miasmaChance: 6
        },

        value: 1080,
        sellValue: 540

    },

    stink_mystic: {

        id: "stink_mystic",
        name: "Fedor",
        type: "weapon",
        slot: "weapon",
        class: "putrid",
        weaponType: "stink",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/stink-rarity-mistico.png",

        stats: {
            attack: 29,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            miasmaChance: 10
        },

        value: 3240,
        sellValue: 1620

    },

    stink_legendary: {

        id: "stink_legendary",
        name: "Fedor",
        type: "weapon",
        slot: "weapon",
        class: "putrid",
        weaponType: "stink",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/stink-rarity-lendario.png",

        stats: {
            attack: 41,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            miasmaChance: 11
        },

        value: 0,
        sellValue: 18860

    },

    stink_ultraje: {

        id: "stink_ultraje",
        name: "Fedor",
        type: "weapon",
        slot: "weapon",
        class: "putrid",
        weaponType: "stink",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/stink-rarity-ultraje.png",

        stats: {
            attack: 56,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            miasmaChance: 15
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       MIMIC
========================================== */
    mirror_common: {

        id: "mirror_common",
        name: "Espelho",
        type: "weapon",
        slot: "weapon",
        class: "mimic",
        weaponType: "mirror",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/mirror-rarity-comum.png",

        stats: {
            attack: 3,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            reflection: 1
        },

        value: 120,
        sellValue: 60

    },

    mirror_uncommon: {

        id: "mirror_uncommon",
        name: "Espelho",
        type: "weapon",
        slot: "weapon",
        class: "mimic",
        weaponType: "mirror",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/mirror-rarity-incomum.png",

        stats: {
            attack: 7,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            reflection: 2
        },

        value: 360,
        sellValue: 180

    },

    mirror_rare: {

        id: "mirror_rare",
        name: "Espelho",
        type: "weapon",
        slot: "weapon",
        class: "mimic",
        weaponType: "mirror",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/mirror-rarity-rare.png",

        stats: {
            attack: 13,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            reflection: 3
        },

        value: 1080,
        sellValue: 540

    },

    mirror_mystic: {

        id: "mirror_mystic",
        name: "Espelho",
        type: "weapon",
        slot: "weapon",
        class: "mimic",
        weaponType: "mirror",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/mirror-rarity-mistico.png",

        stats: {
            attack: 25,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            reflection: 4
        },

        value: 3240,
        sellValue: 1620

    },

    mirror_legendary: {

        id: "mirror_legendary",
        name: "Espelho",
        type: "weapon",
        slot: "weapon",
        class: "mimic",
        weaponType: "mirror",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/mirror-rarity-lendario.png",

        stats: {
            attack: 36,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            reflection: 5
        },

        value: 0,
        sellValue: 18860

    },

    mirror_ultraje: {

        id: "mirror_ultraje",
        name: "Espelho",
        type: "weapon",
        slot: "weapon",
        class: "mimic",
        weaponType: "mirror",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/mirror-rarity-ultraje.png",

        stats: {
            attack: 50,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            reflection: 6
        },

        value: 0,
        sellValue: 0

    }

};

export default weapons;