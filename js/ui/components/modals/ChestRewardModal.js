export default class ChestRewardModal {

    constructor() {
        this.modal = null;
        this.resolve = null;
        this.revealed = false;
    }

    show(card) {

        return new Promise(resolve => {
            this.resolve = resolve;
            this.revealed = false;
            this.render(card);
        });

    }

    render(card) {

        this.hide();

        this.modal = document.createElement("div");
        this.modal.className = "modal-overlay";

        // O sorteio já vem pronto quando ChestService.open() falha
        // por algum motivo (baú ainda não pronto) -> card é null.
        if (!card) {
            this.resolve?.();
            this.modal = null;
            return;
        }

        this.modal.innerHTML = `
            <div class="chest-reward-modal">

                <h2 class="chest-reward-title">Nova Carta!</h2>

                <div class="chest-reward-card">
                    <img
                        src="${card.image}"
                        alt="${card.name}"
                        class="${this.revealed ? "" : "blur"}">
                </div>

                <p class="chest-reward-name">${this.revealed ? card.name : "?????"}</p>

                <div class="chest-reward-actions">

                    <button class="chest-reward-view">
                        <i class="fa-solid ${this.revealed ? "fa-eye-slash" : "fa-eye"}"></i>
                        ${this.revealed ? "Ocultar" : "Visualizar"}
                    </button>

                    <button class="chest-reward-button">Continuar</button>

                </div>

            </div>
        `;

        document.body.appendChild(this.modal);

        this.modal
            .querySelector(".chest-reward-view")
            .addEventListener("click", () => {
                this.revealed = !this.revealed;
                this.render(card);
            });

        this.modal
            .querySelector(".chest-reward-button")
            .addEventListener("click", () => {
                this.hide();
                this.resolve?.();
            });

    }

    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

}
