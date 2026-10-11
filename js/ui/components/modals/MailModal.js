import MailService, { MAIL_MAX_ITEMS, MAIL_MAX_TITLE_LENGTH, MAIL_MAX_BODY_LENGTH } from "../../../services/MailService.js";
import SaveService from "../../../services/SaveService.js";
import AuthService from "../../../services/AuthService.js";
import Toast from "../Toast.js";
import FarmConfirmModal from "./FarmConfirmModal.js";

const LETTERS_PER_PAGE = 5;

// Correio (ver MailService.js) — provisório e unilateral: só a conta
// admin consegue usar a aba "Enviar" de verdade (ver MailService.isAdmin),
// todo o resto dos jogadores só recebe. O ícone (renderButton) só
// aparece na home (quem decide isso é o HudScreen, não este arquivo).
export default class MailModal {

    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.activeTab = "recebidos";
        this.letters = [];
        this.page = 0;
        this.expandedLetterId = null;
        this.hasPending = false;
        this.confirmModal = new FarmConfirmModal();
        this.composeSlots = [null, null, null];
        this.composeFeedback = "";
        // Guardados aqui (não só lidos do DOM na hora de enviar) porque
        // render() reconstrói o formulário inteiro via innerHTML sempre
        // que um slot muda — sem isso, escolher um item apagava o que
        // já tinha sido digitado nos campos.
        this.composeRecipient = "";
        this.composeTitle = "";
        this.composeBody = "";
        // Função de cancelamento do onSnapshot (ver watchPending) — null
        // quando não está escutando.
        this.stopWatching = null;
    }

    get uid() {
        return AuthService.getCurrentUser()?.uid ?? null;
    }

    get isAdminAccount() {
        return MailService.isAdmin(this.uid);
    }

    // Liga AO VIVO ao entrar na home (ver HudScreen.show()) — o pulso
    // reage na hora quando chega carta nova, sem precisar recarregar a
    // página. Só conta quantas existem, não processa expiração
    // (fetchInbox faz isso, mas só quando o jogador realmente abre a
    // caixa). Chamar de novo com o listener já ligado não faz nada —
    // evita vazar um segundo listener a cada vez que a home recarrega.
    watchPending() {

        if (this.stopWatching) return;

        const uid = this.uid;

        if (!uid) return;

        this.stopWatching = MailService.watchPending(uid, count => {
            this.hasPending = count > 0;
            this.updateButton();
        });

    }

    // Desliga o listener — chamado ao sair do HudScreen (ver
    // Game.showScreen), senão ele fica escutando pra sempre depois do
    // jogador sair da conta.
    stopWatchingPending() {
        this.stopWatching?.();
        this.stopWatching = null;
    }

    renderButton() {
        return `
            <button class="hud-tool mail-toggle ${this.hasPending ? "has-letter" : ""}" id="mail-toggle" data-tooltip="Correio">
                <i class="fa-solid fa-envelope"></i>
            </button>
        `;
    }

    updateButton() {
        const button = document.getElementById("mail-toggle");
        if (!button) return;
        button.classList.toggle("has-letter", this.hasPending);
    }

    registerEvents(container = document) {
        container.querySelector("#mail-toggle")?.addEventListener("click", () => this.show());
    }

    async show() {

        // O pulso para ao abrir, independente de sobrar carta ou não —
        // só volta se a página for recarregada com algo ainda pendente
        // (ver regra 17 do desenho: checkPending roda de novo no
        // próximo HudScreen.show()).
        this.hasPending = false;
        this.updateButton();

        this.activeTab = "recebidos";
        this.page = 0;
        this.expandedLetterId = null;
        this.resetCompose();

        this.overlay = document.createElement("div");
        this.overlay.className = "mail-overlay";
        this.overlay.innerHTML = `<div class="mail-modal"><p class="mail-loading">Carregando...</p></div>`;
        document.body.appendChild(this.overlay);

        this.overlay.addEventListener("click", event => {
            if (event.target === this.overlay) this.hide();
        });

        this.escapeHandler = event => {
            if (event.key === "Escape") this.hide();
        };
        document.addEventListener("keydown", this.escapeHandler);

        await this.reloadInbox();

    }

    async reloadInbox() {

        const uid = this.uid;

        if (!uid || !this.overlay) return;

        try {
            this.letters = await MailService.fetchInbox(uid);
        } catch {
            this.letters = [];
            Toast.show("Não foi possível carregar o correio agora.");
        }

        const maxPage = Math.max(0, Math.ceil(this.letters.length / LETTERS_PER_PAGE) - 1);
        if (this.page > maxPage) this.page = maxPage;

        this.render();

    }

    render() {

        if (!this.overlay) return;

        this.overlay.querySelector(".mail-modal").innerHTML = `
            <header class="mail-header">
                <h2>Correio</h2>
                <button class="close-btn mail-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>
            <div class="mail-tabs">
                <button class="mail-tab ${this.activeTab === "recebidos" ? "active" : ""}" data-tab="recebidos">Recebidos</button>
                <button class="mail-tab ${this.activeTab === "enviar" ? "active" : ""}" data-tab="enviar">Enviar</button>
            </div>
            ${this.activeTab === "recebidos" ? this.renderRecebidos() : this.renderEnviar()}
        `;

        this.registerModalEvents();

    }

    // ==========================================================
    // ABA RECEBIDOS
    // ==========================================================

    renderRecebidos() {

        if (!this.letters.length) {
            return `<p class="mail-empty">Nenhuma carta recebida.</p>`;
        }

        const totalPages = Math.max(1, Math.ceil(this.letters.length / LETTERS_PER_PAGE));
        const pageLetters = this.letters.slice(this.page * LETTERS_PER_PAGE, (this.page + 1) * LETTERS_PER_PAGE);

        return `
            <div class="mail-list">
                ${pageLetters.map(letter => this.renderLetterRow(letter)).join("")}
            </div>
            <div class="mail-bulk-actions">
                <button class="mail-bulk-button mail-collect-all">Coletar tudo sem ler</button>
                <button class="mail-bulk-button mail-delete-all">Excluir todas</button>
            </div>
            <div class="mail-pagination">
                <button class="mail-page-btn mail-page-first" ${this.page === 0 ? "disabled" : ""}>«</button>
                <button class="mail-page-btn mail-page-prev" ${this.page === 0 ? "disabled" : ""}>‹</button>
                <span class="mail-page-label">${this.page + 1} de ${totalPages}</span>
                <button class="mail-page-btn mail-page-next" ${this.page >= totalPages - 1 ? "disabled" : ""}>›</button>
                <button class="mail-page-btn mail-page-last" ${this.page >= totalPages - 1 ? "disabled" : ""}>»</button>
            </div>
        `;

    }

    renderLetterRow(letter) {

        const expanded = this.expandedLetterId === letter.id;
        const hasItems = letter.items?.length > 0;

        return `
            <div class="mail-row ${expanded ? "expanded" : ""}" data-letter-id="${letter.id}">
                <div class="mail-row-summary">
                    <div class="mail-row-info">
                        <span class="mail-row-sender">${escapeHtml(letter.senderName)}</span>
                        <span class="mail-row-title">${escapeHtml((letter.title ?? "").slice(0, MAIL_MAX_TITLE_LENGTH))}</span>
                    </div>
                    <button class="mail-row-delete" data-letter-id="${letter.id}" title="Excluir">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                ${expanded ? `
                    <div class="mail-row-detail">
                        <p class="mail-row-body">${escapeHtml(letter.body ?? "")}</p>
                        ${hasItems ? `
                            <div class="mail-row-items">
                                ${letter.items.map(item => `
                                    <div class="mail-row-item">
                                        <img src="${item.icon}" alt="${escapeHtml(item.name ?? "")}">
                                        <span>${escapeHtml(item.name ?? "")}${item.quantity > 1 ? ` x${item.quantity}` : ""}</span>
                                    </div>
                                `).join("")}
                            </div>
                            <button class="mail-collect-button" data-letter-id="${letter.id}">Coletar</button>
                        ` : ""}
                    </div>
                ` : ""}
            </div>
        `;

    }

    registerModalEvents() {

        this.overlay.querySelector(".mail-close")?.addEventListener("click", () => this.hide());

        this.overlay.querySelectorAll(".mail-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                this.activeTab = tab.dataset.tab;
                this.render();
            });
        });

        if (this.activeTab === "recebidos") {
            this.registerRecebidosEvents();
        } else {
            this.registerEnviarEvents();
        }

    }

    registerRecebidosEvents() {

        this.overlay.querySelectorAll(".mail-row-summary").forEach(summary => {
            summary.addEventListener("click", event => {
                if (event.target.closest(".mail-row-delete")) return;
                const row = summary.closest(".mail-row");
                const id = row.dataset.letterId;
                this.expandedLetterId = this.expandedLetterId === id ? null : id;
                this.render();
            });
        });

        this.overlay.querySelectorAll(".mail-row-delete").forEach(button => {
            button.addEventListener("click", async event => {
                event.stopPropagation();
                await this.deleteOneLetter(button.dataset.letterId);
            });
        });

        this.overlay.querySelector(".mail-collect-button")?.addEventListener("click", async event => {
            await this.collectLetter(event.target.dataset.letterId);
        });

        this.overlay.querySelector(".mail-collect-all")?.addEventListener("click", async () => {
            await this.collectAll();
        });

        this.overlay.querySelector(".mail-delete-all")?.addEventListener("click", async () => {
            await this.deleteAll();
        });

        const totalPages = Math.max(1, Math.ceil(this.letters.length / LETTERS_PER_PAGE));

        this.overlay.querySelector(".mail-page-first")?.addEventListener("click", () => {
            this.page = 0;
            this.render();
        });
        this.overlay.querySelector(".mail-page-prev")?.addEventListener("click", () => {
            this.page = Math.max(0, this.page - 1);
            this.render();
        });
        this.overlay.querySelector(".mail-page-next")?.addEventListener("click", () => {
            this.page = Math.min(totalPages - 1, this.page + 1);
            this.render();
        });
        this.overlay.querySelector(".mail-page-last")?.addEventListener("click", () => {
            this.page = totalPages - 1;
            this.render();
        });

    }

    async collectLetter(letterId) {

        const letter = this.letters.find(l => l.id === letterId);

        if (!letter) return;

        this.applyItemsToInventory(letter.items);

        await MailService.deleteLetter(this.uid, letter.id).catch(() => {});

        this.letters = this.letters.filter(l => l.id !== letterId);
        if (this.expandedLetterId === letterId) this.expandedLetterId = null;

        await SaveService.autoSave(this.game.player);

        this.render();

    }

    async collectAll() {

        const withItems = this.letters.filter(letter => letter.items?.length > 0);

        if (!withItems.length) {
            Toast.show("Nenhuma carta com item pra coletar.");
            return;
        }

        for (const letter of withItems) {
            this.applyItemsToInventory(letter.items);
            await MailService.deleteLetter(this.uid, letter.id).catch(() => {});
        }

        const collectedIds = new Set(withItems.map(letter => letter.id));
        this.letters = this.letters.filter(letter => !collectedIds.has(letter.id));
        this.expandedLetterId = null;

        await SaveService.autoSave(this.game.player);

        this.render();

    }

    applyItemsToInventory(items) {
        (items ?? []).forEach(item => {
            this.game.player.addItem(item, item.quantity ?? 1);
        });
    }

    async deleteOneLetter(letterId) {

        const letter = this.letters.find(l => l.id === letterId);

        if (!letter) return;

        if (letter.items?.length > 0) {

            const confirmed = await this.confirmModal.show({
                title: "Excluir carta",
                message: "Essa carta tem item ainda não coletado. Excluir agora perde o item de vez — ele NÃO volta pro remetente.",
                confirmLabel: "Excluir",
                danger: true
            });

            if (!confirmed) return;

        }

        await MailService.deleteLetter(this.uid, letter.id).catch(() => {});

        this.letters = this.letters.filter(l => l.id !== letterId);
        if (this.expandedLetterId === letterId) this.expandedLetterId = null;

        this.render();

    }

    async deleteAll() {

        if (!this.letters.length) return;

        const anyWithItems = this.letters.some(letter => letter.items?.length > 0);

        if (anyWithItems) {

            const confirmed = await this.confirmModal.show({
                title: "Excluir todas as cartas",
                message: "Alguma dessas cartas tem item ainda não coletado. Excluir agora perde esses itens de vez — eles NÃO voltam pro remetente.",
                confirmLabel: "Excluir todas",
                danger: true
            });

            if (!confirmed) return;

        }

        for (const letter of this.letters) {
            await MailService.deleteLetter(this.uid, letter.id).catch(() => {});
        }

        this.letters = [];
        this.expandedLetterId = null;
        this.page = 0;

        this.render();

    }

    // ==========================================================
    // ABA ENVIAR — só funciona de verdade pra conta admin (ver
    // isAdminAccount); pros demais jogadores os campos ficam travados.
    // ==========================================================

    resetCompose() {
        this.composeSlots = [null, null, null];
        this.composeFeedback = "";
        this.composeRecipient = "";
        this.composeTitle = "";
        this.composeBody = "";
    }

    renderEnviar() {

        const locked = !this.isAdminAccount;
        const inventory = this.game.player.inventory ?? [];
        const selectedUids = new Set(this.composeSlots.filter(Boolean).map(slot => slot.item.uid));

        return `
            <div class="mail-send ${locked ? "locked" : ""}">
                ${locked ? `<p class="mail-send-locked-notice">Enviar carta ainda não está liberado pra jogadores.</p>` : ""}
                <div class="mail-send-body">
                    <div class="mail-send-inventory">
                        ${inventory.length
                            ? inventory.map(item => `
                                <button class="mail-inventory-item ${selectedUids.has(item.uid) ? "selected" : ""}" data-uid="${item.uid}" ${locked ? "disabled" : ""}>
                                    <img src="${item.icon}" alt="${escapeHtml(item.name ?? "")}">
                                    <span>${escapeHtml(item.name ?? "")}${item.quantity > 1 ? ` x${item.quantity}` : ""}</span>
                                </button>
                            `).join("")
                            : `<p class="mail-empty">Inventário vazio.</p>`
                        }
                    </div>
                    <div class="mail-send-form">
                        <label class="mail-field">
                            <span>Enviar para</span>
                            <input type="text" class="mail-input mail-recipient-input" maxlength="30" value="${escapeHtml(this.composeRecipient)}" ${locked ? "disabled" : ""}>
                        </label>
                        <label class="mail-field">
                            <span>Título</span>
                            <input type="text" class="mail-input mail-title-input" maxlength="${MAIL_MAX_TITLE_LENGTH}" value="${escapeHtml(this.composeTitle)}" ${locked ? "disabled" : ""}>
                        </label>
                        <label class="mail-field">
                            <span>Mensagem</span>
                            <textarea class="mail-textarea mail-body-input" maxlength="${MAIL_MAX_BODY_LENGTH}" ${locked ? "disabled" : ""}>${escapeHtml(this.composeBody)}</textarea>
                        </label>
                        <div class="mail-slots">
                            ${this.composeSlots.map((slot, index) => this.renderComposeSlot(slot, index, locked)).join("")}
                        </div>
                        ${this.composeFeedback ? `<p class="mail-send-feedback">${escapeHtml(this.composeFeedback)}</p>` : ""}
                        <div class="mail-send-actions">
                            <button class="mail-send-button" ${locked ? "disabled" : ""}>Enviar</button>
                            <button class="mail-cancel-button" ${locked ? "disabled" : ""}>Desistir</button>
                            <button class="mail-clear-button" ${locked ? "disabled" : ""}>Limpar Tudo</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    }

    renderComposeSlot(slot, index, locked) {

        if (!slot) {
            return `<div class="mail-slot mail-slot-empty">Slot ${index + 1}</div>`;
        }

        const max = slot.item.quantity ?? 1;
        const stackable = slot.item.type === "item";

        return `
            <div class="mail-slot mail-slot-filled">
                <img src="${slot.item.icon}" alt="${escapeHtml(slot.item.name ?? "")}">
                <span class="mail-slot-name">${escapeHtml(slot.item.name ?? "")}</span>
                ${stackable ? `
                    <div class="mail-slot-quantity">
                        <button class="mail-slot-dec" data-index="${index}" ${locked ? "disabled" : ""}>−</button>
                        <span>${slot.quantity}</span>
                        <button class="mail-slot-inc" data-index="${index}" ${locked || slot.quantity >= max ? "disabled" : ""}>+</button>
                    </div>
                ` : ""}
                <button class="mail-slot-remove" data-index="${index}" ${locked ? "disabled" : ""}>
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;

    }

    registerEnviarEvents() {

        if (!this.isAdminAccount) return;

        this.overlay.querySelectorAll(".mail-inventory-item").forEach(button => {
            button.addEventListener("click", () => this.addToComposeSlot(button.dataset.uid));
        });

        this.overlay.querySelector(".mail-recipient-input")?.addEventListener("input", event => {
            this.composeRecipient = event.target.value;
        });
        this.overlay.querySelector(".mail-title-input")?.addEventListener("input", event => {
            this.composeTitle = event.target.value;
        });
        this.overlay.querySelector(".mail-body-input")?.addEventListener("input", event => {
            this.composeBody = event.target.value;
        });

        this.overlay.querySelectorAll(".mail-slot-remove").forEach(button => {
            button.addEventListener("click", () => {
                this.composeSlots[Number(button.dataset.index)] = null;
                this.render();
            });
        });

        this.overlay.querySelectorAll(".mail-slot-inc").forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.index);
                const slot = this.composeSlots[index];
                if (!slot) return;
                const max = slot.item.quantity ?? 1;
                slot.quantity = Math.min(max, slot.quantity + 1);
                this.render();
            });
        });

        this.overlay.querySelectorAll(".mail-slot-dec").forEach(button => {
            button.addEventListener("click", () => {
                const index = Number(button.dataset.index);
                const slot = this.composeSlots[index];
                if (!slot) return;
                slot.quantity = Math.max(1, slot.quantity - 1);
                this.render();
            });
        });

        this.overlay.querySelector(".mail-clear-button")?.addEventListener("click", () => {
            this.resetCompose();
            this.render();
        });

        this.overlay.querySelector(".mail-cancel-button")?.addEventListener("click", () => {
            this.resetCompose();
            this.activeTab = "recebidos";
            this.render();
        });

        this.overlay.querySelector(".mail-send-button")?.addEventListener("click", () => this.submitSend());

    }

    addToComposeSlot(itemUid) {

        const item = this.game.player.inventory.find(i => i.uid === itemUid);

        if (!item) return;

        if (this.composeSlots.some(slot => slot?.item.uid === itemUid)) return;

        const emptyIndex = this.composeSlots.findIndex(slot => slot === null);

        if (emptyIndex === -1) {
            this.composeFeedback = `Só dá pra escolher até ${MAIL_MAX_ITEMS} itens diferentes.`;
            this.render();
            return;
        }

        this.composeSlots[emptyIndex] = { item, quantity: 1 };
        this.composeFeedback = "";

        this.render();

    }

    async submitSend() {

        const recipientName = this.composeRecipient.trim();
        const title = this.composeTitle.trim();
        const body = this.composeBody.trim();
        const slots = this.composeSlots.filter(Boolean);

        if (!recipientName) {
            this.composeFeedback = "Digite o nome de quem vai receber.";
            this.render();
            return;
        }

        if (!title) {
            this.composeFeedback = "Digite um título.";
            this.render();
            return;
        }

        if (!slots.length) {
            this.composeFeedback = "Escolha ao menos 1 item.";
            this.render();
            return;
        }

        const recipient = await SaveService.findCharacterByName(recipientName).catch(() => null);

        if (!recipient) {
            this.composeFeedback = "Jogador não encontrado.";
            this.render();
            return;
        }

        if (recipient.uid === this.uid) {
            this.composeFeedback = "Você não pode enviar uma carta para si mesmo.";
            this.render();
            return;
        }

        const items = slots.map(slot => {
            const snapshot = structuredClone(slot.item);
            delete snapshot.uid;
            snapshot.quantity = slot.quantity;
            return snapshot;
        });

        try {

            await MailService.sendLetter({
                senderUid: this.uid,
                senderName: this.game.player.name,
                recipientUid: recipient.uid,
                title,
                body,
                items
            });

        } catch {
            this.composeFeedback = "Não foi possível enviar a carta agora.";
            this.render();
            return;
        }

        // Item só sai do inventário depois do envio confirmado.
        slots.forEach(slot => {
            this.game.player.removeItem({ uid: slot.item.uid }, slot.quantity);
        });

        await SaveService.autoSave(this.game.player);

        Toast.show(`Carta enviada para ${recipient.name}.`);

        this.resetCompose();
        this.activeTab = "recebidos";
        await this.reloadInbox();

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

        this.resetCompose();
        this.expandedLetterId = null;

    }

}

function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}
