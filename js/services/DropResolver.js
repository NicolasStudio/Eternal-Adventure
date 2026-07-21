import weapons from "../data/weapons.js";
import helmets from "../data/helmets.js";
import chests from "../data/chest.js";
import legs from "../data/legs.js";
import boots from "../data/boots.js";

export default class DropResolver {

    static resolve(drop, player) {

        if (!drop.type) {
            return drop; // poções e outros itens do items.js
        }

        switch (drop.type) {

            case "weapon":
                return this.findItem(weapons, player.class.id, drop.rarity);

            case "helmet":
                return this.findItem(helmets, player.class.id, drop.rarity);

            case "chest":
                return this.findItem(chests, player.class.id, drop.rarity);

            case "legs":
                return this.findItem(legs, player.class.id, drop.rarity);

            case "boots":
                return this.findItem(boots, player.class.id, drop.rarity);

            default:
                return null;

        }

    }

    static findItem(collection, playerClass, rarity) {

        return Object.values(collection).find(item =>

            item.class === playerClass &&
            item.rarity === rarity

        );

    }

}