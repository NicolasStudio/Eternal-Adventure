import ItemValueService from "../services/ItemValueService.js";

export default class ItemTooltip {
    constructor(item) {
        this.item = item;
    }

    render() {
        const sections = [
            this.renderHeader(),
            this.renderInfo(),
            this.renderStats(),
            this.renderEffect(),
            this.renderFooter()
        ].filter(section => section.trim() !== "");

        return sections.join(this.renderDivider());
    }

    renderHeader() {
        return `
            <div class="tooltip-header">
                <img class="tooltip-image" src="${this.item.icon}" alt="${this.item.name}">
                <h2 class="tooltip-name">${this.item.name.toUpperCase()}</h2>
            </div>
        `;
    }

    renderInfo() {
        const rarity = this.item.rarity ?? { name: "Comum", color: "#FFFFFF" };
        let itemClass;
        if (this.item.type === "item") {
            itemClass = "Consumível";
        } else if (this.item.class) {
            itemClass = this.getClassName(this.item.class);
        } else {
            itemClass = "Todas as Classes";
        }
        return `
            <div class="tooltip-section">
                <div class="tooltip-row">
                    <span class="tooltip-label">Classe</span>
                    <span>${itemClass}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Raridade</span>
                    <span class="tooltip-rarity" style="color:${rarity.color};">${rarity.name}</span>
                </div>
                ${
                    this.item.quality
                        ? `
                            <div class="tooltip-row">
                                <span class="tooltip-label">Qualidade</span>
                                <span class="tooltip-quality" style="color:${this.item.quality.color};">${this.item.quality.name}</span>
                            </div>
                        `
                        : ""
                }
            </div>
        `;
    }

    renderStats() {
        if (!this.item.stats) {
            return "";
        }
        let html = "";
        Object.entries(this.item.stats).forEach(([key, value]) => {
            html += this.renderStat(key, value);
        });
        return `
            <div class="tooltip-section">
                <h3 class="tooltip-title">Atributos</h3>
                ${html}
            </div>
        `;
    }

    renderStat(key, value) {
        const statClass = value > 0 ? "tooltip-stat-positive" : value < 0 ? "tooltip-stat-negative" : "tooltip-stat-neutral";
        return `
            <div class="tooltip-stat">
                <span>${this.getStatIcon(key)} ${this.getStatName(key)}</span>
                <span class="${statClass}">${value > 0 ? "+" : ""}${value}</span>
            </div>
        `;
    }

    renderEffect() {

        // Pedra de encantamento — não tem "efeito" nesse sentido, então
        // a seção inteira some (nada de "não possui efeitos especiais").
        if (this.item.enchantPrice != null) {
            return "";
        }

        // Equipamento que não seja arma (cabeça, peitoral, calça, bota)
        // não pode ser encantado nem tem "efeito" — a seção some por
        // completo, em vez de mostrar "Este item não possui efeitos
        // especiais." sem necessidade.
        if (this.item.slot && this.item.slot !== "weapon") {
            return "";
        }

        const enchantments = this.item.enchantments
            ? Object.entries(this.item.enchantments)
            : [];

        if (enchantments.length) {

            const lines = enchantments
                .map(([key, value]) => `<div class="tooltip-stat"><span>${this.getStatIcon(key)} ${this.getEnchantStatName(key)}</span><span class="tooltip-stat-positive">+${value}</span></div>`)
                .join("");

            return `
                <div class="tooltip-section">
                    <h3 class="tooltip-title">Encantamentos</h3>
                    ${lines}
                </div>
            `;

        }

        return `
            <div class="tooltip-section">
                <h3 class="tooltip-title">Efeito</h3>
                <p class="${this.item.effect ? "" : "tooltip-empty"}">${this.item.effect ?? "Este item não possui efeitos especiais."}</p>
            </div>
        `;
    }

    getEnchantStatName(stat) {
        switch (stat) {
            case "life": return "Vida";
            case "armor": return "Armadura";
            case "attack": return "Ataque";
            case "agility": return "Agilidade";
            default: return stat;
        }
    }

    renderFooter() {
        return `
            <div class="tooltip-footer">
                <span>Valor de venda</span>
                <span class="tooltip-gold">${ItemValueService.getSellValue(this.item)} Ouro</span>
            </div>
        `;
    }

    renderDivider() {
        return `<div class="tooltip-divider"></div>`;
    }

    getClassName(classId) {
        const classes = {
            warrior: "Guerreiro",
            mage: "Mago",
            archer: "Arqueiro",
            barbarian: "Bárbaro"
        };
        return classes[classId] || classId;
    }

    getStatName(stat) {
        switch (stat) {
            case "attack": return "Ataque";
            case "armor": return "Armadura";
            case "agility": return "Agilidade";
            case "criticalChance": return "Chance Crítica";
            case "lifeSteal": return "Roubo de Vida";
            case "penetration": return "Penetração";
            case "absorption": return "Absorção";
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
            case "absorption": return "🪨";
            case "life": return "❤️";
            default: return "•";
        }
    }
}