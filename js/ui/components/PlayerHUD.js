export default class PlayerHUD {

    constructor(game) {
        this.game = game;
    }

    render() {

        const player = this.game.player;

        const currentXP = player.currentXP;
        const maxXP = player.getRequiredXP();

        const hpPercent = (player.currentHP / player.maxHP) * 100;
        const xpPercent = Math.min((currentXP / maxXP) * 100, 100);

        return `
            <aside class="hud-panel">

                <div class="hud-player-header">

                    <img
                        class="hud-avatar"
                        src="${player.transcendence?.hud ?? player.class.hud}"
                        alt="${player.transcendence?.name ?? player.class.name}"
                    >

                    <div class="hud-info">
                        <h2 class="hud-name">${player.name ?? player.class.name}</h2>
                        <span id="hud-level" class="hud-level">
                            LV ${player.level}
                        </span>
                    </div>

                </div>

                <div class="hud-bar">

                    <span class="hud-label">HP</span>

                    <div
                        id="hp-fill"
                        class="hud-fill hp"
                        style="width:${hpPercent}%;">
                    </div>

                    <span id="hp-text" class="hud-text">
                        ${player.currentHP} / ${player.maxHP}
                    </span>

                </div>

                <div class="hud-bar">

                    <span class="hud-label">XP</span>

                    <div
                        id="xp-fill"
                        class="hud-fill xp"
                        style="width:${xpPercent}%;">
                    </div>

                    <span id="xp-text" class="hud-text">
                        ${currentXP} / ${maxXP}
                    </span>

                </div>
            </aside>
        `;
    }

    updateHP() {

        const player = this.game.player;

        const hpFill = document.getElementById("hp-fill");
        const hpText = document.getElementById("hp-text");

        if (!hpFill || !hpText) return;

        const hpPercent = (player.currentHP / player.maxHP) * 100;

        hpFill.style.width = `${hpPercent}%`;
        hpText.textContent = `${player.currentHP} / ${player.maxHP}`;
    }

    updateXP() {

        const player = this.game.player;

        const xpFill = document.getElementById("xp-fill");
        const xpText = document.getElementById("xp-text");

        if (!xpFill || !xpText) return;

        const currentXP = player.currentXP;
        const maxXP = player.getRequiredXP();

        const xpPercent = Math.min((currentXP / maxXP) * 100, 100);

        xpFill.style.width = `${xpPercent}%`;
        xpText.textContent = `${currentXP} / ${maxXP}`;
    }

    updateLevel() {

        const player = this.game.player;

        const level = document.getElementById("hud-level");

        if (!level) return;

        level.textContent = `LV ${player.level}`;
    }

    update() {

        this.updateHP();
        this.updateXP();
        this.updateLevel();

    }

}