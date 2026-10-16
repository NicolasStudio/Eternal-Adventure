// Modal do lobby de PVP (ver PvpView.renderLobby): primeira escolha ao
// entrar na Arena — Combate Livre (1x1/2x2/3x3 de sempre) ou Combate
// Ranqueado (Modo Torneio, travado por enquanto — ver
// PvpView.enterRankedLocked). show({ onFree, onRanked }) guarda os
// callbacks e cada clique já fecha o modal antes de chamar o escolhido.
export default class PvpModeChoiceModal {

    constructor() {
        this.modal = null;
        this.onFree = null;
        this.onRanked = null;
    }

    show({ onFree, onRanked } = {}) {

        this.hide();

        this.onFree = onFree ?? null;
        this.onRanked = onRanked ?? null;

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

    render() {
        return `
            <div class="pvp-choice-modal">
                <header class="pvp-choice-header">
                    <h2>Escolha seu Combate</h2>
                    <button class="close-btn pvp-choice-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <div class="pvp-mode-options pvp-choice-options">
                    <button class="pvp-mode-btn pvp-choice-btn" data-choice="free">
                        <i class="fa-solid fa-hand-fist pvp-choice-icon"></i>
                        <span class="pvp-mode-label">Combate Livre</span>
                        <span class="pvp-mode-sub">1x1, 2x2 e 3x3</span>
                    </button>
                    <button class="pvp-mode-btn pvp-mode-locked pvp-choice-btn" data-choice="ranked">
                        <i class="fa-solid fa-trophy pvp-choice-icon"></i>
                        <span class="pvp-mode-label">Combate Ranqueado</span>
                        <span class="pvp-mode-sub">Modo Torneio — em breve</span>
                    </button>
                </div>
            </div>
        `;
    }

    registerEvents() {

        this.modal.querySelector(".pvp-choice-close")?.addEventListener("click", () => this.hide());

        this.modal.querySelectorAll(".pvp-choice-btn").forEach(button => {
            button.addEventListener("click", () => {

                const choice = button.dataset.choice;

                this.hide();

                if (choice === "free") this.onFree?.();
                if (choice === "ranked") this.onRanked?.();

            });
        });

    }

}
