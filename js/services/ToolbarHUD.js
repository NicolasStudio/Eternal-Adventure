import SaveService from "./SaveService.js";
import Toast from "../ui/components/Toast.js";

export default class Toolbar {
    constructor(game) {
        this.game = game;
    }

    // Estado recolhido/expandido da toolbar, persistido em localStorage
    // pra sobreviver a troca de tela (a toolbar é re-renderizada toda
    // vez que renderRightPanel roda) e a recarregar a página.
    static STORAGE_KEY = "toolbarCollapsed";

    static isCollapsed() {
        // Padrão = recolhida (null -> true), que é o motivo da feature.
        return localStorage.getItem(Toolbar.STORAGE_KEY) !== "false";
    }

    static setCollapsed(collapsed) {
        localStorage.setItem(Toolbar.STORAGE_KEY, collapsed ? "true" : "false");
    }

    render() {
        // Toolbar retrátil: o botão-toggle fica SEMPRE visível e, ao
        // clicar, expande/recolhe o grupo com os demais atalhos. Começa
        // recolhida (`collapsed`) pra ocupar o mínimo de espaço no topo.
        // O estado fica salvo em localStorage pra persistir entre telas
        // e sessões (ver registerEvents).
        const collapsed = Toolbar.isCollapsed() ? " collapsed" : "";

        return `
            <div class="hud-toolbar${collapsed}">
                <div class="hud-toolbar-items">
                    <button class="hud-tool" id="btn-album" data-tooltip="Álbum">
                        <i class="fa-solid fa-book-skull"></i>
                    </button>
                    <button class="hud-tool" id="btn-talents" data-tooltip="Árvore de Talentos">
                        <i class="fa-solid fa-diagram-project"></i>
                    </button>
                    <button class="hud-tool" id="btn-conquistas" data-tooltip="Conquistas">
                        <i class="fa-solid fa-medal"></i>
                    </button>
                    <button class="hud-tool" id="btn-global" data-tooltip="Global">
                        <i class="fa-solid fa-globe"></i>
                    </button>
                    <button class="hud-tool" id="btn-ranking" data-tooltip="Rankings">
                        <i class="fa-solid fa-ranking-star"></i>
                    </button>
                    <button class="hud-tool" id="btn-news" data-tooltip="Atualizações">
                        <i class="fa-solid fa-scroll"></i>
                    </button>
                    <button id="btn-load" class="hud-tool" data-tooltip="Carregar jogo">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                    <button id="btn-save" class="hud-tool" data-tooltip="Salvar jogo">
                        <i class="fa-solid fa-floppy-disk"></i>
                    </button>
                    <button id="btn-settings" class="hud-tool" data-tooltip="Configurações">
                        <i class="fa-solid fa-gears"></i>
                    </button>
                    <button id="btn-maximize" class="hud-tool" data-tooltip="Maximizar">
                        <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
                    </button>
                    <button class="hud-tool" id="btn-wiki" data-tooltip="Wiki">
                        <i class="fa-brands fa-wikipedia-w"></i>
                    </button>
                </div>
                <button class="hud-tool hud-tool-toggle" id="btn-toolbar-toggle" data-tooltip="${Toolbar.isCollapsed() ? "Abrir menu" : "Fechar menu"}" aria-expanded="${Toolbar.isCollapsed() ? "false" : "true"}">
                    <i class="fa-solid ${Toolbar.isCollapsed() ? "fa-angle-left" : "fa-angle-right"}"></i>
                </button>
            </div>
        `;
    }

    registerEvents(root = document) {

        const toolbar = root.querySelector(".hud-toolbar");

        if (!toolbar) {
            return;
        }

        // Cada botão é ligado de forma independente — se o de maximizar
        // não for encontrado por qualquer motivo, os outros continuam
        // funcionando (antes, um travava todos os demais).
        const maximizeButton = toolbar.querySelector("#btn-maximize");

        maximizeButton?.addEventListener("click", () => {
            this.toggleFullscreen();
        });

        // Expande/recolhe a toolbar. Recolhida mostra "<" (clique abre,
        // puxando os atalhos pra esquerda); expandida mostra ">" (clique
        // recolhe pra direita). O estado é guardado pra manter a escolha
        // ao trocar de tela e ao reabrir o jogo.
        const toggleButton = toolbar.querySelector("#btn-toolbar-toggle");

        toggleButton?.addEventListener("click", () => {
            const nowCollapsed = toolbar.classList.toggle("collapsed");
            Toolbar.setCollapsed(nowCollapsed);
            toggleButton.setAttribute("aria-expanded", nowCollapsed ? "false" : "true");
            toggleButton.dataset.tooltip = nowCollapsed ? "Abrir menu" : "Fechar menu";

            const arrow = toggleButton.querySelector("i");
            if (arrow) {
                arrow.classList.toggle("fa-angle-left", nowCollapsed);
                arrow.classList.toggle("fa-angle-right", !nowCollapsed);
            }
        });

        if (!Toolbar.fullscreenListenerBound) {
            document.addEventListener("fullscreenchange", () => {
                const currentToolbar = document.querySelector(".hud-toolbar");
                if (currentToolbar) this.updateIcon(currentToolbar);
            });
            Toolbar.fullscreenListenerBound = true;
        }

        toolbar.querySelector("#btn-save")?.addEventListener("click", () => {
            SaveService.save(this.game.player);
            Toast.show("Jogo salvo!");
        });

        toolbar.querySelector("#btn-load")?.addEventListener("click", () => {
            this.game.hudScreen.loadGameModal.show();
        });

        toolbar.querySelector("#btn-ranking")?.addEventListener("click", () => {
            this.game.hudScreen.rankingModal.show();
        });

        toolbar.querySelector("#btn-global")?.addEventListener("click", () => {
            this.game.hudScreen.globalRankingModal.show();
        });

        toolbar.querySelector("#btn-talents")?.addEventListener("click", () => {
            this.game.hudScreen.talentTreeModal.show();
        });

        toolbar.querySelector("#btn-news")?.addEventListener("click", () => {
            this.game.hudScreen.newsModal.show();
        });

        toolbar.querySelector("#btn-settings")?.addEventListener("click", () => {
            this.game.hudScreen.settingsModal.show();
        });

        // Abre a Wiki numa aba/janela nova — o jogo continua rodando
        // normalmente por trás, nada é fechado ou recarregado.
        toolbar.querySelector("#btn-wiki")?.addEventListener("click", () => {
            window.open("wiki.html", "_blank");
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
        const button = toolbar.querySelector("#btn-maximize");
        const icon = button?.querySelector("i");
        if (!button || !icon) return;
        if (document.fullscreenElement) {
            icon.className = "fa-solid fa-down-left-and-up-right-to-center";
            button.dataset.tooltip = "Minimizar";
        } else {
            icon.className = "fa-solid fa-up-right-and-down-left-from-center";
            button.dataset.tooltip = "Maximizar";
        }
    }
}