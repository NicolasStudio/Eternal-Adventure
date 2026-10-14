import SaveService from "../../../services/SaveService.js";
import AuthService from "../../../services/AuthService.js";
import CharacterSelectModal, { escapeHtml } from "./CharacterSelectModal.js";
import FarmConfirmModal from "./FarmConfirmModal.js";
import Toast from "../Toast.js";

// Exclusão de UM personagem só (diferente de AccountDangerModal, que
// apaga a conta inteira) — mostra cada slot já ocupado com um botão
// vermelho "Deletar", confirmando antes (FarmConfirmModal) e chamando
// SaveService.deleteCharacterSlot. Reaproveita os cartões visuais de
// CharacterSelectModal (.character-slot-filled, mesma classe/CSS da
// tela "Continuar").
export default class DeleteCharacterModal {

    constructor() {
        this.overlay = null;
        this.confirmModal = new FarmConfirmModal();
    }

    get uid() {
        return AuthService.getCurrentUser()?.uid ?? null;
    }

    get container() {
        return SaveService.container ?? SaveService.loadFromLocalStorage();
    }

    show() {

        this.hide();

        this.overlay = document.createElement("div");
        this.overlay.className = "home-confirm-overlay";
        this.overlay.innerHTML = this.renderModal();

        document.body.appendChild(this.overlay);

        this.registerEvents();

    }

    renderModal() {
        return `
            <div class="character-select-modal delete-character-modal">
                <button class="close-btn character-select-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <h2 class="character-select-title">Excluir Personagem</h2>
                <p class="delete-character-warning">Ação permanente e não pode ser desfeita.</p>
                ${this.renderSlots()}
            </div>
        `;
    }

    renderSlots() {

        const container = this.container;
        const slots = [1, 2].filter(slot => SaveService.hasCharacter(container, slot));

        if (!slots.length) {
            return `<p class="delete-character-empty">Nenhum personagem pra excluir.</p>`;
        }

        return slots.map(slot => {

            const character = container.slots[slot];
            const characterClass = CharacterSelectModal.resolveClass(character);

            return `
                <div class="character-slot character-slot-filled delete-character-slot">
                    <img src="${characterClass.image}" alt="${escapeHtml(characterClass.name)}">
                    <div class="character-slot-info">
                        <strong>${escapeHtml(character.name ?? characterClass.name)}</strong>
                        <span>${escapeHtml(characterClass.name)}</span>
                        <small>Nível ${character.level ?? 1}</small>
                    </div>
                    <button class="delete-character-button" data-slot="${slot}">
                        <i class="fa-solid fa-trash"></i>
                        Deletar
                    </button>
                </div>
            `;

        }).join("");

    }

    registerEvents() {

        this.overlay.querySelector(".character-select-close")?.addEventListener("click", () => this.hide());

        this.overlay.querySelectorAll(".delete-character-button").forEach(button => {
            button.addEventListener("click", () => this.confirmDelete(Number(button.dataset.slot)));
        });

    }

    async confirmDelete(slot) {

        const character = this.container?.slots?.[slot];

        if (!character) return;

        const characterClass = CharacterSelectModal.resolveClass(character);
        const name = character.name ?? characterClass.name;

        const confirmed = await this.confirmModal.show({
            title: "Excluir personagem",
            message: `Tem certeza que quer excluir <strong>${escapeHtml(name)}</strong> (nível ${character.level ?? 1})? Essa ação é PERMANENTE — todo o progresso dele se perde pra sempre, sem volta.`,
            confirmLabel: "Excluir",
            danger: true
        });

        if (!confirmed) return;

        const uid = this.uid;

        if (!uid) {
            Toast.show("Entre na sua conta pra excluir um personagem.");
            return;
        }

        try {

            await SaveService.deleteCharacterSlot(uid, slot);

            Toast.show(`${name} foi excluído.`);

            // Redesenha com o slot já removido — o modal continua
            // aberto pra excluir o outro personagem também, se quiser.
            this.show();

        } catch (err) {

            console.warn("Falha ao excluir personagem:", err);
            Toast.show("Não foi possível excluir o personagem agora.");

        }

    }

    hide() {

        this.confirmModal.hide();

        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

    }

}
