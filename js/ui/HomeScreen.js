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

                // Usa um slot livre sem perguntar nada. Só pergunta se todos
                // estiverem ocupados, porque aí o personagem ativo é sobrescrito.
                const freeSlot = SaveService.pickNewSlot();

                if (!freeSlot) {

                    const confirmed = await this.confirmNewGame();

                    if (!confirmed) return;

                }

                await this.startNewCharacter(freeSlot ?? SaveService.activeSlot);

            });

        this.element
            .querySelector("#btn-news")
            .addEventListener("click", () => {

                this.newsModal.show();

            });

        this.element
            .querySelector("#btn-continue")
            ?.addEventListener("click", async () => {

                const container = SaveService.loadFromLocalStorage();

                if (!container) return;

                SaveService.useContainer(container);

                // Mostra os personagens da conta (e os slots bloqueados) antes
                // de entrar — só carrega se o jogador escolher um deles.
                const choice = await this.characterSelectModal.show(container, SaveService.maxSlots);

                if (!choice) return;

                if (choice.create) {
                    await this.startNewCharacter(choice.create);
                    return;
                }

                SaveService.applyLoadedData(this.game, choice.slot);

            });

        this.element
            .querySelector("#btn-settings")
            ?.addEventListener("click", () => {

                this.settingsModal.show();

            });

    }

    // Pede o nome e segue pra escolha de classe, já no slot de destino.
    async startNewCharacter(slot) {

        const name = await this.nameEntryModal.show();

        if (!name) return;

        this.game.pendingPlayerName = name;
        this.game.pendingSlot = slot;

        this.game.showScreen("class");

    }

    // Todos os slots estão ocupados: criar um personagem sobrescreve o ativo,
    // então confirma antes de deixar seguir, pra não perder progresso por engano.
    confirmNewGame() {

        return new Promise(resolve => {

            const overlay = document.createElement("div");
            overlay.className = "home-confirm-overlay";
            overlay.innerHTML = `
                <div class="home-confirm-modal">
                    <p>Todos os seus personagens estão em uso. Criar um novo sobrescreve o personagem atual. Tem certeza?</p>
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

        // Garante a conta em memória (Home aberta sem passar pelo login).
        SaveService.useContainer(SaveService.container ?? SaveService.loadFromLocalStorage());
        this.element.classList.remove("hidden");
        MusicService.play("home");
    }

    hide() {
        this.characterSelectModal.hide();
        this.element.classList.add("hidden");
    }

}