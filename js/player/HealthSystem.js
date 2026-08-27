import Toast from "../ui/components/Toast.js";

export default class HealthSystem {
    constructor(player, onHealthUpdate = null) {
        this.player = player;
        this.onHealthUpdate = onHealthUpdate;

        this.regenerationInterval = null;

        // Regeneração padrão
        this.regenerationPercent = 1;
        this.regenerationTime = 120000;

        // Burst
        this.burstMode = false;
    }

    /* =====================================================
       VIDA
    ===================================================== */

    heal(amount) {
        if (amount <= 0) return;

        this.player.currentHP = Math.min(
            this.player.currentHP + amount,
            this.player.maxHP
        );

        this.update();
    }

    damage(amount) {
        if (amount <= 0) return;

        this.player.currentHP = Math.max(
            this.player.currentHP - amount,
            0
        );

        this.update();

        if (this.player.currentHP === 0) {
            this.player.onDeath?.();
        }
    }

    /* =====================================================
       REGENERAÇÃO
    ===================================================== */

    startRegeneration() {
        this.stopRegeneration();

        this.regenerationInterval = setInterval(() => {

            // Vida cheia
            if (this.player.currentHP >= this.player.maxHP) {

                if (this.burstMode) {
                    this.deactivateBurst();
                    Toast.show("Sua recuperação foi concluída.");
                }

                return;
            }

            const healAmount = Math.max(
                1,
                Math.floor(
                    this.player.maxHP * (this.regenerationPercent / 100)
                )
            );

            this.heal(healAmount);

            if (this.burstMode) {
                this.player.addXP(5);
                this.update();
            }

        }, this.regenerationTime);
    }

    stopRegeneration() {
        if (!this.regenerationInterval) return;

        clearInterval(this.regenerationInterval);
        this.regenerationInterval = null;
    }

    /* =====================================================
       BURST
    ===================================================== */

    activateBurst() {
        this.burstMode = true;
        this.regenerationPercent = 5;

        this.startRegeneration();
        this.update();
    }

    deactivateBurst() {
        if (!this.burstMode) return;

        this.burstMode = false;
        this.regenerationPercent = 1;

        this.startRegeneration();
        this.update();
    }

    /* =====================================================
       INFORMAÇÕES
    ===================================================== */

    getMissingHP() {
        return Math.max(
            0,
            this.player.maxHP - this.player.currentHP
        );
    }

    getHpPercent() {
        return (this.player.currentHP / this.player.maxHP) * 100;
    }

    getBurstCost() {
        if (this.getMissingHP() <= 0) return 0;
        return Math.max(
            1,
            this.getMissingHP() - this.player.level
        );
    }

    getInstantHealCost() {
        if (this.getMissingHP() <= 0) return 0;
        return Math.max(
            1,
            (this.getMissingHP() * 2) + this.player.level
        );
    }

    /* =====================================================
       ENFERMARIA
    ===================================================== */

    handleHospitalAction(action) {

        switch (action) {

            case "burst":
                return this.buyBurst();

            case "instant":
                return this.buyInstantHeal();

            default:
                return false;
        }
    }

    buyBurst() {

        // Se a vida já está cheia, encerra o Burst automaticamente
        if (this.burstMode && this.player.currentHP >= this.player.maxHP) {
            this.deactivateBurst();
        }

        if (this.burstMode) {
            Toast.show("O Burst de Vida já está ativo.");
            return false;
        }

        if (this.player.currentHP >= this.player.maxHP) {
            Toast.show("Sua vida já está completa.");
            return false;
        }

        const cost = this.getBurstCost();

        if (this.player.gold < cost) {
            Toast.show("Ouro insuficiente.");
            return false;
        }

        this.player.gold -= cost;

        this.activateBurst();

        this.player.progress.stats.hospitalHeals = (this.player.progress.stats.hospitalHeals ?? 0) + 1;

        Toast.show("Burst de Vida ativado.");

        return true;
    }

    buyInstantHeal() {

        if (this.player.currentHP >= this.player.maxHP) {
            Toast.show("Sua vida já está completa.");
            return false;
        }

        const cost = this.getInstantHealCost();

        if (this.player.gold < cost) {
            Toast.show("Ouro insuficiente.");
            return false;
        }

        this.player.gold -= cost;

        this.heal(this.getMissingHP());

        this.player.progress.stats.hospitalHeals = (this.player.progress.stats.hospitalHeals ?? 0) + 1;

        Toast.show("Vida restaurada.");

        return true;
    }

    /* =====================================================
       INTERFACE DA ENFERMARIA
    ===================================================== */

    updateHospitalUI() {

        const currentHpElement = document.getElementById("hospital-current-hp");
        const regenElement = document.getElementById("hospital-regeneration");
        const missingHpElement = document.getElementById("hospital-missing-hp");
        const goldElement = document.getElementById("hospital-gold");

        if (currentHpElement) {
            currentHpElement.textContent =
                `${this.player.currentHP} / ${this.player.maxHP}`;
        }

        if (regenElement) {
            regenElement.textContent =
                `${this.regenerationPercent}% / ${this.regenerationTime / 60000} min`;
        }

        if (missingHpElement) {
            missingHpElement.textContent = this.getMissingHP();
        }

        if (goldElement) {
            goldElement.textContent = this.player.gold;
        }
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    update() {
        this.onHealthUpdate?.();
        this.updateHospitalUI();
    }
}