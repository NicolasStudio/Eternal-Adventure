export default class CombatToast {

    static currentToast = null;

    static getContainer() {

        // Nunca guarda referência ao DOM.
        // O HudScreen recria todo o HTML a cada refresh.
        return document.getElementById("combat-toast-container");

    }

    static async show(message, type = "system", extraSeconds = 0) {

        const container = this.getContainer();

        if (!container) {
            return;
        }

        if (this.currentToast) {

            this.currentToast.remove();
            this.currentToast = null;

        }

        return new Promise(resolve => {

            const toast = document.createElement("div");

            toast.className = `combat-toast ${type}`;

            toast.innerHTML = message;

            container.appendChild(toast);

            this.currentToast = toast;

            requestAnimationFrame(() => {

                toast.classList.add("show");

                if (extraSeconds > 0) {
                    // As mensagens do sistema (".system") usam uma
                    // animação mais curta (.9s) que as de ataque normal
                    // (1.4s) — soma o extra em cima da duração de base
                    // certa, sem precisar duplicar a regra no CSS.
                    const baseSeconds = type.includes("system") ? 0.9 : 1.4;
                    toast.style.animationDuration = `${baseSeconds + extraSeconds}s`;
                }

            });

            const finish = () => {

                if (toast.parentNode) {
                    toast.remove();
                }

                if (this.currentToast === toast) {
                    this.currentToast = null;
                }

                resolve();

            };

            toast.addEventListener("animationend", finish, { once: true });

            // Segurança caso a animação não dispare.
            setTimeout(finish, 2000 + extraSeconds * 1000);

        });

    }

    static clear() {

        if (this.currentToast) {

            this.currentToast.remove();

            this.currentToast = null;

        }

        const container = this.getContainer();

        if (container) {
            container.innerHTML = "";
        }

    }

}