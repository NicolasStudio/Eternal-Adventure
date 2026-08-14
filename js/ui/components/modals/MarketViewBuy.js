import weapons from "../../../data/weapons.js";
import helmets from "../../../data/helmets.js";
import chests from "../../../data/chest.js";
import legs from "../../../data/legs.js";
import boots from "../../../data/boots.js";
import dungeons from "../../../data/dungeons.js";
import monsters from "../../../data/monsters.js";
import Toast from "../Toast.js";
import ItemTooltip from "../../../views/ItemTooltip.js";

export default class MarketViewBuy {
    constructor(game) {
        this.game = game;
        this.selectedItem = null;
        this.shopItems = [];
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
        return items;
    }

    render() {
        this.shopItems = this.getShopItems();
        return `
            <section class="market-window">
                ${this.renderHeader()}
                <div class="market-buy-body">
                    ${this.renderItems()}
                    ${this.renderActions()}
                </div>
            </section>
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
        if (!this.shopItems.length) {
            return `
                <div class="market-buy-empty">
                    <i class="fa-solid fa-box-open"></i>
                    <span>Nenhum item disponível, vença uma Dungeon.</span>
                </div>
            `;
        }
        return `
            <div class="market-buy-grid">
                ${this.shopItems.map(item => this.renderItem(item)).join("")}
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

    renderActions() {

        const price = this.selectedItem
            ? this.getItemPrice(this.selectedItem)
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
                            <span class="label">OURO</span>
                            <span class="value">${this.player.gold.toLocaleString("pt-BR")}</span>
                        </div>

                    </div>

                    <div class="market-buy-divider"></div>

                    <div class="market-buy-section">

                        <i class="fa-solid fa-tag"></i>

                        <div class="market-buy-text">
                            <span class="label">PREÇO</span>
                            <span class="value">
                                ${this.selectedItem ? price.toLocaleString("pt-BR") : "--"}
                            </span>
                        </div>

                    </div>

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
            const item = this.shopItems[index];
            slot.addEventListener("click", () => {
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

        const price = this.getItemPrice(this.selectedItem);

        if (!this.player.removeGold(price)) {

            Toast.show("Ouro insuficiente.");

            return;

        }

        this.player.addItem(this.selectedItem);

        Toast.show(`${this.selectedItem.name} comprado com sucesso!`);

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
        const buyButton = container.querySelector(".market-buy-button");
        if (buyButton) {
            buyButton.addEventListener("click", () => {
                if (buyButton.disabled) return;
                this.buySelectedItem();
            });
        }
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
        if (tooltip) {
            tooltip.remove();
        }
    }
}