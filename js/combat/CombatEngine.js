import PetService from "../services/PetService.js";
import BoitataBurn from "../services/BoitataBurn.js";
import MiasmaService from "../services/MiasmaService.js";
import MimicService, { HP_DIVISOR_PVE as MIMIC_HP_DIVISOR_PVE } from "../services/MimicService.js";
import { ABSORPTION_CAP, ABSORPTION_RATIO_PVE, absorbedAmount } from "./Absorption.js";
import { CRITICAL_MULTIPLIER } from "./Critical.js";

// Teto máximo de chance de esquiva, não importa o quanto a agilidade
// de um lado supere a do outro — nunca "nunca é atingido".
const DODGE_CAP = 40;

export default class CombatEngine {
    constructor(player, monster) {
        this.player = player;
        this.monster = monster;
        this.currentTurn = null;
        this.initiative = null;
        // Queimadura do Boitatá (ver BoitataBurn.js) — null até o
        // primeiro golpe do jogador que acerta; o engine é recriado a
        // cada andar, então a queimadura sempre acaba junto do combate.
        this.burn = null;
        // Miasma do Pútrido (ver MiasmaService.js) — marca pendente de
        // débuff em cada lado; também reiniciado a cada andar.
        this.miasmaFlags = {
            player: MiasmaService.createFlags(),
            monster: MiasmaService.createFlags()
        };
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
        const attackerSide = playerTurn ? "player" : "monster";
        const defenderSide = playerTurn ? "monster" : "player";

        if (this.rollDodge(attacker, defender, attackerSide, defenderSide)) {
            return {
                attacker: attackerSide,
                target: defenderSide,
                dodged: true,
                damage: 0,
                critical: false,
                lifeSteal: 0,
                absorbed: 0,
                miasmaProc: false,
                miasmaStacks: 0,
                miasmaTargetHasSpecials: false,
                miasmaAttackWeakened: false,
                miasmaDefendWeakened: false,
                mimicBonus: 0
            };
        }

        const result = this.calculateDamage(attacker, defender, attackerSide, defenderSide);
        if (playerTurn) {
            this.monster.status.vidaAtual -= result.damage;
            this.monster.status.vidaAtual = Math.max(0, this.monster.status.vidaAtual);
            if (result.lifeSteal > 0) {
                this.player.currentHP = Math.min(this.player.maxHP, this.player.currentHP + result.lifeSteal);
            }
        } else {
            this.player.currentHP -= result.damage;
            this.player.currentHP = Math.max(0, this.player.currentHP);
        }
        return {
            attacker: attackerSide,
            target: defenderSide,
            dodged: false,
            damage: result.damage,
            critical: result.critical,
            lifeSteal: result.lifeSteal,
            absorbed: result.absorbed,
            miasmaProc: result.miasmaProc,
            miasmaStacks: result.miasmaStacks,
            miasmaTargetHasSpecials: result.miasmaTargetHasSpecials,
            miasmaAttackWeakened: result.miasmaAttackWeakened,
            miasmaDefendWeakened: result.miasmaDefendWeakened,
            mimicBonus: result.mimicBonus
        };
    }

    // Esquiva: a diferença de agilidade entre quem defende e quem ataca
    // vira % de chance de esquiva pra quem defende, sempre travada em
    // DODGE_CAP — a chance nunca passa disso, não importa a diferença.
    // Acúmulos de Intoxicação do Miasma reduzem a Agilidade de quem
    // estiver intoxicado (ver MiasmaService.statMultiplier).
    rollDodge(attacker, defender, attackerSide = null, defenderSide = null) {

        const attackerAgility = (attacker.agility ?? attacker.agilidade ?? 0) * MiasmaService.statMultiplier(this.miasmaFlags[attackerSide]);
        const defenderAgility = (defender.agility ?? defender.agilidade ?? 0) * MiasmaService.statMultiplier(this.miasmaFlags[defenderSide]);

        const dodgeChance = Math.min(
            DODGE_CAP,
            Math.max(0, defenderAgility - attackerAgility)
        );

        return Math.random() * 100 < dodgeChance;

    }

    calculateDamage(attacker, defender, attackerSide = null, defenderSide = null) {

        // Acúmulos de Intoxicação do Miasma reduzem o Ataque de quem
        // estiver intoxicado (ver MiasmaService.statMultiplier).
        const ownAttack = (attacker.attack ?? attacker.dano) * MiasmaService.statMultiplier(this.miasmaFlags[attackerSide]);
        const armor = defender.armor ?? defender.armadura;

        // Imitação do Mímico: soma Imitação% do Ataque "cru" do alvo ao
        // PRÓPRIO Ataque ANTES da mitigação — vira parte do golpe normal
        // (passa por Crítico/Armadura/Absorção igual o resto do dano,
        // não é mais "dano à parte"). Ver MimicService.js.
        const mimicBonusAttack = MimicService.getBonusAttack(defender.attack ?? defender.dano, attacker.reflection ?? 0);
        const attack = ownAttack + mimicBonusAttack;

        // Miasma do Pútrido: se o ATACANTE tiver uma marca pendente
        // (foi intoxicado no golpe anterior que sofreu), Crítico/Roubo
        // de Vida/Penetração desse golpe saem pela metade.
        const attackMark = MiasmaService.consumeAttackMultiplier(this.miasmaFlags[attackerSide]);
        const attackDebuff = attackMark * MiasmaService.persistentSpecialMultiplier(this.miasmaFlags[attackerSide]);

        const penetration = (attacker.penetration ?? 0) * attackDebuff;
        const criticalChance = (attacker.criticalChance ?? 0) * attackDebuff;

        // Chance de ativação do Life Steal
        const lifeStealChance = (attacker.lifeSteal ?? 0) * attackDebuff;

        const isCritical = Math.random() * 100 < criticalChance;
        const criticalMultiplier = isCritical ? CRITICAL_MULTIPLIER : 1;

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

        // Absorção: CHANCE de o defensor absorver parte do golpe (ver
        // Absorption.js) — igual ao Roubo de Vida (que é "chance de
        // proc", não garantido), só que do lado de quem APANHA.
        // Miasma: se o DEFENSOR tiver uma marca pendente, a Absorção
        // dele sai pela metade nesse golpe que está recebendo agora.
        const defendMark = MiasmaService.consumeDefendMultiplier(this.miasmaFlags[defenderSide]);
        const defendDebuff = defendMark * MiasmaService.persistentSpecialMultiplier(this.miasmaFlags[defenderSide]);
        const absorptionChance = Math.min(ABSORPTION_CAP, (defender.absorption ?? 0) * defendDebuff);

        const absorbed = absorbedAmount(preAbsorption, Math.random() * 100 < absorptionChance, ABSORPTION_RATIO_PVE);

<<<<<<< HEAD
        const damage = preAbsorption - absorbed;
=======
        // Imitação do Mímico: dano VERDADEIRO extra, por cima do golpe já
        // mitigado/absorvido — ignora Armadura e Absorção de propósito
        // (ver MimicService.js). Usa a Vida MÁXIMA do alvo (defender) —
        // não a atual, senão o bônus encolheria conforme o alvo apanha.
        const mimicBonus = MimicService.getBonusDamage(defender.maxHP ?? defender.vidaMaxima, attacker.reflection ?? 0, MIMIC_HP_DIVISOR_PVE);
>>>>>>> 9b1704d9788e0a7a5f9dde9da29078214114e9fe

        // Quanto do dano final veio da Imitação (só pra mensagem/toast) —
        // proporcional, já que o bônus entrou junto no Ataque antes da
        // mitigação (não dá mais pra separar um "pedaço puro" depois).
        const mimicBonus = mimicBonusAttack > 0 ? Math.round(damage * mimicBonusAttack / attack) : 0;

        // ==========================
        // LIFE STEAL
        // ==========================

        let recoveredHP = 0;

        if (Math.random() * 100 < lifeStealChance) {

            recoveredHP =
                Math.floor(damage * 0.20) +
                Math.floor(this.player.maxHP * 0.02);

        }

        // ==========================
        // MIASMA (Pútrido)
        // ==========================
        // Sorteado com o miasmaChance ORIGINAL do atacante (não afetado
        // pelo próprio débuff que talvez ele esteja sofrendo — Miasma
        // não se enfraquece sozinho). Só existe pra classe Pútrido; em
        // qualquer outro atacante miasmaChance é 0 e isso nunca ativa.
        const miasmaProc = MiasmaService.procs(attacker.miasmaChance ?? 0, Math.random());

        const miasmaStacks = miasmaProc ? MiasmaService.applyDebuff(this.miasmaFlags[defenderSide]) : 0;

        return {
            miasmaProc,
            miasmaStacks,
            miasmaTargetHasSpecials: MiasmaService.hasAnySpecials(defender),
            // Só avisa "pela metade" quando havia algo pra cortar (monstro
            // não tem atributo especial nenhum).
            miasmaAttackWeakened: attackMark < 1 && MiasmaService.hasAttackSpecials(attacker),
            miasmaDefendWeakened: defendMark < 1 && MiasmaService.hasDefendSpecials(defender),
            damage,
            critical: isCritical,
            lifeSteal: recoveredHP,
            absorbed,
            mimicBonus
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
            message += MiasmaService.buildWeakenedMessage(result, "você", this.monster.name);
            if (result.critical) {
                message += `<span class="combat-critical">Golpe Crítico!</span><br>`;
            }
            message += `Você causou <strong>${result.damage}</strong> de dano.`;
            if (result.lifeSteal > 0) {
                message += `<br><span class="combat-life-steal">Life Steal!</span> Recuperou <strong>${result.lifeSteal}</strong> HP.`;
            }
            if (result.miasmaProc) {
                message += `<br>${MiasmaService.buildProcMessage(this.monster.name, result)}`;
            }
            if (result.mimicBonus > 0) {
                message += `<br>${MimicService.buildMessage(result.mimicBonus, { attackName: this.monster.status.nomeAtaque })}`;
            }
            return message;
        }

        let message = "";
        message += MiasmaService.buildWeakenedMessage(result, this.monster.name, "você");
        if (result.critical) {
            message += `<span class="combat-critical">Ataque Crítico!</span><br>`;
        }
        message += ` Você recebeu <strong>${this.monster.status.nomeAtaque}</strong>, <strong>${result.damage}</strong> de dano.`;
        if (result.absorbed > 0) {
            message += `<br><span class="combat-absorption">Absorção!</span> Absorveu <strong>${result.absorbed}</strong> do golpe.`;
        }
        return message;
    }

    // Mordida do pet equipado — ataque GARANTIDO (sem esquiva/crítico)
    // e de dano fixo (ou uma fração do golpe do jogador, no caso do
    // Mímico), que acontece junto do turno do jogador, além do golpe
    // normal dele. Retorna null sem pet equipado ou sem dano/cura (fome
    // zerada). Chamado por CombatView.playTurn() logo depois do
    // attack() do jogador — não mexe em nextTurn()/checkCombatState(),
    // só desconta a vida do monstro antes deles rodarem.
    //
    // playerHitDamage: dano de verdade que o golpe PRINCIPAL do jogador
    // acabou de causar (já com armadura/crítico/absorção aplicados) —
    // é isso que o Mímico copia uma fração de, nunca o ataque bruto.
    petBite(playerHitDamage = 0) {

        const pet = this.player.equipment.pet;

        if (!pet) return null;

        const scaled = PetService.getScaledStats(pet);
        const mimicDamage = scaled.mimicRatio > 0 ? Math.floor(playerHitDamage * scaled.mimicRatio) : 0;
        const damage = scaled.biteDamage > 0 ? scaled.biteDamage : mimicDamage;
        const heal = scaled.healAmount;

        if (damage <= 0 && heal <= 0) return null;

        if (damage > 0) {
            this.monster.status.vidaAtual = Math.max(0, this.monster.status.vidaAtual - damage);
        }

        // Sem aliados numa dungeon — a cura da habilidade (ex: Duende)
        // sempre volta pro próprio jogador aqui.
        if (heal > 0) {
            this.player.currentHP = Math.min(this.player.maxHP, this.player.currentHP + heal);
        }

        return { petName: pet.name, damage, heal };

    }

    createPetBiteMessage(result) {
        let message = `<span class="combat-pet-bite">${result.petName} agiu!</span>`;
        if (result.damage > 0) {
            message += ` Causou <strong>${result.damage}</strong> de dano.`;
        }
        if (result.heal > 0) {
            message += ` Curou <strong>${result.heal}</strong> HP.`;
        }
        return message;
    }

    // Liga a queimadura (uma vez por combate) — chamado no golpe do
    // jogador que acerta, se o pet equipado tiver a habilidade.
    startBurn() {

        if (this.burn) return;

        const pet = this.player.equipment.pet;

        if (!pet) return;

        const scaled = PetService.getScaledStats(pet);

        if (scaled.burnDamage <= 0) return;

        this.burn = { petName: pet.name, burnDamage: scaled.burnDamage, first: true };

    }

    // Um tick da queimadura, ao final do turno do JOGADOR (nunca do
    // monstro). Não cobra depois que o combate já acabou.
    burnTick() {

        if (!this.burn) return null;

        if (this.checkCombatState().finished) return null;

        const element = this.monster.element ?? null;
        const damage = BoitataBurn.getTickDamage(this.burn.burnDamage, element);
        const applied = Math.min(this.monster.status.vidaAtual, damage);

        this.monster.status.vidaAtual = Math.max(0, this.monster.status.vidaAtual - damage);

        const result = { petName: this.burn.petName, damage: applied, element, first: this.burn.first };

        this.burn.first = false;

        return result;

    }

    createBurnMessage(result) {
        return BoitataBurn.buildMessage({ ...result, targetName: this.monster.name });
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