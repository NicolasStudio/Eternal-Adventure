import seeds from "../data/seeds.js";
import farmCrops from "../data/farmCrops.js";
import items from "../data/items.js";
import enchantmentStone from "../data/enchantmentStone.js";
import weapons from "../data/weapons.js";

// Cassino (caça-níquel) da home — 3 bobinas de 3 símbolos (3x3), e só a
// LINHA DO MEIO conta: só ganha quem tira o mesmo símbolo nas 3 bobinas
// dessa linha. Topo/base são só decoração visual, sorteados com os
// mesmos pesos pra bobina parecer "de verdade" (ver buildGrid), mas
// nunca entram no resultado.
//
// Cada jogador tem 3 giros grátis por dia (ver CasinoDailyService.js —
// validado contra o relógio do SERVIDOR via firestore.rules, não dá pra
// burlar mudando a hora do PC). Depois de gastar as 3, cada giro custa
// ouro de verdade.
export const CASINO_PAID_BET_AMOUNT = 5000;
export const CASINO_GOLD_PRIZE = CASINO_PAID_BET_AMOUNT * 2;

export const CASINO_PRIZE_QUANTITY = {
    potion: 5,
    quartzo: 1
};

export const CASINO_SYMBOLS = {
    semente: {
        id: "semente",
        icon: seeds.seed_potato.icon,
        label: "Semente"
    },
    gold: {
        id: "gold",
        icon: "assets/img/icons/gold.png",
        label: "Ouro"
    },
    potion: {
        id: "potion",
        icon: items.tripleMediumPotion.icon,
        label: "Tripla Poção Média"
    },
    morango: {
        id: "morango",
        icon: farmCrops.strawberry.harvestedItem.icon,
        label: "Morango"
    },
    quartzo: {
        id: "quartzo",
        icon: enchantmentStone.quartzoRosaUm.icon,
        label: "Quartzo Rosa Nível I"
    }
};

// Arma: cada classe só "enxerga" (ganha) a própria arma, igual o resto
// dos itens de classe no jogo (ver Player.equipItem — item.class !==
// this.class.id bloqueia equipar). O símbolo "weapon" não entra no
// CASINO_SYMBOLS estático acima porque o ícone/nome mudam de jogador pra
// jogador — ver getSymbolSet(player), que resolve pra classe de quem
// está jogando.
const WEAPON_PREFIX_BY_CLASS = {
    warrior: "sword",
    mage: "scepter",
    archer: "arch",
    barbarian: "ax",
    putrid: "stink",
    mimic: "mirror",
    crazy: "sledgehammer",
    spark: "teslacoil",
    samurai: "katana",
    singularity: "hammer"
};

// Lendária (não mítica/ultraje) de propósito — é o mesmo teto de
// raridade que já cai dos dragões de raid (ver monstersRaid.js), então o
// cassino não abre uma segunda porta pra uma raridade ainda mais alta.
export function getClassWeapon(classId, rarityId = "legendary") {
    const prefix = WEAPON_PREFIX_BY_CLASS[classId];
    return weapons[`${prefix}_${rarityId}`];
}

// CASINO_SYMBOLS + a arma da classe de QUEM está jogando — usar isso (e
// não CASINO_SYMBOLS direto) pra desenhar/resolver qualquer símbolo.
export function getSymbolSet(player) {
    const weapon = getClassWeapon(player.class.id);
    return {
        ...CASINO_SYMBOLS,
        weapon: { id: "weapon", icon: weapon.icon, label: weapon.name }
    };
}

// Peso de sorteio de cada símbolo, igual nas 3 bobinas — quanto melhor o
// prêmio, menor o peso (e como só ganha com os 3 iguais, a chance real
// de prêmio é peso³, então cair um pouco o peso já derruba MUITO a
// chance final). Valores definidos pelo usuário:
// - semente (70%): prêmio baixo (Semente de Batata, vale 50 de venda)
// - gold    (10%): paga o dobro da aposta
// - potion  (7%):  5x Tripla Poção Média (vale 250 cada = 1250 de venda)
// - morango (7%):  prêmio alto (Morango, vale 2160 de venda — mesmo item
//   colhido na Fazenda, também serve de ração pro pet)
// - quartzo (6%):  Quartzo Rosa Nível I, vale 10.000 de venda
// - weapon  (1%):  arma lendária da própria classe, vale ~19.000 de
//   venda E é equipável — peso extremamente baixo de propósito (peso³ =
//   chance real), pra não virar um jeito mais fácil de farmar arma
//   lendária do que encarar os dragões de raid
const REEL_WEIGHTS = { semente: 70, gold: 10, potion: 7, morango: 7, quartzo: 6, weapon: 1 };

const SYMBOL_IDS = Object.keys(REEL_WEIGHTS);
const TOTAL_WEIGHT = SYMBOL_IDS.reduce((sum, id) => sum + REEL_WEIGHTS[id], 0);

function rollSymbol(rng) {
    let roll = rng() * TOTAL_WEIGHT;
    for (const id of SYMBOL_IDS) {
        roll -= REEL_WEIGHTS[id];
        if (roll < 0) return id;
    }
    return SYMBOL_IDS[SYMBOL_IDS.length - 1];
}

// grid[bobina][linha] — 3 bobinas x 3 linhas (0=topo, 1=meio, 2=base).
function buildGrid(rng) {
    return [0, 1, 2].map(() => [0, 1, 2].map(() => rollSymbol(rng)));
}

function resolveGrid(grid) {
    const middleRow = [grid[0][1], grid[1][1], grid[2][1]];
    const win = middleRow[0] === middleRow[1] && middleRow[1] === middleRow[2];
    return { middleRow, win, symbol: win ? middleRow[0] : null };
}

function grantPrize(player, symbolId) {
    switch (symbolId) {
        case "gold":
            // Prêmio fixo, independente do giro ter sido grátis ou pago —
            // senão um giro grátis premiado com "gold" pagaria 0 (dobro
            // de 0), o que não faz sentido como prêmio.
            player.addGold(CASINO_GOLD_PRIZE);
            return { type: "gold", amount: CASINO_GOLD_PRIZE };
        case "semente":
            player.addItem(seeds.seed_potato, 1);
            return { type: "item", item: seeds.seed_potato, quantity: 1 };
        case "potion":
            player.addItem(items.tripleMediumPotion, CASINO_PRIZE_QUANTITY.potion);
            return { type: "item", item: items.tripleMediumPotion, quantity: CASINO_PRIZE_QUANTITY.potion };
        case "morango":
            player.addItem(farmCrops.strawberry.harvestedItem, 1);
            return { type: "item", item: farmCrops.strawberry.harvestedItem, quantity: 1 };
        case "quartzo":
            player.addItem(enchantmentStone.quartzoRosaUm, CASINO_PRIZE_QUANTITY.quartzo);
            return { type: "item", item: enchantmentStone.quartzoRosaUm, quantity: CASINO_PRIZE_QUANTITY.quartzo };
        case "weapon": {
            const weapon = getClassWeapon(player.class.id);
            player.addItem(weapon, 1);
            return { type: "item", item: weapon, quantity: 1 };
        }
        default:
            return null;
    }
}

export default class CasinoService {

    static canAfford(player) {
        return player.gold >= CASINO_PAID_BET_AMOUNT;
    }

    // free:true é só pros 3 giros diários (ver CasinoDailyService — quem
    // decide se o giro É de verdade grátis é ele, não este método; aqui
    // só confia no que já foi decidido e pula a cobrança de ouro).
    // rng é injetável só pra permitir simulação Monte Carlo fora do
    // navegador (Node puro) sem precisar mockar Math.random global.
    static spin(player, { free = false } = {}, rng = Math.random) {

        if (!free) {

            if (!CasinoService.canAfford(player)) {
                return { ok: false, reason: "Ouro insuficiente." };
            }

            player.removeGold(CASINO_PAID_BET_AMOUNT);

        }

        const grid = buildGrid(rng);
        const { middleRow, win, symbol } = resolveGrid(grid);
        const prize = win ? grantPrize(player, symbol) : null;

        return { ok: true, free, grid, middleRow, win, symbol, prize };

    }

}
