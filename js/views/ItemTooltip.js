export default class ItemTooltip {
    constructor(item) {
        this.item = item;
    }

    render() {

        return `

            ${this.renderHeader()}

            ${this.renderDivider()}

            ${this.renderInfo()}

            ${this.renderDivider()}

            ${this.renderStats()}

            ${this.renderDivider()}

            ${this.renderEffect()}

            ${this.renderDivider()}

            ${this.renderFooter()}

        `;

    }

    renderHeader() {

        let subtitle;

        if (this.item.type === "item") {
            subtitle = "Consumível";
        } else if (this.item.class) {
            subtitle = this.getClassName(this.item.class);
        } else {
            subtitle = "Todas as Classes";
        }

        return `
            <div class="tooltip-header">
                <img
                    class="tooltip-image"
                    src="${this.item.icon}"
                    alt="${this.item.name}"
                >

                <h2 class="tooltip-name">
                    ${this.item.name.toUpperCase()}
                </h2>

                <span class="tooltip-class">
                    ${subtitle}
                </span>
            </div>
        `;
    }

    renderInfo() {

        const rarity = this.item.rarity ?? {
            name: "Comum",
            color: "#FFFFFF"
        };

        const quality = this.item.quality ?? {
            name: "Nenhuma",
            color: "#8f8578"
        };

        const itemClass = this.item.class
            ? this.getClassName(this.item.class)
            : "Todas as Classes";

        return `
            <div class="tooltip-section">

                <div class="tooltip-row">
                    <span class="tooltip-label">Classe</span>
                    <span>${itemClass}</span>
                </div>

                <div class="tooltip-row">
                    <span class="tooltip-label">Raridade</span>
                    <span
                        class="tooltip-rarity"
                        style="color:${rarity.color};">
                        ${rarity.name}
                    </span>
                </div>

                <div class="tooltip-row">
                    <span class="tooltip-label">Qualidade</span>
                    <span
                        class="tooltip-quality"
                        style="color:${quality.color};">
                        ${quality.name}
                    </span>
                </div>

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
        return `
            <div class="tooltip-section">
                <h3 class="tooltip-title">Efeito</h3>
                <p class="${this.item.effect ? "" : "tooltip-empty"}">${this.item.effect ?? "Este item não possui efeitos especiais."}</p>
            </div>
        `;
    }

    renderFooter() {

        return `
            <div class="tooltip-footer">
                <span>Valor de venda</span>
                <span class="tooltip-gold">
                    ${this.item.sellValue ?? 0} Ouro
                </span>
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
            archer: "Arqueiro"
        };
        return classes[classId] || classId;
    }

    getStatName(stat) {

        switch (stat) {

            case "attack":
                return "Ataque";

            case "armor":
                return "Armadura";

            case "agility":
                return "Agilidade";

            case "criticalChance":
                return "Chance Crítica";

            case "lifeSteal":
                return "Roubo de Vida";

            case "penetration":
                return "Penetração";

            default:
                return stat;

        }

    }

    getStatIcon(stat) {

        switch (stat) {

            case "attack":
                return "⚔️";

            case "armor":
                return "🛡️";

            case "agility":
                return "👢";

            case "criticalChance":
                return "🎯";

            case "lifeSteal":
                return "🩸";

            case "penetration":
                return "💥";

            default:
                return "•";

        }

    }
}