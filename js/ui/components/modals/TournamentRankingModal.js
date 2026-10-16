import SaveService from "../../../services/SaveService.js";
import classes from "../../../player/classes.js";
import PlayerProfileModal from "./PlayerProfileModal.js";

// O nome vem do banco (de outro jogador) — nunca pode entrar como HTML.
function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}

// Ranking do Torneio: todos os personagens do servidor ordenados por
// pontos do Combate Ranqueado (rankedPoints), não por Poder — 1º/2º/3º
// recebem destaque de ouro/prata/bronze. O Combate Ranqueado em si
// ainda está travado ("Modo Torneio — em breve", ver PvpView.js), então
// essa tela começa vazia/zerada por enquanto — já fica pronta pra
// quando ele for implementado de verdade.
export default class TournamentRankingModal {

    constructor(game) {
        this.game = game;
        this.modal = null;
        this.status = "loading";
        this.entries = [];
        this.profileModal = new PlayerProfileModal();
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

        this.entries = await SaveService.getFullRankedLeaderboard();

        this.status = this.entries.length > 0 ? "loaded" : "empty";

        this.refresh();

    }

    render() {
        return `
            <div class="ranking-modal">

                <header class="ranking-header">
                    <h2><i class="fa-solid fa-trophy"></i> Torneio — Ranking Ranqueado</h2>
                    <button class="close-btn load-game-close" id="tournament-ranking-close">
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
                    <span>Carregando ranking do torneio...</span>
                </div>
            `;
        }

        if (this.status === "empty") {
            return `
                <div class="ranking-status">
                    <i class="fa-solid fa-trophy"></i>
                    <span>Ninguém pontuou no Torneio ainda.</span>
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
                    <span class="ranking-power">Pontos</span>
                </div>
                ${this.entries.map((entry, index) => this.renderRow(entry, index + 1)).join("")}
            </div>
        `;

    }

    renderRow(entry, position) {

        // Título "real" (ex: "Mago da Escuridão" se já transcendeu) —
        // mesma regra do Ranking normal (ver RankingModal.js).
        const className = entry.title ?? classes[entry.classId]?.name ?? "???";

        const hasDetails = !!entry.equipment && !!entry.stats;

        const medalClass = position === 1
            ? "tournament-rank-gold"
            : position === 2
                ? "tournament-rank-silver"
                : position === 3
                    ? "tournament-rank-bronze"
                    : "";

        return `
            <div class="ranking-row ${medalClass}">
                <span class="ranking-position has-details ${hasDetails ? "" : "no-data"}" data-index="${position - 1}" title="Ver equipamentos e status">
                    <i class="fa-solid fa-magnifying-glass ranking-lens"></i>
                    <span class="ranking-rank">#${position}</span>
                </span>
                <span class="ranking-name">${escapeHtml(entry.name)}</span>
                <span class="ranking-level">Nv. ${Number(entry.level) || 0}</span>
                <span class="ranking-class">${className}</span>
                <span class="ranking-power">${(Number(entry.rankedPoints) || 0).toLocaleString("pt-BR")}</span>
            </div>
        `;

    }

    registerEvents() {

        this.modal.querySelector("#tournament-ranking-close")?.addEventListener("click", () => {
            this.hide();
        });

        this.modal.querySelectorAll(".ranking-position.has-details").forEach(cell => {
            cell.addEventListener("click", () => {
                this.profileModal.show(this.entries[Number(cell.dataset.index)]);
            });
        });

    }

}
