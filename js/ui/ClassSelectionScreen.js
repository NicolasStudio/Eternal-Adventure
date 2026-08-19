import classes from "../player/classes.js";
import Player  from "../player/Player.js";

export default class ClassSelectionScreen {

    constructor(game) {

        this.game = game;
        this.element = document.getElementById("class-selection-screen");
        this.selectedClass = null;
        this.render();
        this.bindEvents();

    }

    render() {
        this.element.innerHTML = `
            <div class="class-selection">
                <h1 class="class-selection__title">Escolha sua Classe</h1>
                <div class="class-grid">${this.renderCards()}</div>
                <div id="class-info" class="class-info"><p>Selecione uma classe.</p></div>
                <div class="class-actions">
                    <button id="btn-start" disabled>Começar Aventura</button>
                    <button id="btn-back">Voltar</button>
                </div>
            </div>
        `;
    }

    renderCards() {
        return Object.values(classes).map(character => `
            <div class="class-card" data-class="${character.id}">
                <img src="${character.image}" alt="${character.name}">
                <h2>${character.name}</h2>
            </div>
        `).join("");
    }

    bindEvents() {

        this.element
            .querySelector("#btn-start")
            .addEventListener("click", () => {

                if (!this.selectedClass) return;

                this.startAdventure();

            });

        this.element
            .querySelectorAll(".class-card")
            .forEach(card => {

                card.addEventListener("click", () => {

                    this.selectClass(card.dataset.class);

                });

            });

        this.element
            .querySelector("#btn-back")
            .addEventListener("click", () => {

                this.game.showScreen("home");

            });

    }

    selectClass(classId) {

        this.selectedClass = classes[classId];

        this.element
            .querySelectorAll(".class-card")
            .forEach(card => {

                card.classList.remove("selected");

            });

        this.element
            .querySelector(`[data-class="${classId}"]`)
            .classList.add("selected");

        this.renderInfo();

    }

    renderInfo() {

        const info = this.element.querySelector("#class-info");

        const specialties = {

            warrior: [
                "⚔️ Alto Ataque",
                "🛡️ Alta Armadura",
                "👢 Baixa Agilidade"
            ],

            archer: [
                "🏹 Alta Agilidade",
                "🎯 Alta Chance Crítica",
                "🛡️ Baixa Armadura"
            ],

            mage: [
                "✨ Alto Ataque",
                "🗡️ Alta Penetração",
                "🛡️ Baixa Armadura"
            ],

            barbarian: [
                "🩸 Alto Roubo de Vida",
                "💪 Ataque e Agilidade Equilibrados",
                "🪨 Absorção Baixa"
            ]

        };

        const list = specialties[this.selectedClass.id]
            .map(item => `<li>${item}</li>`)
            .join("");

        info.innerHTML = `

            <h2>${this.selectedClass.name}</h2>

            <p>${this.selectedClass.lore}</p>

            <h3>Especialidades</h3>

            <ul>

                ${list}

            </ul>

        `;

        this.element.querySelector("#btn-start").disabled = false;

    }

    show() {

        this.element.classList.remove("hidden");

    }

    hide() {

        this.element.classList.add("hidden");

    }

    startAdventure() {

        this.game.player = new Player(this.selectedClass, this.game.pendingPlayerName);

        this.game.pendingPlayerName = null;

        this.game.player.addListener(() => {
            this.game.hudScreen.updateHUD();
        });

        this.game.showScreen("hud");
    }

}