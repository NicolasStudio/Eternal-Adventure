import SaveService from "../../../services/SaveService.js";

const MAX_LENGTH = 8;
const MIN_LENGTH = 5;
const VALID_NAME = /^[A-Za-zÀ-ÿ0-9]+$/;

export default class NameEntryModal {
    constructor() {
        this.overlay = null;
    }

    // Enquanto não existir backend, a única "base" pra checar nome
    // repetido é o save local — dá pra trocar por uma chamada real
    // ao banco no futuro sem mexer no resto do fluxo.
    isNameTaken(value) {
        const existing = SaveService.loadFromLocalStorage();
        return !!existing?.name && existing.name.toLowerCase() === value.toLowerCase();
    }

    validate(value) {

        if (value.length < MIN_LENGTH) {
            return "Seu nome tem que ter mais de 4 caracteres.";
        }

        if (!VALID_NAME.test(value)) {
            return "Não pode caractere especial.";
        }

        if (this.isNameTaken(value)) {
            return "Esse nome já está sendo usado.";
        }

        return null;

    }

    show() {
        return new Promise(resolve => {

            this.overlay = document.createElement("div");
            this.overlay.className = "continue-modal-overlay";
            this.overlay.innerHTML = `
                <div class="continue-modal">
                    <button class="reward-close" id="name-entry-close">✕</button>
                    <h2 class="continue-title">Nova Aventura</h2>
                    <p class="name-entry-hint">Como devemos te chamar?</p>
                    <input
                        type="text"
                        class="name-entry-input"
                        maxlength="${MAX_LENGTH}"
                        placeholder="Nome"
                        autocomplete="off"
                    >
                    <div class="name-entry-count">0/${MAX_LENGTH}</div>
                    <span class="continue-warning name-entry-error" hidden></span>
                    <div class="continue-actions">
                        <button class="name-entry-confirm" disabled>Confirmar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(this.overlay);

            const input = this.overlay.querySelector(".name-entry-input");
            const counter = this.overlay.querySelector(".name-entry-count");
            const confirmButton = this.overlay.querySelector(".name-entry-confirm");
            const errorLabel = this.overlay.querySelector(".name-entry-error");
            const closeButton = this.overlay.querySelector("#name-entry-close");

            const updateState = () => {

                const value = input.value.trim();
                counter.textContent = `${input.value.length}/${MAX_LENGTH}`;

                const error = value.length === 0 ? null : this.validate(value);

                errorLabel.textContent = error ?? "";
                errorLabel.hidden = !error;
                confirmButton.disabled = value.length === 0 || !!error;

            };

            input.addEventListener("input", updateState);

            const confirm = () => {
                const value = input.value.trim();
                if (!value || this.validate(value)) return;
                this.hide();
                resolve(value);
            };

            const cancel = () => {
                this.hide();
                resolve(null);
            };

            confirmButton.addEventListener("click", confirm);
            closeButton.addEventListener("click", cancel);

            input.addEventListener("keydown", (event) => {
                if (event.key === "Enter") confirm();
                if (event.key === "Escape") cancel();
            });

            input.focus();

        });
    }

    hide() {
        if (!this.overlay) return;
        this.overlay.remove();
        this.overlay = null;
    }
}
