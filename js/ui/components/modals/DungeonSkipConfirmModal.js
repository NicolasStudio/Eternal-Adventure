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
            this.overlay.querySelector(".continue-no").addEventListener("click", () => {
                this.hide();
                resolve(false);
            });
            this.overlay.querySelector(".continue-yes").addEventListener("click", () => {
                this.hide();
                resolve(true);
            });
        });
    }

    hide() {
        if (!this.overlay) return;
        this.overlay.remove();
        this.overlay = null;
    }
}
