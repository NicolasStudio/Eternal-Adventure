const pets = {

    /* ==========================================================
       Lobo - Dano verdadeiro
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
        description: "Um ovo de lobo. ",

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
                description: "Uma mordida poderosa que causa dano verdadeiro.",
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
                description: "Uma mordida poderosa que causa dano verdadeiro.",
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
                description: "Uma mordida poderosa que causa dano verdadeiro.",
                damage: 14,
            }
        }
    },
    
    /* ==========================================================
       Duende - Cura um aliado aleatório
    ========================================================== */
    fairyPet1: {
        id: "fairy-pet1",
        name: "Ovo de Duende",
        image: "assets/img/assets/pet/egg-duende.png",
        type: "pet",
        family: "fairy",
        shocked: false,
        color: "#8B4513",
        stars: "★★★",
        nivel: 0,
        description: "Um ovo de duende. ",

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

    fairyPet2: {
        id: "fairy-pet2",
        name: "Duende Filhote",
        image: "assets/img/assets/pet/duende-stage-1.png",
        type: "pet",
        family: "fairy",
        shocked: true,
        color: "#8B4513",
        stars: "★★★",
        nivel: 1,
        description: "Um duende filhote. Ele ainda é pequeno, mas tem potencial para crescer forte.",

        xp: 0,
        fome: 0,

        stats: {
            life: 2,
            attack: 3,
            armor: 0,
            agility: 1,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Robin Hood",
                description: "Cura um alvo sorteado entre você e seus aliados (se houver).",
                heal: 12,
            }
        }
    },

    fairyPet3: {
        id: "fairy-pet3",
        name: "Duende Jovem",
        image: "assets/img/assets/pet/duende-stage-2.png",
        type: "pet",
        family: "fairy",
        shocked: true,
        color: "#8B4513",
        stars: "★★★",
        nivel: 18,
        description: "Um duende jovem. Ele está em sua fase de crescimento e tem muito potencial.",

        xp: 0,
        fome: 0,

        stats: {
            life: 8,
            attack: 6,
            armor: 0,
            agility: 3,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Robin Hood",
                description: "Cura um alvo sorteado entre você e seus aliados (se houver).",
                heal: 22,
            }
        }
    },

    fairyPet4: {
        id: "fairy-pet4",
        name: "Duende Adulto",
        image: "assets/img/assets/pet/duende-stage-3.png",
        type: "pet",
        family: "fairy",
        shocked: true,
        color: "#8B4513",
        stars: "★★★",
        nivel: 32,
        description: "Um duende adulto. Sua experiência e habilidades são notáveis, tornando-o um aliado valioso.",

        xp: 0,
        fome: 0,

        stats: {
            life: 12,
            attack: 10,
            armor: 1,
            agility: 7,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Robin Hood",
                description: "Cura um alvo sorteado entre você e seus aliados (se houver).",
                heal: 32,
            }
        }
    },

    /* ==========================================================
       Aranha - Dano conforme o dano do jogador
    ========================================================== */
    spiderPet1: {
        id: "spider-pet1",
        name: "Ovo de Aranha",
        image: "assets/img/assets/pet/egg-spider.png",
        type: "pet",
        family: "spider",
        shocked: false,
        color: "#8B4513",
        stars: "★★★★",
        nivel: 0,
        description: "Um ovo de aranha. ",

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

    spiderPet2: {
        id: "spider-pet2",
        name: "Aranha Filhote",
        image: "assets/img/assets/pet/spider-stage-1.png",
        type: "pet",
        family: "spider",
        shocked: true,
        color: "#8B4513",
        stars: "★★★★",
        nivel: 1,
        description: "Uma aranha filhote. Ela ainda é pequena, mas tem potencial para crescer forte.",

        xp: 0,
        fome: 0,

        stats: {
            life: 2,
            attack: 2,
            armor: 0,
            agility: 3,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Mímico",
                description: "Copia 1/8 do dano do jogador e aplica no inimigo, causando dano verdadeiro.",
                mimicRatio: 0.125,
            }
        }
    },

    spiderPet3: {
        id: "spider-pet3",
        name: "Aranha jovem",
        image: "assets/img/assets/pet/spider-stage-2.png",
        type: "pet",
        family: "spider",
        shocked: true,
        color: "#8B4513",
        stars: "★★★★",
        nivel: 18,
        description: "Uma aranha jovem. Ela está em sua fase de crescimento e tem muito potencial.",

        xp: 0,
        fome: 0,

        stats: {
            life: 4,
            attack: 5,
            armor: 0,
            agility: 8,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Mímico",
                description: "Copia 1/4 do dano do jogador e aplica no inimigo, causando dano verdadeiro.",
                mimicRatio: 0.25,
            }
        }
    },

    spiderPet4: {
        id: "spider-pet4",
        name: "Aranha Adulta",
        image: "assets/img/assets/pet/spider-stage-3.png",
        type: "pet",
        family: "spider",
        shocked: true,
        color: "#8B4513",
        stars: "★★★★",
        nivel: 32,
        description: "Uma aranha adulta. Sua experiência e habilidades são notáveis, tornando-o um aliado valioso.",

        xp: 0,
        fome: 0,

        stats: {
            life: 8,
            attack: 9,
            armor: 0,
            agility: 15,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Mímico",
                description: "Copia 1/2 do dano do jogador e aplica no inimigo, causando dano verdadeiro.",
                mimicRatio: 0.5,
            }
        }
    },

    /* ==========================================================
       Urso - Mitigador, só aumenta sua vida e armadura, passivamente.
    ========================================================== */
    bearPet1: {
        id: "bear-pet1",
        name: "Ovo de Urso",
        image: "assets/img/assets/pet/egg-bear.png",
        type: "pet",
        family: "bear",
        shocked: false,
        color: "#8B4513",
        stars: "★★★★",
        nivel: 0,
        description: "Um ovo de urso. ",

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

    bearPet2: {
        id: "bear-pet2",
        name: "Urso Filhote",
        image: "assets/img/assets/pet/bear-stage-1.png",
        type: "pet",
        family: "bear",
        shocked: true,
        color: "#8B4513",
        stars: "★★★★",
        nivel: 1,
        description: "Um urso filhote. Ele ainda é pequeno, mas tem potencial para crescer forte.",

        xp: 0,
        fome: 0,

        stats: {
            life: 9,
            attack: 1,
            armor: 4,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Mitigador",
                description: "Não ataca nem participa do turno de combate, só aumenta sua vida e armadura, passivamente.",
            }
        }
    },

    bearPet3: {
        id: "bear-pet3",
        name: "Urso jovem",
        image: "assets/img/assets/pet/bear-stage-2.png",
        type: "pet",
        family: "bear",
        shocked: true,
        color: "#8B4513",
        stars: "★★★★",
        nivel: 18,
        description: "Um urso jovem. Ele está em sua fase de crescimento e tem muito potencial.",

        xp: 0,
        fome: 0,

        stats: {
            life: 19,
            attack: 4,
            armor: 12,
            agility: 0,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Mitigador",
                description: "Não ataca nem participa do turno de combate, só aumenta sua vida e armadura, passivamente.",
            }
        }
    },

    bearPet4: {
        id: "bear-pet4",
        name: "Urso Adulto",
        image: "assets/img/assets/pet/bear-stage-3.png",
        type: "pet",
        family: "bear",
        shocked: true,
        color: "#8B4513",
        stars: "★★★★",
        nivel: 32,
        description: "Um urso adulto. Sua experiência e habilidades são notáveis, tornando-o um aliado valioso.",

        xp: 0,
        fome: 0,

        stats: {
            life: 29,
            attack: 7,
            armor: 19,
            agility: 1,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Mitigador",
                description: "Não ataca nem participa do turno de combate, só aumenta sua vida e armadura, passivamente.",
            }
        }
    },

    /* ==========================================================
       Snake - Dano de queimação
    ========================================================== */
    boitataPet1: {
        id: "boitata-pet1",
        name: "Ovo de Boitata",
        image: "assets/img/assets/pet/egg-snake.png",
        type: "pet",
        family: "snake",
        shocked: false,
        color: "#ff711f",
        stars: "★★★★★",
        nivel: 0,
        description: "Um ovo do Boitata.",

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

    boitataPet2: {
        id: "boitata-pet2",
        name: "Boitata Filhote",
        image: "assets/img/assets/pet/snake-stage-1.png",
        type: "pet",
        family: "snake",
        shocked: true,
        color: "#ff711f",
        stars: "★★★★★",
        nivel: 1,
        description: "Um boitata filhote. Ele ainda é pequeno, mas tem potencial para crescer forte.",

        xp: 0,
        fome: 0,

        stats: {
            life: 20,
            attack: 7,
            armor: 7,
            agility: 12,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Lança chamas",
                description: "Seu ataque causa dano de queimação no inimigo, entre turnos.",
                burnDamage: 10,
            }
        }
    },

    boitataPet3: {
        id: "boitata-pet3",
        name: "Boitata Jovem",
        image: "assets/img/assets/pet/snake-stage-2.png",
        type: "pet",
        family: "snake",
        shocked: true,
        color: "#ff711f",
        stars: "★★★★★",
        nivel: 18,
        description: "Um boitata jovem. Ele já é mais forte e pode causar dano significativo em combate.",

        xp: 0,
        fome: 0,

        stats: {
            life: 30,
            attack: 12,
            armor: 12,
            agility: 18,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Lança chamas",
                description: "Seu ataque causa dano de queimação no inimigo, entre turnos.",
                burnDamage: 20,
            }
        }
    },

    boitataPet4: {
        id: "boitata-pet4",
        name: "Boitata Adulto",
        image: "assets/img/assets/pet/snake-stage-3.png",
        type: "pet",
        family: "snake",
        shocked: true,
        color: "#ff711f",
        stars: "★★★★★",
        nivel: 32,
        description: "Um boitata adulto. Ele é muito forte e pode causar dano significativo em combate.",

        xp: 0,
        fome: 0,

        stats: {
            life: 40,
            attack: 18,
            armor: 18,
            agility: 24,
            criticalChance: 0,
            lifeSteal: 0,
            penetration: 0,
            absorption: 0

        },
        habilities: {
            hability: {
                name: "Lança chamas",
                description: "Seu ataque causa dano de queimação no inimigo, entre turnos.",
                burnDamage: 30,
            }
        }
    },

};

export default pets;
