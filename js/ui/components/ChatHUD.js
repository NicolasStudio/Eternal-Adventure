import ChatService, { MAX_LENGTH } from "../../services/ChatService.js";
import AuthService from "../../services/AuthService.js";
import SaveService from "../../services/SaveService.js";
import TabBadge from "../TabBadge.js";
import ADMIN_UIDS from "../../data/admins.js";

const MAX_RENDERED_MESSAGES = 100;

// Margem mínima da borda da tela — tanto na posição inicial quanto
// arrastando, o painel nunca fica mais perto do que isso de nenhuma
// borda (ver positionPanel/bindDrag). O painel agora tem tamanho FIXO
// (.chat-panel no chat.css) em vez de esticar sozinho, que era o que
// fazia ele parecer "preso" no rodapé — o rodapé do painel estourava
// pra fora da viewport quando abria perto da base da tela.
const SCREEN_MARGIN = 12;

export default class ChatHUD {

    constructor(game) {
        this.game = game;
        this.panel = null;
        this.nodes = new Map();
        this.unread = 0;
        this.stopPanel = null;
        this.stopWatching = null;
        // uid de quem está no #1 do ranking AGORA — carregado toda vez
        // que o painel abre (ver open()), pra decidir quem ganha a
        // coroa ao lado do nome nas mensagens (ver addMessage()).
        this.topPlayerUid = null;

        // Voltou pra aba com o painel aberto = leu o que chegou enquanto
        // estava em outra aba.
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden && this.isOpen && this.unread > 0) {
                this.unread = 0;
                this.updateBadge();
            }
        });
    }

    // Só o botão fica no HUD (que é reconstruído com frequência) — o
    // painel vive fora dele, no body, senão cada reconstrução apagaria
    // as mensagens, o texto digitado e a posição da rolagem. O contador
    // de não lidas também fica guardado aqui (não no botão) e é
    // redesenhado junto com ele.
    renderButton() {
        return `
            <button class="hud-tool chat-toggle ${this.unread > 0 ? "has-unread" : ""}" id="chat-toggle" data-tooltip="Chat">
                <i class="fa-solid fa-comments"></i>
                <span class="chat-badge" id="chat-badge" ${this.unread > 0 ? "" : "hidden"}>${this.badgeText()}</span>
            </button>
        `;
    }

    badgeText() {
        return this.unread > 9 ? "9+" : String(this.unread);
    }

    updateBadge() {

        // Título/ícone da aba do navegador (ver TabBadge.js) — atualiza
        // mesmo sem o botão na tela.
        TabBadge.set(this.unread);

        const button = document.getElementById("chat-toggle");
        const badge = document.getElementById("chat-badge");

        if (!button || !badge) return;

        badge.textContent = this.badgeText();
        badge.hidden = this.unread === 0;
        button.classList.toggle("has-unread", this.unread > 0);

    }

    registerEvents(container = document) {

        const button = container.querySelector("#chat-toggle");

        // Sem botão = HUD fora da tela: fecha o painel se ele tinha
        // ficado aberto e para de ouvir. (O botão aparece em todas as
        // telas do jogo, inclusive combate, PVP e Cooperativo.)
        if (!button) {
            this.close();
            this.watch(false);
            return;
        }

        button.addEventListener("click", () => this.toggle());

        this.watch(true);

    }

    // Fica ouvindo o chat enquanto o botão está na tela, só pra avisar
    // de mensagem nova quando o painel está fechado. Compartilha a
    // mesma conexão do painel (ver ChatService.subscribe).
    watch(active) {

        if (!active) {
            this.stopWatching?.();
            this.stopWatching = null;
            return;
        }

        if (this.stopWatching) return;

        const myUid = AuthService.getCurrentUser()?.uid;

        this.stopWatching = ChatService.subscribe(
            (message, isNew) => {

                // Painel aberto só conta como "lido" se a aba estiver
                // visível — em outra aba, conta igual painel fechado.
                if (!isNew || message.uid === myUid) return;
                if (this.isOpen && !document.hidden) return;

                this.unread++;
                this.updateBadge();

            },
            () => {}
        );

    }

    // Sair do jogo/deslogar: fecha tudo e zera o aviso.
    shutdown() {
        this.close();
        this.watch(false);
        this.unread = 0;
        TabBadge.set(0);
    }

    get isOpen() {
        return this.panel !== null;
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    async open() {

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
        this.bindDrag();

        // Abrir o painel = leu tudo.
        this.unread = 0;
        this.updateBadge();

        this.panel.querySelector("#chat-input").focus();

        // Quem está no #1 do ranking AGORA — pra saber quem ganha a
        // coroa nas mensagens (ver addMessage()). Busca ANTES de
        // assinar o chat, pra nenhuma mensagem já chegar sem essa
        // informação pronta. Fechou o painel enquanto isso carregava
        // (busca rápida, mas é rede) — não assina nada à toa.
        this.topPlayerUid = await SaveService.getTopPlayerUid();

        if (!this.isOpen) return;

        this.stopPanel = ChatService.subscribe(
            message => this.addMessage(message),
            id => this.removeMessage(id)
        );

    }

    close() {

        if (!this.panel) return;

        this.stopPanel?.();
        this.stopPanel = null;

        this.panel.remove();
        this.panel = null;
        this.nodes.clear();

    }

    // Fora de combate encaixa logo abaixo do HUD do jogador. Em combate
    // encaixa abaixo do próprio botão, pra não cobrir o HUD/aliado do
    // 2x2 — e no Cooperativo, que nem tem HUD do jogador, é o único
    // ponto de referência que existe.
    positionPanel() {

        const inCombat = !document.querySelector(".hud-header.exploration");
        const anchor = inCombat
            ? document.getElementById("chat-toggle")
            : document.querySelector(".hud-panel");
        const rect = anchor?.getBoundingClientRect();

        const rawTop = (rect?.bottom ?? 120) + 12;
        const rawLeft = rect?.left ?? 20;

        // Tamanho fixo (ver .chat-panel no chat.css) — só precisa travar
        // dentro da tela, não calcular mais nada dinâmico.
        const maxTop = Math.max(SCREEN_MARGIN, window.innerHeight - this.panel.offsetHeight - SCREEN_MARGIN);
        const maxLeft = Math.max(SCREEN_MARGIN, window.innerWidth - this.panel.offsetWidth - SCREEN_MARGIN);

        this.panel.style.top = `${Math.min(rawTop, maxTop)}px`;
        this.panel.style.left = `${Math.min(rawLeft, maxLeft)}px`;

    }

    // Arrasta o painel pelo cabeçalho (exceto o botão de fechar) — só
    // atualiza top/left em px, do mesmo jeito que positionPanel() já
    // posiciona (position:fixed no CSS). Usa Pointer Events + captura:
    // funciona com mouse e toque, e continua seguindo o dedo/cursor
    // mesmo que ele saia de cima do cabeçalho durante o arrasto.
    bindDrag() {

        const header = this.panel.querySelector(".chat-header");

        header.addEventListener("pointerdown", event => {

            if (event.target.closest("#chat-close")) return;

            event.preventDefault();

            const startX = event.clientX;
            const startY = event.clientY;
            const startLeft = this.panel.offsetLeft;
            const startTop = this.panel.offsetTop;

            header.setPointerCapture(event.pointerId);
            header.classList.add("dragging");

            const onMove = moveEvent => {

                // Trava dentro da tela — nunca deixa arrastar o painel
                // (de tamanho fixo) pra fora por completo e "perder" ele.
                const maxLeft = Math.max(SCREEN_MARGIN, window.innerWidth - this.panel.offsetWidth - SCREEN_MARGIN);
                const maxTop = Math.max(SCREEN_MARGIN, window.innerHeight - this.panel.offsetHeight - SCREEN_MARGIN);

                const left = Math.min(Math.max(SCREEN_MARGIN, startLeft + (moveEvent.clientX - startX)), maxLeft);
                const top = Math.min(Math.max(SCREEN_MARGIN, startTop + (moveEvent.clientY - startY)), maxTop);

                this.panel.style.left = `${left}px`;
                this.panel.style.top = `${top}px`;

            };

            const onUp = () => {
                header.classList.remove("dragging");
                header.removeEventListener("pointermove", onMove);
            };

            header.addEventListener("pointermove", onMove);
            header.addEventListener("pointerup", onUp, { once: true });

        });

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

        // Admin: identidade FIXA (ver data/admins.js), diferente do #1
        // do ranking (que muda com o Poder de quem quer que seja). Cor
        // do nome vem daqui; o selo (ícone) é adicionado mais abaixo,
        // junto com a coroa.
        const isAdmin = message.uid && ADMIN_UIDS.includes(message.uid);

        if (isAdmin) {
            row.classList.add("admin");
        }

        const name = document.createElement("span");
        name.className = "chat-name";
        name.textContent = message.name;

        // #1 do ranking (Poder) no momento em que o painel abriu — ver
        // open()/SaveService.getTopPlayerUid(). Ícone à parte (nunca
        // dentro do textContent do nome), pra não ter risco nenhum de
        // injeção vindo do nome de outro jogador.
        if (message.uid && message.uid === this.topPlayerUid) {
            const crown = document.createElement("i");
            crown.className = "fa-solid fa-crown chat-crown";
            crown.title = "#1 do servidor";
            name.append(crown);
        }

        if (isAdmin) {
            const shield = document.createElement("i");
            shield.className = "fa-solid fa-shield-halved chat-admin-badge";
            shield.title = "Admin";
            name.append(shield);
        }

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
