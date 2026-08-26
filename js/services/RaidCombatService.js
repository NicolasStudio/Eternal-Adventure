import PvpCombatService from "./PvpCombatService.js";

// Mesmo valor usado em PvpCombatService.js/CombatEngine.js — quando a
// Absorção ativa (chance, não garantida), corta essa fração do dano
// daquele golpe.
const ABSORPTION_MITIGATION_RATIO = 0.5;

// Boss tem HP colossal (milhares) contra só 4 atacantes por rodada —
// precisa de bem mais rodadas que um duelo de PVP (que usa guard 500/1000)
// pra não cortar a luta no meio antes do boss ou do squad morrerem.
const MAX_ROUNDS = 3000;

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
            image: raidMonster.sprite,
            maxHP: status.vidaMaxima,
            currentHP: status.vidaMaxima,
            attacks: status.ataque.map(a => ({ name: a.nomeAtaque, damage: a.dano })),
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

        while (aliveSquad().length > 0 && bossCombatant.currentHP > 0 && guard < MAX_ROUNDS) {

            guard++;

            for (const attacker of turnOrder) {

                if (attacker.currentHP <= 0) continue;

                const isBossTurn = attacker.side === "boss";

                if (isBossTurn && bossCombatant.currentHP <= 0) continue;

                const targets = isBossTurn ? aliveSquad() : (bossCombatant.currentHP > 0 ? [bossCombatant] : []);

                if (targets.length === 0) break;

                const target = targets[Math.floor(rng() * targets.length)];

                // Só o boss sorteia entre múltiplos ataques nomeados —
                // ele bate só 1 vez por turno, mas qual dos 3 golpes sai
                // é sorteado a cada turno (jogador ataca sempre com o
                // mesmo golpe fixo, sem variação). Sorteado ANTES da
                // esquiva de propósito: mesmo um golpe esquivado veio de
                // algum dos 3 ataques, então o log mostra qual.
                const chosenAttack = isBossTurn
                    ? attacker.attacks[Math.floor(rng() * attacker.attacks.length)]
                    : null;

                const dodgeChance = PvpCombatService.dodgeChance(target.agility, attacker.agility);

                if (rng() * 100 < dodgeChance) {

                    log.push({
                        attackerId: attacker.id,
                        attackerSide: attacker.side,
                        targetId: target.id,
                        dodged: true,
                        attackName: chosenAttack?.name ?? null
                    });

                    continue;

                }

                const attackPower = isBossTurn ? chosenAttack.damage : attacker.attack;

                const isCritical = rng() * 100 < attacker.criticalChance;
                const criticalMultiplier = isCritical ? 1.5 : 1;
                const effectiveArmor = target.armor * (1 - attacker.penetration / 100);
                const mitigation = 100 / (100 + Math.max(0, effectiveArmor));
                const preAbsorption = Math.max(1, Math.floor(attackPower * criticalMultiplier * mitigation));

                const absorptionChance = Math.min(95, target.absorption ?? 0);
                let absorbed = 0;
                let healedFromAbsorption = 0;

                if (rng() * 100 < absorptionChance) {
                    absorbed = Math.floor(preAbsorption * ABSORPTION_MITIGATION_RATIO);
                    healedFromAbsorption = Math.floor(absorbed * 0.20) + Math.floor(target.maxHP * 0.02);
                }

                const damage = Math.max(1, preAbsorption - absorbed);

                target.currentHP = Math.max(0, target.currentHP - damage);

                if (healedFromAbsorption > 0) {
                    target.currentHP = Math.min(target.maxHP, target.currentHP + healedFromAbsorption);
                }

                let lifeStealAmount = 0;

                if (rng() * 100 < attacker.lifeSteal) {
                    lifeStealAmount = Math.floor(damage * 0.20) + Math.floor(attacker.maxHP * 0.02);
                    attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + lifeStealAmount);
                }

                log.push({
                    attackerId: attacker.id,
                    attackerSide: attacker.side,
                    targetId: target.id,
                    dodged: false,
                    damage,
                    critical: isCritical,
                    lifeSteal: lifeStealAmount,
                    absorbed,
                    healedFromAbsorption,
                    attackName: chosenAttack?.name ?? null
                });

                if (isBossTurn ? aliveSquad().length === 0 : bossCombatant.currentHP <= 0) break;

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
