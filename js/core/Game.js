// Classe principal do jogo.
import HomeScreen from "../ui/HomeScreen.js";
import ClassSelectionScreen from "../ui/ClassSelectionScreen.js";
import HudScreen from "../ui/HudScreen.js";

export default class Game {

    constructor() {

        this.player = null;

        this.homeScreen = new HomeScreen(this);

        this.classSelectionScreen = new ClassSelectionScreen(this);

        this.hudScreen = new HudScreen(this);
    }

    start() {

        this.showScreen("home");

    }

    showScreen(screen) {

        document
            .getElementById("home-screen")
            .classList.add("hidden");

        document
            .getElementById("class-selection-screen")
            .classList.add("hidden");

        document
            .getElementById("hud-screen")
            .classList.add("hidden");

        switch (screen) {

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