import FarmService from "../services/FarmService.js";
import FarmSyncService from "../services/FarmSyncService.js";
import SaveService from "../services/SaveService.js";
import Toast from "../ui/components/Toast.js";
import FarmConfirmModal from "../ui/components/modals/FarmConfirmModal.js";
import FarmPlotTooltip from "./FarmPlotTooltip.js";

const TOOLS = [
    { id: "hoe", icon: "assets/img/assets/farm/tools-image/hoe.png", tooltip: "Abrir novo terreno" },
    { id: "water", icon: "assets/img/assets/farm/tools-image/watering-can.png", tooltip: "Regar" },
    { id: "glove", icon: "assets/img/assets/farm/tools-image/glove.png", tooltip: "Colher" },
    { id: "pest_control", icon: "assets/img/assets/farm/tools-image/pest-control.png", tooltip: "Anti-Praga" }
];

// Na fazenda de outro jogador: sem enxada (não dá pra arar nem tirar
// semente), e a luva vira "Roubar".
const VISIT_TOOLS = TOOLS
    .filter(tool => tool.id !== "hoe")
    .map(tool => (tool.id === "glove" ? { ...tool, tooltip: "Roubar" } : tool));

const TICK_INTERVAL_MS = 5000;

// Durante a visita, recarrega a fazenda visitada a cada tantos ticks
// (6 × 5s = 30s) — pra ver o que o dono ou outros visitantes fizeram.
const VISIT_RELOAD_TICKS = 6;

// Nome de outro jogador (vem do banco) — nunca entra como HTML.
function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}

// Tela de nível-menu (igual Dungeons/PVP/Cooperativo — sem X de
// fechar, sai clicando noutro item do menu de navegação). Barra de
// ferramentas em elipse acima do menu + grade 6x4 de canteiros + lista
// de fazendas pra visitar no lado direito.
export default class FarmView {

    constructor(game) {
        this.game = game;
        this.selectedTool = null; // "hoe" | "water" | "glove" | "pest_control" | null
        this.toolsCollapsed = false; // barra de ferramentas recolhida pra baixo
        this.seedPickerIndex = null; // índice do canteiro esperando escolha de semente
        this.tickInterval = null;
        this.confirmModal = new FarmConfirmModal();
        this.plotTooltip = new FarmPlotTooltip();
        this.hoveredPlotIndex = null; // canteiro sob o mouse agora, pro tick atualizar o tempo restante

        // Visita: null na própria fazenda; { farmId, name, level, plots }
        // na de outro jogador.
        this.visit = null;
        this.visitBusy = false; // ação de visita esperando o servidor
        this.visitTicks = 0;

        // Lista de fazendas pra visitar — painel flutuante aberto pelo
        // botão de casinha no HUD, ao lado do chat (ver renderVisitButton).
        this.visitList = { status: "idle", entries: [] };
        this.visitPanelOpen = false;

        // Eventos dos visitantes pro modal de resumo (null = sem modal).
        this.summaryEvents = null;
    }

    get player() {
        return this.game.player;
    }

    // Canteiros mostrados agora: os do jogador ou os da fazenda visitada.
    get plots() {
        return this.visit ? this.visit.plots : this.player.farm.plots;
    }

    /* =====================================================
       ABRIR / SAIR (chamados pelo HudScreen ao trocar de tela)
    ===================================================== */

    onOpen() {
        this.visit = null;
        this.visitPanelOpen = false;
        this.selectedTool = null;
        this.seedPickerIndex = null;
        this.summaryEvents = null;
        this.syncOwnFarm();
        this.loadVisitList();
    }

    onClose() {
        this.visit = null;
        this.visitPanelOpen = false;
        this.plotTooltip.hide();
    }

    // Traz o que visitantes fizeram na sua fazenda e, se houve algo,
    // abre o resumo.
    async syncOwnFarm() {

        if (!FarmSyncService.currentFarmId()) return;

        const { events } = await FarmSyncService.pullAndMerge(this.player);

        if (events.length > 0) this.summaryEvents = events;

        if (this.isOnScreen() && !this.visit) this.refresh();

    }

    async loadVisitList() {

        if (!FarmSyncService.currentFarmId()) {
            this.visitList = { status: "offline", entries: [] };
            if (this.isOnScreen()) this.refresh();
            return;
        }

        this.visitList = { status: "loading", entries: [] };

        const entries = await FarmSyncService.getVisitableFarms();

        this.visitList = { status: entries.length ? "loaded" : "empty", entries };

        if (this.isOnScreen()) this.refresh();

    }

    isOnScreen() {
        return !!document.querySelector(".farm-screen");
    }

    /* =====================================================
       RENDER
    ===================================================== */

    render() {

        // Preguiçoso igual a fome do pet: acerta as contas de quantas
        // pragas nasceram desde a última vez que a Fazenda foi aberta
        // (ela roda mesmo com a tela fechada — ver FarmService).
        if (FarmService.applyPestSpawn(this.player)) FarmSyncService.pushChanged(this.player);

        return `
            <section class="farm-screen ${this.visit ? "farm-visiting" : ""}">
                ${this.visit ? this.renderVisitBanner() : ""}
                ${this.renderTools()}
                ${this.renderGrid()}
                ${this.visitPanelOpen ? this.renderVisitPanel() : ""}
                ${this.seedPickerIndex !== null && !this.visit ? this.renderSeedPicker() : ""}
                ${this.summaryEvents ? this.renderSummary() : ""}
            </section>
        `;
    }

    renderVisitBanner() {
        return `
            <div class="farm-visit-banner">
                <span>Fazenda de <strong>${escapeHtml(this.visit.name)}</strong> · Nv. ${this.visit.level}</span>
                <span class="farm-visit-steals ${this.visit.stealsToday >= FarmSyncService.DAILY_STEAL_LIMIT ? "maxed" : ""}"
                      title="Canteiros que você roubou desta fazenda hoje (zera à meia-noite)">
                    <i class="fa-solid fa-hand"></i> ${this.visit.stealsToday}/${FarmSyncService.DAILY_STEAL_LIMIT}
                </span>
                <button class="farm-visit-back">
                    <i class="fa-solid fa-house"></i>
                    Minha fazenda
                </button>
            </div>
        `;
    }

    renderTools() {

        const tools = this.visit ? VISIT_TOOLS : TOOLS;

        return `
            <div class="farm-tools-dock ${this.toolsCollapsed ? "collapsed" : ""}">
            <button
                class="farm-tools-toggle"
                aria-label="${this.toolsCollapsed ? "Mostrar ferramentas" : "Recolher ferramentas"}"
            >
                <i class="fa-solid fa-chevron-${this.toolsCollapsed ? "up" : "down"}"></i>
            </button>
            <div class="farm-tools-ellipse">
                ${tools.map(tool => `
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
        return `
            <div class="farm-plot-grid">
                ${this.plots.map((plot, index) => this.renderPlot(plot, index)).join("")}
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

    // Botão redondo no HUD (mesmo estilo do chat) que abre/fecha a lista
    // de fazendas — o HudScreen só desenha ele na tela da Fazenda.
    renderVisitButton() {
        return `
            <button class="hud-tool chat-toggle farm-visit-toggle ${this.visitPanelOpen ? "active" : ""}" id="farm-visit-toggle" data-tooltip="Visitar fazendas">
                <i class="fa-solid fa-house"></i>
            </button>
        `;
    }

    // Lista de fazendas — mesmo espírito do Ranking Global, só com nome,
    // nível e o botão de visitar. Abre logo abaixo do botão de casinha.
    renderVisitPanel() {

        let body;

        if (this.visitList.status === "offline") {
            body = `<p class="farm-visit-status">Entre com sua conta pra visitar fazendas.</p>`;
        } else if (this.visitList.status === "loading" || this.visitList.status === "idle") {
            body = `<p class="farm-visit-status"><i class="fa-solid fa-circle-notch fa-spin"></i> Carregando...</p>`;
        } else if (this.visitList.status === "empty") {
            body = `<p class="farm-visit-status">Nenhuma fazenda pra visitar ainda.</p>`;
        } else {
            body = `
                <div class="farm-visit-list">
                    ${this.visitList.entries.map((entry, index) => `
                        <div class="farm-visit-row ${this.visit?.farmId === entry.farmId ? "current" : ""}">
                            <span class="farm-visit-level">Nv. ${entry.level}</span>
                            <span class="farm-visit-name">${escapeHtml(entry.name)}</span>
                            <button class="farm-visit-button" data-index="${index}" ${this.visit?.farmId === entry.farmId || this.visitBusy ? "disabled" : ""}>
                                Visitar
                            </button>
                        </div>
                    `).join("")}
                </div>
            `;
        }

        return `
            <aside class="farm-visit-panel">
                <header class="farm-visit-panel-header">
                    <h3><i class="fa-solid fa-house"></i> Fazendas</h3>
                    <button class="farm-visit-panel-close" aria-label="Fechar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                ${body}
            </aside>
        `;

    }

    renderSeedPicker() {

        const ownedSeeds = this.player.inventory.filter(item => item.category === "seed" && (item.quantity ?? 1) > 0);
        const emptyPlots = FarmService.getEmptyTilledIndexes(this.player).length;

        return `
            <div class="farm-seed-picker-overlay">
                <div class="farm-seed-picker">
                    <h3>Escolha uma semente</h3>
                    ${
                        ownedSeeds.length
                            ? `
                                <div class="farm-seed-picker-grid">
                                    ${ownedSeeds.map(item => {
                                        // Quantos canteiros "Plantar em todos" vai ocupar:
                                        // limitado pela semente e pelos canteiros livres.
                                        const plantAllCount = Math.min(item.quantity ?? 1, emptyPlots);
                                        return `
                                            <div class="farm-seed-picker-option">
                                                <button class="farm-seed-picker-item" data-uid="${item.uid}">
                                                    <img src="${item.icon}" alt="${item.name}">
                                                    <span>${item.name}</span>
                                                    <span class="farm-seed-picker-qty">x${item.quantity ?? 1}</span>
                                                </button>
                                                ${plantAllCount > 1 ? `
                                                    <button class="farm-seed-picker-all" data-uid="${item.uid}">
                                                        Plantar em todos (${plantAllCount})
                                                    </button>
                                                ` : ""}
                                            </div>
                                        `;
                                    }).join("")}
                                </div>
                            `
                            : `<p class="farm-seed-picker-empty">Você não possui nenhuma semente. Compre no Mercado.</p>`
                    }
                    <button class="farm-seed-picker-cancel">Cancelar</button>
                </div>
            </div>
        `;

    }

    // Resumo do que visitantes fizeram desde a última vez que o dono
    // abriu a Fazenda — agrupado por visitante.
    renderSummary() {

        const byVisitor = new Map();

        this.summaryEvents.forEach(event => {

            const entry = byVisitor.get(event.visitorName) ?? { water: 0, pest: 0, stolen: new Map() };

            if (event.type === "water") entry.water++;
            if (event.type === "pest") entry.pest++;
            if (event.type === "steal") {
                const name = event.cropName ?? "alimento";
                entry.stolen.set(name, (entry.stolen.get(name) ?? 0) + event.amount);
            }

            byVisitor.set(event.visitorName, entry);

        });

        const lines = [...byVisitor.entries()].map(([visitor, entry]) => {

            const parts = [];

            if (entry.water) parts.push(`regou <strong>${entry.water}</strong> canteiro${entry.water === 1 ? "" : "s"}`);
            if (entry.pest) parts.push(`eliminou pragas em <strong>${entry.pest}</strong> canteiro${entry.pest === 1 ? "" : "s"}`);
            if (entry.stolen.size) {
                const stolenText = [...entry.stolen.entries()].map(([crop, amount]) => `${amount} ${escapeHtml(crop)}`).join(", ");
                parts.push(`<span class="farm-summary-stolen">roubou ${stolenText}</span>`);
            }

            return `<li><strong>${escapeHtml(visitor)}</strong> ${parts.join(" · ")}</li>`;

        });

        return `
            <div class="farm-seed-picker-overlay farm-summary-overlay">
                <div class="farm-seed-picker farm-summary">
                    <h3>Enquanto você esteve fora</h3>
                    <ul class="farm-summary-list">${lines.join("")}</ul>
                    <button class="farm-seed-picker-cancel farm-summary-close">Fechar</button>
                </div>
            </div>
        `;

    }

    refresh() {
        this.game.hudScreen.refreshCurrentView();
    }

    /* =====================================================
       EVENTOS
    ===================================================== */

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
                const plot = this.plots[index];
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
                this.afterOwnerAction();
            });
        });

        screen.querySelectorAll(".farm-seed-picker-all").forEach(button => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                const item = this.player.inventory.find(i => i.uid === button.dataset.uid);
                if (!item) return;
                const result = FarmService.plantSeedInAllEmpty(this.player, this.seedPickerIndex, item);
                Toast.show(result.message);
                this.seedPickerIndex = null;
                this.afterOwnerAction();
            });
        });

        screen.querySelector(".farm-seed-picker-overlay:not(.farm-summary-overlay) .farm-seed-picker-cancel")?.addEventListener("click", (event) => {
            event.stopPropagation();
            this.seedPickerIndex = null;
            this.refresh();
        });

        screen.querySelector(".farm-seed-picker-overlay:not(.farm-summary-overlay)")?.addEventListener("click", (event) => {
            if (event.target.classList.contains("farm-seed-picker-overlay")) {
                this.seedPickerIndex = null;
                this.refresh();
            }
        });

        // Resumo das visitas.
        screen.querySelector(".farm-summary-close")?.addEventListener("click", (event) => {
            event.stopPropagation();
            this.summaryEvents = null;
            this.refresh();
        });

        // Botão de casinha no HUD (fora da .farm-screen — o HudScreen
        // desenha ele junto do chat): abre/fecha a lista de fazendas.
        document.getElementById("farm-visit-toggle")?.addEventListener("click", (event) => {
            event.stopPropagation();
            this.visitPanelOpen = !this.visitPanelOpen;
            if (this.visitPanelOpen && this.visitList.status !== "loading") this.loadVisitList();
            this.refresh();
        });

        screen.querySelector(".farm-visit-panel-close")?.addEventListener("click", (event) => {
            event.stopPropagation();
            this.visitPanelOpen = false;
            this.refresh();
        });

        // Clique dentro do painel não conta como "clicar fora" (que
        // desmarcaria a ferramenta selecionada — ver listener da tela).
        screen.querySelector(".farm-visit-panel")?.addEventListener("click", event => event.stopPropagation());

        // Lista de fazendas / visita — visitar fecha o painel pra mostrar
        // a fazenda inteira; o botão de casinha reabre.
        screen.querySelectorAll(".farm-visit-button").forEach(button => {
            button.addEventListener("click", (event) => {
                event.stopPropagation();
                this.visitPanelOpen = false;
                this.startVisit(this.visitList.entries[Number(button.dataset.index)]);
            });
        });

        this.positionVisitPanel();

        screen.querySelector(".farm-visit-back")?.addEventListener("click", (event) => {
            event.stopPropagation();
            this.endVisit();
        });

        this.startTicking();

    }

    // Painel flutuante logo abaixo do botão de casinha (mesmo jeito do
    // painel do chat, ver ChatHUD.positionPanel) — sem ficar pra fora da
    // tela em janelas baixas.
    positionVisitPanel() {

        const panel = document.querySelector(".farm-visit-panel");
        const anchor = document.getElementById("farm-visit-toggle");

        if (!panel || !anchor) return;

        const rect = anchor.getBoundingClientRect();
        const margin = 8;
        const left = Math.max(margin, Math.min(rect.left, window.innerWidth - panel.offsetWidth - margin));
        const top = Math.max(margin, Math.min(rect.bottom + margin, window.innerHeight - panel.offsetHeight - margin));

        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;

    }

    // Toda ação na PRÓPRIA fazenda termina aqui: re-renderiza e espelha
    // na nuvem o que mudou (pros visitantes verem).
    afterOwnerAction() {
        FarmSyncService.pushChanged(this.player);
        this.refresh();
    }

    async handlePlotClick(index) {

        if (this.visit) {
            await this.handleVisitClick(index);
            return;
        }

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
                // Antes de colher, confirma na nuvem se alguém roubou
                // dessa planta (e trava novos roubos) — ver claimHarvest.
                if (FarmService.isReadyToHarvest(plot)) await FarmSyncService.claimHarvest(this.player, index);
                result = FarmService.harvest(this.player, index);
                break;
            case "pest_control":
                result = FarmService.removePest(this.player, index);
                break;
        }

        if (result) Toast.show(result.message);

        this.afterOwnerAction();

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
            this.afterOwnerAction();

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
            this.afterOwnerAction();

            return;

        }

        Toast.show("Você pode remover uma semente ou arar uma terra nova.");

    }

    /* =====================================================
       VISITA
    ===================================================== */

    async startVisit(entry) {

        if (!entry || this.visitBusy) return;

        this.visitBusy = true;
        this.refresh();

        let plots = null;
        let stealsToday = 0;

        try {
            [plots, stealsToday] = await Promise.all([
                FarmSyncService.loadFarm(entry.farmId),
                FarmSyncService.getStealsToday(entry.farmId)
            ]);
        } catch (err) {
            console.warn("Falha ao carregar a fazenda:", err);
        }

        this.visitBusy = false;

        if (!plots) {
            Toast.show(`A fazenda de ${entry.name} ainda não está disponível pra visitas.`);
            this.refresh();
            return;
        }

        this.visit = { ...entry, plots, stealsToday };
        this.visitTicks = 0;

        // Conquista "Acho que a grama do vizinho é mais verde".
        this.player.progress.stats.farmVisits = (this.player.progress.stats.farmVisits ?? 0) + 1;
        this.player.notify();
        SaveService.autoSave(this.player);
        this.selectedTool = null;
        this.seedPickerIndex = null;
        this.plotTooltip.hide();
        this.refresh();

    }

    endVisit() {
        this.visit = null;
        this.selectedTool = null;
        this.plotTooltip.hide();
        this.refresh();
    }

    async handleVisitClick(index) {

        const type = { water: "water", glove: "steal", pest_control: "pest" }[this.selectedTool];

        if (!type) {
            Toast.show("Escolha uma ferramenta: regar, roubar ou anti-praga.");
            return;
        }

        if (this.visitBusy) return;

        this.visitBusy = true;

        const visit = this.visit;
        const result = await FarmSyncService.visitorAction(visit.farmId, index, type, this.player.name);

        this.visitBusy = false;

        // Saiu da visita enquanto esperava o servidor — não aplica nada.
        if (this.visit !== visit) return;

        if (result.plot) visit.plots[index] = result.plot;
        if (result.stealsToday != null) visit.stealsToday = result.stealsToday;

        if (result.ok) {

            const stats = this.player.progress.stats;

            // Conquistas "Amigo ou inimigo?" / "Senhor Furtado".
            if (type === "water") stats.neighborWaterCount = (stats.neighborWaterCount ?? 0) + 1;
            if (type === "pest") stats.neighborPestCount = (stats.neighborPestCount ?? 0) + 1;

            if (type === "steal" && result.crop) {
                for (let i = 0; i < FarmService.STEAL_AMOUNT; i++) this.player.addItem(result.crop.harvestedItem);
                stats.neighborStealCount = (stats.neighborStealCount ?? 0) + 1;
                stats.stolenFoodCount = (stats.stolenFoodCount ?? 0) + FarmService.STEAL_AMOUNT;
            }

            this.player.notify();
            SaveService.autoSave(this.player);

        }

        Toast.show(result.message);
        this.refresh();

    }

    // Recarrega a fazenda visitada em segundo plano (tick) — mostra o que
    // o dono ou outros visitantes fizeram nesse meio-tempo.
    async reloadVisit() {

        const visit = this.visit;

        if (!visit || this.visitBusy) return;

        try {

            const plots = await FarmSyncService.loadFarm(visit.farmId);

            // refresh (não só updatePlotImages): o dono pode ter plantado
            // num canteiro vazio, e aí precisa criar a imagem da planta.
            if (plots && this.visit === visit && !this.visitBusy) {
                visit.plots = plots;
                this.refresh();
            }

        } catch (err) {
            console.warn("Falha ao recarregar a fazenda visitada:", err);
        }

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

        if (!this.isOnScreen()) {
            clearInterval(this.tickInterval);
            this.plotTooltip.hide();
            return;
        }

        // Pode nascer praga nova em qualquer canteiro semeado a cada
        // tick — roda antes do loop abaixo pra já refletir na imagem.
        // Continua valendo durante uma visita (é a SUA fazenda).
        if (FarmService.applyPestSpawn(this.player)) FarmSyncService.pushChanged(this.player);

        if (this.visit && ++this.visitTicks % VISIT_RELOAD_TICKS === 0) this.reloadVisit();

        this.updatePlotImages();

    }

    updatePlotImages() {

        this.plots.forEach((plot, index) => {

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

            const hoveredPlot = this.plots[this.hoveredPlotIndex];

            if (hoveredPlot?.seedId) {
                this.plotTooltip.update(hoveredPlot);
            } else {
                this.plotTooltip.hide();
                this.hoveredPlotIndex = null;
            }

        }

    }

}
