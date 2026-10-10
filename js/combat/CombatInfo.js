// Agregação do log de combate em "Informações do Combate" — compartilhada
// pelos 4 sistemas de combate (Cooperativo via RaidCombatService, PvE via
// CombatEngine, PvP 1x1 e PvP 2x2 via PvpCombatService), que só precisam
// alimentar log entries no formato combinado: attackerId/targetId/round,
// mais os campos de golpe normal (dodged/damage/rawDamage/armorMitigated/
// critical/lifeSteal/absorbed/mimicBonus/miasmaProc) ou os formatos
// especiais burn/petBite(+revive). Puramente informativo: nada aqui é
// salvo, cada combate gera um retrato novo.

// Resumo do combate pra UM jogador específico — soma o log inteiro
// (todos os lados aparecem nele) filtrando só o que é dele.
export function buildCombatInfo(log, playerId) {

    const info = {
        // Valores — dano
        damageDealt: 0,
        damageReceived: 0,
        armorMitigated: 0,
        rawDamageDealt: 0,
        absorbedValue: 0,
        lifeStolen: 0,
        // Quantidades
        dodges: 0,
        absorptionCount: 0,
        criticalCount: 0,
        mimicCount: 0,
        miasmaCount: 0,
        lifeStealCount: 0,
        // Pet
        petHealing: 0,
        petDamage: 0
    };

    for (const entry of log) {

        if (entry.dodged) {
            // Esquiva é só do jogador se do lado de quem RECEBEU o
            // golpe — o oponente não conta aqui, não tem tela própria.
            if (entry.targetId === playerId) info.dodges++;
            continue;
        }

        // Queimadura do Boitatá: sempre do dono do pet, sempre no oponente.
        if (entry.burn) {
            if (entry.attackerId === playerId) info.petDamage += entry.damage ?? 0;
            continue;
        }

        // Mordida/cura do pet — exceto o reviver do Yggdrasil, que
        // reaproveita esse mesmo formato de log só pra tela saber
        // desenhar, mas não é "pet" de verdade (é o oponente revivendo).
        if (entry.petBite) {
            if (entry.attackerId !== playerId || entry.revive) continue;
            info.petDamage += entry.damage ?? 0;
            info.petHealing += entry.heal ?? 0;
            continue;
        }

        // Golpe normal (jogador ou oponente) — dano causado/recebido são
        // eventos independentes, um golpe só conta nos dois ao mesmo
        // tempo se o alvo também for o atacante (nunca acontece aqui,
        // mas não custa deixar como dois "if" em vez de "else if").
        if (entry.attackerId === playerId) {

            info.damageDealt += entry.damage ?? 0;
            info.rawDamageDealt += entry.rawDamage ?? 0;

            if (entry.critical) info.criticalCount++;
            if (entry.mimicBonus > 0) info.mimicCount++;
            if (entry.miasmaProc) info.miasmaCount++;

            if (entry.lifeSteal > 0) {
                info.lifeStolen += entry.lifeSteal;
                info.lifeStealCount++;
            }

        }

        if (entry.targetId === playerId) {

            info.damageReceived += entry.damage ?? 0;
            info.armorMitigated += entry.armorMitigated ?? 0;

            if (entry.absorbed > 0) {
                info.absorbedValue += entry.absorbed;
                info.absorptionCount++;
            }

        }

    }

    return info;

}

// Série temporal (por rodada) dos mesmos 14 números de buildCombatInfo,
// pra aba "Gráfico" das Informações do Combate — cada ponto é o total
// ACUMULADO até aquela rodada (não o delta dela), pra desenhar linhas
// sempre crescentes. Rodadas sem nenhum evento desse jogador repetem o
// valor anterior, então o gráfico nunca "pula" buracos.
export function buildCombatTimeline(log, playerId) {

    const fields = [
        "damageDealt", "damageReceived", "armorMitigated", "rawDamageDealt",
        "absorbedValue", "lifeStolen", "dodges", "absorptionCount",
        "criticalCount", "mimicCount", "miasmaCount", "lifeStealCount",
        "petHealing", "petDamage"
    ];

    let maxRound = 0;
    const deltasByRound = new Map();

    const addDelta = (round, key, amount) => {
        if (!amount) return;
        const deltas = deltasByRound.get(round) ?? {};
        deltas[key] = (deltas[key] ?? 0) + amount;
        deltasByRound.set(round, deltas);
    };

    for (const entry of log) {

        const round = entry.round ?? 0;
        maxRound = Math.max(maxRound, round);

        if (entry.dodged) {
            if (entry.targetId === playerId) addDelta(round, "dodges", 1);
            continue;
        }

        if (entry.burn) {
            if (entry.attackerId === playerId) addDelta(round, "petDamage", entry.damage ?? 0);
            continue;
        }

        if (entry.petBite) {
            if (entry.attackerId !== playerId || entry.revive) continue;
            addDelta(round, "petDamage", entry.damage ?? 0);
            addDelta(round, "petHealing", entry.heal ?? 0);
            continue;
        }

        if (entry.attackerId === playerId) {

            addDelta(round, "damageDealt", entry.damage ?? 0);
            addDelta(round, "rawDamageDealt", entry.rawDamage ?? 0);

            if (entry.critical) addDelta(round, "criticalCount", 1);
            if (entry.mimicBonus > 0) addDelta(round, "mimicCount", 1);
            if (entry.miasmaProc) addDelta(round, "miasmaCount", 1);

            if (entry.lifeSteal > 0) {
                addDelta(round, "lifeStolen", entry.lifeSteal);
                addDelta(round, "lifeStealCount", 1);
            }

        }

        if (entry.targetId === playerId) {

            addDelta(round, "damageReceived", entry.damage ?? 0);
            addDelta(round, "armorMitigated", entry.armorMitigated ?? 0);

            if (entry.absorbed > 0) {
                addDelta(round, "absorbedValue", entry.absorbed);
                addDelta(round, "absorptionCount", 1);
            }

        }

    }

    const running = Object.fromEntries(fields.map(key => [key, 0]));
    const timeline = [];

    for (let round = 1; round <= maxRound; round++) {

        const deltas = deltasByRound.get(round);

        if (deltas) {
            for (const key of fields) running[key] += deltas[key] ?? 0;
        }

        timeline.push({ round, ...running });

    }

    return timeline;

}
