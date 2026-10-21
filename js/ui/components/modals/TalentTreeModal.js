import TalentService, {
    TALENTS, MAX_LEVEL, GAIN_PERCENT_PER_LEVEL, LIFE_LOSS_PERCENT_PER_LEVEL, TRADE_AMOUNT_PER_LEVEL,
    UNIQUE_TALENTS, UNIQUE_TALENT_COST, RESET_COST, UNIQUE_RESET_SURCHARGE
} from "../../../services/TalentService.js";
import SaveService from "../../../services/SaveService.js";
import AuthService from "../../../services/AuthService.js";
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

        const earned = TalentService.getEarnedPoints(this.player);
        const available = TalentService.getAvailablePoints(this.player);

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
                        ${TALENTS.filter(talent => talent.type !== "trade").map(talent => this.renderTalentCard(talent)).join("")}
                    </div>

                    <div class="talent-row">
                        ${TALENTS.filter(talent => talent.type === "trade").map(talent => this.renderTalentCard(talent)).join("")}
                    </div>

                    <div class="talent-divider">Talentos Únicos</div>

                    ${!TalentService.hasMaxedTalent(this.player) ? `
                        <p class="talent-unique-requirement">Deixe um talento simples acima em 3/3 pra desbloquear estes.</p>
                    ` : ""}

                    <div class="talent-row">
                        ${UNIQUE_TALENTS.map(talent => this.renderUniqueCard(talent)).join("")}
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
                        <button class="talent-reset talent-reset-selected" ${this.canResetSelected() ? "" : "disabled"}
                                title="Reseta só o talento selecionado">
                            <i class="fa-solid fa-rotate-left"></i>
                            Resetar
                        </button>
                        <button class="talent-reset talent-reset-all" ${(TalentService.getSpentPoints(this.player) > 0 || TalentService.getUniqueTalent(this.player)) ? "" : "disabled"}
                                title="Reseta todos os talentos, inclusive o único">
                            <i class="fa-solid fa-trash-arrow-up"></i>
                            Resetar tudo
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

    // Talento simples (3/3) — "life" (converte vida em atributo) ou
    // "trade" (troca um atributo fixo pelo outro, ver TalentService.js).
    // Mesmo card/grade pros dois tipos, só o texto da tooltip muda.
    renderTalentCard(talent) {

        const levels = TalentService.getLevels(this.player);
        const applied = this.player.talentApplied ?? {};
        const level = levels[talent.id] ?? 0;
        const canInvest = TalentService.canInvest(this.player, talent.id);
        const isTrade = talent.type === "trade";

        const effectLine = isTrade
            ? `Cada nível: ${talent.fromLabel} −${TRADE_AMOUNT_PER_LEVEL}, ${talent.toLabel} +${TRADE_AMOUNT_PER_LEVEL}.`
            : `Cada nível: +${GAIN_PERCENT_PER_LEVEL}% da vida máxima em ${talent.label} e −${LIFE_LOSS_PERCENT_PER_LEVEL}% da vida máxima.`;

        const progressLine = level === 0
            ? "Ainda não investido."
            : isTrade
                ? `Nível ${level}/${MAX_LEVEL}: ${talent.fromLabel} −${level * TRADE_AMOUNT_PER_LEVEL}, ${talent.toLabel} +${level * TRADE_AMOUNT_PER_LEVEL}.`
                : `Nível ${level}/${MAX_LEVEL}: +${level * GAIN_PERCENT_PER_LEVEL}% → +${applied[talent.id] ?? 0} de ${talent.label}. Vida máxima: −${level * LIFE_LOSS_PERCENT_PER_LEVEL}% (−${TalentService.lifeLostFor(this.player, talent.id)}).`;

        return `
            <div class="talent-item">
            <button class="talent-card ${this.selectedId === talent.id ? "selected" : ""} ${level >= MAX_LEVEL ? "maxed" : ""}"
                    data-talent="${talent.id}">
                <img class="talent-icon" src="${talent.icon}" alt="${talent.label}">
                <div class="talent-tooltip">
                    <strong>${TalentService.describe(talent)}</strong>
                    <p>${effectLine}</p>
                    <p class="talent-tooltip-effect">${progressLine}</p>
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

    }

    // Talento único: 1/1, sem acúmulo. Só existe "Rompendo Limites" hoje
    // (ver UNIQUE_TALENTS — "Cara ou Coroa?" e "Rei dos Encantamentos"
    // saíram do jogo), mas o map() em cima continua genérico, então a
    // lógica de bloqueio ("lockedByOther") permanece caso outro único
    // seja adicionado de novo no futuro.
    renderUniqueCard(talent) {

        const active = TalentService.hasUniqueTalent(this.player, talent.id);
        const lockedByOther = !!TalentService.getUniqueTalent(this.player) && !active;
        const canInvest = TalentService.canInvestUnique(this.player, talent.id);

        const effect = active ? "Ativo." : "Ainda não escolhido.";

        const hint = active
            ? "Talento ativo."
            : lockedByOther
                ? "Só um talento único por vez — resete pra trocar."
                : !TalentService.hasMaxedTalent(this.player)
                    ? "Deixe um talento simples em 3/3 antes de escolher este."
                    : canInvest
                        ? "Clique pra selecionar e depois em Melhorar."
                        : "Ouro insuficiente.";

        return `
            <div class="talent-item">
            <button class="talent-card ${this.selectedId === talent.id ? "selected" : ""} ${active ? "maxed" : ""}"
                    data-talent="${talent.id}">
                <img class="talent-icon" src="${talent.icon}" alt="${talent.label}">
                <div class="talent-tooltip">
                    <strong>${talent.label}</strong>
                    <p>${talent.description}</p>
                    <p class="talent-tooltip-effect">${effect}</p>
                    <p class="talent-tooltip-hint">${hint}</p>
                </div>
            </button>
            <span class="talent-progress">${active ? "1" : "0"}/1</span>
            </div>
        `;

    }

    isUniqueSelected() {
        return UNIQUE_TALENTS.some(talent => talent.id === this.selectedId);
    }

    registerEvents() {

        this.overlay.querySelector(".talent-close").addEventListener("click", () => this.hide());

        this.overlay.querySelector(".talent-reset-selected")?.addEventListener("click", () => this.resetSelected());

        this.overlay.querySelector(".talent-reset-all")?.addEventListener("click", async () => {
            const cost = TalentService.getResetCost(this.player);
            const uniqueId = TalentService.getUniqueTalent(this.player);
            const willRevertLevel = uniqueId === "rompendo_limites" && this.player.level > 100;
            const willRevertEnchants = uniqueId === "rei_dos_encantamentos";
            const message = uniqueId
                ? `Resetar custa ${cost.toLocaleString("pt-BR")} de ouro (100.000 dos talentos simples + 500.000 por ter um talento único ativo). Os pontos voltam pro saldo, a vida e os atributos convertidos são devolvidos, e o talento único é desfeito.`
                    + (willRevertLevel ? ` Seu nível também volta pra 100, desfazendo os status ganhos nos níveis acima disso.` : "")
                    + (willRevertEnchants ? ` Os encantamentos do Anel também somem — as pedras usadas não voltam.` : "")
                : `Resetar os talentos custa ${cost.toLocaleString("pt-BR")} de ouro. Os pontos voltam pro saldo e a vida e os atributos convertidos são devolvidos.`;
            const confirmed = await this.confirmModal.show({
                title: "Tem certeza?",
                message,
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

        this.overlay.querySelector(".talent-upgrade")?.addEventListener("click", async () => {

            const wasUnique = this.isUniqueSelected();

            const result = wasUnique
                ? TalentService.investUnique(this.player, this.selectedId)
                : TalentService.invest(this.player, this.selectedId);

            if (!result.ok) {
                if (result.message) Toast.show(result.message);
                this.refresh();
                return;
            }

            this.refresh();

            if (!wasUnique) {
                SaveService.autoSave(this.player);
                return;
            }

            // Talento único muda regra importante (ex: nível máximo com
            // Rompendo Limites) — autoSave normal é "dispara e esquece",
            // então sem confirmar aqui o jogador podia continuar jogando
            // (inclusive subindo de nível) achando que salvou, e perder
            // tudo se trocasse de aparelho ou limpasse os dados antes de
            // qualquer save realmente chegar na nuvem (foi exatamente
            // isso que já aconteceu com jogadores reais).
            const synced = await this.confirmCloudSync();

            if (!synced) {
                Toast.show(
                    "Talento salvo só neste navegador — a nuvem não confirmou. Não troque de aparelho nem limpe os dados até conseguir salvar de novo (ícone de disquete no topo).",
                    8000
                );
            }

        });

    }

    // Espera o autoSave terminar e devolve se a nuvem confirmou (true).
    // Sem conta logada não existe nuvem pra confirmar — só o
    // localStorage importa nesse caso, então conta como "seguro".
    async confirmCloudSync() {

        if (!AuthService.getCurrentUser()) return true;

        const result = await SaveService.autoSave(this.player);

        return Array.isArray(result) && result[0] === true;

    }

    // "Resetar" (sem ser o "Resetar tudo") só age no talento selecionado:
    // um simples com pelo menos 1 ponto, ou o único se ele estiver ativo.
    canResetSelected() {
        if (!this.selectedId) return false;
        if (this.isUniqueSelected()) return TalentService.hasUniqueTalent(this.player, this.selectedId);
        return (TalentService.getLevels(this.player)[this.selectedId] ?? 0) > 0;
    }

    async resetSelected() {

        if (!this.canResetSelected()) return;

        const uniqueSelected = this.isUniqueSelected();
        const talent = (uniqueSelected ? UNIQUE_TALENTS : TALENTS).find(t => t.id === this.selectedId);
        const name = uniqueSelected ? talent.label : TalentService.describe(talent);
        const uniqueId = TalentService.getUniqueTalent(this.player);
        const levelWarning = uniqueId === "rompendo_limites" && this.player.level > 100
            ? " Seu nível também volta pra 100, desfazendo os status ganhos nos níveis acima disso."
            : "";

        let message;

        if (uniqueSelected) {
            message = `Resetar "${name}" custa ${UNIQUE_RESET_SURCHARGE.toLocaleString("pt-BR")} de ouro. Os outros talentos continuam como estão.${levelWarning}`;
        } else {
            const removesUnique = TalentService.resetRemovesUnique(this.player, this.selectedId);
            const uniqueLabel = UNIQUE_TALENTS.find(t => t.id === uniqueId)?.label ?? "talento único";
            message = `Resetar "${name}" custa ${RESET_COST.toLocaleString("pt-BR")} de ouro. Os pontos dele voltam pro saldo e os atributos convertidos são devolvidos; os outros talentos continuam como estão.`
                + (removesUnique
                    ? ` Atenção: ele é seu único talento em 3/3, que é pré-requisito do "${uniqueLabel}" — o talento único também será desfeito.${levelWarning}`
                    : "");
        }

        const confirmed = await this.confirmModal.show({
            title: "Tem certeza?",
            message,
            confirmLabel: "SIM",
            cancelLabel: "NÃO",
            yesClass: "continue-yes-success",
            noClass: "continue-no-danger"
        });

        if (!confirmed) return;

        const result = uniqueSelected
            ? TalentService.resetUnique(this.player)
            : TalentService.resetTalent(this.player, this.selectedId);

        if (result.ok) SaveService.autoSave(this.player);
        else Toast.show(result.message);

        this.refresh();

    }

    canUpgradeSelected() {
        if (!this.selectedId) return false;
        return this.isUniqueSelected()
            ? TalentService.canInvestUnique(this.player, this.selectedId)
            : TalentService.canInvest(this.player, this.selectedId);
    }

    renderSelectedPrice() {
        if (!this.selectedId) return "—";
        if (this.isUniqueSelected()) {
            return TalentService.hasUniqueTalent(this.player, this.selectedId)
                ? "Ativo"
                : UNIQUE_TALENT_COST.toLocaleString("pt-BR");
        }
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
