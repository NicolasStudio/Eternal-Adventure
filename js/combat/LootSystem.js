import weapons from "../data/weapons.js";
import helmets from "../data/helmets.js";
import chests from "../data/chest.js";
import legs from "../data/legs.js";
import boots from "../data/boots.js";

export default class LootSystem {

    static generate(monster, player) {

        const reward = {
            xp: monster.status.xp,
            gold: monster.status.ouro,
            items: []
        };

        if (!monster.drops?.length) {
            return reward;
        }

        const allItems = [
            ...Object.values(weapons),
            ...Object.values(helmets),
            ...Object.values(chests),
            ...Object.values(legs),
            ...Object.values(boots)
        ];

        for (const drop of monster.drops) {

            // ===============================
            // Item garantido
            // ===============================
            if (drop.item) {

                reward.items.push({
                    ...structuredClone(drop.item),
                    quantity: drop.quantidade ?? 1
                });

                continue;

            }

            // ===============================
            // Equipamento aleatório
            // ===============================
            if (drop.type) {

                const possibleItems = allItems.filter(item =>

                    // weapon, helmet, chest...
                    drop.type.includes(item.slot)

                    // common, rare...
                    && item.rarity.id === drop.rarity

                    // warrior, mage, archer...
                    && item.class === player.class.id

                );

                if (!possibleItems.length) {
                    continue;
                }

                const randomItem =
                    structuredClone(
                        possibleItems[
                            Math.floor(Math.random() * possibleItems.length)
                        ]
                    );

                reward.items.push({
                    ...randomItem,
                    quantity: 1
                });

            }

        }

        return reward;

    }

}