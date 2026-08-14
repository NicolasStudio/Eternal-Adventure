export default class MonsterHUD {

    constructor(game) {
        this.game = game;
    }

    render(monster) {

        if (!monster) return "";

        const hpPercent =
            (monster.status.vidaAtual / monster.status.vidaMaxima) * 100;

        return `
            <aside class="monster-panel">

                <h2 class="monster-name">
                    ${monster.name}
                </h2>

                <div class="hud-bar">

                    <div
                        id="monster-hp-fill"
                        class="hud-fill hp"
                        style="width:${hpPercent}%">
                    </div>

                    <span
                        id="monster-hp-text"
                        class="hud-text">
                        ${monster.status.vidaAtual} / ${monster.status.vidaMaxima}
                    </span>

                </div>

            </aside>
        `;

    }

    updateHP() {

        const hudScreen = this.game.hudScreen;

        const monster = hudScreen.inPvpCombat
            ? hudScreen.pvpView.opponentAsMonster()
            : hudScreen.combatView.currentMonster;

        if (!monster) return;

        const hpFill = document.getElementById("monster-hp-fill");
        const hpText = document.getElementById("monster-hp-text");

        if (!hpFill || !hpText) return;

        const hpPercent =
            (monster.status.vidaAtual / monster.status.vidaMaxima) * 100;

        hpFill.style.width = `${hpPercent}%`;

        hpText.textContent =
            `${monster.status.vidaAtual} / ${monster.status.vidaMaxima}`;

    }

    hide() {

        const panel = document.querySelector(".monster-panel");

        if (!panel) return;

        panel.remove();

    }

    show(monster) {

        const container = document.querySelector(".monster-container");

        if (!container) return;

        container.innerHTML = this.render(monster);

    }

}