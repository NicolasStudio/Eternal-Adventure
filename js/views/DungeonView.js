import DungeonCard from "./DungeonCard.js";
import dungeons from "../data/dungeons.js";
import DungeonTooltip from "./DungeonTooltip.js";
import DungeonSkipService from "../services/DungeonSkipService.js";
import DungeonSkipConfirmModal from "../ui/components/modals/DungeonSkipConfirmModal.js";
import DungeonSkipResultModal from "../ui/components/modals/DungeonSkipResultModal.js";

export default class DungeonView {
    constructor(game) {
        this.game = game;
        this.selectedDungeon = null;
        this.currentPage = 1;
        this.tooltip = new DungeonTooltip();
        this.skipConfirmModal = new DungeonSkipConfirmModal();
        this.skipResultModal = new DungeonSkipResultModal();
        this.skipping = false;
    }

    canEnterDungeon(requiredLevel) {
        return this.game.player.level >= requiredLevel;
    }

    get maxPage() {
        return Math.max(...dungeons.map(dungeon => dungeon.page));
    }

    nextPage() {
        if (this.currentPage >= this.maxPage) return;
        this.currentPage++;
        this.selectedDungeon = null;
    }

    previousPage() {
        if (this.currentPage <= 1) return;
        this.currentPage--;
        this.selectedDungeon = null;
    }

    render() {
        const player = this.game.player;
        const pageDungeons = dungeons
            .filter(dungeon => dungeon.page === this.currentPage)
            .map(dungeon => new DungeonCard(dungeon, player).render())
            .join("");
        return `
            <section class="dungeon-window">
                ${this.renderHeader()}
                <div class="dungeon-body">
                    <div class="dungeon-grid">
                        ${pageDungeons}
                    </div>
                    ${this.renderActions()}
                    ${this.renderFooter()}
                </div>
            </section>
        `;
    }

    renderHeader() {
        return `
            <header class="dungeon-header">
                <h2>Dungeons</h2>
                <button class="dungeon-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>
        `;
    }

    renderActions() {
        return `
            <div class="dungeon-actions">
                <button class="dungeon-enter" disabled>Entrar na Dungeon</button>
                <button class="dungeon-skip" disabled>
                    <i class="fa-solid fa-forward"></i>
                    Skip
                </button>
            </div>
        `;
    }

    renderFooter() {
        const firstPage = this.currentPage === 1;
        const lastPage = this.currentPage === this.maxPage;
        return `
            <footer class="dungeon-footer">
                <button class="dungeon-page dungeon-prev" ${firstPage ? "disabled" : ""}>
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button class="dungeon-page dungeon-next" ${lastPage ? "disabled" : ""}>
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </footer>
        `;
    }

    registerEvents(container) {
        container.querySelector(".dungeon-close")?.addEventListener("click", () => {
            this.game.hudScreen.changeView("");
        });
        const cards = container.querySelectorAll(".dungeon-card");
        const enterButton = container.querySelector(".dungeon-enter");
        const skipButton = container.querySelector(".dungeon-skip");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                cards.forEach(c => {
                    c.classList.remove("selected");
                });
                const requiredLevel = Number(card.dataset.level);
                const canEnter = this.canEnterDungeon(requiredLevel);
                card.classList.add("selected");
                const dungeon = dungeons.find(
                    dungeon => dungeon.id === card.dataset.id
                );

                this.selectedDungeon = dungeon;
                enterButton.classList.add("visible");
                if (canEnter) {
                    enterButton.disabled = false;
                    enterButton.textContent = this.selectedDungeon.boss
                        ? `Enfrentar ${this.selectedDungeon.name}`
                        : `Entrar em ${this.selectedDungeon.name}`;
                } else {
                    enterButton.disabled = true;
                    enterButton.textContent = `Necessário nível ${requiredLevel}`;
                }

                const canSkip = canEnter && this.game.player.canSkipDungeon(dungeon);
                skipButton.classList.toggle("visible", canSkip);
                skipButton.disabled = !canSkip;
            });
        });

        enterButton?.addEventListener("click", () => {

            if (!this.selectedDungeon) return;

            if (!this.canEnterDungeon(this.selectedDungeon.level)) return;

            const monster = {
                name: "Lobo Cinzento",
                currentHP: 120,
                maxHP: 120
            };

            this.game.hudScreen.enterCombat(
                monster,
                this.selectedDungeon
            );

        });

        skipButton?.addEventListener("click", () => {
            this.handleSkip();
        });

        container.querySelector(".dungeon-prev")?.addEventListener("click", () => {
            this.previousPage();
            this.game.hudScreen.changeView("dungeon");
        });
        container.querySelector(".dungeon-next")?.addEventListener("click", () => {
            this.nextPage();
            this.game.hudScreen.changeView("dungeon");
        });
        container.querySelectorAll(".dungeon-drop").forEach(drop => {
            drop.addEventListener("mouseenter", (e) => {
                const item = JSON.parse(drop.dataset.item.replace(/&apos;/g, "'"));
                this.tooltip.show(item, e.clientX, e.clientY);
            });
            drop.addEventListener("mousemove", (e) => {
                this.tooltip.move(e.clientX, e.clientY);
            });
            drop.addEventListener("mouseleave", () => {
                this.tooltip.hide();
            });
        });
    }

    async handleSkip() {

        if (this.skipping) return;

        const dungeon = this.selectedDungeon;

        if (!dungeon) return;

        if (!this.game.player.canSkipDungeon(dungeon)) return;

        const confirmed = await this.skipConfirmModal.show(dungeon);

        if (!confirmed) return;

        this.skipping = true;

        const result = DungeonSkipService.run(this.game.player, dungeon);

        this.game.hudScreen.refreshCurrentView();

        await this.skipResultModal.show(dungeon, result);

        this.skipping = false;

        this.game.hudScreen.changeView("dungeon");

    }

    refresh(container) {
        container.innerHTML = this.render();
        this.registerEvents(container);
    }
}