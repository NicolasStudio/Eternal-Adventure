// Modal de "quantas unidades usar" pro Alimentar/Upar Pet — mesma
// estrutura/CSS do FarmConfirmModal (.continue-modal-overlay), com um
// range slider no meio. O jogador escolhe livremente de 0 até `max`
// (o teto muda dependendo de quem abriu: "Alimentar" limita ao que é
// JUSTO pra encher a fome, "Upar Pet" libera todo o estoque).
export default class PetFeedModal {

    constructor() {
        this.overlay = null;
    }

    // { title, item, max, hint } -> Promise<number|null> (null = cancelado/0)
    show({ title, item, max, hint = "" }) {

        return new Promise(resolve => {

            const safeMax = Math.max(0, Math.floor(max));
            const initial = Math.min(1, safeMax);

            this.overlay = document.createElement("div");
            this.overlay.className = "continue-modal-overlay";
            this.overlay.innerHTML = `
                <div class="continue-modal pet-feed-modal">

                    <h2 class="continue-title">${title}</h2>
                    <hr>

                    <div class="pet-feed-item">
                        <img src="${item.icon ?? item.image}" alt="${item.name}">
                        <span>${item.name}</span>
                    </div>

                    ${hint ? `<p class="continue-message pet-feed-hint">${hint}</p>` : ""}

                    <div class="pet-feed-range">
                        <input
                            type="range"
                            class="pet-feed-slider"
                            min="0"
                            max="${safeMax}"
                            value="${initial}"
                            ${safeMax <= 0 ? "disabled" : ""}
                        >
                        <span class="pet-feed-amount">${initial} / ${safeMax}</span>
                    </div>

                    <div class="continue-actions">
                        <button class="continue-no">Cancelar</button>
                        <button class="continue-yes" ${safeMax <= 0 ? "disabled" : ""}>Confirmar</button>
                    </div>

                </div>
            `;

            document.body.appendChild(this.overlay);

            document.activeElement?.blur();

            const slider = this.overlay.querySelector(".pet-feed-slider");
            const amountLabel = this.overlay.querySelector(".pet-feed-amount");

            slider.addEventListener("input", () => {
                amountLabel.textContent = `${slider.value} / ${safeMax}`;
            });

            const finish = (result) => {
                document.removeEventListener("keydown", handleKeydown, true);
                this.hide();
                resolve(result);
            };

            const confirm = () => {
                const amount = Number(slider.value);
                finish(amount > 0 ? amount : null);
            };

            const handleKeydown = (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    confirm();
                } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    finish(null);
                }
            };
            document.addEventListener("keydown", handleKeydown, true);

            this.overlay.querySelector(".continue-no").addEventListener("click", () => finish(null));
            this.overlay.querySelector(".continue-yes").addEventListener("click", confirm);

        });

    }

    hide() {
        if (!this.overlay) return;
        this.overlay.remove();
        this.overlay = null;
    }

}
