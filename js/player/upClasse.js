const upClasse = {

    light_Warrior: {
        id: "light_warrior",
        name: "Guerreiro da Luz",
        image: "assets/img/assets/character/class_up/warrior/light-warrior.png",
        hud: "assets/img/assets/character/class_up/warrior/light-warrior-hud.png",
        description: "Você escolheu transcender para um guerreiro da luz.",
        states:{
            life: 170,
            attack: 14,
            armor: 64,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 10
        }
    },

    dark_Warrior: {
        id: "dark_warrior",
        name: "Guerreiro da Escuridão",
        image: "assets/img/assets/character/class_up/warrior/dark-warrior.png",
        hud: "assets/img/assets/character/class_up/warrior/dark-warrior-hud.png",
        description: "Você escolheu transcender para um guerreiro da escuridão.",
        states:{
            life: 154,
            attack: 25,
            armor: 45,
            agility: 2,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 7
        }
    },

    light_mage: {
        id: "light_mage",
        name: "Mago da Luz",
        image: "assets/img/assets/character/class_up/mage/light-mage.png",               
        hud: "assets/img/assets/character/class_up/mage/light-mage-hud.png",
        description: "Você escolheu transcender para um mago da luz.",
        states:{
            life: 20,
            attack: 42,
            armor: 6,
            agility: 13,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 15,
            absorption: 0
        }
    },

    dark_mage: {
        id: "dark_mage",
        name: "Mago da Escuridão",
        image: "assets/img/assets/character/class_up/mage/dark-mage.png",                
        hud: "assets/img/assets/character/class_up/mage/dark-mage-hud.png",
        description: "Você escolheu transcender para um mago da escuridão.",
        states:{
            life: 40,
            attack: 49,
            armor: 8,
            agility: 10,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 10,
            absorption: 0
        }
    },

    light_archer: {
        id: "light_archer",
        name: "Arqueiro da Luz",
        image: "assets/img/assets/character/class_up/archer/light-archer.png",
        hud: "assets/img/assets/character/class_up/archer/light-archer-hud.png",
        description: "Você escolheu transcender para um arqueiro da luz.",
        states:{
            life: 130,
            attack: 59,
            armor: 4,
            agility: 32,
            criticalChance: 7,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0
        }
    },

    dark_archer: {
        id: "dark_archer",
        name: "Arqueiro da Escuridão",
        image: "assets/img/assets/character/class_up/archer/dark-archer.png",
        hud: "assets/img/assets/character/class_up/archer/dark-archer-hud.png",
        description: "Você escolheu transcender para um arqueiro da escuridão.",
        states:{
            life: 111,
            attack: 55,
            armor: 0,
            agility: 38,
            criticalChance: 10,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0
        }
    },

    light_barbarian: {
        id: "light_barbarian",
        name: "Bárbaro da Luz",
        image: "assets/img/assets/character/class_up/barbarian/light-barbarian.png",
        hud: "assets/img/assets/character/class_up/barbarian/light-barbarian-hud.png",
        description: "Você escolheu transcender para um bárbaro da luz.",
        states:{
            life: 174,
            attack: 41,
            armor: 24,
            agility: 11,
            criticalChance: 0,
            lifeSteal: 7,
            penetration: 0,
            absorption: 0
        }
    },

    dark_barbarian: {
        id: "dark_barbarian",
        name: "Bárbaro da Escuridão",
        image: "assets/img/assets/character/class_up/barbarian/dark-barbarian.png",
        hud: "assets/img/assets/character/class_up/barbarian/dark-barbarian-hud.png",
        description: "Você escolheu transcender para um bárbaro da escuridão.",
        states:{
            life: 118,
            attack: 51,
            armor: 15,
            agility: 13,
            criticalChance: 0,
            lifeSteal: 10,
            penetration: 0,
            absorption: 0
        }
    },

    light_putrid: {
        id: "light_putrid",
        name: "Putrido da Luz",
        image: "assets/img/assets/character/class_up/putrid/light-putrid.png",
        hud: "assets/img/assets/character/class_up/putrid/light-putrid-hud.png",
        description: "Você escolheu transcender para um putrido da luz.",
        states:{
            life: 103,
            attack: 44,
            armor: 25,
            agility: 15,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            miasmaChance: 13
        }
    },

    dark_putrid: {
        id: "dark_putrid",
        name: "Putrido da Escuridão",
        image: "assets/img/assets/character/class_up/putrid/dark-putrid.png",
        hud: "assets/img/assets/character/class_up/putrid/dark-putrid-hud.png",
        description: "Você escolheu transcender para um putrido da escuridão.",
        states:{
            life: 126,
            attack: 35,
            armor: 22,
            agility: 23,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            miasmaChance: 10
        }
    },

    light_mimic:{
        id: "light_mimic",
        name: "Mímico da Luz",
        image: "assets/img/assets/character/class_up/mimic/light-mimic.png",
        hud: "assets/img/assets/character/class_up/mimic/light-mimic-hud.png",
        description: "Você escolheu transcender para um mímico da luz.",
        states:{
            life: 52,
            attack: 28,
            armor: 14,
            agility: 24,
            criticalChance: 5,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0
        }
    },

    dark_mimic:{
        id: "dark_mimic",
        name: "Mímico da Escuridão",
        image: "assets/img/assets/character/class_up/mimic/dark-mimic.png",
        hud: "assets/img/assets/character/class_up/mimic/dark-mimic-hud.png",
        description: "Você escolheu transcender para um mímico da escuridão.",
        states:{
            life: 38,
            attack: 18,
            armor: 16,
            agility: 16,
            criticalChance: 10,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0
        }
    },

    light_crazy:{
        id: "light_crazy",
        name: "Louca da Luz",
        image: "assets/img/assets/character/class_up/crazy/light-crazy.png",
        hud: "assets/img/assets/character/class_up/crazy/light-crazy-hud.png",
        description: "Você escolheu transcender para uma louca da luz.",
        states:{
            life: 48,
            attack: 52,
            armor: 3,
            agility: 35,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            confusionChance: 10
        }
    },

    dark_crazy:{
        id: "dark_crazy",
        name: "Louca da Escuridão",
        image: "assets/img/assets/character/class_up/crazy/dark-crazy.png",
        hud: "assets/img/assets/character/class_up/crazy/dark-crazy-hud.png",
        description: "Você escolheu transcender para uma louca da escuridão.",
        states:{
            life: 61,
            attack: 59,
            armor: 4,
            agility: 24,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            confusionChance: 7
        }
    },

    light_spark:{
        id: "light_spark",
        name: "Eletro da Luz",
        image: "assets/img/assets/character/class_up/spark/light-spark.png",
        hud: "assets/img/assets/character/class_up/spark/light-spark-hud.png",
        description: "Você escolheu transcender para um eletro da luz.",
        states:{
            life: 34,
            attack: 45,
            armor: 8,
            agility: 10,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            paralysisChance: 10
        }
    },

    dark_spark:{
        id: "dark_spark",
        name: "Eletro da Escuridão",
        image: "assets/img/assets/character/class_up/spark/dark-spark.png",
        hud: "assets/img/assets/character/class_up/spark/dark-spark-hud.png",
        description: "Você escolheu transcender para um eletro da escuridão.",
        states:{
            life: 41,
            attack: 45,
            armor: 10,
            agility: 10,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            paralysisChance: 8
        }
    },

    light_samurai:{
        id: "light_samurai",
        name: "Samurai da Luz",
        image: "assets/img/assets/character/class_up/samurai/light-samurai.png",
        hud: "assets/img/assets/character/class_up/samurai/light-samurai-hud.png",
        description: "Você escolheu transcender para um samurai da luz.",
        states:{
            life: 82,
            attack: 38,
            armor: 18,
            agility: 20,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            doubleStrikeChance: 12
        }
    },

    dark_samurai:{
        id: "dark_samurai",
        name: "Samurai da Escuridão",
        image: "assets/img/assets/character/class_up/samurai/dark-samurai.png",
        hud: "assets/img/assets/character/class_up/samurai/dark-samurai-hud.png",
        description: "Você escolheu transcender para um samurai da escuridão.",
        states:{
            life: 79,
            attack: 40,
            armor: 12,
            agility: 13,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            doubleStrikeChance: 9
        }
    },

    light_singularity:{
        id: "light_singularity",
        name: "Singularidade da Luz",
        image: "assets/img/assets/character/class_up/singularity/light-singularity.png",
        hud: "assets/img/assets/character/class_up/singularity/light-singularity-hud.png",
        description: "Você escolheu transcender para uma singularidade da luz.",
        states:{
            life: 143,
            attack: 52,
            armor: 24,
            agility: 4,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            gravityChance: 10
        }
    },

    dark_singularity:{
        id: "dark_singularity",
        name: "Singularidade da Escuridão",
        image: "assets/img/assets/character/class_up/singularity/dark-singularity.png",
        hud: "assets/img/assets/character/class_up/singularity/dark-singularity-hud.png",
        description: "Você escolheu transcender para uma singularidade da escuridão.",
        states:{
            life: 108,
            attack: 56,
            armor: 19,
            agility: 6,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0,
            gravityChance: 8
        }
    }

};

export default upClasse;