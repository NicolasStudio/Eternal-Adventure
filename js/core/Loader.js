import LoadingScreen from "../ui/LoadingScreen.js";
import AssetLoader from "./AssetLoader.js";

export default class Loader {

    constructor(game) {

        this.game = game;

        this.loadingScreen = new LoadingScreen(game);

        this.assetLoader = new AssetLoader();

    }

    async start() {

        await this.load();

        await this.hide();

    }

    // Mostra a tela de loading e carrega os assets, mas NÃO esconde
    // no final — quem chama decide quando esconder (dá tempo de
    // resolver coisas em paralelo, tipo checar login, sem piscar a
    // tela de trás antes da hora).
    async load() {

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

    }

    async hide() {
        await this.loadingScreen.hide();
    }

    delay(ms) {

        return new Promise(resolve => setTimeout(resolve, ms));

    }

}