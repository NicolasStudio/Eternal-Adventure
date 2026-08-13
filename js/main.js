import Game from "../js/core/Game.js";

const game = new Game();

window.game = game;

game.start();

// Blindagem global contra tooltip "presa" na tela bloqueando cliques
// (ex: menu toolbar). Roda na fase de CAPTURA, antes de qualquer outro
// handler de clique — garante que a tooltip nunca atrapalhe, não
// importa em qual tela/modal o clique aconteça.
document.addEventListener("click", () => {
    document.getElementById("item-tooltip")?.remove();
}, true);