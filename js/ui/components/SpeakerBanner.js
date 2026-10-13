import SpeakerService from "../../services/SpeakerService.js";

const ICON_SRC = "assets/img/icons/alto-falante.png";

// Quantos caracteres por segundo de animação — mensagem longa demora
// mais pra atravessar a tela, senão passaria rápido demais pra ler.
const CHARS_PER_SECOND = 14;
const MIN_DURATION_S = 8;
const MAX_DURATION_S = 20;

// Aviso do Alto Falante (ver SpeakerService.js/SpeakerModal.js) — só
// desenha o que CHEGAR enquanto a tela estiver aberta, nunca o que já
// tinha sido mandado antes. Fica fora do HudScreen (que é reconstruído
// com frequência) igual o painel do chat, senão perderia a fila no
// meio de uma animação.
export default class SpeakerBanner {

    constructor() {
        this.stopListening = null;
        this.queue = [];
        this.showing = false;
    }

    // Liga ao entrar no HUD (ver HudScreen.show()) — chamar de novo com
    // o listener já ligado não faz nada, evita vazar um segundo.
    start() {

        if (this.stopListening) return;

        this.stopListening = SpeakerService.listen(message => {
            this.queue.push(message);
            this.processQueue();
        });

    }

    // Desliga ao sair do HUD (ver Game.showScreen) — senão fica
    // escutando pra sempre depois do jogador sair da conta.
    stop() {
        this.stopListening?.();
        this.stopListening = null;
        this.queue = [];
    }

    processQueue() {

        if (this.showing || !this.queue.length) return;

        const message = this.queue.shift();

        this.display(message);

    }

    display(message) {

        this.showing = true;

        const duration = Math.min(
            MAX_DURATION_S,
            Math.max(MIN_DURATION_S, message.text.length / CHARS_PER_SECOND)
        );

        const banner = document.createElement("div");
        banner.className = "speaker-banner";
        banner.innerHTML = `
            <img class="speaker-banner-icon" src="${ICON_SRC}" alt="Alto Falante">
            <div class="speaker-banner-track">
                <span class="speaker-banner-text" style="animation-duration:${duration}s">
                    <strong>${escapeHtml(message.name)}:</strong> ${escapeHtml(message.text)}
                </span>
            </div>
        `;

        document.body.appendChild(banner);

        const textEl = banner.querySelector(".speaker-banner-text");

        let done = false;

        const cleanup = () => {

            if (done) return;
            done = true;

            banner.remove();
            this.showing = false;
            this.processQueue();

        };

        textEl.addEventListener("animationend", cleanup);

        // Rede de segurança: se o evento não disparar por algum motivo
        // (aba em segundo plano, etc.), o aviso não fica preso pra
        // sempre na tela nem trava a fila pros próximos.
        setTimeout(cleanup, (duration + 2) * 1000);

    }

}

function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}
