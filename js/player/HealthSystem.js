export default class HealthSystem {
    constructor(player, onHealthUpdate = null) {
        this.player = player;
        this.onHealthUpdate = onHealthUpdate;
        this.regenerationInterval = null;
    }

    heal(amount) {
        if (amount <= 0) return;
        this.player.currentHP = Math.min(this.player.currentHP + amount, this.player.maxHP);
        this.update();
    }

    damage(amount) {
        if (amount <= 0) return;
        this.player.currentHP = Math.max(this.player.currentHP - amount, 0);
        this.update();
        if (this.player.currentHP === 0) {
            this.player.onDeath?.();
        }
    }

    startRegeneration() {
        this.stopRegeneration();
        this.regenerationInterval = setInterval(() => {
            if (this.player.currentHP >= this.player.maxHP) return;
            const healAmount = Math.max(1, Math.floor(this.player.maxHP * 0.01));
            this.heal(healAmount);
        }, 120000);
    }

    stopRegeneration() {
        if (!this.regenerationInterval) return;
        clearInterval(this.regenerationInterval);
        this.regenerationInterval = null;
    }

    update() {
        if (this.onHealthUpdate) {
            this.onHealthUpdate();
        }
    }
}