import mountFlashOverlay from "./mountFlashOverlay.js";

export default class HitFlash {

    // Mesma técnica do HealFlash (cópia flutuante do sprite, recortada
    // com a própria imagem como máscara), mas em branco e piscando
    // rápido — o "flash de dano" clássico de RPG (estilo GBA). Usado
    // pro jogador (e aliados/squad visíveis), já que o hit-flash do
    // monstro/adversário tem seu próprio efeito em CombatView.js.
    static play(selector) {

        const sprite = document.querySelector(selector);

        if (!sprite) {
            return;
        }

        const overlay = document.createElement("div");

        overlay.className = "hit-flash-overlay";
        overlay.style.maskImage = `url("${sprite.src}")`;
        overlay.style.webkitMaskImage = `url("${sprite.src}")`;

        if (!mountFlashOverlay(sprite, overlay)) {
            return;
        }

        const remove = () => overlay.remove();

        overlay.addEventListener("animationend", remove, { once: true });

        // Segurança caso a animação não dispare.
        setTimeout(remove, 1500);

    }

}
