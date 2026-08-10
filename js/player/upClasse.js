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
            lifeSteal: 10,
            penetration: 0
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
            lifeSteal: 8,
            penetration: 0
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
            attack: 50,
            armor: 15,
            agility: 15,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 15
        }

    },

    dark_mage: {

        id: "dark_mage",

        name: "Mago da Escuridão",

        image: "assets/img/assets/character/class_up/mage/dark-mage.png",
                                
        hud: "assets/img/assets/character/class_up/mage/dark-mage-hud.png",

        description: "Você escolheu transcender para um mago da escuridão.",

        states:{
            life: 90,
            attack: 50,
            armor: 10,
            agility: 10,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 20
        }

    },

    light_archer: {

        id: "light_archer",

        name: "Arqueiro da Luz",

        image: "assets/img/assets/character/class_up/archer/light-archer.png",
                                
        hud: "assets/img/assets/character/class_up/archer/light-archer-hud.png",

        description: "Você escolheu transcender para um arqueiro da luz.",

        states:{
            life: 90,
            attack: 40,
            armor: 10,
            agility: 20,
            criticalChance: 15,
            lifeSteal: 0,
            penetration: 0
        }

    },

    dark_archer: {

        id: "dark_archer",

        name: "Arqueiro da Escuridão",

        image: "assets/img/assets/character/class_up/archer/dark-archer.png",
                                
        hud: "assets/img/assets/character/class_up/archer/dark-archer-hud.png",

        description: "Você escolheu transcender para um arqueiro da escuridão.",

        states:{
            life: 80,
            attack: 45,
            armor: 5,
            agility: 25,
            criticalChance: 20,
            lifeSteal: 0,
            penetration: 0
        }

    },

};

export default upClasse;