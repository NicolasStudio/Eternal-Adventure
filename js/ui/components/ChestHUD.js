import ChestService from "../../services/ChestService.js";
import Toast from "./Toast.js";

const SPRITE_CLOSED = "assets/img/assets/sprite-bau/bau-1.png";
const SPRITE_OPENING = "assets/img/assets/sprite-bau/bau-2.png";
const SPRITE_OPEN = "assets/img/assets/sprite-bau/bau-3.png";

export default class ChestHUD {

    constructor(game) {
        this.game = game;
        this.opening = false;
        this.interval = null;
    }

    get player() {
        return this.game.player;
    }

    render() {

        if (ChestService.getDiscoveredCount(this.player) >= ChestService.getTotalCards()) {
            return "";
        }

        const ready = ChestService.isReady(this.player);

        return `
            <div class="chest-hud">
                <img
                    class="chest-sprite ${ready && !this.opening ? "ready" : ""}"
                    id="chest-sprite"
                    src="${SPRITE_CLOSED}"
                    alt="Baú"
                >
                <span class="chest-timer" id="chest-timer">
                    ${ready ? "Disponível!" : ChestService.formatRemaining(this.player)}
                </span>
            </div>
        `;

    }

    registerEvents(container = document) {

        const sprite = container.querySelector("#chest-sprite");

        if (!sprite) return;

        sprite.addEventListener("click", () => this.tryOpen());

        this.startTicking();

    }

    startTicking() {

        clearInterval(this.interval);

        this.interval = setInterval(() => this.tick(), 1000);

    }

    tick() {

        if (this.opening) return;

        const timer = document.getElementById("chest-timer");
        const sprite = document.getElementById("chest-sprite");

        if (!timer || !sprite) {
            clearInterval(this.interval);
            return;
        }

        const ready = ChestService.isReady(this.player);

        timer.textContent = ready ? "Disponível!" : ChestService.formatRemaining(this.player);

        sprite.classList.toggle("ready", ready);

    }

    async tryOpen() {

        if (this.opening) return;

        if (!ChestService.isReady(this.player)) {
            Toast.show("O baú ainda não está pronto.");
            return;
        }

        this.opening = true;

        const sprite = document.getElementById("chest-sprite");

        sprite?.classList.remove("ready");

        if (sprite) sprite.src = SPRITE_OPENING;
        await this.sleep(350);

        if (sprite) sprite.src = SPRITE_OPEN;
        await this.sleep(350);

        const alreadyComplete = ChestService.getDiscoveredCount(this.player) >= ChestService.getTotalCards();

        const card = ChestService.open(this.player);

        if (alreadyComplete) {
            Toast.show("Você já possui todas as cartas!");
        } else {
            await this.game.hudScreen.chestRewardModal.show(card);
        }

        const freshSprite = document.getElementById("chest-sprite");
        if (freshSprite) freshSprite.src = SPRITE_CLOSED;

        this.opening = false;

        this.tick();

    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}
