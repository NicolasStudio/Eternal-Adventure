export default class Toolbar {

    render() {

        return `
            <div class="hud-toolbar">

                <button class="hud-tool" id="btn-album" data-tooltip="Álbum ">
                    <i class="fa-solid fa-book-skull"></i>
                </button>

                <button class="hud-tool" id="btn-save" data-tooltip="Salvar jogo">
                    <i class="fa-solid fa-floppy-disk"></i>
                </button>

                <button class="hud-tool" id="btn-load" data-tooltip="Carregar jogo">
                    <i class="fa-solid fa-folder-open"></i>
                </button>

                <button class="hud-tool" id="btn-maximize" data-tooltip="Maximizar">
                    <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
                </button>

                <button class="hud-tool" id="btn-settings" data-tooltip="Configurações">
                    <i class="fa-solid fa-gears"></i>
                </button>

            </div>
        `;

    }

}