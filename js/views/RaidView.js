import RaidLobbyService from "../services/RaidLobbyService.js";
import RaidCombatService from "../services/RaidCombatService.js";
import monstersRaid from "../data/monstersRaid.js";
import LootSystem from "../combat/LootSystem.js";
import LevelUpModal from "../ui/components/modals/LevelUpModal.js";
import RewardModal from "../ui/components/modals/RewardModal.js";
import CombatToast from "../combat/CombatToast.js";

export default class RaidView {

    constructor(game) {
        this.game = game;
        this.state = "idle"; // idle | searching | found | battle | floor-wait | result
        this.opponentWaiting = false;
        this.matchData = null;
        this.matchId = null;
        this.combatResult = null;
        this.currentFloor = 1;
        this.leftSelf = false; // eu escolhi "Sair do Cooperativo" no meio dos andares
        this.abandoned = false; // outro jogador saiu/caiu e o squad não pode prosseguir
        this.floorWaitProgress = { ready: 0, total: 0 };
        this.bossData = null; // entrada crua de monstersRaid.js
        this.bossCombatant = null; // snapshot da simulação
        this.bossHP = null;
        this.bossMaxHP = null;
        this.floorSquad = []; // squad ativo do andar atual (sem quem já saiu), com currentHP real
        this.squadHP = {}; // { [combatantId]: currentHP } pros 4
        this.rewardModal = new RewardModal(game);
        this.levelUpModal = new LevelUpModal(game);
    }

    get player() {
        return this.game.player;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Mesmo motivo do PvpView: depois de 1 minuto a animação acelera pra
    // 2x sozinha, sem toggle nenhum pro jogador — o boss tem HP colossal,
    // uma luta longa não pode arrastar pra sempre na velocidade normal.
    getBattleSpeedMultiplier(battleStartTime) {
        return (Date.now() - battleStartTime) > 60000 ? 2 : 1;
    }

    render() {

        if (this.state === "battle") return this.renderBattleArena();

        return `
            <section class="raid-window">
                <header class="dungeon-header">
                    <h2>Modo Cooperativo</h2>
                    <button class="dungeon-close raid-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </header>
                <div class="raid-body">
                    ${this.renderState()}
                </div>
            </section>
        `;
    }

    renderState() {
        switch (this.state) {
            case "searching": return this.renderSearching();
            case "found": return this.renderFound();
            case "floor-wait": return this.renderFloorWait();
            case "result": return this.renderResult();
            default: return this.renderIdle();
        }
    }

    renderFloorWait() {
        const { ready, total } = this.floorWaitProgress;
        return `
            <div class="raid-searching">
                <div class="raid-spinner"></div>
                <p class="raid-status-text">Aguardando os outros guerreiros... (${ready}/${total} prontos)</p>
            </div>
        `;
    }

    renderIdle() {
        return `
            <div class="raid-idle">
                <i class="fa-solid fa-users raid-icon"></i>
                <p class="raid-description">Participar da Raid</p>
                <button class="raid-join-button">Entrar na Fila</button>
            </div>
        `;
    }

    renderSearching() {
        return `
            <div class="raid-searching">
                <div class="raid-spinner"></div>
                <p class="raid-status-text">
                    ${this.opponentWaiting ? "Jogadores encontrados, preparando a partida..." : "Procurando outros jogadores..."}
                </p>
                <button class="raid-cancel-button">Cancelar</button>
            </div>
        `;
    }

    renderFound() {
        const squad = Object.values(this.matchData.squad);
        return `
            <div class="raid-found">
                <h3 class="raid-found-title">Squad Formado! — Andar ${this.currentFloor}</h3>
                <div class="raid-versus">
                    <div class="raid-team-column">
                        ${squad.map(c => `<span class="raid-fighter-name">${c.name}</span>`).join("")}
                    </div>
                    <span class="pvp-vs">VS</span>
                    <span class="raid-fighter-name">${this.bossData.name}</span>
                </div>
            </div>
        `;
    }

    renderBattleArena() {

        const squad = this.floorSquad;
        const bossPct = Math.max(0, (this.bossHP / this.bossMaxHP) * 100);

        return `
            <section class="raid-battle-window">
                <div class="raid-battle-arena">
                    <div class="raid-boss-header">
                        <div class="raid-boss-info">
                            <span class="raid-boss-name">Andar ${this.currentFloor} — ${this.bossData.name}</span>
                            <div class="raid-boss-hp-colossal">
                                <div class="raid-boss-hp-fill" id="raid-boss-hp-fill" style="width:${bossPct}%;"></div>
                                <span class="raid-boss-hp-text" id="raid-boss-hp-text">${Math.max(0, this.bossHP)}/${this.bossMaxHP}</span>
                            </div>
                        </div>
                    </div>
                    <div class="raid-boss-portrait">
                        <img src="${this.bossCombatant.image}" alt="${this.bossData.name}">
                    </div>
                    <div class="raid-sprite-row">
                        ${squad.map(c => `
                            <div class="raid-sprite-slot" data-combatant-id="${c.id}">
                                <div class="raid-sprite-heading">
                                    <span class="raid-sprite-name">${c.name}</span>
                                    <span class="raid-sprite-level">Nível ${c.level}</span>
                                </div>
                                <img src="${c.image ?? ""}" alt="${c.name}">
                                <div class="raid-sprite-hp">
                                    <div class="raid-sprite-hp-fill" id="raid-hp-${c.id}" style="width:${Math.max(0, (c.currentHP / c.maxHP) * 100)}%;"></div>
                                    <span class="raid-sprite-hp-text" id="raid-hp-text-${c.id}">${Math.max(0, c.currentHP)} / ${c.maxHP}</span>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                    <div id="combat-toast-container"></div>
                </div>
            </section>
        `;

    }

    renderResult() {

        const squad = Object.values(this.matchData.squad);
        const iWon = this.combatResult.winner === "squad";
        const nameOf = (id) => id === "boss" ? this.bossData.name : (squad.find(c => c.id === id)?.name ?? "???");

        return `
            <div class="raid-result">
                <h3 class="pvp-result-title ${iWon ? "win" : "lose"}">
                    ${iWon ? "Vitória!" : "Derrota"}
                </h3>
                <div class="raid-versus">
                    <div class="raid-team-column ${iWon ? "winner" : ""}">
                        ${squad.map(c => `<span class="raid-fighter-name">${c.name}</span>`).join("")}
                    </div>
                    <span class="pvp-vs">VS</span>
                    <span class="raid-fighter-name ${!iWon ? "winner" : ""}">${this.bossData.name}</span>
                </div>
                <div class="pvp-log">
                    ${this.combatResult.log.slice(-12).map(entry => this.renderLogLine(entry, nameOf)).join("")}
                </div>
                <button class="raid-back-button">Voltar</button>
            </div>
        `;

    }

    renderLogLine(entry, nameOf) {

        const attackerName = nameOf(entry.attackerId);
        const targetName = nameOf(entry.targetId);
        const attackTag = entry.attackName ? ` (${entry.attackName})` : "";

        if (entry.dodged) {
            return `<div class="pvp-log-line pvp-log-dodge">${targetName} esquivou do ataque de ${attackerName}${attackTag}!</div>`;
        }

        const crit = entry.critical ? ` <span class="pvp-log-critical">(Crítico!)</span>` : "";
        const steal = entry.lifeSteal > 0 ? ` <span class="pvp-log-heal">(+${entry.lifeSteal} HP roubado)</span>` : "";
        const absorbed = entry.healedFromAbsorption > 0
            ? ` <span class="pvp-log-absorption">(${targetName} absorveu ${entry.absorbed} e curou ${entry.healedFromAbsorption} HP)</span>`
            : "";

        return `<div class="pvp-log-line">${attackerName}${attackTag} causou ${entry.damage} de dano em ${targetName}${crit}${steal}${absorbed}</div>`;

    }

    async joinQueue() {

        this.state = "searching";
        this.opponentWaiting = false;
        this.refresh();

        const combatant = RaidCombatService.snapshotCombatant(this.player);

        await RaidLobbyService.joinQueue(
            combatant,
            (matchData, matchId) => this.onMatchFound(matchData, matchId),
            (waiting) => {
                this.opponentWaiting = waiting;
                if (this.state === "searching") this.refresh();
            }
        );

    }

    async cancelQueue() {
        await RaidLobbyService.leaveQueue();
        this.state = "idle";
        this.refresh();
    }

    async onMatchFound(matchData, matchId) {

        this.matchData = matchData;
        this.matchId = matchId;
        this.leftSelf = false;
        this.abandoned = false;

        RaidLobbyService.armLeaveOnDisconnect(matchId, RaidLobbyService.playerId);

        this.setupFloor(matchData.floor ?? 1);

        this.state = "found";
        this.refresh();

        await this.sleep(1500);

        this.game.hudScreen.inRaidCombat = true;
        this.game.hudScreen.setBackground("assets/img/backgrounds/arena_pvp.png");

        await this.runFloors();

        this.game.hudScreen.inRaidCombat = false;
        this.state = (this.leftSelf || this.abandoned) ? "idle" : "result";
        this.refresh();

        RaidLobbyService.cleanupMatch(matchId);

    }

    setupFloor(floor) {
        this.currentFloor = floor;
        this.bossData = monstersRaid.find(m => m.floor === floor) ?? monstersRaid[floor - 1] ?? monstersRaid[0];
        this.bossCombatant = RaidCombatService.snapshotBoss(this.bossData);
        this.bossMaxHP = this.bossCombatant.maxHP;
        this.bossHP = this.bossCombatant.maxHP;
    }

    // Monta o squad do andar atual a partir do roster original da
    // partida, excluindo quem já saiu do cooperativo e usando o HP com
    // que cada um confirmou "Continuar" no andar anterior (ou o HP
    // cheio do snapshot, no andar 1).
    buildSquadForFloor() {

        const left = this.matchData.left ?? {};
        const hp = this.matchData.hp ?? {};

        return Object.values(this.matchData.squad)
            .filter(c => !left[c.id])
            .map(c => ({ ...c, currentHP: hp[c.id] ?? c.currentHP ?? c.maxHP }));

    }

    // Loop principal: luta o andar atual, entrega a recompensa e, se
    // não for o último andar, espera todo mundo confirmar "Continuar"
    // antes de avançar pro próximo drake. Termina em derrota, em vitória
    // no último andar, ou se eu mesmo escolher sair no meio do caminho.
    async runFloors() {

        while (true) {

            const squad = this.buildSquadForFloor();

            const result = await this.fightFloor(squad);

            if (result.winner !== "squad") {
                return;
            }

            this.player.progress.stats.raidWins = (this.player.progress.stats.raidWins ?? 0) + 1;

            const reward = LootSystem.generate(this.bossData, this.player);
            const levelUps = this.player.collectReward(reward);
            this.game.hudScreen.refreshCurrentView();

            const isLastFloor = this.currentFloor >= monstersRaid.length;

            if (isLastFloor) {

                await this.rewardModal.show(reward);

                for (const levelUp of levelUps) {
                    await this.levelUpModal.show(levelUp.level, levelUp.bonus);
                }

                return;

            }

            for (const levelUp of levelUps) {
                await this.levelUpModal.show(levelUp.level, levelUp.bonus);
            }

            const continueRaid = await this.rewardModal.show(reward, {
                showActions: true,
                exitLabel: "Sair do Cooperativo",
                onOpenInventory: async () => {
                    this.game.hudScreen.enterPreparationMode();
                    await new Promise(resolve => {
                        this.game.hudScreen.onPreparationFinished = resolve;
                    });
                    this.game.hudScreen.exitPreparationMode();
                    this.game.hudScreen.currentView = "coop";
                    this.game.hudScreen.refreshCurrentView();
                }
            });

            if (!continueRaid) {

                await RaidLobbyService.leaveMatchFloor(
                    this.matchId,
                    RaidLobbyService.playerId,
                    Object.keys(this.matchData.squad)
                );

                this.leftSelf = true;
                return;

            }

            const outcome = await this.waitForNextFloor();

            if (outcome.aborted) {
                await CombatToast.show("Um jogador abandonou o cooperativo — não é possível continuar.", "system", 3);
                this.abandoned = true;
                return;
            }

            this.matchData = { ...this.matchData, ...outcome.data };
            this.setupFloor(this.matchData.floor);

        }

    }

    // Grava minha confirmação (com meu HP atual) e espera o squad
    // inteiro confirmar o andar atual antes de seguir — ver
    // RaidLobbyService.waitForFloorAdvance para o mecanismo de sincronia.
    async waitForNextFloor() {

        const squadIds = Object.keys(this.matchData.squad);
        const expectedFloor = this.currentFloor;

        await RaidLobbyService.markFloorReady(this.matchId, RaidLobbyService.playerId, this.game.player.currentHP);

        this.floorWaitProgress = { ready: 0, total: squadIds.length };
        this.state = "floor-wait";
        this.refresh();

        return await RaidLobbyService.waitForFloorAdvance(
            this.matchId,
            squadIds,
            expectedFloor,
            (ready, total) => {
                this.floorWaitProgress = { ready, total };
                if (this.state === "floor-wait") this.refresh();
            }
        );

    }

    async fightFloor(squad) {

        this.floorSquad = squad;

        const floorSeed = RaidCombatService.deriveFloorSeed(this.matchData.seed, this.currentFloor);

        const result = RaidCombatService.simulateRaid(squad, this.bossCombatant, floorSeed);
        this.combatResult = result;

        this.squadHP = {};
        squad.forEach(c => { this.squadHP[c.id] = c.currentHP; });

        this.state = "battle";
        this.refresh();

        await CombatToast.show(`Andar ${this.currentFloor}: ${this.bossData.name} apareceu!`, "system", 2);

        await this.playBattleLog(result.log, squad);

        const iWon = result.winner === "squad";
        await CombatToast.show(iWon ? `${this.bossData.name} derrotado!` : "O squad foi derrotado!", "system", 2);

        await this.sleep(900);

        return result;

    }

    // Anima o resultado já calculado (determinístico, ver RaidCombatService)
    // turno por turno: barra colossal do boss e a barrinha do jogador
    // certo (embaixo do card dele) reagem a cada golpe. Diferente do
    // playBattleLog do PvpView, aqui a vida real do personagem NÃO volta
    // ao valor de antes no final — ela é uma raid com andares, o dano
    // (e a cura escolhida no inventário entre andares) precisa persistir
    // de verdade, igual às dungeons de PVE.
    async playBattleLog(log, squad) {

        const battleStartTime = Date.now();

        for (const entry of log) {

            if (!entry.dodged) {

                if (entry.attackerSide === "squad") {

                    this.bossHP = Math.max(0, this.bossHP - entry.damage);

                    if (entry.healedFromAbsorption > 0) {
                        this.bossHP = Math.min(this.bossMaxHP, this.bossHP + entry.healedFromAbsorption);
                    }

                } else {

                    this.squadHP[entry.targetId] = Math.max(0, (this.squadHP[entry.targetId] ?? 0) - entry.damage);

                    if (entry.healedFromAbsorption > 0) {
                        const targetMax = squad.find(c => c.id === entry.targetId)?.maxHP ?? 0;
                        this.squadHP[entry.targetId] = Math.min(targetMax, (this.squadHP[entry.targetId] ?? 0) + entry.healedFromAbsorption);
                    }

                    if (entry.targetId === RaidLobbyService.playerId) {
                        this.game.player.currentHP = this.squadHP[entry.targetId];
                    }

                }

                if (entry.lifeSteal > 0) {

                    if (entry.attackerSide === "squad") {

                        const attackerMax = squad.find(c => c.id === entry.attackerId)?.maxHP ?? 0;
                        this.squadHP[entry.attackerId] = Math.min(attackerMax, (this.squadHP[entry.attackerId] ?? 0) + entry.lifeSteal);

                        if (entry.attackerId === RaidLobbyService.playerId) {
                            this.game.player.currentHP = this.squadHP[entry.attackerId];
                        }

                    } else {

                        this.bossHP = Math.min(this.bossMaxHP, this.bossHP + entry.lifeSteal);

                    }

                }

                this.updateBossHPBar();

                if (entry.attackerSide === "squad") {
                    this.updateSquadHPBar(squad, entry.attackerId);
                } else {
                    this.updateSquadHPBar(squad, entry.targetId);
                }

            }

            this.game.hudScreen.playerHUD.updateHP?.();

            const speed = this.getBattleSpeedMultiplier(battleStartTime);

            await CombatToast.show(this.buildAttackMessage(entry, squad), this.buildToastType(entry), 2, speed);

            await this.sleep(450 / speed);

        }

    }

    updateBossHPBar() {

        const fill = document.getElementById("raid-boss-hp-fill");
        const text = document.getElementById("raid-boss-hp-text");
        const pct = Math.max(0, (this.bossHP / this.bossMaxHP) * 100);

        if (fill) fill.style.width = `${pct}%`;
        if (text) text.textContent = `${Math.max(0, this.bossHP)}/${this.bossMaxHP}`;

    }

    updateSquadHPBar(squad, combatantId) {

        const maxHp = squad.find(c => c.id === combatantId)?.maxHP ?? 1;
        const currentHp = Math.max(0, this.squadHP[combatantId] ?? 0);
        const fill = document.getElementById(`raid-hp-${combatantId}`);
        const text = document.getElementById(`raid-hp-text-${combatantId}`);

        if (fill) fill.style.width = `${Math.max(0, (currentHp / maxHp) * 100)}%`;
        if (text) text.textContent = `${currentHp} / ${maxHp}`;

    }

    buildAttackMessage(entry, squad) {

        const isBossAttacker = entry.attackerSide === "boss";
        const nameOf = (id) => id === RaidLobbyService.playerId
            ? "Você"
            : (squad.find(c => c.id === id)?.name ?? this.bossData.name);

        const attackerName = isBossAttacker ? this.bossData.name : nameOf(entry.attackerId);
        const targetName = isBossAttacker ? nameOf(entry.targetId) : this.bossData.name;

        if (entry.dodged) {
            return targetName === "Você"
                ? `<span class="combat-dodge">Você esquivou do ataque de ${attackerName}${entry.attackName ? ` (${entry.attackName})` : ""}!</span>`
                : `<span class="combat-dodge">${targetName} esquivou do ataque de ${attackerName}!</span>`;
        }

        let message = "";

        if (isBossAttacker && entry.attackName) {
            message += `<strong>${attackerName}</strong> usou <span class="combat-critical">${entry.attackName}</span><br>`;
        }

        if (entry.critical) {
            message += `<span class="combat-critical">Golpe Crítico!</span><br>`;
        }

        if (targetName === "Você") {
            message += `Você recebeu um golpe de <strong>${attackerName}</strong>, <strong>${entry.damage}</strong> de dano.`;
        } else if (attackerName === "Você") {
            message += `Você causou <strong>${entry.damage}</strong> de dano em <strong>${targetName}</strong>.`;
        } else {
            message += `${attackerName} causou <strong>${entry.damage}</strong> de dano em ${targetName}.`;
        }

        if (entry.lifeSteal > 0) {
            message += `<br><span class="combat-life-steal">Life Steal!</span> ${attackerName} recuperou <strong>${entry.lifeSteal}</strong> HP.`;
        }

        if (entry.healedFromAbsorption > 0) {
            message += `<br><span class="combat-absorption">Absorção!</span> ${targetName} curou <strong>${entry.healedFromAbsorption}</strong> HP.`;
        }

        return message;

    }

    buildToastType(entry) {

        const isMeAttacking = entry.attackerId === RaidLobbyService.playerId;
        const isMeTarget = entry.targetId === RaidLobbyService.playerId;

        let type = entry.attackerSide === "squad" ? "player" : "enemy";

        if (entry.dodged) {
            type += " dodge";
        } else if (isMeAttacking) {
            if (entry.lifeSteal > 0) type = "lifeSteal player";
            else if (entry.critical) type = "critico player";
        } else if (isMeTarget && entry.healedFromAbsorption > 0) {
            type = "absorption enemy";
        }

        return type;

    }

    refresh() {
        this.game.hudScreen.refreshCurrentView();
    }

    registerEvents(container) {

        if (!RaidView.closeDelegationBound) {

            document.addEventListener("click", (event) => {

                if (!event.target.closest(".raid-close")) return;

                this.game.hudScreen.changeView("");

            });

            RaidView.closeDelegationBound = true;

        }

        container.querySelector(".raid-join-button")?.addEventListener("click", () => {
            this.joinQueue();
        });

        container.querySelector(".raid-cancel-button")?.addEventListener("click", () => {
            this.cancelQueue();
        });

        container.querySelector(".raid-back-button")?.addEventListener("click", () => {
            this.game.hudScreen.changeView("");
        });

    }

}
