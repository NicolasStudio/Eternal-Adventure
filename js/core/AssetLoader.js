export default class AssetLoader {

    constructor() {

        this.assets = [

            // Logo
            "assets/img/backgrounds/logo.png",

            // Backgrounds
            "assets/img/backgrounds/tela_inicial.png",

            // Classes
            "assets/img/assets/character/class/warrior.png",
            "assets/img/assets/character/class/archer.png",
            "assets/img/assets/character/class/mage.png",

            // HUD
            "assets/img/assets/character/class/warrior-hud.png",
            "assets/img/assets/character/class/archer-hud.png",
            "assets/img/assets/character/class/mage-hud.png",

            // Card das Dungeons
            "assets/img/assets/card_dungeon/card_grove_1.png",
            "assets/img/assets/card_dungeon/card_grove_2.png",
            "assets/img/assets/card_dungeon/card_grove_3.png",
            "assets/img/assets/card_dungeon/card_grove_end.png",

            // Background das dungeons
            "assets/img/backgrounds/page_1/grove_1.png",
            "assets/img/backgrounds/page_1/grove_2.png",
            "assets/img/backgrounds/page_1/grove_3.png",
            "assets/img/backgrounds/page_1/grove_end.png",

            // Cidade
            "assets/img/backgrounds/cards_city/card_ferraria.png",
            "assets/img/backgrounds/cards_city/card_market.png",
            "assets/img/backgrounds/cards_city/card_nursing.png",

        ];

    }

    preloadImage(src) {

        return new Promise(resolve => {

            const image = new Image();

            image.onload = resolve;

            image.onerror = resolve;

            image.src = src;

        });

    }

    async load(onProgress = null) {

        const total = this.assets.length;

        let loaded = 0;

        for (const asset of this.assets) {

            await this.preloadImage(asset);

            loaded++;

            if (onProgress) {

                onProgress(Math.floor((loaded / total) * 100));

            }

        }

    }

}