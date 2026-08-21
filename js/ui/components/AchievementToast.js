import SoundEffectService from "../../services/SoundEffectService.js";

// Pop-up de "conquista desbloqueada", no canto superior direito da
// tela — separado do CombatToast (que é de combate, central) e do
// Toast genérico (uma linha só, topo central). Enfileira: se várias
// conquistas destravarem juntas (ex: o último requisito de várias de
// uma vez), mostra uma de cada vez em vez de empilhar/sobrepor.
export default class AchievementToast {

    static queue = [];
    static showing = false;

    static show(achievement) {
        this.queue.push(achievement);
        this.processQueue();
    }

    static async processQueue() {

        if (this.showing) return;

        this.showing = true;

        while (this.queue.length) {
            const achievement = this.queue.shift();
            await this.displayOne(achievement);
        }

        this.showing = false;

    }

    static displayOne(achievement) {

        return new Promise(resolve => {

            const toast = document.createElement("div");
            toast.className = "achievement-toast";

            toast.innerHTML = `
                <div class="achievement-toast-icon">
                    <img src="${achievement.icon}" alt="${achievement.name}">
                </div>
                <div class="achievement-toast-text">
                    <span class="achievement-toast-title">
                        <i class="fa-solid fa-trophy"></i>
                        Conquista Desbloqueada!
                    </span>
                    <span class="achievement-toast-name">${achievement.name}</span>
                </div>
            `;

            document.body.appendChild(toast);

            SoundEffectService.play("achievementUnlocked");

            requestAnimationFrame(() => toast.classList.add("show"));

            setTimeout(() => {

                toast.classList.remove("show");

                setTimeout(() => {
                    toast.remove();
                    resolve();
                }, 400);

            }, 4000);

        });

    }

}
