export default class RewardModal {
    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.reward = null;
    }

    // options.showActions = true -> modo "meio de dungeon" (3 botões)
    // options.onOpenInventory = callback async chamado ao clicar em
    // "Abrir Inventário" — o modal só se esconde enquanto isso roda e
    // reaparece depois, sem resolver a Promise (ela só resolve quando o
    // jogador escolhe Continuar ou Sair da Dungeon).
    show(reward, options = {}) {
        const { showActions = false, onOpenInventory } = options;
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
                    ${
                        showActions
                            ? `
                                <div class="reward-actions">
                                    <button class="reward-action reward-action-inventory">Abrir Inventário</button>
                                    <button class="reward-action reward-action-continue">Continuar</button>
                                    <button class="reward-action reward-action-exit">Sair da Dungeon</button>
                                </div>
                            `
                            : `<button class="reward-collect">Coletar</button>`
                    }
                </div>
            `;
            document.body.appendChild(this.overlay);

            if (!showActions) {
                this.overlay.querySelector(".reward-collect").addEventListener("click", () => {
                    this.hide();
                    resolve(true);
                });
                return;
            }

            this.overlay.querySelector(".reward-action-inventory").addEventListener("click", async () => {

                this.overlay.style.display = "none";

                await onOpenInventory?.();

                if (this.overlay) this.overlay.style.display = "";

            });

            this.overlay.querySelector(".reward-action-continue").addEventListener("click", () => {
                this.hide();
                resolve(true);
            });

            this.overlay.querySelector(".reward-action-exit").addEventListener("click", () => {
                this.hide();
                resolve(false);
            });

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