import PetService from "./PetService.js";
import PowerService from "./PowerService.js";
import BoitataBurn from "./BoitataBurn.js";
import MiasmaService from "./MiasmaService.js";
import MimicService from "./MimicService.js";
import { ABSORPTION_CAP, absorbedAmount } from "../combat/Absorption.js";
import { CRITICAL_MULTIPLIER } from "../combat/Critical.js";

const DODGE_CAP = 40;

// Versão da simulação do 2x2. Como os 4 clientes calculam a luta cada um
// no seu navegador, dois jogadores em versões diferentes chegariam a
// resultados diferentes — o pareamento do 2x2 só junta quem tem o MESMO
// número (ver PvpLobbyService). Aumente sempre que mudar a simulação.
// v3: Miasma do Pútrido passou a consumir rng() (o sorteio da ativação) —
// clientes na v2 não fariam essa chamada e desincronizariam.
// v4: Miasma ganhou acúmulos de Intoxicação (−Ataque/−Agilidade) — muda
// dano e esquiva, então o resultado da luta muda. Junto: Absorção passou
// a absorver metade do golpe (antes anulava o golpe inteiro).
// v5: Crítico 1.6x (era 1.5x), Absorção 42% (era 50%) e Miasma com
// especiais −25% a luta toda + acúmulos 3/6/10%.
// v6: Mímico — soma dano verdadeiro extra (Imitação% do Ataque do alvo)
// em todo golpe que acerta. Não consome rng() a mais, mas muda o
// resultado de qualquer luta com um Mímico nos dois lados.
// v7: Imitação deixou de ser dano à parte — agora soma Imitação% do
// Ataque do alvo ao PRÓPRIO Ataque antes da mitigação, passando por
// Crítico/Armadura/Absorção igual o resto do golpe.
export const TEAM_SIM_VERSION = 7;

/*
    PVP precisa que os DOIS clientes (o do jogador A e o do jogador B)
    cheguem exatamente ao mesmo resultado de combate, sem depender de
    ficar trocando mensagem por mensagem durante a luta em si — só o
    "pareamento" (quem lutou com quem) passa pelo Firebase.

    Pra isso, a luta usa um gerador de números aleatórios com SEMENTE
    (mulberry32): os dois lados, combinando a MESMA semente, tiram
    exatamente os mesmos números "aleatórios" na mesma ordem — o
    resultado sai idêntico nos dois navegadores, sem precisar de um
    servidor calculando por eles.

    A mitigação de armadura e a absorção são as mesmas usadas em
    CombatEngine.js — não reaproveitamos a classe em si porque ela tem uma
    assimetria (Roubo de Vida só é aplicado de verdade pro lado "player",
    nunca pro lado "monster") que não faz diferença nas dungeons (monstro
    não tem esse atributo), mas seria injusta num PVP onde os dois lados
    são jogadores de verdade.

    A ESQUIVA é diferente de propósito: aqui usa uma razão proporcional
    (`dodgeChance()`, abaixo) em vez do `min(40, max(0, agiDef-agiAtk))`
    do CombatEngine.js — esse "tudo ou nada" travava em 0% sempre que o
    defensor não fosse o mais ágil dos dois, o que deixava classes lentas
    (Guerreiro) matematicamente injogáveis contra qualquer oponente mais
    ágil. Dungeons (CombatEngine.js) não usam essa mudança de propósito —
    lá o monstro não tem "carreira" de PVP pra proteger.
*/

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

export default class PvpCombatService {

    // Congela um Player de verdade num "combatente" simples — só os
    // números que importam pra luta, sem referência ao objeto Player
    // em si (o resultado não pode mudar se o jogador trocar de item
    // depois de a partida já ter sido criada).
    static snapshotCombatant(player) {

        const stats = player.stats.getFinalStats();

        // Mordida do pet equipado: efeito GARANTIDO extra a cada turno
        // de quem tem o pet, resolvido junto do golpe principal (ver
        // simulate()/simulateTeam() abaixo), sem consumir nenhum rng()
        // extra, pra não desalinhar a simulação determinística entre os
        // clientes. Pets com habilidade de cura (ex: Duende) não causam
        // dano nenhum, só curam UM alvo sorteado (você ou um aliado, se
        // houver). petMimicRatio (ex: Aranha) não é um dano fixo — é a
        // FRAÇÃO do dano real que o golpe principal daquele turno
        // acabou de causar (já mitigado pela armadura do alvo), então
        // só pode ser resolvido dentro do loop de combate, não aqui.
        const scaledPet = player.equipment.pet
            ? PetService.getScaledStats(player.equipment.pet)
            : null;

        return {
            name: player.name,
            image: player.transcendence?.image ?? player.class.image,
            // Só pra exibição (cartões de vida do 2x2) — não entram na luta.
            hud: player.transcendence?.hud ?? player.class.hud,
            level: player.level,
            class: player.class.id,
            maxHP: player.maxHP,
            currentHP: player.maxHP,
            attack: stats.attack,
            armor: stats.armor,
            agility: stats.agility,
            criticalChance: stats.criticalChance ?? 0,
            lifeSteal: stats.lifeSteal ?? 0,
            penetration: stats.penetration ?? 0,
            absorption: stats.absorption ?? 0,
            // Só o Pútrido tem isso > 0 (ver MiasmaService.js) — em
            // qualquer outra classe fica 0 e o Miasma nunca ativa.
            miasmaChance: stats.miasmaChance ?? 0,
            // Só o Mímico tem isso > 0 (ver MimicService.js).
            reflection: stats.reflection ?? 0,
            petBiteDamage: scaledPet?.biteDamage ?? 0,
            petHealAmount: scaledPet?.healAmount ?? 0,
            petMimicRatio: scaledPet?.mimicRatio ?? 0,
            petBurnDamage: scaledPet?.burnDamage ?? 0,
            petName: player.equipment.pet?.name ?? null,
            simVersion: TEAM_SIM_VERSION,
            // Só pro matchmaking (PvpLobbyService) — não entra no combate.
            power: PowerService.getPower(player)
        };

    }

    // Esquiva proporcional: quem defende mais ágil que quem ataca dodga
    // mais, mas nunca zera de vez pro lado mais lento (ao contrário de
    // `min(40, max(0, agiDef - agiAtk))`, que travava em 0% sempre que o
    // defensor não fosse o mais ágil dos dois — impossível de reverter só
    // empilhando armadura/vida). Continua limitada a DODGE_CAP no teto.
    static dodgeChance(defenderAgility, attackerAgility) {

        const total = defenderAgility + attackerAgility;

        if (total <= 0) return 0;

        return DODGE_CAP * defenderAgility / total;

    }

    // seed: qualquer número inteiro — os dois clientes usam o MESMO
    // valor (guardado na partida, no Firebase) pra chegar no mesmo
    // resultado de forma independente.
    static simulate(combatantA, combatantB, seed) {

        const rng = mulberry32(seed);

        const a = { ...combatantA };
        const b = { ...combatantB };

        const log = [];

        let turn = a.agility >= b.agility ? "a" : "b";
        let guard = 0;

        // Queimadura do Boitatá ativa POR DONO (ver BoitataBurn.js) —
        // chave = quem tem o pet ("a"/"b"), o alvo é sempre o outro.
        // Não consome rng(), então não dessincroniza os dois clientes.
        const burns = { a: null, b: null };

        // Miasma do Pútrido (ver MiasmaService.js) — marca pendente de
        // débuff por lado.
        const miasmaFlags = { a: MiasmaService.createFlags(), b: MiasmaService.createFlags() };

        while (a.currentHP > 0 && b.currentHP > 0 && guard < 500) {

            guard++;

            const attacker = turn === "a" ? a : b;
            const defender = turn === "a" ? b : a;

            const defenderKey = turn === "a" ? "b" : "a";

            // Acúmulos de Intoxicação do Miasma: Ataque e Agilidade de
            // quem estiver intoxicado saem reduzidos a luta inteira.
            const attackerMult = MiasmaService.statMultiplier(miasmaFlags[turn]);
            const defenderMult = MiasmaService.statMultiplier(miasmaFlags[defenderKey]);

            const dodgeChance = this.dodgeChance(defender.agility * defenderMult, attacker.agility * attackerMult);

            if (rng() * 100 < dodgeChance) {

                log.push({ turn, attacker: attacker.name, dodged: true });

            } else {

                // Miasma: marca pendente no ATACANTE reduz Crítico/Roubo
                // de Vida/Penetração DESSE golpe; marca pendente no
                // DEFENSOR reduz a Absorção dele ao recebê-lo.
                const attackMark = MiasmaService.consumeAttackMultiplier(miasmaFlags[turn]);
                const attackDebuff = attackMark * MiasmaService.persistentSpecialMultiplier(miasmaFlags[turn]);
                const defendMark = MiasmaService.consumeDefendMultiplier(miasmaFlags[defenderKey]);
                const defendDebuff = defendMark * MiasmaService.persistentSpecialMultiplier(miasmaFlags[defenderKey]);

                const isCritical = rng() * 100 < attacker.criticalChance * attackDebuff;
                const criticalMultiplier = isCritical ? CRITICAL_MULTIPLIER : 1;
                const effectiveArmor = defender.armor * (1 - (attacker.penetration * attackDebuff) / 100);
                const mitigation = 100 / (100 + Math.max(0, effectiveArmor));

                // Imitação do Mímico: soma Imitação% do Ataque do alvo ao
                // PRÓPRIO Ataque ANTES da mitigação — vira parte do golpe
                // normal (passa por Crítico/Armadura/Absorção igual o
                // resto, não é mais "dano à parte"). Ver MimicService.js.
                const mimicBonusAttack = MimicService.getBonusAttack(defender.attack, attacker.reflection ?? 0);
                const totalAttack = attacker.attack * attackerMult + mimicBonusAttack;
                const preAbsorption = Math.max(1, Math.floor(totalAttack * criticalMultiplier * mitigation));

                // Absorção: CHANCE de quem defende absorver parte do golpe
                // (ver Absorption.js). Sempre consome 1 rng(), ativando ou
                // não — a ordem dos sorteios não pode mudar.
                const absorptionChance = Math.min(ABSORPTION_CAP, (defender.absorption ?? 0) * defendDebuff);
                const absorbed = absorbedAmount(preAbsorption, rng() * 100 < absorptionChance);

                const damage = preAbsorption - absorbed;

                // Quanto do dano final veio da Imitação (só pra mensagem) —
                // proporcional, já que o bônus entrou junto no Ataque.
                const mimicBonus = mimicBonusAttack > 0 ? Math.round(damage * mimicBonusAttack / totalAttack) : 0;

                defender.currentHP = Math.max(0, defender.currentHP - damage);

                let lifeStealAmount = 0;

                if (rng() * 100 < attacker.lifeSteal * attackDebuff) {
                    lifeStealAmount = Math.floor(damage * 0.20) + Math.floor(attacker.maxHP * 0.02);
                    attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + lifeStealAmount);
                }

                // Miasma: sorteado com o valor ORIGINAL do atacante (não
                // afetado pelo próprio débuff que ele talvez esteja
                // sofrendo). Só Pútrido tem miasmaChance > 0.
                const miasmaProc = MiasmaService.procs(attacker.miasmaChance ?? 0, rng());

                const miasmaStacks = miasmaProc ? MiasmaService.applyDebuff(miasmaFlags[defenderKey]) : 0;

                log.push({
                    turn,
                    attacker: attacker.name,
                    dodged: false,
                    damage,
                    critical: isCritical,
                    lifeSteal: lifeStealAmount,
                    absorbed,
                    mimicBonus,
                    miasmaProc,
                    miasmaStacks,
                    miasmaTargetHasSpecials: MiasmaService.hasAnySpecials(defender),
                    miasmaAttackWeakened: attackMark < 1 && MiasmaService.hasAttackSpecials(attacker),
                    miasmaDefendWeakened: defendMark < 1 && MiasmaService.hasDefendSpecials(defender)
                });

                // Mordida do pet: garantida, não consome rng(). Dano e
                // cura são efeitos independentes — um pet de cura pura
                // (ex: Duende, sem dano nenhum) ainda precisa disparar
                // esse bloco só pra curar. petMimicRatio (ex: Aranha)
                // copia uma fração do `damage` que ACABOU de ser
                // causado nesse mesmo golpe (já mitigado pela armadura
                // do alvo) — nunca do ataque bruto do atacante.
                const petBiteAmount = attacker.petMimicRatio > 0
                    ? Math.floor(damage * attacker.petMimicRatio)
                    : attacker.petBiteDamage;

                if (petBiteAmount > 0 || attacker.petHealAmount > 0) {

                    let biteDamage = 0;

                    if (petBiteAmount > 0 && defender.currentHP > 0) {
                        biteDamage = Math.min(defender.currentHP, petBiteAmount);
                        defender.currentHP = Math.max(0, defender.currentHP - petBiteAmount);
                    }

                    // Cura da habilidade (ex: Duende) — 1v1 não tem
                    // aliado, sempre volta pra quem mordeu.
                    let petHeal = 0;

                    if (attacker.petHealAmount > 0) {
                        petHeal = attacker.petHealAmount;
                        attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + petHeal);
                    }

                    log.push({ turn, attacker: attacker.name, petBite: true, damage: biteDamage, heal: petHeal });

                }

                // Boitatá: a queimadura liga no primeiro golpe que acerta.
                if (attacker.petBurnDamage > 0 && !burns[turn]) {
                    burns[turn] = { first: true };
                }

            }

            // Fim do turno: a queimadura só cobra na vez do próprio DONO
            // (quem acabou de agir), nunca no turno do adversário.
            const burn = burns[turn];

            if (burn && a.currentHP > 0 && b.currentHP > 0) {

                const tickDamage = BoitataBurn.getTickDamage(attacker.petBurnDamage);
                const applied = Math.min(defender.currentHP, tickDamage);

                defender.currentHP = Math.max(0, defender.currentHP - tickDamage);

                log.push({
                    turn,
                    attacker: attacker.name,
                    burn: true,
                    burnStart: burn.first,
                    burnTarget: turn === "a" ? "b" : "a",
                    damage: applied
                });

                burn.first = false;

            }

            turn = turn === "a" ? "b" : "a";

        }

        const winner = a.currentHP > 0 ? "a" : "b";

        return {
            winner,
            log,
            finalHP: { a: a.currentHP, b: b.currentHP }
        };

    }

    // Versão 2x2: teamA e teamB são arrays com 2 combatentes cada, e
    // cada combatente precisa ter um "id" próprio (pra distinguir os
    // dois integrantes do mesmo time no log). Todos os 4 agem uma vez
    // por rodada, na ordem da agilidade (do mais rápido pro mais
    // lento) — cada ataque mira um alvo VIVO aleatório do time
    // inimigo. Termina quando um time inteiro fica com HP 0.
    static simulateTeam(teamA, teamB, seed) {

        const rng = mulberry32(seed);

        const a = teamA.map(c => ({ ...c, team: "a" }));
        const b = teamB.map(c => ({ ...c, team: "b" }));
        const all = [...a, ...b];

        // Ordem de turno fixa por agilidade — decidida uma vez só, no
        // início. Empate mantém a ordem de entrada (não usa o RNG
        // aqui, pra reservar ele só pra esquiva/crítico/alvo — usar
        // pra desempate também arriscaria o resultado desalinhar
        // entre navegadores diferentes por causa de engine de sort).
        const turnOrder = [...all].sort((x, y) => y.agility - x.agility);

        const log = [];
        let guard = 0;

        const aliveOf = (team) => (team === "a" ? a : b).filter(c => c.currentHP > 0);

        // Queimadura do Boitatá (ver BoitataBurn.js): uma por DONO, ligada
        // no primeiro golpe dele que acerta e cobrada só na vez do
        // próprio dono. Não consome rng(); o alvo é sempre o mesmo
        // enquanto estiver vivo, senão o primeiro inimigo vivo na ordem
        // do time — igual nos 4 clientes.
        const burns = new Map();

        // Miasma do Pútrido (ver MiasmaService.js) — uma marca por
        // COMBATENTE (não por time: cada um dos 4 pode estar debuffado
        // independente dos aliados).
        const miasmaFlagsById = new Map(all.map(c => [c.id, MiasmaService.createFlags()]));

        const tickBurn = (owner, enemyTeam) => {

            const burn = burns.get(owner.id);

            if (!burn) return;

            const enemies = aliveOf(enemyTeam);

            if (enemies.length === 0) return;

            const target = enemies.find(c => c.id === burn.targetId) ?? enemies[0];

            burn.targetId = target.id;

            const tickDamage = BoitataBurn.getTickDamage(owner.petBurnDamage);
            const applied = Math.min(target.currentHP, tickDamage);

            target.currentHP = Math.max(0, target.currentHP - tickDamage);

            log.push({
                attackerId: owner.id,
                attackerTeam: owner.team,
                targetId: target.id,
                burn: true,
                burnStart: burn.first,
                damage: applied
            });

            burn.first = false;

        };

        while (aliveOf("a").length > 0 && aliveOf("b").length > 0 && guard < 1000) {

            guard++;

            for (const attacker of turnOrder) {

                if (attacker.currentHP <= 0) continue;

                const enemyTeam = attacker.team === "a" ? "b" : "a";
                const targets = aliveOf(enemyTeam);

                if (targets.length === 0) break; // time inimigo já perdeu

                const target = targets[Math.floor(rng() * targets.length)];

                // Acúmulos de Intoxicação do Miasma: Ataque e Agilidade de
                // quem estiver intoxicado saem reduzidos a luta inteira.
                const attackerMult = MiasmaService.statMultiplier(miasmaFlagsById.get(attacker.id));
                const targetMult = MiasmaService.statMultiplier(miasmaFlagsById.get(target.id));

                const dodgeChance = this.dodgeChance(target.agility * targetMult, attacker.agility * attackerMult);

                if (rng() * 100 < dodgeChance) {

                    log.push({
                        attackerId: attacker.id,
                        attackerTeam: attacker.team,
                        targetId: target.id,
                        dodged: true
                    });

                    // Turno esquivado também é turno do dono: a
                    // queimadura (já ligada) cobra.
                    tickBurn(attacker, enemyTeam);

                    if (aliveOf(enemyTeam).length === 0) break;

                    continue;

                }

                // Miasma: marca pendente no ATACANTE reduz Crítico/Roubo
                // de Vida/Penetração DESSE golpe; marca pendente no ALVO
                // reduz a Absorção dele ao recebê-lo.
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
                // resto, não é mais "dano à parte"). Ver MimicService.js.
                const mimicBonusAttack = MimicService.getBonusAttack(target.attack, attacker.reflection ?? 0);
                const totalAttack = attacker.attack * attackerMult + mimicBonusAttack;
                const preAbsorption = Math.max(1, Math.floor(totalAttack * criticalMultiplier * mitigation));

                const absorptionChance = Math.min(ABSORPTION_CAP, (target.absorption ?? 0) * defendDebuff);
                const absorbed = absorbedAmount(preAbsorption, rng() * 100 < absorptionChance);

                const damage = preAbsorption - absorbed;

                // Quanto do dano final veio da Imitação (só pra mensagem) —
                // proporcional, já que o bônus entrou junto no Ataque.
                const mimicBonus = mimicBonusAttack > 0 ? Math.round(damage * mimicBonusAttack / totalAttack) : 0;

                target.currentHP = Math.max(0, target.currentHP - damage);

                let lifeStealAmount = 0;

                if (rng() * 100 < attacker.lifeSteal * attackDebuff) {
                    lifeStealAmount = Math.floor(damage * 0.20) + Math.floor(attacker.maxHP * 0.02);
                    attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + lifeStealAmount);
                }

                // Miasma: sorteado com o valor ORIGINAL do atacante. Só
                // Pútrido tem miasmaChance > 0.
                const miasmaProc = MiasmaService.procs(attacker.miasmaChance ?? 0, rng());

                const miasmaStacks = miasmaProc ? MiasmaService.applyDebuff(miasmaFlagsById.get(target.id)) : 0;

                log.push({
                    attackerId: attacker.id,
                    attackerTeam: attacker.team,
                    targetId: target.id,
                    dodged: false,
                    damage,
                    critical: isCritical,
                    lifeSteal: lifeStealAmount,
                    absorbed,
                    mimicBonus,
                    miasmaProc,
                    miasmaStacks,
                    miasmaTargetHasSpecials: MiasmaService.hasAnySpecials(target),
                    miasmaAttackWeakened: attackMark < 1 && MiasmaService.hasAttackSpecials(attacker),
                    miasmaDefendWeakened: defendMark < 1 && MiasmaService.hasDefendSpecials(target)
                });

                // Mordida do pet: garantida, não consome rng(). Dano e
                // cura são efeitos independentes — um pet de cura pura
                // (ex: Duende, sem dano nenhum) ainda precisa disparar
                // esse bloco só pra curar. petMimicRatio (ex: Aranha)
                // copia uma fração do `damage` que ACABOU de ser
                // causado nesse mesmo golpe (já mitigado pela armadura
                // do alvo) — nunca do ataque bruto do atacante.
                const petBiteAmount = attacker.petMimicRatio > 0
                    ? Math.floor(damage * attacker.petMimicRatio)
                    : attacker.petBiteDamage;

                if (petBiteAmount > 0 || attacker.petHealAmount > 0) {

                    let biteDamage = 0;

                    if (petBiteAmount > 0 && target.currentHP > 0) {
                        biteDamage = Math.min(target.currentHP, petBiteAmount);
                        target.currentHP = Math.max(0, target.currentHP - petBiteAmount);
                    }

                    // Cura da habilidade (ex: Duende) — sorteia UM alvo
                    // vivo do time de quem mordeu (o próprio atacante
                    // pode ser sorteado) em vez de curar o time inteiro,
                    // senão ninguém perde vida com 2 pets curativos em
                    // campo.
                    let petHeal = 0;
                    let healedIds = [];

                    if (attacker.petHealAmount > 0) {

                        petHeal = attacker.petHealAmount;

                        const healTargets = aliveOf(attacker.team);
                        const healTarget = healTargets[Math.floor(rng() * healTargets.length)];
                        healTarget.currentHP = Math.min(healTarget.maxHP, healTarget.currentHP + petHeal);
                        healedIds.push(healTarget.id);

                    }

                    log.push({
                        attackerId: attacker.id,
                        attackerTeam: attacker.team,
                        targetId: target.id,
                        petBite: true,
                        damage: biteDamage,
                        heal: petHeal,
                        healedIds
                    });

                }

                // Boitatá: liga a queimadura no primeiro golpe que acerta.
                if (attacker.petBurnDamage > 0 && !burns.has(attacker.id)) {
                    burns.set(attacker.id, { first: true, targetId: target.id });
                }

                if (aliveOf(enemyTeam).length === 0) break;

                tickBurn(attacker, enemyTeam);

                if (aliveOf(enemyTeam).length === 0) break;

            }

        }

        // Se o limite de rodadas estourar com os dois times ainda vivos,
        // vence quem tem mais vida restante (proporcional) — antes o time
        // "a" (o de quem montou a partida) ganhava sempre nesse caso.
        const hpRatio = (team) => {
            const members = team === "a" ? a : b;
            const current = members.reduce((sum, c) => sum + c.currentHP, 0);
            const max = members.reduce((sum, c) => sum + c.maxHP, 0);
            return max > 0 ? current / max : 0;
        };

        let winner;

        if (aliveOf("b").length === 0) winner = "a";
        else if (aliveOf("a").length === 0) winner = "b";
        else winner = hpRatio("a") >= hpRatio("b") ? "a" : "b";

        return {
            winner,
            log,
            finalState: {
                a: a.map(c => ({ id: c.id, currentHP: c.currentHP })),
                b: b.map(c => ({ id: c.id, currentHP: c.currentHP }))
            }
        };

    }

}
