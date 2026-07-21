import Toast from "../ui/components/Toast.js";


export default class CityView {
    constructor(game) {
        this.game = game;
        this.selectedCard = null;
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
                            <article class="city-card" data-city="blacksmith">
                                <div class="city-card-image">
                                    <img src="./Eternal-Adventure/assets/img/backgrounds/cards_city/card_ferraria.png">
                                </div>
                                <div class="city-card-header">
                                    <h3 class="city-name">Ferraria</h3>
                                </div>
                                <div class="city-card-actions">
                                    <div class="city-option disabled">🔨 Melhorar Arma</div>
                                    <div class="city-option disabled">🛡️ Melhorar Armadura</div>
                                    <div class="city-option disabled">✨ Encantar</div>
                                </div>
                            </article>
                            <article class="city-card" data-city="market">
                                <div class="city-card-image">
                                    <img src="./Eternal-Adventure/assets/img/backgrounds/cards_city/card_market.png">
                                </div>
                                <div class="city-card-header">
                                    <h3 class="city-name">Mercado</h3>
                                </div>
                                <div class="city-card-actions">
                                    <div class="city-option disabled">🛒 Comprar</div>
                                    <div class="city-option">💰 Vender</div>
                                </div>
                            </article>
                            <article class="city-card" data-city="infirmary">
                                <div class="city-card-image">
                                    <img src="./Eternal-Adventure/assets/img/backgrounds/cards_city/card_nursing.png">
                                </div>
                                <div class="city-card-header">
                                    <h3 class="city-name">Enfermaria</h3>
                                </div>
                                <div class="city-card-actions">
                                    <div class="city-option disabled">Em breve</div>
                                </div>
                            </article>
                        </div>
                        <div class="city-actions">
                            <button class="city-enter">Entrar</button>
                        </div>
                    </section>
                </div>
            </section>
        `;
    }

    renderBlacksmith() {
        return `
            <article class="city-card" data-city="blacksmith">
                <div class="city-card-image">
                    <img src="./Eternal-Adventure/assets/img/backgrounds/cards_city/card_ferraria.png" alt="Ferraria">
                </div>
                <div class="city-card-header">
                    <h3 class="city-name">Ferraria</h3>
                </div>
                <div class="city-card-actions">
                    <div class="city-option disabled">🔨 Melhorar Arma</div>
                    <div class="city-option disabled">🛡️ Melhorar Armadura</div>
                    <div class="city-option disabled">✨ Encantar</div>
                </div>
            </article>
        `;
    }

    renderMarket() {
        return `
            <article class="city-card" data-city="market">
                <div class="city-card-image">
                    <img src="Eternal-Adventure/assets/img/backgrounds/cards_city/card_market.png" alt="Mercado">
                </div>
                <div class="city-card-header">
                    <h3 class="city-name">Mercado</h3>
                </div>
                <div class="city-card-actions">
                    <div class="city-option disabled">🛒 Comprar (Em breve)</div>
                    <div class="city-option">💰 Vender Itens</div>
                </div>
            </article>
        `;
    }

    renderComingSoon() {
        return `
            <article class="city-card locked" data-city="soon">
                <div class="city-card-image">
                    <img src="Eternal-Adventure/assets/img/backgrounds/cards_city/card_nursing.png" alt="Em breve">
                </div>
                <div class="city-card-header">
                    <h3 class="city-name">Em Breve</h3>
                </div>
                <div class="city-card-actions">
                    <div class="city-option disabled">Novas Construções</div>
                </div>
            </article>
        `;
    }

    registerEvents(container = document) {

        const cards = container.querySelectorAll(".city-card");
        const enterButton = container.querySelector(".city-enter");
        const closeButton = container.querySelector(".city-close");

        // Estado inicial
        this.selectedCard ??= null;

        enterButton.disabled = this.selectedCard === null;

        cards.forEach(card => {

            // Mantém o selected ao renderizar novamente
            if (card.dataset.city === this.selectedCard) {
                card.classList.add("selected");
            }

            card.addEventListener("click", () => {

                cards.forEach(c => c.classList.remove("selected"));

                card.classList.add("selected");

                this.selectedCard = card.dataset.city;

                enterButton.disabled = false;

            });

        });

        enterButton?.addEventListener("click", () => {

            if (!this.selectedCard) {

                Toast.show("Selecione um local.");

                return;

            }

            switch (this.selectedCard) {

                case "market":

                    this.game.hudScreen.changeView("market");
                    break;

                case "blacksmith":

                    Toast.show("A Ferraria estará disponível em breve.");
                    break;

                case "infirmary":

                    Toast.show("A Enfermaria estará disponível em breve.");
                    break;

                default:

                    Toast.show("Local indisponível.");
                    break;
            }

        });

        closeButton?.addEventListener("click", () => {

            this.selectedCard = null;

            this.game.hudScreen.changeView("");

        });

    }
}