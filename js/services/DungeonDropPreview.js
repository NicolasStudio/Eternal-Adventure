import weapons from "../data/weapons.js";
import helmets from "../data/helmets.js";
import chests from "../data/chest.js";
import legs from "../data/legs.js";
import boots from "../data/boots.js";

export default class DungeonDropPreview {

    static getDrops(dungeon, player) {

        const drops = [];

        dungeon.drops.forEach(drop => {

            // Consumíveis
            if (drop.icon) {
                drops.push(drop);
                return;
            }

            // Equipamentos
            if (Array.isArray(drop.type)) {

                drop.type.forEach(type => {

                    const item = this.getEquipment(
                        type,
                        player.class.id,
                        drop.rarity
                    );

                    if (item) {
                        drops.push(item);
                    }

                });

            }

        });

        return drops;

    }

    static getEquipment(type, playerClass, rarity) {

        let collection = null;

        switch (type) {

            case "weapon":
                collection = weapons;
                break;

            case "helmet":
                collection = helmets;
                break;

            case "chest":
                collection = chests;
                break;

            case "leg":
                collection = legs;
                break;

            case "boot":
                collection = boots;
                break;

            default:
                return null;

        }

        return Object.values(collection).find(item =>

            item.class === playerClass &&
            item.rarity.id === rarity

        ) || null;

    }

}