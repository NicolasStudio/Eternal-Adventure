export default class RewardModal {
    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.reward = null;
    }

    show(reward) {
        this.reward = reward;
        return new Promise(resolve => {
            this.overlay = document.createElement("div");
            this.overlay.className = "reward-modal-overlay";
            this.overlay.innerHTML = `
                <div class="reward-modal">
                    <h2 class="reward-title">Vitória!</h2>
                    <hr>
                    <div class="reward-section">
                        <span class="reward-label">Experiência</span>
                        <strong class="reward-value">+${reward.xp} XP</strong>
                    </div>
                    <div class="reward-section">
                        <span class="reward-label">Ouro</span>
                        <strong class="reward-value">+${reward.gold} Ouro</strong>
                    </div>
                    <div class="reward-section">
                        <span class="reward-label">Itens Obtidos</span>
                        <div class="reward-items">
                            ${reward.items.length
                                ? reward.items.map(item => `
                                    <div class="reward-item">
                                        <img src="${item.icon}" alt="${item.name}">
                                        <span>${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}</span>
                                    </div>
                                `).join("")
                                : `<span class="reward-empty">Nenhum equipamento encontrado.</span>`
                            }
                        </div>
                    </div>
                    <button class="reward-collect">Coletar</button>
                </div>
            `;
            document.body.appendChild(this.overlay);
            const close = () => {
                this.hide();
                resolve();
            };
            this.overlay.querySelector(".reward-collect").addEventListener("click", close);
        });
    }

    hide() {
        if (!this.overlay) {
            return;
        }
        this.overlay.remove();
        this.overlay = null;
    }
}