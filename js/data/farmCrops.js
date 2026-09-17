// Configuração de cada cultura da Fazenda: tempo total até a colheita,
// as 5 imagens de estágio (ver FarmService.getStageIndex, que decide
// qual delas mostrar a partir do tempo decorrido desde o plantio), e o
// item que vai pro inventário (aba "Comidas") ao colher.
//
// Balanceamento (tempo/preço da semente definidos à mão, o resto
// derivado de forma consistente pra não precisar ajustar cultura por
// cultura no futuro):
// - petXP = minutos de crescimento (Batata 5min→5xp, Trigo 15min→15xp,
//   e assim por diante — quanto mais devagar a cultura, mais XP ela
//   rende, mas sempre na mesma proporção: 1xp por minuto de espera).
// - harvestedItem.sellValue = preço da semente (seeds.js `value`) + 20%.
// - harvestedItem.petFeedValue = preço da semente / 10 (contínua o valor
//   original da Batata, que já era 10 com semente a 100).
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
        harvestYield: 6,
        petXP: 5,
        harvestedItem: {
            id: "potato",
            name: "Batata",
            type: "item",
            icon: "assets/img/assets/farm/seed/potato.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 120, // preço da semente (100) + 20%
            petFeedValue: 10
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
        harvestYield: 6,
        petXP: 15,
        harvestedItem: {
            id: "wheat",
            name: "Trigo",
            type: "item",
            icon: "assets/img/assets/farm/seed/wheat.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 180, // preço da semente (150) + 20%
            petFeedValue: 15
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
            petFeedValue: 32
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
            petFeedValue: 64
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
        harvestYield: 4,
        petXP: 150,
        harvestedItem: {
            id: "corn",
            name: "Milho",
            type: "item",
            icon: "assets/img/assets/farm/seed/corn.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 960, // preço da semente (800) + 20%
            petFeedValue: 80
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
        harvestYield: 4,
        petXP: 240,
        harvestedItem: {
            id: "grape",
            name: "Uva",
            type: "item",
            icon: "assets/img/assets/farm/seed/grape.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 1560, // preço da semente (1300) + 20%
            petFeedValue: 130
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
        harvestYield: 3,
        petXP: 480,
        harvestedItem: {
            id: "strawberry",
            name: "Morango",
            type: "item",
            icon: "assets/img/assets/farm/seed/strawberry.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 2160, // preço da semente (1800) + 20%
            petFeedValue: 180
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
        harvestYield: 2,
        petXP: 720,
        harvestedItem: {
            id: "pumpkin",
            name: "Abóbora",
            type: "item",
            icon: "assets/img/assets/farm/seed/pumpkin.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 3600, // preço da semente (3000) + 20%
            petFeedValue: 300
        }
    }

};

export default farmCrops;
