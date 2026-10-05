import TalentService, { TALENTS, MAX_LEVEL, GAIN_PERCENT_PER_LEVEL, LIFE_LOSS_PERCENT_PER_LEVEL } from "../../../services/TalentService.js";
import SaveService from "../../../services/SaveService.js";
import Toast from "../Toast.js";
import FarmConfirmModal from "./FarmConfirmModal.js";

export default class TalentTreeModal {

    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.selectedId = null;
        this.confirmModal = new FarmConfirmModal();
    }

    get player() {
        return this.game.player;
    }

    show() {

        if (this.overlay) return;

        this.overlay = document.createElement("div");
        this.overlay.className = "talent-modal-overlay";

        this.render();

        document.body.appendChild(this.overlay);

        this.registerEvents();

    }

    render() {

        const levels = TalentService.getLevels(this.player);
        const earned = TalentService.getEarnedPoints(this.player);
        const available = TalentService.getAvailablePoints(this.player);
        const applied = this.player.talentApplied ?? {};

        this.overlay.innerHTML = `
            <section class="talent-window">

                <header class="talent-header">
                    <div>
                        <h2>Árvore de Talentos</h2>
                        <span class="talent-subtitle">
                            Ganhe 1 ponto a cada região concluída: 3 fases + o boss dela, com 3 vitórias em cada.
                            (${earned} ganho${earned === 1 ? "" : "s"} até agora)
                        </span>
                    </div>
                    <button class="close-btn talent-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="talent-body">

                    <div class="talent-row">
                        ${TALENTS.map(talent => {
                            const level = levels[talent.id] ?? 0;
                            const gain = applied[talent.id] ?? 0;
                            const canInvest = TalentService.canInvest(this.player, talent.id);
                            return `
                                <div class="talent-item">
                                <button class="talent-card ${this.selectedId === talent.id ? "selected" : ""} ${level >= MAX_LEVEL ? "maxed" : ""}"
                                        data-talent="${talent.id}">
                                    <img class="talent-icon" src="${talent.icon}" alt="${talent.label}">
                                    <div class="talent-tooltip">
                                        <strong>${TalentService.describe(talent)}</strong>
                                        <p>Cada nível: +${GAIN_PERCENT_PER_LEVEL}% da vida máxima em ${talent.label} e −${LIFE_LOSS_PERCENT_PER_LEVEL}% da vida máxima.</p>
                                        <p class="talent-tooltip-effect">
                                            ${level > 0
                                                ? `Nível ${level}/${MAX_LEVEL}: +${level * GAIN_PERCENT_PER_LEVEL}% → +${gain} de ${talent.label}. Vida máxima: −${level * LIFE_LOSS_PERCENT_PER_LEVEL}% (−${TalentService.lifeLostFor(this.player, talent.id)}).`
                                                : "Ainda não investido."}
                                        </p>
                                        <p class="talent-tooltip-hint">
                                            ${level >= MAX_LEVEL
                                                ? "Nível máximo."
                                                : canInvest
                                                    ? "Clique pra selecionar e depois em Melhorar."
                                                    : "Sem pontos disponíveis."}
                                        </p>
                                    </div>
                                </button>
                                <span class="talent-progress">${level}/${MAX_LEVEL}</span>
                                </div>
                            `;
                        }).join("")}
                    </div>

                </div>

                <footer class="blacksmith-footer">

                    <div class="blacksmith-footer-info">

                        <div class="blacksmith-footer-section">
                            <i class="fa-solid fa-star"></i>
                            <div class="blacksmith-footer-text">
                                <span class="label">PTS DISPONÍVEIS</span>
                                <span class="value">${available}</span>
                            </div>
                        </div>

                        <div class="blacksmith-footer-divider"></div>

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
                                <span class="label">MELHORIA</span>
                                <span class="value">${this.renderSelectedPrice()}</span>
                            </div>
                        </div>

                    </div>

                    <div class="talent-footer-actions">
                        <button class="talent-reset" ${TalentService.getSpentPoints(this.player) > 0 ? "" : "disabled"}>
                            <i class="fa-solid fa-rotate-left"></i>
                            Resetar
                        </button>
                        <button class="blacksmith-upgrade-button talent-upgrade" ${this.canUpgradeSelected() ? "" : "disabled"}>
                            <i class="fa-solid fa-arrow-up"></i>
                            Melhorar
                        </button>
                    </div>

                </footer>

            </section>
        `;

    }

    registerEvents() {

        this.overlay.querySelector(".talent-close").addEventListener("click", () => this.hide());

        this.overlay.querySelector(".talent-reset")?.addEventListener("click", async () => {
            const confirmed = await this.confirmModal.show({
                title: "Tem certeza?",
                message: "Resetar os talentos custa 100.000 de ouro. Os pontos voltam pro saldo e a vida e os atributos convertidos são devolvidos.",
                confirmLabel: "SIM",
                cancelLabel: "NÃO",
                yesClass: "continue-yes-success",
                noClass: "continue-no-danger"
            });
            if (!confirmed) return;
            const result = TalentService.reset(this.player);
            if (result.ok) SaveService.autoSave(this.player);
            else Toast.show(result.message);
            this.refresh();
        });

        this.overlay.querySelectorAll(".talent-card").forEach(card => {
            card.addEventListener("click", () => {
                this.selectedId = card.dataset.talent;
                this.refresh();
            });
        });

        this.overlay.querySelector(".talent-upgrade")?.addEventListener("click", () => {
            const result = TalentService.invest(this.player, this.selectedId);
            if (result.ok) {
                SaveService.autoSave(this.player);
            }
            this.refresh();
        });

    }

    canUpgradeSelected() {
        return !!this.selectedId && TalentService.canInvest(this.player, this.selectedId);
    }

    renderSelectedPrice() {
        if (!this.selectedId) return "—";
        const cost = TalentService.getUpgradeCost(this.player, this.selectedId);
        return cost === null ? "Máximo" : cost.toLocaleString("pt-BR");
    }

    refresh() {
        if (!this.overlay) return;
        this.render();
        this.registerEvents();
    }

    hide() {
        if (!this.overlay) return;
        this.overlay.remove();
        this.overlay = null;
    }

}
