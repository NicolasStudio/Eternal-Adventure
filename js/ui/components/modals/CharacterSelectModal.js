import classes from "../../../player/classes.js";
import upClasse from "../../../player/upClasse.js";
import SaveService, { MAX_SLOTS } from "../../../services/SaveService.js";
import Toast from "../Toast.js";

// Preço exibido do slot extra. A compra em si ainda não existe (precisa
// de um servidor confirmando o pagamento — o navegador nunca pode
// liberar o slot sozinho), então o botão Comprar só avisa por enquanto.
const EXTRA_SLOT_PRICE = "R$ 5,00";

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
                <div class="home-confirm-actions">
                    <button class="home-confirm-no">Voltar</button>
                    <button class="character-slot-buy">Comprar</button>
                </div>
            </div>
        `;

        document.body.appendChild(purchase);

        purchase.querySelector(".home-confirm-no").addEventListener("click", () => purchase.remove());
        purchase.querySelector(".character-slot-buy").addEventListener("click", () => {
            Toast.show("A compra de slots ainda não está disponível.");
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
