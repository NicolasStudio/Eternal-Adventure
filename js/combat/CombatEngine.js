

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

        const winner = playerAgility >= monsterAgility
            ? "player"
            : "monster";
            
        return winner;
    }
    nextTurn() {

        this.currentTurn =
            this.currentTurn === "player"
                ? "monster"
                : "player";

    }

    attack() {

        const playerTurn = this.currentTurn === "player";

        const attacker = playerTurn
            ? this.player.stats
            : this.monster.status;

        const defender = playerTurn
            ? this.monster.status
            : this.player.stats;

        const result = this.calculateDamage(attacker, defender);

        if (playerTurn) {

            this.monster.status.vidaAtual -= result.damage;

            this.monster.status.vidaAtual = Math.max(
                0,
                this.monster.status.vidaAtual
            );

        } else {

            this.player.currentHP -= result.damage;

            this.player.currentHP = Math.max(
                0,
                this.player.currentHP
            );

        }

        return {
            attacker: playerTurn ? "player" : "monster",
            target: playerTurn ? "monster" : "player",
            damage: result.damage,
            critical: result.critical
        };

    }

    calculateDamage(attacker, defender) {

        const attack = attacker.attack ?? attacker.dano;

        const armor = defender.armor ?? defender.armadura;

        const criticalChance = attacker.criticalChance ?? 0;

        const penetration = attacker.penetration ?? 0;

        const isCritical =
            Math.random() * 100 < criticalChance;

        const criticalMultiplier =
            isCritical ? 1.5 : 1;

        const effectiveArmor =
            armor * (1 - penetration / 100);

        const damage = Math.max(
            1,
            Math.floor(
                (attack * criticalMultiplier) - effectiveArmor
            )
        );

        return {
            damage,
            critical: isCritical
        };

    }

    createAttackMessage(result) {

        // Ataque do jogador
        if (result.attacker === "player") {

            if (result.critical) {

                return `
                    <span class="combat-critical">Golpe Crítico!</span><br>
                    Você causou <strong>${result.damage}</strong> de dano.
                `;

            }

            return `
                Você causou <strong>${result.damage}</strong> de dano.
            `;

        }

        // Ataque do monstro
        if (result.critical) {

            return `
                <span class="combat-critical">Ataque Crítico!</span><br>
                Você recebeu <strong>${this.monster.status.nomeAtaque}</strong>,
                levando <strong>${result.damage}</strong> de dano.
            `;

        }

        return `
            Você recebeu <strong>${this.monster.status.nomeAtaque}</strong>,
            levando <strong>${result.damage}</strong> de dano.
        `;

    }

    checkCombatState() {

        if (this.monster.status.vidaAtual <= 0) {

            return {
                finished: true,
                winner: "player"
            };

        }

        if (this.player.currentHP <= 0) {

            return {
                finished: true,
                winner: "monster"
            };

        }

        return {
            finished: false,
            winner: null
        };

    }

}