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
        this.revealAll = false;
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
        }

        const totalPages = Math.ceil(cards.length / 4);

        const prevButton = this.modal.querySelector("#album-prev");
        if (prevButton) prevButton.disabled = this.index === 0;

        const nextButton = this.modal.querySelector("#album-next");
        if (nextButton) nextButton.disabled = this.index >= totalPages - 1;

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

                    <button
                        class="album-nav"
                        id="album-prev"
                        ${this.index === 0 ? "disabled" : ""}>

                        <i class="fa-solid fa-chevron-left"></i>

                    </button>

                    <div class="album-grid">
                        <div class="album-grid-page">
                            ${this.renderCards()}
                        </div>
                    </div>

                    <button
                        class="album-nav"
                        id="album-next"
                        ${this.index >= totalPages - 1 ? "disabled" : ""}>

                        <i class="fa-solid fa-chevron-right"></i>

                    </button>

                </div>

                <footer class="album-footer">

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

                <div class="album-card ${discovered ? "owned" : ""}">

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

    registerEvents() {

        this.modal.querySelector("#album-close")?.addEventListener("click", () => {
            this.hide();
        });

        this.modal.querySelector("#album-prev")
        ?.addEventListener("click", () => {

            if (this.index > 0) {

                this.index--;

                this.refresh();

            }

        });

        const totalPages = Math.ceil(cards.length / 4);

        this.modal.querySelector("#album-next")
        ?.addEventListener("click", () => {

            if (this.index < totalPages - 1) {

                this.index++;

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
            this.refresh();
            return;
        }

        this.confirming = true;
        this.refresh();

    }

}
