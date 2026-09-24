import FarmService from "../services/FarmService.js";
import Toast from "../ui/components/Toast.js";
import FarmConfirmModal from "../ui/components/modals/FarmConfirmModal.js";
import FarmPlotTooltip from "./FarmPlotTooltip.js";

const TOOLS = [
    { id: "hoe", icon: "assets/img/assets/farm/tools-image/hoe.png", tooltip: "Abrir novo terreno" },
    { id: "water", icon: "assets/img/assets/farm/tools-image/watering-can.png", tooltip: "Regar" },
    { id: "glove", icon: "assets/img/assets/farm/tools-image/glove.png", tooltip: "Colher" },
    { id: "pest_control", icon: "assets/img/assets/farm/tools-image/pest-control.png", tooltip: "Anti-Praga" }
];

const TICK_INTERVAL_MS = 5000;

// Tela de nível-menu (igual Dungeons/PVP/Cooperativo — sem X de
// fechar, sai clicando noutro item do menu de navegação). Barra de
// ferramentas em elipse acima do menu + grade 6x4 de canteiros.
export default class FarmView {

    constructor(game) {
        this.game = game;
        this.selectedTool = null; // "hoe" | "water" | "glove" | null
        this.toolsCollapsed = false; // barra de ferramentas recolhida pra baixo
        this.seedPickerIndex = null; // índice do canteiro esperando escolha de semente
        this.tickInterval = null;
        this.confirmModal = new FarmConfirmModal();
        this.plotTooltip = new FarmPlotTooltip();
        this.hoveredPlotIndex = null; // canteiro sob o mouse agora, pro tick atualizar o tempo restante
    }

    get player() {
        return this.game.player;
    }

    render() {

        // Preguiçoso igual a fome do pet: acerta as contas de quantas
        // pragas nasceram desde a última vez que a Fazenda foi aberta
        // (ela roda mesmo com a tela fechada — ver FarmService).
        FarmService.applyPestSpawn(this.player);

        return `
            <section class="farm-screen">
                ${this.renderTools()}
                ${this.renderGrid()}
                ${this.seedPickerIndex !== null ? this.renderSeedPicker() : ""}
            </section>
        `;
    }

    renderTools() {
        return `
            <div class="farm-tools-dock ${this.toolsCollapsed ? "collapsed" : ""}">
            <button
                class="farm-tools-toggle"
                aria-label="${this.toolsCollapsed ? "Mostrar ferramentas" : "Recolher ferramentas"}"
            >
                <i class="fa-solid fa-chevron-${this.toolsCollapsed ? "up" : "down"}"></i>
            </button>
            <div class="farm-tools-ellipse">
                ${TOOLS.map(tool => `
                    <button
                        class="farm-tool ${this.selectedTool === tool.id ? "active" : ""}"
                        data-tool="${tool.id}"
                        data-tooltip="${tool.tooltip}"
                    >
                        <img src="${tool.icon}" alt="${tool.tooltip}">
                    </button>
                `).join("")}
            </div>
            </div>
        `;
    }

    renderGrid() {
        const plots = this.player.farm.plots;
        return `
            <div class="farm-plot-grid">
                ${plots.map((plot, index) => this.renderPlot(plot, index)).join("")}
            </div>
        `;
    }

    renderPlot(plot, index) {

        const soilImage = FarmService.getSoilImage(plot);
        const stageImage = plot.seedId ? FarmService.getStageImage(plot) : null;
        const crop = plot.seedId ? FarmService.getCrop(plot.seedId) : null;
        const hasPest = FarmService.hasPest(plot);

        return `
            <div class="farm-plot" data-index="${index}">
                <img class="farm-plot-soil" id="farm-soil-${index}" src="${soilImage}" alt="Terreno">
                ${stageImage ? `<img class="farm-plot-seed" id="farm-seed-${index}" src="${stageImage}" alt="${crop?.name ?? ""}">` : ""}
                <img class="farm-plot-pest" id="farm-pest-${index}" src="${FarmService.getPestImage()}" alt="Praga" style="display:${hasPest ? "block" : "none"};">
            </div>
        `;

    }

    renderSeedPicker() {

        const ownedSeeds = this.player.inventory.filter(item => item.category === "seed" && (item.quantity ?? 1) > 0);

        return `
            <div class="farm-seed-picker-overlay">
                <div class="farm-seed-picker">
                    <h3>Escolha uma semente</h3>
                    ${
                        ownedSeeds.length
                            ? `
                                <div class="farm-seed-picker-grid">
                                    ${ownedSeeds.map(item => `
                                        <button class="farm-seed-picker-item" data-uid="${item.uid}">
                                            <img src="${item.icon}" alt="${item.name}">
                                            <span>${item.name}</span>
                                            <span class="farm-seed-picker-qty">x${item.quantity ?? 1}</span>
                                        </button>
                                    `).join("")}
                                </div>
                            `
                            : `<p class="farm-seed-picker-empty">Você não possui nenhuma semente. Compre no Mercado.</p>`
                    }
                    <button class="farm-seed-picker-cancel">Cancelar</button>
                </div>
            </div>
        `;

    }

    refresh() {
        this.game.hudScreen.refreshCurrentView();
    }

    registerEvents(container = document) {

        const screen = container.querySelector(".farm-screen");

        if (!screen) return;

        // Recolhe/mostra a barra sem re-renderizar a tela inteira, pra
        // animação de deslizar funcionar.
        screen.querySelector(".farm-tools-toggle")?.addEventListener("click", (event) => {
            event.stopPropagation();
            this.toolsCollapsed = !this.toolsCollapsed;
            const dock = event.currentTarget.closest(".farm-tools-dock");
            dock.classList.toggle("collapsed", this.toolsCollapsed);
            event.currentTarget.setAttribute("aria-label", this.toolsCollapsed ? "Mostrar ferramentas" : "Recolher ferramentas");
            event.currentTarget.querySelector("i").className = `fa-solid fa-chevron-${this.toolsCollapsed ? "up" : "down"}`;
        });

        screen.querySelectorAll(".farm-tool").forEach(button => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                const tool = button.dataset.tool;
                this.selectedTool = this.selectedTool === tool ? null : tool;
                this.refresh();
            });
        });

        screen.querySelectorAll(".farm-plot").forEach(plotEl => {

            const index = Number(plotEl.dataset.index);

            plotEl.addEventListener("click", (event) => {
                event.stopPropagation();
                this.handlePlotClick(index);
            });

            // Tooltip de tempo restante — só faz sentido com algo
            // plantado (canteiro vazio/grama não mostra nada).
            plotEl.addEventListener("mouseenter", (event) => {
                const plot = this.player.farm.plots[index];
                if (!plot.seedId) return;
                this.hoveredPlotIndex = index;
                this.plotTooltip.show(plot, event.clientX, event.clientY);
            });

            plotEl.addEventListener("mousemove", (event) => {
                this.plotTooltip.move(event.clientX, event.clientY);
            });

            plotEl.addEventListener("mouseleave", () => {
                this.hoveredPlotIndex = null;
                this.plotTooltip.hide();
            });

        });

        // Clicar em qualquer lugar fora de uma ferramenta/canteiro
        // (com alguma ferramenta selecionada) desmarca a seleção.
        screen.addEventListener("click", () => {
            if (this.selectedTool !== null) {
                this.selectedTool = null;
                this.refresh();
            }
        });

        screen.querySelectorAll(".farm-seed-picker-item").forEach(button => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                const item = this.player.inventory.find(i => i.uid === button.dataset.uid);
                if (!item) return;
                const result = FarmService.plantSeed(this.player, this.seedPickerIndex, item);
                Toast.show(result.message);
                this.seedPickerIndex = null;
                this.refresh();
            });
        });

        screen.querySelector(".farm-seed-picker-cancel")?.addEventListener("click", (event) => {
            event.stopPropagation();
            this.seedPickerIndex = null;
            this.refresh();
        });

        screen.querySelector(".farm-seed-picker-overlay")?.addEventListener("click", (event) => {
            if (event.target.classList.contains("farm-seed-picker-overlay")) {
                this.seedPickerIndex = null;
                this.refresh();
            }
        });

        this.startTicking();

    }

    async handlePlotClick(index) {

        const plot = this.player.farm.plots[index];

        if (!this.selectedTool) {

            if (plot.tilled && !plot.seedId) {
                this.seedPickerIndex = index;
                this.refresh();
            }

            return;

        }

        if (this.selectedTool === "hoe") {
            await this.handleHoeClick(index, plot);
            return;
        }

        let result;

        switch (this.selectedTool) {
            case "water":
                result = FarmService.water(this.player, index);
                break;
            case "glove":
                result = FarmService.harvest(this.player, index);
                break;
            case "pest_control":
                result = FarmService.removePest(this.player, index);
                break;
        }

        if (result) Toast.show(result.message);

        this.refresh();

    }

    // Enxada tem dois cliques que precisam de confirmação antes de
    // agir: arar (cobra ouro — mostra custo e ouro atual) e remover uma
    // semente já plantada (ela se perde). Terra já arada e vazia não
    // muda nada, então não precisa de confirmação.
    async handleHoeClick(index, plot) {

        if (!plot.tilled) {

            const cost = FarmService.getPlotCost(index);

            const confirmed = await this.confirmModal.show({
                title: "Arar Terreno",
                message: `Isso vai custar <strong>${cost.toLocaleString("pt-BR")}</strong> de ouro. <br>Você tem <strong>${this.player.gold.toLocaleString("pt-BR")}</strong>. <br>Deseja continuar?`
            });

            if (!confirmed) return;

            const result = FarmService.till(this.player, index);
            Toast.show(result.message);
            this.refresh();

            return;

        }

        if (plot.seedId) {

            const confirmed = await this.confirmModal.show({
                title: "Remover Semente",
                message: "Ao confirmar a semente será perdida!"
            });

            if (!confirmed) return;

            const result = FarmService.removeSeed(this.player, index);
            Toast.show(result.message);
            this.refresh();

            return;

        }

        Toast.show("Você pode remover uma semente ou arar uma terra nova.");

    }

    /* =====================================================
       TICK — atualiza só as imagens de solo/estágio sem re-renderizar
       a tela inteira (mesmo espírito do ChestHUD.tick()), pra não
       interromper a seleção de ferramenta/seed picker a cada poucos
       segundos.
    ===================================================== */

    startTicking() {

        clearInterval(this.tickInterval);

        this.tickInterval = setInterval(() => this.tick(), TICK_INTERVAL_MS);

    }

    tick() {

        if (!document.querySelector(".farm-screen")) {
            clearInterval(this.tickInterval);
            this.plotTooltip.hide();
            return;
        }

        // Pode nascer praga nova em qualquer canteiro semeado a cada
        // tick — roda antes do loop abaixo pra já refletir na imagem.
        FarmService.applyPestSpawn(this.player);

        this.player.farm.plots.forEach((plot, index) => {

            if (!plot.tilled) return;

            // Solo pode secar/molhar mesmo sem semente plantada.
            const soilImg = document.getElementById(`farm-soil-${index}`);
            const soilSrc = FarmService.getSoilImage(plot);

            if (soilImg && soilImg.getAttribute("src") !== soilSrc) soilImg.src = soilSrc;

            const pestImg = document.getElementById(`farm-pest-${index}`);

            if (pestImg) pestImg.style.display = FarmService.hasPest(plot) ? "block" : "none";

            if (!plot.seedId) return;

            const seedImg = document.getElementById(`farm-seed-${index}`);
            const stageSrc = FarmService.getStageImage(plot);

            if (seedImg && stageSrc && seedImg.getAttribute("src") !== stageSrc) seedImg.src = stageSrc;

        });

        // Contagem regressiva do tooltip aberto (se o mouse não se
        // moveu, mousemove não dispara pra atualizar o texto sozinho).
        // Também cobre o canteiro ter sido colhido/removido embaixo do
        // mouse por uma ação (refresh() troca os elementos sem disparar
        // mouseleave no antigo) — sem semente, some o tooltip.
        if (this.hoveredPlotIndex !== null) {

            const hoveredPlot = this.player.farm.plots[this.hoveredPlotIndex];

            if (hoveredPlot.seedId) {
                this.plotTooltip.update(hoveredPlot);
            } else {
                this.plotTooltip.hide();
                this.hoveredPlotIndex = null;
            }

        }

    }

}
