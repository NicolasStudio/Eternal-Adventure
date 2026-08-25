import Toast from "../ui/components/Toast.js";
import ItemTooltip from "../../js/views/ItemTooltip.js";
import SaveService from "../services/SaveService.js";

export default class BlacksmithEnchant {
    constructor(game) {
        this.game = game;
        this.anvilWeapon = null;
        this.anvilStone = null;
        this.weapons = [];
        this.stones = [];
    }

    get player() {
        return this.game.player;
    }

    getWeapons() {
        const weapons = [];
        this.player.inventory.forEach(item => {
            if (item.type !== "weapon") return;
            weapons.push(item);
        });
        const equippedWeapon = this.player.equipment.weapon;
        if (equippedWeapon) {
            const alreadyExists = weapons.some(weapon => weapon.uid === equippedWeapon.uid);
            if (!alreadyExists) {
                weapons.unshift(equippedWeapon);
            }
        }
        this.weapons = weapons;
        return weapons;
    }

    getStones() {
        this.stones = this.player.inventory.filter(item => item.id?.match(/^(tc-de-rubi|marco-de-safira|olbap-imperial|essencia-de-turmalina|quartzo-rosa)-\d$/));
        return this.stones;
    }

    render() {
        this.getWeapons();
        this.getStones();
        return `
            <section class="blacksmith-window">
                <header class="market-header">
                    <div>
                        <h2>Ferreiro - Encantar</h2>
                    </div>
                    <button class="market-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <div class="blacksmith-body enchant-layout">
                    <aside class="blacksmith-left">
                        ${this.renderWeaponList()}
                    </aside>
                    <section class="enchant-middle">
                        ${this.renderMiddle()}
                    </section>
                    <aside class="blacksmith-right">
                        ${this.renderStoneList()}
                    </aside>
                </div>
                ${this.renderFooter()}
            </section>
        `;
    }

    renderWeaponList() {
        const visible = this.weapons.filter(w => !this.anvilWeapon || w.uid !== this.anvilWeapon.uid);
        if (!visible.length) {
            return `
                <div class="blacksmith-empty">
                    <i class="fa-solid fa-sword"></i>
                    <span>Nenhuma arma disponível.</span>
                </div>
            `;
        }
        return `
            <div class="blacksmith-weapon-grid">
                ${visible.map(weapon => `
                    <div class="blacksmith-slot" data-weapon-id="${weapon.uid}">
                        <img src="${weapon.icon}" alt="${weapon.name}" class="blacksmith-slot-icon">
                    </div>
                `).join("")}
            </div>
        `;
    }

    renderStoneList() {
        const visible = this.stones.filter(s => !this.anvilStone || s.uid !== this.anvilStone.uid);
        if (!visible.length) {
            return `
                <div class="blacksmith-empty">
                    <i class="fa-solid fa-gem"></i>
                    <span>Nenhuma pedra disponível.</span>
                </div>
            `;
        }
        return `
            <div class="blacksmith-weapon-grid">
                ${visible.map(stone => `
                    <div class="blacksmith-slot" data-stone-id="${stone.uid}">
                        <img src="${stone.icon}" alt="${stone.name}" class="blacksmith-slot-icon">
                        <span class="inventory-quantity">${stone.quantity}</span>
                    </div>
                `).join("")}
            </div>
        `;
    }

    renderMiddle() {
        return `
            <h3 class="blacksmith-title">Encantar Arma</h3>
            <p class="blacksmith-subtitle">
                Selecione uma arma e uma pedra para canalizar o encantamento.
            </p>

            <div class="enchant-slot-row">
                <span class="enchant-slot-label">Arma</span>
                <div class="enchant-slot-box ${this.anvilWeapon ? "filled" : ""}" data-slot="weapon">
                    ${
                        this.anvilWeapon
                            ? `<img src="${this.anvilWeapon.icon}" alt="${this.anvilWeapon.name}">`
                            : `<i class="fa-solid fa-sword placeholder-icon"></i>`
                    }
                </div>
                <span class="enchant-stone-name">${this.anvilWeapon?.name ?? ""}</span>
            </div>

            <div class="enchant-plus">+</div>

            <div class="enchant-slot-row">
                <span class="enchant-slot-label">Pedra</span>
                <div class="enchant-slot-box ${this.anvilStone ? "filled" : ""}" data-slot="stone">
                    ${
                        this.anvilStone
                            ? `<img src="${this.anvilStone.icon}" alt="${this.anvilStone.name}">`
                            : `<i class="fa-solid fa-gem placeholder-icon"></i>`
                    }
                </div>
                <span class="enchant-stone-name">${this.anvilStone?.name ?? ""}</span>
            </div>

            ${this.renderPreview()}
        `;
    }

    renderPreview() {
        if (!this.anvilStone) return "";
        const [statKey, value] = Object.entries(this.anvilStone.stats)[0];

        const currentValue = this.anvilWeapon?.enchantments?.[statKey] ?? 0;
        const blocked = this.anvilWeapon && value <= currentValue;

        if (blocked) {
            return `
                <div class="blacksmith-upgrade-info">
                    <p class="enchant-warning">
                        Essa arma já tem um encantamento de ${this.getStatName(statKey)} igual ou melhor (+${currentValue}).
                    </p>
                </div>
            `;
        }

        return `
            <div class="blacksmith-upgrade-info">
                <div class="blacksmith-preview">
                    <div class="blacksmith-stat">
                        <span>${this.getStatIcon(statKey)} ${this.getStatName(statKey)}</span>
                        <strong>${currentValue > 0 ? `${currentValue} → ` : ""}+${value} (permanente)</strong>
                    </div>
                </div>
            </div>
        `;
    }

    renderFooter() {

        const price = this.anvilStone?.enchantPrice ?? 0;

        const canRefine = this.canRefine();

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
                        <i class="fa-solid fa-gem"></i>
                        <div class="blacksmith-footer-text">
                            <span class="label">PREÇO</span>
                            <span class="value">${price.toLocaleString("pt-BR")}</span>
                        </div>
                    </div>
                </div>
                <button class="blacksmith-upgrade-button" ${canRefine ? "" : "disabled"}>
                    <i class="fa-solid fa-gem"></i>
                    Refinar
                </button>
            </footer>
        `;
    }

    canRefine() {
        if (!this.anvilWeapon || !this.anvilStone) return false;
        if (this.player.gold < (this.anvilStone.enchantPrice ?? 0)) return false;
        const [statKey, value] = Object.entries(this.anvilStone.stats)[0];
        const currentValue = this.anvilWeapon.enchantments?.[statKey] ?? 0;
        return value > currentValue;
    }

    refresh() {
        this.hideTooltip();
        const panel = document.querySelector(".blacksmith-window");
        if (!panel) return;
        panel.outerHTML = this.render();
        this.registerEvents();
    }

    refine() {

        if (!this.anvilWeapon || !this.anvilStone) {
            Toast.show("Selecione uma arma e uma pedra.");
            return;
        }

        const price = this.anvilStone.enchantPrice ?? 0;

        if (this.player.gold < price) {
            Toast.show("Ouro insuficiente.");
            return;
        }

        if (!this.player.removeGold(price)) {
            Toast.show("Ouro insuficiente.");
            return;
        }

        const result = this.player.applyEnchantment(this.anvilStone, this.anvilWeapon);

        if (!result.success) {
            this.player.addGold(price);
            Toast.show(result.reason ?? "Não foi possível aplicar o encantamento.");
            return;
        }

        Toast.show(`Encantamento aplicado! +${result.value} de ${this.player.getEnchantStatName(result.statKey)} permanente.`);

        SaveService.autoSave(this.player);

        this.anvilWeapon = null;
        this.anvilStone = null;

        this.refresh();

    }

    // Quartzo Rosa: a pedra guarda o bônus como "special" — vira o
    // atributo secundário real da classe da arma no anvil (mesma regra de
    // Player.getSpecialStatKey).
    getSpecialStatKey() {
        const classId = this.anvilWeapon?.class ?? this.player?.class?.id;
        return {
            warrior: "absorption",
            mage: "penetration",
            archer: "criticalChance",
            barbarian: "lifeSteal"
        }[classId] ?? null;
    }

    getStatName(stat) {
        if (stat === "special") {
            const resolved = this.getSpecialStatKey();
            return resolved ? this.getStatName(resolved) : "Atributo Especial";
        }
        switch (stat) {
            case "attack": return "Ataque";
            case "armor": return "Armadura";
            case "agility": return "Agilidade";
            case "life": return "Vida";
            case "criticalChance": return "Chance Crítica";
            case "lifeSteal": return "Roubo de Vida";
            case "penetration": return "Penetração";
            case "absorption": return "Absorção";
            default: return stat;
        }
    }

    getStatIcon(stat) {
        if (stat === "special") {
            const resolved = this.getSpecialStatKey();
            return resolved ? this.getStatIcon(resolved) : "💗";
        }
        switch (stat) {
            case "attack": return "⚔️";
            case "armor": return "🛡️";
            case "agility": return "👢";
            case "life": return "❤️";
            case "criticalChance": return "🎯";
            case "lifeSteal": return "🩸";
            case "penetration": return "💥";
            case "absorption": return "🪨";
            default: return "•";
        }
    }

    registerEvents(container = document) {

        container.querySelector(".market-close")?.addEventListener("click", () => {
            this.anvilWeapon = null;
            this.anvilStone = null;
            this.game.hudScreen.changeView("city");
        });

        container.querySelectorAll("[data-weapon-id]").forEach(slot => {
            const weapon = this.weapons.find(w => w.uid === slot.dataset.weaponId);
            if (!weapon) return;
            slot.addEventListener("click", () => {
                this.anvilWeapon = weapon;
                this.refresh();
            });
            this.bindTooltip(slot, weapon);
        });

        container.querySelectorAll("[data-stone-id]").forEach(slot => {
            const stone = this.stones.find(s => s.uid === slot.dataset.stoneId);
            if (!stone) return;
            slot.addEventListener("click", () => {
                this.anvilStone = stone;
                this.refresh();
            });
            this.bindTooltip(slot, stone);
        });

        container.querySelector('.enchant-slot-box[data-slot="weapon"]')?.addEventListener("click", () => {
            if (!this.anvilWeapon) return;
            this.anvilWeapon = null;
            this.hideTooltip();
            this.refresh();
        });

        container.querySelector('.enchant-slot-box[data-slot="stone"]')?.addEventListener("click", () => {
            if (!this.anvilStone) return;
            this.anvilStone = null;
            this.hideTooltip();
            this.refresh();
        });

        container.querySelector(".blacksmith-upgrade-button")?.addEventListener("click", () => {
            this.refine();
        });

    }

    bindTooltip(slot, item) {
        slot.addEventListener("mouseenter", (event) => {
            this.showTooltip(item, event.clientX, event.clientY);
        });
        slot.addEventListener("mousemove", (event) => {
            this.updateTooltipPosition(event.clientX, event.clientY);
        });
        slot.addEventListener("mouseleave", () => {
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

}
