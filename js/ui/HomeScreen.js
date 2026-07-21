export default class HomeScreen {

    constructor(game) {
        this.game = game;
        this.element = document.getElementById("home-screen");

        this.render();
        this.bindEvents();
    }

    render() {
        this.element.innerHTML = `
            <div class="home">
                <div class="fog"></div>
                <img class="home_logo" src="Eternal-Adventure/assets/img/backgrounds/logo.png" alt="Eternal Adventure" >
                <div class="menu">
                    <button id="btn-new-game">
                        Novo Jogo
                    </button>
                    <button disabled>
                        Continuar
                    </button>
                    <button>
                        Configurações
                    </button>
                </div>
                <small>
                    Alpha v0.1
                </small>
            </div>
        `;
    }

    bindEvents() {

        const button = this.element.querySelector("#btn-new-game");

        button.addEventListener("click", () => {

            this.game.showScreen("class");

        });

    }

    show() {
        this.element.classList.remove("hidden");
    }

    hide() {
        this.element.classList.add("hidden");
    }

}