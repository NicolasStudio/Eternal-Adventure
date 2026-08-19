export default class LevelUpModal {

    constructor(game) {
        this.game = game;
    }

    show(level, bonuses) {

        return new Promise(resolve => {

            const overlay = document.createElement("div");
            overlay.className = "modal-overlay";

            overlay.innerHTML = `
                <div class="reward-modal levelup-modal">

                    <button
                        class="modal-close"
                        id="close-levelup">
                        ✕
                    </button>

                    <h2 class="levelup-title">
                         LEVEL UP 
                    </h2>

                    <p class="levelup-level">
                        Você alcançou o nível ${level}
                    </p>

                    <div class="levelup-stats">
                        ${this.renderBonuses(bonuses)}
                    </div>

                </div>
            `;

            document.body.appendChild(overlay);

            overlay
                .querySelector("#close-levelup")
                .addEventListener("click", () => {
                    
                    overlay.remove();
                    resolve();

                });

        });

    }

    renderBonuses(bonuses) {

        const labels = {

            life: {
                icon: "❤️",
                label: "Vida Máxima"
            },

            attack: {
                icon: "⚔️",
                label: "Ataque"
            },

            armor: {
                icon: "🛡️",
                label: "Armadura"
            },

            agility: {
                icon: "👟",
                label: "Agilidade"
            },

            criticalChance: {
                icon: "🎯",
                label: "Chance Crítica"
            },

            lifeSteal: {
                icon: "🩸",
                label: "Roubo de Vida"
            },

            penetration: {
                icon: "🗡️",
                label: "Penetração"
            },

            absorption: {
                icon: "🪨",
                label: "Absorção"
            }

        };

        return Object.entries(bonuses)
            .filter(([key, value]) => key !== "life" && value > 0)
            .map(([key, value]) => `
                <div class="levelup-stat">
                    <span>
                        ${labels[key].icon}
                        ${labels[key].label}
                    </span>

                    <span>+${value}${key.includes("Chance") || key.includes("Steal") || key === "penetration" || key === "absorption" ? "%" : ""}</span>
                </div>
            `)
            .join("")
            +
            (bonuses.life > 0
                ? `
                    <div class="levelup-stat">
                        <span>❤ Vida Máxima</span>
                        <span>+${bonuses.life}</span>
                    </div>
                `
                : "");

    }

}