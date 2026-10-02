import weapons from "../data/weapons.js";
import helmets from "../data/helmets.js";
import chests from "../data/chest.js";
import legs from "../data/legs.js";
import boots from "../data/boots.js";
import rings from "../data/ring.js";
import amulets from "../data/amulet.js";

export default class DungeonDropPreview {

    static getDrops(dungeon, player) {

        const drops = [];

        dungeon.drops.forEach(drop => {

            // Consumíveis
            if (drop.icon) {
                drops.push(drop);
                return;
            }

            // Item com chance própria (ex: ovo de pet) — ver LootSystem.js.
            // dropChance vai junto só pro preview mostrar no tooltip
            // (DungeonTooltip.js), sem alterar o item de verdade.
            if (drop.item) {
                drops.push({ ...drop.item, dropChance: drop.chance ?? 100 });
                return;
            }

            // Equipamentos (ou com chance própria — drop.chance, 0-100;
            // sem esse campo, é sempre garantido como antes — ver
            // LootSystem.js, mesma regra).
            if (Array.isArray(drop.type)) {

                drop.type.forEach(type => {

                    const item = this.getEquipment(
                        type,
                        player.class.id,
                        drop.rarity
                    );

                    if (item) {
                        drops.push({ ...item, dropChance: drop.chance ?? 100 });
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

            case "ring":
                collection = rings;
                break;

            case "amulet":
                collection = amulets;
                break;

            default:
                return null;

        }

        return Object.values(collection).find(item =>

            // "all" = anel/amuleto, qualquer classe pode usar (ver
            // ring.js/amulet.js).
            (item.class === "all" || item.class === playerClass) &&
            item.rarity.id === rarity

        ) || null;

    }

}