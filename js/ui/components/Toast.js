export default class Toast {

    static show(message, duration = 2000) {

        const oldToast = document.querySelector(".game-toast");

        if (oldToast) {

            oldToast.remove();

        }

        const toast = document.createElement("div");

        toast.className = "game-toast";

        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {

            toast.classList.add("show");

        }, 10);

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => toast.remove(), 300);

        }, duration);

    }

}