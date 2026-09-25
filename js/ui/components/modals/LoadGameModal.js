import SaveService from "../../../services/SaveService.js";
import AuthService from "../../../services/AuthService.js";
import Toast from "../Toast.js";

export default class LoadGameModal {

    constructor(game) {
        this.game = game;
        this.modal = null;
        this.status = "loading";
        this.cloudData = null;
    }

    show() {
        this.status = "loading";
        this.cloudData = null;
        this.mount();
        this.fetchCloudSave();
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

    async fetchCloudSave() {

        const user = AuthService.getCurrentUser();

        if (!user) {
            this.status = "error";
            this.refresh();
            return;
        }

        const data = await SaveService.loadFromCloud(user.uid);

        if (data && SaveService.isValidSave(data)) {
            this.cloudData = data;
            this.status = "found";
        } else {
            this.status = "empty";
        }

        this.refresh();

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

                <div class="load-game-dropzone">
                    ${this.renderStatus()}
                </div>

                <footer class="load-game-footer">
                    <button class="load-game-cancel" id="load-game-cancel">Cancelar</button>
                    <button class="load-game-confirm" id="load-game-confirm" ${this.status === "found" ? "" : "disabled"}>
                        Carregar
                    </button>
                </footer>

            </div>
        `;
    }

    renderStatus() {

        if (this.status === "loading") {
            return `
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <span>Buscando seu save na nuvem...</span>
            `;
        }

        if (this.status === "found") {
            return `
                <i class="fa-solid fa-cloud-arrow-down"></i>
                <span>Encontramos um save salvo na sua conta. Carregar agora substitui o progresso atual desta sessão.</span>
            `;
        }

        if (this.status === "error") {
            return `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>Não foi possível conectar à nuvem. Tente novamente em instantes.</span>
            `;
        }

        return `
            <i class="fa-solid fa-cloud"></i>
            <span>Nenhum save encontrado na nuvem para esta conta.</span>
        `;

    }

    registerEvents() {

        this.modal.querySelector("#load-game-close")?.addEventListener("click", () => {
            this.hide();
        });

        this.modal.querySelector("#load-game-cancel")?.addEventListener("click", () => {
            this.hide();
        });

        this.modal.querySelector("#load-game-confirm")?.addEventListener("click", () => {
            this.confirmLoad();
        });

    }

    confirmLoad() {

        if (!this.cloudData) return;

        SaveService.applyLoadedData(this.game, this.cloudData);

        this.hide();

        Toast.show("Jogo carregado!");

    }

}
