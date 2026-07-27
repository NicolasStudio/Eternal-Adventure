import Toast from "../ui/components/Toast.js";

export default class MarketView {
    constructor(game) {
        this.game = game;
        this.selectedItem = null;
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
                <div class="market-item-list">
                    ${items.map(item => this.renderItem(item)).join("")}
                </div>
            </div>
        `;
    }

    renderItem(item) {
        const selected = this.selectedItem?.uid === item.uid;
        return `
            <button class="market-item ${selected ? "selected" : ""}" data-uid="${item.uid}">
                <img src="${item.icon}" alt="${item.name}" class="market-item-icon">
                <div class="market-item-content">
                    <span class="market-item-name">${item.name}</span>
                    <span class="market-item-rarity" style="color:${item.rarity.color};">${item.rarity.name}</span>
                </div>
                <div class="market-item-price">
                    ${item.sellValue}
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

                    <strong style="color:${item.rarity.color}">

                        ${item.rarity.name}

                    </strong>

                </div>

                <div class="market-info-row">

                    <span>Qualidade</span>

                    <strong>

                        ${item.quality?.name ?? "Nenhuma"}

                    </strong>

                </div>

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

        return `

            <div class="market-sell-panel">

                <div class="market-price">

                    <span class="market-price-label">

                        Valor de venda

                    </span>

                    <strong class="market-price-value">

                        <i class="fa-solid fa-coins"></i>

                        ${item.sellValue}

                    </strong>

                </div>

                <button class="market-sell-button">

                    <i class="fa-solid fa-hand-holding-dollar"></i>

                    Vender Item

                </button>

            </div>

        `;

    }

    registerEvents(container = document) {
        container.querySelector(".market-close")?.addEventListener("click", () => {
            this.game.hudScreen.changeView("city");
        });
        container.querySelectorAll(".market-item").forEach(button => {
            button.addEventListener("click", () => {
                const item = this.inventory.find(item => item.uid === button.dataset.uid);
                if (!item) return;
                this.selectedItem = item;
                this.game.hudScreen.refreshCurrentView();
            });
        });
        container.querySelector(".market-sell-button")?.addEventListener("click", () => {

            if (!this.selectedItem) {

                Toast.show("Selecione um item.");

                return;

            }

            const sold = this.player.sellItem(this.selectedItem);

            if (!sold) {

                Toast.show("Não foi possível vender o item.");

                return;

            }

            Toast.show(
                `${this.selectedItem.name} vendido por ${this.selectedItem.sellValue} ouro.`
            );

            this.selectedItem = null;

            this.game.hudScreen.refreshCurrentView();

        });
    }
}