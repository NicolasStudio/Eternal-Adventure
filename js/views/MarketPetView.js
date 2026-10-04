import Toast from "../ui/components/Toast.js";
import PetService from "../services/PetService.js";
import SaveService from "../services/SaveService.js";
import PetTooltip from "./PetTooltip.js";

export default class MarketPetView {

    constructor(game) {
        this.game = game;
        this.selectedUid = null;
    }

    get player() {
        return this.game.player;
    }

    getPets() {
        return this.player.inventory.filter(item => item.type === "pet" && item.shocked);
    }

    getSelectedPet() {
        return this.getPets().find(pet => pet.uid === this.selectedUid) ?? null;
    }

    render() {
        return `
            <section class="market-window">
                <header class="market-header">
                    <div>
                        <h2>Mercado</h2>
                        <span>Venda de pets chocados.</span>
                    </div>
                    <button class="close-btn market-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <div class="market-body">
                    <aside class="market-left">
                        ${this.renderList()}
                    </aside>
                    <section class="market-right">
                        ${this.renderDetails()}
                    </section>
                </div>
            </section>
        `;
    }

    renderList() {

        const pets = this.getPets();

        if (!pets.length) {
            return `
                <div class="market-empty">
                    <i class="fa-solid fa-paw"></i>
                    <span>Você não possui pets para vender.</span>
                </div>
            `;
        }

        return `
            <div class="market-inventory">
                <div class="market-inventory-title">
                    Pets
                    <span>${pets.length} pets</span>
                </div>
                <div class="market-item-list">
                    ${pets.map(pet => `
                        <button class="market-item ${pet.uid === this.selectedUid ? "selected" : ""}" data-uid="${pet.uid}">
                            <img src="${pet.icon}" alt="${pet.name}" class="market-item-icon">
                            <div class="market-item-content">
                                <span class="market-item-name" title="${pet.name}">${pet.name}</span>
                                <span class="market-item-rarity market-pet-level">Nv. ${pet.level} · <span class="market-pet-stars">${pet.stars}</span></span>
                            </div>
                            <div class="market-item-price">
                                ${PetService.getSellPrice(pet)}
                                <i class="fa-solid fa-coins"></i>
                            </div>
                        </button>
                    `).join("")}
                </div>
            </div>
        `;
    }

    renderDetails() {

        const pet = this.getSelectedPet();

        if (!pet) {
            return `
                <div class="market-placeholder">
                    <i class="fa-solid fa-paw"></i>
                    <span>Selecione um pet para ver o valor de venda.</span>
                </div>
            `;
        }

        const price = PetService.getSellPrice(pet);

        return `
            <div class="market-details">
                <div class="market-pet-info">
                    ${new PetTooltip(pet).render()}
                </div>
                <div class="market-sell-panel">
                    <div class="market-price">
                        <span class="market-price-label">Valor de venda</span>
                        <strong class="market-price-value">
                            <i class="fa-solid fa-coins"></i>
                            ${price}
                        </strong>
                    </div>
                    <button class="market-sell-button">
                        <i class="fa-solid fa-hand-holding-dollar"></i>
                        Vender Pet
                    </button>
                </div>
            </div>
        `;
    }

    registerEvents(container = document) {

        container.querySelector(".market-close")?.addEventListener("click", () => {
            this.game.hudScreen.changeView("city");
        });

        container.querySelectorAll(".market-item").forEach(button => {
            button.addEventListener("click", () => {
                this.selectedUid = button.dataset.uid;
                this.game.hudScreen.refreshCurrentView();
            });
        });

        container.querySelector(".market-sell-button")?.addEventListener("click", () => {
            this.sellSelectedPet();
        });

    }

    sellSelectedPet() {

        const pet = this.getSelectedPet();

        if (!pet) {
            Toast.show("Selecione um pet.");
            return;
        }

        const price = PetService.getSellPrice(pet);

        this.player.removeItem(pet);
        this.player.addGold(price);
        this.player.progress.stats.goldFromSelling = (this.player.progress.stats.goldFromSelling ?? 0) + price;

        Toast.show(`${pet.name} vendido por ${price} ouro.`);

        this.selectedUid = null;

        this.player.notify();
        SaveService.autoSave(this.player);

        this.game.hudScreen.refreshCurrentView();
    }

}
