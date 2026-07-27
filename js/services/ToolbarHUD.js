import SaveService from "./SaveService.js";
import Toast from "../ui/components/Toast.js";

export default class Toolbar {
    constructor(game) {
        this.game = game;
    }

    render() {
        return `
            <div class="hud-toolbar">
                <button class="hud-tool" id="btn-album" data-tooltip="Álbum ">
                    <i class="fa-solid fa-book-skull"></i>
                </button>
                <button id="btn-save" class="hud-tool" data-tooltip="Salvar jogo">
                    <i class="fa-solid fa-floppy-disk"></i>
                </button>
                <button id="btn-load" class="hud-tool" data-tooltip="Carregar jogo">
                    <i class="fa-solid fa-folder-open"></i>
                </button>
                <button id="btn-maximize" class="hud-tool" data-tooltip="Maximizar">
                    <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
                </button>
                <button id="btn-settings" class="hud-tool" data-tooltip="Configurações">
                    <i class="fa-solid fa-gears"></i>
                </button>
            </div>
        `;
    }

    registerEvents(root = document) {
        const toolbar = root.querySelector(".hud-toolbar");
        if (!toolbar) {
            return;
        }
        const btn = toolbar.querySelector("#btn-maximize");
        if (!btn) {
            return;
        }
        btn.addEventListener("click", () => {
            this.toggleFullscreen();
        });
        document.addEventListener("fullscreenchange", () => {
            this.updateIcon(toolbar);
        });

        toolbar.querySelector("#btn-save")?.addEventListener("click", () => {
            SaveService.save(this.game.player);
            Toast.show("Jogo salvo!");
        });

        toolbar.querySelector("#btn-load")?.addEventListener("click", () => {
            this.game.hudScreen.loadGameModal.show();
        });
    }

    async toggleFullscreen() {
        const game = document.getElementById("game");
        if (!game) {
            return;
        }
        try {
            if (!document.fullscreenElement) {
                await game.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (e) {
        }
    }

    updateIcon(toolbar) {
        const icon = toolbar.querySelector("#btn-maximize i");
        if (!icon) return;
        if (document.fullscreenElement) {
            icon.className = "fa-solid fa-down-left-and-up-right-to-center";
        } else {
            icon.className = "fa-solid fa-up-right-and-down-left-from-center";
        }
    }
}