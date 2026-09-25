import SaveService from "../../../services/SaveService.js";

const MAX_LENGTH = 8;
const MIN_LENGTH = 5;
const VALID_NAME = /^[A-Za-zÀ-ÿ0-9]+$/;
const CHECK_DEBOUNCE_MS = 450;

export default class NameEntryModal {
    constructor() {
        this.overlay = null;
    }

    // Só o formato — instantâneo, sem rede.
    validateFormat(value) {

        if (value.length < MIN_LENGTH) {
            return "Seu nome tem que ter mais de 4 caracteres.";
        }

        if (!VALID_NAME.test(value)) {
            return "Não pode caractere especial.";
        }

        return null;

    }

    show() {
        return new Promise(resolve => {

            this.overlay = document.createElement("div");
            this.overlay.className = "continue-modal-overlay";
            this.overlay.innerHTML = `
                <div class="continue-modal">
                    <button class="close-btn close-btn--corner reward-close" id="name-entry-close"><i class="fa-solid fa-xmark"></i></button>
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

            // Evita que a resposta de uma checagem antiga (nome já
            // trocado enquanto a rede respondia) sobrescreva o estado
            // atual do campo.
            let checkToken = 0;
            let debounceTimer = null;

            const setError = (message) => {
                errorLabel.textContent = message ?? "";
                errorLabel.hidden = !message;
            };

            const checkAvailability = async (value) => {

                const myToken = ++checkToken;

                setError("Verificando nome...");
                confirmButton.disabled = true;

                const taken = await SaveService.isCharacterNameTaken(value);

                if (myToken !== checkToken) return;

                if (taken) {
                    setError("Esse nome já está sendo usado.");
                    confirmButton.disabled = true;
                } else {
                    setError(null);
                    confirmButton.disabled = false;
                }

            };

            const updateState = () => {

                const value = input.value.trim();
                counter.textContent = `${input.value.length}/${MAX_LENGTH}`;

                clearTimeout(debounceTimer);
                checkToken++; // invalida qualquer checagem de rede em andamento

                if (value.length === 0) {
                    setError(null);
                    confirmButton.disabled = true;
                    return;
                }

                const formatError = this.validateFormat(value);

                if (formatError) {
                    setError(formatError);
                    confirmButton.disabled = true;
                    return;
                }

                confirmButton.disabled = true;
                debounceTimer = setTimeout(() => checkAvailability(value), CHECK_DEBOUNCE_MS);

            };

            input.addEventListener("input", updateState);

            const confirm = async () => {

                const value = input.value.trim();

                if (!value || this.validateFormat(value)) return;

                clearTimeout(debounceTimer);
                confirmButton.disabled = true;

                const taken = await SaveService.isCharacterNameTaken(value);

                if (taken) {
                    setError("Esse nome já está sendo usado.");
                    return;
                }

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
