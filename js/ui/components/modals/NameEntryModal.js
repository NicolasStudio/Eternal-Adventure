const MAX_LENGTH = 8;

export default class NameEntryModal {
    constructor() {
        this.overlay = null;
    }

    show() {
        return new Promise(resolve => {

            this.overlay = document.createElement("div");
            this.overlay.className = "continue-modal-overlay";
            this.overlay.innerHTML = `
                <div class="continue-modal">
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
                    <div class="continue-actions">
                        <button class="name-entry-confirm" disabled>Confirmar</button>
                    </div>
                </div>
            `;

            document.body.appendChild(this.overlay);

            const input = this.overlay.querySelector(".name-entry-input");
            const counter = this.overlay.querySelector(".name-entry-count");
            const confirmButton = this.overlay.querySelector(".name-entry-confirm");

            const updateState = () => {
                const value = input.value.trim();
                counter.textContent = `${input.value.length}/${MAX_LENGTH}`;
                confirmButton.disabled = value.length === 0;
            };

            input.addEventListener("input", updateState);

            const confirm = () => {
                const value = input.value.trim();
                if (!value) return;
                this.hide();
                resolve(value);
            };

            confirmButton.addEventListener("click", confirm);

            input.addEventListener("keydown", (event) => {
                if (event.key === "Enter") confirm();
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
