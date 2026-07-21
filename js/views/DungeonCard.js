import DungeonDropPreview from "../services/DungeonDropPreview.js";

export default class DungeonCard {
    constructor(dungeon, player) {
        this.dungeon = dungeon;
        this.player = player;
    }

    render() {
        const { id, name, level, image, boss, page } = this.dungeon;
        const locked = this.player.level < level;
        return `
            <button
                type="button"
                class="dungeon-card ${boss ? "boss" : ""} ${locked ? "locked" : ""}"
                data-id="${id}"
                data-page="${page}"
                data-name="${name}"
                data-level="${level}"
                data-boss="${boss}"
                aria-label="${name}">
                <div class="dungeon-card-header">
                    <span class="dungeon-name">${name}</span>
                </div>
                <div class="dungeon-card-image">
                    <img src="${image}" alt="${name}" loading="lazy">
                </div>
                <div class="dungeon-card-drops">
                    <span class="drops-title">Possíveis Drops</span>
                    <div class="drops-list">${this.renderDrops()}</div>
                </div>
                <div class="dungeon-card-footer">
                    <span class="dungeon-level ${locked ? "locked" : ""}">Lv mínimo ${level}</span>
                </div>
            </button>
        `;
    }

    renderDrops() {
        const drops = DungeonDropPreview.getDrops(this.dungeon, this.player);
        if (!drops.length) {
            return `<span class="drops-empty">Nenhum drop</span>`;
        }
        return drops
            .filter(item => item && item.icon)
            .map(item => `
                <div class="dungeon-drop" data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
                    <img src="${item.icon}" alt="${item.name}" loading="lazy">
                </div>
            `)
            .join("");
    }
}