import ChatService, { MAX_LENGTH } from "../../services/ChatService.js";
import AuthService from "../../services/AuthService.js";

const MAX_RENDERED_MESSAGES = 100;

export default class ChatHUD {

    constructor(game) {
        this.game = game;
        this.panel = null;
        this.nodes = new Map();
    }

    // Só o botão fica no HUD (que é reconstruído com frequência) — o
    // painel vive fora dele, no body, senão cada reconstrução apagaria
    // as mensagens, o texto digitado e a posição da rolagem.
    renderButton() {
        return `
            <button class="chat-toggle" id="chat-toggle" title="Chat global">
                <i class="fa-solid fa-comments"></i>
            </button>
        `;
    }

    registerEvents(container = document) {

        const button = container.querySelector("#chat-toggle");

        // Sem botão = tela sem chat (combate, PVP, Cooperativo): fecha
        // o painel se ele tinha ficado aberto.
        if (!button) {
            this.close();
            return;
        }

        button.addEventListener("click", () => this.toggle());

    }

    get isOpen() {
        return this.panel !== null;
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {

        if (this.isOpen) return;

        this.panel = document.createElement("div");
        this.panel.className = "chat-panel";
        this.panel.innerHTML = `
            <header class="chat-header">
                <h3><i class="fa-solid fa-comments"></i> Chat global</h3>
                <button class="close-btn chat-close" id="chat-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>

            <div class="chat-messages" id="chat-messages">
                <p class="chat-empty">Nenhuma mensagem na última hora.</p>
            </div>

            <p class="chat-error" id="chat-error" hidden></p>

            <div class="chat-form">
                <textarea
                    id="chat-input"
                    class="chat-input"
                    rows="2"
                    maxlength="${MAX_LENGTH}"
                    placeholder="Digite sua mensagem..."></textarea>
                <button class="chat-send" id="chat-send">Enviar</button>
            </div>

            <span class="chat-count" id="chat-count">0/${MAX_LENGTH}</span>
        `;

        document.body.appendChild(this.panel);

        this.positionPanel();
        this.bindPanelEvents();

        ChatService.start(
            message => this.addMessage(message),
            id => this.removeMessage(id)
        );

        this.panel.querySelector("#chat-input").focus();

    }

    close() {

        if (!this.panel) return;

        ChatService.stop();

        this.panel.remove();
        this.panel = null;
        this.nodes.clear();

    }

    // Encaixa o painel logo abaixo do HUD do jogador.
    positionPanel() {

        const hud = document.querySelector(".hud-panel");
        const rect = hud?.getBoundingClientRect();

        const top = (rect?.bottom ?? 120) + 12;
        const left = rect?.left ?? 20;

        this.panel.style.top = `${top}px`;
        this.panel.style.left = `${left}px`;
        this.panel.style.width = `${Math.max(rect?.width ?? 0, 280)}px`;
        this.panel.style.maxHeight = `calc(100vh - ${top}px - 20px)`;

    }

    bindPanelEvents() {

        const input = this.panel.querySelector("#chat-input");
        const count = this.panel.querySelector("#chat-count");

        this.panel.querySelector("#chat-close").addEventListener("click", () => this.close());

        this.panel.querySelector("#chat-send").addEventListener("click", () => this.send());

        input.addEventListener("input", () => {
            count.textContent = `${input.value.length}/${MAX_LENGTH}`;
        });

        input.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                this.close();
                return;
            }

            // Enter envia, Shift+Enter quebra linha.
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                this.send();
            }

        });

    }

    async send() {

        if (!this.panel) return;

        const input = this.panel.querySelector("#chat-input");
        const button = this.panel.querySelector("#chat-send");
        const count = this.panel.querySelector("#chat-count");

        button.disabled = true;

        const result = await ChatService.send(input.value, this.game.player?.name ?? "???");

        button.disabled = false;

        if (!this.panel) return;

        if (result.ok) {
            input.value = "";
            count.textContent = `0/${MAX_LENGTH}`;
            this.showError("");
        } else {
            this.showError(result.error);
        }

        input.focus();

    }

    showError(message) {

        const label = this.panel?.querySelector("#chat-error");

        if (!label) return;

        label.textContent = message;
        label.hidden = !message;

    }

    // Texto de outros jogadores NUNCA entra por innerHTML — só por
    // textContent, senão qualquer um poderia injetar HTML/script na
    // tela dos demais.
    addMessage(message) {

        if (!this.panel || this.nodes.has(message.id)) return;

        const list = this.panel.querySelector("#chat-messages");

        const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 40;

        list.querySelector(".chat-empty")?.remove();

        const row = document.createElement("div");
        row.className = "chat-message";

        if (message.uid === AuthService.getCurrentUser()?.uid) {
            row.classList.add("mine");
        }

        const name = document.createElement("span");
        name.className = "chat-name";
        name.textContent = message.name;

        const text = document.createElement("span");
        text.className = "chat-text";
        text.textContent = message.text;

        row.append(name, text);
        list.appendChild(row);

        this.nodes.set(message.id, row);

        if (this.nodes.size > MAX_RENDERED_MESSAGES) {
            const oldestId = this.nodes.keys().next().value;
            this.removeMessage(oldestId);
        }

        if (nearBottom) {
            list.scrollTop = list.scrollHeight;
        }

    }

    removeMessage(id) {

        const row = this.nodes.get(id);

        if (!row) return;

        row.remove();
        this.nodes.delete(id);

        const list = this.panel?.querySelector("#chat-messages");

        if (list && this.nodes.size === 0) {
            list.innerHTML = `<p class="chat-empty">Nenhuma mensagem na última hora.</p>`;
        }

    }

}
