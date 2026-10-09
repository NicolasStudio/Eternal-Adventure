export const TALENTS = [
    { id: "attack", stat: "attack", label: "Dano de ataque", icon: "assets/img/assets/talent-tree/up-sword.png" },
    { id: "armor", stat: "armor", label: "Armadura", icon: "assets/img/assets/talent-tree/up-shild.png" },
    { id: "agility", stat: "agility", label: "Velocidade", icon: "assets/img/assets/talent-tree/up-speed.png" }
];

export const MAX_LEVEL = 3;
// Ganho do atributo e custo de vida são independentes: o atributo sobe
// pouco, mas a vida perdida pesa mais.
export const GAIN_PERCENT_PER_LEVEL = 1;
export const LIFE_LOSS_PERCENT_PER_LEVEL = 3;
export const REQUIRED_CLEARS = 3;
export const UPGRADE_COSTS = [50000, 70000, 100000];
export const RESET_COST = 100000;

/* ==========================================================
   TALENTOS ÚNICOS
   Uma segunda linha da árvore: cada um é 1/1 (sem acúmulo) e só UM dos
   três pode estar ativo por vez — escolher um bloqueia os outros dois
   até resetar. Não gastam ponto de região, só ouro.
========================================================== */
export const UNIQUE_TALENT_COST = 1000000;
// Cobrado JUNTO do reset normal (RESET_COST), só quando há um talento
// único ativo — o reset desfaz os dois de uma vez.
export const UNIQUE_RESET_SURCHARGE = 500000;

// Nível máximo normal do jogo. "Rompendo Limites" sobe isso pra 110
// só pra quem o tem ativo (ver getMaxLevel).
export const DEFAULT_MAX_LEVEL = 100;
export const EXPANDED_MAX_LEVEL = 110;

// Os 6 atributos especiais do jogo — "Cara ou Coroa?" sorteia entre os
// que não são o principal da sua classe (ver Player.getSpecialStatKey).
export const SPECIAL_STAT_KEYS = [
    "criticalChance", "lifeSteal", "penetration",
    "absorption", "miasmaChance", "reflection"
];
export const COIN_FLIP_BONUS_PERCENT = 8;

// Nome em português de um dos SPECIAL_STAT_KEYS — "Cara ou Coroa?" pode
// sortear qualquer um deles, não só o principal da classe do jogador (por
// isso não dá pra usar Player.getEnchantStatName, que só resolve "special"
// pelo atributo da CLASSE, nunca por uma chave escolhida à parte).
export function getSpecialStatLabel(key) {
    switch (key) {
        case "criticalChance": return "Chance Crítica";
        case "lifeSteal": return "Roubo de Vida";
        case "penetration": return "Penetração";
        case "absorption": return "Absorção";
        case "miasmaChance": return "Miasma";
        case "reflection": return "Imitação";
        default: return key;
    }
}

export const UNIQUE_TALENTS = [
    {
        id: "rompendo_limites",
        label: "Rompendo Limites",
        icon: "assets/img/assets/talent-tree/lv-up.png",
        description: "Rompe as correntes de nível: libera uma expansão do nível máximo para 110."
    },
    {
        id: "cara_ou_coroa",
        label: "Cara ou Coroa?",
        icon: "assets/img/assets/talent-tree/percent-up.png",
        description: `Desconsiderando o atributo principal da sua classe, escolhe aleatoriamente outro atributo especial e soma +${COIN_FLIP_BONUS_PERCENT}%.`
    },
];

// Removido do jogo: desbalanceava as classes e deixava estranho encantar
// um acessório sim, outro não. Quem já tinha isso ativo é limpo sozinho
// ao carregar — ver sanitizeRemovedUniqueTalent().
export const REMOVED_UNIQUE_TALENT_IDS = ["rei_dos_encantamentos"];

// Cada grupo = 3 fases + o boss da própria região. Completo (3 vitórias em
// cada) vale 1 ponto. Caverna tem 6 fases e 2 bosses, então dá 2 pontos.
export const POINT_GROUPS = [
    { phases: ["forest_1", "forest_2", "forest_3"], boss: "forest_boss" },
    { phases: ["cave_1", "cave_2", "cave_3"], boss: "cave_boss" },
    { phases: ["cave_4", "cave_5", "cave_6"], boss: "cave_boss2" },
    { phases: ["ocean_1", "ocean_2", "ocean_3"], boss: "ocean_boss" },
    { phases: ["desert_1", "desert_2", "desert_3"], boss: "desert_boss" },
    { phases: ["vulcan_1", "vulcan_2", "vulcan_3"], boss: "vulcan_boss" },
    { phases: ["mansion_1", "mansion_2", "mansion_3"], boss: "mansion_boss" },
    { phases: ["Floresta_1", "Floresta_2", "Floresta_3"], boss: "Floresta_boss" },
    { phases: ["hell_1", "hell_2", "hell_3"], boss: "Hell_boss" }
];

export default class TalentService {

    static getLevels(player) {
        return { attack: 0, armor: 0, agility: 0, ...(player.progress.talents ?? {}) };
    }

    static getEarnedPoints(player) {
        return POINT_GROUPS.filter(group => this.isGroupComplete(player, group)).length;
    }

    static isGroupComplete(player, group) {
        return [...group.phases, group.boss].every(id => player.getDungeonClears(id) >= REQUIRED_CLEARS);
    }

    static getSpentPoints(player) {
        const levels = this.getLevels(player);
        return TALENTS.reduce((total, talent) => total + (levels[talent.id] ?? 0), 0);
    }

    static getAvailablePoints(player) {
        return this.getEarnedPoints(player) - this.getSpentPoints(player);
    }

    // Preço do próximo nível do talento (1º = 50k, 2º = 70k, 3º = 100k).
    // null quando já está no nível máximo.
    static getUpgradeCost(player, talentId) {
        const level = this.getLevels(player)[talentId] ?? 0;
        return level < MAX_LEVEL ? UPGRADE_COSTS[level] : null;
    }

    static canInvest(player, talentId) {
        const levels = this.getLevels(player);
        const cost = this.getUpgradeCost(player, talentId);
        return this.getAvailablePoints(player) > 0
            && (levels[talentId] ?? 0) < MAX_LEVEL
            && player.gold >= cost;
    }

    static invest(player, talentId) {

        if (!this.canInvest(player, talentId)) {
            return { ok: false, message: "Sem pontos disponíveis ou ouro insuficiente." };
        }

        const cost = this.getUpgradeCost(player, talentId);
        player.gold -= cost;

        const levels = this.getLevels(player);
        player.progress.talents = { ...levels, [talentId]: levels[talentId] + 1 };

        this.sync(player);

        player.notify();

        return { ok: true };

    }

    // Vida perdida e atributo ganho são calculados sobre a vida máxima "crua"
    // (sem os cortes dos talentos). Idempotente: só aplica a diferença em
    // relação ao que já foi aplicado.
    static sync(player) {

        const levels = this.getLevels(player);
        const applied = player.talentApplied ?? { lifeLost: 0, attack: 0, armor: 0, agility: 0 };

        const rawMaxHP = player.maxHP + applied.lifeLost;

        const desiredGain = {};
        let totalLost = 0;

        TALENTS.forEach(talent => {
            const level = levels[talent.id] ?? 0;
            totalLost += Math.floor(rawMaxHP * (LIFE_LOSS_PERCENT_PER_LEVEL / 100) * level);
            desiredGain[talent.id] = Math.floor(rawMaxHP * (GAIN_PERCENT_PER_LEVEL / 100) * level);
        });

        const lifeDiff = totalLost - applied.lifeLost;

        player.maxHP = Math.max(1, player.maxHP - lifeDiff);
        player.currentHP = Math.min(player.currentHP, player.maxHP);

        TALENTS.forEach(talent => {
            const diff = desiredGain[talent.id] - (applied[talent.id] ?? 0);
            player.baseStats[talent.stat] = (player.baseStats[talent.stat] ?? 0) + diff;
            applied[talent.id] = desiredGain[talent.id];
        });

        applied.lifeLost = totalLost;
        player.talentApplied = applied;

    }

    // Custo do reset: o normal, mais a sobretaxa se houver um talento único
    // ativo — um reset só, que desfaz os dois ao mesmo tempo.
    static getResetCost(player) {
        return RESET_COST + (this.getUniqueTalent(player) ? UNIQUE_RESET_SURCHARGE : 0);
    }

    // Devolve todos os pontos gastos: zera os níveis e a sync desfaz a
    // vida/atributo convertidos. Também desfaz o talento único, se houver.
    static reset(player) {

        const cost = this.getResetCost(player);

        if (player.gold < cost) {
            return { ok: false, message: "Ouro insuficiente pra resetar." };
        }

        player.gold -= cost;
        player.progress.talents = { attack: 0, armor: 0, agility: 0 };

        this.sync(player);
        this.clearUniqueTalent(player);

        player.notify();

        return { ok: true };

    }

    static lifeLostFor(player, talentId) {
        const applied = player.talentApplied ?? { lifeLost: 0 };
        const rawMaxHP = player.maxHP + applied.lifeLost;
        const level = this.getLevels(player)[talentId] ?? 0;
        return Math.floor(rawMaxHP * (LIFE_LOSS_PERCENT_PER_LEVEL / 100) * level);
    }

    static describe(talent) {
        return `Converte ${GAIN_PERCENT_PER_LEVEL}% da sua vida em ${talent.label}`;
    }

    /* ==========================================================
       TALENTOS ÚNICOS
    ========================================================== */

    static getUniqueTalent(player) {
        return player.progress.uniqueTalent ?? null;
    }

    static hasUniqueTalent(player, id) {
        return this.getUniqueTalent(player) === id;
    }

    // Tipos de item que o personagem pode encantar na Ferraria: só a arma,
    // e também o Anel com "Rei dos Encantamentos" ativo. O Amuleto já foi
    // liberado por esse talento e saiu (ficava forte demais).
    // Nível máximo de verdade pro personagem AGORA — ver Player.getRequiredXP.
    static getMaxLevel(player) {
        return this.hasUniqueTalent(player, "rompendo_limites") ? EXPANDED_MAX_LEVEL : DEFAULT_MAX_LEVEL;
    }

    // Pré-requisito pros talentos únicos: precisa ter pelo menos um talento
    // SIMPLES (Dano/Armadura/Velocidade) em 3/3 antes de poder escolher um.
    static hasMaxedTalent(player) {
        const levels = this.getLevels(player);
        return TALENTS.some(talent => (levels[talent.id] ?? 0) >= MAX_LEVEL);
    }

    static canInvestUnique(player, talentId) {
        return !this.getUniqueTalent(player)
            && UNIQUE_TALENTS.some(talent => talent.id === talentId)
            && this.hasMaxedTalent(player)
            && player.gold >= UNIQUE_TALENT_COST;
    }

    static investUnique(player, talentId) {

        if (!this.canInvestUnique(player, talentId)) {
            return {
                ok: false,
                message: !this.hasMaxedTalent(player)
                    ? "Deixe um talento simples em 3/3 antes de escolher um talento único."
                    : "Você já escolheu um talento único, ou o ouro é insuficiente."
            };
        }

        player.gold -= UNIQUE_TALENT_COST;
        player.progress.uniqueTalent = talentId;

        if (talentId === "cara_ou_coroa") {

            const main = player.getSpecialStatKey();
            const pool = SPECIAL_STAT_KEYS.filter(key => key !== main);
            const attribute = pool[Math.floor(Math.random() * pool.length)];

            player.progress.uniqueTalentBonus = { attribute, amount: COIN_FLIP_BONUS_PERCENT };
            player.baseStats[attribute] = (player.baseStats[attribute] ?? 0) + COIN_FLIP_BONUS_PERCENT;

        }

        player.notify();

        return { ok: true };

    }

    // Ajusta quem já tem "Cara ou Coroa?" ativo ao valor atual de
    // COIN_FLIP_BONUS_PERCENT — sem isso, mudar a % aqui no código não
    // valeria pra quem já tinha escolhido o talento (mesmo problema que já
    // resolvemos pra transcendência — ver Player.syncTranscendenceStats).
    // Chamado uma vez por carregamento, em SaveService.deserialize.
    static syncCoinFlipBonus(player) {

        if (!this.hasUniqueTalent(player, "cara_ou_coroa")) return;

        const bonus = player.progress.uniqueTalentBonus;

        if (!bonus) return;

        const delta = COIN_FLIP_BONUS_PERCENT - bonus.amount;

        if (!delta) return;

        player.baseStats[bonus.attribute] = Math.max(0, (player.baseStats[bonus.attribute] ?? 0) + delta);
        bonus.amount = COIN_FLIP_BONUS_PERCENT;

    }

    // Desfaz o talento único ativo (chamado só pelo reset() acima): devolve
    // o bônus de atributo do "Cara ou Coroa?", e se era "Rompendo Limites",
    // também devolve o personagem pro nível 100 — sem o talento, nível
    // acima disso não existe mais, nem os status que vieram dele.
    static clearUniqueTalent(player) {

        const wasExpandingLevel = this.hasUniqueTalent(player, "rompendo_limites");
        const wasEnchantKing = this.hasUniqueTalent(player, "rei_dos_encantamentos");
        const bonus = player.progress.uniqueTalentBonus;

        if (bonus) {
            player.baseStats[bonus.attribute] = Math.max(0, (player.baseStats[bonus.attribute] ?? 0) - bonus.amount);
        }

        if (wasExpandingLevel) {
            player.revertLevelsAbove(DEFAULT_MAX_LEVEL);
        }

        if (wasEnchantKing) {
            player.revertAccessoryEnchantments();
        }

        player.progress.uniqueTalent = null;
        player.progress.uniqueTalentBonus = null;

    }

    // Chamado uma vez por carregamento (ver SaveService.deserialize): se o
    // personagem está com um talento único que saiu do jogo (ver
    // REMOVED_UNIQUE_TALENT_IDS), desfaz como um reset normal, mas sem
    // cobrar nada — o jogador não escolheu perder o talento, o talento é
    // que deixou de existir. Devolve true se mexeu em algo.
    static sanitizeRemovedUniqueTalent(player) {

        const id = this.getUniqueTalent(player);

        if (!id || !REMOVED_UNIQUE_TALENT_IDS.includes(id)) return false;

        this.clearUniqueTalent(player);

        return true;

    }

}
