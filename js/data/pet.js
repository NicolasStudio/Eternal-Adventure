const pets = {

    /* ==========================================================
       Lobo
    ========================================================== */
    wolfPet1: {
        id: "wolf-pet1",
        name: "Ovo de Lobo",
        image: "assets/img/assets/pet/egg-wolf.png",
        type: "pet",
        family: "wolf",
        shocked: false,
        color: "#8B4513",
        stars: "★★★",
        nivel: 0,
        description: "Um ovo de lobo. Quem sabe o que pode sair dele?",

        xp: 0,
        fome: 0,

        stats: {
            life: 0,
            attack: 0,
            armor: 0,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },

    },

    wolfPet2: {
        id: "wolf-pet2",
        name: "Lobo Filhote",
        image: "assets/img/assets/pet/wolf-stage-1.png",
        type: "pet",
        family: "wolf",
        shocked: true,
        color: "#8B4513",
        stars: "★★★",
        nivel: 1,
        description: "Um lobo filhote. Ele ainda é pequeno, mas tem potencial para crescer forte.",

        xp: 0,
        fome: 0,

        stats: {
            life: 2,
            attack: 2,
            armor: 0,
            agility: 1,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Mordida",
                description: "Uma mordida poderosa que causa dano físico.",
                damage: 2,
            }
        }
    },

    wolfPet3: {
        id: "wolf-pet3",
        name: "Lobo Jovem",
        image: "assets/img/assets/pet/wolf-stage-2.png",
        type: "pet",
        family: "wolf",
        shocked: true,
        color: "#8B4513",
        stars: "★★★",
        nivel: 18,
        description: "Um lobo jovem. Ele ainda é pequeno, mas tem potencial para crescer forte.",

        xp: 0,
        fome: 0,

        stats: {
            life: 8,
            attack: 5,
            armor: 0,
            agility: 3,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0
        },
        habilities: {
            hability: {
                name: "Mordida",
                description: "Uma mordida poderosa que causa dano físico.",
                damage: 7,
            }
        }
    },
    
    wolfPet4: {
        id: "wolf-pet4",
        name: "Lobo Adulto",
        image: "assets/img/assets/pet/wolf-stage-3.png",
        type: "pet",
        family: "wolf",
        shocked: true,
        color: "#8B4513",
        stars: "★★★",
        nivel: 32,
        description: "Um lobo adulto. Ele é forte e experiente.",

        xp: 0,
        fome: 0,

        stats: {
            life: 12,
            attack: 7,
            armor: 0,
            agility: 5,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0
        },
        habilities: {
            hability: {
                name: "Mordida",
                description: "Uma mordida poderosa que causa dano físico.",
                damage: 14,
            }
        }
    }
    
};

export default pets;
