import PetService from "../../../services/PetService.js";
import Toast from "../Toast.js";
import FarmConfirmModal from "./FarmConfirmModal.js";

export default class VeterinaryModal {

    constructor(game) {

        this.game = game;
        this.overlay = null;
        this.resolve = null;
        this.selectedUid = null;
        this.confirmModal = new FarmConfirmModal();
    }

    show() {

        if (this.overlay) {
            return new Promise(resolve => {
                this.resolve = resolve;
            });
        }

        this.selectedUid = null;
        this.overlay = document.createElement("div");
        this.overlay.className = "vet-modal-overlay";

        this.render();

        document.body.appendChild(this.overlay);

        this.registerEvents();

        return new Promise(resolve => {
            this.resolve = resolve;
        });

    }

    getPets() {
        return this.game.player.inventory.filter(item => item.type === "pet" && item.shocked);
    }

    getSelectedPet() {
        return this.getPets().find(pet => pet.uid === this.selectedUid) ?? null;
    }

    render() {

        const player = this.game.player;
        const pets = this.getPets();
        const selected = this.getSelectedPet();
        const price = selected ? PetService.getConversionPrice(selected) : 0;
        const canConvert = !!selected && player.gold >= price;

        this.overlay.innerHTML = `
            <section class="blacksmith-window">

                <header class="market-header">
                    <div>
                        <h2>Veterinário</h2>
                    </div>
                    <button class="close-btn market-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="blacksmith-body">

                    <aside class="blacksmith-left">
                        ${pets.length === 0
                            ? `<div class="blacksmith-empty">
                                    <i class="fa-solid fa-paw"></i>
                                    <p>Nenhum pet chocado no inventário.</p>
                               </div>`
                            : `<div class="blacksmith-weapon-grid">
                                    ${pets.map(pet => `
                                        <button class="blacksmith-slot vet-pet-slot ${pet.uid === this.selectedUid ? "selected" : ""}" data-uid="${pet.uid}">
                                            <img src="${pet.icon}" alt="${pet.name}">
                                        </button>
                                    `).join("")}
                               </div>`}
                    </aside>

                    <section class="blacksmith-right">

                        <div class="blacksmith-anvil">

                            <h3 class="blacksmith-title">Conversor</h3>

                            <p class="blacksmith-subtitle">
                                Converta um pet em Ração: a XP acumulada dele fica guardada na ração.
                            </p>

                            <button class="blacksmith-anvil-slot vet-slot" ${selected ? "" : "disabled"}>
                                ${selected
                                    ? `<img class="blacksmith-anvil-image" src="${selected.icon}" alt="${selected.name}">
                                       <h3>${selected.name}</h3>
                                       <p class="vet-slot-note">Vira ${PetService.getTotalXp(selected)} XP em ração · clique pra remover</p>`
                                    : `<div class="blacksmith-anvil-placeholder"><i class="fa-solid fa-paw"></i></div>`}
                            </button>

                        </div>

                    </section>

                </div>

                <footer class="blacksmith-footer">

                    <div class="blacksmith-footer-info">

                        <div class="blacksmith-footer-section">
                            <i class="fa-solid fa-coins"></i>
                            <div class="blacksmith-footer-text">
                                <span class="label">SEU OURO</span>
                                <span class="value">${player.gold.toLocaleString("pt-BR")}</span>
                            </div>
                        </div>

                        <div class="blacksmith-footer-divider"></div>

                        <div class="blacksmith-footer-section">
                            <i class="fa-solid fa-paw"></i>
                            <div class="blacksmith-footer-text">
                                <span class="label">PREÇO</span>
                                <span class="value">${price.toLocaleString("pt-BR")}</span>
                            </div>
                        </div>

                    </div>

                    <button class="blacksmith-upgrade-button vet-convert" ${canConvert ? "" : "disabled"}>
                        <i class="fa-solid fa-paw"></i>
                        Converter
                    </button>

                </footer>

            </section>
        `;

    }

    registerEvents() {

        this.overlay.querySelector(".market-close").addEventListener("click", () => this.hide());

        this.overlay.querySelectorAll(".vet-pet-slot").forEach(button => {
            button.addEventListener("click", () => {
                this.selectedUid = button.dataset.uid;
                this.refresh();
            });
        });

        this.overlay.querySelector(".vet-slot").addEventListener("click", () => {
            this.selectedUid = null;
            this.refresh();
        });

        this.overlay.querySelector(".vet-convert").addEventListener("click", async () => {
            const pet = this.getSelectedPet();
            if (!pet) return;

            const confirmed = await this.confirmModal.show({
                title: "Tem certeza?",
                message: "A conversão transformará seu pet em ração, ocasionando o desaparecimento do mesmo.",
                confirmLabel: "SIM",
                cancelLabel: "NÃO",
                yesClass: "continue-yes-success",
                noClass: "continue-no-danger"
            });

            if (!confirmed) return;

            const result = PetService.convertToRation(this.game.player, pet);
            Toast.show(result.message);

            if (result.ok) this.selectedUid = null;

            this.refresh();
        });

    }

    refresh() {

        if (!this.overlay) return;

        this.render();
        this.registerEvents();

    }

    hide() {

        if (!this.overlay) return;

        this.overlay.remove();
        this.overlay = null;

        const resolve = this.resolve;
        this.resolve = null;
        resolve?.(null);

    }

}
