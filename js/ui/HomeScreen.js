import NewsModal from "../ui/NewsModal.js";
import SaveService from "../services/SaveService.js";
import SettingsModal from "./components/modals/SettingsModal.js";
import MusicService from "../services/MusicService.js";
import NameEntryModal from "./components/modals/NameEntryModal.js";

export default class HomeScreen {

    constructor(game) {
        this.game = game;
        this.element = document.getElementById("home-screen");

        this.newsModal = new NewsModal();
        this.settingsModal = new SettingsModal(game);
        this.nameEntryModal = new NameEntryModal();

        this.render();
        this.bindEvents();
    }

    render() {
        this.element.innerHTML = `
            <div class="home">
                
            <button id="btn-news" class="btn-news">
                <img class="pergaminho" src="assets/img/icons/pergaminho.png" alt="Pergaminho" >
            </button>

            <div class="fog"></div>
                <img class="home_logo" src="assets/img/backgrounds/logo.png" alt="Eternal Adventure" >
                <div class="menu">
                    <button id="btn-new-game" class="btn-new-game">
                        Novo Jogo
                    </button>
                    <button id="btn-continue" class="btn-continue" ${SaveService.hasLocalSave() ? "" : "disabled"}>
                        Continuar
                    </button>
                    <button id="btn-settings" class="btn-settings">
                        Configurações
                    </button>
                </div>
                <small>
                    Alpha v0.11
                </small>
            </div>
        `;
    }

    bindEvents() {

        this.element
            .querySelector("#btn-new-game")
            .addEventListener("click", async () => {

                const name = await this.nameEntryModal.show();

                if (!name) return;

                this.game.pendingPlayerName = name;

                this.game.showScreen("class");

            });

        this.element
            .querySelector("#btn-news")
            .addEventListener("click", () => {

                this.newsModal.show();

            });

        this.element
            .querySelector("#btn-continue")
            ?.addEventListener("click", () => {

                const data = SaveService.loadFromLocalStorage();

                if (!data || !SaveService.isValidSave(data)) return;

                SaveService.applyLoadedData(this.game, data);

            });

        this.element
            .querySelector("#btn-settings")
            ?.addEventListener("click", () => {

                this.settingsModal.show();

            });

    }

    show() {
        this.element.classList.remove("hidden");
        MusicService.play("home");
    }

    hide() {
        this.element.classList.add("hidden");
    }

}