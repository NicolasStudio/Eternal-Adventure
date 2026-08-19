import cards from "../../../data/cards.js";

const CARD_BACK = "assets/img/assets/card_album/card_back.png";

export default class AlbumModal {

    constructor(game) {
        this.game = game;
        this.index = 0;
        this.revealAll = false;
        this.confirming = false;
        this.modal = null;
    }

    get player() {
        return this.game.player;
    }

    show() {
        this.index = 0;
        // Se o jogador já confirmou "revelar" alguma vez, o álbum abre
        // direto revelado — não faz sentido pedir a mesma confirmação
        // de spoiler de novo toda vez que ele reabre a tela.
        this.revealAll = this.player.progress.albumRevealed === true;
        this.confirming = false;
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
        this.hideLightbox();
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    // Atualiza só o que realmente muda (cartas do meio, contador,
    // setas, texto do botão de revelar) — nunca mais recria o
    // "livro" (.album-modal) inteiro, que é o que causava a piscada
    // ao trocar de página (a animação de abrir disparava de novo).
    refresh() {

        if (!this.modal) return;

        const grid = this.modal.querySelector(".album-grid");
        if (grid) {
            grid.innerHTML = `<div class="album-grid-page">${this.renderCards()}</div>`;
            this.bindCardClicks();
        }

        const totalPages = Math.ceil(cards.length / 4);

        const firstButton = this.modal.querySelector("#album-first");
        if (firstButton) firstButton.disabled = this.index === 0;

        const prevPageButton = this.modal.querySelector("#album-prev-page");
        if (prevPageButton) prevPageButton.disabled = this.index === 0;

        const nextPageButton = this.modal.querySelector("#album-next-page");
        if (nextPageButton) nextPageButton.disabled = this.index >= totalPages - 1;

        const lastButton = this.modal.querySelector("#album-last");
        if (lastButton) lastButton.disabled = this.index >= totalPages - 1;

        const pageLabel = this.modal.querySelector(".album-page-label");
        if (pageLabel) pageLabel.textContent = `Página ${this.index + 1} de ${totalPages}`;

        const progress = this.modal.querySelector(".album-progress");
        if (progress) progress.textContent = `${this.player.album.length} / ${cards.length}`;

        const revealButton = this.modal.querySelector("#album-reveal");
        if (revealButton) {
            revealButton.innerHTML = `
                <i class="fa-solid ${this.revealAll ? "fa-eye-slash" : "fa-eye"}"></i>
                ${this.revealAll ? "Ocultar Cartas" : "Visualizar Cartas"}
            `;
        }

        this.updateConfirmOverlay();

    }

    // O overlay de confirmação de spoiler é a única parte que ainda
    // entra/sai do DOM dinamicamente — precisa rebindar os botões dele
    // toda vez que é recriado, mas isso não afeta o resto do modal.
    updateConfirmOverlay() {

        const existing = this.modal.querySelector("#album-confirm-overlay");

        if (this.confirming && !existing) {

            this.modal.insertAdjacentHTML("beforeend", this.renderConfirm());

            this.modal.querySelector("#album-confirm-yes")?.addEventListener("click", () => {
                this.revealAll = true;
                this.player.progress.albumRevealed = true;
                this.confirming = false;
                this.refresh();
            });

            this.modal.querySelector("#album-confirm-no")?.addEventListener("click", () => {
                this.confirming = false;
                this.refresh();
            });

        } else if (!this.confirming && existing) {

            existing.remove();

        }

    }

    render() {

        const total = cards.length;
        const discoveredCount = this.player.album.length;

        const totalPages = Math.ceil(total / 4);

        return `
            <div class="album-modal">

                <header class="album-header">

                    <h2 class="album-title">
                        Álbum de Criaturas
                    </h2>

                    <span class="album-progress">
                        ${discoveredCount} / ${total}
                    </span>

                    <button
                        class="album-close"
                        id="album-close">

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </header>

                <div class="album-body">

                    <div class="album-grid">
                        <div class="album-grid-page">
                            ${this.renderCards()}
                        </div>
                    </div>

                </div>

                <footer class="album-footer">

                    <div class="album-pagination">

                        <button
                            class="album-page-btn"
                            id="album-first"
                            ${this.index === 0 ? "disabled" : ""}>
                            Primeira
                        </button>

                        <button
                            class="album-page-btn"
                            id="album-prev-page"
                            ${this.index === 0 ? "disabled" : ""}>
                            Anterior
                        </button>

                        <span class="album-page-label">
                            Página ${this.index + 1} de ${totalPages}
                        </span>

                        <button
                            class="album-page-btn"
                            id="album-next-page"
                            ${this.index >= totalPages - 1 ? "disabled" : ""}>
                            Avançar
                        </button>

                        <button
                            class="album-page-btn"
                            id="album-last"
                            ${this.index >= totalPages - 1 ? "disabled" : ""}>
                            Última
                        </button>

                    </div>

                    <button
                        class="album-reveal-button"
                        id="album-reveal">

                        <i class="fa-solid ${this.revealAll ? "fa-eye-slash" : "fa-eye"}"></i>

                        ${this.revealAll ? "Ocultar Cartas" : "Visualizar Cartas"}

                    </button>

                </footer>

            </div>

            ${this.confirming ? this.renderConfirm() : ""}

        `;

    }

    renderCards() {

        const pageSize = 4;
        const start = this.index * pageSize;
        const pageCards = cards.slice(start, start + pageSize);

        return pageCards.map(card => {

            const discovered = this.player.hasCard(card.id);

            const image = discovered
                ? card.image
                : CARD_BACK;

            const blur =
                discovered && !this.revealAll;

            return `

                <div
                    class="album-card ${discovered ? "owned" : ""}"
                    ${discovered && !blur ? `data-card-id="${card.id}"` : ""}>

                    <img
                        src="${image}"
                        class="${blur ? "blur" : ""}"
                        alt="${discovered ? card.name : "???"}">

                    <span class="album-card-name">

                        ${
                            discovered
                                ? (this.revealAll ? card.name : "?????")
                                : "???"
                        }

                    </span>

                </div>

            `;

        }).join("");

    }

    renderConfirm() {
        return `
            <div class="album-confirm-overlay" id="album-confirm-overlay">
                <div class="album-confirm-modal">
                    <p>
                        Existem inimigos que você ainda não enfrentou.
                        Ao revelar o álbum, você pode saber coisas do jogo
                        antes da hora. Deseja confirmar?
                    </p>
                    <div class="album-confirm-actions">
                        <button class="album-confirm-yes" id="album-confirm-yes">Sim</button>
                        <button class="album-confirm-no" id="album-confirm-no">Não</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindCardClicks() {

        this.modal.querySelectorAll(".album-card[data-card-id]").forEach(cardEl => {

            cardEl.addEventListener("click", () => {

                const card = cards.find(c => c.id === cardEl.dataset.cardId);

                if (card) this.showLightbox(card);

            });

        });

    }

    showLightbox(card) {

        this.hideLightbox();

        this.lightbox = document.createElement("div");
        this.lightbox.className = "album-lightbox-overlay";
        this.lightbox.innerHTML = `
            <figure class="album-lightbox-figure">
                <img src="${card.image}" alt="${card.name}">
                <figcaption>${card.name}</figcaption>
            </figure>
        `;

        document.body.appendChild(this.lightbox);

        // Clicar fora da carta (no fundo) fecha — clicar na própria
        // carta não deve fechar.
        this.lightbox.addEventListener("click", (event) => {
            if (event.target === this.lightbox) this.hideLightbox();
        });

        this.lightboxKeyHandler = (event) => {
            if (event.key === "Escape") this.hideLightbox();
        };

        document.addEventListener("keydown", this.lightboxKeyHandler);

    }

    hideLightbox() {

        if (this.lightbox) {
            this.lightbox.remove();
            this.lightbox = null;
        }

        if (this.lightboxKeyHandler) {
            document.removeEventListener("keydown", this.lightboxKeyHandler);
            this.lightboxKeyHandler = null;
        }

    }

    registerEvents() {

        this.bindCardClicks();

        this.modal.querySelector("#album-close")?.addEventListener("click", () => {
            this.hide();
        });

        const totalPages = Math.ceil(cards.length / 4);

        this.modal.querySelector("#album-first")?.addEventListener("click", () => {
            if (this.index !== 0) {
                this.index = 0;
                this.refresh();
            }
        });

        this.modal.querySelector("#album-prev-page")?.addEventListener("click", () => {
            if (this.index > 0) {
                this.index--;
                this.refresh();
            }
        });

        this.modal.querySelector("#album-next-page")?.addEventListener("click", () => {
            if (this.index < totalPages - 1) {
                this.index++;
                this.refresh();
            }
        });

        this.modal.querySelector("#album-last")?.addEventListener("click", () => {
            if (this.index !== totalPages - 1) {
                this.index = totalPages - 1;
                this.refresh();
            }
        });

        this.modal.querySelector("#album-reveal")?.addEventListener("click", () => {
            this.toggleRevealAll();
        });

    }

    toggleRevealAll() {

        // Já revelado -> só esconder de novo, sem precisar confirmar nada.
        if (this.revealAll) {
            this.revealAll = false;
            this.refresh();
            return;
        }

        const allDiscovered = this.player.album.length >= cards.length;

        // Já descobriu tudo -> não tem spoiler nenhum, revela direto.
        if (allDiscovered) {
            this.revealAll = true;
            this.player.progress.albumRevealed = true;
            this.refresh();
            return;
        }

        this.confirming = true;
        this.refresh();

    }

}
