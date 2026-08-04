import Toast from "../ui/components/Toast.js";
import ItemTooltip from "../views/ItemTooltip.js";

export default class CharacterView {
    constructor(game) {
        this.game = game;
        this.leftTab = "status";
        this.rightTab = "weapon";
        this.selectedSlot = null;
        this.selectedItem = null;
        this.selectedEquipment = null;
    }

    getFilteredInventory() {
        return this.game.player.inventory.filter(item => {
            switch (this.rightTab) {
                case "weapon": return item.slot === "weapon";
                case "helmet": return item.slot === "helmet";
                case "chest": return item.slot === "chest";
                case "leg": return item.slot === "leg";
                case "boot": return item.slot === "boot";
                case "item": return item.type === "item";
                default:
                    // console.warn(`Aba desconhecida: ${this.rightTab}`);
                    return false;
            }
        });
    }

    renderStatus() {

        const player = this.game.player;
        const stats = player.stats.getFinalStats();

        const requiredXP = player.getRequiredXP();

        const hpPercent = Math.min(
            (player.currentHP / player.maxHP) * 100,
            100
        );

        const xpPercent = requiredXP > 0
            ? Math.min(
                (player.currentXP / requiredXP) * 100,
                100
            )
            : 100;

        return `
            <div class="character-status">

                <img
                    class="character-avatar"
                    src="${player.class.hud}"
                    alt="${player.class.name}">

                <h2 class="character-name">${player.class.name}</h2>

                <div class="box-info">

                    <span class="character-level">
                        Nível: ${player.level}
                    </span>

                    <span class="character-gold">
                        Ouro: ${player.gold}
                    </span>

                </div>

                <div class="character-bars">

                    <div class="character-bar">

                        <span class="character-label">HP</span>

                        <div
                            class="character-fill hp"
                            style="width:${hpPercent}%;">
                        </div>

                        <span class="character-text">
                            ${player.currentHP} / ${player.maxHP}
                        </span>

                    </div>

                    <div class="character-bar">

                        <span class="character-label">XP</span>

                        <div
                            class="character-fill xp"
                            style="width:${xpPercent}%;">
                        </div>

                        <span class="character-text">
                            ${player.currentXP} / ${requiredXP}
                        </span>

                    </div>

                </div>

                <div class="character-stats">

                    <div class="character-stat">
                        <span>Ataque</span>
                        <span>${stats.attack}</span>
                    </div>

                    <div class="character-stat">
                        <span>Armadura</span>
                        <span>${stats.armor}</span>
                    </div>

                    <div class="character-stat">
                        <span>Agilidade</span>
                        <span>${stats.agility}</span>
                    </div>

                    <div class="character-divider"><hr></div>

                    <div class="character-stat">
                        <span>Chance Crítica</span>
                        <span>${stats.criticalChance}%</span>
                    </div>

                    <div class="character-stat">
                        <span>Roubo de Vida</span>
                        <span>${stats.lifeSteal}%</span>
                    </div>

                    <div class="character-stat">
                        <span>Penetração</span>
                        <span>${stats.penetration}%</span>
                    </div>

                </div>

            </div>
        `;

    }

    renderEquipped() {
        const equipment = this.game.player.equipment;
        return `
            <div class="character-equipped">
                ${this.renderEquipmentSlot("weapon", "Arma", equipment.weapon)}
                ${this.renderEquipmentSlot("helmet", "Cabeça", equipment.helmet)}
                ${this.renderEquipmentSlot("chest", "Peitoral", equipment.chest)}
                ${this.renderEquipmentSlot("leg", "Calças", equipment.leg)}
                ${this.renderEquipmentSlot("boot", "Botas", equipment.boot)}
            </div>
        `;
    }

    renderEquipmentSlot(slot, title, item) {
        return `
            <div class="equipment-slot ${item ? "filled" : ""}" data-slot="${slot}">
                <div class="equipment-header">
                    <div class="equipment-image">
                        ${item ? `<img src="${item.icon}" alt="${item.name}">` : ""}
                    </div>
                    <div class="equipment-info">
                        <span class="equipment-name">${title}</span>
                        <span class="equipment-item">${item ? item.name : "Nenhum"}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderLeftTabs() {
        return `
            <div class="character-tabs">
                <button class="character-tab ${this.leftTab === "status" ? "active" : ""}" data-tab="status">Status</button>
                <button class="character-tab ${this.leftTab === "equipped" ? "active" : ""}" data-tab="equipped">Equipados</button>
            </div>
        `;
    }

    renderLeftContent() {
        switch (this.leftTab) {
            case "status": return this.renderStatus();
            case "equipped": return this.renderEquipped();
            default: return "";
        }
    }

    renderRightTabs() {
        return `
            <div class="inventory-tabs">
                <button class="inventory-tab ${this.rightTab === "weapon" ? "active" : ""}" data-tab="weapon">Armas</button>
                <button class="inventory-tab ${this.rightTab === "helmet" ? "active" : ""}" data-tab="helmet">Cabeça</button>
                <button class="inventory-tab ${this.rightTab === "chest" ? "active" : ""}" data-tab="chest">Peitoral</button>
                <button class="inventory-tab ${this.rightTab === "leg" ? "active" : ""}" data-tab="leg">Calças</button>
                <button class="inventory-tab ${this.rightTab === "boot" ? "active" : ""}" data-tab="boot">Botas</button>
                <button class="inventory-tab ${this.rightTab === "item" ? "active" : ""}" data-tab="item">Itens</button>
            </div>
        `;
    }

    renderInventoryGrid() {
        const inventory = this.getFilteredInventory();
        let html = "";
        inventory.forEach((item, index) => {
            html += `
                <div class="inventory-slot has-item">

                    <img
                        class="inventory-icon"
                        src="${item.icon}"
                        alt="${item.name}"
                    >

                    ${
                        item.quantity > 1
                            ? `<span class="inventory-quantity">${item.quantity}</span>`
                            : ""
                    }

                </div>
            `;
        });
        if (inventory.length === 0) {
            return `<div class="inventory-empty">Nenhum item nesta categoria.</div>`;
        }
        return `<div class="inventory-grid">${html}</div>`;
    }

    registerEquipmentEvents(container) {

        const slots = container.querySelectorAll(".equipment-slot.filled");

        slots.forEach(slot => {

            const slotName = slot.dataset.slot;
            const item = this.game.player.equipment[slotName];

            if (!item) return;

            slot.addEventListener("click", () => {

                container.querySelectorAll(".equipment-slot").forEach(s => s.classList.remove("selected"));

                slot.classList.add("selected");

                this.selectedEquipment = {
                    slot: slotName,
                    item
                };

                this.selectedItem = null;

                container.querySelectorAll(".inventory-slot").forEach(s => s.classList.remove("selected"));

                const actionButton = container.querySelector(".action-button");
                const unequipButton = container.querySelector(".unequip-button");

                if (actionButton) {

                    actionButton.disabled = true;
                    actionButton.textContent = "Equipar";

                }

                if (unequipButton) {
                    unequipButton.disabled = false;
                }

            });

            // Tooltip
            slot.addEventListener("mouseenter", (event) => {

                this.showTooltip(
                    item,
                    event.clientX,
                    event.clientY
                );

            });

            slot.addEventListener("mousemove", (event) => {

                if (!document.getElementById("item-tooltip")) return;

                this.updateTooltipPosition(
                    event.clientX,
                    event.clientY
                );

            });

            slot.addEventListener("mouseleave", () => {

                this.hideTooltip();

            });

        });

    }

    equipSelectedItem() {

        if (!this.selectedItem) return;

        // Consumível
        if (this.selectedItem.heal) {

            this.game.player.health.heal(this.selectedItem.heal);
            this.game.player.removeItem(this.selectedItem);

            Toast.show(
                `${this.selectedItem.name} utilizada! (+${this.selectedItem.heal} HP)`
            );

            this.selectedItem = null;

            this.refresh();

            return;
        }

        // Equipamento
        this.game.player.equipItem(this.selectedItem);

        Toast.show(`${this.selectedItem.name} equipado`);

        this.selectedItem = null;

        this.refresh();

    }

    useSelectedItem() {

        if (!this.selectedItem) return;

        // Cura o jogador
        this.game.player.health.heal(this.selectedItem.heal);

        // Consome uma poção
        this.game.player.removeItem(this.selectedItem);

        Toast.show(
            `${this.selectedItem.name} utilizada! (+${this.selectedItem.heal} HP)`
        );

        this.selectedItem = null;

        this.refresh();

    }

    unequipSelectedItem() {
        if (!this.selectedEquipment) return;
        this.game.player.unequipItem(this.selectedEquipment.slot);
        Toast.show(`${this.selectedEquipment.item.name} desequipado`);
        this.selectedEquipment = null;
        this.refresh();
    }

    renderInventoryActions() {

        return `
            <div class="buttons-container">
                <button class="inventory-button equip-button" disabled>
                Equipar
            </button>
                <button class="inventory-button unequip-button" disabled>
                    Desequipar
                </button>
            </div>
        `;

    }

    render() {
        return `
            <section class="character-window">
                <header class="character-header">
                    <h2>Personagem</h2>
                    <button class="character-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <div class="character-body">
                    <section class="character-left">
                        ${this.renderLeftTabs()}
                        <div class="character-tab-content">
                            ${this.renderLeftContent()}
                        </div>
                    </section>
                    <section class="character-right">
                        ${this.renderRightTabs()}
                        ${this.renderInventoryGrid()}
                        ${this.renderInventoryActions()}
                    </section>
                </div>
            </section>
        `;
    }

    registerTooltipEvents(element, item) {

        element.addEventListener("mouseenter", (event) => {

            this.showTooltip(item, event.clientX, event.clientY);

        });

        element.addEventListener("mousemove", (event) => {

            if (!document.getElementById("item-tooltip")) return;

            this.updateTooltipPosition(
                event.clientX,
                event.clientY
            );

        });

        element.addEventListener("mouseleave", () => {

            this.hideTooltip();

        });

    }

    registerEvents(container = document) {
        const tabs = container.querySelectorAll(".character-tab");
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                this.leftTab = tab.dataset.tab;
                this.refresh();
            });
        });
        this.registerInventoryEvents(container);
        const inventoryTabs = container.querySelectorAll(".inventory-tab");
        inventoryTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                this.rightTab = tab.dataset.tab;
                this.refresh();
            });
        });
        this.registerEquipmentEvents(container);
        const equipButton = container.querySelector(".equip-button");
        if (equipButton) {
            equipButton.addEventListener("click", () => {
                if (equipButton.disabled) return;
                this.equipSelectedItem();
            });
        }
        const unequipButton = container.querySelector(".unequip-button");
        if (unequipButton) {
            unequipButton.addEventListener("click", () => {
                if (unequipButton.disabled) return;
                this.unequipSelectedItem();
            });
        }

        const closeButton = container.querySelector(".character-close");

        if (closeButton) {

            closeButton.addEventListener("click", async () => {

                await this.close();

            });

        }
    }

    registerInventoryEvents(container) {
        const slots = container.querySelectorAll(".inventory-slot");
        const inventory = this.getFilteredInventory();
        slots.forEach((slot, index) => {
            slot.addEventListener("click", () => {
                slots.forEach(s => s.classList.remove("selected"));
                slot.classList.add("selected");
                this.selectedItem = inventory[index];
                this.selectedEquipment = null;
                const equipButton = container.querySelector(".equip-button");

                if (equipButton) {

                    equipButton.disabled = false;

                    if (this.selectedItem.heal) {
                        equipButton.textContent = "Usar";
                    } else {
                        equipButton.textContent = "Equipar";
                    }

                }
            });
            slot.addEventListener("mousemove", (event) => {
                if (!document.getElementById("item-tooltip")) return;
                this.updateTooltipPosition(event.clientX, event.clientY);
            });
            slot.addEventListener("mouseenter", (event) => {
                const inventory = this.getFilteredInventory();
                const item = inventory[index];
                if (!item) return;
                this.showTooltip(item, event.clientX, event.clientY);
            });
            slot.addEventListener("mouseleave", () => {
                this.hideTooltip();
            });
        });
    }

    updateTooltipPosition(x, y) {
        const tooltip = document.getElementById("item-tooltip");
        if (!tooltip) return;
        const margin = 20;
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        let left;
        let top = y + margin;
        if (x + margin + tooltipWidth <= window.innerWidth) {
            left = x + margin;
        } else {
            left = x - tooltipWidth - margin;
        }
        if (left < margin) {
            left = margin;
        }
        if (top + tooltipHeight > window.innerHeight) {
            top = window.innerHeight - tooltipHeight - margin;
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

    refresh() {
        const window = document.querySelector(".character-window");
        if (!window) return;
        window.outerHTML = this.render();
        this.registerEvents(document);
    }

    async close() {

        if (this.game.hudScreen.preparationMode) {

            this.game.hudScreen.exitPreparationMode();

            this.game.hudScreen.currentView = "dungeon";

            this.game.hudScreen.refreshCurrentView();

            this.game.hudScreen.updateMusic();

            if (this.game.hudScreen.onPreparationFinished) {

                const resolve =
                    this.game.hudScreen.onPreparationFinished;

                this.game.hudScreen.onPreparationFinished = null;

                resolve();

            }

            return;

        }

        this.game.hudScreen.currentView = "";

        this.game.hudScreen.render();

        this.game.hudScreen.registerEvents();

        this.game.hudScreen.updateMusic();

    }
}