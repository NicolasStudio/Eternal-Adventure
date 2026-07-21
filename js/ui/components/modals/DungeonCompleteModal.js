export default class DungeonCompleteModal {

    constructor() {

        this.modal = null;
        this.resolve = null;

    }

    show(dungeon) {

        return new Promise(resolve => {
            this.resolve = resolve;
            this.render(dungeon);
        });
    }

    render(dungeon) {

        this.hide();

        this.modal = document.createElement("div");

        this.modal.className = "modal-overlay";

        this.modal.innerHTML = `
            <div class="dungeon-complete-modal">

                <h2 class="dungeon-complete-title">
                    🏆 DUNGEON CONCLUÍDA
                </h2>

                <p class="dungeon-complete-name">
                    ${dungeon.name}
                </p>

                <hr class="dungeon-complete-divider">

                <p class="dungeon-complete-info">
                    ✔ Andares concluídos: ${dungeon.fights}/${dungeon.fights}
                </p>

                <hr class="dungeon-complete-divider">

                <button class="dungeon-complete-button">
                    Continuar
                </button>

            </div>
        `;

        document.body.appendChild(this.modal);

        this.modal
            .querySelector(".dungeon-complete-button")
            .addEventListener("click", () => {

                this.hide();

                this.resolve();

            });

    }

    hide() {

        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}