import classes from "../../../player/classes.js";
import upClasse from "../../../player/upClasse.js";
import SaveService, { MAX_SLOTS } from "../../../services/SaveService.js";
import Toast from "../Toast.js";

// Preço exibido do slot extra. A compra em si ainda não existe (precisa
// de um servidor confirmando o pagamento — o navegador nunca pode
// liberar o slot sozinho), então o botão Comprar só avisa por enquanto.
const EXTRA_SLOT_PRICE = "R$ 5,00";

// Pagamento manual (por enquanto): o jogador copia o Pix, transfere e manda o
// comprovante com o nick no WhatsApp. Quem libera o slot é você, em
// entitlements/{uid} no Firestore.
const PIX_COPIA_E_COLA = "00020101021126580014br.gov.bcb.pix013697db79d0-23c1-485f-b1f9-52286f3c28a652040000530398654045.005802BR5918NICOLAS DE A SOUSA6013FRANCISCO MOR62070503***630437C3";

// Biblioteca de QR code guardada no projeto (a CSP só deixa script do próprio
// site, então não dá pra carregar de um CDN).
const QR_LIBRARY_SRC = "assets/js/vendor/qrcode.js";

// Copia um texto. Tenta a API moderna; se o navegador negar, usa um campo
// temporário escondido (funciona em contexto sem HTTPS, por exemplo).
async function copyText(text) {

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // cai no método antigo abaixo
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();

    const copied = document.execCommand("copy");

    helper.remove();

    return copied;

}

function loadQrLibrary() {

    if (typeof window.qrcode === "function") return Promise.resolve();

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = QR_LIBRARY_SRC;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Falha ao carregar a biblioteca de QR code."));
        document.head.appendChild(script);
    });

}
const PIX_MENSAGEM = "O serviço de pagamento ainda funciona de forma manual e está sendo liberado para testes, para identificar o comportamento dos usuários e do sistema. Por isso, o valor cobrado é simbólico, apenas como um incentivo. Após realizar a transferência, encaminhe o comprovante junto com seu nick para o nosso WhatsApp: 11941377733, e aguarde alguns instantes.";

// O nome vem do save — nunca pode entrar como HTML.
function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}

// Tela do "Continuar" da Home: um cartão por slot da conta. Personagem
// existente vira "Jogar"; slot livre dentro do limite vira "Novo
// personagem"; slot acima do limite fica bloqueado (compra).
export default class CharacterSelectModal {

    constructor() {
        this.overlay = null;
        this.purchase = null;
    }

    // Classe "real" do personagem: a transcendida (Portal da Luz/Trevas) se a
    // dungeon correspondente já foi vencida — mesma regra do
    // SaveService.deserialize —, senão a classe base.
    static resolveClass(data) {

        const base = classes[data.classId] ?? { name: "Aventureiro", image: "" };
        const soul = data.progress?.soulChoice;

        if (!soul) return base;

        const dungeonId = soul === "dark" ? "dark_dungeon" : "light_dungeon";

        if (!data.progress?.dungeons?.[dungeonId]?.completed) return base;

        const key = Object.keys(upClasse).find(k => k.toLowerCase() === `${soul}_${data.classId}`.toLowerCase());

        return upClasse[key] ?? base;

    }

    renderSlot(container, slot, maxSlots) {

        if (SaveService.hasCharacter(container, slot)) {

            const character = container.slots[slot];
            const characterClass = CharacterSelectModal.resolveClass(character);

            return `
                <button class="character-slot character-slot-filled" data-action="play" data-slot="${slot}">
                    <img src="${characterClass.image}" alt="${escapeHtml(characterClass.name)}">
                    <div class="character-slot-info">
                        <strong>${escapeHtml(character.name ?? characterClass.name)}</strong>
                        <span>${escapeHtml(characterClass.name)}</span>
                        <small>Nível ${character.level ?? 1}</small>
                    </div>
                    <span class="character-slot-action">Jogar</span>
                </button>
            `;

        }

        if (slot <= maxSlots) {

            return `
                <button class="character-slot character-slot-new" data-action="create" data-slot="${slot}">
                    <i class="fa-solid fa-plus"></i>
                    <div class="character-slot-info">
                        <strong>Novo personagem</strong>
                        <span>Escolha um nome e uma classe</span>
                    </div>
                </button>
            `;

        }

        return `
            <button class="character-slot character-slot-locked" data-action="purchase" data-slot="${slot}">
                <i class="fa-solid fa-lock"></i>
                <div class="character-slot-info">
                    <strong>Slot bloqueado</strong>
                    <span>Libere um personagem extra nesta conta</span>
                </div>
            </button>
        `;

    }

    // Resolve { slot } pra jogar com um personagem existente, { create: slot }
    // pra criar um novo nesse slot, ou null se fechou a tela.
    show(container, maxSlots = 1) {

        return new Promise(resolve => {

            this.hide();

            const slots = Array.from({ length: MAX_SLOTS }, (_, index) => this.renderSlot(container, index + 1, maxSlots));

            this.overlay = document.createElement("div");
            this.overlay.className = "home-confirm-overlay";
            this.overlay.innerHTML = `
                <div class="character-select-modal">
                    <button class="close-btn character-select-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <h2 class="character-select-title">Seus Personagens</h2>
                    ${slots.join("")}
                </div>
            `;

            document.body.appendChild(this.overlay);

            const finish = (result) => {
                this.hide();
                resolve(result);
            };

            this.overlay.querySelector(".character-select-close").addEventListener("click", () => finish(null));

            this.overlay.querySelectorAll("[data-action]").forEach(button => {
                button.addEventListener("click", () => {

                    const slot = Number(button.dataset.slot);

                    if (button.dataset.action === "play") finish({ slot });
                    else if (button.dataset.action === "create") finish({ create: slot });
                    else this.showPurchase();

                });
            });

        });

    }

    // Desenha o QR do código Pix na imagem do painel. Se a biblioteca não
    // carregar, o painel continua funcionando com o copia e cola.
    async renderPixQr(purchase) {

        try {

            await loadQrLibrary();

            const qr = window.qrcode(0, "M");
            qr.addData(PIX_COPIA_E_COLA);
            qr.make();

            const image = purchase.querySelector(".character-slot-pix-qr");
            image.src = qr.createDataURL(6, 4);
            image.hidden = false;

        } catch (err) {
            console.warn("Não foi possível gerar o QR code do Pix:", err);
        }

    }

    showPurchase() {

        const purchase = document.createElement("div");
        purchase.className = "home-confirm-overlay";
        purchase.innerHTML = `
            <div class="home-confirm-modal character-slot-purchase">
                <h3><i class="fa-solid fa-lock-open"></i> Slot extra</h3>
                <p>
                    Libera mais um personagem nesta conta.
                    Os personagens atuais continuam salvos.
                </p>
                <strong class="character-slot-price">${EXTRA_SLOT_PRICE}</strong>
                <img class="character-slot-pix-qr" alt="QR Code Pix" hidden>
                <p class="character-slot-pix-message">${escapeHtml(PIX_MENSAGEM)}</p>
                <div class="home-confirm-actions">
                    <button class="home-confirm-no">Voltar</button>
                    <button class="character-slot-copy">Copiar código Pix</button>
                </div>
            </div>
        `;

        document.body.appendChild(purchase);

        this.renderPixQr(purchase);

        purchase.querySelector(".home-confirm-no").addEventListener("click", () => purchase.remove());

        purchase.querySelector(".character-slot-copy").addEventListener("click", async () => {

            const copied = await copyText(PIX_COPIA_E_COLA);

            Toast.show(copied ? "Código Pix copiado." : "Não foi possível copiar o código Pix.");

        });

        this.purchase = purchase;

    }

    hide() {

        this.purchase?.remove();
        this.purchase = null;

        if (!this.overlay) return;

        this.overlay.remove();
        this.overlay = null;

    }

}
