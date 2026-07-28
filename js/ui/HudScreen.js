import CharacterView from "../views/CharacterView.js";
import DungeonView from "../views/DungeonView.js";
import CombatView from "../views/CombatView.js";
import CityView from "../views/CityView.js";
import PlayerHUD from "./components/PlayerHUD.js";
import MonsterHUD from "./components/MonsterHUD.js";
import DungeonHeader from "./components/DungeonHeader.js";
import ToolbarHUD from "../services/ToolbarHUD.js";
import Toast from "../ui/components/Toast.js";
import MarketView from "../views/MarketView.js";
import MarketViewBuy from "./components/modals/MarketViewBuy.js";
import BlacksmithWeapon from "./../city/BlacksmithWeapon.js";
import BlacksmithArmor from "./../city/BlacksmithArmor.js";
import ChestHUD from "./components/ChestHUD.js";
import ChestRewardModal from "./components/modals/ChestRewardModal.js";
import AlbumModal from "./components/modals/AlbumModal.js";
import LoadGameModal from "./components/modals/LoadGameModal.js";
import SettingsModal from "./components/modals/SettingsModal.js";

export default class HudScreen {
    constructor(game) {
        this.game = game;
        this.element = document.getElementById("hud-screen");
        this.marketViewBuy = new MarketViewBuy(this.game);
        this.characterView = new CharacterView(game);
        this.dungeonView = new DungeonView(game);
        this.combatView = new CombatView(game);
        this.cityView = new CityView(game);
        this.marketView = new MarketView(game);
        this.blacksmithWeapon = new BlacksmithWeapon(this.game);
        this.blacksmithArmor = new BlacksmithArmor(this.game);
        this.playerHUD = new PlayerHUD(game);
        this.monsterHUD = new MonsterHUD(game);
        this.toolbarHUD = new ToolbarHUD(game);
        this.dungeonHeader = new DungeonHeader(game);
        this.chestHUD = new ChestHUD(game);
        this.chestRewardModal = new ChestRewardModal();
        this.albumModal = new AlbumModal(game);
        this.loadGameModal = new LoadGameModal(game);
        this.settingsModal = new SettingsModal(game);
        this.currentView = "";
        this.characterVisible = true;
        this.inCombat = false;
        this.currentMonster = null;
        this.backgroundImage = "";
        this.preparationMode = false;
        this.onPreparationFinished = null;
    }

    render() {
        this.element.innerHTML = `
            <div class="hud-background" style="background-image:url('${this.backgroundImage ?? ""}')"></div>
            ${this.renderHeader()}
            ${this.renderContent()}
            ${this.renderNavigation()}
        `;
    }

    setBackground(image) {
        this.backgroundImage = image;
        const background = this.element.querySelector(".hud-background");
        if (background) {
            background.style.backgroundImage = `url("${image}")`;
        }
    }

    renderHeader() {
        return `
            <header class="hud-header ${this.inCombat ? "combat" : "exploration"}">
                <div class="hud-left-column">
                    ${this.playerHUD.render()}
                    ${!this.inCombat ? this.chestHUD.render() : ""}
                </div>
                ${this.inCombat ? this.dungeonHeader.render(this.combatView.currentDungeon, this.combatView.currentFloor) : ""}
                ${this.renderRightPanel()}
            </header>
        `;
    }

    renderRightPanel() {
        return this.inCombat ? this.monsterHUD.render(this.combatView.currentMonster) : this.toolbarHUD.render();
    }

    updateHUD() {
        this.playerHUD.update();
        if (this.inCombat) {
            this.monsterHUD.update?.();
        }
        if (this.currentView === "character") {
            this.refreshCurrentView();
        }
    }

    renderContent() {

        if (!this.characterVisible) return "";

        switch (this.currentView) {

            case "character":
                return this.characterView.render();

            case "dungeon":
                return this.inCombat
                    ? this.combatView.render()
                    : this.dungeonView.render();
            case "city":
                return this.cityView.render();

            case "market":
                return this.marketView.render();

            case "market-buy":
                return this.marketViewBuy.render();

            case "blacksmith-weapon":
                return this.blacksmithWeapon.render();

            case "blacksmith-armor":
                return this.blacksmithArmor.render();

            default:
                return "";
        }

    }

    enterPreparationMode() {
        this.preparationMode = true;
        this.currentView = "character";
        this.refreshCurrentView();
    }

    exitPreparationMode() {
        this.preparationMode = false;
    }

    renderNavigation() {
        const characterDisabled = this.inCombat && !this.preparationMode;
        const dungeonDisabled = this.inCombat || this.preparationMode;
        const cityDisabled = this.inCombat || this.preparationMode;
        return `
            <nav class="hud-navigation">
                <button class="nav-item ${this.currentView === "character" ? "active" : ""} ${characterDisabled ? "disabled" : ""}" data-view="character">
                    <i class="fa-solid fa-user"></i>
                    <span>Personagem</span>
                </button>
                <button class="nav-item ${this.currentView === "dungeon" ? "active" : ""} ${dungeonDisabled ? "disabled" : ""}" data-view="dungeon">
                    <i class="fa-solid fa-book-atlas"></i>
                    <span>Dungeons</span>
                </button>
                <button class="nav-item ${this.currentView === "city" ? "active" : ""} ${cityDisabled ? "disabled" : ""}" data-view="city">
                    <i class="fa-solid fa-city"></i>
                    <span>Cidade</span>
                </button>
                <button class="nav-item">
                    <i class="fa-solid fa-hourglass-half"></i>
                    <span>Em breve</span>
                </button>
            </nav>
        `;
    }

    registerEvents() {
        this.element.querySelector("#btn-album")?.addEventListener("click", () => {
            this.albumModal.show();
        });
        this.element.querySelectorAll(".nav-item").forEach(button => {
            button.addEventListener("click", () => {
                if (this.inCombat && !this.preparationMode) {
                    Toast.show("Você não pode trocar de tela durante um combate.");
                    return;
                }
                this.changeView(button.dataset.view);
            });
        });
    }

    changeView(view) {
        this.currentView = view;
        this.refreshCurrentView();
    }

    refreshCurrentView() {
        this.render();
        this.toolbarHUD.registerEvents(this.element);
        if (!this.inCombat) this.chestHUD.registerEvents(this.element);
        this.registerEvents();
        switch (this.currentView) {
            case "character":
                this.characterView.registerEvents(document);
                break;
            case "dungeon":
                this.dungeonView.registerEvents(document);
                break;
            case "city":
                this.cityView.registerEvents(document);
                break;
            case "market":
                this.marketView.registerEvents(document);
                break;
            case "market-buy":
                this.marketViewBuy.registerEvents(document);
                break;
            case "blacksmith-weapon":
                this.blacksmithWeapon.registerEvents(document);
                break;
            case "blacksmith-armor":
                this.blacksmithArmor.registerEvents(document);
                break;

        }
    }

    async enterCombat(monster, dungeon) {
        this.inCombat = true;
        this.setBackground(dungeon.background);
        await this.combatView.enter(dungeon);
    }

    exitCombat() {
        this.inCombat = false;
        this.currentMonster = null;
        this.combatView.exit();
        this.currentView = "";
        this.setBackground("assets/img/backgrounds/tela_inicial.png");
        this.refreshCurrentView();
    }

    showCharacter() {
        if (this.characterVisible) return;
        this.characterVisible = true;
        this.refreshCurrentView();
    }

    async hideCharacter() {
        if (!this.characterVisible) return;
        this.characterVisible = false;
        if (this.preparationMode) {
            this.exitPreparationMode();
            this.currentView = "dungeon";
            this.refreshCurrentView();
            if (this.onPreparationFinished) {
                const resolve = this.onPreparationFinished;
                this.onPreparationFinished = null;
                resolve();
            }
            return;
        }
        this.refreshCurrentView();
    }

    show() {
        this.setBackground("assets/img/backgrounds/tela_inicial.png");
        this.render();
        this.toolbarHUD.registerEvents(this.element);
        if (!this.inCombat) this.chestHUD.registerEvents(this.element);
        this.registerEvents();
        switch (this.currentView) {
            case "character":
                this.characterView.registerEvents(document);
                break;
            case "dungeon":
                this.dungeonView.registerEvents(document);
                break;
            case "city":
                this.cityView.registerEvents(document);
                break;
            case "market":
                this.marketView.registerEvents(document);
                break;
            case "market-buy":
                this.marketViewBuy.registerEvents(document);
                break;
            case "blacksmith-weapon":
                this.blacksmithWeapon.registerEvents(document);
                break;
            case "blacksmith-armor":
                this.blacksmithArmor.registerEvents(document);
                break;
        }
        this.element.classList.remove("hidden");
    }

    hide() {
        this.element.classList.add("hidden");
    }
}