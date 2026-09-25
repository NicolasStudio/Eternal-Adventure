import HomeScreen from "../ui/HomeScreen.js";
import ClassSelectionScreen from "../ui/ClassSelectionScreen.js";
import HudScreen from "../ui/HudScreen.js";
import LoginScreen from "../ui/LoginScreen.js";

import Loader from "./Loader.js";
import AuthService from "../services/AuthService.js";
import SaveService from "../services/SaveService.js";

export default class Game {

    constructor() {

        this.player = null;

        this.loginScreen = new LoginScreen(this);

        this.homeScreen = new HomeScreen(this);

        this.classSelectionScreen = new ClassSelectionScreen(this);

        this.hudScreen = new HudScreen(this);

    }

    async start() {

        const loader = new Loader(this);

        // Carrega os assets e verifica a sessão do Firebase em
        // paralelo — assim, quando a tela de loading some, o destino
        // certo (login/home/hud) já está decidido e visível por trás,
        // sem piscar a tela de login por um instante antes de corrigir.
        const [, user] = await Promise.all([
            loader.load(),
            this.waitForAuthState()
        ]);

        if (user) {
            await this.enterWithAccount(user);
        } else {
            this.showScreen("login");
        }

        await loader.hide();

    }

    // Só a primeira notificação do Firebase Auth interessa aqui — ela
    // já vem com a sessão persistida (se tiver) sem precisar de
    // nenhuma outra chamada de rede.
    waitForAuthState() {

        return new Promise(resolve => {

            const unsubscribe = AuthService.onAuthStateChanged(user => {
                unsubscribe();
                resolve(user);
            });

        });

    }

    // Chamado tanto no boot (sessão já logada) quanto logo após um
    // login/cadastro bem-sucedido em LoginScreen: se já existe save na
    // nuvem, entra direto no jogo; senão manda pra Home criar
    // personagem (fluxo de "Novo Jogo" continua igual).
    async enterWithAccount(user) {

        const cloudData = await SaveService.loadFromCloud(user.uid);

        if (cloudData && SaveService.isValidSave(cloudData)) {
            SaveService.applyLoadedData(this, cloudData);
        } else {
            this.showScreen("home");
        }

    }

    showScreen(screen) {

        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("home-screen").classList.add("hidden");
        document.getElementById("class-selection-screen").classList.add("hidden");
        document.getElementById("hud-screen").classList.add("hidden");

        switch (screen) {

            case "login":
                this.loginScreen.show();
                break;

            case "home":
                this.homeScreen.show();
                break;

            case "class":
                this.classSelectionScreen.show();
                break;

            case "hud":
                this.hudScreen.show();
                break;

        }

    }

}