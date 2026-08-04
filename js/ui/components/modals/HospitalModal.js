export default class HospitalModal {

    constructor(game) {

        this.game = game;
        this.overlay = null;
        this.resolve = null;
    }

    show() {

        if (this.overlay) {

            return new Promise(resolve => {
                this.resolve = resolve;
            });

        }

        this.overlay = document.createElement("div");
        this.overlay.className = "hospital-modal-overlay";

        this.render();

        document.body.appendChild(this.overlay);

        this.registerEvents();

        return new Promise(resolve => {
            this.resolve = resolve;
        });

    }

    render() {

        const player = this.game.player;

        const missingHP = player.health.getMissingHP();
        const burstCost = player.health.getBurstCost();
        const instantCost = player.health.getInstantHealCost();
        const vida_atual =  player.maxHP - player.currentHP;

        this.overlay.innerHTML = `
            <div class="hospital-modal">

                <header class="hospital-header">

                    <h2>Enfermaria</h2>

                    <button class="hospital-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                </header>

                <div class="hospital-body">

                    <section class="hospital-top">

                        <div class="hospital-image">
                            <img
                                src="./assets/img/backgrounds/cards_city/card_nursing.png"
                                alt="Enfermaria">
                        </div>

                        <div class="hospital-info">

                            <h3>Recupere suas forças</h3>

                            <p>
                                A sua regeneração natural recupera <strong> 1% </strong> da Vida Máxima a cada
                                <strong> 2 minutos</strong>.
                            </p>

                            <div class="hospital-player-info">
                                <div class="hospital-player-row">
                                    <span class="hospital-player-label">
                                        ❤️ Vida Atual
                                    </span>
                                    <span class="hospital-player-value" id="hospital-current-hp">
                                         ${player.currentHP}/ ${player.maxHP}
                                    </span>
                                    <span class="hospital-player-label">
                                        ⭐ Regeneração
                                    </span>
                                    <span class="hospital-player-value" id="hospital-regeneration">
                                        1% / 2 min
                                    </span>
                                </div>
                                <div class="hospital-player-row">
                                    <span class="hospital-player-label">
                                        💔 Vida Perdida
                                    </span>
                                    <span class="hospital-player-value" id="hospital-missing-hp">
                                        ${vida_atual}
                                    </span>
                                    <span class="hospital-player-label">
                                        💰 Ouro atual
                                    </span>
                                    <span class="hospital-player-value" id="hospital-gold">
                                        ${player.gold}
                                    </span>
                                </div>
                            </div>

                    </section>

                    <section class="hospital-actions">

                        <article class="hospital-card">

                            <h3>Burst de Vida</h3>

                            <ul>
                                <li>❤️ Recupera <strong>5%</strong> da Vida Máxima a cada <strong>2 minutos</strong>.</li>
                                <li>⭐ Ganha <strong>2 XP</strong> por ciclo de descanso.</li>
                                <li>💰 Custo: <strong>${burstCost} Ouro</strong></li>
                            </ul>

                            <button class="hospital-burst">
                                Descansar
                            </button>

                        </article>

                        <article class="hospital-card">

                            <h3>Recuperação Instantânea</h3>

                            <ul>
                                <li>❤️ Recupera toda a Vida imediatamente.</li>
                                <li>⚡ Cura instantânea.</li>
                                <li>💰 Custo: <strong>${instantCost} Ouro</strong></li>
                            </ul>

                            <button class="hospital-instant">
                                Curar Agora
                            </button>

                        </article>

                    </section>

                </div>

            </div>
        `;

    }

    registerEvents() {

        const closeButton = this.overlay.querySelector(".hospital-close");
        const burstButton = this.overlay.querySelector(".hospital-burst");
        const instantButton = this.overlay.querySelector(".hospital-instant");

        closeButton.addEventListener("click", () => {

            this.hide();

            if (this.resolve) {
                this.resolve(null);
            }

        });

        burstButton.addEventListener("click", () => {

            if (this.resolve) {
                this.resolve("burst");
            }

        });

        instantButton.addEventListener("click", () => {

            if (this.resolve) {
                this.resolve("instant");
            }

        });

    }

    refresh() {

        if (!this.overlay) {
            return;
        }

        this.render();
        this.registerEvents();

    }

    hide() {

        if (!this.overlay) {
            return;
        }

        this.overlay.remove();
        this.overlay = null;
        this.resolve = null;

    }

}