const ARENA_SELECTOR = ".combat-arena, .raid-battle-arena, .pvp2v2-arena";

// Posiciona a cópia flutuante do sprite (HitFlash/HealFlash) exatamente
// em cima dele. Em combate, o efeito entra DENTRO da arena — assim ele
// fica no mesmo empilhamento das mensagens de ataque e passa por baixo
// delas (sprites < efeito < mensagem). Fora da arena (avatar do HUD),
// fica solto no body.
export default function mountFlashOverlay(sprite, overlay) {

    const rect = sprite.getBoundingClientRect();

    if (!rect.width || !rect.height) {
        return false;
    }

    const arena = sprite.closest(ARENA_SELECTOR);

    if (arena) {

        const arenaRect = arena.getBoundingClientRect();

        overlay.classList.add("in-arena");
        overlay.style.top = `${rect.top - arenaRect.top}px`;
        overlay.style.left = `${rect.left - arenaRect.left}px`;

        arena.appendChild(overlay);

    } else {

        overlay.style.top = `${rect.top}px`;
        overlay.style.left = `${rect.left}px`;

        document.body.appendChild(overlay);

    }

    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    return true;

}
