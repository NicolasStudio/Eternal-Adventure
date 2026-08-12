import Toast from "../ui/components/Toast.js";
import HospitalModal from "../ui/components/modals/HospitalModal.js";
import SaveService from "../services/SaveService.js";

export default class CityView {

    constructor(game) {

        this.game = game;
        this.hospitalModal = new HospitalModal(game);

    }

    render() {

        return `
            <section class="city-window">

                <header class="city-header">

                    <h2>Cidade</h2>

                    <button class="city-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                </header>

                <div class="city-body">

                    <section class="city-container">

                        <div class="city-grid">

                            ${this.renderBlacksmith()}

                            ${this.renderMarket()}

                            ${this.renderHospital()}

                        </div>

                    </section>

                </div>

            </section>
        `;

    }

    // Encantamento (pedras de TC/Marco/Olbap/Essência) só é mencionado a
    // partir daqui — a mecânica em si ainda não existe, só o aviso muda
    // conforme o jogador atinge o nível necessário.
    static ENCHANT_UNLOCK_LEVEL = 50;

    renderBlacksmith() {

        const level = this.game.player.level;
        const enchantReady = level >= CityView.ENCHANT_UNLOCK_LEVEL;

        const enchantMessage = enchantReady
            ? "Você já atingiu o nível necessário! O encantamento chega em breve."
            : `Disponível a partir do nível ${CityView.ENCHANT_UNLOCK_LEVEL} (você está no nível ${level}).`;

        return `
            <article class="city-card">

                <div class="city-card-image">
                    <img src="./assets/img/backgrounds/cards_city/card_ferraria.png" alt="Ferraria">
                </div>

                <div class="city-card-header">
                    <h3 class="city-name">Ferraria</h3>
                </div>

                <div class="city-card-actions">

                    <div
                            class="city-option city-action"
    data-view="blacksmith-weapon"
                    >
                        🔨 Melhorar Arma
                    </div>

                    <div
                        class="city-option city-action"
                        data-view="blacksmith-armor"
                    >
                        🛡️ Melhorar Armadura
                    </div>

                    ${
                        enchantReady
                            ? `
                                <div
                                    class="city-option city-action level-ready"
                                    data-view="blacksmith-enchant"
                                >
                                    ✨ Encantar
                                </div>
                            `
                            : `
                                <div
                                    class="city-option city-action disabled"
                                    data-message="${enchantMessage}"
                                >
                                    ✨ Encantar
                                </div>
                            `
                    }

                </div>

            </article>
        `;

    }

    renderMarket() {

        return `
            <article class="city-card">

                <div class="city-card-image">
                    <img src="./assets/img/backgrounds/cards_city/card_market.png" alt="Mercado">
                </div>

                <div class="city-card-header">
                    <h3 class="city-name">Mercado</h3>
                </div>

                <div class="city-card-actions">

                <div class="city-option city-action"
                    data-view="market-buy">
                    🛒 Comprar
                </div>

                    <div class="city-option city-action"
                         data-view="market">
                        💰 Vender
                    </div>

                </div>

            </article>
        `;

    }

    renderHospital() {

        return `
            <article class="city-card">

                <div class="city-card-image">
                    <img src="./assets/img/backgrounds/cards_city/card_nursing.png" alt="Enfermaria">
                </div>

                <div class="city-card-header">
                    <h3 class="city-name">Enfermaria</h3>
                </div>

                <div class="city-card-actions">

                    <div class="city-option city-action"
                         data-view="hospital">
                        🏥 Ir para Enfermaria
                    </div>

                </div>

            </article>
        `;

    }

registerEvents(container = document) {

    const closeButton = container.querySelector(".city-close");

    container.querySelectorAll(".city-action").forEach(action => {

        action.addEventListener("click", async () => {

            if (action.classList.contains("disabled")) {

                Toast.show(action.dataset.message);

                return;

            }

            const view = action.dataset.view;

            if (view === "hospital") {

                let option;

                do {

                    option = await this.hospitalModal.show();

                    if (!option) {
                        this.game.player.health.deactivateBurst();
                        break;
                    }

                    const succeeded = this.game.player.health.handleHospitalAction(option);

                    if (succeeded) {
                        SaveService.autoSave(this.game.player);
                    }

                } while (option);

                return;

            }

            if (view) {

                this.game.hudScreen.changeView(view);

            }

        });

    });

    closeButton?.addEventListener("click", () => {
        this.game.hudScreen.changeView("");
    });

}

}