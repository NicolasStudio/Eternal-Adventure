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

        const rect = sprite.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        const overlay = document.createElement("div");

        overlay.className = "hit-flash-overlay";
        overlay.style.top = `${rect.top}px`;
        overlay.style.left = `${rect.left}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.maskImage = `url("${sprite.src}")`;
        overlay.style.webkitMaskImage = `url("${sprite.src}")`;

        document.body.appendChild(overlay);

        const remove = () => overlay.remove();

        overlay.addEventListener("animationend", remove, { once: true });

        // Segurança caso a animação não dispare.
        setTimeout(remove, 1500);

    }

}
