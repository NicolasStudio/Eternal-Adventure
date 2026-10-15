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

                    // Anel/Amuleto têm DUAS variantes compatíveis com a
                    // mesma raridade+classe (Primal e Moderno, ver
                    // ring.js/amulet.js) — LootSystem.pickEquipment
                    // sorteia entre as duas de verdade, então o preview
                    // precisa mostrar as DUAS como possibilidade, não só
                    // a primeira (antes usava .find(), que sempre pegava
                    // o Primal por vir primeiro no arquivo, fazendo o
                    // tooltip "prometer" só ele mesmo quando o Moderno
                    // também podia cair).
                    const items = this.getEquipment(
                        type,
                        player.class.id,
                        drop.rarity
                    );

                    // Quando dá mais de um item compatível (caso do
                    // anel/amuleto: Primal e Moderno), LootSystem sorteia
                    // UM dos dois com peso igual — a chance "de verdade"
                    // de sair especificamente este aqui é a do drop
                    // dividida entre eles, não a chance cheia repetida
                    // pros dois (senão o tooltip mostraria 40%+40%
                    // quando, de fato, é 40% de "um anel qualquer").
                    const chance = (drop.chance ?? 100) / items.length;

                    items.forEach(item => {
                        drops.push({ ...item, dropChance: chance });
                    });

                });

            }

        });

        return drops;

    }

    // Devolve TODOS os itens compatíveis (slot+raridade+classe), não só
    // um — pra anel/amuleto isso é mais de um resultado (Primal e
    // Moderno), pros outros slots normalmente só um (cada classe tem
    // exatamente uma peça por raridade).
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
                return [];

        }

        return Object.values(collection).filter(item =>

            // "all" = anel/amuleto, qualquer classe pode usar (ver
            // ring.js/amulet.js).
            (item.class === "all" || item.class === playerClass) &&
            item.rarity.id === rarity

        );

    }

}