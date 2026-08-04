export default class ChestRewardModal {

    constructor() {
        this.modal = null;
        this.resolve = null;
    }

    show(card) {

        return new Promise(resolve => {
            this.resolve = resolve;
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
                    <img src="${card.image}" alt="${card.name}">
                </div>

                <p class="chest-reward-name">${card.name}</p>

                <button class="chest-reward-button">Continuar</button>

            </div>
        `;

        document.body.appendChild(this.modal);

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
