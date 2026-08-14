import weapons from "../data/weapons.js";
import helmets from "../data/helmets.js";
import chests from "../data/chest.js";
import legs from "../data/legs.js";
import boots from "../data/boots.js";
import dungeons from "../data/dungeons.js";
import xpByLevel from "../data/xpByLevel.js";

// Monta uma vez só (no carregamento) o conjunto de ids de monstro que
// são chefe de alguma dungeon — evita depender de um campo solto
// gravado em cada monstro individualmente, que já se perdeu sozinho
// mais de uma vez no passado.
const BOSS_MONSTER_IDS = new Set(
    dungeons.filter(dungeon => dungeon.boss).flatMap(dungeon => dungeon.monsters)
);

const BOSS_XP_MULTIPLIER = 3.5;

export default class LootSystem {

    static generate(monster, player) {

        const isBoss = BOSS_MONSTER_IDS.has(monster.id);
        const baseXp = xpByLevel[monster.level] ?? xpByLevel[100];

        const reward = {
            xp: Math.round(baseXp * (isBoss ? BOSS_XP_MULTIPLIER : 1)),
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
            // Pool ponderado (ex: pedra de encantamento nível 1/2/3
            // — exatamente UM item cai, sorteado pelo peso de cada um)
            // ===============================
            if (drop.pool) {

                const roll = Math.random() * 100;
                let cumulative = 0;

                for (const entry of drop.pool) {

                    cumulative += entry.chance;

                    if (roll < cumulative) {

                        reward.items.push({
                            ...structuredClone(entry.item),
                            quantity: entry.quantidade ?? 1
                        });

                        break;

                    }

                }

                continue;

            }

            // ===============================
            // Item garantido (ou com chance própria — drop.chance,
            // 0-100; sem esse campo, é sempre garantido como antes)
            // ===============================
            if (drop.item) {

                const chance = drop.chance ?? 100;

                if (Math.random() * 100 < chance) {

                    reward.items.push({
                        ...structuredClone(drop.item),
                        quantity: drop.quantidade ?? 1
                    });

                }

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