import farmCrops from "../data/farmCrops.js";

// Tooltip dedicado pra semente — ItemTooltip.js não tem campos pra
// tempo de plantio/XP de pet nem ponto de extensão pra isso (é uma
// classe fechada de 5 métodos fixos), então em vez de forçar esses
// campos lá dentro, essa classe espelha a mesma estrutura/CSS
// (tooltip-header, tooltip-section, tooltip-row — tudo já existe em
// tooltip.css) só que com o conteúdo que a semente precisa mostrar.
export default class SeedTooltip {

    constructor(item) {
        this.item = item;
        this.crop = farmCrops[item.cropId] ?? null;
    }

    render() {

        const sections = [
            this.renderHeader(),
            this.renderInfo()
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
        return `
            <div class="tooltip-section">
                <p class="${this.item.effect ? "" : "tooltip-empty"}">${this.item.effect ?? "Semente da Fazenda."}</p>
                <div class="tooltip-row">
                    <span class="tooltip-label">Tempo até a colheita</span>
                    <span class="tooltip-value">${this.formatDuration(this.crop?.growTimeMs)}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">XP de Pet ao colher</span>
                    <span class="tooltip-value">${this.crop?.petXP ?? 0}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Valor de compra</span>
                    <span class="tooltip-value">${this.item.value ?? 0} Ouro</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Valor de venda</span>
                    <span class="tooltip-gold">${this.item.sellValue ?? 0} Ouro</span>
                </div>
            </div>
        `;
    }

    formatDuration(ms) {

        if (!ms) return "--";

        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);

        if (hours && minutes) return `${hours}h ${minutes}min`;
        if (hours) return `${hours}h`;

        return `${minutes}min`;

    }

    renderDivider() {
        return `<div class="tooltip-divider"></div>`;
    }

}
