import Toast from "../ui/components/Toast.js";
import ItemTooltip from "../../js/views/ItemTooltip.js";
import UpgradeService from "../services/UpgradeService.js";

const ARMOR_SLOTS = [
    { id: "helmet", label: "Elmo", icon: "fa-solid fa-hat-wizard" },
    { id: "chest", label: "Peitoral", icon: "fa-solid fa-shirt" },
    { id: "legs", label: "Pernas", icon: "fa-solid fa-socks" },
    { id: "boots", label: "Botas", icon: "fa-solid fa-boot" }
];

export default class BlacksmithArmor {

    constructor(game) {
        this.game = game;
        this.activeSlot = "helmet";
        this.selectedItem = null;
        this.anvilItem = null;
        this.items = [];
    }

    get player() {
        return this.game.player;
    }

    getItems() {
        const items = [];

        this.player.inventory.forEach(item => {
            if (item.slot !== this.activeSlot) return;
            if (item.quality?.id === "exceptional") return;
            items.push(item);
        });

        const equippedItem = this.player.equipment[this.activeSlot];

        if (equippedItem && equippedItem.quality?.id !== "exceptional") {
            const alreadyExists = items.some(i => i.uid === equippedItem.uid);
            if (!alreadyExists) {
                items.unshift(equippedItem);
            }
        }

        this.items = items;
        return items;
    }

    getCurrentQualityName(item) {
        return UpgradeService.getCurrentQuality(item).name;
    }

    getNextQualityName(item) {
        const next = UpgradeService.getNextQuality(item);
        return next ? next.name : "Máximo";
    }

    render() {
        this.getItems();
        return `
            <section class="blacksmith-window">
                <header class="market-header">
                    <div>
                        <h2>Ferreiro - Equipamentos</h2>
                    </div>
                    <button class="market-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                ${this.renderSlotTabs()}
                <div class="blacksmith-body">
                    <aside class="blacksmith-left">
                        ${this.renderItems()}
                    </aside>
                    <section class="blacksmith-right">
                        ${this.renderAnvil()}
                    </section>
                </div>
                ${this.renderActions()}
            </section>
        `;
    }

    renderSlotTabs() {
        return `
            <div class="blacksmith-slot-tabs">
                ${ARMOR_SLOTS.map(slot => `
                    <button
                        class="blacksmith-slot-tab ${this.activeSlot === slot.id ? "active" : ""}"
                        data-slot="${slot.id}">
                        <i class="${slot.icon}"></i>
                        ${slot.label}
                    </button>
                `).join("")}
            </div>
        `;
    }

    renderItems() {
        if (!this.items.length) {
            return `
                <div class="blacksmith-empty">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>Nenhum equipamento disponível para melhoria.</span>
                </div>
            `;
        }
        return `
            <div class="blacksmith-weapon-grid">
                ${this.items
                    .filter(item => {
                        if (!this.anvilItem) return true;
                        return item.uid !== this.anvilItem.uid;
                    })
                    .map(item => this.renderItemSlot(item))
                    .join("")}
            </div>
        `;
    }

    renderItemSlot(item) {
        const selected = this.selectedItem?.uid === item.uid ? "selected" : "";
        return `
            <div class="blacksmith-slot ${selected}" data-id="${item.uid}">
                <img src="${item.icon}" alt="${item.name}" class="blacksmith-slot-icon">
            </div>
        `;
    }

    renderAnvil() {
        return `
            <div class="blacksmith-anvil">
                <h3 class="blacksmith-title">Melhore a Qualidade do seu Equipamento</h3>
                <p class="blacksmith-subtitle">
                    ${this.anvilItem ? "Equipamento pronto para melhoria." : "Selecione um equipamento do inventário."}
                </p>
                <div class="blacksmith-anvil-slot">
                    ${this.anvilItem
                        ? `
                            <img src="${this.anvilItem.icon}" class="blacksmith-anvil-image">
                            <h3>${this.anvilItem.name}</h3>
                            <button class="blacksmith-remove-button">Remover</button>
                        `
                        : ``
                    }
                </div>
                ${this.renderUpgradeInfo()}
            </div>
        `;
    }

    renderUpgradeInfo() {
        if (!this.anvilItem) {
            return `
                <div class="blacksmith-upgrade-info">
                    <span>Selecione um equipamento para visualizar a melhoria.</span>
                </div>
            `;
        }
        return `
            <div class="blacksmith-upgrade-info">
                <div class="blacksmith-info-line">
                    <span>Qualidade Atual</span>
                    <strong>${this.getCurrentQualityName(this.anvilItem)}</strong>
                </div>
                <div class="blacksmith-arrow">
                    <i class="fa-solid fa-arrow-down"></i>
                </div>
                <div class="blacksmith-info-line">
                    <span>Próxima Qualidade</span>
                    <strong>${this.getNextQualityName(this.anvilItem)}</strong>
                </div>
                <hr>
                <div class="blacksmith-preview">
                    ${this.renderStatPreview()}
                </div>
            </div>
        `;
    }

    renderStatPreview() {

        if (!this.anvilItem?.baseStats) return "";

        const next = UpgradeService.getNextQuality(this.anvilItem);
        const nextBonus = next ? UpgradeService.getStatBonusFor(this.anvilItem, next) : 0;

        return Object.entries(this.anvilItem.baseStats)
            .filter(([, baseValue]) => baseValue !== 0)
            .map(([key, baseValue]) => {

                const currentValue = this.anvilItem.stats[key];
                const nextValue = next ? baseValue + nextBonus : currentValue;

                return `
                    <div class="blacksmith-stat">
                        <span>${this.getStatIcon(key)} ${this.getStatName(key)}</span>
                        <strong>${currentValue}${next ? ` → ${nextValue}` : ""}</strong>
                    </div>
                `;

            })
            .join("");

    }

    getStatName(stat) {
        switch (stat) {
            case "attack": return "Ataque";
            case "armor": return "Armadura";
            case "agility": return "Agilidade";
            case "criticalChance": return "Chance Crítica";
            case "lifeSteal": return "Roubo de Vida";
            case "penetration": return "Penetração";
            default: return stat;
        }
    }

    getStatIcon(stat) {
        switch (stat) {
            case "attack": return "⚔️";
            case "armor": return "🛡️";
            case "agility": return "👢";
            case "criticalChance": return "🎯";
            case "lifeSteal": return "🩸";
            case "penetration": return "💥";
            default: return "•";
        }
    }

    renderActions() {

        const cost = this.getUpgradeCost();
        const canUpgrade = this.canUpgrade();

        return `
            <footer class="blacksmith-footer">
                <div class="blacksmith-footer-info">
                    <div class="blacksmith-footer-section">
                        <i class="fa-solid fa-coins"></i>
                        <div class="blacksmith-footer-text">
                            <span class="label">OURO</span>
                            <span class="value">${this.player.gold.toLocaleString("pt-BR")}</span>
                        </div>
                    </div>
                    <div class="blacksmith-footer-divider"></div>
                    <div class="blacksmith-footer-section">
                        <i class="fa-solid fa-hammer"></i>
                        <div class="blacksmith-footer-text">
                            <span class="label">CUSTO DA MELHORIA</span>
                            <span class="value">${cost.toLocaleString("pt-BR")}</span>
                        </div>
                    </div>
                </div>
                <button class="blacksmith-upgrade-button" ${canUpgrade ? "" : "disabled"}>
                    <i class="fa-solid fa-hammer"></i>
                    Melhorar
                </button>
            </footer>
        `;
    }

    getUpgradeCost() {
        const item = this.anvilItem ?? this.selectedItem;
        if (!item) return 0;
        return UpgradeService.getUpgradeCost(item, "armor");
    }

    canUpgrade() {
        if (!this.anvilItem) return false;
        if (!UpgradeService.canUpgrade(this.anvilItem)) return false;
        return this.player.gold >= this.getUpgradeCost();
    }

    upgradeItem() {

        if (!this.anvilItem) {
            Toast.show("Selecione um equipamento.");
            return;
        }

        if (!UpgradeService.canUpgrade(this.anvilItem)) {
            Toast.show("Este equipamento já está no nível máximo de qualidade.");
            return;
        }

        const cost = this.getUpgradeCost();

        if (this.player.gold < cost) {
            Toast.show("Ouro insuficiente.");
            return;
        }

        const upgraded = UpgradeService.upgrade(this.anvilItem, "armor", this.player);

        if (!upgraded) {
            Toast.show("Não foi possível melhorar o equipamento.");
            return;
        }

        Toast.show(`${this.anvilItem.name} melhorado para ${this.anvilItem.quality.name}!`);

        this.refresh();

    }

    removeItem() {
        if (!this.anvilItem) return;
        this.selectedItem = this.anvilItem;
        this.anvilItem = null;
        this.hideTooltip();
        this.refresh();
    }

    refresh() {
        this.hideTooltip();
        const panel = document.querySelector(".blacksmith-window");
        if (!panel) return;
        panel.outerHTML = this.render();
        this.registerEvents();
    }

    registerEvents(container = document) {

        container.querySelector(".market-close")?.addEventListener("click", () => {
            this.game.hudScreen.changeView("city");
        });

        container.querySelectorAll(".blacksmith-slot-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                this.activeSlot = tab.dataset.slot;
                this.selectedItem = null;
                this.anvilItem = null;
                this.refresh();
            });
        });

        container.querySelector(".blacksmith-upgrade-button")?.addEventListener("click", () => {
            this.upgradeItem();
        });

        container.querySelector(".blacksmith-remove-button")?.addEventListener("click", () => {
            this.removeItem();
        });

        this.registerItemEvents(container);
    }

    registerItemEvents(container) {
        const slots = container.querySelectorAll(".blacksmith-slot");
        slots.forEach(slot => {
            const item = this.items.find(i => i.uid === slot.dataset.id);
            if (!item) return;

            slot.addEventListener("click", () => {
                this.anvilItem = item;
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
