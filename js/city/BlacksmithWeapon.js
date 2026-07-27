import Toast from "../ui/components/Toast.js";
import ItemTooltip from "../../js/views/ItemTooltip.js";
import UpgradeService from "../services/UpgradeService.js";

export default class BlacksmithWeapon {
    constructor(game) {
        this.game = game;
        this.selectedWeapon = null;
        this.anvilWeapon = null;
        this.weapons = [];
    }

    get player() {
        return this.game.player;
    }

    getWeapons() {
        const weapons = [];
        this.player.inventory.forEach(item => {
            if (item.type !== "weapon") return;
            if (item.quality?.id === "exceptional") return;
            weapons.push(item);
        });
        const equippedWeapon = this.player.equipment.weapon;
        if (equippedWeapon && equippedWeapon.quality?.id !== "exceptional") {
            const alreadyExists = weapons.some(weapon => weapon.uid === equippedWeapon.uid);
            if (!alreadyExists) {
                weapons.unshift(equippedWeapon);
            }
        }
        this.weapons = weapons;
        return weapons;
    }

    getCurrentQualityName(weapon) {
        return UpgradeService.getCurrentQuality(weapon).name;
    }

    getNextQualityName(weapon) {
        const next = UpgradeService.getNextQuality(weapon);
        return next ? next.name : "Máximo";
    }

    render() {
        this.getWeapons();
        return `
            <section class="blacksmith-window">
                <header class="market-header">
                    <div>
                        <h2>Ferreiro - Armas</h2>
                    </div>
                    <button class="market-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <div class="blacksmith-body">
                    <aside class="blacksmith-left">
                        ${this.renderWeapons()}
                    </aside>
                    <section class="blacksmith-right">
                        ${this.renderAnvil()}
                    </section>
                </div>
                ${this.renderActions()}
            </section>
        `;
    }

    renderWeapons() {
        if (!this.weapons.length) {
            return `
                <div class="blacksmith-empty">
                    <i class="fa-solid fa-sword"></i>
                    <span>Nenhuma arma disponível para melhoria.</span>
                </div>
            `;
        }
        return `
            <div class="blacksmith-weapon-grid">
                ${this.weapons
                    .filter(weapon => {
                        if (!this.anvilWeapon) return true;
                        return weapon.uid !== this.anvilWeapon.uid;
                    })
                    .map(weapon => this.renderWeapon(weapon))
                    .join("")}
            </div>
        `;
    }

    renderWeapon(weapon) {
        const selected = this.selectedWeapon?.uid === weapon.uid ? "selected" : "";
        return `
            <div class="blacksmith-slot ${selected}" data-id="${weapon.uid}">
                <img src="${weapon.icon}" alt="${weapon.name}" class="blacksmith-slot-icon">
            </div>
        `;
    }

    renderAnvil() {
        return `
            <div class="blacksmith-anvil">
                <h3 class="blacksmith-title">Melhore a Qualidade da sua Arma</h3>
                <p class="blacksmith-subtitle">
                    ${this.anvilWeapon ? "Arma pronta para melhoria." : "Selecione uma arma do inventário."}
                </p>
                <div class="blacksmith-anvil-slot">
                    ${this.anvilWeapon
                        ? `
                            <img src="${this.anvilWeapon.icon}" class="blacksmith-anvil-image">
                            <h3>${this.anvilWeapon.name}</h3>
                            <button class="blacksmith-remove-button">Remover</button>
                        `
                        : `
                        `
                    }
                </div>
                ${this.renderUpgradeInfo()}
            </div>
        `;
    }

    renderUpgradeInfo() {
        if (!this.anvilWeapon) {
            return `
                <div class="blacksmith-upgrade-info">
                    <span>Selecione uma arma para visualizar a melhoria.</span>
                </div>
            `;
        }
        return `
            <div class="blacksmith-upgrade-info">
                <div class="blacksmith-info-line">
                    <span>Qualidade Atual</span>
                    <strong>${this.getCurrentQualityName(this.anvilWeapon)}</strong>
                </div>
                <div class="blacksmith-arrow">
                    <i class="fa-solid fa-arrow-down"></i>
                </div>
                <div class="blacksmith-info-line">
                    <span>Próxima Qualidade</span>
                    <strong>${this.getNextQualityName(this.anvilWeapon)}</strong>
                </div>
                <hr>
                <div class="blacksmith-preview">
                    ${this.renderStatPreview()}
                </div>
            </div>
        `;
    }

    refresh() {
        this.hideTooltip();
        const panel = document.querySelector(".blacksmith-window");
        if (!panel) return;
        panel.outerHTML = this.render();
        this.registerEvents();
    }

    selectWeapon() {
        if (!this.selectedWeapon) {
            Toast.show("Selecione uma arma.");
            return;
        }
        this.anvilWeapon = this.selectedWeapon;
        this.hideTooltip();
        this.selectedWeapon = null;
        this.refresh();
    }

    registerWeaponEvents(container) {
        const slots = container.querySelectorAll(".blacksmith-slot");
        slots.forEach(slot => {
            const weapon = this.weapons.find(item => item.uid === slot.dataset.id);
            if (!weapon) return;
            slot.addEventListener("click", () => {

                this.anvilWeapon = weapon;

                this.refresh();

            });
            slot.addEventListener("mouseenter", (event) => {

                this.showTooltip(
                    weapon,
                    event.clientX,
                    event.clientY
                );

            });

            slot.addEventListener("mousemove", (event) => {

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

    renderActions() {

        const cost = this.getUpgradeCost();

        const canUpgrade = this.canUpgrade();

        return `

            <footer class="blacksmith-footer">

                <div class="blacksmith-footer-info">

                    <div class="blacksmith-footer-section">

                        <i class="fa-solid fa-coins"></i>

                        <div class="blacksmith-footer-text">

                            <span class="label">
                                OURO
                            </span>

                            <span class="value">
                                ${this.player.gold.toLocaleString("pt-BR")}
                            </span>

                        </div>

                    </div>

                    <div class="blacksmith-footer-divider"></div>

                    <div class="blacksmith-footer-section">

                        <i class="fa-solid fa-hammer"></i>

                        <div class="blacksmith-footer-text">

                            <span class="label">
                                CUSTO DA MELHORIA
                            </span>

                            <span class="value">
                                ${cost.toLocaleString("pt-BR")}
                            </span>

                        </div>

                    </div>

                </div>

                <button
                    class="blacksmith-upgrade-button"
                    ${canUpgrade ? "" : "disabled"}>

                    <i class="fa-solid fa-hammer"></i>

                    Melhorar

                </button>

            </footer>

        `;

    }

    renderStatPreview() {

        if (!this.anvilWeapon?.baseStats) return "";

        const next = UpgradeService.getNextQuality(this.anvilWeapon);
        const nextBonus = next ? UpgradeService.getStatBonusFor(this.anvilWeapon, next) : 0;

        return Object.entries(this.anvilWeapon.baseStats)
            .filter(([, baseValue]) => baseValue !== 0)
            .map(([key, baseValue]) => {

                const currentValue = this.anvilWeapon.stats[key];
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

    getUpgradeCost() {
        const weapon = this.anvilWeapon ?? this.selectedWeapon;
        if (!weapon) return 0;
        return UpgradeService.getUpgradeCost(weapon, "weapon");
    }

    upgradeWeapon() {

        if (!this.anvilWeapon) {
            Toast.show("Selecione uma arma.");
            return;
        }

        if (!UpgradeService.canUpgrade(this.anvilWeapon)) {
            Toast.show("Esta arma já está no nível máximo de qualidade.");
            return;
        }

        const cost = this.getUpgradeCost();

        if (this.player.gold < cost) {
            Toast.show("Ouro insuficiente.");
            return;
        }

        const upgraded = UpgradeService.upgrade(this.anvilWeapon, "weapon", this.player);

        if (!upgraded) {
            Toast.show("Não foi possível melhorar a arma.");
            return;
        }

        Toast.show(`${this.anvilWeapon.name} melhorado para ${this.anvilWeapon.quality.name}!`);

        this.refresh();

    }

    removeWeapon() {
        if (!this.anvilWeapon) return;
        this.selectedWeapon = this.anvilWeapon;
        this.anvilWeapon = null;
        this.hideTooltip();
        this.refresh();
    }

    canUpgrade() {
        if (!this.anvilWeapon) return false;
        if (!UpgradeService.canUpgrade(this.anvilWeapon)) return false;
        return this.player.gold >= this.getUpgradeCost();
    }

    registerEvents(container = document) {
        container.querySelector(".market-close")?.addEventListener("click", () => {
            this.game.hudScreen.changeView("city");
        });
        container.querySelector(".blacksmith-select-button")?.addEventListener("click", () => {
            this.selectWeapon();
        });
        container.querySelector(".blacksmith-upgrade-button")?.addEventListener("click", () => {
            this.upgradeWeapon();
        });
        container.querySelector(".blacksmith-remove-button")?.addEventListener("click", () => {
            this.removeWeapon();
        });
        this.registerWeaponEvents(container);
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