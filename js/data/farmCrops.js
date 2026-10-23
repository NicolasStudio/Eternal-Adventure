// Cada cultura: tempo até a colheita, as 5 imagens de estágio (ver
// FarmService.getStageIndex) e o item que cai no inventário ao colher.
// Tempo/preço da semente são à mão; o resto é derivado: petXP = minutos
// de crescimento (1xp/minuto); sellValue = preço da semente (seeds.js)
// +20%; petFeedValue = preço da semente /50 (era /10 — upava um pet
// inteiro em poucos dias com 24 canteiros; agora é objetivo de prazo
// mais longo. Batata: 100/50 = 2).
const farmCrops = {

    potato: {
        id: "potato",
        seedId: "seed_potato",
        name: "Batata",
        growTimeMs: 5 * 60 * 1000, // 5min
        stageImages: [
            "assets/img/assets/farm/stageSeed/potato-stage-1.png",
            "assets/img/assets/farm/stageSeed/potato-stage-2.png",
            "assets/img/assets/farm/stageSeed/potato-stage-3.png",
            "assets/img/assets/farm/stageSeed/potato-stage-4.png",
            "assets/img/assets/farm/stageSeed/potato-stage-5.png"
        ],
        harvestYield: 4,
        petXP: 5,
        harvestedItem: {
            id: "potato",
            name: "Batata",
            type: "item",
            icon: "assets/img/assets/farm/seed/potato.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 120, // preço da semente (100) + 20%
            petFeedValue: 2 // preço da semente (100) / 50
        }
    },

    wheat: {
        id: "wheat",
        seedId: "seed_wheat",
        name: "Trigo",
        growTimeMs: 15 * 60 * 1000, // 15min
        stageImages: [
            "assets/img/assets/farm/stageSeed/wheat-stage-1.png",
            "assets/img/assets/farm/stageSeed/wheat-stage-2.png",
            "assets/img/assets/farm/stageSeed/wheat-stage-3.png",
            "assets/img/assets/farm/stageSeed/wheat-stage-4.png",
            "assets/img/assets/farm/stageSeed/wheat-stage-5.png"
        ],
        harvestYield: 5,
        petXP: 15,
        harvestedItem: {
            id: "wheat",
            name: "Trigo",
            type: "item",
            icon: "assets/img/assets/farm/seed/wheat.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 180, // preço da semente (150) + 20%
            petFeedValue: 3 // preço da semente (150) / 50
        }
    },

    leek: {
        id: "leek",
        seedId: "seed_leek",
        name: "Alho-Poró",
        growTimeMs: 30 * 60 * 1000, // 30min
        stageImages: [
            "assets/img/assets/farm/stageSeed/leek-stage-1.png",
            "assets/img/assets/farm/stageSeed/leek-stage-2.png",
            "assets/img/assets/farm/stageSeed/leek-stage-3.png",
            "assets/img/assets/farm/stageSeed/leek-stage-4.png",
            "assets/img/assets/farm/stageSeed/leek-stage-5.png"
        ],
        harvestYield: 5,
        petXP: 30,
        harvestedItem: {
            id: "leek",
            name: "Alho-Poró",
            type: "item",
            icon: "assets/img/assets/farm/seed/leek.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 384, // preço da semente (320) + 20%
            petFeedValue: 6 // preço da semente (320) / 50, arredondado
        }
    },

    onion: {
        id: "onion",
        seedId: "seed_onion",
        name: "Cebola",
        growTimeMs: 60 * 60 * 1000, // 1h
        stageImages: [
            "assets/img/assets/farm/stageSeed/onion-stage-1.png",
            "assets/img/assets/farm/stageSeed/onion-stage-2.png",
            "assets/img/assets/farm/stageSeed/onion-stage-3.png",
            "assets/img/assets/farm/stageSeed/onion-stage-4.png",
            "assets/img/assets/farm/stageSeed/onion-stage-5.png"
        ],
        harvestYield: 5,
        petXP: 60,
        harvestedItem: {
            id: "onion",
            name: "Cebola",
            type: "item",
            icon: "assets/img/assets/farm/seed/onion.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 768, // preço da semente (640) + 20%
            petFeedValue: 13 // preço da semente (640) / 50, arredondado
        }
    },

    corn: {
        id: "corn",
        seedId: "seed_corn",
        name: "Milho",
        growTimeMs: 2.5 * 60 * 60 * 1000, // 2h30min
        stageImages: [
            "assets/img/assets/farm/stageSeed/corn-stage-1.png",
            "assets/img/assets/farm/stageSeed/corn-stage-2.png",
            "assets/img/assets/farm/stageSeed/corn-stage-3.png",
            "assets/img/assets/farm/stageSeed/corn-stage-4.png",
            "assets/img/assets/farm/stageSeed/corn-stage-5.png"
        ],
        harvestYield: 5,
        petXP: 150,
        harvestedItem: {
            id: "corn",
            name: "Milho",
            type: "item",
            icon: "assets/img/assets/farm/seed/corn.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 960, // preço da semente (800) + 20%
            petFeedValue: 16 // preço da semente (800) / 50
        }
    },

    grape: {
        id: "grape",
        seedId: "seed_grape",
        name: "Uva",
        growTimeMs: 4 * 60 * 60 * 1000, // 4h
        stageImages: [
            "assets/img/assets/farm/stageSeed/grape-stage-1.png",
            "assets/img/assets/farm/stageSeed/grape-stage-2.png",
            "assets/img/assets/farm/stageSeed/grape-stage-3.png",
            "assets/img/assets/farm/stageSeed/grape-stage-4.png",
            "assets/img/assets/farm/stageSeed/grape-stage-5.png"
        ],
        harvestYield: 6,
        petXP: 240,
        harvestedItem: {
            id: "grape",
            name: "Uva",
            type: "item",
            icon: "assets/img/assets/farm/seed/grape.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 1560, // preço da semente (1300) + 20%
            petFeedValue: 26 // preço da semente (1300) / 50
        }
    },

    strawberry: {
        id: "strawberry",
        seedId: "seed_strawberry",
        name: "Morango",
        growTimeMs: 8 * 60 * 60 * 1000, // 8h
        stageImages: [
            "assets/img/assets/farm/stageSeed/strawberry-stage-1.png",
            "assets/img/assets/farm/stageSeed/strawberry-stage-2.png",
            "assets/img/assets/farm/stageSeed/strawberry-stage-3.png",
            "assets/img/assets/farm/stageSeed/strawberry-stage-4.png",
            "assets/img/assets/farm/stageSeed/strawberry-stage-5.png"
        ],
        harvestYield: 7,
        petXP: 480,
        harvestedItem: {
            id: "strawberry",
            name: "Morango",
            type: "item",
            icon: "assets/img/assets/farm/seed/strawberry.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 2160, // preço da semente (1800) + 20%
            petFeedValue: 36 // preço da semente (1800) / 50
        }
    },

    pumpkin: {
        id: "pumpkin",
        seedId: "seed_pumpkin",
        name: "Abóbora",
        growTimeMs: 12 * 60 * 60 * 1000, // 12h
        stageImages: [
            "assets/img/assets/farm/stageSeed/pumpkin-stage-1.png",
            "assets/img/assets/farm/stageSeed/pumpkin-stage-2.png",
            "assets/img/assets/farm/stageSeed/pumpkin-stage-3.png",
            "assets/img/assets/farm/stageSeed/pumpkin-stage-4.png",
            "assets/img/assets/farm/stageSeed/pumpkin-stage-5.png"
        ],
        harvestYield: 6,
        petXP: 720,
        harvestedItem: {
            id: "pumpkin",
            name: "Abóbora",
            type: "item",
            icon: "assets/img/assets/farm/seed/pumpkin.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 3600, // preço da semente (3000) + 20%
            petFeedValue: 60 // preço da semente (3000) / 50
        }
    },

    eggplant: {
        id: "eggplant",
        seedId: "seed_eggplant",
        name: "Berinjela",
        growTimeMs: 20 * 60 * 1000, // 20min
        stageImages: [
            "assets/img/assets/farm/stageSeed/eggplant-stage-1.png",
            "assets/img/assets/farm/stageSeed/eggplant-stage-2.png",
            "assets/img/assets/farm/stageSeed/eggplant-stage-3.png",
            "assets/img/assets/farm/stageSeed/eggplant-stage-4.png",
            "assets/img/assets/farm/stageSeed/eggplant-stage-5.png"
        ],
        harvestYield: 5,
        petXP: 20,
        harvestedItem: {
            id: "eggplant",
            name: "Berinjela",
            type: "item",
            icon: "assets/img/assets/farm/seed/eggplant.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 240, // preço da semente (200) + 20%
            petFeedValue: 4 // preço da semente (200) / 50
        }
    },

    carrot: {
        id: "carrot",
        seedId: "seed_carrot",
        name: "Cenoura",
        growTimeMs: 90 * 60 * 1000, // 1h30min
        stageImages: [
            "assets/img/assets/farm/stageSeed/carrot-stage-1.png",
            "assets/img/assets/farm/stageSeed/carrot-stage-2.png",
            "assets/img/assets/farm/stageSeed/carrot-stage-3.png",
            "assets/img/assets/farm/stageSeed/carrot-stage-4.png",
            "assets/img/assets/farm/stageSeed/carrot-stage-5.png"
        ],
        harvestYield: 5,
        petXP: 90,
        harvestedItem: {
            id: "carrot",
            name: "Cenoura",
            type: "item",
            icon: "assets/img/assets/farm/seed/carrot.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 864, // preço da semente (720) + 20%
            petFeedValue: 14 // preço da semente (720) / 50, arredondado
        }
    },

    orange: {
        id: "orange",
        seedId: "seed_orange",
        name: "Laranja",
        growTimeMs: 6 * 60 * 60 * 1000, // 6h
        stageImages: [
            "assets/img/assets/farm/stageSeed/orange-stage-1.png",
            "assets/img/assets/farm/stageSeed/orange-stage-2.png",
            "assets/img/assets/farm/stageSeed/orange-stage-3.png",
            "assets/img/assets/farm/stageSeed/orange-stage-4.png",
            "assets/img/assets/farm/stageSeed/orange-stage-5.png"
        ],
        harvestYield: 6,
        petXP: 360,
        harvestedItem: {
            id: "orange",
            name: "Laranja",
            type: "item",
            icon: "assets/img/assets/farm/seed/orange.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 1860, // preço da semente (1550) + 20%
            petFeedValue: 31 // preço da semente (1550) / 50, arredondado
        }
    },

    watermelon: {
        id: "watermelon",
        seedId: "seed_watermelon",
        name: "Melancia",
        growTimeMs: 24 * 60 * 60 * 1000, // 24h
        stageImages: [
            "assets/img/assets/farm/stageSeed/watermelon-stage-1.png",
            "assets/img/assets/farm/stageSeed/watermelon-stage-2.png",
            "assets/img/assets/farm/stageSeed/watermelon-stage-3.png",
            "assets/img/assets/farm/stageSeed/watermelon-stage-4.png",
            "assets/img/assets/farm/stageSeed/watermelon-stage-5.png"
        ],
        harvestYield: 7,
        petXP: 1440,
        harvestedItem: {
            id: "watermelon",
            name: "Melancia",
            type: "item",
            icon: "assets/img/assets/farm/seed/watermelon.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 6000, // preço da semente (5000) + 20%
            petFeedValue: 100 // preço da semente (5000) / 50
        }
    },

    pod: {
        id: "pod",
        seedId: "seed_pod",
        name: "Vagem",
        growTimeMs: 45 * 60 * 1000, // 45min
        stageImages: [
            "assets/img/assets/farm/stageSeed/pod-stage-1.png",
            "assets/img/assets/farm/stageSeed/pod-stage-2.png",
            "assets/img/assets/farm/stageSeed/pod-stage-3.png",
            "assets/img/assets/farm/stageSeed/pod-stage-4.png",
            "assets/img/assets/farm/stageSeed/pod-stage-5.png"
        ],
        harvestYield: 5,
        petXP: 45,
        harvestedItem: {
            id: "pod",
            name: "Vagem",
            type: "item",
            icon: "assets/img/assets/farm/seed/pod.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 540, // preço da semente (450) + 20%
            petFeedValue: 9 // preço da semente (450) / 50
        }
    },

    cabbage: {
        id: "cabbage",
        seedId: "seed_cabbage",
        name: "Repolho",
        growTimeMs: 2 * 60 * 60 * 1000, // 2h
        stageImages: [
            "assets/img/assets/farm/stageSeed/cabbage-stage-1.png",
            "assets/img/assets/farm/stageSeed/cabbage-stage-2.png",
            "assets/img/assets/farm/stageSeed/cabbage-stage-3.png",
            "assets/img/assets/farm/stageSeed/cabbage-stage-4.png",
            "assets/img/assets/farm/stageSeed/cabbage-stage-5.png"
        ],
        harvestYield: 5,
        petXP: 120,
        harvestedItem: {
            id: "cabbage",
            name: "Repolho",
            type: "item",
            icon: "assets/img/assets/farm/seed/cabbage.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 1020, // preço da semente (850) + 20%
            petFeedValue: 17 // preço da semente (850) / 50
        }
    },

    cranberry: {
        id: "cranberry",
        seedId: "seed_cranberry",
        name: "Oxicoco",
        growTimeMs: 10 * 60 * 60 * 1000, // 10h
        stageImages: [
            "assets/img/assets/farm/stageSeed/cranberry-stage-1.png",
            "assets/img/assets/farm/stageSeed/cranberry-stage-2.png",
            "assets/img/assets/farm/stageSeed/cranberry-stage-3.png",
            "assets/img/assets/farm/stageSeed/cranberry-stage-4.png",
            "assets/img/assets/farm/stageSeed/cranberry-stage-5.png"
        ],
        harvestYield: 7,
        petXP: 600,
        harvestedItem: {
            id: "cranberry",
            name: "Oxicoco",
            type: "item",
            icon: "assets/img/assets/farm/seed/cranberry.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 2640, // preço da semente (2200) + 20%
            petFeedValue: 44 // preço da semente (2200) / 50
        }
    },

    banana: {
        id: "banana",
        seedId: "seed_banana",
        name: "Banana",
        growTimeMs: 18 * 60 * 60 * 1000, // 18h
        stageImages: [
            "assets/img/assets/farm/stageSeed/banana-stage-1.png",
            "assets/img/assets/farm/stageSeed/banana-stage-2.png",
            "assets/img/assets/farm/stageSeed/banana-stage-3.png",
            "assets/img/assets/farm/stageSeed/banana-stage-4.png",
            "assets/img/assets/farm/stageSeed/banana-stage-5.png"
        ],
        harvestYield: 8,
        petXP: 1080,
        harvestedItem: {
            id: "banana",
            name: "Banana",
            type: "item",
            icon: "assets/img/assets/farm/seed/banana.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 3960, // preço da semente (3300) + 20%
            petFeedValue: 66 // preço da semente (3300) / 50
        }
    },

    mango: {
        id: "mango",
        seedId: "seed_mango",
        name: "Manga",
        growTimeMs: 24 * 60 * 60 * 1000, // 24h (valor dado pelo usuário)
        stageImages: [
            "assets/img/assets/farm/stageSeed/mango-stage-1.png",
            "assets/img/assets/farm/stageSeed/mango-stage-2.png",
            "assets/img/assets/farm/stageSeed/mango-stage-3.png",
            "assets/img/assets/farm/stageSeed/mango-stage-4.png",
            "assets/img/assets/farm/stageSeed/mango-stage-5.png"
        ],
        harvestYield: 7,
        petXP: 1440,
        harvestedItem: {
            id: "mango",
            name: "Manga",
            type: "item",
            icon: "assets/img/assets/farm/seed/mango.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 6240, // preço da semente (5200) + 20%
            petFeedValue: 104 // preço da semente (5200) / 50
        }
    },

    avocado: {
        id: "avocado",
        seedId: "seed_avocado",
        name: "Abacate",
        growTimeMs: 42 * 60 * 60 * 1000, // 42h (valor dado pelo usuário) — a cultura mais longa do jogo
        stageImages: [
            "assets/img/assets/farm/stageSeed/avocado-stage-1.png",
            "assets/img/assets/farm/stageSeed/avocado-stage-2.png",
            "assets/img/assets/farm/stageSeed/avocado-stage-3.png",
            "assets/img/assets/farm/stageSeed/avocado-stage-4.png",
            "assets/img/assets/farm/stageSeed/avocado-stage-5.png"
        ],
        harvestYield: 8,
        petXP: 2520,
        harvestedItem: {
            id: "avocado",
            name: "Abacate",
            type: "item",
            icon: "assets/img/assets/farm/seed/avocado.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 8400, // preço da semente (7000) + 20%
            petFeedValue: 140 // preço da semente (7000) / 50
        }
    }

};

export default farmCrops;
