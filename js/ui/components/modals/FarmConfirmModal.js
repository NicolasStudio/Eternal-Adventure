// Confirmação genérica Sim/Não da Fazenda (arar com custo, remover
// semente antes da colheita). Mesma estrutura/CSS do
// DungeonSkipConfirmModal.js (.continue-modal-overlay) — inclusive a
// mesma blindagem contra Enter reabrindo/confirmando por engano: o
// botão que abriu o modal (ex: a ferramenta) perde o foco, e Enter/Esc
// são interceptados na fase de captura antes de chegar em qualquer
// botão por trás do overlay.
export default class FarmConfirmModal {
    constructor() {
        this.overlay = null;
    }

    show({ title, message, confirmLabel = "Sim", cancelLabel = "Não" }) {
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
                        <button class="continue-yes">${confirmLabel}</button>
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
