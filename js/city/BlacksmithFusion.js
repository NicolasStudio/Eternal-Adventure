import Toast from "../ui/components/Toast.js";
import ItemTooltip from "../../js/views/ItemTooltip.js";
import FusionService from "../services/FusionService.js";
import UpgradeService from "../services/UpgradeService.js";
import SaveService from "../services/SaveService.js";

const FUSION_SLOTS = [
    { id: "weapon", label: "Arma", icon: "fa-solid fa-khanda" },
    { id: "helmet", label: "Elmo", icon: "fa-solid fa-hat-wizard" },
    { id: "chest", label: "Peitoral", icon: "fa-solid fa-shirt" },
    { id: "leg", label: "Pernas", icon: "fa-solid fa-socks" },
    { id: "boot", label: "Botas", icon: "fa-solid fa-shoe-prints" },
    { id: "ring", label: "Anel", icon: "fa-solid fa-ring" },
    { id: "amulet", label: "Amuleto", icon: "fa-solid fa-gem" }
];

const REQUIRED_ITEM_COUNT = 4;

export default class BlacksmithFusion {

    constructor(game) {
        this.game = game;
        this.activeSlot = "weapon";
        this.selectedItems = []; // até 4 itens, uids distintos
        this.protectionItem = null;
        this.items = [];
        this.processing = false;
    }

    get player() {
        return this.game.player;
    }

    // Reaproveitado por HudScreen.changeView ao sair da tela (mesmo
    // espírito de zerar anvilItem/anvilWeapon nos outros Blacksmith*) —
    // nada fica "preso" selecionado se o jogador fechar no meio do caminho.
    resetSelection() {
        this.selectedItems = [];
        this.protectionItem = null;
    }

    getItems() {

        // Sem filtrar por item.used de propósito — ver o comentário em
        // FusionService.validateSelection.
        this.items = this.player.inventory.filter(item =>
            FusionService.isFusable(item)
            && item.slot === this.activeSlot
            && !this.selectedItems.some(selected => selected.uid === item.uid)
        );

        return this.items;

    }

    getProtectionCandidates() {
        return this.player.inventory.filter(item => item.fusionProtection === true);
    }

    render() {

        this.getItems();

        return `
            <section class="blacksmith-window fusion-window">
                <header class="market-header">
                    <div>
                        <h2>Fusão</h2>
                    </div>
                    <button class="close-btn market-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                ${this.renderSlotTabs()}
                <div class="blacksmith-body">
                    <aside class="blacksmith-left">
                        ${this.renderItems()}
                    </aside>
                    <section class="blacksmith-right">
                        ${this.renderFusionPanel()}
                    </section>
                </div>
                ${this.renderActions()}
            </section>
        `;

    }

    renderSlotTabs() {
        return `
            <div class="blacksmith-slot-tabs">
                ${FUSION_SLOTS.map(slot => `
                    <button
                        class="blacksmith-slot-tab ${this.activeSlot === slot.id ? "active" : ""}"
                        data-slot="${slot.id}">
                        <i class="${slot.icon}"></i>
                        ${slot.label}
                    </button>
                `).join("")}
            </div>
        `;
    }

    renderItems() {
        if (!this.items.length) {
            return `
                <div class="blacksmith-empty">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>Nenhum equipamento elegível disponível.</span>
                </div>
            `;
        }
        return `
            <div class="blacksmith-weapon-grid">
                ${this.items.map(item => `
                    <div class="blacksmith-slot" data-id="${item.uid}">
                        <img src="${item.icon}" alt="${item.name}" class="blacksmith-slot-icon">
                        ${item.fusionLevel > 0 ? `<span class="fusion-level-badge">+${item.fusionLevel}</span>` : ""}
                    </div>
                `).join("")}
            </div>
        `;
    }

    renderFusionPanel() {
        return `
            <div class="blacksmith-anvil fusion-panel">
                <h3 class="blacksmith-title">Fusão de Equipamentos</h3>
                <div class="fusion-slots-area">
                    <div class="fusion-grid">
                        ${[0, 1, 2, 3].map(index => this.renderFusionSlot(this.selectedItems[index])).join("")}
                    </div>
                    <div class="fusion-protection-column">
                        <span class="fusion-protection-label">Proteção</span>
                        ${this.renderProtectionSlot()}
                        ${!this.protectionItem ? this.renderProtectionCandidates() : ""}
                    </div>
                </div>
                ${this.renderFusionInfo()}
            </div>
        `;
    }

    renderFusionSlot(item) {
        if (!item) {
            return `
                <div class="fusion-slot empty">
                    <i class="fa-solid fa-plus placeholder-icon"></i>
                </div>
            `;
        }
        return `
            <div class="fusion-slot filled" data-remove-id="${item.uid}">
                <img src="${item.icon}" alt="${item.name}">
                ${item.fusionLevel > 0 ? `<span class="fusion-level-badge">+${item.fusionLevel}</span>` : ""}
            </div>
        `;
    }

    renderProtectionSlot() {
        if (!this.protectionItem) {
            return `
                <div class="fusion-slot fusion-protection-slot empty">
                    <i class="fa-solid fa-shield placeholder-icon"></i>
                </div>
            `;
        }
        return `
            <div class="fusion-slot fusion-protection-slot filled" data-protection-toggle="1" title="Clique pra remover">
                <img src="${this.protectionItem.icon}" alt="${this.protectionItem.name}">
            </div>
        `;
    }

    // Lista visível dos itens de proteção que o jogador TEM, pra
    // clicar e colocar no slot — antes disso, a única forma de colocar
    // um item de proteção era clicando num slot vazio sem nenhuma pista
    // visual do que ia entrar ali (confuso, e não dava pra escolher
    // entre mais de um tipo de proteção).
    renderProtectionCandidates() {

        const candidates = this.getProtectionCandidates();

        if (!candidates.length) {
            return `<span class="fusion-protection-hint">Nenhum item de proteção no inventário</span>`;
        }

        return `
            <div class="fusion-protection-candidates">
                ${candidates.map(item => `
                    <div class="blacksmith-slot fusion-protection-candidate" data-protection-id="${item.uid}">
                        <img src="${item.icon}" alt="${item.name}" class="blacksmith-slot-icon">
                        ${(item.quantity ?? 1) > 1 ? `<span class="inventory-quantity">${item.quantity}</span>` : ""}
                    </div>
                `).join("")}
            </div>
        `;

    }

    // Mensagem inicial, motivo de bloqueio, ou o preview completo (item
    // base, bônus, chance de sucesso) quando os 4 slots batem as regras.
    renderFusionInfo() {

        if (this.selectedItems.length < REQUIRED_ITEM_COUNT) {
            return `
                <div class="blacksmith-upgrade-info fusion-info">
                    <span>Selecione quatro equipamentos elegíveis para realizar a fusão. Os itens devem possuir a mesma raridade e o mesmo nível de fusão. Consulte a Wiki para conhecer todas as regras.</span>
                </div>
            `;
        }

        const validation = FusionService.validateSelection(this.selectedItems, this.player);

        if (!validation.ok) {
            return `
                <div class="blacksmith-upgrade-info fusion-info">
                    <p class="enchant-warning">${validation.reason}</p>
                </div>
            `;
        }

        const bestItem = FusionService.pickBestItem(this.selectedItems);
        const chance = FusionService.getSuccessChance(bestItem.fusionLevel ?? 0, this.player.stats.sorte ?? 0);

        return `
            <div class="blacksmith-upgrade-info fusion-info">
                <div class="blacksmith-info-line">
                    <span>Item base</span>
                    <strong>${bestItem.name} ${bestItem.fusionLevel > 0 ? `(+${bestItem.fusionLevel})` : ""}</strong>
                </div>
                <div class="blacksmith-info-line">
                    <span>Resultado</span>
                    <strong>${bestItem.name} (+${(bestItem.fusionLevel ?? 0) + 1})</strong>
                </div>
                ${validation.bonusStats.map(stat => `
                    <div class="blacksmith-stat">
                        <span>${this.getStatIcon(stat)} ${this.getStatName(stat)}</span>
                        <strong class="tooltip-stat-positive">+${FusionService.bonusPerLevel}</strong>
                    </div>
                `).join("")}
                <hr>
                <div class="blacksmith-info-line">
                    <span>Chance de sucesso</span>
                    <strong>${chance.toFixed(1)}%</strong>
                </div>
                ${this.protectionItem
                    ? `<p class="fusion-protection-note">${this.protectionItem.name} protege os 4 itens em caso de falha — só ele é consumido.</p>`
                    : `<p class="fusion-protection-note">Falhar consome os 4 itens e o ouro. Coloque um item de proteção pra evitar perder os equipamentos.</p>`
                }
            </div>
        `;

    }

    getStatName(stat) {
        switch (stat) {
            case "life": return "Vida";
            case "attack": return "Ataque";
            case "armor": return "Armadura";
            case "agility": return "Agilidade";
            case "sorte": return "Sorte";
            default: return stat;
        }
    }

    getStatIcon(stat) {
        switch (stat) {
            case "life": return "❤️";
            case "attack": return "⚔️";
            case "armor": return "🛡️";
            case "agility": return "👢";
            case "sorte": return "🎲";
            default: return "•";
        }
    }

    renderActions() {

        const canFuse = this.canFuse();
        const cost = this.getCost();

        return `
            <footer class="blacksmith-footer">
                <div class="blacksmith-footer-info">
                    <div class="blacksmith-footer-section">
                        <i class="fa-solid fa-coins"></i>
                        <div class="blacksmith-footer-text">
                            <span class="label">SEU OURO</span>
                            <span class="value">${this.player.gold.toLocaleString("pt-BR")}</span>
                        </div>
                    </div>
                    <div class="blacksmith-footer-divider"></div>
                    <div class="blacksmith-footer-section">
                        <i class="fa-solid fa-hammer"></i>
                        <div class="blacksmith-footer-text">
                            <span class="label">CUSTO DA FUSÃO</span>
                            <span class="value">${cost.toLocaleString("pt-BR")}</span>
                        </div>
                    </div>
                </div>
                <button class="blacksmith-upgrade-button fusion-button" ${canFuse ? "" : "disabled"} ${this.processing ? "disabled" : ""}>
                    <i class="fa-solid fa-dna"></i>
                    Fundir
                </button>
            </footer>
        `;

    }

    getCost() {
        if (!this.selectedItems.length) return 0;
        return FusionService.getFusionCost(this.selectedItems[0]?.rarity?.id);
    }

    canFuse() {
        if (this.processing) return false;
        if (this.selectedItems.length !== REQUIRED_ITEM_COUNT) return false;
        return FusionService.validateSelection(this.selectedItems, this.player).ok;
    }

    toggleSelect(item) {
        if (this.selectedItems.length >= REQUIRED_ITEM_COUNT) {
            Toast.show("Você já selecionou 4 equipamentos.");
            return;
        }
        this.selectedItems.push(item);
        this.refresh();
    }

    removeSelected(uid) {
        this.selectedItems = this.selectedItems.filter(item => item.uid !== uid);
        this.refresh();
    }

    // Clique no slot (já preenchido) remove a proteção — colocar uma
    // nova é sempre pela lista de candidatos (ver selectProtection).
    clearProtection() {
        this.protectionItem = null;
        this.refresh();
    }

    selectProtection(item) {
        this.protectionItem = item;
        this.refresh();
    }

    confirmFusion() {

        if (this.processing) return;

        if (!this.canFuse()) {
            const validation = FusionService.validateSelection(this.selectedItems, this.player);
            Toast.show(validation.reason ?? "Não foi possível fundir.");
            return;
        }

        this.processing = true;

        const result = FusionService.resolveFusion({
            items: this.selectedItems,
            protectionItem: this.protectionItem,
            player: this.player,
            luck: this.player.stats.sorte ?? 0
        });

        this.processing = false;

        if (result.blocked) {
            Toast.show(result.reason ?? "Não foi possível fundir.");
            return;
        }

        if (result.success) {

            // Mesmo recálculo usado pela melhoria de qualidade — sempre
            // derivado de baseStats + fusionLevel, nunca somado em cima
            // do que já estava em item.stats.
            UpgradeService.applyStats(result.resultItem);

            Toast.show(`Fusão bem-sucedida! ${result.resultItem.name} (+${result.resultItem.fusionLevel}).`);

        } else if (result.protectionConsumed) {

            Toast.show("A fusão falhou, mas o item de proteção evitou a perda dos equipamentos.");

        } else {

            Toast.show("A fusão falhou. Os equipamentos e o ouro foram perdidos.");

        }

        SaveService.autoSave(this.player);

        this.resetSelection();

        this.refresh();

    }

    refresh() {
        this.hideTooltip();
        const panel = document.querySelector(".fusion-window");
        if (!panel) return;
        panel.outerHTML = this.render();
        this.registerEvents();
    }

    registerEvents(container = document) {

        container.querySelector(".market-close")?.addEventListener("click", () => {
            this.resetSelection();
            this.game.hudScreen.changeView("city");
        });

        container.querySelectorAll(".blacksmith-slot-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                this.activeSlot = tab.dataset.slot;
                this.refresh();
            });
        });

        container.querySelectorAll(".fusion-grid .fusion-slot.filled").forEach(slot => {
            slot.addEventListener("click", () => {
                this.removeSelected(slot.dataset.removeId);
            });
        });

        container.querySelector(".fusion-protection-slot.filled")?.addEventListener("click", () => {
            this.clearProtection();
        });

        container.querySelectorAll(".fusion-protection-candidate").forEach(slot => {
            const item = this.getProtectionCandidates().find(i => i.uid === slot.dataset.protectionId);
            if (!item) return;

            slot.addEventListener("click", () => {
                this.selectProtection(item);
            });

            const icon = slot.querySelector(".blacksmith-slot-icon") ?? slot;

            icon.addEventListener("mouseenter", (event) => {
                this.showTooltip(item, event.clientX, event.clientY);
            });
            icon.addEventListener("mousemove", (event) => {
                this.updateTooltipPosition(event.clientX, event.clientY);
            });
            icon.addEventListener("mouseleave", () => {
                this.hideTooltip();
            });
        });

        container.querySelector(".fusion-button")?.addEventListener("click", () => {
            this.confirmFusion();
        });

        this.registerItemEvents(container);

    }

    registerItemEvents(container) {
        const slots = container.querySelectorAll(".blacksmith-left .blacksmith-slot");
        slots.forEach(slot => {
            const item = this.items.find(i => i.uid === slot.dataset.id);
            if (!item) return;

            slot.addEventListener("click", () => {
                this.toggleSelect(item);
            });

            const icon = slot.querySelector(".blacksmith-slot-icon") ?? slot;

            icon.addEventListener("mouseenter", (event) => {
                this.showTooltip(item, event.clientX, event.clientY);
            });

            icon.addEventListener("mousemove", (event) => {
                this.updateTooltipPosition(event.clientX, event.clientY);
            });

            icon.addEventListener("mouseleave", () => {
                this.hideTooltip();
            });
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
