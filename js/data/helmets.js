import rarities from "./rarities.js";

const helmets = {

/* ==========================================
       WARRIOR
========================================== */
    helmet_warrior_common: {

        id: "helmet_warrior_common",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-comum.png",

        stats: {
            armor: 1,
            absorption: 2
        },

        value: 50,
        sellValue: 20

    },

    helmet_warrior_uncommon: {

        id: "helmet_warrior_uncommon",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-incomum.png",

        stats: {
            armor: 2,
            absorption: 3
        },

        value: 600,
        sellValue: 200

    },

    helmet_warrior_rare: {

        id: "helmet_warrior_rare",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-rare.png",

        stats: {
            armor: 3,
            absorption: 4
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_warrior_mystic: {

        id: "helmet_warrior_mystic",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-mistico.png",

        stats: {
            armor: 6,
            absorption: 6
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_warrior_legendary: {

        id: "helmet_warrior_legendary",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-lendario.png",

        stats: {
            armor: 4,
            absorption: 8.1
        },

        value: 0,
        sellValue: 13240

    },

    helmet_warrior_ultraje: {

        id: "helmet_warrior_ultraje",
        name: "Capacete",
        type: "armor",
        slot: "helmet",
        class: "warrior",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-warrior-rarity-ultraje.png",

        stats: {
            armor: 8,
            absorption: 10
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       MAGE
========================================== */
    helmet_mage_common: {

        id: "helmet_mage_common",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-comum.png",

        stats: {
            armor: 2,
            penetration: 2
        },

        value: 50,
        sellValue: 20

    },

    helmet_mage_uncommon: {

        id: "helmet_mage_uncommon",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-incomum.png",

        stats: {
            armor: 4,
            penetration: 3
        },

        value: 600,
        sellValue: 200

    },

    helmet_mage_rare: {

        id: "helmet_mage_rare",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-rare.png",

        stats: {
            armor: 6,
            penetration: 4
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_mage_mystic: {

        id: "helmet_mage_mystic",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-mistico.png",

        stats: {
            armor: 9,
            penetration: 6
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_mage_legendary: {

        id: "helmet_mage_legendary",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-lendario.png",

        stats: {
            armor: 9,
            penetration: 4.5
        },

        value: 0,
        sellValue: 13240
    },

    helmet_mage_ultraje: {

        id: "helmet_mage_ultraje",
        name: "Gorro",
        type: "armor",
        slot: "helmet",
        class: "mage",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-mage-rarity-ultraje.png",

        stats: {
            armor: 18,
            penetration: 10
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       ARCHER
========================================== */
    helmet_archer_common: {

        id: "helmet_archer_common",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-comum.png",

        stats: {
            armor: 2,
            criticalChance: 2
        },

        value: 50,
        sellValue: 20

    },

    helmet_archer_uncommon: {

        id: "helmet_archer_uncommon",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-incomum.png",

        stats: {
            armor: 4,
            criticalChance: 3
        },

        value: 600,
        sellValue: 200

    },

    helmet_archer_rare: {

        id: "helmet_archer_rare",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-rare.png",

        stats: {
            armor: 6,
            criticalChance: 4
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_archer_mystic: {

        id: "helmet_archer_mystic",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-mistico.png",

        stats: {
            armor: 9,
            criticalChance: 6
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_archer_legendary: {

        id: "helmet_archer_legendary",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-lendario.png",

        stats: {
            armor: 7,
            criticalChance: 12.5
        },

        value: 0,
        sellValue: 13240

    },

    helmet_archer_ultraje: {

        id: "helmet_archer_ultraje",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "archer",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-archer-rarity-ultraje.png",

        stats: {
            armor: 18,
            criticalChance: 10
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       BARBARIAN
========================================== */
    helmet_barbarian_common: {

        id: "helmet_barbarian_common",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "barbarian",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-barbarian-rarity-comum.png",

        stats: {
            armor: 2,
            lifeSteal: 2
        },

        value: 50,
        sellValue: 20

    },

    helmet_barbarian_uncommon: {

        id: "helmet_barbarian_uncommon",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "barbarian",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-barbarian-rarity-incomum.png",

        stats: {
            armor: 4,
            lifeSteal: 3
        },

        value: 600,
        sellValue: 200

    },

    helmet_barbarian_rare: {

        id: "helmet_barbarian_rare",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "barbarian",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-barbarian-rarity-rare.png",

        stats: {
            armor: 5,
            lifeSteal: 4
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_barbarian_mystic: {

        id: "helmet_barbarian_mystic",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "barbarian",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-barbarian-rarity-mistico.png",

        stats: {
            armor: 8,
            lifeSteal: 6
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_barbarian_legendary: {

        id: "helmet_barbarian_legendary",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "barbarian",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-barbarian-rarity-lendario.png",

        stats: {
            armor: 7,
            lifeSteal: 20.6
        },

        value: 0,
        sellValue: 13240
    },

    helmet_barbarian_ultraje: {

        id: "helmet_barbarian_ultraje",
        name: "Elmo",
        type: "armor",
        slot: "helmet",
        class: "barbarian",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-barbarian-rarity-ultraje.png",

        stats: {
            armor: 16,
            lifeSteal: 10
        },

        value: 0,
        sellValue: 0
    },

/* ==========================================
       PUTRID
========================================== */
    helmet_putrid_common: {

        id: "helmet_putrid_common",
        name: "Touca",
        type: "armor",
        slot: "helmet",
        class: "putrid",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-putrid-rarity-comum.png",

        stats: {
            armor: 2,
            miasmaChance: 2
        },

        value: 50,
        sellValue: 20

    },

    helmet_putrid_uncommon: {

        id: "helmet_putrid_uncommon",
        name: "Touca",
        type: "armor",
        slot: "helmet",
        class: "putrid",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-putrid-rarity-incomum.png",

        stats: {
            armor: 4,
            miasmaChance: 3
        },

        value: 600,
        sellValue: 200

    },

    helmet_putrid_rare: {

        id: "helmet_putrid_rare",
        name: "Touca",
        type: "armor",
        slot: "helmet",
        class: "putrid",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-putrid-rarity-rare.png",

        stats: {
            armor: 6,
            miasmaChance: 4
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_putrid_mystic: {

        id: "helmet_putrid_mystic",
        name: "Touca",
        type: "armor",
        slot: "helmet",
        class: "putrid",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-putrid-rarity-mistico.png",

        stats: {
            armor: 10,
            miasmaChance: 6
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_putrid_legendary: {

        id: "helmet_putrid_legendary",
        name: "Touca",
        type: "armor",
        slot: "helmet",
        class: "putrid",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-putrid-rarity-lendario.png",

        stats: {
            armor: 9,
            miasmaChance: 8
        },

        value: 0,
        sellValue: 13240

    },

    helmet_putrid_ultraje: {

        id: "helmet_putrid_ultraje",
        name: "Touca",
        type: "armor",
        slot: "helmet",
        class: "putrid",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-putrid-rarity-ultraje.png",

        stats: {
            armor: 18,
            miasmaChance: 10
        },

        value: 0,
        sellValue: 0

    },

/* ==========================================
       MIMIC
========================================== */
    helmet_mimic_common: {

        id: "helmet_mimic_common",
        name: "Boina Vermelha",
        type: "armor",
        slot: "helmet",
        class: "mimic",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-mimic-rarity-comum.png",

        stats: {
            armor: 2,
            reflection: 1
        },

        value: 50,
        sellValue: 20

    },

    helmet_mimic_uncommon: {

        id: "helmet_mimic_uncommon",
        name: "Boina Vermelha",
        type: "armor",
        slot: "helmet",
        class: "mimic",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-mimic-rarity-incomum.png",

        stats: {
            armor: 4,
            reflection: 1
        },

        value: 600,
        sellValue: 200

    },

    helmet_mimic_rare: {

        id: "helmet_mimic_rare",
        name: "Boina Vermelha",
        type: "armor",
        slot: "helmet",
        class: "mimic",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-mimic-rarity-rare.png",

        stats: {
            armor: 6,
            reflection: 2
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_mimic_mystic: {

        id: "helmet_mimic_mystic",
        name: "Boina Vermelha",
        type: "armor",
        slot: "helmet",
        class: "mimic",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-mimic-rarity-mistico.png",

        stats: {
            armor: 12,
            reflection: 2
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_mimic_legendary: {

        id: "helmet_mimic_legendary",
        name: "Boina Vermelha",
        type: "armor",
        slot: "helmet",
        class: "mimic",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-mimic-rarity-lendario.png",

        stats: {
            armor: 11,
            reflection: 0.9
        },

        value: 0,
        sellValue: 13240

    },

    helmet_mimic_ultraje: {

        id: "helmet_mimic_ultraje",
        name: "Boina Vermelha",
        type: "armor",
        slot: "helmet",
        class: "mimic",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-mimic-rarity-ultraje.png",

        stats: {
            armor: 21,
            reflection: 4
        },

        value: 0,
        sellValue: 0

    },

    helmet_crazy_common: {

        id: "helmet_crazy_common",
        name: "Óculos Tontos",
        type: "armor",
        slot: "helmet",
        class: "crazy",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-crazy-rarity-comum.png",

        stats: {
            armor: 1,
            confusionChance: 2
        },

        value: 50,
        sellValue: 20

    },

    helmet_crazy_uncommon: {

        id: "helmet_crazy_uncommon",
        name: "Óculos Tontos",
        type: "armor",
        slot: "helmet",
        class: "crazy",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-crazy-rarity-incomum.png",

        stats: {
            armor: 2,
            confusionChance: 3
        },

        value: 600,
        sellValue: 200

    },

    helmet_crazy_rare: {

        id: "helmet_crazy_rare",
        name: "Óculos Tontos",
        type: "armor",
        slot: "helmet",
        class: "crazy",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-crazy-rarity-rare.png",

        stats: {
            armor: 3,
            confusionChance: 4
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_crazy_mystic: {

        id: "helmet_crazy_mystic",
        name: "Óculos Tontos",
        type: "armor",
        slot: "helmet",
        class: "crazy",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-crazy-rarity-mistico.png",

        stats: {
            armor: 6,
            confusionChance: 6
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_crazy_legendary: {

        id: "helmet_crazy_legendary",
        name: "Óculos Tontos",
        type: "armor",
        slot: "helmet",
        class: "crazy",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-crazy-rarity-lendario.png",

        stats: {
            armor: 3,
            confusionChance: 8.7
        },

        value: 0,
        sellValue: 13240

    },

    helmet_crazy_ultraje: {

        id: "helmet_crazy_ultraje",
        name: "Óculos Tontos",
        type: "armor",
        slot: "helmet",
        class: "crazy",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-crazy-rarity-ultraje.png",

        stats: {
            armor: 11,
            confusionChance: 10
        },

        value: 0,
        sellValue: 0

    },

    helmet_spark_common: {

        id: "helmet_spark_common",
        name: "Óculos Chocante",
        type: "armor",
        slot: "helmet",
        class: "spark",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-spark-rarity-comum.png",

        stats: {
            armor: 2,
            paralysisChance: 2
        },

        value: 50,
        sellValue: 20

    },

    helmet_spark_uncommon: {

        id: "helmet_spark_uncommon",
        name: "Óculos Chocante",
        type: "armor",
        slot: "helmet",
        class: "spark",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-spark-rarity-incomum.png",

        stats: {
            armor: 4,
            paralysisChance: 3
        },

        value: 600,
        sellValue: 200

    },

    helmet_spark_rare: {

        id: "helmet_spark_rare",
        name: "Óculos Chocante",
        type: "armor",
        slot: "helmet",
        class: "spark",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-spark-rarity-rare.png",

        stats: {
            armor: 6,
            paralysisChance: 4
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_spark_mystic: {

        id: "helmet_spark_mystic",
        name: "Óculos Chocante",
        type: "armor",
        slot: "helmet",
        class: "spark",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-spark-rarity-mistico.png",

        stats: {
            armor: 10,
            paralysisChance: 6
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_spark_legendary: {

        id: "helmet_spark_legendary",
        name: "Óculos Chocante",
        type: "armor",
        slot: "helmet",
        class: "spark",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-spark-rarity-lendario.png",

        stats: {
            armor: 9,
            paralysisChance: 7.6
        },

        value: 0,
        sellValue: 13240

    },

    helmet_spark_ultraje: {

        id: "helmet_spark_ultraje",
        name: "Óculos Chocante",
        type: "armor",
        slot: "helmet",
        class: "spark",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-spark-rarity-ultraje.png",

        stats: {
            armor: 18,
            paralysisChance: 10
        },

        value: 0,
        sellValue: 0

    },

    helmet_samurai_common: {

        id: "helmet_samurai_common",
        name: "Máscara Tengu",
        type: "armor",
        slot: "helmet",
        class: "samurai",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-samurai-rarity-comum.png",

        stats: {
            armor: 2,
            doubleStrikeChance: 2
        },

        value: 50,
        sellValue: 20

    },

    helmet_samurai_uncommon: {

        id: "helmet_samurai_uncommon",
        name: "Máscara Tengu",
        type: "armor",
        slot: "helmet",
        class: "samurai",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-samurai-rarity-incomum.png",

        stats: {
            armor: 4,
            doubleStrikeChance: 3
        },

        value: 600,
        sellValue: 200

    },

    helmet_samurai_rare: {

        id: "helmet_samurai_rare",
        name: "Máscara Tengu",
        type: "armor",
        slot: "helmet",
        class: "samurai",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-samurai-rarity-rare.png",

        stats: {
            armor: 6,
            doubleStrikeChance: 4
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_samurai_mystic: {

        id: "helmet_samurai_mystic",
        name: "Máscara Tengu",
        type: "armor",
        slot: "helmet",
        class: "samurai",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-samurai-rarity-mistico.png",

        stats: {
            armor: 10,
            doubleStrikeChance: 6
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_samurai_legendary: {

        id: "helmet_samurai_legendary",
        name: "Máscara Tengu",
        type: "armor",
        slot: "helmet",
        class: "samurai",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-samurai-rarity-lendario.png",

        stats: {
            armor: 9,
            doubleStrikeChance: 7.6
        },

        value: 0,
        sellValue: 13240

    },

    helmet_samurai_ultraje: {

        id: "helmet_samurai_ultraje",
        name: "Máscara Tengu",
        type: "armor",
        slot: "helmet",
        class: "samurai",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-samurai-rarity-ultraje.png",

        stats: {
            armor: 18,
            doubleStrikeChance: 10
        },

        value: 0,
        sellValue: 0

    },

    helmet_singularity_common: {

        id: "helmet_singularity_common",
        name: "Tiara Cósmica",
        type: "armor",
        slot: "helmet",
        class: "singularity",
        rarity: rarities.common,
        icon: "assets/img/assets/items/helmets/helmets-singularity-rarity-comum.png",

        stats: {
            armor: 2,
            gravityChance: 2
        },

        value: 50,
        sellValue: 20

    },

    helmet_singularity_uncommon: {

        id: "helmet_singularity_uncommon",
        name: "Tiara Cósmica",
        type: "armor",
        slot: "helmet",
        class: "singularity",
        rarity: rarities.uncommon,
        icon: "assets/img/assets/items/helmets/helmets-singularity-rarity-incomum.png",

        stats: {
            armor: 4,
            gravityChance: 3
        },

        value: 600,
        sellValue: 200

    },

    helmet_singularity_rare: {

        id: "helmet_singularity_rare",
        name: "Tiara Cósmica",
        type: "armor",
        slot: "helmet",
        class: "singularity",
        rarity: rarities.rare,
        icon: "assets/img/assets/items/helmets/helmets-singularity-rarity-rare.png",

        stats: {
            armor: 6,
            gravityChance: 4
        },

        value: 6480,
        sellValue: 2160

    },

    helmet_singularity_mystic: {

        id: "helmet_singularity_mystic",
        name: "Tiara Cósmica",
        type: "armor",
        slot: "helmet",
        class: "singularity",
        rarity: rarities.mystic,
        icon: "assets/img/assets/items/helmets/helmets-singularity-rarity-mistico.png",

        stats: {
            armor: 10,
            gravityChance: 6
        },

        value: 19440,
        sellValue: 6480

    },

    helmet_singularity_legendary: {

        id: "helmet_singularity_legendary",
        name: "Tiara Cósmica",
        type: "armor",
        slot: "helmet",
        class: "singularity",
        rarity: rarities.legendary,
        icon: "assets/img/assets/items/helmets/helmets-singularity-rarity-lendario.png",

        stats: {
            armor: 9,
            gravityChance: 10.5
        },

        value: 0,
        sellValue: 13240

    },

    helmet_singularity_ultraje: {

        id: "helmet_singularity_ultraje",
        name: "Tiara Cósmica",
        type: "armor",
        slot: "helmet",
        class: "singularity",
        rarity: rarities.ultraje,
        icon: "assets/img/assets/items/helmets/helmets-singularity-rarity-ultraje.png",

        stats: {
            armor: 18,
            gravityChance: 10
        },

        value: 0,
        sellValue: 0

    }

};

export default helmets;
