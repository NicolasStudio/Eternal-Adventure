import weapons from "../../../data/weapons.js";
import helmets from "../../../data/helmets.js";
import chests from "../../../data/chest.js";
import legs from "../../../data/legs.js";
import boots from "../../../data/boots.js";
import dungeons from "../../../data/dungeons.js";
import monsters from "../../../data/monsters.js";
import seeds from "../../../data/seeds.js";
import Toast from "../Toast.js";
import ItemTooltip from "../../../views/ItemTooltip.js";
import SeedTooltip from "../../../views/SeedTooltip.js";

const TABS = [
    { id: "weapon", label: "Armas" },
    { id: "helmet", label: "Cabeça" },
    { id: "chest", label: "Peitoral" },
    { id: "leg", label: "Calça" },
    { id: "boot", label: "Botas" },
    { id: "item", label: "Itens" },
    { id: "seed", label: "Sementes" }
];

const FARM_UNLOCK_LEVEL = 30;
const MAX_BUY_QUANTITY = 999;

export default class MarketViewBuy {
    constructor(game) {
        this.game = game;
        this.selectedItem = null;
        this.shopItems = [];
        this.visibleItems = [];
        this.activeTab = "weapon";
        this.quantity = 1; // só usado com item empilhável (poção/semente)
    }

    get player() {
        return this.game.player;
    }

    getEquipments() {
        return {
            weapons: Object.values(weapons),
            helmets: Object.values(helmets),
            chests: Object.values(chests),
            legs: Object.values(legs),
            boots: Object.values(boots)
        };
    }

    getAllEquipments() {
        const { weapons, helmets, chests, legs, boots } = this.getEquipments();
        return [...weapons, ...helmets, ...chests, ...legs, ...boots];
    }

    getShopItems() {
        const items = [];
        const unlocked = new Set();
        const equipments = this.getAllEquipments();
        dungeons.forEach(dungeon => {
            if (!this.player.hasCompletedDungeon(dungeon.id)) {
                return;
            }
            dungeon.drops.forEach(drop => {
                if (!drop.type) return;
                equipments.forEach(item => {
                    if (item.class !== this.player.class.id) {
                        return;
                    }
                    if (item.rarity.id !== drop.rarity) {
                        return;
                    }
                    if (!drop.type.includes(item.slot)) {
                        return;
                    }
                    if (unlocked.has(item.id)) {
                        return;
                    }
                    unlocked.add(item.id);
                    items.push(item);
                });
            });
            // Poções entram na loja assim que o chefe que a dropa for
            // vencido pela primeira vez — não precisa ter caído a poção
            // de verdade ainda, só ter vencido a luta uma vez.
            if (!dungeon.boss) return;
            const bossMonster = monsters.find(m => m.id === dungeon.monsters[0]);
            (bossMonster?.drops ?? []).forEach(drop => {
                if (!drop.item?.heal) return; // só poções (têm campo heal)
                if (unlocked.has(drop.item.id)) return;
                unlocked.add(drop.item.id);
                items.push(drop.item);
            });
        });

        // Sementes: liberadas por nível, não por dungeon — todas as 4
        // aparecem de uma vez a partir do nível 30 (ver Fazenda).
        if (this.player.level >= FARM_UNLOCK_LEVEL) {
            items.push(...Object.values(seeds));
        }

        return items;
    }

    // Filtra this.shopItems pela aba ativa — mesmos ids/critérios de
    // CharacterView.getFilteredInventory(), pra ficar consistente com
    // o inventário do jogador (equipamento por slot, poção em "item",
    // semente na aba própria).
    getTabItems() {
        return this.shopItems.filter(item => {
            switch (this.activeTab) {
                case "weapon": return item.slot === "weapon";
                case "helmet": return item.slot === "helmet";
                case "chest": return item.slot === "chest";
                case "leg": return item.slot === "leg";
                case "boot": return item.slot === "boot";
                case "item": return item.type === "item" && item.category !== "seed";
                case "seed": return item.category === "seed";
                default: return false;
            }
        });
    }

    render() {
        this.shopItems = this.getShopItems();
        this.visibleItems = this.getTabItems();
        return `
            <section class="market-window">
                ${this.renderHeader()}
                <div class="market-buy-body">
                    ${this.renderTabs()}
                    ${this.renderItems()}
                    ${this.renderActions()}
                </div>
            </section>
        `;
    }

    renderTabs() {
        return `
            <div class="market-buy-tabs">
                ${TABS.map(tab => `
                    <button class="market-buy-tab ${this.activeTab === tab.id ? "active" : ""}" data-tab="${tab.id}">
                        ${tab.label}
                    </button>
                `).join("")}
            </div>
        `;
    }

    renderHeader() {
        return `
            <header class="market-header">
                <div>
                    <h2>Mercado</h2>
                    <span>Compre equipamentos desbloqueados nas dungeons.</span>
                </div>
                <button class="market-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>
        `;
    }

    renderItems() {
        if (!this.visibleItems.length) {

            const message = (this.activeTab === "seed" && this.player.level < FARM_UNLOCK_LEVEL)
                ? `Sementes disponíveis a partir do nível ${FARM_UNLOCK_LEVEL}.`
                : "Nenhum item disponível, vença uma Dungeon.";

            return `
                <div class="market-buy-empty">
                    <i class="fa-solid fa-box-open"></i>
                    <span>${message}</span>
                </div>
            `;
        }
        return `
            <div class="market-buy-grid">
                ${this.visibleItems.map(item => this.renderItem(item)).join("")}
            </div>
        `;
    }

    renderItem(item) {
        const selected = this.selectedItem?.id === item.id ? "selected" : "";
        return `
            <div class="market-buy-slot ${selected}" data-id="${item.id}">
                <img src="${item.icon}" alt="${item.name}" class="market-buy-slot-icon">
            </div>
        `;
    }

    // Poções e sementes empilham no inventário (Player.addItem), então
    // dá pra comprar várias de uma vez. Equipamento é sempre 1.
    isStackable(item) {
        return item?.type === "item";
    }

    getMaxAffordable() {
        const unitPrice = this.getItemPrice(this.selectedItem);
        if (unitPrice <= 0) return MAX_BUY_QUANTITY;
        return Math.max(1, Math.min(MAX_BUY_QUANTITY, Math.floor(this.player.gold / unitPrice)));
    }

    getBuyQuantity() {
        return this.isStackable(this.selectedItem) ? this.quantity : 1;
    }

    renderQuantity() {
        if (!this.isStackable(this.selectedItem)) return "";
        return `
            <div class="market-buy-divider"></div>

            <div class="market-buy-section market-buy-quantity">
                <button class="market-buy-qty-btn" data-qty="-1" aria-label="Diminuir">
                    <i class="fa-solid fa-minus"></i>
                </button>
                <div class="market-buy-text">
                    <span class="label">QUANTIDADE</span>
                    <input
                        class="market-buy-qty-input"
                        type="number"
                        min="1"
                        max="${MAX_BUY_QUANTITY}"
                        value="${this.quantity}"
                    >
                </div>
                <button class="market-buy-qty-btn" data-qty="1" aria-label="Aumentar">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <button class="market-buy-qty-max">Máx</button>
            </div>
        `;
    }

    renderActions() {

        const price = this.selectedItem
            ? this.getItemPrice(this.selectedItem) * this.getBuyQuantity()
            : 0;

        const canBuy =
            this.selectedItem &&
            this.player.gold >= price;

        return `
            <footer class="market-buy-footer">

                <div class="market-buy-info">

                    <div class="market-buy-section">

                        <i class="fa-solid fa-coins"></i>

                        <div class="market-buy-text">
                            <span class="label">SEU OURO</span>
                            <span class="value">${this.player.gold.toLocaleString("pt-BR")}</span>
                        </div>

                    </div>

                    <div class="market-buy-divider"></div>

                    <div class="market-buy-section">

                        <i class="fa-solid fa-tag"></i>

                        <div class="market-buy-text">
                            <span class="label">PREÇO</span>
                            <span class="value market-buy-price">
                                ${this.selectedItem ? price.toLocaleString("pt-BR") : "--"}
                            </span>
                        </div>

                    </div>

                    ${this.renderQuantity()}

                </div>

                <button
                    class="market-buy-button"
                    ${canBuy ? "" : "disabled"}
                >
                    <i class="fa-solid fa-cart-shopping"></i>

                    ${
                        !this.selectedItem
                            ? "Comprar"
                            : canBuy
                                ? "Comprar"
                                : "Ouro insuficiente"
                    }

                </button>

            </footer>
        `;
    }
        
    getItemPrice(item) {
        return item.buyValue ?? item.value ?? 0;
    }

    refresh() {
        this.hideTooltip();
        const window = document.querySelector(".market-window");
        if (!window) return;
        window.outerHTML = this.render();
        this.registerEvents(document);
    }

    registerItemEvents(container) {
        const slots = container.querySelectorAll(".market-buy-slot");
        slots.forEach((slot, index) => {
            const item = this.visibleItems[index];
            slot.addEventListener("click", () => {
                if (this.selectedItem?.id !== item.id) this.quantity = 1;
                this.selectedItem = item;
                this.refresh();
            });
            slot.addEventListener("mouseenter", (event) => {
                this.showTooltip(item, event.clientX, event.clientY);
            });
            slot.addEventListener("mousemove", (event) => {
                this.updateTooltipPosition(event.clientX, event.clientY);
            });
            slot.addEventListener("mouseleave", () => {
                this.hideTooltip();
            });
        });
    }

    buySelectedItem() {

        if (!this.selectedItem) {

            Toast.show("Selecione um item.");

            return;

        }

        const quantity = this.getBuyQuantity();
        const price = this.getItemPrice(this.selectedItem) * quantity;

        if (!this.player.removeGold(price)) {

            Toast.show("Ouro insuficiente.");

            return;

        }

        this.player.addItem(this.selectedItem, quantity);

        Toast.show(
            quantity > 1
                ? `${quantity}x ${this.selectedItem.name} comprados com sucesso!`
                : `${this.selectedItem.name} comprado com sucesso!`
        );

        this.refresh();

    }

    registerEvents(container = document) {
        const closeButton = container.querySelector(".market-close");
        if (closeButton) {
            closeButton.addEventListener("click", () => {
                this.game.hudScreen.changeView("city");
            });
        }
        this.registerItemEvents(container);
        container.querySelectorAll(".market-buy-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                this.activeTab = tab.dataset.tab;
                this.selectedItem = null;
                this.quantity = 1;
                this.refresh();
            });
        });
        this.registerQuantityEvents(container);
        const buyButton = container.querySelector(".market-buy-button");
        if (buyButton) {
            buyButton.addEventListener("click", () => {
                if (buyButton.disabled) return;
                this.buySelectedItem();
            });
        }
    }

    registerQuantityEvents(container) {

        const input = container.querySelector(".market-buy-qty-input");

        if (!input) return;

        container.querySelectorAll(".market-buy-qty-btn").forEach(button => {
            button.addEventListener("click", () => {
                this.setQuantity(this.quantity + Number(button.dataset.qty));
                input.value = this.quantity;
            });
        });

        container.querySelector(".market-buy-qty-max")?.addEventListener("click", () => {
            this.setQuantity(this.getMaxAffordable());
            input.value = this.quantity;
        });

        // Enquanto digita só atualiza preço/botão (sem re-renderizar,
        // pra não perder o foco); ao sair do campo normaliza o valor.
        input.addEventListener("input", () => {
            if (input.value === "") return;
            this.setQuantity(Number(input.value));
        });

        input.addEventListener("change", () => {
            this.setQuantity(Number(input.value));
            input.value = this.quantity;
        });

    }

    setQuantity(value) {
        const quantity = Number.isFinite(value) ? Math.floor(value) : 1;
        this.quantity = Math.max(1, Math.min(MAX_BUY_QUANTITY, quantity));
        this.updateFooterState();
    }

    // Atualiza preço total e o botão de comprar sem refresh().
    updateFooterState() {

        const priceEl = document.querySelector(".market-buy-price");
        const buyButton = document.querySelector(".market-buy-button");

        if (!priceEl || !buyButton || !this.selectedItem) return;

        const price = this.getItemPrice(this.selectedItem) * this.getBuyQuantity();
        const canBuy = this.player.gold >= price;

        priceEl.textContent = price.toLocaleString("pt-BR");
        buyButton.disabled = !canBuy;
        buyButton.innerHTML = `
            <i class="fa-solid fa-cart-shopping"></i>
            ${canBuy ? "Comprar" : "Ouro insuficiente"}
        `;

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
        if (left < margin) {
            left = margin;
        }
        if (top + height > window.innerHeight) {
            top = window.innerHeight - height - margin;
        }
        if (top < margin) {
            top = margin;
        }
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    showTooltip(item, x, y) {
        this.hideTooltip();
        const tooltip = item.category === "seed" ? new SeedTooltip(item) : new ItemTooltip(item);
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
        if (tooltip) {
            tooltip.remove();
        }
    }
}