// Configuração de cada cultura da Fazenda: tempo total até a colheita,
// as 5 imagens de estágio (ver FarmService.getStageIndex, que decide
// qual delas mostrar a partir do tempo decorrido desde o plantio), e o
// item que vai pro inventário (aba "Itens") ao colher.
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
        petXP: 20,
        harvestedItem: {
            id: "potato",
            name: "Batata",
            type: "item",
            icon: "assets/img/assets/farm/seed/potato.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 180, // preço da semente (150) + 20%
            petFeedValue: 10
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
            sellValue: 540, // preço da semente (450) + 20%
            petFeedValue: 30
        }
    },

    onion: {
        id: "onion",
        seedId: "seed_onion",
        name: "Cebola",
        growTimeMs: 3 * 60 * 60 * 1000, // 3h
        stageImages: [
            "assets/img/assets/farm/stageSeed/onion-stage-1.png",
            "assets/img/assets/farm/stageSeed/onion-stage-2.png",
            "assets/img/assets/farm/stageSeed/onion-stage-3.png",
            "assets/img/assets/farm/stageSeed/onion-stage-4.png",
            "assets/img/assets/farm/stageSeed/onion-stage-5.png"
        ],
        harvestYield: 5,
        petXP: 30,
        harvestedItem: {
            id: "onion",
            name: "Cebola",
            type: "item",
            icon: "assets/img/assets/farm/seed/onion.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 960, // preço da semente (800) + 20%
            petFeedValue: 75
        }
    },

    strawberry: {
        id: "strawberry",
        seedId: "seed_strawberry",
        name: "Morango",
        growTimeMs: 5 * 60 * 60 * 1000, // 5h
        stageImages: [
            "assets/img/assets/farm/stageSeed/strawberry-stage-1.png",
            "assets/img/assets/farm/stageSeed/strawberry-stage-2.png",
            "assets/img/assets/farm/stageSeed/strawberry-stage-3.png",
            "assets/img/assets/farm/stageSeed/strawberry-stage-4.png",
            "assets/img/assets/farm/stageSeed/strawberry-stage-5.png"
        ],
        harvestYield: 3,
        petXP: 60,
        harvestedItem: {
            id: "strawberry",
            name: "Morango",
            type: "item",
            icon: "assets/img/assets/farm/seed/strawberry.png",
            effect: "Um alimento colhido na Fazenda. Pode ser consumido por um pet.",
            sellValue: 1440, // preço da semente (1200) + 20%
            petFeedValue: 150
        }
    }

};

export default farmCrops;
