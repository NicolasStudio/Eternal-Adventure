export default class LoadingScreen {

    constructor(game) {

        this.game = game;

        this.container = document.getElementById("loading-screen");

    }

    show() {

        this.container.innerHTML = `
            <div class="home loading-screen">

                <div class="fog"></div>

                <img
                    class="home_logo loading-logo"
                    src="assets/img/backgrounds/logo.png"
                    alt="Eternal Adventure">

                <p class="loading-text">
                    Carregando...
                </p>

            </div>
        `;

        this.container.classList.remove("hidden");

    }

    async hide() {

        const screen = this.container.querySelector(".loading-screen");

        if (screen) {

            screen.classList.add("hide");

            await new Promise(resolve => setTimeout(resolve, 700));

        }

        this.container.innerHTML = "";

        this.container.classList.add("hidden");

    }

}