import SaveService from "../../../services/SaveService.js";
import AudioSettings from "../../../services/AudioSettings.js";
import Toast from "../Toast.js";

export default class SettingsModal {

    constructor(game) {
        this.game = game;
        this.modal = null;
        this.confirmingClear = false;
        this.settings = AudioSettings.get();
    }

    show() {
        this.settings = AudioSettings.get();
        this.confirmingClear = false;
        this.mount();
    }

    mount() {

        this.hide();

        this.modal = document.createElement("div");
        this.modal.className = "modal-overlay";
        this.modal.innerHTML = this.render();

        document.body.appendChild(this.modal);

        this.registerEvents();

    }

    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    refresh() {
        if (!this.modal) return;
        this.modal.innerHTML = this.render();
        this.registerEvents();
    }

    render() {
        return `
            <div class="settings-modal">

                <header class="settings-header">
                    <h2>Configurações</h2>
                    <button class="settings-close" id="settings-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <section class="settings-section">
                    <h3>Áudio</h3>

                    <div class="settings-row">
                        <label class="settings-checkbox">
                            <input type="checkbox" id="settings-music-enabled" ${this.settings.musicEnabled ? "checked" : ""}>
                            Música
                        </label>
                        <input
                            type="range"
                            id="settings-music-volume"
                            min="0" max="100"
                            value="${this.settings.musicVolume}"
                            ${this.settings.musicEnabled ? "" : "disabled"}>
                    </div>

                    <div class="settings-row">
                        <label class="settings-checkbox">
                            <input type="checkbox" id="settings-sfx-enabled" ${this.settings.sfxEnabled ? "checked" : ""}>
                            Efeitos sonoros
                        </label>
                        <input
                            type="range"
                            id="settings-sfx-volume"
                            min="0" max="100"
                            value="${this.settings.sfxVolume}"
                            ${this.settings.sfxEnabled ? "" : "disabled"}>
                    </div>
                </section>

                <section class="settings-section">
                    <h3>Dados</h3>
                    <button class="settings-danger-button" id="settings-clear-data">
                        <i class="fa-solid fa-trash"></i>
                        Limpar dados salvos
                    </button>
                </section>

                <footer class="settings-footer">
                    <button class="settings-exit-button" id="settings-exit">
                        <i class="fa-solid fa-door-open"></i>
                        Sair
                    </button>
                </footer>

            </div>

            ${this.confirmingClear ? this.renderConfirmClear() : ""}
        `;
    }

    renderConfirmClear() {
        return `
            <div class="settings-confirm-overlay" id="settings-confirm-overlay">
                <div class="settings-confirm-modal">
                    <p>
                        Isso vai apagar todo o progresso salvo neste
                        navegador. Essa ação não pode ser desfeita.
                        Deseja continuar?
                    </p>
                    <div class="settings-confirm-actions">
                        <button class="settings-confirm-yes" id="settings-confirm-yes">Sim, apagar</button>
                        <button class="settings-confirm-no" id="settings-confirm-no">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
    }

    registerEvents() {

        this.modal.querySelector("#settings-close")?.addEventListener("click", () => {
            this.hide();
        });

        this.modal.querySelector("#settings-music-enabled")?.addEventListener("change", (event) => {
            this.settings.musicEnabled = event.target.checked;
            AudioSettings.save(this.settings);
            this.refresh();
        });

        this.modal.querySelector("#settings-sfx-enabled")?.addEventListener("change", (event) => {
            this.settings.sfxEnabled = event.target.checked;
            AudioSettings.save(this.settings);
            this.refresh();
        });

        this.modal.querySelector("#settings-music-volume")?.addEventListener("input", (event) => {
            this.settings.musicVolume = Number(event.target.value);
            AudioSettings.save(this.settings);
        });

        this.modal.querySelector("#settings-sfx-volume")?.addEventListener("input", (event) => {
            this.settings.sfxVolume = Number(event.target.value);
            AudioSettings.save(this.settings);
        });

        this.modal.querySelector("#settings-clear-data")?.addEventListener("click", () => {
            this.confirmingClear = true;
            this.refresh();
        });

        this.modal.querySelector("#settings-confirm-yes")?.addEventListener("click", () => {
            SaveService.clearLocalSave();
            Toast.show("Dados apagados.");
            this.hide();
        });

        this.modal.querySelector("#settings-confirm-no")?.addEventListener("click", () => {
            this.confirmingClear = false;
            this.refresh();
        });

        this.modal.querySelector("#settings-exit")?.addEventListener("click", () => {
            this.hide();
            this.game.showScreen("home");
        });

    }

}
