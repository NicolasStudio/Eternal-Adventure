import SaveService from "../../../services/SaveService.js";
import classes from "../../../player/classes.js";

export default class RankingModal {

    constructor(game) {
        this.game = game;
        this.modal = null;
        this.status = "loading";
        this.entries = [];
    }

    show() {
        this.status = "loading";
        this.entries = [];
        this.mount();
        this.fetchRanking();
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

    async fetchRanking() {

        this.entries = await SaveService.getTopLeaderboard(10);

        this.status = this.entries.length > 0 ? "loaded" : "empty";

        this.refresh();

    }

    render() {
        return `
            <div class="ranking-modal">

                <header class="ranking-header">
                    <h2>Ranking — Top 10 mais fortes</h2>
                    <button class="close-btn load-game-close" id="ranking-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="ranking-body">
                    ${this.renderBody()}
                </div>

            </div>
        `;
    }

    renderBody() {

        if (this.status === "loading") {
            return `
                <div class="ranking-status">
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Carregando ranking...</span>
                </div>
            `;
        }

        if (this.status === "empty") {
            return `
                <div class="ranking-status">
                    <i class="fa-solid fa-ranking-star"></i>
                    <span>Nenhum jogador no ranking ainda.</span>
                </div>
            `;
        }

        return `
            <div class="ranking-list">
                <div class="ranking-row ranking-row-header">
                    <span class="ranking-position"></span>
                    <span class="ranking-name">Nome</span>
                    <span class="ranking-level">Nível</span>
                    <span class="ranking-class">Classe</span>
                    <span class="ranking-power">Poder</span>
                </div>
                ${this.entries.map((entry, index) => this.renderRow(entry, index + 1)).join("")}
            </div>
        `;

    }

    renderRow(entry, position) {

        const className = classes[entry.classId]?.name ?? "???";

        return `
            <div class="ranking-row">
                <span class="ranking-position">#${position}</span>
                <span class="ranking-name">${entry.name}</span>
                <span class="ranking-level">Nv. ${entry.level}</span>
                <span class="ranking-class">${className}</span>
                <span class="ranking-power">${entry.power.toLocaleString("pt-BR")}</span>
            </div>
        `;

    }

    registerEvents() {

        this.modal.querySelector("#ranking-close")?.addEventListener("click", () => {
            this.hide();
        });

    }

}
