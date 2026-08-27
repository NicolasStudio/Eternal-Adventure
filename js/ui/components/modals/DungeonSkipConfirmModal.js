export default class DungeonSkipConfirmModal {
    constructor() {
        this.overlay = null;
    }

    show(dungeon) {
        return new Promise(resolve => {
            this.overlay = document.createElement("div");
            this.overlay.className = "continue-modal-overlay";
            this.overlay.innerHTML = `
                <div class="continue-modal">
                    <h2 class="continue-title">Pular Dungeon</h2>
                    <hr>
                    <p class="continue-message">
                        Isso vai simular os ${dungeon.fights} andares de
                        <strong>${dungeon.name}</strong> automaticamente,
                        com o combate de verdade — inclusive o risco de
                        derrota. Deseja continuar?
                    </p>
                    <div class="continue-actions">
                        <button class="continue-no">Não</button>
                        <button class="continue-yes">Sim, pular</button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.overlay);

            // O botão que abriu o modal (ex: "Pular") continua com foco
            // do navegador por baixo do overlay — sem isso, apertar Enter
            // dispara um clique sintético nele de novo (reabrindo esse
            // mesmo modal ou entrando direto no combate), em vez de
            // confirmar a escolha feita aqui.
            document.activeElement?.blur();

            const finish = (result) => {
                document.removeEventListener("keydown", handleKeydown, true);
                this.hide();
                resolve(result);
            };

            // Fase de captura: intercepta Enter/Esc antes que cheguem a
            // qualquer botão ainda focado por trás do overlay.
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
