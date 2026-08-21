import achievements from "../../../data/achievements.js";
import AchievementService from "../../../services/AchievementService.js";

export default class AchievementModal {

    constructor(game) {
        this.game = game;
        this.modal = null;
    }

    get player() {
        return this.game.player;
    }

    get isOpen() {
        return !!this.modal;
    }

    show() {
        // Reavalia antes de renderizar — garante que correções como a
        // do "O FIM?" (ver AchievementService.REVALIDATED_EVERY_CHECK)
        // já apareçam certas mesmo que nada mais tenha disparado
        // notify() desde o carregamento do save.
        AchievementService.evaluate(this.player);
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

    // Só o que muda de verdade (contador/barra + os cards que acabaram
    // de destravar) — evita recriar o modal inteiro toda vez que uma
    // conquista abre enquanto ele já está na tela.
    refresh() {

        if (!this.modal) return;

        const grid = this.modal.querySelector(".achievements-grid");
        if (grid) grid.innerHTML = this.renderCards();

        const unlockedCount = this.player.progress.achievements?.length ?? 0;
        const total = achievements.length;
        const percent = total > 0 ? (unlockedCount / total) * 100 : 0;

        const label = this.modal.querySelector(".achievements-progress-label");
        if (label) label.textContent = `Progresso: ${unlockedCount}/${total} (${percent.toFixed(1)}%)`;

        const fill = this.modal.querySelector(".achievements-progress-fill");
        if (fill) fill.style.width = `${percent}%`;

    }

    render() {

        const unlockedCount = this.player.progress.achievements?.length ?? 0;
        const total = achievements.length;
        const percent = total > 0 ? (unlockedCount / total) * 100 : 0;

        return `
            <div class="achievements-modal">

                <header class="achievements-header">

                    <h2 class="achievements-title">
                        <i class="fa-solid fa-trophy"></i>
                        Conquistas
                    </h2>

                    <button
                        class="achievements-close"
                        id="achievements-close">

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </header>

                <div class="achievements-progress-wrap">

                    <span class="achievements-progress-label">
                        Progresso: ${unlockedCount}/${total} (${percent.toFixed(1)}%)
                    </span>

                    <div class="achievements-progress-bar">
                        <div class="achievements-progress-fill" style="width:${percent}%"></div>
                    </div>

                </div>

                <div class="achievements-body">

                    <div class="achievements-grid">
                        ${this.renderCards()}
                    </div>

                </div>

            </div>
        `;

    }

    renderCards() {

        return achievements.map(achievement => {

            const unlocked = AchievementService.isUnlocked(this.player, achievement.id);

            return `
                <div class="achievement-card ${unlocked ? "unlocked" : "locked"}">

                    <div class="achievement-icon">
                        <img
                            src="${unlocked ? achievement.icon : achievement.iconLocked}"
                            alt="${unlocked ? achievement.name : "Bloqueado"}">
                    </div>

                    <span class="achievement-name">${achievement.name}</span>

                    <span class="achievement-desc">${achievement.description}</span>

                    ${unlocked ? `
                        <span class="achievement-unlocked-badge">
                            <i class="fa-solid fa-check"></i>
                            Desbloqueado
                        </span>
                    ` : ""}

                </div>
            `;

        }).join("");

    }

    registerEvents() {

        this.modal.querySelector("#achievements-close")?.addEventListener("click", () => {
            this.hide();
        });

    }

}
