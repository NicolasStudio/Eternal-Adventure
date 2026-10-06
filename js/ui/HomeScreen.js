import NewsModal from "../ui/NewsModal.js";
import SaveService from "../services/SaveService.js";
import SettingsModal from "./components/modals/SettingsModal.js";
import MusicService from "../services/MusicService.js";
import NameEntryModal from "./components/modals/NameEntryModal.js";
import CharacterSelectModal from "./components/modals/CharacterSelectModal.js";

export default class HomeScreen {

    constructor(game) {
        this.game = game;
        this.element = document.getElementById("home-screen");

        this.newsModal = new NewsModal();
        this.settingsModal = new SettingsModal(game);
        this.nameEntryModal = new NameEntryModal();
        this.characterSelectModal = new CharacterSelectModal();

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
                    Beta 0.1
                </small>
            </div>
        `;
    }

    bindEvents() {

        this.element
            .querySelector("#btn-new-game")
            .addEventListener("click", async () => {

                const confirmed = await this.confirmNewGame();

                if (!confirmed) return;

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
            ?.addEventListener("click", async () => {

                const data = SaveService.loadFromLocalStorage();

                if (!data || !SaveService.isValidSave(data)) return;

                // Mostra o personagem da conta (e o slot bloqueado) antes
                // de entrar — só carrega se o jogador escolher jogar.
                const play = await this.characterSelectModal.show(data);

                if (!play) return;

                SaveService.applyLoadedData(this.game, data);

            });

        this.element
            .querySelector("#btn-settings")
            ?.addEventListener("click", () => {

                this.settingsModal.show();

            });

    }

    // "Novo Jogo" sobrepõe o save da conta (só existe um por conta) —
    // confirma antes de deixar seguir pro nome/classe, pra não perder
    // progresso por engano.
    confirmNewGame() {

        return new Promise(resolve => {

            const overlay = document.createElement("div");
            overlay.className = "home-confirm-overlay";
            overlay.innerHTML = `
                <div class="home-confirm-modal">
                    <p>Ao criar um novo jogo, os dados salvos serão sobrepostos/perdidos. Tem certeza?</p>
                    <div class="home-confirm-actions">
                        <button class="home-confirm-yes" id="home-confirm-yes">Sim</button>
                        <button class="home-confirm-no" id="home-confirm-no">Não</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const cleanup = (result) => {
                overlay.remove();
                resolve(result);
            };

            overlay.querySelector("#home-confirm-yes").addEventListener("click", () => cleanup(true));
            overlay.querySelector("#home-confirm-no").addEventListener("click", () => cleanup(false));

        });

    }

    show() {
        // O save local depende de QUAL conta está logada — recalcula a
        // cada vez que a Home aparece, não só quando ela foi montada.
        const continueButton = this.element.querySelector("#btn-continue");
        if (continueButton) continueButton.disabled = !SaveService.hasLocalSave();
        this.element.classList.remove("hidden");
        MusicService.play("home");
    }

    hide() {
        this.characterSelectModal.hide();
        this.element.classList.add("hidden");
    }

}