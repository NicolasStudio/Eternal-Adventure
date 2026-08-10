export default class SoulChoiceModal {
    constructor() {
        this.overlay = null;
    }

    show() {
        return new Promise(resolve => {

            this.overlay = document.createElement("div");
            this.overlay.className = "continue-modal-overlay soul-choice-overlay";
            this.overlay.innerHTML = `
                <div class="continue-modal soul-choice-modal">
                    <h2 class="continue-title">???</h2>
                    <p class="continue-message soul-choice-message">
                        Você chegou mais longe do que qualquer um poderia imaginar. Mas ainda pode ir além... se estiver disposto a pagar o preço. Venderia sua alma por mais poder?
                    </p>
                    <div class="continue-actions">
                        <button class="soul-choice-no">Não</button>
                        <button class="soul-choice-yes">Sim</button>
                    </div>
                </div>
            `;

            document.body.appendChild(this.overlay);

            this.overlay.querySelector(".soul-choice-no").addEventListener("click", () => {
                this.hide();
                resolve("light");
            });

            this.overlay.querySelector(".soul-choice-yes").addEventListener("click", () => {
                this.hide();
                resolve("dark");
            });

        });
    }

    hide() {
        if (!this.overlay) return;
        this.overlay.remove();
        this.overlay = null;
    }
}
