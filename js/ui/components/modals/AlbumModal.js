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

    refresh() {
        if (!this.modal) return;
        this.modal.innerHTML = this.render();
        this.registerEvents();
    }

    render() {

        const total = cards.length;
        const discoveredCount = this.player.album.length;

        const pageSize = 4;
        const totalPages = Math.ceil(total / pageSize);

        const start = this.index * pageSize;
        const pageCards = cards.slice(start, start + pageSize);

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

                        ${pageCards.map(card => {

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

                        }).join("")}

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

        this.modal.querySelector("#album-confirm-yes")?.addEventListener("click", () => {
            this.revealAll = true;
            this.confirming = false;
            this.refresh();
        });

        this.modal.querySelector("#album-confirm-no")?.addEventListener("click", () => {
            this.confirming = false;
            this.refresh();
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
