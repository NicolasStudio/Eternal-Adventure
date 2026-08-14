const DODGE_CAP = 40;

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

    As fórmulas (mitigação proporcional de armadura, teto de esquiva)
    são as mesmas usadas em CombatEngine.js — não reaproveitamos a
    classe em si porque ela tem uma assimetria (Roubo de Vida só é
    aplicado de verdade pro lado "player", nunca pro lado "monster")
    que não faz diferença nas dungeons (monstro não tem esse atributo),
    mas seria injusta num PVP onde os dois lados são jogadores de
    verdade.
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

        return {
            name: player.name,
            image: player.transcendence?.image ?? player.class.image,
            maxHP: player.maxHP,
            currentHP: player.maxHP,
            attack: stats.attack,
            armor: stats.armor,
            agility: stats.agility,
            criticalChance: stats.criticalChance ?? 0,
            lifeSteal: stats.lifeSteal ?? 0,
            penetration: stats.penetration ?? 0
        };

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

        while (a.currentHP > 0 && b.currentHP > 0 && guard < 500) {

            guard++;

            const attacker = turn === "a" ? a : b;
            const defender = turn === "a" ? b : a;

            const dodgeChance = Math.min(
                DODGE_CAP,
                Math.max(0, defender.agility - attacker.agility)
            );

            if (rng() * 100 < dodgeChance) {

                log.push({ turn, attacker: attacker.name, dodged: true });

            } else {

                const isCritical = rng() * 100 < attacker.criticalChance;
                const criticalMultiplier = isCritical ? 1.5 : 1;
                const effectiveArmor = defender.armor * (1 - attacker.penetration / 100);
                const mitigation = 100 / (100 + Math.max(0, effectiveArmor));
                const damage = Math.max(1, Math.floor(attacker.attack * criticalMultiplier * mitigation));

                defender.currentHP = Math.max(0, defender.currentHP - damage);

                let lifeStealAmount = 0;

                if (rng() * 100 < attacker.lifeSteal) {
                    lifeStealAmount = Math.floor(damage * 0.20) + Math.floor(attacker.maxHP * 0.02);
                    attacker.currentHP = Math.min(attacker.maxHP, attacker.currentHP + lifeStealAmount);
                }

                log.push({
                    turn,
                    attacker: attacker.name,
                    dodged: false,
                    damage,
                    critical: isCritical,
                    lifeSteal: lifeStealAmount
                });

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

}
