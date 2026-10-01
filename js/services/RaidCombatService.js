import PvpCombatService from "./PvpCombatService.js";
import BoitataBurn from "./BoitataBurn.js";
import MiasmaService from "./MiasmaService.js";
import MimicService from "./MimicService.js";
import { ABSORPTION_CAP, absorbedAmount } from "../combat/Absorption.js";
import { CRITICAL_MULTIPLIER } from "../combat/Critical.js";

// Boss tem HP colossal (milhares) contra só 4 atacantes por rodada —
// precisa de bem mais rodadas que um duelo de PVP (que usa guard 500/1000)
// pra não cortar a luta no meio antes do boss ou do squad morrerem.
const MAX_ROUNDS = 3000;

// Peso de "ameaça" por classe pra mira do boss: Guerreiro e Bárbaro têm
// mitigação própria em combate (Guerreiro absorve metade do golpe via
// Absorção, Bárbaro rouba vida ao bater), então o boss prioriza bater
// neles; Mago e Arqueiro não têm nenhuma forma de se manter vivos
// sozinhos, então levam menos foco. Uma classe ausente do squad (ou
// desconhecida, ex: snapshot antigo sem esse campo) simplesmente não
// entra na conta — o peso dela não "sobra" pra ninguém, só deixa de
// existir, rebalanceando o resto proporcionalmente (ex: só Mago e
// Arqueiro vivos = 20/20, vira 50%/50%, já "equilibrado" como pedido).
const BOSS_TARGET_WEIGHT = {
    warrior: 35,
    barbarian: 25,
    mage: 20,
    archer: 20
};
const DEFAULT_TARGET_WEIGHT = 25;

function pickWeightedTarget(targets, rng) {
    const weights = targets.map(c => BOSS_TARGET_WEIGHT[c.class] ?? DEFAULT_TARGET_WEIGHT);
    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = rng() * total;
    for (let i = 0; i < targets.length; i++) {
        roll -= weights[i];
        if (roll < 0) return targets[i];
    }
    return targets[targets.length - 1];
}

function mulberry32(seed) {
    let a = seed;
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/*
    Mesma arquitetura determinística do PVP (ver PvpCombatService.js): os
    4 clientes da raid recebem a MESMA seed (gravada na partida pelo
    RaidLobbyService) e simulam a luta inteira localmente, sem trocar
    mensagem nenhuma durante o combate — só o pareamento passa pelo
    Firebase.

    Reaproveita PvpCombatService.snapshotCombatant() (congela um Player
    de verdade num combatente simples) e PvpCombatService.dodgeChance()
    (esquiva proporcional) — não faz sentido duplicar isso aqui.
*/
export default class RaidCombatService {

    // Mesmo snapshot do PVP (PvpCombatService.snapshotCombatant), só
    // acrescentando `level` — a simulação em si não usa isso, mas o HUD
    // da raid mostra o nível de cada um dos 4 jogadores nos cards.
    static snapshotCombatant(player) {

        return {
            ...PvpCombatService.snapshotCombatant(player),
            level: player.level
        };

    }

    // Converte um monstro de monstersRaid.js pro formato de combatente
    // usado na simulação. Diferente dos jogadores (um único `attack`
    // fixo), o boss guarda os 3 ataques nomeados em `attacks` — a
    // simulação sorteia UM deles a cada turno do boss.
    static snapshotBoss(raidMonster) {

        const status = raidMonster.status;

        return {
            id: "boss",
            name: raidMonster.name,
            // Elemento do chefe (water/fire/light/dark/plant) — usado pela
            // efetividade da queimadura do Boitatá (ver BoitataBurn.js).
            element: raidMonster.element ?? null,
            image: raidMonster.sprite,
            maxHP: status.vidaMaxima,
            currentHP: status.vidaMaxima,
            attacks: status.ataque.map(a => ({ name: a.nomeAtaque, damage: a.dano })),
            // Ataque "único" de conveniência pra quem precisa de UM
            // número (ex: Imitação do Mímico, que copia % disso) — média
            // dos golpes nomeados. A simulação em si continua sorteando
            // um dos 3 golpes de verdade pro turno do chefe.
            attack: Math.round(
                status.ataque.reduce((sum, a) => sum + a.dano, 0) / status.ataque.length
            ),
            // Nome do golpe mais forte do chefe — usado só pra mensagem
            // da Imitação ("usou [golpe] através da Imitação"), quando o
            // Mímico está acertando ELE (fora do turno do chefe não há
            // nenhum golpe "escolhido" de verdade, então usa esse como
            // o "mais representativo").
            attackName: status.ataque.reduce(
                (best, a) => a.dano > best.dano ? a : best, status.ataque[0]
            )?.nomeAtaque ?? null,
            armor: status.armadura,
            agility: status.agilidade,
            criticalChance: status.criticalChance ?? 0,
            lifeSteal: status.lifeSteal ?? 0,
            penetration: status.penetration ?? 0,
            absorption: status.absorption ?? 0
        };

    }

    // Deriva uma seed diferente por andar a partir da seed única da
    // partida — evita que todo drake da sequência role exatamente a
    // mesma sequência de esquiva/crítico/alvo só porque a seed base é
    // igual, sem precisar gravar uma seed nova por andar no Firebase.
    static deriveFloorSeed(seed, floor) {
        return (seed + floor * 104729) >>> 0;
    }

    // squad: array de até 4 combatentes (PvpCombatService.snapshotCombatant + id).
    // boss: RaidCombatService.snapshotBoss(...).
    // seed: mesmo valor gravado na partida pelos 4 clientes — garante
    // resultado idêntico nos 4 navegadores.
    static simulateRaid(squad, boss, seed) {

        const rng = mulberry32(seed);

        const players = squad.map(c => ({ ...c, side: "squad" }));
        const bossCombatant = { ...boss, side: "boss" };
        const all = [...players, bossCombatant];

        // Ordem de turno fixa por agilidade, decidida uma vez só — mesmo
        // motivo do simulateTeam do PVP: reserva o RNG só pra
        // esquiva/crítico/ataque-sorteado/alvo, pra não arriscar
        // desalinhar entre navegadores por causa de engine de sort.
        const turnOrder = [...all].sort((x, y) => y.agility - x.agility);

        const log = [];
        let guard = 0;

        const aliveSquad = () => players.filter(c => c.currentHP > 0);

        // Queimadura do Boitatá (ver BoitataBurn.js): uma por DONO de
        // pet, ligada no primeiro golpe dele que acerta o chefe e
        // cobrada só na VEZ DO PRÓPRIO DONO (nunca no turno dos outros
        // nem do chefe). Não consome rng().
        const burns = new Map();

        // Miasma do Pútrido (ver MiasmaService.js) — uma marca por
        // combatente (inclui o chefe: ele também pode ser intoxicado).
        const miasmaFlagsById = new Map(all.map(c => [c.id, MiasmaService.createFlags()]));

        const tickBurn = (owner) => {

            const burn = burns.get(owner.id);

            if (!burn || bossCombatant.currentHP <= 0) return;

            const tickDamage = BoitataBurn.getTickDamage(owner.petBurnDamage, bossCombatant.element);
            const applied = Math.min(bossCombatant.currentHP, tickDamage);

            bossCombatant.currentHP = Math.max(0, bossCombatant.currentHP - tickDamage);

            log.push({
                attackerId: owner.id,
                attackerSide: "squad",
                targetId: bossCombatant.id,
                burn: true,
                burnStart: burn.first,
                damage: applied,
                element: bossCombatant.element ?? null
            });

            burn.first = false;

        };

        while (aliveSquad().length > 0 && bossCombatant.currentHP > 0 && guard < MAX_ROUNDS) {

            guard++;

            for (const attacker of turnOrder) {

                if (attacker.currentHP <= 0) continue;

                const isBossTurn = attacker.side === "boss";

                if (isBossTurn && bossCombatant.currentHP <= 0) continue;

                const targets = isBossTurn ? aliveSquad() : (bossCombatant.currentHP > 0 ? [bossCombatant] : []);

                if (targets.length === 0) break;

                // Só o boss mira com peso por classe — quando é o squad
                // atacando, o alvo é sempre o próprio boss (targets.length
                // é 1 nesse caso), então o peso não faz diferença ali.
                const target = isBossTurn
                    ? pickWeightedTarget(targets, rng)
                    : targets[Math.floor(rng() * targets.length)];

                // Só o boss sorteia entre múltiplos ataques nomeados —
                // ele bate só 1 vez por turno, mas qual dos 3 golpes sai
                // é sorteado a cada turno (jogador ataca sempre com o
                // mesmo golpe fixo, sem variação). Sorteado ANTES da
                // esquiva de propósito: mesmo um golpe esquivado veio de
                // algum dos 3 ataques, então o log mostra qual.
                const chosenAttack = isBossTurn
                    ? attacker.attacks[Math.floor(rng() * attacker.attacks.length)]
                    : null;

                // Acúmulos de Intoxicação do Miasma: Ataque e Agilidade de
                // quem estiver intoxicado (na prática, o chefe) saem
                // reduzidos a luta inteira.
                const attackerMult = MiasmaService.statMultiplier(miasmaFlagsById.get(attacker.id));
                const targetMult = MiasmaService.statMultiplier(miasmaFlagsById.get(target.id));

                const dodgeChance = PvpCombatService.dodgeChance(target.agility * targetMult, attacker.agility * attackerMult);

                if (rng() * 100 < dodgeChance) {

                    log.push({
                        attackerId: attacker.id,
                        attackerSide: attacker.side,
                        targetId: target.id,
                        dodged: true,
                        attackName: chosenAttack?.name ?? null
                    });

                    // Turno esquivado também é turno do dono: a queimadura
                    // (já ligada) cobra.
                    if (!isBossTurn) tickBurn(attacker);

                    if (bossCombatant.currentHP <= 0) break;

                    continue;

                }

                const attackPower = (isBossTurn ? chosenAttack.damage : attacker.attack) * attackerMult;

                // Miasma: marca pendente no ATACANTE reduz Crítico/Roubo
                // de Vida/Penetração DESSE golpe; marca pendente no ALVO
                // reduz a Absorção dele ao recebê-lo. O chefe nunca tem
                // miasmaChance > 0 (não é Pútrido), então só ativa vindo
                // do squad — mas PODE ser alvo do débuff se for atingido.
                const attackMark = MiasmaService.consumeAttackMultiplier(miasmaFlagsById.get(attacker.id));
                const attackDebuff = attackMark * MiasmaService.persistentSpecialMultiplier(miasmaFlagsById.get(attacker.id));
                const defendMark = MiasmaService.consumeDefendMultiplier(miasmaFlagsById.get(target.id));
                const defendDebuff = defendMark * MiasmaService.persistentSpecialMultiplier(miasmaFlagsById.get(target.id));

                const isCritical = rng() * 100 < attacker.criticalChance * attackDebuff;
                const criticalMultiplier = isCritical ? CRITICAL_MULTIPLIER : 1;
                const effectiveArmor = target.armor * (1 - (attacker.penetration * attackDebuff) / 100);
                const mitigation = 100 / (100 + Math.max(0, effectiveArmor));

                // Imitação do Mímico: soma Imitação% do Ataque do alvo ao
                // PRÓPRIO Ataque ANTES da mitigação — vira parte do golpe
                // normal (passa por Crítico/Armadura/Absorção igual o
                // resto, não é mais "dano à parte"). O chefe nunca tem
                // Imitação (não é Mímico), mas PODE ser alvo dela (usa o
                // `attack` de conveniência do snapshot). Ver MimicService.js.
                const mimicBonusAttack = MimicService.getBonusAttack(target.attack, attacker.reflection ?? 0);
                const totalAttackPower = attackPower + mimicBonusAttack;
                const preAbsorption = Math.max(1, Math.floor(totalAttackPower * criticalMultiplier * mitigation));

                const absorptionChance = Math.min(ABSORPTION_CAP, (target.absorption ?? 0) * defendDebuff);
                const absorbed = absorbedAmount(preAbsorption, rng() * 100 < absorptionChance);

                const damage = preAbsorption - absorbed;

                // Quanto do dano final veio da Imitação (só pra mensagem) —
                // proporcional, já que o bônus entrou junto no Ataque.
                const mimicBonus = mimicBonusAttack > 0 ? Math.round(damage * mimicBonusAttack / totalAttackPower) : 0;

                target.currentHP = Math.max(0, target.currentHP - damage);

                let lifeStealAmount = 0;

                if (rng() * 100 < attacker.lifeSteal * attackDebuff) {
                    lifeStealAmount = Math.floor(damage * 0.20) + Math.floor(attacker.maxHP * 0.02);
                    attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + lifeStealAmount);
                }

                // Miasma: sorteado com o valor ORIGINAL do atacante. Só
                // Pútrido tem miasmaChance > 0 — o chefe nunca ativa isso.
                const miasmaProc = MiasmaService.procs(attacker.miasmaChance ?? 0, rng());

                const miasmaStacks = miasmaProc ? MiasmaService.applyDebuff(miasmaFlagsById.get(target.id)) : 0;

                log.push({
                    attackerId: attacker.id,
                    attackerSide: attacker.side,
                    targetId: target.id,
                    dodged: false,
                    damage,
                    critical: isCritical,
                    lifeSteal: lifeStealAmount,
                    absorbed,
                    mimicBonus,
                    // Nome do golpe que a Imitação "copiou" — só existe
                    // quando o alvo tem um golpe nomeado (o chefe).
                    mimicAttackName: mimicBonus > 0 ? (target.attackName ?? null) : null,
                    attackName: chosenAttack?.name ?? null,
                    miasmaProc,
                    miasmaStacks,
                    miasmaTargetHasSpecials: MiasmaService.hasAnySpecials(target),
                    miasmaAttackWeakened: attackMark < 1 && MiasmaService.hasAttackSpecials(attacker),
                    miasmaDefendWeakened: defendMark < 1 && MiasmaService.hasDefendSpecials(target)
                });

                // Mordida do pet: só quem está atacando o chefe (nunca o
                // chefe mordendo alguém) — garantida, sem rng(). Dano e
                // cura são efeitos independentes: um pet de cura pura
                // (ex: Duende, sem dano nenhum) ainda precisa disparar
                // esse bloco só pra curar. petMimicRatio (ex: Aranha)
                // copia uma fração do `damage` que ACABOU de ser
                // causado nesse mesmo golpe no chefe (já mitigado pela
                // armadura dele) — nunca do ataque bruto do atacante.
                const petBiteAmount = attacker.petMimicRatio > 0
                    ? Math.floor(damage * attacker.petMimicRatio)
                    : attacker.petBiteDamage;

                if (!isBossTurn && (petBiteAmount > 0 || attacker.petHealAmount > 0)) {

                    let biteDamage = 0;

                    if (petBiteAmount > 0 && target.currentHP > 0) {
                        biteDamage = Math.min(target.currentHP, petBiteAmount);
                        target.currentHP = Math.max(0, target.currentHP - petBiteAmount);
                    }

                    // Cura da habilidade (ex: Duende) — sorteia UM alvo
                    // vivo do squad (o próprio atacante pode ser
                    // sorteado) em vez de curar todo mundo, senão
                    // ninguém perde vida com o squad cheio de pets
                    // curativos.
                    let petHeal = 0;
                    let healedIds = [];

                    if (attacker.petHealAmount > 0) {

                        petHeal = attacker.petHealAmount;

                        const healTargets = aliveSquad();
                        const healTarget = healTargets[Math.floor(rng() * healTargets.length)];
                        healTarget.currentHP = Math.min(healTarget.maxHP, healTarget.currentHP + petHeal);
                        healedIds.push(healTarget.id);

                    }

                    log.push({
                        attackerId: attacker.id,
                        attackerSide: attacker.side,
                        targetId: target.id,
                        petBite: true,
                        damage: biteDamage,
                        heal: petHeal,
                        healedIds
                    });

                }

                // Boitatá: liga a queimadura no primeiro golpe que acerta.
                if (!isBossTurn && attacker.petBurnDamage > 0 && !burns.has(attacker.id)) {
                    burns.set(attacker.id, { first: true });
                }

                if (isBossTurn ? aliveSquad().length === 0 : bossCombatant.currentHP <= 0) break;

                if (!isBossTurn) tickBurn(attacker);

                if (bossCombatant.currentHP <= 0) break;

            }

        }

        const winner = bossCombatant.currentHP <= 0 ? "squad" : "boss";

        return {
            winner,
            log,
            finalState: {
                squad: players.map(c => ({ id: c.id, currentHP: c.currentHP })),
                bossHP: bossCombatant.currentHP
            }
        };

    }

}
