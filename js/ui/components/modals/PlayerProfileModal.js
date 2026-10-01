import weapons from "../../../data/weapons.js";
import helmets from "../../../data/helmets.js";
import chests from "../../../data/chest.js";
import legs from "../../../data/legs.js";
import boots from "../../../data/boots.js";
import qualities from "../../../data/quality.js";
import classes from "../../../player/classes.js";
import PetService from "../../../services/PetService.js";
import ItemTooltip from "../../../views/ItemTooltip.js";
import PetTooltip from "../../../views/PetTooltip.js";

const SLOTS = [
    ["weapon", "Arma"],
    ["helmet", "Cabeça"],
    ["chest", "Peitoral"],
    ["leg", "Calças"],
    ["boot", "Botas"],
    ["pet", "Pet"]
];

const STATS = [
    ["life", "Vida", ""],
    ["attack", "Ataque", ""],
    ["armor", "Armadura", ""],
    ["agility", "Agilidade", ""],
    null,
    ["absorption", "Absorção", "%"],
    ["criticalChance", "Chance Crítica", "%"],
    ["reflection", "Imitação", "%"],
    ["miasmaChance", "Miasma", "%"],
    ["penetration", "Penetração", "%"],
    ["lifeSteal", "Roubo de Vida", "%"]
];

// Só estas chaves de atributo passam do banco pra tela.
const STAT_KEYS = ["life", "attack", "armor", "agility", "criticalChance", "lifeSteal", "penetration", "absorption", "special"];

const EQUIPMENT_BY_ID = {};
[weapons, helmets, chests, legs, boots].forEach(pool => {
    Object.values(pool).forEach(item => { EQUIPMENT_BY_ID[item.id] = item; });
});

const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;

function pickNumbers(source, allowedKeys) {

    const result = {};

    Object.entries(source ?? {}).forEach(([key, value]) => {
        if (allowedKeys.includes(key)) result[key] = num(value);
    });

    return result;

}

// O que vem do ranking é dado de OUTRO jogador (pode ter sido
// adulterado). Por isso o item é remontado a partir dos dados do jogo
// (pelo id), e do banco só entram números e o id da qualidade — nunca
// texto, que iria parar num innerHTML.
function hydrateItem(snapshot) {

    const canonical = EQUIPMENT_BY_ID[snapshot?.id];

    if (!canonical) return null;

    const stats = { ...canonical.stats, ...pickNumbers(snapshot.stats, Object.keys(canonical.stats ?? {})) };
    const enchantments = pickNumbers(snapshot.enchantments, STAT_KEYS);

    return {
        ...structuredClone(canonical),
        quality: qualities[snapshot.quality?.id] ?? qualities.none,
        stats,
        enchantments: Object.keys(enchantments).length ? enchantments : null
    };

}

function hydratePet(snapshot) {

    const stages = PetService.getStages(snapshot?.family);

    if (!stages.length) return null;

    const pet = {
        ...structuredClone(stages[0]),
        shocked: true,
        family: snapshot.family,
        level: Math.max(1, Math.floor(num(snapshot.level))),
        xp: 0,
        fome: Math.max(0, Math.floor(num(snapshot.fome))),
        // Sem isso o tooltip aplicaria o decaimento de fome de um pet
        // que nem é seu.
        lastHungerTickAt: Date.now(),
        uid: "ranking-profile"
    };

    PetService.normalizeLevel(pet);
    PetService.syncDisplayFromStage(pet);

    return pet;

}

export { hydrateItem, hydratePet };

export default class PlayerProfileModal {

    constructor() {
        this.modal = null;
        this.items = {};
    }

    show(entry) {

        this.hide();

        this.items = {};
        this.currentName = String(entry.name ?? "");

        SLOTS.forEach(([slot]) => {
            const snapshot = entry.equipment?.[slot];
            this.items[slot] = !snapshot ? null : slot === "pet" ? hydratePet(snapshot) : hydrateItem(snapshot);
        });

        this.modal = document.createElement("div");
        this.modal.className = "modal-overlay";
        this.modal.innerHTML = this.render(entry);

        document.body.appendChild(this.modal);

        this.registerEvents();

    }

    hide() {

        this.hideTooltip();

        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }

    }

    render(entry) {

        // Título "real" (ex: "Mago da Escuridão" se já transcendeu) —
        // quem ainda não salvou depois dessa atualização não tem
        // "title" publicado, cai pro nome da classe base.
        const className = entry.title ?? classes[entry.classId]?.name ?? "???";

        return `
            <div class="profile-modal">

                <header class="profile-header">
                    <div class="profile-title">
                        <h2 class="profile-name"></h2>
                        <span class="profile-sub">Nv. ${Math.floor(num(entry.level))} · ${className}</span>
                    </div>
                    <button class="close-btn profile-close" id="profile-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>

                <div class="profile-body">
                    ${entry.equipment && entry.stats ? `

                    <section class="profile-equipment">
                        ${SLOTS.map(([slot, title]) => this.renderSlot(slot, title)).join("")}
                    </section>

                    <section class="profile-stats">
                        ${this.renderPortrait(entry)}
                        ${STATS.map(stat => this.renderStat(stat, entry.stats)).join("")}
                        <div class="profile-divider"></div>
                        <div class="profile-stat profile-power">
                            <span><i class="fa-solid fa-fire-flame-curved"></i> Poder</span>
                            <span>${Math.floor(num(entry.power)).toLocaleString("pt-BR")}</span>
                        </div>
                    </section>

                    ` : `
                    <p class="profile-empty">
                        Este jogador ainda não publicou os equipamentos e status.
                        Eles aparecem aqui depois que ele salvar o jogo.
                    </p>
                    `}
                </div>

            </div>
        `;

    }

    // Só o retrato (sem o nome embaixo — o cabeçalho já mostra o
    // título real em "Nv. X · Título") no topo do painel de status,
    // empurrando a lista de status pra baixo.
    renderPortrait(entry) {

        // Compatibilidade: quem ainda não salvou depois dessa
        // atualização não tem "titleImage" publicado — cai pro retrato
        // da classe base, sem a transcendência.
        const image = entry.titleImage ?? classes[entry.classId]?.image ?? null;

        if (!image) return "";

        return `
            <div class="profile-portrait">
                <img src="${image}" alt="">
            </div>
        `;

    }

    renderSlot(slot, title) {

        const item = this.items[slot];

        if (!item) {
            return `
                <div class="profile-slot">
                    <div class="profile-slot-image"></div>
                    <div class="profile-slot-info">
                        <span class="profile-slot-title">${title}</span>
                        <span class="profile-slot-item empty">Nenhum</span>
                    </div>
                </div>
            `;
        }

        const color = item.rarity?.color ?? "#e6d2b5";

        return `
            <div class="profile-slot filled" data-slot="${slot}">
                <div class="profile-slot-image"><img src="${item.image ?? item.icon}" alt=""></div>
                <div class="profile-slot-info">
                    <span class="profile-slot-title">${title}</span>
                    <span class="profile-slot-item" style="color:${color};">${item.name}</span>
                </div>
            </div>
        `;

    }

    renderStat(stat, values) {

        if (!stat) return `<div class="profile-divider"></div>`;

        const [key, label, suffix] = stat;

        return `
            <div class="profile-stat">
                <span>${label}</span>
                <span>${Math.floor(num(values?.[key]))}${suffix}</span>
            </div>
        `;

    }

    registerEvents() {

        // Nome do jogador vem do banco: entra como texto, nunca como HTML.
        const nameElement = this.modal.querySelector(".profile-name");
        nameElement.textContent = this.currentName ?? "";

        this.modal.querySelector("#profile-close").addEventListener("click", () => this.hide());

        this.modal.addEventListener("click", event => {
            if (event.target === this.modal) this.hide();
        });

        this.modal.querySelectorAll(".profile-slot.filled").forEach(slotElement => {

            const item = this.items[slotElement.dataset.slot];

            slotElement.addEventListener("mouseenter", event => this.showTooltip(item, event));
            slotElement.addEventListener("mousemove", event => this.moveTooltip(event));
            slotElement.addEventListener("mouseleave", () => this.hideTooltip());

        });

    }

    showTooltip(item, event) {

        this.hideTooltip();

        const tooltip = item.type === "pet"
            ? new PetTooltip(item)
            : new ItemTooltip(item, { showFooter: false });

        const element = document.createElement("div");
        element.id = "item-tooltip";
        element.className = "item-tooltip";
        element.innerHTML = tooltip.render();
        element.style.position = "fixed";
        element.style.zIndex = "99999";
        element.style.pointerEvents = "none";

        document.body.appendChild(element);

        this.moveTooltip(event);

    }

    moveTooltip(event) {

        const tooltip = document.getElementById("item-tooltip");

        if (!tooltip) return;

        const margin = 20;

        let left = event.clientX + margin;
        let top = event.clientY + margin;

        if (left + tooltip.offsetWidth > window.innerWidth - margin) {
            left = event.clientX - tooltip.offsetWidth - margin;
        }

        if (top + tooltip.offsetHeight > window.innerHeight - margin) {
            top = window.innerHeight - tooltip.offsetHeight - margin;
        }

        tooltip.style.left = `${Math.max(margin, left)}px`;
        tooltip.style.top = `${Math.max(margin, top)}px`;

    }

    hideTooltip() {
        document.getElementById("item-tooltip")?.remove();
    }

}
