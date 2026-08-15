import Toast from "../ui/components/Toast.js";
import ItemValueService from "../services/ItemValueService.js";

export default class MarketView {
    constructor(game) {
        this.game = game;
        this.selectedItem = null;
        this.sellQuantity = 1;
        this.keydownBound = false;
        this.confirmBulkSellRarity = null;
    }

    get player() {
        return this.game.player;
    }

    get inventory() {
        return this.player.inventory;
    }

    render() {
        return `
            <section class="market-window">
                ${this.renderHeader()}
                <div class="market-body">
                    <aside class="market-left">
                        ${this.renderInventory()}
                    </aside>
                    <section class="market-right">
                        ${this.renderDetails()}
                    </section>
                </div>
            </section>
        `;
    }

    renderHeader() {
        return `
            <header class="market-header">
                <div>
                    <h2>Mercado</h2>
                    <span>Venda seus equipamentos e itens.</span>
                </div>
                <button class="market-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>
        `;
    }

    renderInventory() {
        const items = this.getMarketItems();
        if (!items.length) {
            return `
                <div class="market-empty">
                    <i class="fa-solid fa-box-open"></i>
                    <span>Você não possui itens para vender.</span>
                </div>
            `;
        }
        return `
            <div class="market-inventory">
                <div class="market-inventory-title">
                    Inventário
                    <span>${items.length} itens</span>
                </div>
                ${this.renderBulkSellPanel(items)}
                <div class="market-item-list">
                    ${items.map(item => this.renderItem(item)).join("")}
                </div>
            </div>
        `;
    }

    renderItem(item) {
        const selected = this.selectedItem?.uid === item.uid;
        const rarity = item.rarity ?? { name: item.nivel ? `Nível ${item.nivel}` : "Comum", color: item.color ?? "#FFFFFF" };
        return `
            <button class="market-item ${selected ? "selected" : ""}" data-uid="${item.uid}">
                <img src="${item.icon}" alt="${item.name}" class="market-item-icon">
                <div class="market-item-content">
                    <span class="market-item-name">${item.name}</span>
                    <span class="market-item-rarity" style="color:${rarity.color};">${rarity.name}</span>
                </div>
                <div class="market-item-price">
                    ${ItemValueService.getSellValue(item)}
                    <i class="fa-solid fa-coins"></i>
                </div>
            </button>
        `;
    }

    getStatIcon(stat){

        const icons = {

            attack: "fa-sword",

            armor: "fa-shield",

            agility: "fa-person-running",

            intelligence: "fa-brain",

            strength: "fa-hand-fist",

            resistance: "fa-shield-halved",

            penetration: "fa-burst",

            criticalChance: "fa-crosshairs",

            lifeSteal: "fa-droplet",

            dodge: "fa-wind",

            accuracy: "fa-bullseye",

            health: "fa-heart",

            mana: "fa-hat-wizard"

        };

        return icons[stat] ?? "fa-circle";

    }

    renderInfo(){

        const item = this.selectedItem;

        const rarity = item.rarity ?? { name: item.nivel ? `Nível ${item.nivel}` : "Comum", color: item.color ?? "#FFFFFF" };

        return `

            <div class="market-info">

                ${
                    item.class
                        ? `
                        <div class="market-info-row">

                            <span>Classe</span>

                            <strong>${this.getClassName(item.class)}</strong>

                        </div>
                        `
                        : ""
                }

                <div class="market-info-row">

                    <span>Raridade</span>

                    <strong style="color:${rarity.color}">

                        ${rarity.name}

                    </strong>

                </div>

                ${
                    item.quality
                        ? `
                            <div class="market-info-row">

                                <span>Qualidade</span>

                                <strong>

                                    ${item.quality.name}

                                </strong>

                            </div>
                        `
                        : ""
                }

            </div>

        `;

    }

    renderDetails() {

        const exists = this.inventory.some(item => item.uid === this.selectedItem?.uid);

        if (!exists) {
            this.selectedItem = null;
        }
        if (!this.selectedItem) {
            return this.renderPlaceholder();
        }

        const ownedQuantity = this.selectedItem.quantity ?? 1;

        if (this.sellQuantity > ownedQuantity) {
            this.sellQuantity = ownedQuantity;
        }
        if (this.sellQuantity < 1) {
            this.sellQuantity = 1;
        }

        return `
            <div class="market-details">

                ${this.renderItemHeader()}

                ${this.renderInfo()}

                ${this.renderStats()}

                ${this.renderEffects()}

                ${this.renderSellPanel()}

            </div>
        `;
    }

    renderPlaceholder() {
        return `
            <div class="market-placeholder">
                <i class="fa-solid fa-hand-pointer"></i>
                <h3>Mercado</h3>
                <p>Selecione um item do inventário para visualizar suas informações e vendê-lo.</p>
            </div>
        `;
    }

    renderItemHeader() {

        const item = this.selectedItem;

        return `
            <div class="market-item-header">

                <img
                    src="${item.icon}"
                    alt="${item.name}"
                >

                <div class="market-item-info">

                    <h2>${item.name}</h2>

                    ${
                        item.class
                            ? `<span>${this.getClassName(item.class)}</span>`
                            : `<span>${this.getTypeName(item.type)}</span>`
                    }

                </div>

            </div>
        `;

    }

    renderEffects(){

        const item = this.selectedItem;

        let text =
            item.effect ??
            "Este item não possui efeitos especiais.";

        if(item.heal){

            text = `Recupera ${item.heal} pontos de Vida.`;

        }

        return `

            <div class="market-effects">

                <h4>Efeito</h4>

                <p>

                    ${text}

                </p>

            </div>

        `;

    }

    getTypeName(type) {
        const types = {
            weapon: "Arma",
            armor: "Armadura",
            helmet: "Elmo",
            chest: "Peitoral",
            legs: "Calças",
            boots: "Botas",
            shield: "Escudo",
            ring: "Anel",
            amulet: "Amuleto",
            item: "Item",
            material: "Material"
        };

        return types[type] ?? type;
    }

    getClassName(playerClass) {
        const classes = {
            warrior: "Guerreiro",
            archer: "Arqueiro",
            mage: "Mago"
        };
        return classes[playerClass] ?? playerClass;
    }

    getMarketItems() {
        return this.inventory.filter(item => item.sellValue > 0);
    }

    // Agrupa os itens vendíveis por raridade, com contagem e valor
    // total — a base do painel de "vender tudo de uma raridade".
    // Só considera EQUIPAMENTO (tem .slot) — poções e pedras também
    // têm raridade, mas já têm sua própria forma de vender por
    // quantidade (o controle deslizante), então misturá-las aqui
    // criaria o risco de vender poção/pedra sem querer junto com
    // equipamento duplicado.
    getBulkSellSummary(items) {

        const groups = {};

        items.forEach(item => {

            if (!item.slot) return;

            const rarityId = item.rarity?.id;

            if (!rarityId) return;

            if (!groups[rarityId]) {
                groups[rarityId] = {
                    rarity: item.rarity,
                    count: 0,
                    gold: 0
                };
            }

            const quantity = item.quantity ?? 1;

            groups[rarityId].count += quantity;
            groups[rarityId].gold += ItemValueService.getSellValue(item) * quantity;

        });

        return Object.values(groups).sort((a, b) => b.gold - a.gold);

    }

    renderBulkSellPanel(items) {

        const summary = this.getBulkSellSummary(items);

        if (!summary.length) return "";

        return `
            <div class="market-bulk-sell">

                <span class="market-bulk-sell-label">Vender tudo de uma raridade:</span>

                <div class="market-bulk-sell-options">
                    ${summary.map(group => `
                        <button
                            class="market-bulk-sell-button"
                            style="--rarity-color:${group.rarity.color}"
                            data-rarity="${group.rarity.id}">
                            ${group.rarity.name}
                            <span>${group.count}x · ${group.gold} <i class="fa-solid fa-coins"></i></span>
                        </button>
                    `).join("")}
                </div>

                ${this.confirmBulkSellRarity ? this.renderBulkSellConfirm(summary) : ""}

            </div>
        `;

    }

    renderBulkSellConfirm(summary) {

        const group = summary.find(g => g.rarity.id === this.confirmBulkSellRarity);

        if (!group) return "";

        return `
            <div class="market-bulk-sell-confirm">
                <span>Vender ${group.count} itens ${group.rarity.name} por ${group.gold} ouro?</span>
                <div class="market-bulk-sell-confirm-actions">
                    <button class="market-bulk-sell-confirm-yes">Confirmar</button>
                    <button class="market-bulk-sell-confirm-no">Cancelar</button>
                </div>
            </div>
        `;

    }

    renderStats() {

        const item = this.selectedItem;

        if (!item.stats) {

            return "";

        }

        const stats = Object.entries(item.stats)
            .filter(([,value]) => value !== 0);

        if (!stats.length) {

            return "";

        }

        return `

            <div class="market-stats">

                <h4>Atributos</h4>

                <div class="market-stat-list">

                    ${stats.map(([key,value]) =>

                        this.renderStat(key,value)

                    ).join("")}

                </div>

            </div>

        `;

    }

    renderStat(key, value){

        const cssClass =
            value > 0
                ? "positive"
                : value < 0
                    ? "negative"
                    : "neutral";

        return `

            <div class="market-stat">

                <i class="fa-solid ${this.getStatIcon(key)}"></i>

                <span class="market-stat-name">

                    ${this.getStatName(key)}

                </span>

                <strong class="market-stat-value ${cssClass}">

                    ${value > 0 ? "+" : ""}${value}

                </strong>

            </div>

        `;

    }

    getStatName(stat) {
        const stats = {
            attack: "Ataque",
            armor: "Armadura",
            agility: "Agilidade",
            intelligence: "Inteligência",
            strength: "Força",
            resistance: "Resistência",
            penetration: "Penetração",
            criticalChance: "Chance Crítica",
            lifeSteal: "Roubo de Vida",
            dodge: "Esquiva",
            accuracy: "Precisão",
            health: "Vida",
            mana: "Mana"
        };
        return stats[stat] ?? stat;
    }

    renderSellPanel(){

        const item = this.selectedItem;
        const ownedQuantity = item.quantity ?? 1;
        const isStackable = ownedQuantity > 1;

        const totalValue = ItemValueService.getSellValue(item) * this.sellQuantity;

        return `

            <div class="market-sell-panel">

                ${
                    isStackable
                        ? `
                            <div class="market-owned">
                                <span>Você possui</span>
                                <strong>${ownedQuantity}</strong>
                            </div>

                            <div class="market-quantity-control">
                                <div class="market-quantity-header">
                                    <span>Quantidade a vender</span>
                                    <span class="market-quantity-value">${this.sellQuantity}/${ownedQuantity}</span>
                                </div>
                                <input
                                    type="range"
                                    class="market-quantity-slider"
                                    min="1"
                                    max="${ownedQuantity}"
                                    value="${this.sellQuantity}"
                                >
                            </div>
                        `
                        : ""
                }

                <div class="market-price">

                    <span class="market-price-label">

                        Valor de venda

                    </span>

                    <strong class="market-price-value">

                        <i class="fa-solid fa-coins"></i>

                        ${totalValue}

                    </strong>

                </div>

                <button class="market-sell-button">

                    <i class="fa-solid fa-hand-holding-dollar"></i>

                    Vender ${isStackable ? `(${this.sellQuantity})` : "Item"}

                </button>

            </div>

        `;

    }

    registerEvents(container = document) {
        container.querySelector(".market-close")?.addEventListener("click", () => {
            this.confirmBulkSellRarity = null;
            this.game.hudScreen.changeView("city");
        });
        container.querySelectorAll(".market-item").forEach(button => {
            button.addEventListener("click", () => {
                const item = this.inventory.find(item => item.uid === button.dataset.uid);
                if (!item) return;
                this.selectedItem = item;
                this.sellQuantity = 1;
                this.game.hudScreen.refreshCurrentView();
            });
        });

        container.querySelectorAll(".market-bulk-sell-button").forEach(button => {
            button.addEventListener("click", () => {
                this.confirmBulkSellRarity = button.dataset.rarity;
                this.game.hudScreen.refreshCurrentView();
            });
        });

        container.querySelector(".market-bulk-sell-confirm-yes")?.addEventListener("click", () => {

            const rarityId = this.confirmBulkSellRarity;
            this.confirmBulkSellRarity = null;

            const result = this.player.sellItemsByRarity(rarityId);

            if (result.count === 0) {
                Toast.show("Nenhum item vendido.");
            } else {
                Toast.show(`${result.count} itens vendidos por ${result.gold} ouro.`);
            }

            this.selectedItem = null;
            this.game.hudScreen.refreshCurrentView();

        });

        container.querySelector(".market-bulk-sell-confirm-no")?.addEventListener("click", () => {
            this.confirmBulkSellRarity = null;
            this.game.hudScreen.refreshCurrentView();
        });

        container.querySelector(".market-quantity-slider")?.addEventListener("input", (event) => {

            this.sellQuantity = Number(event.target.value);

            const item = this.selectedItem;
            if (!item) return;

            const valueLabel = container.querySelector(".market-quantity-value");
            const priceValue = container.querySelector(".market-price-value");
            const sellButton = container.querySelector(".market-sell-button");

            if (valueLabel) valueLabel.textContent = `${this.sellQuantity}/${item.quantity ?? 1}`;
            if (priceValue) priceValue.innerHTML = `<i class="fa-solid fa-coins"></i> ${ItemValueService.getSellValue(item) * this.sellQuantity}`;
            if (sellButton) sellButton.innerHTML = `<i class="fa-solid fa-hand-holding-dollar"></i> Vender (${this.sellQuantity})`;

        });

        container.querySelector(".market-sell-button")?.addEventListener("click", () => {
            this.sellSelectedItem();
        });

        // Enter também confirma a venda do item selecionado (só nesta tela).
        if (!this.keydownBound) {

            document.addEventListener("keydown", (event) => {

                if (event.key !== "Enter") return;

                if (!document.querySelector(".market-window")) return;

                this.sellSelectedItem();

            });

            this.keydownBound = true;

        }
    }

    sellSelectedItem() {

        if (!this.selectedItem) {

            Toast.show("Selecione um item.");

            return;

        }

        const quantity = this.sellQuantity;
        const item = this.selectedItem;

        const actualQuantity = Math.min(quantity, item.quantity ?? 1);
        const total = ItemValueService.getSellValue(item) * actualQuantity;

        const sold = this.player.sellItem(item, quantity);

        if (!sold) {

            Toast.show("Não foi possível vender o item.");

            return;

        }

        Toast.show(
            actualQuantity > 1
                ? `${actualQuantity}x ${item.name} vendido(s) por ${total} ouro.`
                : `${item.name} vendido por ${total} ouro.`
        );

        this.selectedItem = null;
        this.sellQuantity = 1;

        this.game.hudScreen.refreshCurrentView();

    }
}