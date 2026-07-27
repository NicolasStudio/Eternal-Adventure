export default class DungeonHeader {

    render(dungeon, floor) {

        const showFloor = !dungeon?.isBoss;

        return `
            <section class="combat-header-inline">

                <h2 class="combat-title">
                    ${dungeon?.name ?? ""}
                </h2>

                ${
                    showFloor
                        ? `<span class="combat-floor">Andar ${floor} / ${dungeon.fights}</span>`
                        : ""
                }

            </section>
        `;

    }

}