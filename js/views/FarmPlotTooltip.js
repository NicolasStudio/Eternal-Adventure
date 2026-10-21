import FarmService from "../services/FarmService.js";

// stolenBy é o nome de outro jogador (vem do banco) — nunca entra como HTML.
function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}

// Tooltip de hover pra um canteiro plantado — mesma estrutura/CSS das
// outras (DungeonTooltip.js, SeedTooltip.js: tooltip-header,
// tooltip-section, tooltip-row), só com o tempo restante até a
// colheita. FarmView chama update() a cada tick (5s) enquanto o mouse
// segue em cima do mesmo canteiro, pra contagem regressiva sem precisar
// mexer o mouse.
export default class FarmPlotTooltip {

    constructor() {
        this.tooltip = null;
    }

    init() {
        if (this.tooltip) return;
        this.tooltip = document.createElement("div");
        this.tooltip.id = "farm-plot-tooltip";
        this.tooltip.className = "item-tooltip";
        this.tooltip.style.position = "fixed";
        this.tooltip.style.zIndex = "99999";
        this.tooltip.style.pointerEvents = "none";
        this.tooltip.style.display = "none";
        document.body.appendChild(this.tooltip);
    }

    show(plot, x, y) {
        this.init();
        this.tooltip.innerHTML = this.render(plot);
        this.tooltip.style.display = "block";
        this.move(x, y);
    }

    // Só reescreve o conteúdo (chamado pelo tick) — não mexe na
    // posição, então não "pula" atrás do cursor sem ele se mover.
    update(plot) {
        if (!this.tooltip || this.tooltip.style.display === "none") return;
        this.tooltip.innerHTML = this.render(plot);
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

    render(plot) {

        const crop = FarmService.getCrop(plot.seedId);

        if (!crop) return "";

        const ready = FarmService.isReadyToHarvest(plot);
        const remaining = FarmService.getRemainingMs(plot);

        const modifier = plot.growthModifier ?? 1;
        const modifierLabel = modifier < 1
            ? "Crescimento acelerado (plantado em terra molhada)"
            : modifier > 1
                ? "Crescimento atrasado (plantado em terra seca)"
                : "";

        const hasPest = FarmService.hasPest(plot);

        // Quanto essa planta ainda rende / colheita cheia — ex: 7/7, ou
        // 5/7 depois que um visitante roubou (ver FarmService.STEAL_AMOUNT).
        const harvestLeft = FarmService.getHarvestRemaining(plot);
        const stolenBy = plot.stolen > 0 ? escapeHtml(plot.stolenBy ?? "um visitante") : null;

        return `
            <div class="tooltip-header">
                <img class="tooltip-image" src="${crop.harvestedItem.icon}" alt="${crop.name}">
                <h2 class="tooltip-name">${crop.name.toUpperCase()}</h2>
            </div>
            <div class="tooltip-divider"></div>
            <div class="tooltip-section">
                <div class="tooltip-row">
                    <span class="tooltip-label">${ready ? "Pronto para colher!" : "Tempo restante"}</span>
                    <span class="tooltip-value">${ready ? `${harvestLeft}/${crop.harvestYield}` : this.formatDuration(remaining)}</span>
                </div>
                ${stolenBy ? `<p class="tooltip-description tooltip-stat-negative">Roubado por ${stolenBy} (−${plot.stolen}).</p>` : ""}
                ${modifierLabel ? `<p class="tooltip-description">${modifierLabel}</p>` : ""}
                ${hasPest ? `<p class="tooltip-description tooltip-stat-negative">Praga ativa! Crescimento 15% mais lento — use a Anti-Praga pra remover.</p>` : ""}
            </div>
        `;

    }

    formatDuration(ms) {

        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) return `${hours}h ${minutes}min`;
        if (minutes > 0) return `${minutes}min ${seconds}s`;

        return `${seconds}s`;

    }

}
