const upClasse = {

    light_Warrior: {
        id: "light_warrior",
        name: "Guerreiro da Luz",
        image: "assets/img/assets/character/class_up/warrior/light-warrior.png",
        hud: "assets/img/assets/character/class_up/warrior/light-warrior-hud.png",
        description: "Você escolheu transcender para um guerreiro da luz.",
        states:{
            life: 100,
            attack: 20,
            armor: 30,
            agility: 10,
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
            life: 100,
            attack: 30,
            armor: 20,
            agility: 12,
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
            life: 80,
            attack: 85,
            armor: 10,
            agility: 25,
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
            life: 70,
            attack: 60,
            armor: 10,
            agility: 12,
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
            life: 70,
            attack: 45,
            armor: 6,
            agility: 25,
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
            life: 60,
            attack: 42,
            armor: 1,
            agility: 30,
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
            life: 140,
            attack: 38,
            armor: 22,
            agility: 10,
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
            life: 100,
            attack: 48,
            armor: 14,
            agility: 12,
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
            life: 65,
            attack: 35,
            armor: 20,
            agility: 12,
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
            life: 85,
            attack: 28,
            armor: 17,
            agility: 18,
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
            life: 70,
            attack: 30,
            armor: 15,
            agility: 25,
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
            life: 80,
            attack: 25,
            armor: 20,
            agility: 20,
            criticalChance: 10,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0
        }
    }

};

export default upClasse;