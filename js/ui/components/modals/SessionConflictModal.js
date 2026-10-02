// Confirmação Sim/Não de "essa conta já está aberta em outro lugar,
// desconectar a sessão anterior e continuar aqui?" (ver PresenceService
// e Game.enterWithAccount). Mesma estrutura/CSS do FarmConfirmModal.js
// (.continue-modal-overlay), inclusive a mesma blindagem contra Enter
// reabrindo/confirmando por engano.
export default class SessionConflictModal {
    constructor() {
        this.overlay = null;
    }

    show({
        title = "Conta em uso",
        message = "Essa conta já está aberta em outro lugar. Deseja desconectar a sessão anterior e continuar aqui?",
        confirmLabel = "Desconectar e continuar",
        cancelLabel = "Cancelar"
    } = {}) {
        return new Promise(resolve => {
            this.overlay = document.createElement("div");
            this.overlay.className = "continue-modal-overlay";
            this.overlay.innerHTML = `
                <div class="continue-modal">
                    <h2 class="continue-title">${title}</h2>
                    <hr>
                    <p class="continue-message">${message}</p>
                    <div class="continue-actions">
                        <button class="continue-no">${cancelLabel}</button>
                        <button class="continue-yes continue-yes-danger">${confirmLabel}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.overlay);

            document.activeElement?.blur();

            const finish = (result) => {
                document.removeEventListener("keydown", handleKeydown, true);
                this.hide();
                resolve(result);
            };

            const handleKeydown = (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    finish(true);
                } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    finish(false);
                }
            };
            document.addEventListener("keydown", handleKeydown, true);

            this.overlay.querySelector(".continue-no").addEventListener("click", () => {
                finish(false);
            });
            this.overlay.querySelector(".continue-yes").addEventListener("click", () => {
                finish(true);
            });
        });
    }

    hide() {
        if (!this.overlay) return;
        this.overlay.remove();
        this.overlay = null;
    }
}
