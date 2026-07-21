export default class Toolbar {

    render() {

        return `
            <div class="hud-toolbar">

                <button class="hud-tool" data-tooltip="Salvar jogo">
                    <i class="fa-solid fa-floppy-disk"></i>
                </button>

                <button class="hud-tool" data-tooltip="Carregar jogo">
                    <i class="fa-solid fa-folder-open"></i>
                </button>

                <button class="hud-tool" data-tooltip="Tela cheia">
                    <i class="fa-solid fa-expand"></i>
                </button>

                <button class="hud-tool" data-tooltip="Configurações">
                    <i class="fa-solid fa-gears"></i>
                </button>

            </div>
        `;

    }

}