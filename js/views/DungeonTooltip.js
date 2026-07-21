export default class DungeonTooltip {
    constructor() {
        this.tooltip = null;
    }

    init() {
        if (this.tooltip) return;
        this.tooltip = document.createElement("div");
        this.tooltip.id = "dungeon-tooltip";
        this.tooltip.className = "item-tooltip";
        this.tooltip.style.position = "fixed";
        this.tooltip.style.zIndex = "99999";
        this.tooltip.style.pointerEvents = "none";
        this.tooltip.style.display = "none";
        document.body.appendChild(this.tooltip);
    }

    show(item, x, y) {
        this.init();
        this.tooltip.innerHTML = this.render(item);
        this.tooltip.style.display = "block";
        this.move(x, y);
    }

    move(x, y) {
        if (!this.tooltip) return;
        const margin = 20;
        const tooltipWidth = this.tooltip.offsetWidth;
        const tooltipHeight = this.tooltip.offsetHeight;
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
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    hide() {
        if (!this.tooltip) return;
        this.tooltip.style.display = "none";
    }

    render(item) {
        const rarityName = typeof item.rarity === "object" ? item.rarity.name : item.rarity;
        const rarityColor = typeof item.rarity === "object" ? item.rarity.color : item.color;
        return `
            <div class="tooltip-header">
                <img class="tooltip-image" src="${item.icon}" alt="${item.name}">
                <h2 class="tooltip-name">${item.name}</h2>
            </div>
            <div class="tooltip-divider"></div>
            <div class="tooltip-section">
                <div class="tooltip-row">
                    <span class="tooltip-label">Raridade</span>
                    <span class="tooltip-rarity" style="color:${rarityColor};">${rarityName}</span>
                </div>
                ${item.quality ? `
                    <div class="tooltip-row">
                        <span class="tooltip-label">Qualidade</span>
                        <span class="tooltip-quality" style="color:${item.quality.color};">${item.quality.name}</span>
                    </div>
                ` : ""}
            </div>
            ${this.renderStats(item)}
        `;
    }

    renderStats(item) {
        if (!item.stats) return "";
        let html = `
            <div class="tooltip-divider"></div>
            <div class="tooltip-section">
                <h3 class="tooltip-title">Atributos</h3>
        `;
        for (const [key, value] of Object.entries(item.stats)) {
            html += `
                <div class="tooltip-stat">
                    <span>${this.getStatIcon(key)} ${this.getStatName(key)}</span>
                    <span class="${this.getStatClass(value)}">${value > 0 ? "+" : ""}${value}</span>
                </div>
            `;
        }
        html += `</div>`;
        return html;
    }

    getStatClass(value) {
        if (value > 0) return "tooltip-stat-positive";
        if (value < 0) return "tooltip-stat-negative";
        return "tooltip-stat-neutral";
    }

    getStatName(stat) {
        const stats = {
            attack: "Ataque",
            armor: "Armadura",
            agility: "Agilidade",
            criticalChance: "Chance Crítica",
            lifeSteal: "Roubo de Vida",
            penetration: "Penetração"
        };
        return stats[stat] ?? stat;
    }

    getStatIcon(stat) {
        const icons = {
            attack: "⚔️",
            armor: "🛡️",
            agility: "👢",
            criticalChance: "🎯",
            lifeSteal: "🩸",
            penetration: "💥"
        };
        return icons[stat] ?? "•";
    }
}