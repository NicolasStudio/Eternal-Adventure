import mountFlashOverlay from "./mountFlashOverlay.js";

export default class HealFlash {

    // Cria uma cópia temporária do sprite (mesmo recorte, via
    // mask-image), tingida de verde, e revela ela de baixo pra cima
    // com clip-path — como uma luz de cura subindo pelo corpo.
    // Posição/tamanho vêm do próprio elemento na tela, então funciona
    // igual em qualquer sprite do jogo, sem precisar de markup extra.
    static play(selector) {

        const sprite = document.querySelector(selector);

        if (!sprite) {
            return;
        }

        const overlay = document.createElement("div");

        overlay.className = "heal-flash-overlay";
        overlay.style.maskImage = `url("${sprite.src}")`;
        overlay.style.webkitMaskImage = `url("${sprite.src}")`;

        if (!mountFlashOverlay(sprite, overlay)) {
            return;
        }

        const remove = () => overlay.remove();

        overlay.addEventListener("animationend", remove, { once: true });

        // Segurança caso a animação não dispare.
        setTimeout(remove, 2500);

    }

}
