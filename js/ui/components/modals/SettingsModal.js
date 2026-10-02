import SaveService from "../../../services/SaveService.js";
import AuthService from "../../../services/AuthService.js";
import PresenceService from "../../../services/PresenceService.js";
import AudioSettings from "../../../services/AudioSettings.js";
import MusicService from "../../../services/MusicService.js";

export default class SettingsModal {

    constructor(game, { inGame = false } = {}) {
        this.game = game;
        this.inGame = inGame;
        this.modal = null;
        this.settings = AudioSettings.get();
    }

    show() {
        this.settings = AudioSettings.get();
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
                    <button class="close-btn settings-close" id="settings-close">
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
                    <h3>Agradecimentos</h3>
                    <a href="acknowledgments.html" class="acknowledgments" target="_blank">Ver sobre</a>
                </section>

                <section class="settings-section">
                    <h3>Reportar Bug</h3>
                    <a
                        href="mailto:Eternal.Adventure.Idle@gmail.com?subject=${encodeURIComponent("[Bug] Eternal Adventure")}&body=${encodeURIComponent("Descreva aqui o que aconteceu, e se possível, o que você esperava que acontecesse em vez disso:\n\n\n\n(Se puder, anexe um print depois de enviar este e-mail — ajuda bastante!)")}"
                        class="report-bug-link">
                        <i class="fa-solid fa-bug"></i>
                        Enviar e-mail de report
                    </a>
                </section>

                <footer class="settings-footer">
                    ${this.inGame ? `
                        <button class="settings-exit-button" id="settings-exit">
                            <i class="fa-solid fa-door-open"></i>
                            Sair do Jogo
                        </button>
                    ` : ""}
                    <button class="settings-exit-button" id="settings-logout">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        Sair da conta
                    </button>
                </footer>

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
            MusicService.refreshSettings();
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
            MusicService.refreshSettings();
            this.checkSilenceAchievement();
        });

        this.modal.querySelector("#settings-sfx-volume")?.addEventListener("input", (event) => {
            this.settings.sfxVolume = Number(event.target.value);
            AudioSettings.save(this.settings);
            this.checkSilenceAchievement();
        });

        this.modal.querySelector("#settings-exit")?.addEventListener("click", () => {
            this.hide();
            this.game.showScreen("home");
        });

        this.modal.querySelector("#settings-logout")?.addEventListener("click", async () => {

            // Espera a nuvem ANTES de deslogar (depois do signOut o
            // Firestore recusa a escrita) e só então limpa o save local
            // — senão a próxima conta a logar neste navegador puxaria
            // esse personagem.
            if (this.game.player) {
                await SaveService.autoSave(this.game.player);
            }

            // Libera a vaga da sessão única ANTES do signOut — depois
            // dele as regras do Realtime Database recusam a escrita
            // (auth.uid deixa de existir), e a vaga ficaria presa até o
            // timeout do heartbeat em vez de liberar na hora.
            await PresenceService.release();

            await AuthService.signOut();

            SaveService.clearLocalSave();

            this.hide();
            this.game.player = null;
            this.game.showScreen("login");

        });

    }

    // Conquista "Shiii, faça silêncio..." mora em AchievementService,
    // não em nenhuma ação do player — precisa desse gancho manual
    // porque mudar o volume aqui nunca chama player.notify() (que é o
    // que dispara checkAchievements() em todo o resto do jogo, via
    // HudScreen.updateHUD()). Esse modal também abre direto da tela
    // inicial (antes de existir personagem), daí o guard.
    checkSilenceAchievement() {

        if (!this.game.player) return;

        this.game.hudScreen.checkAchievements();

    }

}
