import pets from "../../../data/pet.js";
import PetService from "../../../services/PetService.js";
import SaveService from "../../../services/SaveService.js";
import Toast from "../Toast.js";
import ItemTooltip from "../../../views/ItemTooltip.js";

// Pedido de desculpas pela remoção do "Rei dos Encantamentos" e pelo
// ajuste do "Cara ou Coroa?" — mostrado UMA VEZ por personagem (ver
// HudScreen.maybeShowCompensation). O jogador só fecha clicando em
// Coletar, que já entrega a recompensa.
const GOLD_REWARD = 1_000_000;
const RATION_LEVEL_EQUIVALENT = 10;

const MESSAGE = `Fala pessoal, como sabem, o jogo ainda está em desenvolvimento, então mudanças são de suma importância para a saúde do jogo. A árvore de talentos é interessante, mas algumas deixam o jogo injogável para algumas classes. Então a árvore "Rei dos Encantamentos" foi removida, e a "Cara ou Coroa?" foi ajustada.

Como um pedido de desculpas pelo transtorno, estou dando um Pet EXCLUSIVO — e não existirá outro. Além de uma recompensa em ouro e um saco de ração equivalente ao nível 10, para que possam usar no novo pet.`;

export default class CompensationModal {

    constructor(game) {
        this.game = game;
        this.overlay = null;
    }

    get player() {
        return this.game.player;
    }

    // Monta os itens da recompensa (mas não entrega ainda) — usado tanto
    // pra mostrar o ícone com tooltip quanto pra gravar de verdade em
    // collect(), sem repetir a definição dos dois.
    buildReward() {
        return {
            egg: { ...pets.spiderHalloweenPet1, icon: pets.spiderHalloweenPet1.image },
            ration: {
                id: `pet_ration_${crypto.randomUUID()}`,
                name: "Ração de Pet",
                type: "item",
                category: "ration",
                description: "Um saco de ração, dado como pedido de desculpas pelo ajuste nos talentos. Guarda XP suficiente pra levar um pet ao nível 10.",
                icon: "assets/img/icons/bag-of-pet-food.png",
                petXpValue: PetService.getTotalXp({ level: RATION_LEVEL_EQUIVALENT, xp: 0 }),
                quantity: 1,
                sellValue: 0
            }
        };
    }

    show() {

        this.reward = this.buildReward();

        this.overlay = document.createElement("div");
        this.overlay.className = "continue-modal-overlay";
        this.overlay.innerHTML = `
            <div class="continue-modal compensation-modal">
                <h2 class="continue-title">Aviso de Balanceamento</h2>
                <hr>
                <p class="continue-message compensation-message">${this.renderMessage()}</p>

                <div class="compensation-items">
                    <div class="compensation-item" data-item="egg">
                        <img src="${this.reward.egg.icon}" alt="${this.reward.egg.name}">
                        <span class="compensation-item-name">${this.reward.egg.name}</span>
                    </div>
                    <div class="compensation-item" data-item="ration">
                        <img src="${this.reward.ration.icon}" alt="${this.reward.ration.name}">
                        <span class="compensation-item-name">${this.reward.ration.name}</span>
                    </div>
                </div>

                <div class="compensation-gold">
                    <i class="fa-solid fa-coins"></i>
                    <span>${GOLD_REWARD.toLocaleString("pt-BR")}</span>
                </div>

                <div class="continue-actions">
                    <button class="continue-yes continue-yes-success compensation-collect">
                        <i class="fa-solid fa-gift"></i>
                        Coletar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        this.bindTooltip(this.overlay.querySelector('[data-item="egg"]'), this.reward.egg);
        this.bindTooltip(this.overlay.querySelector('[data-item="ration"]'), this.reward.ration);

        this.overlay.querySelector(".compensation-collect").addEventListener("click", () => {
            this.collect();
        });

    }

    renderMessage() {
        return MESSAGE
            .split("\n\n")
            .map(paragraph => `<span class="compensation-paragraph">${paragraph}</span>`)
            .join("");
    }

    collect() {

        // Normalmente já existe (definido em show(), antes do botão Coletar
        // sequer aparecer) — a linha abaixo só protege quem chamar collect()
        // direto, fora do fluxo normal do modal.
        this.reward ??= this.buildReward();

        const player = this.player;

        player.addGold(GOLD_REWARD);

        player.addItem(this.reward.ration);
        player.addItem(this.reward.egg);

        player.progress.compensationClaimed = true;

        player.notify();

        SaveService.autoSave(player);

        Toast.show("Recompensa coletada! Confira seu inventário.");

        this.hide();

    }

    // Mesmo padrão de tooltip da Ferraria (BlacksmithEnchant.js): hover
    // mostra a ficha completa do item, seguindo o cursor.
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

    showTooltip(item, x, y) {
        this.hideTooltip();
        const tooltip = new ItemTooltip(item, { showFooter: false });
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
