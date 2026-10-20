import PvpCombatService from "./PvpCombatService.js";
import PetService from "./PetService.js";
import BoitataBurn from "./BoitataBurn.js";
import MiasmaService, { PVE_STACK_PERCENTS as MIASMA_PVE_PERCENTS } from "./MiasmaService.js";
import MimicService from "./MimicService.js";
import ConfusionService from "./ConfusionService.js";
import ParalysisService from "./ParalysisService.js";
import DoubleStrikeService from "./DoubleStrikeService.js";
import GravityService from "./GravityService.js";
import { ABSORPTION_CAP, ABSORPTION_RATIO_PVE, absorbedAmount } from "../combat/Absorption.js";
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
    // A Queimadura do Boitatá volta pro valor de PVE (cresce com o nível
    // do pet) — o snapshot do PVP usa o tick fixo contra jogador (ver
    // PetService.getScaledStats/burnDamagePvp), e aqui o alvo é o boss.
    static snapshotCombatant(player) {

        const pet = player.equipment.pet;

        return {
            ...PvpCombatService.snapshotCombatant(player),
            petBurnDamage: pet ? PetService.getScaledStats(pet).burnDamage : 0,
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
            // Nome do golpe mais forte do chefe — só decorativo em
            // outros lugares que queiram "o golpe principal dele" (a
            // Imitação não usa mais isso, ver MimicService.js).
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

        // Confusão da Louca (ver ConfusionService.js) — uma marca
        // pendente por combatente. Na prática só o CHEFE pode acabar
        // confuso (o squad só ataca o chefe, nunca uns aos outros, e
        // só a Louca tem confusionChance > 0), então "ataca a si
        // mesmo" vira o chefe se acertando sozinho.
        const confusionFlagsById = new Map(all.map(c => [c.id, ConfusionService.createFlags()]));

        // Paralisia do Eletro (ver ParalysisService.js) — mesmo padrão
        // acima, uma marca pendente por combatente. Na prática só o
        // CHEFE pode acabar paralisado (mesmo motivo da Confusão: o
        // squad só ataca o chefe, só o Eletro tem paralysisChance > 0).
        const paralysisFlagsById = new Map(all.map(c => [c.id, ParalysisService.createFlags()]));

        // Pressão Gravitacional/Gravidade Máxima da Singularidade (ver
        // GravityService.js) — mesmo padrão acima, uma marca pendente
        // por combatente. Na prática só o CHEFE pode acabar com isso
        // ativo (mesmo motivo da Confusão/Paralisia: o squad só ataca o
        // chefe, só a Singularidade tem gravityChance > 0).
        const gravityFlagsById = new Map(all.map(c => [c.id, GravityService.createFlags()]));

        const tickBurn = (owner) => {

            const burn = burns.get(owner.id);

            if (!burn || bossCombatant.currentHP <= 0) return;

            const tickDamage = BoitataBurn.getTickDamage(owner.petBurnDamage, bossCombatant.element);
            const applied = Math.min(bossCombatant.currentHP, tickDamage);

            bossCombatant.currentHP = Math.max(0, bossCombatant.currentHP - tickDamage);

            log.push({
                round: guard,
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

                // Paralisia do Eletro: consome a marca pendente do
                // ATACANTE — SEM sortear nada (diferente da Confusão),
                // não consome rng() nenhum. Paralisado pula Confusão/
                // esquiva/dano/mordida do pet, mas a queimadura (se já
                // ligada) continua cobrando — mesmo padrão do "miss" da
                // Confusão logo abaixo.
                if (ParalysisService.consumePending(paralysisFlagsById.get(attacker.id))) {

                    log.push({
                        round: guard,
                        attackerId: attacker.id,
                        attackerSide: attacker.side,
                        targetId: target.id,
                        dodged: false,
                        damage: 0,
                        attackName: chosenAttack?.name ?? null,
                        paralyzed: true
                    });

                    if (!isBossTurn) tickBurn(attacker);

                    if (bossCombatant.currentHP <= 0) break;

                    continue;

                }

                // Gravidade Máxima da Singularidade: mesma prioridade/
                // padrão da Paralisia acima (perde o turno inteiro, sem
                // sortear nada) — só muda a origem (acúmulo em vez de
                // chance direta por golpe, ver GravityService.js).
                if (GravityService.consumePendingStun(gravityFlagsById.get(attacker.id))) {

                    log.push({
                        round: guard,
                        attackerId: attacker.id,
                        attackerSide: attacker.side,
                        targetId: target.id,
                        dodged: false,
                        damage: 0,
                        attackName: chosenAttack?.name ?? null,
                        gravityStunned: true
                    });

                    if (!isBossTurn) tickBurn(attacker);

                    if (bossCombatant.currentHP <= 0) break;

                    continue;

                }

                // Confusão da Louca: consome a marca pendente do
                // ATACANTE — SEMPRE sorteado, mesmo sem marca nenhuma
                // (mesma regra do resto do combate: nunca pular um
                // rng() condicionalmente). Na prática só o CHEFE pode
                // ter ficado confuso (ver comentário acima de
                // confusionFlagsById), então "ataca a si mesmo" só
                // acontece no turno dele. Mordida do pet e queimadura
                // continuam usando `target`/bossCombatant de sempre —
                // só o GOLPE PRINCIPAL (attackTarget) é redirecionado.
                const confusionOutcome = ConfusionService.consumePending(confusionFlagsById.get(attacker.id), rng());
                const confusionMultiplier = ConfusionService.multiplierFor(confusionOutcome);

                const attackTarget = confusionOutcome === "self" ? attacker : target;

                // Acúmulos de Intoxicação do Miasma: Ataque e Agilidade de
                // quem estiver intoxicado (na prática, o chefe) saem
                // reduzidos a luta inteira.
                const attackerMult = MiasmaService.statMultiplier(miasmaFlagsById.get(attacker.id), MIASMA_PVE_PERCENTS);
                const attackTargetMult = MiasmaService.statMultiplier(miasmaFlagsById.get(attackTarget.id), MIASMA_PVE_PERCENTS);

                // Imitação do Mímico: soma Imitação% do Ataque/Armadura/
                // Agilidade de quem ele enfrenta aos status dele — o chefe
                // nunca tem Imitação (não é Mímico), mas PODE ser alvo
                // dela (usa o `attack` de conveniência do snapshot, ver
                // snapshotBoss). Recalculada a cada golpe.
                const attackerCopy = MimicService.applyCopy(attackTarget, attacker.reflection ?? 0);
                const attackTargetCopy = MimicService.applyCopy(attacker, attackTarget.reflection ?? 0);

                const dodgeChance = PvpCombatService.dodgeChance(
                    attackTarget.agility * attackTargetMult + attackTargetCopy.bonusAgility,
                    attacker.agility * attackerMult + attackerCopy.bonusAgility
                );

                if (confusionOutcome === "miss") {

                    log.push({
                        round: guard,
                        attackerId: attacker.id,
                        attackerSide: attacker.side,
                        targetId: attackTarget.id,
                        dodged: false,
                        damage: 0,
                        attackName: chosenAttack?.name ?? null,
                        confusionOutcome
                    });

                    if (!isBossTurn) tickBurn(attacker);

                    if (bossCombatant.currentHP <= 0) break;

                    continue;

                }

                if (rng() * 100 < dodgeChance) {

                    log.push({
                        round: guard,
                        attackerId: attacker.id,
                        attackerSide: attacker.side,
                        targetId: attackTarget.id,
                        dodged: true,
                        attackName: chosenAttack?.name ?? null,
                        confusionOutcome
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
                const defendMark = MiasmaService.consumeDefendMultiplier(miasmaFlagsById.get(attackTarget.id));
                const defendDebuff = defendMark * MiasmaService.persistentSpecialMultiplier(miasmaFlagsById.get(attackTarget.id));

                const isCritical = rng() * 100 < attacker.criticalChance * attackDebuff;
                const criticalMultiplier = isCritical ? CRITICAL_MULTIPLIER : 1;

                // Gravidade Máxima da Singularidade: se o ALVO tiver a
                // marca pendente (chegou nos acúmulos no golpe anterior),
                // a Armadura dele conta só pela metade NESSE golpe —
                // depois volta ao normal (ver GravityService.js).
                const gravityArmorMultiplier = GravityService.consumeArmorHalf(gravityFlagsById.get(attackTarget.id));
                const gravityArmorHalved = gravityArmorMultiplier < 1;

                // Miasma (PVE): Armadura de quem está intoxicado também cai,
                // junto com Ataque/Agilidade (attackTargetMult, calculado
                // acima).
                const effectiveArmor = (attackTarget.armor * attackTargetMult * gravityArmorMultiplier + attackTargetCopy.bonusArmor) * (1 - (attacker.penetration * attackDebuff) / 100);
                const mitigation = 100 / (100 + Math.max(0, effectiveArmor));
                const preAbsorption = Math.max(1, Math.floor((attackPower + attackerCopy.bonusAttack) * criticalMultiplier * mitigation * confusionMultiplier));

                // Dano ANTES da armadura, com a MESMA fórmula de preAbsorption
                // só sem o fator de mitigação — existe só pra "Informações do
                // Combate" (ver js/combat/CombatInfo.js) saber quanto a armadura
                // segurou. Puramente informativo: nunca entra em currentHP
                // nem em nenhuma conta que mude o resultado da luta, então
                // não arrisca desalinhar o resultado determinístico entre
                // os 4 clientes.
                const rawDamage = Math.max(1, Math.floor((attackPower + attackerCopy.bonusAttack) * criticalMultiplier * confusionMultiplier));
                const armorMitigated = Math.max(0, rawDamage - preAbsorption);

                const absorptionChance = Math.min(ABSORPTION_CAP, (attackTarget.absorption ?? 0) * defendDebuff);
                const absorbed = absorbedAmount(preAbsorption, rng() * 100 < absorptionChance, ABSORPTION_RATIO_PVE);

                const damage = preAbsorption - absorbed;

                // Quanto do Ataque usado nesse golpe veio da cópia — só
                // pra mensagem (ver MimicService.js).
                const mimicBonus = attackerCopy.bonusAttack;

                attackTarget.currentHP = Math.max(0, attackTarget.currentHP - damage);

                let lifeStealAmount = 0;

                if (rng() * 100 < attacker.lifeSteal * attackDebuff) {
                    lifeStealAmount = Math.floor(damage * 0.20) + Math.floor(attacker.maxHP * 0.02);
                    attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + lifeStealAmount);
                }

                // Miasma: sorteado com o valor ORIGINAL do atacante. Só
                // Pútrido tem miasmaChance > 0 — o chefe nunca ativa isso.
                const miasmaProc = MiasmaService.procs(attacker.miasmaChance ?? 0, rng());

                const miasmaStacks = miasmaProc ? MiasmaService.applyDebuff(miasmaFlagsById.get(attackTarget.id)) : 0;

                // Confusão: sorteado com o valor ORIGINAL do atacante. Só
                // a Louca tem confusionChance > 0 — o chefe nunca ativa
                // isso ao atacar.
                const confusionProc = ConfusionService.procs(attacker.confusionChance ?? 0, rng());

                if (confusionProc) ConfusionService.applyPending(confusionFlagsById.get(attackTarget.id));

                // Paralisia: sorteado com o valor ORIGINAL do atacante.
                // Só o Eletro tem paralysisChance > 0 — o chefe nunca
                // ativa isso ao atacar.
                const paralysisProc = ParalysisService.procs(attacker.paralysisChance ?? 0, rng());

                if (paralysisProc) ParalysisService.applyPending(paralysisFlagsById.get(attackTarget.id));

                // Golpe Duplo: sorteado com o valor ORIGINAL do atacante.
                // Só o Samurai tem doubleStrikeChance > 0 — o chefe nunca
                // ativa isso. Sem estado pendente nenhum — repete o MESMO
                // `damage` já aplicado acima uma segunda vez, na hora, sem
                // rolar Crítico/Roubo de Vida/Absorção de novo (ver
                // DoubleStrikeService.js).
                const doubleStrikeProc = DoubleStrikeService.procs(attacker.doubleStrikeChance ?? 0, rng());

                if (doubleStrikeProc) {
                    attackTarget.currentHP = Math.max(0, attackTarget.currentHP - damage);
                }

                // Pressão Gravitacional: sorteado com o valor ORIGINAL do
                // atacante. Só a Singularidade tem gravityChance > 0 — o
                // chefe nunca ativa isso ao atacar.
                const gravityProc = GravityService.procs(attacker.gravityChance ?? 0, rng());

                let gravityStacks = 0;
                let gravityTriggered = false;

                if (gravityProc) {
                    const stackResult = GravityService.applyStack(gravityFlagsById.get(attackTarget.id));
                    gravityStacks = stackResult.stacks;
                    gravityTriggered = stackResult.triggered;
                }

                log.push({
                    round: guard,
                    attackerId: attacker.id,
                    attackerSide: attacker.side,
                    targetId: attackTarget.id,
                    dodged: false,
                    damage,
                    rawDamage,
                    armorMitigated,
                    critical: isCritical,
                    lifeSteal: lifeStealAmount,
                    absorbed,
                    mimicBonus,
                    // Nome de quem a Imitação copiou nesse golpe (ver
                    // MimicService.buildMessage).
                    mimicOpponentName: mimicBonus > 0 ? attackTarget.name : null,
                    attackName: chosenAttack?.name ?? null,
                    miasmaProc,
                    miasmaStacks,
                    miasmaTargetHasSpecials: MiasmaService.hasAnySpecials(attackTarget),
                    miasmaAttackWeakened: attackMark < 1 && MiasmaService.hasAttackSpecials(attacker),
                    miasmaDefendWeakened: defendMark < 1 && MiasmaService.hasDefendSpecials(attackTarget),
                    confusionOutcome,
                    confusionProc,
                    paralysisProc,
                    doubleStrikeProc,
                    gravityProc,
                    gravityStacks,
                    gravityTriggered,
                    gravityArmorHalved
                });

                // Segunda entrada própria no log pro Golpe Duplo — mesmo
                // dano, sem crítico/absorção/life steal (já não rolam de novo).
                if (doubleStrikeProc) {
                    log.push({
                        round: guard,
                        attackerId: attacker.id,
                        attackerSide: attacker.side,
                        targetId: attackTarget.id,
                        dodged: false,
                        damage,
                        attackName: chosenAttack?.name ?? null,
                        doubleStrike: true
                    });
                }

                // Reviver do Yggdrasil: quem o chefe acabou de derrubar
                // volta uma vez por andar. Entra no log como uma "mordida"
                // só de cura em quem reviveu, que a tela já sabe aplicar.
                if (isBossTurn) {

                    const reviveHeal = PvpCombatService.reviveIfDead(attackTarget);

                    if (reviveHeal > 0) {
                        log.push({
                            round: guard,
                            attackerId: attackTarget.id,
                            attackerSide: "squad",
                            targetId: bossCombatant.id,
                            petBite: true,
                            revive: true,
                            damage: 0,
                            heal: reviveHeal,
                            healedIds: [attackTarget.id]
                        });
                    }

                }

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

                    // Cura da habilidade (ex: Duende) — foca em QUEM
                    // está com a vida ATUAL mais baixa do squad (o
                    // próprio atacante pode ser o alvo) em vez de
                    // sortear, senão a cura desperdiçava em quem já
                    // estava com a vida cheia enquanto outro agonizava.
                    let petHeal = 0;
                    let healedIds = [];

                    if (attacker.petHealAmount > 0) {

                        petHeal = attacker.petHealAmount;

                        const healTargets = aliveSquad();
                        const healTarget = healTargets.reduce(
                            (lowest, c) => c.currentHP < lowest.currentHP ? c : lowest
                        );
                        healTarget.currentHP = Math.min(healTarget.maxHP, healTarget.currentHP + petHeal);
                        healedIds.push(healTarget.id);

                    }

                    log.push({
                        round: guard,
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
