import Toast from "../ui/components/Toast.js";

export default class CityView {

    constructor(game) {

        this.game = game;

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

                            <article class="city-card">

                                <div class="city-card-image">
                                    <img src="./assets/img/backgrounds/cards_city/card_ferraria.png" alt="Ferraria">
                                </div>

                                <div class="city-card-header">
                                    <h3 class="city-name">Ferraria</h3>
                                </div>

                                <div class="city-card-actions">

                                    <div class="city-option city-action disabled"
                                         data-message="A Ferraria estará disponível em breve.">
                                        🔨 Melhorar Arma
                                    </div>

                                    <div class="city-option city-action disabled"
                                         data-message="A Ferraria estará disponível em breve.">
                                        🛡️ Melhorar Armadura
                                    </div>

                                    <div class="city-option city-action disabled"
                                         data-message="A Ferraria estará disponível em breve.">
                                        ✨ Encantar
                                    </div>

                                </div>

                            </article>

                            <article class="city-card">

                                <div class="city-card-image">
                                    <img src="./assets/img/backgrounds/cards_city/card_market.png" alt="Mercado">
                                </div>

                                <div class="city-card-header">
                                    <h3 class="city-name">Mercado</h3>
                                </div>

                                <div class="city-card-actions">

                                    <div class="city-option city-action disabled"
                                         data-message="A compra de itens estará disponível em breve.">
                                        🛒 Comprar
                                    </div>

                                    <div class="city-option city-action"
                                         data-view="market">
                                        💰 Vender
                                    </div>

                                </div>

                            </article>

                            <article class="city-card">

                                <div class="city-card-image">
                                    <img src="./assets/img/backgrounds/cards_city/card_nursing.png" alt="Enfermaria">
                                </div>

                                <div class="city-card-header">
                                    <h3 class="city-name">Enfermaria</h3>
                                </div>

                                <div class="city-card-actions">

                                    <div class="city-option city-action disabled"
                                         data-message="A Enfermaria estará disponível em breve.">
                                        Em breve
                                    </div>

                                </div>

                            </article>

                        </div>

                    </section>

                </div>

            </section>
        `;

    }

    renderBlacksmith() {

        return `
            <article class="city-card">

                <div class="city-card-image">
                    <img src="./assets/img/backgrounds/cards_city/card_ferraria.png" alt="Ferraria">
                </div>

                <div class="city-card-header">
                    <h3 class="city-name">Ferraria</h3>
                </div>

                <div class="city-card-actions">

                    <div class="city-option city-action disabled"
                         data-message="A Ferraria estará disponível em breve.">
                        🔨 Melhorar Arma
                    </div>

                    <div class="city-option city-action disabled"
                         data-message="A Ferraria estará disponível em breve.">
                        🛡️ Melhorar Armadura
                    </div>

                    <div class="city-option city-action disabled"
                         data-message="A Ferraria estará disponível em breve.">
                        ✨ Encantar
                    </div>

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

                    <div class="city-option city-action disabled"
                         data-message="A compra de itens estará disponível em breve.">
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

    renderComingSoon() {

        return `
            <article class="city-card">

                <div class="city-card-image">
                    <img src="./assets/img/backgrounds/cards_city/card_nursing.png" alt="Enfermaria">
                </div>

                <div class="city-card-header">
                    <h3 class="city-name">Enfermaria</h3>
                </div>

                <div class="city-card-actions">

                    <div class="city-option city-action disabled"
                         data-message="A Enfermaria estará disponível em breve.">
                        Em breve
                    </div>

                </div>

            </article>
        `;

    }

    registerEvents(container = document) {

        const closeButton = container.querySelector(".city-close");

        container.querySelectorAll(".city-action").forEach(action => {

            action.addEventListener("click", () => {

                if (action.classList.contains("disabled")) {

                    const message = action.dataset.message;

                    if (message) {

                        Toast.show(message);

                    }

                    return;

                }

                const view = action.dataset.view;

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