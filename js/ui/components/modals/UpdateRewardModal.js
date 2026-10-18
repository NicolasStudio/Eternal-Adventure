import ring from "../../../data/ring.js";
import amulet from "../../../data/amulet.js";
import farmCrops from "../../../data/farmCrops.js";
import SaveService from "../../../services/SaveService.js";
import Toast from "../Toast.js";
import ItemTooltip from "../../../views/ItemTooltip.js";

// Aviso único ao entrar no jogo, com uma recompensa pra coletar —
// mostrado UMA VEZ por personagem (ver HudScreen.maybeShowUpdateReward).
// Mesmo padrão da antiga CompensationModal.js (removida no Beta 0.2.3):
// o jogador só fecha clicando em Coletar, que já entrega tudo de uma vez.
const GOLD_REWARD = 1_000_000;

const MESSAGE = "Algumas atualizações foram feitas, confira o menu de atualizações para ficar por dentro. Em breve o modo competitivo será liberado, fique forte e desafie seus adversários nos modos 1x1, 2x2 e 3x3.";

export default class UpdateRewardModal {

    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.reward = null;
    }

    get player() {
        return this.game.player;
    }

    // Itens + quantidade da recompensa (ouro fica de fora daqui, mostrado
    // à parte) — mesma lista usada pra render (ícones) e pra collect()
    // (entrega de verdade), sem repetir a definição duas vezes.
    buildReward() {
        return [
            { item: ring.ringSkullMystic, quantity: 1 },
            { item: amulet.amuletSkullMystic, quantity: 1 },
            { item: farmCrops.potato.harvestedItem, quantity: 60 },
            { item: farmCrops.grape.harvestedItem, quantity: 45 },
            { item: farmCrops.watermelon.harvestedItem, quantity: 30 },
            { item: farmCrops.strawberry.harvestedItem, quantity: 15 }
        ];
    }

    show() {

        this.reward = this.buildReward();

        this.overlay = document.createElement("div");
        this.overlay.className = "continue-modal-overlay";
        this.overlay.innerHTML = `
            <div class="continue-modal update-reward-modal">
                <h2 class="continue-title">Atualização</h2>
                <hr>
                <p class="update-reward-message">${MESSAGE}</p>

                <div class="reward-section">
                    <span class="reward-label">Ouro</span>
                    <strong class="reward-value">+${GOLD_REWARD.toLocaleString("pt-BR")}</strong>
                </div>

                <div class="reward-items update-reward-items">
                    ${this.reward.map((entry, index) => `
                        <div class="reward-item" data-index="${index}">
                            <img src="${entry.item.icon}" alt="${entry.item.name}">
                            <span>${entry.item.name}${entry.quantity > 1 ? ` x${entry.quantity}` : ""}</span>
                        </div>
                    `).join("")}
                </div>

                <div class="continue-actions">
                    <button class="continue-yes continue-yes-success update-reward-collect">
                        <i class="fa-solid fa-gift"></i>
                        Coletar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        this.reward.forEach((entry, index) => {
            this.bindTooltip(this.overlay.querySelector(`[data-index="${index}"]`), entry.item);
        });

        this.overlay.querySelector(".update-reward-collect").addEventListener("click", () => {
            this.collect();
        });

    }

    collect() {

        this.reward ??= this.buildReward();

        const player = this.player;

        player.addGold(GOLD_REWARD);

        this.reward.forEach(({ item, quantity }) => {
            player.addItem(item, quantity);
        });

        player.progress.updateRewardClaimed = true;

        player.notify();

        SaveService.autoSave(player);

        Toast.show("Recompensa coletada! Confira seu inventário.");

        this.hide();

    }

    // Mesmo padrão de tooltip da Ferraria/Fusão: hover mostra a ficha
    // completa do item, seguindo o cursor.
    bindTooltip(element, item) {

        if (!element) return;

        element.addEventListener("mouseenter", (event) => {
            this.showTooltip(item, event.clientX, event.clientY);
        });
        element.addEventListener("mousemove", (event) => {
            this.updateTooltipPosition(event.clientX, event.clientY);
        });
        element.addEventListener("mouseleave", () => {
            this.hideTooltip();
        });

    }

    updateTooltipPosition(x, y) {
        const tooltip = document.getElementById("item-tooltip");
        if (!tooltip) return;
        const margin = 20;
        const width = tooltip.offsetWidth;
        const height = tooltip.offsetHeight;
        let left;
        let top = y + margin;
        if (x + margin + width <= window.innerWidth) {
            left = x + margin;
        } else {
            left = x - width - margin;
        }
        if (left < margin) left = margin;
        if (top + height > window.innerHeight) top = window.innerHeight - height - margin;
        if (top < margin) top = margin;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    showTooltip(item, x, y) {
        this.hideTooltip();
        const tooltip = new ItemTooltip(item);
        const element = document.createElement("div");
        element.id = "item-tooltip";
        element.className = "item-tooltip";
        element.innerHTML = tooltip.render();
        element.style.position = "fixed";
        element.style.zIndex = "99999";
        element.style.pointerEvents = "none";
        document.body.appendChild(element);
        this.updateTooltipPosition(x, y);
    }

    hideTooltip() {
        const tooltip = document.getElementById("item-tooltip");
        if (tooltip) tooltip.remove();
    }

    hide() {
        this.hideTooltip();
        if (!this.overlay) return;
        this.overlay.remove();
        this.overlay = null;
    }

}
