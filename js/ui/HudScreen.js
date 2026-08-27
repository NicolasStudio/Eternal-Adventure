import CharacterView from "../views/CharacterView.js";
import DungeonView from "../views/DungeonView.js";
import PvpView from "../views/PvpView.js";
import PvpLobbyService from "../services/PvpLobbyService.js";
import RaidView from "../views/RaidView.js";
import RaidLobbyService from "../services/RaidLobbyService.js";
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
import BlacksmithEnchant from "./../city/BlacksmithEnchant.js";
import ChestHUD from "./components/ChestHUD.js";
import ChestRewardModal from "./components/modals/ChestRewardModal.js";
import AlbumModal from "./components/modals/AlbumModal.js";
import LoadGameModal from "./components/modals/LoadGameModal.js";
import SettingsModal from "./components/modals/SettingsModal.js";
import MusicService from "../services/MusicService.js";
import SaveService from "../services/SaveService.js";
import AchievementModal from "./components/modals/AchievementModal.js";
import AchievementService from "../services/AchievementService.js";
import AchievementToast from "./components/AchievementToast.js";

export default class HudScreen {
    constructor(game) {
        this.game = game;
        this.element = document.getElementById("hud-screen");
        this.marketViewBuy = new MarketViewBuy(this.game);
        this.characterView = new CharacterView(game);
        this.dungeonView = new DungeonView(game);
        this.pvpView = new PvpView(game);
        this.raidView = new RaidView(game);
        this.combatView = new CombatView(game);
        this.cityView = new CityView(game);
        this.marketView = new MarketView(game);
        this.blacksmithWeapon = new BlacksmithWeapon(this.game);
        this.blacksmithArmor = new BlacksmithArmor(this.game);
        this.blacksmithEnchant = new BlacksmithEnchant(this.game);
        this.playerHUD = new PlayerHUD(game);
        this.monsterHUD = new MonsterHUD(game);
        this.toolbarHUD = new ToolbarHUD(game);
        this.dungeonHeader = new DungeonHeader(game);
        this.chestHUD = new ChestHUD(game);
        this.chestRewardModal = new ChestRewardModal();
        this.albumModal = new AlbumModal(game);
        this.achievementModal = new AchievementModal(game);
        this.loadGameModal = new LoadGameModal(game);
        this.settingsModal = new SettingsModal(game, { inGame: true });
        this.currentView = "";
        this.characterVisible = true;
        this.inCombat = false;
        this.inPvpCombat = false;
        this.inRaidCombat = false;
        this.currentMonster = null;
        this.backgroundImage = "";
        this.preparationMode = false;
        this.onPreparationFinished = null;
    }

    render() {
        // render() reconstrói a tela inteira via innerHTML — inclusive
        // quando disparado sem nenhuma ação do jogador (ex: tick de
        // regeneração de vida a cada 2min, ver HealthSystem). Se o mouse
        // estiver em cima de um item nesse momento, o slot morre sem
        // disparar mouseleave, e a tooltip (anexada direto no body, fora
        // do #hud-screen) sobrevive órfã — presa na tela até o próximo
        // clique. Como toda reconstrução do HUD passa por aqui, esse é o
        // único lugar que precisa dessa limpeza pra cobrir todos os casos.
        document.getElementById("item-tooltip")?.remove();
        document.getElementById("item-tooltip-compare")?.remove();
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
        const anyCombat = this.inCombat || this.inPvpCombat || this.inRaidCombat;
        const isPvp2v2 = this.inPvpCombat && this.pvpView.mode === "2v2";
        const headerModeClass = isPvp2v2 ? "pvp2v2" : (anyCombat ? "combat" : "exploration");
        return `
            <header class="hud-header ${headerModeClass}">
                <div class="hud-left-column">
                    ${!this.inRaidCombat ? this.playerHUD.render() : ""}
                    ${!anyCombat ? this.chestHUD.render() : ""}
                </div>
                ${this.inCombat ? this.dungeonHeader.render(this.combatView.currentDungeon, this.combatView.currentFloor) : ""}
                ${this.inPvpCombat ? this.pvpView.renderArenaHeader() : ""}
                ${this.renderRightPanel()}
            </header>
        `;
    }

    renderRightPanel() {
        if (this.inCombat) return this.monsterHUD.render(this.combatView.currentMonster);
        if (this.inPvpCombat && this.pvpView.mode !== "2v2") return this.monsterHUD.render(this.pvpView.opponentAsMonster());
        if (this.inPvpCombat) return "";
        if (this.inRaidCombat) return "";
        return this.toolbarHUD.render();
    }

    updateHUD() {
        this.playerHUD.update();
        if (this.inCombat || this.inPvpCombat) {
            this.monsterHUD.update?.();
        }
        if (this.currentView === "character") {
            this.refreshCurrentView();
        }
        this.checkAchievements();
    }

    // updateHUD() já roda depois de TODA mutação relevante do player
    // (é o listener ligado em notify() — ver ClassSelectionScreen.js e
    // SaveService.applyLoadedData), então esse é o único lugar que
    // precisa chamar AchievementService.evaluate(): nunca precisa ficar
    // caçando cada ação que poderia destravar uma conquista.
    checkAchievements() {

        const newlyUnlocked = AchievementService.evaluate(this.game.player);

        newlyUnlocked.forEach(achievement => AchievementToast.show(achievement));

        if (newlyUnlocked.length && this.achievementModal.isOpen) {
            this.achievementModal.refresh();
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

            case "pvp":
                return this.pvpView.render();

            case "coop":
                return this.raidView.render();

            case "market":
                return this.marketView.render();

            case "market-buy":
                return this.marketViewBuy.render();

            case "blacksmith-weapon":
                return this.blacksmithWeapon.render();

            case "blacksmith-armor":
                return this.blacksmithArmor.render();

            case "blacksmith-enchant":
                return this.blacksmithEnchant.render();

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
        const anyLockedCombat = (this.inCombat && !this.preparationMode) || this.inPvpCombat || this.inRaidCombat;
        const characterDisabled = anyLockedCombat;
        // Vida crítica (<=5%) trava Dungeons/PVP/Cooperativo — entrar em
        // combate quase morto é praticamente uma derrota garantida, então
        // barramos antes mesmo de abrir o menu (Personagem continua
        // liberado, é de lá que o jogador acessa a enfermaria/poções).
        const lowHealth = this.game.player.health.getHpPercent() <= 5;
        const lowHealthTitle = "Sua vida está a baixo de 5%, vá a enfermaria ou use poções";
        const dungeonDisabled = this.inCombat || this.preparationMode || this.inPvpCombat || this.inRaidCombat || lowHealth;
        const cityDisabled = this.inCombat || this.preparationMode || this.inPvpCombat || this.inRaidCombat;
        const pvpDisabled = this.inCombat || this.preparationMode || this.inPvpCombat || this.inRaidCombat || lowHealth;
        // Cooperativo só libera a partir do nível 100 — trava separada
        // do bloqueio por combate, pra poder mostrar uma mensagem
        // diferente pro jogador quando ele clicar.
        const coopLevelLocked = this.game.player.level < 100;
        const coopDisabled = this.inCombat || this.preparationMode || this.inPvpCombat || this.inRaidCombat || coopLevelLocked || lowHealth;
        return `
            <nav class="hud-navigation">
                <button class="nav-item ${this.currentView === "character" ? "active" : ""} ${characterDisabled ? "disabled" : ""}" data-view="character">
                    <span class="material-symbols-outlined">person</span>
                    <span>Personagem</span>
                </button>
                <button class="nav-item ${this.currentView === "dungeon" ? "active" : ""} ${dungeonDisabled ? "disabled" : ""}" data-view="dungeon" data-low-health="${lowHealth}" title="${lowHealth ? lowHealthTitle : ""}">
                    <span class="material-symbols-outlined">castle</span>
                    <span>Dungeons</span>
                </button>
                <button class="nav-item ${this.currentView === "city" ? "active" : ""} ${cityDisabled ? "disabled" : ""}" data-view="city">
                    <span class="material-symbols-outlined">location_city</span>
                    <span>Cidade</span>
                </button>
                <button class="nav-item ${this.currentView === "pvp" ? "active" : ""} ${pvpDisabled ? "disabled" : ""}" data-view="pvp" data-low-health="${lowHealth}" title="${lowHealth ? lowHealthTitle : ""}">
                    <span class="material-symbols-outlined">swords</span>
                    <span>PVP</span>
                </button>
                <button class="nav-item ${this.currentView === "coop" ? "active" : ""} ${coopDisabled ? "disabled" : ""}" data-view="coop" data-level-locked="${coopLevelLocked}" data-low-health="${lowHealth}" title="${coopLevelLocked ? "Requer nível 100" : (lowHealth ? lowHealthTitle : "")}">
                    <span class="material-symbols-outlined">${coopLevelLocked ? "lock" : "groups"}</span>
                    <span>Cooperativo</span>
                </button>
            </nav>
        `;
    }

    registerEvents() {

        // Blindagem: se por algum motivo uma tooltip flutuante ficou
        // "presa" na tela (não recebeu o mouseleave corretamente),
        // encostar na barra de navegação/ferramentas já força ela a
        // fechar, antes mesmo do clique.
        const forceCloseStaleTooltip = () => {
            document.getElementById("item-tooltip")?.remove();
        };
        this.element.querySelector(".hud-navigation")?.addEventListener("mouseenter", forceCloseStaleTooltip);
        this.element.querySelector(".hud-toolbar")?.addEventListener("mouseenter", forceCloseStaleTooltip);

        this.element.querySelector("#btn-conquistas")?.addEventListener("click", () => {
            this.achievementModal.show();
        });

        this.element.querySelector("#btn-album")?.addEventListener("click", () => {
            this.albumModal.show();
        });
        this.element.querySelectorAll(".nav-item").forEach(button => {
            button.addEventListener("click", () => {
                // Cada botão já sabe se está desabilitado (calculado em
                // renderNavigation, é a mesma fonte usada pro visual) —
                // checar isso aqui, em vez de uma condição genérica
                // única, evita que o "modo preparação" (que libera só
                // o Personagem) deixe passar cliques em Dungeons,
                // Cidade ou PVP também.
                if (button.classList.contains("disabled")) {
                    if (button.dataset.levelLocked === "true") {
                        Toast.show("Modo Cooperativo disponível apenas a partir do nível 100.");
                    } else if (button.dataset.lowHealth === "true") {
                        Toast.show("Sua vida está a baixo de 5%, vá a enfermaria ou use poções.");
                    } else {
                        Toast.show("Você não pode trocar de tela durante um combate.");
                    }
                    return;
                }
                const view = button.dataset.view;
                // Clicar de novo no menu já ativo fecha/minimiza ele.
                this.changeView(this.currentView === view ? "" : view);
            });
        });
    }

    changeView(view) {

        // Sair da Cidade (por qualquer caminho: X, menu de navegação, etc)
        // com a enfermaria aberta não pode deixar ela "presa" na tela.
        if (this.currentView === "city" && view !== "city") {
            this.cityView.hospitalModal?.hide();
        }

        // Sair de qualquer tela da Ferraria sem confirmar a melhoria/
        // encantamento devolve o item pro inventário (nada fica "preso"
        // no slot se o jogador fechar a aba no meio do caminho).
        if (this.currentView !== view) {
            if (this.currentView === "blacksmith-weapon") this.blacksmithWeapon.anvilWeapon = null;
            if (this.currentView === "blacksmith-armor") this.blacksmithArmor.anvilItem = null;
            if (this.currentView === "blacksmith-enchant") {
                this.blacksmithEnchant.anvilWeapon = null;
                this.blacksmithEnchant.anvilStone = null;
            }
        }

        // Sair da tela de PVP por qualquer caminho (X, menu de
        // navegação) sempre volta pra pergunta de modo na próxima vez
        // que abrir — e sai da fila de espera do Firebase se estava
        // procurando partida, pra não deixar "fantasma" pra trás.
        if (this.currentView === "pvp" && view !== "pvp") {
            if (this.pvpView.state === "searching") {
                PvpLobbyService.leaveQueue();
            }
            this.pvpView.state = "mode";
            this.pvpView.mode = null;
            this.pvpView.matchData = null;
            this.pvpView.combatResult = null;
            this.pvpView.chosenBossDungeon = null;
            this.pvpView.opponentHP = null;
            this.inPvpCombat = false;
            this.setBackground("assets/img/backgrounds/tela_inicial.png");
        }

        // Entrar na tela do PVP troca o fundo pra arena_pvp.png — sai
        // dela (bloco acima) já restaura o tela_inicial.png.
        if (this.currentView !== "pvp" && view === "pvp") {
            this.setBackground("assets/img/backgrounds/arena_pvp.png");
        }

        // Mesma lógica do bloco de PVP acima, só que pro Cooperativo
        // (Raid) — sai da fila do Firebase se estava procurando e some
        // com qualquer resquício de partida ao fechar a tela.
        if (this.currentView === "coop" && view !== "coop") {
            if (this.raidView.state === "searching") {
                RaidLobbyService.leaveQueue();
            }
            this.raidView.state = "idle";
            this.raidView.matchData = null;
            this.raidView.matchId = null;
            this.raidView.combatResult = null;
            this.raidView.bossData = null;
            this.raidView.bossCombatant = null;
            this.raidView.bossHP = null;
            this.raidView.bossMaxHP = null;
            this.inRaidCombat = false;
            this.setBackground("assets/img/backgrounds/tela_inicial.png");
        }

        if (this.currentView !== "coop" && view === "coop") {
            this.setBackground("assets/img/backgrounds/arena_pvp.png");
        }

        this.currentView = view;
        this.refreshCurrentView();
        this.updateMusic();
    }

    // Decide qual música ambiente deve estar tocando pra tela atual.
    // "character" (personagem/inventário) nunca troca a faixa — só
    // continua o que já estava tocando antes de abrir.
    updateMusic() {

        if (this.inCombat || this.inPvpCombat || this.inRaidCombat) {
            MusicService.play("combat");
            return;
        }

        switch (this.currentView) {

            case "dungeon":
                MusicService.play("dungeonMenu");
                break;

            case "city":
            case "pvp":
            case "coop":
            case "market":
            case "market-buy":
            case "blacksmith-weapon":
            case "blacksmith-armor":
            case "blacksmith-enchant":
                MusicService.play("city");
                break;

            case "character":
                // continua a música da tela de onde o personagem foi aberto
                break;

            default:
                MusicService.play("home");
                break;

        }

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
                this.dungeonView.maybeShowSoulChoice();
                break;
            case "city":
                this.cityView.registerEvents(document);
                break;
            case "pvp":
                this.pvpView.registerEvents(document);
                break;
            case "coop":
                this.raidView.registerEvents(document);
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
            case "blacksmith-enchant":
                this.blacksmithEnchant.registerEvents(document);
                break;

        }
    }

    async enterCombat(monster, dungeon) {
        this.inCombat = true;
        this.setBackground(dungeon.background);
        this.updateMusic();
        await this.combatView.enter(dungeon);
    }

    exitCombat() {
        this.inCombat = false;
        this.currentMonster = null;
        this.combatView.exit();
        this.currentView = "";
        this.setBackground("assets/img/backgrounds/tela_inicial.png");
        this.refreshCurrentView();
        this.updateMusic();
        SaveService.autoSave(this.game.player);
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
        this.updateMusic();
        switch (this.currentView) {
            case "character":
                this.characterView.registerEvents(document);
                break;
            case "dungeon":
                this.dungeonView.registerEvents(document);
                this.dungeonView.maybeShowSoulChoice();
                break;
            case "city":
                this.cityView.registerEvents(document);
                break;
            case "pvp":
                this.pvpView.registerEvents(document);
                break;
            case "coop":
                this.raidView.registerEvents(document);
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
            case "blacksmith-enchant":
                this.blacksmithEnchant.registerEvents(document);
                break;
        }
        this.element.classList.remove("hidden");

        // Roda uma vez logo ao entrar (carregar save ou começar do
        // zero) — sem isso, uma correção como a do "O FIM?" (ver
        // AchievementService) só se aplicava na PRÓXIMA ação que
        // disparasse notify(), então quem abrisse o modal de Conquistas
        // antes de fazer qualquer outra coisa ainda via o estado velho.
        this.checkAchievements();
    }

    hide() {
        this.element.classList.add("hidden");
    }
}