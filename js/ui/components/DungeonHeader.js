export default class DungeonHeader {

    render(dungeon, floor) {

        return `
            <section class="combat-header-inline">
                <h2 class="combat-title">${dungeon?.name ?? ""}</h2>
                <span class="combat-floor">Andar ${floor} / 5</span>
            </section>
        `;

    }

}