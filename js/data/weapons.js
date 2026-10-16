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
            attack: 50,
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
            attack: 52,
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
            attack: 40,
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
            attack: 48,
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
            attack: 58,
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

    },

/* ==========================================
       LOUCA (Marreta Biônica)
========================================== */
    sledgehammer_common: {

        id: "sledgehammer_common",
        name: "Marreta Biônica",
        type: "weapon",
        slot: "weapon",
        class: "crazy",
        weaponType: "sledgehammer",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/sledgehammer-rarity-comum.png",

        stats: {
            attack: 6,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            confusionChance: 2
        },

        value: 120,
        sellValue: 60

    },

    sledgehammer_uncommon: {

        id: "sledgehammer_uncommon",
        name: "Marreta Biônica",
        type: "weapon",
        slot: "weapon",
        class: "crazy",
        weaponType: "sledgehammer",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/sledgehammer-rarity-incomum.png",

        stats: {
            attack: 13,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            confusionChance: 5
        },

        value: 360,
        sellValue: 180

    },

    sledgehammer_rare: {

        id: "sledgehammer_rare",
        name: "Marreta Biônica",
        type: "weapon",
        slot: "weapon",
        class: "crazy",
        weaponType: "sledgehammer",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/sledgehammer-rarity-rare.png",

        stats: {
            attack: 22,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            confusionChance: 6
        },

        value: 1080,
        sellValue: 540

    },

    sledgehammer_mystic: {

        id: "sledgehammer_mystic",
        name: "Marreta Biônica",
        type: "weapon",
        slot: "weapon",
        class: "crazy",
        weaponType: "sledgehammer",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/sledgehammer-rarity-mistico.png",

        stats: {
            attack: 55,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            confusionChance: 10
        },

        value: 3240,
        sellValue: 1620

    },

    sledgehammer_legendary: {

        id: "sledgehammer_legendary",
        name: "Marreta Biônica",
        type: "weapon",
        slot: "weapon",
        class: "crazy",
        weaponType: "sledgehammer",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/sledgehammer-rarity-lendario.png",

        stats: {
            attack: 66,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            confusionChance: 11
        },

        value: 0,
        sellValue: 18860

    },

    sledgehammer_ultraje: {

        id: "sledgehammer_ultraje",
        name: "Marreta Biônica",
        type: "weapon",
        slot: "weapon",
        class: "crazy",
        weaponType: "sledgehammer",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/sledgehammer-rarity-ultraje.png",

        stats: {
            attack: 80,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            confusionChance: 15
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       ELETRO (Bastão de Tesla)
========================================== */
    teslacoil_common: {

        id: "teslacoil_common",
        name: "Bastão de Tesla",
        type: "weapon",
        slot: "weapon",
        class: "spark",
        weaponType: "teslacoil",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/tesla-coil-rarity-comum.png",

        stats: {
            attack: 6,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            paralysisChance: 2
        },

        value: 120,
        sellValue: 60

    },

    teslacoil_uncommon: {

        id: "teslacoil_uncommon",
        name: "Bastão de Tesla",
        type: "weapon",
        slot: "weapon",
        class: "spark",
        weaponType: "teslacoil",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/tesla-coil-rarity-incomum.png",

        stats: {
            attack: 12,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            paralysisChance: 5
        },

        value: 360,
        sellValue: 180

    },

    teslacoil_rare: {

        id: "teslacoil_rare",
        name: "Bastão de Tesla",
        type: "weapon",
        slot: "weapon",
        class: "spark",
        weaponType: "teslacoil",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/tesla-coil-rarity-rare.png",

        stats: {
            attack: 22,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            paralysisChance: 6
        },

        value: 1080,
        sellValue: 540

    },

    teslacoil_mystic: {

        id: "teslacoil_mystic",
        name: "Bastão de Tesla",
        type: "weapon",
        slot: "weapon",
        class: "spark",
        weaponType: "teslacoil",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/tesla-coil-rarity-mistico.png",

        stats: {
            attack: 34,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            paralysisChance: 10
        },

        value: 3240,
        sellValue: 1620

    },

    teslacoil_legendary: {

        id: "teslacoil_legendary",
        name: "Bastão de Tesla",
        type: "weapon",
        slot: "weapon",
        class: "spark",
        weaponType: "teslacoil",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/tesla-coil-rarity-lendario.png",

        stats: {
            attack: 44,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            paralysisChance: 11
        },

        value: 0,
        sellValue: 18860

    },

    teslacoil_ultraje: {

        id: "teslacoil_ultraje",
        name: "Bastão de Tesla",
        type: "weapon",
        slot: "weapon",
        class: "spark",
        weaponType: "teslacoil",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/tesla-coil-rarity-ultraje.png",

        stats: {
            attack: 60,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            paralysisChance: 15
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       SAMURAI (Katana)
========================================== */
    katana_common: {

        id: "katana_common",
        name: "Katana",
        type: "weapon",
        slot: "weapon",
        class: "samurai",
        weaponType: "katana",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/katana-rarity-comum.png",

        stats: {
            attack: 5,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            doubleStrikeChance: 2
        },

        value: 120,
        sellValue: 60

    },

    katana_uncommon: {

        id: "katana_uncommon",
        name: "Katana",
        type: "weapon",
        slot: "weapon",
        class: "samurai",
        weaponType: "katana",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/katana-rarity-incomum.png",

        stats: {
            attack: 10,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            doubleStrikeChance: 5
        },

        value: 360,
        sellValue: 180

    },

    katana_rare: {

        id: "katana_rare",
        name: "Katana",
        type: "weapon",
        slot: "weapon",
        class: "samurai",
        weaponType: "katana",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/katana-rarity-rare.png",

        stats: {
            attack: 18,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            doubleStrikeChance: 6
        },

        value: 1080,
        sellValue: 540

    },

    katana_mystic: {

        id: "katana_mystic",
        name: "Katana",
        type: "weapon",
        slot: "weapon",
        class: "samurai",
        weaponType: "katana",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/katana-rarity-mistico.png",

        stats: {
            attack: 32,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            doubleStrikeChance: 10
        },

        value: 3240,
        sellValue: 1620

    },

    katana_legendary: {

        id: "katana_legendary",
        name: "Katana",
        type: "weapon",
        slot: "weapon",
        class: "samurai",
        weaponType: "katana",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/katana-rarity-lendario.png",

        stats: {
            attack: 40,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            doubleStrikeChance: 11
        },

        value: 0,
        sellValue: 18860

    },

    katana_ultraje: {

        id: "katana_ultraje",
        name: "Katana",
        type: "weapon",
        slot: "weapon",
        class: "samurai",
        weaponType: "katana",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/katana-rarity-ultraje.png",

        stats: {
            attack: 50,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            doubleStrikeChance: 15
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       SINGULARIDADE (Marreta Gravítica)
========================================== */
    hammer_common: {

        id: "hammer_common",
        name: "Marreta Gravítica",
        type: "weapon",
        slot: "weapon",
        class: "singularity",
        weaponType: "hammer",
        rarity: rarities.common,
        icon: "assets/img/assets/items/weapons/hammer-rarity-comum.png",

        stats: {
            attack: 5,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            gravityChance: 2
        },

        value: 120,
        sellValue: 60

    },

    hammer_uncommon: {

        id: "hammer_uncommon",
        name: "Marreta Gravítica",
        type: "weapon",
        slot: "weapon",
        class: "singularity",
        weaponType: "hammer",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/weapons/hammer-rarity-incomum.png",

        stats: {
            attack: 10,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            gravityChance: 5
        },

        value: 360,
        sellValue: 180

    },

    hammer_rare: {

        id: "hammer_rare",
        name: "Marreta Gravítica",
        type: "weapon",
        slot: "weapon",
        class: "singularity",
        weaponType: "hammer",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/weapons/hammer-rarity-rare.png",

        stats: {
            attack: 17,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            gravityChance: 6
        },

        value: 1080,
        sellValue: 540

    },

    hammer_mystic: {

        id: "hammer_mystic",
        name: "Marreta Gravítica",
        type: "weapon",
        slot: "weapon",
        class: "singularity",
        weaponType: "hammer",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/weapons/hammer-rarity-mistico.png",

        stats: {
            attack: 32,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            gravityChance: 10
        },

        value: 3240,
        sellValue: 1620

    },

    hammer_legendary: {

        id: "hammer_legendary",
        name: "Marreta Gravítica",
        type: "weapon",
        slot: "weapon",
        class: "singularity",
        weaponType: "hammer",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/weapons/hammer-rarity-lendario.png",

        stats: {
            attack: 44,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            gravityChance: 11
        },

        value: 0,
        sellValue: 18860

    },

    hammer_ultraje: {

        id: "hammer_ultraje",
        name: "Marreta Gravítica",
        type: "weapon",
        slot: "weapon",
        class: "singularity",
        weaponType: "hammer",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/weapons/hammer-rarity-ultraje.png",

        stats: {
            attack: 59,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            gravityChance: 15
        },

        value: 0,
        sellValue: 0

    }

};

export default weapons;