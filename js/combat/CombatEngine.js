// Teto máximo de chance de esquiva, não importa o quanto a agilidade
// de um lado supere a do outro — nunca "nunca é atingido".
const DODGE_CAP = 40;

// Quando a Absorção ativa (ver calculateDamage), ela corta essa fração
// do dano daquele golpe — não é o valor cheio do atributo, só QUANTO
// mitiga quando a chance realmente proc.
const ABSORPTION_MITIGATION_RATIO = 0.5;

export default class CombatEngine {
    constructor(player, monster) {
        this.player = player;
        this.monster = monster;
        this.currentTurn = null;
        this.initiative = null;
    }

    rollInitiative() {
        const stats = this.player.stats.getFinalStats();
        const playerAgility = stats.agility;
        const monsterAgility = this.monster.status.agilidade;
        return playerAgility >= monsterAgility ? "player" : "monster";
    }

    nextTurn() {
        this.currentTurn = this.currentTurn === "player" ? "monster" : "player";
    }

    attack() {
        const playerTurn = this.currentTurn === "player";
        const attacker = playerTurn ? this.player.stats : this.monster.status;
        const defender = playerTurn ? this.monster.status : this.player.stats;

        if (this.rollDodge(attacker, defender)) {
            return {
                attacker: playerTurn ? "player" : "monster",
                target: playerTurn ? "monster" : "player",
                dodged: true,
                damage: 0,
                critical: false,
                lifeSteal: 0,
                absorbed: 0,
                healedFromAbsorption: 0
            };
        }

        const result = this.calculateDamage(attacker, defender);
        if (playerTurn) {
            this.monster.status.vidaAtual -= result.damage;
            this.monster.status.vidaAtual = Math.max(0, this.monster.status.vidaAtual);
            if (result.lifeSteal > 0) {
                this.player.currentHP = Math.min(this.player.maxHP, this.player.currentHP + result.lifeSteal);
            }
        } else {
            this.player.currentHP -= result.damage;
            this.player.currentHP = Math.max(0, this.player.currentHP);
            // Absorção cura quem DEFENDEU (o jogador, nesse ramo) — assim
            // como o Roubo de Vida acima só é aplicado de verdade pro
            // lado "player" (monstro não tem esse atributo), a cura da
            // Absorção só é aplicada aqui, no golpe que o monstro deu.
            if (result.healedFromAbsorption > 0) {
                this.player.currentHP = Math.min(this.player.maxHP, this.player.currentHP + result.healedFromAbsorption);
            }
        }
        return {
            attacker: playerTurn ? "player" : "monster",
            target: playerTurn ? "monster" : "player",
            dodged: false,
            damage: result.damage,
            critical: result.critical,
            lifeSteal: result.lifeSteal,
            absorbed: result.absorbed,
            healedFromAbsorption: result.healedFromAbsorption
        };
    }

    // Esquiva: a diferença de agilidade entre quem defende e quem ataca
    // vira % de chance de esquiva pra quem defende, sempre travada em
    // DODGE_CAP — a chance nunca passa disso, não importa a diferença.
    rollDodge(attacker, defender) {

        const attackerAgility = attacker.agility ?? attacker.agilidade ?? 0;
        const defenderAgility = defender.agility ?? defender.agilidade ?? 0;

        const dodgeChance = Math.min(
            DODGE_CAP,
            Math.max(0, defenderAgility - attackerAgility)
        );

        return Math.random() * 100 < dodgeChance;

    }

    calculateDamage(attacker, defender) {

        const attack = attacker.attack ?? attacker.dano;
        const armor = defender.armor ?? defender.armadura;
        const penetration = attacker.penetration ?? 0;
        const criticalChance = attacker.criticalChance ?? 0;

        // Chance de ativação do Life Steal
        const lifeStealChance = attacker.lifeSteal ?? 0;

        const isCritical = Math.random() * 100 < criticalChance;
        const criticalMultiplier = isCritical ? 1.5 : 1;

        const effectiveArmor = armor * (1 - penetration / 100);

        // Mitigação PROPORCIONAL (retorno decrescente): quanto mais
        // armadura, menos dano passa, mas NUNCA chega a zero — ao
        // contrário da subtração seca, aqui não existe "armadura alta
        // demais" que anula o ataque por completo.
        const mitigation = 100 / (100 + Math.max(0, effectiveArmor));

        const preAbsorption = Math.max(
            1,
            Math.floor(attack * criticalMultiplier * mitigation)
        );

        // Absorção: CHANCE de o defensor absorver parte do golpe — igual
        // ao Roubo de Vida (que é "chance de proc", não garantido), só
        // que do lado de quem APANHA em vez de quem ataca. Quando ativa,
        // mitiga uma fração do dano (ABSORPTION_MITIGATION_RATIO) e cura
        // parte do que foi absorvido, na mesma proporção usada pelo
        // Roubo de Vida (20% do valor absorvido + 2% da vida máxima).
        const absorptionChance = Math.min(95, defender.absorption ?? 0);

        let absorbed = 0;
        let healedFromAbsorption = 0;

        if (Math.random() * 100 < absorptionChance) {

            absorbed = Math.floor(preAbsorption * ABSORPTION_MITIGATION_RATIO);

            healedFromAbsorption =
                Math.floor(absorbed * 0.20) +
                Math.floor(this.player.maxHP * 0.02);

        }

        const damage = Math.max(1, preAbsorption - absorbed);

        // ==========================
        // LIFE STEAL
        // ==========================

        let recoveredHP = 0;

        if (Math.random() * 100 < lifeStealChance) {

            recoveredHP =
                Math.floor(damage * 0.20) +
                Math.floor(this.player.maxHP * 0.02);

        }

        return {
            damage,
            critical: isCritical,
            lifeSteal: recoveredHP,
            absorbed,
            healedFromAbsorption
        };

    }

    createAttackMessage(result) {

        if (result.dodged) {
            return result.attacker === "player"
                ? `<span class="combat-dodge">${this.monster.name} esquivou do seu ataque!</span>`
                : `<span class="combat-dodge">Você esquivou do ataque!</span>`;
        }

        if (result.attacker === "player") {
            let message = "";
            if (result.critical) {
                message += `<span class="combat-critical">Golpe Crítico!</span><br>`;
            }
            message += `Você causou <strong>${result.damage}</strong> de dano.`;
            if (result.lifeSteal > 0) {
                message += `<br><span class="combat-life-steal">Life Steal!</span> Recuperou <strong>${result.lifeSteal}</strong> HP.`;
            }
            return message;
        }

        let message = "";
        if (result.critical) {
            message += `<span class="combat-critical">Ataque Crítico!</span><br>`;
        }
        message += ` Você recebeu <strong>${this.monster.status.nomeAtaque}</strong>, <strong>${result.damage}</strong> de dano.`;
        if (result.healedFromAbsorption > 0) {
            message += `<br><span class="combat-absorption">Você absorveu parte do ataque!</span> ${result.absorbed} de dano mitigado, recuperou <strong>${result.healedFromAbsorption}</strong> HP.`;
        }
        return message;
    }

    checkCombatState() {
        if (this.monster.status.vidaAtual <= 0) {
            return { finished: true, winner: "player" };
        }
        if (this.player.currentHP <= 0) {
            return { finished: true, winner: "monster" };
        }
        return { finished: false, winner: null };
    }
}