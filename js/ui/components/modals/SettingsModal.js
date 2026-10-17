import SaveService from "../../../services/SaveService.js";
import AuthService from "../../../services/AuthService.js";
import PresenceService from "../../../services/PresenceService.js";
import AudioSettings from "../../../services/AudioSettings.js";
import MusicService from "../../../services/MusicService.js";
import AccountDangerModal from "./AccountDangerModal.js";
import DeleteCharacterModal from "./DeleteCharacterModal.js";
import Toast from "../Toast.js";

export default class SettingsModal {

    constructor(game, { inGame = false } = {}) {
        this.game = game;
        this.inGame = inGame;
        this.modal = null;
        this.settings = AudioSettings.get();
        this.dangerModal = new AccountDangerModal();
        this.deleteCharacterModal = new DeleteCharacterModal();
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

        // Qual instância (HomeScreen ou HudScreen) está aberta agora —
        // ver o listener de fullscreenchange em registerEvents().
        SettingsModal.activeInstance = this;

    }

    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        if (SettingsModal.activeInstance === this) {
            SettingsModal.activeInstance = null;
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
                    <h3>Tela</h3>
                    <button class="settings-fullscreen-button" id="settings-fullscreen">
                        <i class="fa-solid ${this.isFullscreen() ? "fa-down-left-and-up-right-to-center" : "fa-up-right-and-down-left-from-center"}"></i>
                        ${this.isFullscreen() ? "Minimizar" : "Maximizar"}
                    </button>
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

                ${!this.inGame ? `
                    <section class="settings-section settings-danger-zone">
                        <h3>Zona de Perigo</h3>
                        <p class="settings-danger-warning">Ação permanente e não pode ser desfeita.</p>
                        <div class="settings-danger-actions">
                            <button class="settings-danger-button" id="settings-delete-character">
                                <i class="fa-solid fa-user-slash"></i>
                                Excluir Personagem
                            </button>
                            <button class="settings-danger-button" id="settings-delete-account">
                                <i class="fa-solid fa-trash"></i>
                                Excluir Conta e Personagens
                            </button>
                        </div>
                    </section>
                ` : ""}

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

        this.modal.querySelector("#settings-fullscreen")?.addEventListener("click", () => {
            this.toggleFullscreen();
        });

        // Atualiza o ícone/texto sozinho se o jogador sair da tela cheia
        // por fora (Esc, F11) em vez de clicar aqui de novo — um só
        // listener pra sessão inteira; refresh() só mexe em algo se ESTE
        // modal for o que está aberto no momento (os dois, de HomeScreen
        // e HudScreen, podem existir, mas só um por vez fica montado).
        if (!SettingsModal.fullscreenListenerBound) {
            document.addEventListener("fullscreenchange", () => {
                SettingsModal.activeInstance?.refresh();
            });
            SettingsModal.fullscreenListenerBound = true;
        }

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

        this.modal.querySelector("#settings-delete-character")?.addEventListener("click", () => {
            this.deleteCharacterModal.show();
        });

        this.modal.querySelector("#settings-delete-account")?.addEventListener("click", async () => {

            const password = await this.dangerModal.confirmDeleteAccount();

            if (!password) return;

            const user = AuthService.getCurrentUser();

            if (!user) {
                Toast.show("Entre na sua conta pra excluir ela.");
                return;
            }

            try {

                // Reautentica ANTES de apagar qualquer dado — confirma a
                // senha logo de cara, em vez de apagar o progresso todo
                // pra só depois descobrir que a senha estava errada.
                await AuthService.reauthenticate(password);

                await SaveService.deleteAccountData(user.uid);

                // Libera a vaga da sessão única ANTES de apagar o login —
                // depois dele as regras do Realtime Database recusam a
                // escrita (auth.uid deixa de existir).
                await PresenceService.release();

                await AuthService.deleteCurrentUser();

                this.hide();
                this.game.player = null;
                this.game.showScreen("login");

                Toast.show("Conta excluída.");

            } catch (err) {

                console.warn("Falha ao excluir a conta:", err);

                const message = err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
                    ? "Senha incorreta — tente de novo."
                    : "Não foi possível excluir a conta. Tente de novo.";

                Toast.show(message);

            }

        });

    }

    isFullscreen() {
        return !!document.fullscreenElement;
    }

    async toggleFullscreen() {

        try {
            if (!document.fullscreenElement) {
                // A página INTEIRA entra em tela cheia (documentElement),
                // não só #game — todo modal do jogo (Configurações
                // incluído) é anexado direto em document.body
                // (document.body.appendChild), fora de #game. Pedindo
                // fullscreen só em #game, qualquer modal aberto no
                // momento virava invisível E parava de receber clique
                // (fica fora da "top layer" da tela cheia) — inclusive
                // o próprio modal de Configurações, de onde esse botão é
                // clicado, travando o jogo inteiro sem resposta a clique
                // nenhum.
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (e) {
        }

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
