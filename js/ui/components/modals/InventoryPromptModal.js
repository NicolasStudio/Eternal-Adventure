export default class InventoryPromptModal {

    constructor() {
        this.overlay = null;
    }

    show() {

        return new Promise(resolve => {

            this.overlay = document.createElement("div");

            this.overlay.className = "inventory-prompt-overlay";

            this.overlay.innerHTML = `
                <div class="continue-modal">

                    <h2 class="continue-title">
                        Inventário
                    </h2>

                    <hr>

                    <p class="continue-message">
                        Deseja abrir o inventário?
                    </p>

                    <div class="continue-actions">

                        <button class="continue-no">
                            Não
                        </button>

                        <button class="continue-yes">
                            Sim
                        </button>

                    </div>

                </div>
            `;

            document.body.appendChild(this.overlay);

            this.overlay
                .querySelector(".continue-no")
                .addEventListener("click", () => {

                    this.hide();

                    resolve(false);

                });

            this.overlay
                .querySelector(".continue-yes")
                .addEventListener("click", () => {

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