import LoadingScreen from "../ui/LoadingScreen.js";
import AssetLoader from "./AssetLoader.js";

export default class Loader {

    constructor(game) {

        this.game = game;

        this.loadingScreen = new LoadingScreen(game);

        this.assetLoader = new AssetLoader();

    }

    async start() {

        // Exibe a tela de loading
        this.loadingScreen.show();

        // Pequeno atraso para permitir a renderização da tela
        await this.delay(300);

        // Carrega os assets
        await this.assetLoader.load(percent => {

            // Futuramente será usada uma barra de progresso.
            // Por enquanto apenas mantemos o callback.

            // this.loadingScreen.setProgress(percent);

        });

        // Tempo mínimo para que o usuário veja o logo
        await this.delay(1200);

        // Esconde a tela de loading
        await this.loadingScreen.hide();

    }

    delay(ms) {

        return new Promise(resolve => setTimeout(resolve, ms));

    }

}