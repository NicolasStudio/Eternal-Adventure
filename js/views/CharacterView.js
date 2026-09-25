import Toast from "../ui/components/Toast.js";
import ItemTooltip from "../views/ItemTooltip.js";
import SeedTooltip from "../views/SeedTooltip.js";
import PetTooltip from "../views/PetTooltip.js";
import PetService from "../services/PetService.js";
import PowerService from "../services/PowerService.js";
import PetFeedModal from "../ui/components/modals/PetFeedModal.js";
import FarmConfirmModal from "../ui/components/modals/FarmConfirmModal.js";

export default class CharacterView {
    constructor(game) {
        this.game = game;
        this.leftTab = "status";
        this.rightTab = "weapon";
        this.selectedSlot = null;
        this.selectedItem = null;
        this.selectedEquipment = null;
        this.petFeedModal = new PetFeedModal();
        this.releasePetModal = new FarmConfirmModal();
    }

    // Semente (category:"seed") ou colheita da Fazenda (petFeedValue,
    // ver farmCrops.js) — os dois tipos de "comida" que saem da aba
    // "Itens" genérica e vão pra aba própria "Comidas".
    static isFood(item) {
        return item.category === "seed" || item.petFeedValue > 0;
    }

    getFilteredInventory() {
        return this.game.player.inventory.filter(item => {
            switch (this.rightTab) {
                case "weapon": return item.slot === "weapon";
                case "helmet": return item.slot === "helmet";
                case "chest": return item.slot === "chest";
                case "leg": return item.slot === "leg";
                case "boot": return item.slot === "boot";
                case "item": return item.type === "item" && !CharacterView.isFood(item);
                case "food": return item.type === "item" && CharacterView.isFood(item);
                case "pet": return item.type === "pet";
                default:
                    // console.warn(`Aba desconhecida: ${this.rightTab}`);
                    return false;
            }
        });
    }

    renderStatus() {

        const player = this.game.player;
        const stats = player.stats.getFinalStats();
        const power = PowerService.getBreakdown(player);

        const requiredXP = player.getRequiredXP();

        const hpPercent = Math.min(
            (player.currentHP / player.maxHP) * 100,
            100
        );

        const xpPercent = requiredXP > 0
            ? Math.min(
                (player.currentXP / requiredXP) * 100,
                100
            )
            : 100;

        return `
            <div class="character-status">

                <div class="character-avatar-wrapper">

                    <img
                        class="character-avatar"
                        src="${player.transcendence?.hud ?? player.class.hud}"
                        alt="${player.transcendence?.name ?? player.class.name}">

                    <img
                        class="character-avatar character-avatar-full"
                        src="${player.transcendence?.image ?? player.class.image}"
                        alt="${player.transcendence?.name ?? player.class.name}">

                </div>

                <h2 class="character-name">${player.transcendence?.name ?? player.class.name}</h2>

                <div class="box-info">

                    <span class="character-level">
                        Nível: ${player.level}
                    </span>

                    <span class="character-gold">
                        Ouro: ${player.gold}
                    </span>

                </div>

                <div class="character-bars">

                    <div class="character-bar">

                        <span class="character-label">HP</span>

                        <div
                            class="character-fill hp"
                            style="width:${hpPercent}%;">
                        </div>

                        <span class="character-text">
                            ${player.currentHP} / ${player.maxHP}
                        </span>

                    </div>

                    <div class="character-bar">

                        <span class="character-label">XP</span>

                        <div
                            class="character-fill xp"
                            style="width:${xpPercent}%;">
                        </div>

                        <span class="character-text">
                            ${player.currentXP} / ${requiredXP}
                        </span>

                    </div>

                </div>

                <div class="character-stats">

                    <div class="character-stat">
                        <span>Ataque</span>
                        <span>${stats.attack}</span>
                    </div>

                    <div class="character-stat">
                        <span>Armadura</span>
                        <span>${stats.armor}</span>
                    </div>

                    <div class="character-stat">
                        <span>Agilidade</span>
                        <span>${stats.agility}</span>
                    </div>

                    <div class="character-divider"><hr></div>

                    <div class="character-stat">
                        <span>Chance Crítica</span>
                        <span>${stats.criticalChance}%</span>
                    </div>

                    <div class="character-stat">
                        <span>Roubo de Vida</span>
                        <span>${stats.lifeSteal}%</span>
                    </div>

                    <div class="character-stat">
                        <span>Penetração</span>
                        <span>${stats.penetration}%</span>
                    </div>

                    <div class="character-stat">
                        <span>Absorção</span>
                        <span>${stats.absorption}%</span>
                    </div>

                    <div class="character-divider"><hr></div>

                    <div class="character-stat character-power">
                        <span><i class="fa-solid fa-fire-flame-curved"></i> Poder</span>
                        <span>${power.total.toLocaleString("pt-BR")}</span>
                    </div>

                </div>

            </div>
        `;

    }

    renderEquipped() {
        const equipment = this.game.player.equipment;
        return `
            <div class="character-equipped">
                ${this.renderEquipmentSlot("weapon", "Arma", equipment.weapon)}
                ${this.renderEquipmentSlot("helmet", "Cabeça", equipment.helmet)}
                ${this.renderEquipmentSlot("chest", "Peitoral", equipment.chest)}
                ${this.renderEquipmentSlot("leg", "Calças", equipment.leg)}
                ${this.renderEquipmentSlot("boot", "Botas", equipment.boot)}
            </div>
        `;
    }

    // Aba "Pets" — mostra o pet EQUIPADO (imagem/nome/nível/estrelas,
    // barra de fome e de XP, os atributos já escalados pela fome que
    // ele está dando ao jogador, e a habilidade). Sem pet equipado,
    // estado vazio — igual o padrão de "Nenhum item nesta categoria."
    renderPets() {

        const pet = this.game.player.equipment.pet;

        if (!pet) {
            return `
                <div class="character-pets-empty">
                    <i class="fa-solid fa-paw"></i>
                    <p>Nenhum pet equipado.</p>
                </div>
            `;
        }

        const scaled = PetService.getScaledStats(pet);
        const hunger = PetService.getHunger(pet);
        const maxHunger = PetService.getMaxHunger(pet);
        const hungerPercent = maxHunger > 0 ? Math.min((hunger / maxHunger) * 100, 100) : 100;
        const xpRequired = PetService.getXpForNextLevel(pet.level);
        const xpPercent = xpRequired > 0 ? Math.min((pet.xp / xpRequired) * 100, 100) : 100;
        const ability = PetService.getCurrentStage(pet)?.habilities?.hability;

        // Sem dano/cura/mímico pra mostrar (ex: Urso — só armadura
        // passiva, já contabilizada na Armadura acima) mostra "Passiva"
        // em vez de um valor vazio.
        const abilityValue = ability ? [
            scaled.biteDamage > 0 ? `${scaled.biteDamage} de dano` : null,
            scaled.healAmount > 0 ? `${scaled.healAmount} de cura` : null,
            // Mímico não tem dano fixo pra mostrar (é uma fração do
            // golpe de cada turno, só sabida em combate) — mostra a
            // fração em vez de um número inventado.
            ability.mimicRatio > 0 ? `1/${Math.round(1 / ability.mimicRatio)} do dano causado` : null
        ].filter(Boolean).join(" + ") || "Passiva" : "";

        return `
            <div class="character-status character-pets">

                <div class="character-avatar-wrapper character-avatar-wrapper-pet">
                    <img class="character-avatar" src="${pet.image ?? pet.icon}" alt="${pet.name}">
                </div>

                <h2 class="character-name">${pet.name}</h2>

                <div class="box-info">
                    <span class="character-level">Nível: ${pet.level}</span>
                    <span class="pet-stars">${pet.stars ?? ""}</span>
                </div>

                <div class="character-bars">

                    <div class="character-bar">
                        <span class="character-label">Fome</span>
                        <div class="character-fill pet-hunger" style="width:${hungerPercent}%;"></div>
                        <span class="character-text">${hunger} / ${maxHunger}</span>
                    </div>

                    <div class="character-bar">
                        <span class="character-label">XP</span>
                        <div class="character-fill xp" style="width:${xpPercent}%;"></div>
                        <span class="character-text">${pet.xp} / ${xpRequired}</span>
                    </div>

                </div>

                <div class="character-stats">

                    <div class="character-stat">
                        <span>Vida</span>
                        <span>${scaled.life}</span>
                    </div>

                    <div class="character-stat">
                        <span>Ataque</span>
                        <span>${scaled.attack}</span>
                    </div>

                    <div class="character-stat">
                        <span>Armadura</span>
                        <span>${scaled.armor}</span>
                    </div>

                    <div class="character-stat">
                        <span>Agilidade</span>
                        <span>${scaled.agility}</span>
                    </div>

                    ${ability ? `
                        <div class="character-divider"><hr></div>
                        <div class="character-stat pet-ability">
                            <span>${ability.name}</span>
                            <span>${abilityValue}</span>
                        </div>
                    ` : ""}

                </div>

            </div>
        `;

    }

    renderEquipmentSlot(slot, title, item) {
        return `
            <div class="equipment-slot ${item ? "filled" : ""}" data-slot="${slot}">
                <div class="equipment-header">
                    <div class="equipment-image">
                        ${item ? `<img src="${item.icon}" alt="${item.name}">` : ""}
                    </div>
                    <div class="equipment-info">
                        <span class="equipment-name">${title}</span>
                        <span class="equipment-item">${item ? item.name : "Nenhum"}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderLeftTabs() {
        return `
            <div class="character-tabs">
                <button class="character-tab ${this.leftTab === "status" ? "active" : ""}" data-tab="status">Status</button>
                <button class="character-tab ${this.leftTab === "equipped" ? "active" : ""}" data-tab="equipped">Equipados</button>
                <button class="character-tab ${this.leftTab === "pets" ? "active" : ""}" data-tab="pets">Pets</button>
            </div>
        `;
    }

    renderLeftContent() {
        switch (this.leftTab) {
            case "status": return this.renderStatus();
            case "equipped": return this.renderEquipped();
            case "pets": return this.renderPets();
            default: return "";
        }
    }

    // Quais abas do inventário (lado direito) fazem sentido junto de
    // cada aba do personagem (lado esquerdo) — evita poluir a tela com
    // abas de equipamento normal enquanto o foco é Pets, e vice-versa.
    static RIGHT_TABS = [
        { id: "weapon", label: "Armas" },
        { id: "helmet", label: "Cabeça" },
        { id: "chest", label: "Peitoral" },
        { id: "leg", label: "Calças" },
        { id: "boot", label: "Botas" },
        { id: "item", label: "Itens" },
        { id: "food", label: "Comidas" },
        { id: "pet", label: "Pets" }
    ];

    getVisibleRightTabs() {

        // Pets: só Comidas (semente/colheita, pra alimentar) e Pets.
        if (this.leftTab === "pets") {
            return CharacterView.RIGHT_TABS.filter(tab => tab.id === "food" || tab.id === "pet");
        }

        // Equipados: só os 5 slots de equipamento — nem Itens, Comidas
        // ou Pets fazem sentido junto de "o que estou usando agora".
        if (this.leftTab === "equipped") {
            return CharacterView.RIGHT_TABS.filter(tab => tab.id !== "item" && tab.id !== "food" && tab.id !== "pet");
        }

        // Status: equipamento + Itens — nem Comidas nem Pets aparecem
        // aqui, só na aba Pets.
        return CharacterView.RIGHT_TABS.filter(tab => tab.id !== "food" && tab.id !== "pet");

    }

    // Chamado ao trocar de aba esquerda — se a aba direita atual não
    // faz mais parte do conjunto visível (ex: estava em "Armas" e foi
    // pra Pets), cai pra primeira opção que ainda existe, em vez de
    // ficar "presa" numa aba sem botão nenhum pra voltar pra ela.
    syncRightTabVisibility() {

        const visible = this.getVisibleRightTabs();

        if (!visible.some(tab => tab.id === this.rightTab)) {
            this.rightTab = visible[0]?.id ?? "item";
        }

    }

    renderRightTabs() {
        return `
            <div class="inventory-tabs">
                ${this.getVisibleRightTabs().map(tab => `
                    <button class="inventory-tab ${this.rightTab === tab.id ? "active" : ""}" data-tab="${tab.id}">${tab.label}</button>
                `).join("")}
            </div>
        `;
    }

    renderInventoryGrid() {
        const inventory = this.getFilteredInventory();
        let html = "";
        inventory.forEach((item, index) => {
            html += `
                <div class="inventory-slot has-item">

                    <img
                        class="inventory-icon"
                        src="${item.icon}"
                        alt="${item.name}"
                    >

                    ${
                        item.quantity > 1
                            ? `<span class="inventory-quantity">${item.quantity}</span>`
                            : ""
                    }

                </div>
            `;
        });
        if (inventory.length === 0) {
            return `<div class="inventory-empty">Nenhum item nesta categoria.</div>`;
        }
        // Aba Pets usa slots maiores (120px) — ovo/pet é único por
        // slot, então não compete por espaço com uma grade densa como
        // as de equipamento normal.
        const gridClass = this.rightTab === "pet" ? "inventory-grid inventory-grid-pet" : "inventory-grid";
        return `<div class="${gridClass}">${html}</div>`;
    }

    registerEquipmentEvents(container) {

        const slots = container.querySelectorAll(".equipment-slot.filled");

        slots.forEach(slot => {

            const slotName = slot.dataset.slot;
            const item = this.game.player.equipment[slotName];

            if (!item) return;

            slot.addEventListener("click", () => {

                container.querySelectorAll(".equipment-slot").forEach(s => s.classList.remove("selected"));

                slot.classList.add("selected");

                this.selectedEquipment = {
                    slot: slotName,
                    item
                };

                this.selectedItem = null;

                container.querySelectorAll(".inventory-slot").forEach(s => s.classList.remove("selected"));

                const actionButton = container.querySelector(".action-button");
                const unequipButton = container.querySelector(".unequip-button");

                if (actionButton) {

                    actionButton.disabled = true;
                    actionButton.textContent = "Equipar";

                }

                if (unequipButton) {
                    unequipButton.disabled = false;
                }

                // Selecionar equipamento normal não é poção nem
                // alimento de pet — esconde qualquer botão desses que
                // tivesse ficado visível de uma seleção anterior.
                const maxHealButton = container.querySelector(".max-heal-button");
                const feedButton = container.querySelector(".feed-button");
                const petLevelUpButton = container.querySelector(".pet-levelup-button");
                const releasePetButton = container.querySelector(".release-pet-button");

                if (maxHealButton) maxHealButton.style.display = "none";
                if (feedButton) feedButton.style.display = "none";
                if (petLevelUpButton) petLevelUpButton.style.display = "none";
                if (releasePetButton) releasePetButton.style.display = "none";

            });

            // Tooltip
            slot.addEventListener("mouseenter", (event) => {

                this.showTooltip(
                    item,
                    event.clientX,
                    event.clientY
                );

            });

            slot.addEventListener("mousemove", (event) => {

                if (!document.getElementById("item-tooltip")) return;

                this.updateTooltipPosition(
                    event.clientX,
                    event.clientY
                );

            });

            slot.addEventListener("mouseleave", () => {

                this.hideTooltip();

            });

        });

    }

    equipSelectedItem() {

        if (!this.selectedItem) return;

        // Consumível
        if (this.selectedItem.heal) {

            if (this.game.player.currentHP >= this.game.player.maxHP) {
                Toast.show("Sua vida já está cheia.");
                return;
            }

            this.game.player.health.heal(this.selectedItem.heal);
            this.game.player.removeItem(this.selectedItem);

            Toast.show(
                `${this.selectedItem.name} utilizada! (+${this.selectedItem.heal} HP)`
            );

            this.selectedItem = null;

            this.refresh();

            return;
        }

        // Pedra de encantamento — atalho: fecha o inventário e já abre
        // a Ferraria em Encantar. Identificada por enchantPrice, não
        // por "não tem slot" — sementes e colheitas da Fazenda também
        // não têm slot, mas não são pedra nenhuma (ver bloco abaixo).
        if (this.selectedItem.enchantPrice != null) {

            if (this.game.hudScreen.preparationMode) {
                Toast.show("Você não pode ir até a Ferraria durante uma dungeon.");
                return;
            }

            this.game.hudScreen.changeView("blacksmith-enchant");

            return;
        }

        // Ovo — choca (vira equipável, ganha slot:"pet" nesse momento;
        // um pet JÁ chocado tem slot desde então e cai no bloco de
        // Equipamento normal, logo abaixo).
        if (this.selectedItem.type === "pet" && !this.selectedItem.shocked) {

            const result = PetService.hatch(this.game.player, this.selectedItem);

            Toast.show(result.message);

            if (result.ok) this.selectedItem = null;

            this.refresh();

            return;

        }

        // Alimento pro pet (ex: colheita da Fazenda) — sem ação própria
        // aqui, os botões dedicados "Alimentar"/"Upar Pet" é que cuidam
        // disso (abrem o modal de quantidade).
        if (this.selectedItem.petFeedValue > 0) {
            return;
        }

        // Equipamento (inclui pet já chocado, que tem slot:"pet")
        if (this.selectedItem.slot) {

            this.game.player.equipItem(this.selectedItem);

            Toast.show(`${this.selectedItem.name} equipado`);

            this.selectedItem = null;

            this.refresh();

            return;

        }

        // Nem poção, nem pedra, nem equipamento, nem ovo, nem alimento
        // de pet — nada a fazer com esse item por aqui.
        Toast.show("Este item não pode ser usado.");

    }

    // "Alimentar": abre o modal de quantidade limitado ao que é JUSTO
    // pra encher a fome (0 até o necessário) — não sugere desperdiçar
    // alimento à toa.
    async openFeedModal() {

        if (!(this.selectedItem?.petFeedValue > 0)) return;

        const pet = this.game.player.equipment.pet;

        if (!pet) {
            Toast.show("Equipe um pet pra poder alimentá-lo.");
            return;
        }

        const max = PetService.getUnitsNeededToFillHunger(pet, this.selectedItem);

        if (max <= 0) {
            Toast.show("Esse pet já está sem fome.");
            return;
        }

        const units = await this.petFeedModal.show({
            title: "Alimentar",
            item: this.selectedItem,
            max,
            hint: `Quantidade necessária pra encher a fome de ${pet.name}.`
        });

        if (!units) return;

        const result = PetService.feedUnits(this.game.player, pet, this.selectedItem, units);

        Toast.show(result.message);

        this.selectedItem = null;

        this.refresh();

    }

    // "Upar Pet": mesmo modal, mas libera até TODO o estoque do
    // alimento selecionado — o jogador escolhe de propósito gastar
    // mais do que precisa só pra render XP com a sobra.
    async openPetLevelUpModal() {

        if (!(this.selectedItem?.petFeedValue > 0)) return;

        const pet = this.game.player.equipment.pet;

        if (!pet) {
            Toast.show("Equipe um pet pra poder alimentá-lo.");
            return;
        }

        const max = PetService.getOwnedUnits(this.selectedItem);

        if (max <= 0) {
            Toast.show("Você não tem esse alimento.");
            return;
        }

        const units = await this.petFeedModal.show({
            title: "Upar Pet",
            item: this.selectedItem,
            max,
            hint: `O que sobrar da fome vira XP pra ${pet.name}.`
        });

        if (!units) return;

        const result = PetService.feedUnits(this.game.player, pet, this.selectedItem, units);

        Toast.show(result.message);

        this.selectedItem = null;

        this.refresh();

    }

    // Cura de uma vez, usando quantas poções forem necessárias (e
    // disponíveis) pra chegar o mais perto possível da vida máxima —
    // sem gastar mais poções do que o necessário pra cobrir a vida
    // que falta.
    useMaxHeal() {

        if (!this.selectedItem?.heal) return;

        const player = this.game.player;

        const missing = player.maxHP - player.currentHP;

        if (missing <= 0) {
            Toast.show("Sua vida já está cheia.");
            return;
        }

        const item = this.selectedItem;

        const potionsNeeded = Math.ceil(missing / item.heal);

        const potionsToUse = Math.min(potionsNeeded, item.quantity ?? 1);

        const healAmount = Math.min(missing, potionsToUse * item.heal);

        player.health.heal(healAmount);

        player.removeItem(item, potionsToUse);

        Toast.show(
            `${potionsToUse}x ${item.name} usada(s)! (+${healAmount} HP)`
        );

        this.selectedItem = null;

        this.refresh();

    }

    useSelectedItem() {

        if (!this.selectedItem) return;

        // Cura o jogador
        this.game.player.health.heal(this.selectedItem.heal);

        // Consome uma poção
        this.game.player.removeItem(this.selectedItem);

        Toast.show(
            `${this.selectedItem.name} utilizada! (+${this.selectedItem.heal} HP)`
        );

        this.selectedItem = null;

        this.refresh();

    }

    unequipSelectedItem() {
        if (!this.selectedEquipment) return;
        this.game.player.unequipItem(this.selectedEquipment.slot);
        Toast.show(`${this.selectedEquipment.item.name} desequipado`);
        this.selectedEquipment = null;
        this.refresh();
    }

    // "Liberar Pet": some com o pet/ovo selecionado (equipado ou não)
    // de vez, sem devolver nada — irreversível, por isso passa pelo
    // modal de confirmação em vermelho antes. Pet equipado precisa
    // reverter o bônus de Vida já aplicado (ver PetService.
    // syncEquippedPetContribution); pet/ovo no inventário é só um
    // removeItem normal, já que nunca empilha (quantity sempre 1).
    async releaseSelectedPet() {

        const pet = this.selectedEquipment?.slot === "pet"
            ? this.selectedEquipment.item
            : (this.selectedItem?.type === "pet" ? this.selectedItem : null);

        if (!pet) return;

        const confirmed = await this.releasePetModal.show({
            title: "Liberar Pet",
            message: `Você realmente deseja libertar <strong>${pet.name}</strong>?<span class="continue-warning">Essa ação é irreversível.</span>`,
            confirmLabel: "Sim",
            cancelLabel: "Não",
            danger: true
        });

        if (!confirmed) return;

        if (this.game.player.equipment.pet?.uid === pet.uid) {
            this.game.player.equipment.pet = null;
            PetService.syncEquippedPetContribution(this.game.player);
        } else {
            this.game.player.removeItem(pet);
        }

        Toast.show(`${pet.name} foi libertado.`);

        this.selectedItem = null;
        this.selectedEquipment = null;

        this.game.player.notify();

        this.refresh();

    }

    renderInventoryActions() {

        return `
            <div class="buttons-container">
                <button class="inventory-button equip-button" disabled>
                Equipar
            </button>
                <button class="inventory-button max-heal-button" style="display:none;">
                    Curar Vida Completa
                </button>
                <button class="inventory-button feed-button" style="display:none;">
                    Alimentar
                </button>
                <button class="inventory-button pet-levelup-button" style="display:none;">
                    Upar Pet
                </button>
                <button class="inventory-button unequip-button" disabled>
                    Desequipar
                </button>
                <button class="inventory-button release-pet-button" style="display:none;">
                    Liberar Pet
                </button>
            </div>
        `;

    }

    render() {
        return `
            <section class="character-window">
                <header class="character-header">
                    <h2>Personagem</h2>
                    <button class="character-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <div class="character-body">
                    <section class="character-left">
                        ${this.renderLeftTabs()}
                        <div class="character-tab-content">
                            ${this.renderLeftContent()}
                        </div>
                    </section>
                    <section class="character-right">
                        ${this.renderRightTabs()}
                        ${this.renderInventoryGrid()}
                        ${this.renderInventoryActions()}
                    </section>
                </div>
            </section>
        `;
    }

    registerTooltipEvents(element, item) {

        element.addEventListener("mouseenter", (event) => {

            this.showTooltip(item, event.clientX, event.clientY);

        });

        element.addEventListener("mousemove", (event) => {

            if (!document.getElementById("item-tooltip")) return;

            this.updateTooltipPosition(
                event.clientX,
                event.clientY
            );

        });

        element.addEventListener("mouseleave", () => {

            this.hideTooltip();

        });

    }

    registerEvents(container = document) {
        const tabs = container.querySelectorAll(".character-tab");
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                this.leftTab = tab.dataset.tab;
                this.syncRightTabVisibility();
                this.refresh();
            });
        });
        this.registerInventoryEvents(container);
        const inventoryTabs = container.querySelectorAll(".inventory-tab");
        inventoryTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                this.rightTab = tab.dataset.tab;
                this.refresh();
            });
        });
        this.registerEquipmentEvents(container);
        this.registerPowerTooltipEvents(container);

        // Aba Pets não tem mais slot próprio em "Equipados" pra clicar
        // e selecionar (removido de propósito — não fazia sentido um
        // slot ali quando já existe a aba dedicada). Se já tem um pet
        // equipado, o botão Desequipar compartilhado já nasce pronto
        // pra desequipar ELE, sem precisar de nenhuma seleção antes.
        if (this.leftTab === "pets") {

            const pet = this.game.player.equipment.pet;

            if (pet) {

                this.selectedEquipment = { slot: "pet", item: pet };
                this.selectedItem = null;

                const petUnequipButton = container.querySelector(".unequip-button");
                const petReleaseButton = container.querySelector(".release-pet-button");

                if (petUnequipButton) petUnequipButton.disabled = false;
                if (petReleaseButton) petReleaseButton.style.display = "";

            }

        }

        const equipButton = container.querySelector(".equip-button");
        if (equipButton) {
            equipButton.addEventListener("click", () => {
                if (equipButton.disabled) return;
                this.equipSelectedItem();
            });
        }
        const unequipButton = container.querySelector(".unequip-button");
        if (unequipButton) {
            unequipButton.addEventListener("click", () => {
                if (unequipButton.disabled) return;
                this.unequipSelectedItem();
            });
        }

        const maxHealButton = container.querySelector(".max-heal-button");
        if (maxHealButton) {
            maxHealButton.addEventListener("click", () => {
                if (maxHealButton.disabled) return;
                this.useMaxHeal();
            });
        }

        const feedButton = container.querySelector(".feed-button");
        if (feedButton) {
            feedButton.addEventListener("click", () => {
                if (feedButton.disabled) return;
                this.openFeedModal();
            });
        }

        const petLevelUpButton = container.querySelector(".pet-levelup-button");
        if (petLevelUpButton) {
            petLevelUpButton.addEventListener("click", () => {
                if (petLevelUpButton.disabled) return;
                this.openPetLevelUpModal();
            });
        }

        const releasePetButton = container.querySelector(".release-pet-button");
        if (releasePetButton) {
            releasePetButton.addEventListener("click", () => {
                if (releasePetButton.disabled) return;
                this.releaseSelectedPet();
            });
        }

        const closeButton = container.querySelector(".character-close");

        if (closeButton) {

            closeButton.addEventListener("click", async () => {

                await this.close();

            });

        }
    }

    registerInventoryEvents(container) {
        const slots = container.querySelectorAll(".inventory-slot");
        const inventory = this.getFilteredInventory();
        slots.forEach((slot, index) => {
            slot.addEventListener("click", () => {
                slots.forEach(s => s.classList.remove("selected"));
                slot.classList.add("selected");
                this.selectedItem = inventory[index];
                this.selectedEquipment = null;
                const equipButton = container.querySelector(".equip-button");
                const maxHealButton = container.querySelector(".max-heal-button");
                const feedButton = container.querySelector(".feed-button");
                const petLevelUpButton = container.querySelector(".pet-levelup-button");
                const unequipButton = container.querySelector(".unequip-button");
                const releasePetButton = container.querySelector(".release-pet-button");
                const equippedPet = this.game.player.equipment.pet;

                // Selecionar um item do inventário nunca deixa o
                // Desequipar ativo — ele só faz sentido sem nenhuma
                // seleção, na aba Pets (ver registerEvents).
                if (unequipButton) unequipButton.disabled = true;

                // Liberar Pet: ovo ou pet já chocado (ainda não
                // equipado) selecionado no inventário.
                if (releasePetButton) {
                    releasePetButton.style.display = this.selectedItem.type === "pet" ? "" : "none";
                }

                if (equipButton) {

                    equipButton.disabled = false;
                    equipButton.classList.remove("use-potion-button", "enchant-shortcut-button");

                    if (this.selectedItem.heal) {

                        equipButton.textContent = "Usar";
                        equipButton.classList.add("use-potion-button");

                        const missing = this.game.player.maxHP - this.game.player.currentHP;
                        equipButton.disabled = missing <= 0;

                    } else if (this.selectedItem.type === "pet" && !this.selectedItem.shocked) {

                        // Ovo — ainda não vira "Equipar" até chocar.
                        equipButton.textContent = "Chocar";

                    } else if (this.selectedItem.petFeedValue > 0) {

                        // Alimento (colheita da Fazenda) — a ação fica
                        // por conta dos botões dedicados Alimentar/Upar
                        // Pet, abaixo.
                        equipButton.textContent = "Sem ação";
                        equipButton.disabled = true;

                    } else if (this.selectedItem.slot) {
                        // Já cobre pet chocado (slot:"pet" desde o Chocar).
                        equipButton.textContent = "Equipar";
                    } else if (this.selectedItem.enchantPrice != null) {
                        equipButton.textContent = "Encantar";
                        equipButton.classList.add("enchant-shortcut-button");
                    } else {
                        // Semente etc — nada a fazer com esse item no
                        // inventário, então o botão fica desabilitado
                        // em vez de oferecer "Encantar" por engano.
                        equipButton.textContent = "Sem ação";
                        equipButton.disabled = true;
                    }

                }

                if (maxHealButton) {

                    if (this.selectedItem.heal && (this.selectedItem.quantity ?? 1) > 1) {

                        const missing = this.game.player.maxHP - this.game.player.currentHP;

                        maxHealButton.style.display = "";
                        maxHealButton.disabled = missing <= 0;

                    } else {

                        maxHealButton.style.display = "none";

                    }

                }

                const isPetFood = equippedPet && this.selectedItem.petFeedValue > 0;

                if (feedButton) {

                    if (isPetFood) {

                        feedButton.style.display = "";
                        feedButton.disabled = PetService.getUnitsNeededToFillHunger(equippedPet, this.selectedItem) <= 0;

                    } else {

                        feedButton.style.display = "none";

                    }

                }

                if (petLevelUpButton) {

                    if (isPetFood) {

                        petLevelUpButton.style.display = "";
                        petLevelUpButton.disabled = PetService.getOwnedUnits(this.selectedItem) <= 0;

                    } else {

                        petLevelUpButton.style.display = "none";

                    }

                }
            });
            slot.addEventListener("mousemove", (event) => {
                if (!document.getElementById("item-tooltip")) return;
                this.updateTooltipPosition(event.clientX, event.clientY);
            });
            slot.addEventListener("mouseenter", (event) => {
                const inventory = this.getFilteredInventory();
                const item = inventory[index];
                if (!item) return;
                this.showTooltip(item, event.clientX, event.clientY, { compare: true });
            });
            slot.addEventListener("mouseleave", () => {
                this.hideTooltip();
            });
        });
    }

    /* =====================================================
       TOOLTIP DO PODER — mesmo container/posicionamento do
       tooltip de item (#item-tooltip), conteúdo próprio.
    ===================================================== */

    registerPowerTooltipEvents(container) {

        const powerStat = container.querySelector(".character-power");

        if (!powerStat) return;

        powerStat.addEventListener("mouseenter", (event) => {
            this.showPowerTooltip(event.clientX, event.clientY);
        });

        powerStat.addEventListener("mousemove", (event) => {
            this.updateTooltipPosition(event.clientX, event.clientY);
        });

        powerStat.addEventListener("mouseleave", () => {
            this.hideTooltip();
        });

    }

    showPowerTooltip(x, y) {

        this.hideTooltip();

        const element = document.createElement("div");
        element.id = "item-tooltip";
        element.className = "item-tooltip power-tooltip";
        element.innerHTML = this.renderPowerTooltip();
        document.body.appendChild(element);

        this.updateTooltipPosition(x, y);

    }

    renderPowerTooltip() {

        const player = this.game.player;
        const power = PowerService.getBreakdown(player);
        const format = (value) => value.toLocaleString("pt-BR");
        const percent = (value) => power.total > 0 ? Math.round((value / power.total) * 100) : 0;

        const parts = [
            { icon: "fa-user-shield", label: "Atributos base", value: power.base },
            { icon: "fa-arrow-trend-up", label: `Nível ${player.level}`, value: power.level },
            { icon: "fa-shield-halved", label: "Equipamentos", value: power.equipment },
            { icon: "fa-paw", label: "Pet", value: power.pet }
        ];

        const equipped = Object.entries(player.equipment)
            .filter(([slot, item]) => slot !== "pet" && item)
            .map(([, item]) => item);

        return `
            <div class="power-tooltip-header">
                <i class="fa-solid fa-fire-flame-curved"></i>
                <span class="power-tooltip-title">Poder</span>
                <span class="power-tooltip-total">${format(power.total)}</span>
            </div>

            <div class="tooltip-divider"></div>

            <div class="power-tooltip-parts">
                ${parts.map(part => `
                    <div class="power-tooltip-part">
                        <div class="tooltip-row">
                            <span class="tooltip-label">
                                <i class="fa-solid ${part.icon}"></i> ${part.label}
                            </span>
                            <span class="tooltip-value">${format(part.value)} <small class="tooltip-percent">(${percent(part.value)}%)</small></span>
                        </div>
                        <div class="power-tooltip-bar">
                            <div class="power-tooltip-bar-fill" style="width:${percent(part.value)}%;"></div>
                        </div>
                    </div>
                `).join("")}
            </div>

            ${equipped.length ? `
                <div class="tooltip-divider"></div>
                <h4 class="tooltip-title">Por equipamento</h4>
                <div class="power-tooltip-items">
                    ${equipped.map(item => `
                        <div class="tooltip-row">
                            <span style="color:${item.rarity?.color ?? "#e6d2b5"};">${item.name}</span>
                            <span class="tooltip-value">${format(PowerService.getItemPower(item))}</span>
                        </div>
                    `).join("")}
                </div>
            ` : ""}

            <div class="tooltip-divider"></div>
            <p class="tooltip-description">
                Ataque, Armadura e Agilidade somados, valorizados pela raridade dos itens. Não altera o dano em combate.
            </p>
        `;

    }

    updateTooltipPosition(x, y) {
        const tooltip = document.getElementById("item-tooltip");
        if (!tooltip) return;
        const margin = 20;
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        let left;
        let top = y + margin;
        if (x + margin + tooltipWidth <= window.innerWidth) {
            left = x + margin;
        } else {
            left = x - tooltipWidth - margin;
        }
        if (left < margin) {
            left = margin;
        }
        if (top + tooltipHeight > window.innerHeight) {
            top = window.innerHeight - tooltipHeight - margin;
        }
        if (top < margin) {
            top = margin;
        }
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        // Tooltip de comparação (item equipado) — fica do outro lado da
        // principal, pra ficarem lado a lado sem sobrepor.
        const compareTooltip = document.getElementById("item-tooltip-compare");
        if (compareTooltip) {
            const compareWidth = compareTooltip.offsetWidth;
            const gap = 12;
            let compareLeft = left + tooltipWidth + gap;
            if (compareLeft + compareWidth > window.innerWidth - margin) {
                compareLeft = left - compareWidth - gap;
            }
            if (compareLeft < margin) {
                compareLeft = margin;
            }
            compareTooltip.style.left = `${compareLeft}px`;
            compareTooltip.style.top = `${top}px`;
        }
    }

    showTooltip(item, x, y, { compare = false } = {}) {

        this.hideTooltip();

        const isPet = item.type === "pet";

        const tooltip = isPet
            ? new PetTooltip(item)
            : item.category === "seed"
                ? new SeedTooltip(item)
                : new ItemTooltip(item);
        const element = document.createElement("div");
        element.id = "item-tooltip";
        element.className = "item-tooltip";
        element.innerHTML = tooltip.render();
        element.style.position = "fixed";
        element.style.zIndex = "99999";
        element.style.pointerEvents = "none";
        document.body.appendChild(element);

        // Comparação: só faz sentido pra equipamento (tem slot), e só
        // se já existir algo equipado ali que não seja o próprio item.
        // Pet também tem `slot` ("pet"), mas precisa comparar com
        // PetTooltip — o formato de equipamento (raridade/qualidade/
        // atributos fixos) não se aplica a ele.
        const equippedItem = item.slot ? this.game.player.equipment[item.slot] : null;

        if (compare && equippedItem && equippedItem.uid !== item.uid) {

            const compareTooltip = isPet ? new PetTooltip(equippedItem) : new ItemTooltip(equippedItem);
            const compareElement = document.createElement("div");
            compareElement.id = "item-tooltip-compare";
            compareElement.className = "item-tooltip item-tooltip-compare";
            compareElement.innerHTML = `
                <span class="item-tooltip-compare-label">Equipado atualmente</span>
                ${compareTooltip.render()}
            `;
            compareElement.style.position = "fixed";
            compareElement.style.zIndex = "99999";
            compareElement.style.pointerEvents = "none";
            document.body.appendChild(compareElement);

        }

        this.updateTooltipPosition(x, y);

    }

    hideTooltip() {
        const tooltip = document.getElementById("item-tooltip");
        if (tooltip) {
            tooltip.remove();
        }
        const compareTooltip = document.getElementById("item-tooltip-compare");
        if (compareTooltip) {
            compareTooltip.remove();
        }
    }

    refresh() {
        // Sem isso, um refresh disparado enquanto o mouse ainda está em
        // cima de um slot (ex: equipar/consumir o próprio item hovered)
        // destrói o node antes do mouseleave disparar, e a tooltip fica
        // "órfã" na tela — presa até o próximo clique ou até passar o
        // mouse pela navegação/toolbar (ver HudScreen.registerEvents).
        this.hideTooltip();
        const window = document.querySelector(".character-window");
        if (!window) return;
        window.outerHTML = this.render();
        this.registerEvents(document);
    }

    async close() {

        if (this.game.hudScreen.preparationMode) {

            this.game.hudScreen.exitPreparationMode();

            this.game.hudScreen.currentView = "dungeon";

            this.game.hudScreen.refreshCurrentView();

            this.game.hudScreen.updateMusic();

            if (this.game.hudScreen.onPreparationFinished) {

                const resolve =
                    this.game.hudScreen.onPreparationFinished;

                this.game.hudScreen.onPreparationFinished = null;

                resolve();

            }

            return;

        }

        this.game.hudScreen.currentView = "";

        // refreshCurrentView() (não render()+registerEvents() na mão) —
        // render() recria os botões da toolbar (Wiki/Salvar/Carregar/
        // Maximizar/Configurações) do zero, e só refreshCurrentView()
        // religa os listeners deles (toolbarHUD.registerEvents). Sem
        // isso, os botões voltavam a existir na tela mas sem nenhuma
        // ação — só "consertava" ao trocar de tela pelo menu, que já
        // passa por refreshCurrentView().
        this.game.hudScreen.refreshCurrentView();

        this.game.hudScreen.updateMusic();

    }
}