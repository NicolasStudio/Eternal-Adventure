import SpeakerService, { SPEAKER_MAX_LENGTH } from "../../../services/SpeakerService.js";
import AuthService from "../../../services/AuthService.js";
import Toast from "../Toast.js";

// Alto Falante — botão só aparece pra conta admin (quem decide isso é
// o HudScreen, não este arquivo, igual o Correio). Modal simples: só
// uma mensagem, sem destinatário — vai pra TODO MUNDO que estiver
// online na hora (ver SpeakerBanner.js, quem escuta e desenha o aviso).
export default class SpeakerModal {

    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.text = "";
        this.feedback = "";
    }

    get uid() {
        return AuthService.getCurrentUser()?.uid ?? null;
    }

    renderButton() {
        return `
            <button class="hud-tool speaker-toggle" id="speaker-toggle" data-tooltip="Alto Falante">
                <i class="fa-solid fa-bullhorn"></i>
            </button>
        `;
    }

    registerEvents(container = document) {
        container.querySelector("#speaker-toggle")?.addEventListener("click", () => this.show());
    }

    show() {

        this.text = "";
        this.feedback = "";

        this.overlay = document.createElement("div");
        this.overlay.className = "speaker-overlay";
        document.body.appendChild(this.overlay);

        this.overlay.addEventListener("click", event => {
            if (event.target === this.overlay) this.hide();
        });

        this.escapeHandler = event => {
            if (event.key === "Escape") this.hide();
        };
        document.addEventListener("keydown", this.escapeHandler);

        this.render();

    }

    render() {

        if (!this.overlay) return;

        this.overlay.innerHTML = `
            <div class="speaker-modal">
                <header class="speaker-header">
                    <h2><i class="fa-solid fa-bullhorn"></i> Alto Falante</h2>
                    <button class="close-btn speaker-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <label class="speaker-field">
                    <span>Digite sua mensagem</span>
                    <textarea class="speaker-textarea" maxlength="${SPEAKER_MAX_LENGTH}">${escapeHtml(this.text)}</textarea>
                </label>
                ${this.feedback ? `<p class="speaker-feedback">${escapeHtml(this.feedback)}</p>` : ""}
                <button class="speaker-send-button">Enviar</button>
            </div>
        `;

        this.overlay.querySelector(".speaker-close")?.addEventListener("click", () => this.hide());

        this.overlay.querySelector(".speaker-textarea")?.addEventListener("input", event => {
            this.text = event.target.value;
        });

        this.overlay.querySelector(".speaker-send-button")?.addEventListener("click", () => this.submit());

    }

    async submit() {

        const uid = this.uid;

        if (!uid) return;

        const result = await SpeakerService.send(uid, this.game.player.name, this.text);

        if (!result.ok) {
            this.feedback = result.error;
            this.render();
            return;
        }

        Toast.show("Mensagem enviada a todos os jogadores online.");

        this.hide();

    }

    hide() {

        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

        if (this.escapeHandler) {
            document.removeEventListener("keydown", this.escapeHandler);
            this.escapeHandler = null;
        }

    }

}

function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}
