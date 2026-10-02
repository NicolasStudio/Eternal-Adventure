import SaveService from "../../../services/SaveService.js";
import PresenceService from "../../../services/PresenceService.js";
import PlayerProfileModal from "./PlayerProfileModal.js";

// O nome vem do banco (de outro jogador) — nunca pode entrar como HTML.
function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}

// Ranking Global: TODOS os jogadores do servidor (não só o Top 10), com
// uma bolinha de presença (verde/vermelha) ao lado — ver PresenceService.
export default class GlobalRankingModal {

    constructor(game) {
        this.game = game;
        this.modal = null;
        this.status = "loading";
        this.entries = [];
        this.onlineUids = new Set();
        this.profileModal = new PlayerProfileModal();
    }

    show() {
        this.status = "loading";
        this.entries = [];
        this.onlineUids = new Set();
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
        this.profileModal.hide();
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

        const [entries, onlineUids] = await Promise.all([
            SaveService.getFullLeaderboard(),
            PresenceService.getOnlineUids()
        ]);

        this.entries = entries;
        this.onlineUids = onlineUids;

        this.status = this.entries.length > 0 ? "loaded" : "empty";

        this.refresh();

    }

    render() {
        return `
            <div class="ranking-modal">

                <header class="ranking-header">
                    <h2>Ranking Global — Todos os jogadores</h2>
                    <button class="close-btn load-game-close" id="global-ranking-close">
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
                    <span>Carregando ranking global...</span>
                </div>
            `;
        }

        if (this.status === "empty") {
            return `
                <div class="ranking-status">
                    <i class="fa-solid fa-earth-americas"></i>
                    <span>Nenhum jogador no ranking ainda.</span>
                </div>
            `;
        }

        return `
            <div class="ranking-list">
                <div class="ranking-row ranking-row-header global-ranking-row">
                    <span class="ranking-position"></span>
                    <span class="ranking-name">Nome</span>
                    <span class="ranking-level">Nível</span>
                    <span class="ranking-power">Poder</span>
                    <span class="presence-column"></span>
                </div>
                ${this.entries.map((entry, index) => this.renderRow(entry, index + 1)).join("")}
            </div>
        `;

    }

    renderRow(entry, position) {

        // Quem ainda não salvou depois da atualização não tem
        // equipamento/status publicados: a lupa aparece do mesmo jeito,
        // mas mais apagada, e o modal explica o motivo.
        const hasDetails = !!entry.equipment && !!entry.stats;

        const online = entry.uid && this.onlineUids.has(entry.uid);
        const presenceClass = online ? "presence-dot-online" : "presence-dot-offline";
        const presenceTitle = online ? "ONLINE" : "OFFLINE";

        return `
            <div class="ranking-row global-ranking-row">
                <span class="ranking-position has-details ${hasDetails ? "" : "no-data"}" data-index="${position - 1}" title="Ver equipamentos e status">
                    <i class="fa-solid fa-magnifying-glass ranking-lens"></i>
                </span>
                <span class="ranking-name">${escapeHtml(entry.name)}</span>
                <span class="ranking-level">Nv. ${Number(entry.level) || 0}</span>
                <span class="ranking-power">${(Number(entry.power) || 0).toLocaleString("pt-BR")}</span>
                <span class="presence-column">
                    <span class="presence-dot ${presenceClass}" title="${presenceTitle}"></span>
                </span>
            </div>
        `;

    }

    registerEvents() {

        this.modal.querySelector("#global-ranking-close")?.addEventListener("click", () => {
            this.hide();
        });

        this.modal.querySelectorAll(".ranking-position.has-details").forEach(cell => {
            cell.addEventListener("click", () => {
                this.profileModal.show(this.entries[Number(cell.dataset.index)]);
            });
        });

    }

}
