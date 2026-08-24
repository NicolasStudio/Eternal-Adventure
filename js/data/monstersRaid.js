import items from "./items.js";

const monstersRaid = [

    // ============================================
    // NÍVEL 150 - RAID 
    // ============================================
    {
        id: "drake",
        name: "Dragão Infernal",
        level: 150,
        type: "beast",

        sprite: "assets/img/monstersRaid/drake.png",

        status: {
            vidaMaxima: 15000,
            ataque:[
                {
                    nomeAtaque: "Mordida",
                    dano: 250,
                },
                {
                    nomeAtaque: "Baforada",
                    dano: 280,
                },
                {
                    nomeAtaque: "Chamas infernais",
                    dano: 320,
                },
            ],
            armadura: 220,
            agilidade: 200,
            xp: 0,
            ouro: 10000
        },

        drops: [
            {
                // type: ["weapon"],
                // rarity: "common"
            },
            {
                item: items.largePotion,
                quantidade: 10
            }
        ]
    },
];

export default monstersRaid;