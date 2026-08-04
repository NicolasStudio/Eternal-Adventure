import SaveService from "../../../services/SaveService.js";
import Toast from "../Toast.js";

export default class LoadGameModal {

    constructor(game) {
        this.game = game;
        this.modal = null;
        this.selectedFile = null;
        this.pendingData = null;
    }

    show() {
        this.selectedFile = null;
        this.pendingData = null;
        this.mount();
    }

    mount() {

        this.hide();

        this.modal = document.createElement("div");
        this.modal.className = "modal-overlay";
        this.modal.innerHTML = this.render();

        document.body.appendChild(this.modal);

        this.registerEvents();

    }

    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    refresh() {
        if (!this.modal) return;
        this.modal.innerHTML = this.render();
        this.registerEvents();
    }

    render() {
        return `
            <div class="load-game-modal">

                <header class="load-game-header">
                    <h2>Carregar Jogo</h2>
                    <button class="load-game-close" id="load-game-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <label class="load-game-dropzone" id="load-game-dropzone" for="load-game-input">
                    <i class="fa-solid fa-file-arrow-up"></i>
                    <span>
                        ${this.selectedFile
                            ? this.selectedFile.name
                            : "Arraste seu arquivo .txt aqui ou clique para escolher"}
                    </span>
                    <input type="file" id="load-game-input" accept=".txt" hidden>
                </label>

                <footer class="load-game-footer">
                    <button class="load-game-cancel" id="load-game-cancel">Cancelar</button>
                    <button class="load-game-confirm" id="load-game-confirm" ${this.pendingData ? "" : "disabled"}>
                        Confirmar
                    </button>
                </footer>

            </div>
        `;
    }

    registerEvents() {

        this.modal.querySelector("#load-game-close")?.addEventListener("click", () => {
            this.hide();
        });

        this.modal.querySelector("#load-game-cancel")?.addEventListener("click", () => {
            this.hide();
        });

        const dropzone = this.modal.querySelector("#load-game-dropzone");
        const input = this.modal.querySelector("#load-game-input");

        input?.addEventListener("change", () => {
            if (input.files?.[0]) {
                this.handleFile(input.files[0]);
            }
        });

        dropzone?.addEventListener("dragover", (event) => {
            event.preventDefault();
            dropzone.classList.add("dragover");
        });

        dropzone?.addEventListener("dragleave", () => {
            dropzone.classList.remove("dragover");
        });

        dropzone?.addEventListener("drop", (event) => {

            event.preventDefault();
            dropzone.classList.remove("dragover");

            const file = event.dataTransfer.files?.[0];

            if (file) {
                this.handleFile(file);
            }

        });

        this.modal.querySelector("#load-game-confirm")?.addEventListener("click", () => {
            this.confirmLoad();
        });

    }

    async handleFile(file) {

        try {

            const data = await SaveService.readFile(file);

            if (!SaveService.isValidSave(data)) {
                Toast.show("Esse arquivo não é um save válido.");
                return;
            }

            this.selectedFile = file;
            this.pendingData = data;

            this.refresh();

        } catch (err) {
            Toast.show("Não foi possível ler esse arquivo.");
        }

    }

    confirmLoad() {

        if (!this.pendingData) return;

        SaveService.applyLoadedData(this.game, this.pendingData);

        this.hide();

        Toast.show("Jogo carregado!");

    }

}
