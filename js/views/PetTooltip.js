import PetService from "../services/PetService.js";

// Tooltip de pet (ovo ou já chocado) — mesma estrutura/CSS de
// ItemTooltip.js/SeedTooltip.js (tooltip-header, tooltip-section,
// tooltip-row), só com o conteúdo que um pet precisa mostrar.
export default class PetTooltip {

    constructor(item) {
        this.item = item;
    }

    render() {

        const sections = this.item.shocked
            ? [this.renderHeader(), this.renderHatchedInfo()]
            : [this.renderHeader(), this.renderEggInfo()];

        return sections.filter(section => section.trim() !== "").join(this.renderDivider());

    }

    renderHeader() {
        return `
            <div class="tooltip-header">
                <img class="tooltip-image" src="${this.item.image ?? this.item.icon}" alt="${this.item.name}">
                <h2 class="tooltip-name">${this.item.name.toUpperCase()}</h2>
                ${this.item.stars ? `<span class="tooltip-class">${this.item.stars}</span>` : ""}
            </div>
        `;
    }

    renderEggInfo() {
        return `
            <div class="tooltip-section">
                <p>${this.item.description ?? "Um ovo. Quem sabe o que pode sair dele?"}</p>
            </div>
        `;
    }

    renderHatchedInfo() {

        const scaled = PetService.getScaledStats(this.item);
        const hunger = PetService.getHunger(this.item);
        const maxHunger = PetService.getMaxHunger(this.item);
        const xpRequired = PetService.getXpForNextLevel(this.item.level);
        const ability = PetService.getCurrentStage(this.item)?.habilities?.hability;

        return `
            <div class="tooltip-section">
                <div class="tooltip-row">
                    <span class="tooltip-label">Nível</span>
                    <span class="tooltip-value">${this.item.level}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Fome</span>
                    <span class="tooltip-value">${hunger} / ${maxHunger}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">XP</span>
                    <span class="tooltip-value">${this.item.xp ?? 0} / ${xpRequired}</span>
                </div>
            </div>
            <div class="tooltip-section">
                <h3 class="tooltip-title">Atributos dados ao jogador</h3>
                <div class="tooltip-stat"><span>❤️ Vida</span><span class="tooltip-stat-positive">+${scaled.life}</span></div>
                <div class="tooltip-stat"><span>⚔️ Ataque</span><span class="tooltip-stat-positive">+${scaled.attack}</span></div>
                <div class="tooltip-stat"><span>🛡️ Armadura</span><span class="tooltip-stat-positive">+${scaled.armor}</span></div>
                <div class="tooltip-stat"><span>👢 Agilidade</span><span class="tooltip-stat-positive">+${scaled.agility}</span></div>
            </div>
            ${ability ? `
                <div class="tooltip-section">
                    <h3 class="tooltip-title">Habilidade</h3>
                    <p>${ability.description ?? ""}</p>
                    ${scaled.biteDamage > 0 ? `<div class="tooltip-stat"><span>${ability.name}</span><span class="tooltip-stat-positive">${scaled.biteDamage} de dano</span></div>` : ""}
                    ${ability.mimicRatio > 0 ? `<div class="tooltip-stat"><span>${ability.name}</span><span class="tooltip-stat-positive">1/${Math.round(1 / ability.mimicRatio)} do dano causado</span></div>` : ""}
                    ${scaled.healAmount > 0 ? `<div class="tooltip-stat"><span>❤️ Cura (um alvo aleatório)</span><span class="tooltip-stat-positive">+${scaled.healAmount}</span></div>` : ""}
                </div>
            ` : ""}
        `;

    }

    renderDivider() {
        return `<div class="tooltip-divider"></div>`;
    }

}
