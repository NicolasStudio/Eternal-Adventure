import CasinoService, { CASINO_PAID_BET_AMOUNT, getSymbolSet } from "../../../services/CasinoService.js";
import CasinoDailyService, { CASINO_FREE_SPINS_PER_DAY } from "../../../services/CasinoDailyService.js";
import AuthService from "../../../services/AuthService.js";
import SaveService from "../../../services/SaveService.js";
import Toast from "../Toast.js";

const CELL_HEIGHT = 58; // px — precisa bater com .casino-cell no CSS
const FILLER_SYMBOLS = 45; // quantos ícones aleatórios "passam" antes de parar — bastante pra dar a sensação de girar bastante antes de qualquer bobina parar
// ms — cada bobina para bem depois da anterior (1ª para, 2ª continua
// girando e só para depois, 3ª continua e para por último).
const REEL_STOP_DELAYS = [2200, 3600, 5200];

// Cassino (caça-níquel) da home — mesmo padrão de overlay do Correio
// (MailModal.js): ícone só aparece na home (quem decide isso é o
// HudScreen), modal nasce/morre via show()/hide(). O resultado da aposta
// é decidido na hora (ver CasinoService.spin) — a animação da bobina é
// só um reveal cosmético do resultado já resolvido, não afeta o prêmio.
export default class CasinoModal {

    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.spinning = false;
        this.lastResult = null;
        this.escapeHandler = null;
        // Ícone/nome da arma mudam de classe pra classe (ver
        // CasinoService.getSymbolSet) — NÃO pode resolver aqui no
        // construtor: o HudScreen (e com ele este modal) é criado junto
        // com o Game, antes do personagem ser carregado (game.player
        // ainda é null nesse momento). Resolvido sob demanda em show()
        // em vez disso, quando o jogador já existe de verdade.
        this.symbols = null;
        // Quantas grátis sobram hoje — null enquanto ainda não carregou
        // (ver show()), pra não desenhar "Apostar" por um instante e
        // trocar pra "Grátis" logo em seguida.
        this.freeSpinsLeft = null;
        // Estado parado inicial — linha do meio de propósito SEM os 3
        // símbolos iguais, pra não parecer uma vitória que não aconteceu.
        this.idleGrid = [
            ["morango", "gold", "semente"],
            ["gold", "semente", "morango"],
            ["semente", "morango", "gold"]
        ];
    }

    get uid() {
        return AuthService.getCurrentUser()?.uid ?? null;
    }

    renderButton() {
        return `
            <button class="hud-tool casino-toggle" id="casino-toggle" data-tooltip="Cassino">
                <i class="fa-solid fa-dice"></i>
            </button>
        `;
    }

    registerEvents(container = document) {
        container.querySelector("#casino-toggle")?.addEventListener("click", () => this.show());
    }

    async show() {

        this.spinning = false;
        this.lastResult = null;
        this.freeSpinsLeft = null;
        this.symbols = getSymbolSet(this.game.player);

        this.overlay = document.createElement("div");
        this.overlay.className = "casino-overlay";
        this.overlay.innerHTML = `<div class="casino-modal"></div>`;
        document.body.appendChild(this.overlay);

        this.overlay.addEventListener("click", event => {
            if (event.target === this.overlay) this.hide();
        });

        this.escapeHandler = event => {
            if (event.key === "Escape") this.hide();
        };
        document.addEventListener("keydown", this.escapeHandler);

        // Desenha primeiro com freeSpinsLeft ainda null (ver
        // renderSpinButton) pra não travar a abertura do modal esperando
        // o Firestore — atualiza assim que a consulta voltar.
        this.render();

        this.freeSpinsLeft = await CasinoDailyService.getFreeSpinsLeft(this.uid, SaveService.activeSlot);

        if (!this.overlay) return; // fechado antes da consulta voltar

        this.render();

    }

    hide() {

        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

        if (this.escapeHandler) {
            document.removeEventListener("keydown", this.escapeHandler);
            this.escapeHandler = null;
        }

        // Girar já concede o prêmio na hora (ver CasinoService.spin) — se
        // o jogador fechar o modal no meio da animação, só destrava o
        // botão pra não ficar preso em "Girando..." pra sempre.
        this.spinning = false;

    }

    render() {

        if (!this.overlay) return;

        const player = this.game.player;
        const hasFree = (this.freeSpinsLeft ?? 0) > 0;
        const canAfford = player.gold >= CASINO_PAID_BET_AMOUNT;
        const canSpin = !this.spinning && this.freeSpinsLeft !== null && (hasFree || canAfford);

        this.overlay.querySelector(".casino-modal").innerHTML = `
            <header class="casino-header">
                <h2>Cassino</h2>
                <button class="close-btn casino-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>
            <p class="casino-subtitle">Só ganha quem tirar o mesmo símbolo nos 3 espaços da linha do meio.</p>
            <p class="casino-free-spins">
                ${this.freeSpinsLeft === null
                    ? "Verificando giros grátis de hoje..."
                    : `Giros grátis hoje: ${this.freeSpinsLeft}/${CASINO_FREE_SPINS_PER_DAY}`
                }
            </p>
            <div class="casino-reels">
                ${[0, 1, 2].map(reel => `
                    <div class="casino-reel">
                        <div class="casino-reel-strip">
                            ${this.idleGrid[reel].map(symbol => this.renderSymbolCell(symbol)).join("")}
                        </div>
                    </div>
                `).join("")}
                <div class="casino-mid-line"></div>
            </div>
            ${this.renderResult()}
            <footer class="casino-footer">
                <div class="casino-gold">
                    <i class="fa-solid fa-coins"></i>
                    <span>${player.gold.toLocaleString("pt-BR")}</span>
                </div>
                <button class="casino-spin-button" ${canSpin ? "" : "disabled"}>
                    ${this.renderSpinButtonLabel(hasFree)}
                </button>
            </footer>
            ${!hasFree && !canAfford && !this.spinning && this.freeSpinsLeft !== null
                ? `<p class="casino-insufficient">Ouro insuficiente pra apostar.</p>`
                : ""
            }
        `;

        this.registerModalEvents();

    }

    renderSpinButtonLabel(hasFree) {

        if (this.spinning) return "Girando...";

        if (this.freeSpinsLeft === null) return "Aguarde...";

        if (hasFree) return "Girar grátis";

        return `Apostar ${CASINO_PAID_BET_AMOUNT.toLocaleString("pt-BR")}`;

    }

    renderSymbolCell(symbolId) {
        const symbol = this.symbols[symbolId];
        return `
            <div class="casino-cell">
                <img src="${symbol.icon}" alt="${symbol.label}">
            </div>
        `;
    }

    renderResult() {

        if (!this.lastResult) return "";

        const { win, symbol, prize } = this.lastResult;

        if (!win) {
            return `<p class="casino-result casino-lose">Não ganhou. Tente de novo!</p>`;
        }

        const label = this.symbols[symbol].label;
        const detail = prize.type === "gold"
            ? `+${prize.amount.toLocaleString("pt-BR")} de ouro`
            : `+${prize.quantity}x ${prize.item.name}`;

        return `<p class="casino-result casino-win">Ganhou ${label}! ${detail}</p>`;

    }

    registerModalEvents() {

        this.overlay.querySelector(".casino-close")?.addEventListener("click", () => this.hide());
        this.overlay.querySelector(".casino-spin-button")?.addEventListener("click", () => this.handleSpin());

    }

    async handleSpin() {

        if (this.spinning) return;
        if (this.freeSpinsLeft === null) return; // ainda carregando

        const player = this.game.player;
        const hadFreeLocally = this.freeSpinsLeft > 0;

        if (!hadFreeLocally && !CasinoService.canAfford(player)) {
            Toast.show("Ouro insuficiente pra apostar.");
            return;
        }

        this.spinning = true;
        this.lastResult = null;
        this.render();

        // Só confia que é grátis se o SERVIDOR aceitar a proposta (ver
        // CasinoDailyService — a validação real está em
        // firestore.rules). Se não tinha grátis localmente, nem tenta.
        const gotFree = hadFreeLocally && await CasinoDailyService.consumeFreeSpin(this.uid, SaveService.activeSlot);

        if (!this.overlay) return; // fechado durante a checagem

        if (gotFree) {
            this.freeSpinsLeft = Math.max(0, this.freeSpinsLeft - 1);
        } else if (!CasinoService.canAfford(player)) {
            // Achava que tinha grátis mas o servidor recusou (outra aba,
            // relógio do PC errado, etc.) e também não tem ouro.
            this.freeSpinsLeft = 0;
            this.spinning = false;
            Toast.show("Suas gratuitas de hoje já acabaram e você não tem ouro suficiente.");
            this.render();
            return;
        }

        const result = CasinoService.spin(player, { free: gotFree });

        if (!result.ok) {
            this.spinning = false;
            Toast.show(result.reason ?? "Não foi possível apostar agora.");
            this.render();
            return;
        }

        await this.playSpinAnimation(result.grid);

        // O modal pode ter sido fechado (hide()) durante a animação —
        // sem overlay não tem o que atualizar.
        if (!this.overlay) return;

        this.spinning = false;
        this.lastResult = result;
        this.idleGrid = result.grid;

        this.render();

    }

    // Resolve o prêmio ANTES de animar (ver CasinoService.spin) — a
    // animação é só um reveal visual do resultado, nunca decide ele.
    // Cada bobina recebe uma faixa de símbolos aleatórios + os 3 finais
    // no fim, e translada até parar exatamente nos 3 finais, com um
    // atraso crescente por bobina (efeito clássico de caça-níquel).
    playSpinAnimation(grid) {

        return new Promise(resolve => {

            const strips = this.overlay?.querySelectorAll(".casino-reel-strip");

            if (!strips || !strips.length) {
                resolve();
                return;
            }

            let settled = 0;
            const onSettle = () => {
                settled++;
                if (settled >= strips.length) resolve();
            };

            const symbolIds = Object.keys(this.symbols);

            strips.forEach((stripEl, index) => {

                const filler = Array.from(
                    { length: FILLER_SYMBOLS },
                    () => symbolIds[Math.floor(Math.random() * symbolIds.length)]
                );
                const fullStrip = [...filler, ...grid[index]];

                stripEl.innerHTML = fullStrip.map(symbol => this.renderSymbolCell(symbol)).join("");
                stripEl.style.transition = "none";
                stripEl.style.transform = "translateY(0px)";

                // Força o navegador a aplicar o translateY(0) acima antes
                // de ligar a transição — senão o salto pro início e a
                // animação até o final viram uma coisa só, sem efeito.
                void stripEl.offsetHeight;

                const finalOffset = -(fullStrip.length - 3) * CELL_HEIGHT;
                const duration = REEL_STOP_DELAYS[index] ?? REEL_STOP_DELAYS[REEL_STOP_DELAYS.length - 1];

                let done = false;
                const finish = () => {
                    if (done) return;
                    done = true;
                    clearTimeout(fallbackTimer);
                    stripEl.removeEventListener("transitionend", finish);
                    onSettle();
                };

                // Fallback por tempo — se a aba for pro fundo ou o
                // transitionend não disparar por algum motivo, a aposta
                // já foi resolvida de qualquer forma (ver handleSpin),
                // então não pode travar o modal em "Girando..." pra sempre.
                const fallbackTimer = setTimeout(finish, duration + 300);

                stripEl.addEventListener("transitionend", finish);

                requestAnimationFrame(() => {
                    stripEl.style.transition = `transform ${duration}ms cubic-bezier(.12,.68,.2,1)`;
                    stripEl.style.transform = `translateY(${finalOffset}px)`;
                });

            });

        });

    }

}
