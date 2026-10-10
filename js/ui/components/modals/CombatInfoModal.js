// Resumo do combate pra UM jogador — ver js/combat/CombatInfo.js
// (buildCombatInfo/buildCombatTimeline), usado pelo Cooperativo, PvE
// (dungeons) e PvP (1x1 e 2x2). Só mostra o que já veio pronto, não
// guarda nada: cada show() é um retrato daquele combate específico, e
// quem chama fecha isso junto ao sair da tela (ex: RewardModal.hide()),
// então nada sobrevive pro próximo.

// Mesma ordem/agrupamento da aba "Resumo", reaproveitado pelos radios e
// pela linha da aba "Gráfico" — cada métrica tem uma cor própria (ver
// render abaixo). Só uma métrica por vez: duas escalas bem diferentes
// (ex: milhares de Dano causado ao lado de dezenas de Esquivas) no mesmo
// eixo deixavam a menor "zerada" visualmente, então virou seleção única
// em vez de várias marcadas ao mesmo tempo.
const METRIC_GROUPS = [
    {
        title: null,
        metrics: [
            { key: "damageDealt", label: "Dano causado", color: "#3cb44b" },
            { key: "damageReceived", label: "Dano recebido", color: "#e6194b" },
            { key: "armorMitigated", label: "Dano mitigado", color: "#ffe119" },
            { key: "rawDamageDealt", label: "Dano real causado", color: "#f58231" },
            { key: "absorbedValue", label: "Dano absorvido", color: "#46f0f0" },
            { key: "lifeStolen", label: "Vida roubada", color: "#bcf60c" }
        ]
    },
    {
        title: null,
        metrics: [
            { key: "dodges", label: "Esquivas", color: "#4363d8" },
            { key: "absorptionCount", label: "Absorção", color: "#911eb4" },
            { key: "criticalCount", label: "Críticos", color: "#f032e6" },
            { key: "mimicCount", label: "Imitação", color: "#c99856" },
            { key: "miasmaCount", label: "Miasma", color: "#b5cf4a" },
            { key: "lifeStealCount", label: "Roubo de vida", color: "#fabebe" }
        ]
    },
    {
        title: "Pet",
        metrics: [
            { key: "petHealing", label: "Cura do pet", color: "#008080" },
            { key: "petDamage", label: "Dano do pet", color: "#e6beff" }
        ]
    }
];

const ALL_METRICS = METRIC_GROUPS.flatMap(group => group.metrics);

const DEFAULT_METRIC = "damageDealt";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 220;
// Margens assimétricas (não um padding único) — sobra espaço reservado
// pros rótulos dos eixos (valor máximo/0 à esquerda, rodada final
// embaixo) sem eles ficarem em cima da própria linha do eixo ou cortados
// na borda do viewBox.
const CHART_PAD_LEFT = 42;
const CHART_PAD_RIGHT = 10;
const CHART_PAD_TOP = 14;
const CHART_PAD_BOTTOM = 26;

export default class CombatInfoModal {

    constructor() {
        this.overlay = null;
    }

    show(info, timeline = []) {

        this.hide();

        this.timeline = timeline;

        this.overlay = document.createElement("div");
        this.overlay.className = "combat-info-overlay";
        this.overlay.innerHTML = `
            <div class="combat-info-modal">
                <header class="combat-info-header">
                    <h2>Informações do Combate</h2>
                    <button class="close-btn combat-info-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <div class="combat-info-tabs">
                    <button class="combat-info-tab active" data-tab="resumo">Resumo</button>
                    <button class="combat-info-tab" data-tab="grafico">Gráfico</button>
                </div>
                <div class="combat-info-panel" data-panel="resumo">
                    ${this.renderSummary(info)}
                </div>
                <div class="combat-info-panel" data-panel="grafico" hidden>
                    ${this.renderChartPanel()}
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        this.overlay.addEventListener("click", event => {
            if (event.target === this.overlay) this.hide();
        });

        this.overlay.querySelector(".combat-info-close").addEventListener("click", () => this.hide());

        this.overlay.querySelectorAll(".combat-info-tab").forEach(tab => {
            tab.addEventListener("click", () => this.selectTab(tab.dataset.tab));
        });

        this.chartEl = this.overlay.querySelector(".combat-info-chart");
        this.overlay.querySelectorAll(".combat-info-check input").forEach(input => {
            input.addEventListener("change", () => this.renderChart());
        });

        this.renderChart();

        this.escapeHandler = event => {
            if (event.key === "Escape") this.hide();
        };
        document.addEventListener("keydown", this.escapeHandler);

    }

    selectTab(tab) {

        this.overlay.querySelectorAll(".combat-info-tab").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tab === tab);
        });

        this.overlay.querySelectorAll(".combat-info-panel").forEach(panel => {
            panel.hidden = panel.dataset.panel !== tab;
        });

    }

    renderSummary(info) {
        return METRIC_GROUPS.map(group => `
            <div class="combat-info-group">
                ${group.title ? `<h3 class="combat-info-subtitle">${group.title}</h3>` : ""}
                ${group.metrics.map(metric => `
                    <div class="combat-info-row">
                        <span>${metric.label}</span>
                        <strong style="color:${metric.color}">${info[metric.key] ?? 0}</strong>
                    </div>
                `).join("")}
            </div>
        `).join("");
    }

    renderChartPanel() {
        return `
            <div class="combat-info-chart-wrap">
                <svg class="combat-info-chart" viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}" preserveAspectRatio="none"></svg>
            </div>
            <p class="combat-info-chart-hint">Rodada do andar no eixo horizontal — escolha uma métrica pra acompanhar.</p>
            <div class="combat-info-legend">
                ${ALL_METRICS.map(metric => `
                    <label class="combat-info-check" style="--chart-color:${metric.color}">
                        <input type="radio" name="combat-info-metric" data-metric="${metric.key}" ${metric.key === DEFAULT_METRIC ? "checked" : ""}>
                        <span class="combat-info-swatch"></span>
                        ${metric.label}
                    </label>
                `).join("")}
            </div>
        `;
    }

    renderChart() {

        if (!this.chartEl) return;

        const timeline = this.timeline ?? [];
        const checkedInput = this.overlay.querySelector(".combat-info-check input:checked");
        const metric = checkedInput ? ALL_METRICS.find(m => m.key === checkedInput.dataset.metric) : null;

        this.chartEl.innerHTML = "";

        if (timeline.length < 2 || !metric) {
            this.chartEl.innerHTML = `
                <text x="${CHART_WIDTH / 2}" y="${CHART_HEIGHT / 2}" text-anchor="middle" class="combat-info-chart-empty">
                    ${timeline.length < 2 ? "Rodadas insuficientes pra gráfico." : "Escolha uma métrica."}
                </text>
            `;
            return;
        }

        const maxValue = Math.max(1, ...timeline.map(point => point[metric.key] ?? 0));
        const maxRound = timeline[timeline.length - 1].round;

        const plotTop = CHART_PAD_TOP;
        const plotBottom = CHART_HEIGHT - CHART_PAD_BOTTOM;
        const plotLeft = CHART_PAD_LEFT;
        const plotRight = CHART_WIDTH - CHART_PAD_RIGHT;

        const toX = round => plotLeft + (maxRound <= 1 ? 0 : ((round - 1) / (maxRound - 1)) * (plotRight - plotLeft));
        const toY = value => plotTop + (plotBottom - plotTop) - (value / maxValue) * (plotBottom - plotTop);

        const points = timeline
            .map(point => `${toX(point.round).toFixed(1)},${toY(point[metric.key] ?? 0).toFixed(1)}`)
            .join(" ");

        this.chartEl.innerHTML = `
            <line class="combat-info-axis" x1="${plotLeft}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" />
            <line class="combat-info-axis" x1="${plotLeft}" y1="${plotTop}" x2="${plotLeft}" y2="${plotBottom}" />
            <text x="${plotLeft - 6}" y="${plotTop + 4}" class="combat-info-axis-label" text-anchor="end">${maxValue}</text>
            <text x="${plotLeft - 6}" y="${plotBottom}" class="combat-info-axis-label" text-anchor="end">0</text>
            <text x="${plotRight}" y="${plotBottom + 16}" class="combat-info-axis-label" text-anchor="end">rodada ${maxRound}</text>
            <polyline class="combat-info-line" points="${points}" stroke="${metric.color}" vector-effect="non-scaling-stroke" />
        `;

    }

    hide() {

        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

        if (this.escapeHandler) {
            document.removeEventListener("keydown", this.escapeHandler);
            this.escapeHandler = null;
        }

        this.timeline = null;
        this.chartEl = null;

    }

}
