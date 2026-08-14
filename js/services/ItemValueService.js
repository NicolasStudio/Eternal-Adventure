import upgradeCosts from "../data/upgradeCosts.js";
import enchantmentStone from "../data/enchantmentStone.js";

const QUALITY_ORDER = ["none", "ordinary", "mediocre", "exceptional"];

/*
    Um item melhorado ou encantado vale mais que um item "cru" — não
    porque o item em si mudou de raridade, mas porque o jogador
    investiu ouro de verdade nele. Em vez de repetir esse valor
    investido por completo (o que tornaria melhorar/encantar e depois
    vender uma forma de "lavar" ouro sem perda nenhuma), a venda
    devolve METADE do que foi gasto em cada etapa.
*/
export default class ItemValueService {

    // Soma o custo de TODAS as etapas de qualidade já pagas pra
    // chegar onde o item está agora, partindo de "Nenhuma".
    static upgradeCostPaid(item) {

        if (!item.quality || item.quality === "none") return 0;

        const costTable = item.slot === "weapon" ? upgradeCosts.weapon : upgradeCosts.armor;
        const currentIndex = QUALITY_ORDER.indexOf(item.quality);

        if (currentIndex <= 0) return 0;

        let total = 0;

        for (let i = 0; i < currentIndex; i++) {
            total += costTable[QUALITY_ORDER[i]] ?? 0;
        }

        return total;

    }

    // Soma o preço de cada pedra de encantamento aplicada no item,
    // identificando qual pedra corresponde ao valor gravado nele.
    static enchantCostPaid(item) {

        if (!item.enchantments) return 0;

        let total = 0;

        Object.entries(item.enchantments).forEach(([statKey, value]) => {

            const stone = Object.values(enchantmentStone).find(
                s => s.stats?.[statKey] === value
            );

            if (stone) total += stone.enchantPrice;

        });

        return total;

    }

    // Valor de venda de verdade: base + metade do investido em
    // qualidade + metade do investido em encantamento.
    static getSellValue(item) {

        const base = item.sellValue ?? 0;
        const upgradeBonus = Math.round(this.upgradeCostPaid(item) / 2);
        const enchantBonus = Math.round(this.enchantCostPaid(item) / 2);

        return base + upgradeBonus + enchantBonus;

    }

}
