export default class DungeonSkipResultModal {
    constructor() {
        this.overlay = null;
    }

    show(dungeon, result) {
        return new Promise(resolve => {

            this.overlay = document.createElement("div");
            this.overlay.className = "reward-modal-overlay";

            const title = result.success
                ? `${dungeon.name} concluída!`
                : "Você foi derrotado...";

            const items = this.groupItems(result.items);

            this.overlay.innerHTML = `
                <div class="reward-modal">
                    <div class="reward-modal-box">
                        <h2 class="reward-title">${title}</h2>
                        <hr>
                        ${
                            !result.success
                                ? `
                                    <div class="reward-section">
                                        <span class="reward-label">Andar alcançado</span>
                                        <strong class="reward-value">${result.floorReached} / ${result.totalFloors}</strong>
                                    </div>
                                    <div class="reward-section">
                                        <span class="reward-label">Derrotado por</span>
                                        <strong class="reward-value">${result.diedTo ?? "?"}</strong>
                                    </div>
                                `
                                : ""
                        }
                        <div class="reward-section">
                            <span class="reward-label">Experiência</span>
                            <strong class="reward-value">+${result.xp} XP</strong>
                        </div>
                        <div class="reward-section">
                            <span class="reward-label">Ouro</span>
                            <strong class="reward-value">+${result.gold} Ouro</strong>
                        </div>
                        <div class="reward-section">
                            <span class="reward-label">Itens Obtidos</span>
                            <div class="reward-items">
                                ${items.length
                                    ? items.map(item => `
                                        <div class="reward-item">
                                            <img src="${item.icon}" alt="${item.name}">
                                            <span>${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}</span>
                                        </div>
                                    `).join("")
                                    : `<span class="reward-empty">Nenhum equipamento encontrado.</span>`
                                }
                            </div>
                        </div>
                        <button class="reward-collect">Continuar</button>
                    </div>
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

    // Junta itens iguais (mesmo id) numa linha só, somando as quantidades.
    groupItems(items) {

        const grouped = new Map();

        items.forEach(item => {

            const key = item.id ?? item.name;
            const existing = grouped.get(key);

            if (existing) {
                existing.quantity += item.quantity ?? 1;
            } else {
                grouped.set(key, { ...item, quantity: item.quantity ?? 1 });
            }

        });

        return [...grouped.values()];

    }

    hide() {
        if (!this.overlay) return;
        this.overlay.remove();
        this.overlay = null;
    }
}
