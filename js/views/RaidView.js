import RaidLobbyService, { SQUAD_SIZE } from "../services/RaidLobbyService.js";
import RaidInviteService, { RAID_MIN_LEVEL } from "../services/RaidInviteService.js";
import AuthService from "../services/AuthService.js";
import RaidInviteModal, { escapeHtml } from "../ui/components/modals/RaidInviteModal.js";
import Toast from "../ui/components/Toast.js";
import RaidCombatService from "../services/RaidCombatService.js";
import monstersRaid from "../data/monstersRaid.js";
import LootSystem from "../combat/LootSystem.js";
import LevelUpModal from "../ui/components/modals/LevelUpModal.js";
import RewardModal from "../ui/components/modals/RewardModal.js";
import CombatToast from "../combat/CombatToast.js";
import HealFlash from "../combat/HealFlash.js";
import HitFlash from "../combat/HitFlash.js";
import BoitataBurn from "../services/BoitataBurn.js";
import MiasmaService, { PVE_STACK_PERCENTS as MIASMA_PVE_PERCENTS } from "../services/MiasmaService.js";
import MimicService from "../services/MimicService.js";

export default class RaidView {

    // Ver shouldSkipMessages().
    static SKIP_MESSAGES_AFTER_MS = 4 * 60 * 1000;

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
        this.floorWaitData = null; // partida ao vivo enquanto espero as confirmações
        this.queue = []; // quem está na fila (inclui eu), vindo do lobby
        this.bossData = null; // entrada crua de monstersRaid.js
        this.bossCombatant = null; // snapshot da simulação
        this.bossHP = null;
        this.bossMaxHP = null;
        this.floorSquad = []; // squad ativo do andar atual (sem quem já saiu), com currentHP real
        this.squadHP = {}; // { [combatantId]: currentHP } pros 4
        this.rewardModal = new RewardModal(game);
        this.levelUpModal = new LevelUpModal(game);
        this.inviteModal = new RaidInviteModal(); // host digitando o nome
        this.incomingModal = new RaidInviteModal(); // convite que chegou pra mim
        this.answeringInvite = false;
    }

    get player() {
        return this.game.player;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Mesmo motivo do PvpView, só que progressivo: o boss tem HP colossal e
    // cada golpe vira uma caixa de ~3,8s — 2x depois de 1 minuto ainda
    // arrastava demais, então depois de 2 minutos vai pra 4x. Sem toggle
    // nenhum pro jogador. Só muda a ANIMAÇÃO: a luta já foi simulada
    // inteira antes (RaidCombatService), então não mexe no resultado nem
    // na sincronia entre os 4 clientes.
    getBattleSpeedMultiplier(battleStartTime) {
        const elapsed = Date.now() - battleStartTime;
        if (elapsed > 120000) return 4;
        if (elapsed > 60000) return 2;
        return 1;
    }

    // A partir de ~4min de luta, as mensagens já estão tão compactadas
    // (4x) que só piscam na tela sem dar tempo de ler — nesse ponto não
    // faz mais sentido mostrá-las: só atualiza as barras de vida e segue,
    // bem mais rápido que esperar a caixa abrir/fechar pra cada golpe.
    shouldSkipMessages(battleStartTime) {
        return (Date.now() - battleStartTime) > RaidView.SKIP_MESSAGES_AFTER_MS;
    }

    render() {

        if (this.state === "battle") return this.renderBattleArena();

        // Com a partida em andamento o X some: fechar a janela por ele
        // largava a run rodando por baixo — entre os andares, quem quer
        // sair usa o botão "Sair do Cooperativo".
        const inMatch = this.state === "found" || this.state === "floor-wait";

        return `
            <section class="raid-window">
                <header class="dungeon-header">
                    <h2>Modo Cooperativo</h2>
                    ${inMatch ? "" : `
                        <button class="close-btn dungeon-close raid-close">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    `}
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

    // Vagas livres até completar o squad — só o host vê o botão Convidar.
    renderEmptySlots(count, canInvite) {
        return Array.from({ length: Math.max(0, count) }, () => `
            <div class="raid-roster-item is-empty">
                <i class="fa-solid fa-user-plus"></i>
                <span>Vaga livre</span>
                ${canInvite ? `<button class="raid-invite-button">Convidar</button>` : ""}
            </div>
        `).join("");
    }

    renderFloorWait() {

        const data = this.floorWaitData ?? this.matchData;
        const members = RaidLobbyService.getActiveMembers(data);
        const ready = data.floorReady ?? {};
        const readyCount = members.filter(member => ready[member.id]).length;
        const hostId = RaidLobbyService.getHostId(data);
        const isHost = hostId === RaidLobbyService.playerId;
        const openSlots = SQUAD_SIZE - members.length;
        // Vaga aberta trava o avanço até o host preencher ou dispensar.
        const waitingHost = openSlots > 0 && data.proceedShort !== this.currentFloor;

        let status = `Aguardando os outros guerreiros... (${readyCount}/${members.length} prontos)`;

        if (waitingHost) {
            status = isHost
                ? "Há vaga aberta — convide alguém ou siga com o squad atual."
                : "Há vaga aberta — aguardando o host convidar alguém ou seguir assim.";
        }

        return `
            <div class="raid-searching">
                <div class="raid-spinner"></div>
                <p class="raid-status-text">${status}</p>
                <div class="raid-roster">
                    <h4 class="raid-roster-title">Confirmações — Andar ${this.currentFloor}</h4>
                    ${members.map(member => {
                        const confirmed = !!ready[member.id];
                        return `
                            <div class="raid-roster-item ${confirmed ? "is-confirmed" : "is-pending"}">
                                <i class="fa-solid ${confirmed ? "fa-circle-check" : "fa-hourglass-half"}"></i>
                                <span>${escapeHtml(member.name)} ${confirmed ? "já confirmou" : "não confirmou"}</span>
                                ${member.id === hostId ? `<small class="raid-host-tag"><i class="fa-solid fa-crown"></i> Host</small>` : ""}
                            </div>
                        `;
                    }).join("")}
                    ${this.renderEmptySlots(openSlots, isHost && waitingHost)}
                </div>
                ${isHost && waitingHost ? `
                    <button class="raid-join-button raid-proceed-button">
                        Continuar com ${members.length} ${members.length === 1 ? "jogador" : "jogadores"}
                    </button>
                ` : ""}
                <button class="raid-cancel-button raid-leave-button">Sair do Cooperativo</button>
            </div>
        `;

    }

    // O primeiro da fila é o host: só ele vê o X (tirar da fila) ao lado
    // dos outros e o botão Convidar nas vagas livres.
    renderQueue() {

        if (!this.queue.length) return "";

        const iAmHost = this.queue.some(entry => entry.isSelf && entry.isHost);

        return `
            <div class="raid-roster raid-queue">
                <h4 class="raid-roster-title">Na fila (${this.queue.length})</h4>
                ${this.queue.map(entry => `
                    <div class="raid-roster-item is-waiting">
                        <i class="fa-solid ${entry.isHost ? "fa-crown" : "fa-user-clock"}"></i>
                        <span>${escapeHtml(entry.name)}${entry.isSelf ? " (você)" : ""}</span>
                        <small>Nv. ${entry.level ?? "?"}</small>
                        ${iAmHost && !entry.isSelf ? `
                            <button class="raid-kick-button" data-id="${entry.id}" title="Remover da fila">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        ` : ""}
                    </div>
                `).join("")}
                ${this.renderEmptySlots(SQUAD_SIZE - this.queue.length, iAmHost)}
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
                ${this.renderQueue()}
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
                                    <div class="raid-sprite-hp-fill" id="raid-hp-${c.id}" style="width:${Math.max(0, ((this.squadHP[c.id] ?? c.currentHP) / c.maxHP) * 100)}%;"></div>
                                    <span class="raid-sprite-hp-text" id="raid-hp-text-${c.id}">${Math.max(0, this.squadHP[c.id] ?? c.currentHP)} / ${c.maxHP}</span>
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

        if (entry.burn) {
            return `<div class="pvp-log-line pvp-log-pet-bite">Pet de ${attackerName} queimou ${targetName}: ${entry.damage} de dano.</div>`;
        }

        if (entry.petBite) {
            const healTargetName = entry.healedIds?.[0] ? nameOf(entry.healedIds[0]) : null;
            const damage = entry.damage > 0 ? `Causou ${entry.damage} de dano em ${targetName}.` : "";
            const heal = entry.heal > 0 && healTargetName ? ` Curou ${healTargetName} em ${entry.heal} HP.` : "";
            return `<div class="pvp-log-line pvp-log-pet-bite">Pet de ${attackerName} agiu! ${damage}${heal}</div>`;
        }

        const crit = entry.critical ? ` <span class="pvp-log-critical">(Crítico!)</span>` : "";
        const steal = entry.lifeSteal > 0 ? ` <span class="pvp-log-heal">(+${entry.lifeSteal} HP roubado)</span>` : "";
        const absorbed = entry.absorbed > 0
            ? ` <span class="pvp-log-absorption">(${targetName} absorveu ${entry.absorbed})</span>`
            : "";

        return `<div class="pvp-log-line">${attackerName}${attackTag} causou ${entry.damage} de dano em ${targetName}${crit}${steal}${absorbed}</div>`;

    }

    async joinQueue() {

        this.state = "searching";
        this.opponentWaiting = false;
        this.queue = [];
        this.refresh();

        const combatant = RaidCombatService.snapshotCombatant(this.player);

        await RaidLobbyService.joinQueue(
            combatant,
            (matchData, matchId) => this.onMatchFound(matchData, matchId),
            (waiting) => {
                this.opponentWaiting = waiting;
                if (this.state === "searching") this.refresh();
            },
            (queue) => {
                this.queue = queue;
                if (this.state === "searching") this.refresh();
            },
            () => {
                this.inviteModal.hide();
                this.queue = [];
                this.state = "idle";
                this.refresh();
                Toast.show("O host removeu você da fila.");
            }
        );

    }

    async cancelQueue() {
        this.inviteModal.hide();
        await RaidLobbyService.leaveQueue();
        this.queue = [];
        this.state = "idle";
        this.refresh();
    }

    async onMatchFound(matchData, matchId) {

        this.inviteModal.hide();

        this.matchData = matchData;
        this.matchId = matchId;
        this.leftSelf = false;
        this.abandoned = false;
        this.combatResult = null;

        RaidLobbyService.armLeaveOnDisconnect(matchId, RaidLobbyService.playerId);

        this.setupFloor(matchData.floor ?? 1);

        this.state = "found";
        this.refresh();

        await this.sleep(1500);

        await this.runMatch(matchId, false);

    }

    // Roda a partida até eu sair dela (derrota, vitória no último andar,
    // "Sair do Cooperativo" ou partida encerrada). startWaiting: entrei
    // como convidado entre os andares — começo na espera, sem lutar.
    async runMatch(matchId, startWaiting) {

        this.game.hudScreen.inRaidCombat = true;
        this.game.hudScreen.setBackground("assets/img/backgrounds/arena_pvp.png");
        this.game.hudScreen.updateMusic();

        await this.runFloors(startWaiting);

        this.inviteModal.hide();
        this.floorWaitData = null;

        this.game.hudScreen.inRaidCombat = false;
        this.game.hudScreen.updateMusic();
        this.state = (this.leftSelf || this.abandoned || !this.combatResult) ? "idle" : "result";
        this.refresh();

        // Só apaga a partida quando ela acabou PRA TODO MUNDO (derrota ou
        // último andar). Se fui só eu que saí, os outros continuam nela:
        // leaveMatchFloor já me tirou; no abandono, solto só o que é meu.
        if (this.leftSelf) return;

        if (this.abandoned) {
            RaidLobbyService.releaseSelf(matchId);
            return;
        }

        RaidLobbyService.cleanupMatch(matchId);

    }

    // Convidado aceitando entrar numa partida em andamento (vaga de quem
    // saiu entre os andares) — ver RaidLobbyService.joinMatchAsReplacement.
    async joinAsReplacement(invite) {

        this.leftSelf = false;
        this.abandoned = false;
        this.combatResult = null;
        this.queue = [];

        const result = await RaidLobbyService.joinMatchAsReplacement(
            invite.matchId,
            invite.waitFloor,
            RaidCombatService.snapshotCombatant(this.player),
            this.player.currentHP
        );

        if (!result.ok) {

            const reasons = {
                advanced: "O squad já seguiu para o próximo andar.",
                full: "A vaga já foi preenchida."
            };

            this.state = "idle";
            this.refresh();
            Toast.show(reasons[result.reason] ?? "Essa sala do cooperativo não existe mais.");
            return;

        }

        this.matchData = result.data;
        this.matchId = invite.matchId;

        RaidLobbyService.armLeaveOnDisconnect(invite.matchId, RaidLobbyService.playerId);

        this.setupFloor(invite.waitFloor);

        await this.runMatch(invite.matchId, true);

    }

    setupFloor(floor) {
        this.currentFloor = floor;
        this.bossData = monstersRaid.find(m => m.floor === floor) ?? monstersRaid[floor - 1] ?? monstersRaid[0];
        this.bossCombatant = RaidCombatService.snapshotBoss(this.bossData);
        this.bossMaxHP = this.bossCombatant.maxHP;
        this.bossHP = this.bossCombatant.maxHP;
    }

    // Monta o squad do andar atual a partir dos snapshots da partida,
    // excluindo quem já saiu do cooperativo e usando o HP com que cada um
    // confirmou "Continuar" no andar anterior (ou o HP cheio do snapshot,
    // no andar 1). Cada jogador regrava o próprio snapshot ao confirmar
    // (ver waitForNextFloor) — pet trocado/alimentado, equipamento e Vida
    // Máxima chegam atualizados e IGUAIS pros 4 clientes. Nunca ajustar
    // nada só localmente aqui: a luta é simulada em cada navegador e
    // precisa dos mesmos dados em todos.
    buildSquadForFloor() {

        const left = this.matchData.left ?? {};
        const hp = this.matchData.hp ?? {};

        return Object.values(this.matchData.squad)
            .filter(c => !left[c.id])
            .map(c => ({ ...c, currentHP: Math.min(c.maxHP, hp[c.id] ?? c.currentHP ?? c.maxHP) }))
            // Visual: menor armadura fica na primeira posição, maior
            // armadura na última — o boss é sempre ancorado do lado
            // direito da arena (ver raid.css .raid-boss-portrait), então
            // quem aguenta mais dano fica visualmente mais perto dele.
            .sort((a, b) => a.armor - b.armor);

    }

    // Loop principal: luta o andar atual, entrega a recompensa e, se
    // não for o último andar, espera todo mundo confirmar "Continuar"
    // antes de avançar pro próximo drake. Termina em derrota, em vitória
    // no último andar, ou se eu mesmo escolher sair no meio do caminho.
    // startWaiting: pula a primeira luta (convidado que entrou entre os
    // andares, já confirmado — ver joinAsReplacement).
    async runFloors(startWaiting = false) {

        let waitingOnly = startWaiting;

        while (true) {

            if (!waitingOnly) {

                const finished = await this.playFloor();

                if (finished) return;

            }

            waitingOnly = false;

            const outcome = await this.waitForNextFloor();

            if (outcome.left) {
                await RaidLobbyService.leaveMatchFloor(this.matchId, RaidLobbyService.playerId);
                this.leftSelf = true;
                return;
            }

            if (outcome.aborted) {
                Toast.show("O cooperativo foi encerrado.");
                this.abandoned = true;
                return;
            }

            this.matchData = outcome.data;
            this.setupFloor(this.matchData.floor);

        }

    }

    // Um andar: luta, recompensa e a escolha de continuar. Devolve true
    // quando a run acabou pra mim (derrota, último andar ou saí), false
    // quando confirmei "Continuar" e falta esperar o resto do squad.
    async playFloor() {

        const squad = this.buildSquadForFloor();

        const result = await this.fightFloor(squad);

        if (result.winner !== "squad") {
            return true;
        }

        this.player.progress.stats.raidWins = (this.player.progress.stats.raidWins ?? 0) + 1;

        // Só pra alimentar as conquistas de dragão (ver AchievementService) —
        // guarda o id do drake sem duplicar, distinto de raidWins (que conta
        // toda vitória de andar, mesmo repetindo o mesmo drake em runs diferentes).
        this.player.progress.stats.raidBossesDefeated ??= [];
        if (!this.player.progress.stats.raidBossesDefeated.includes(this.bossData.id)) {
            this.player.progress.stats.raidBossesDefeated.push(this.bossData.id);
        }

        const reward = LootSystem.generate(this.bossData, this.player);
        const levelUps = this.player.collectReward(reward);
        this.game.hudScreen.refreshCurrentView();

        const isLastFloor = this.currentFloor >= monstersRaid.length;

        if (isLastFloor) {

            await this.rewardModal.show(reward);

            for (const levelUp of levelUps) {
                await this.levelUpModal.show(levelUp.level, levelUp.bonus, levelUp.petReward);
            }

            return true;

        }

        for (const levelUp of levelUps) {
            await this.levelUpModal.show(levelUp.level, levelUp.bonus, levelUp.petReward);
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

            await RaidLobbyService.leaveMatchFloor(this.matchId, RaidLobbyService.playerId);

            this.leftSelf = true;
            return true;

        }

        // Grava minha confirmação com meu HP atual e um snapshot novo:
        // pet/equipamento podem ter mudado no inventário entre um
        // andar e outro (ver RaidLobbyService.markFloorReady).
        await RaidLobbyService.markFloorReady(
            this.matchId,
            RaidLobbyService.playerId,
            this.game.player.currentHP,
            {
                ...RaidCombatService.snapshotCombatant(this.player),
                seat: this.matchData.squad[RaidLobbyService.playerId]?.seat ?? 0
            }
        );

        return false;

    }

    // Espera o squad confirmar o andar atual antes de seguir — ver
    // RaidLobbyService.waitForFloorAdvance para o mecanismo de sincronia.
    // É nessa tela que o host convida alguém pra vaga de quem saiu.
    async waitForNextFloor() {

        this.floorWaitData = this.matchData;
        this.state = "floor-wait";
        this.refresh();

        return await RaidLobbyService.waitForFloorAdvance(
            this.matchId,
            this.currentFloor,
            (data) => {
                this.floorWaitData = data;
                if (this.state === "floor-wait") this.refresh();
            }
        );

    }

    /* =====================================================
       CONVITE (host)
    ===================================================== */

    // Quem já está na sala agora: o squad ativo entre os andares, ou a fila.
    getRoomMembers() {
        return this.state === "floor-wait"
            ? RaidLobbyService.getActiveMembers(this.floorWaitData ?? this.matchData)
            : this.queue;
    }

    openInvite() {

        // Entre os andares o convidado entra pro PRÓXIMO andar.
        const floor = this.state === "floor-wait" ? this.currentFloor + 1 : 1;

        this.inviteModal.prompt({
            floor,
            onSubmit: (name) => this.sendInvite(name, floor)
        });

    }

    // Devolve a mensagem de erro pro modal, ou null se o convite saiu.
    async sendInvite(name, floor) {

        const typed = (name ?? "").trim().toLowerCase();

        if (this.getRoomMembers().some(member => member.name?.toLowerCase() === typed)) {
            return "Esse jogador já está na sala.";
        }

        const target = await RaidInviteService.resolveTarget(name, AuthService.getCurrentUser()?.uid);

        if (target.error) return target.error;

        const inMatch = this.state === "floor-wait";

        const replies = {
            accepted: `${target.name} aceitou o convite!`,
            declined: `${target.name} recusou o convite.`,
            busy: `${target.name} está ocupado e não pode entrar agora.`,
            timeout: `${target.name} não respondeu ao convite.`
        };

        const result = await RaidInviteService.send(
            target.uid,
            {
                fromName: this.player.name,
                matchId: inMatch ? this.matchId : null,
                waitFloor: inMatch ? this.currentFloor : 0,
                floor,
                count: this.getRoomMembers().length
            },
            (status) => Toast.show(replies[status] ?? replies.timeout)
        );

        if (result.error) return result.error;

        Toast.show(`Convite enviado para ${target.name}.`);

        return null;

    }

    /* =====================================================
       CONVITE (convidado)
    ===================================================== */

    startInviteListener() {
        RaidInviteService.listen(
            AuthService.getCurrentUser()?.uid,
            (invite, remainingMs) => this.handleIncomingInvite(invite, remainingMs)
        );
    }

    stopInviteListener() {
        RaidInviteService.stopListening();
        this.incomingModal.hide();
        this.inviteModal.hide();
        this.answeringInvite = false;
    }

    // Não dá pra aceitar agora: em combate, vida crítica, nível baixo, ou
    // já dentro de uma partida/fila. Na fila do coop ainda dá pra aceitar
    // convite de uma sala em andamento (sai da fila e entra nela).
    cannotAcceptInvite(invite) {

        const hud = this.game.hudScreen;
        const player = this.player;

        if (!player || player.level < RAID_MIN_LEVEL) return true;
        if (player.health.getHpPercent() <= 5) return true;
        if (hud.inCombat || hud.inPvpCombat || hud.inRaidCombat || hud.preparationMode) return true;
        if (hud.pvpView.state === "searching") return true;

        if (this.state === "searching") return !invite.matchId;

        return this.state !== "idle" && this.state !== "result";

    }

    async handleIncomingInvite(invite, remainingMs) {

        const uid = AuthService.getCurrentUser()?.uid;

        if (this.answeringInvite || this.cannotAcceptInvite(invite)) {
            await RaidInviteService.respond(uid, invite, "busy");
            return;
        }

        this.answeringInvite = true;

        const answer = await this.incomingModal.confirm({
            fromName: invite.fromName,
            floor: invite.floor,
            count: invite.count,
            timeoutMs: remainingMs
        });

        this.answeringInvite = false;

        // Prazo acabou sem resposta — o host já recebe o "não respondeu".
        if (answer === null) return;

        if (!answer) {
            await RaidInviteService.respond(uid, invite, "declined");
            return;
        }

        // A situação pode ter mudado enquanto o modal estava aberto.
        if (this.cannotAcceptInvite(invite)) {
            await RaidInviteService.respond(uid, invite, "busy");
            Toast.show("Você não pode entrar no cooperativo agora.");
            return;
        }

        await RaidInviteService.respond(uid, invite, "accepted");

        const hud = this.game.hudScreen;

        if (hud.currentView !== "coop") hud.changeView("coop");

        if (invite.matchId) {
            await this.joinAsReplacement(invite);
        } else if (this.state !== "searching") {
            await this.joinQueue();
        }

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

                } else {

                    this.squadHP[entry.targetId] = Math.max(0, (this.squadHP[entry.targetId] ?? 0) - entry.damage);

                    if (entry.targetId === RaidLobbyService.playerId) {
                        this.game.player.currentHP = this.squadHP[entry.targetId];
                    }

                    HitFlash.play(`.raid-sprite-slot[data-combatant-id="${entry.targetId}"] img`);

                }

                if (entry.lifeSteal > 0) {

                    if (entry.attackerSide === "squad") {

                        const attackerMax = squad.find(c => c.id === entry.attackerId)?.maxHP ?? 0;
                        this.squadHP[entry.attackerId] = Math.min(attackerMax, (this.squadHP[entry.attackerId] ?? 0) + entry.lifeSteal);

                        if (entry.attackerId === RaidLobbyService.playerId) {
                            this.game.player.currentHP = this.squadHP[entry.attackerId];
                        }

                        HealFlash.play(`.raid-sprite-slot[data-combatant-id="${entry.attackerId}"] img`);

                    } else {

                        this.bossHP = Math.min(this.bossMaxHP, this.bossHP + entry.lifeSteal);

                        HealFlash.play(".raid-boss-portrait img");

                    }

                }

                // Cura da habilidade do pet (ex: Duende) — só o alvo
                // sorteado em healedIds (ver RaidCombatService), nunca
                // o squad inteiro.
                if (entry.heal > 0 && entry.healedIds?.length) {

                    for (const id of entry.healedIds) {

                        const maxHp = squad.find(c => c.id === id)?.maxHP ?? 0;

                        this.squadHP[id] = Math.min(maxHp, (this.squadHP[id] ?? 0) + entry.heal);

                        if (id === RaidLobbyService.playerId) {
                            this.game.player.currentHP = this.squadHP[id];
                        }

                        HealFlash.play(`.raid-sprite-slot[data-combatant-id="${id}"] img`);

                        this.updateSquadHPBar(squad, id);

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

            if (!this.shouldSkipMessages(battleStartTime)) {
                await CombatToast.show(this.buildAttackMessage(entry, squad), this.buildToastType(entry), 2 + MiasmaService.extraToastSeconds(entry) + MimicService.extraToastSeconds(entry), speed);
            }

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

        if (entry.burn) {
            const petName = squad.find(c => c.id === entry.attackerId)?.petName ?? "O pet";
            return BoitataBurn.buildMessage({
                petName,
                targetName,
                damage: entry.damage,
                element: entry.element,
                first: entry.burnStart
            });
        }

        if (entry.petBite) {
            const petName = squad.find(c => c.id === entry.attackerId)?.petName ?? "O pet";
            const healTargetName = entry.healedIds?.[0] ? nameOf(entry.healedIds[0]) : null;
            const damage = entry.damage > 0 ? `Causou <strong>${entry.damage}</strong> de dano em ${targetName}.` : "";
            const heal = entry.heal > 0 && healTargetName
                ? ` Curou ${healTargetName === "Você" ? "você" : healTargetName} em <strong>${entry.heal}</strong> HP.`
                : "";
            return `<span class="combat-pet-bite">${petName}</span> agiu! ${damage}${heal}`;
        }

        let message = "";

        const inSentence = (name) => name === "Você" ? "você" : name;
        message += MiasmaService.buildWeakenedMessage(entry, inSentence(attackerName), inSentence(targetName));

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

        if (entry.absorbed > 0) {
            message += `<br><span class="combat-absorption">Absorção!</span> ${targetName} absorveu <strong>${entry.absorbed}</strong> do golpe.`;
        }

        if (entry.mimicBonus > 0) {
            message += `<br>${MimicService.buildMessage(entry.mimicBonus, { subject: attackerName, opponentName: entry.mimicOpponentName })}`;
        }

        if (entry.miasmaProc) {
            message += `<br>${MiasmaService.buildProcMessage(targetName === "Você" ? "você" : targetName, entry, MIASMA_PVE_PERCENTS)}`;
        }

        return message;

    }

    buildToastType(entry) {

        const isMeAttacking = entry.attackerId === RaidLobbyService.playerId;
        const isMeTarget = entry.targetId === RaidLobbyService.playerId;

        let type = entry.attackerSide === "squad" ? "player" : "enemy";

        if (entry.dodged) {
            type += " dodge";
        } else if (entry.petBite || entry.burn) {
            type += " pet-bite";
        } else if (isMeAttacking && entry.lifeSteal > 0) {
            type = "lifeSteal player";
        } else if (isMeTarget && entry.absorbed > 0) {
            type = "absorption enemy";
        } else if (entry.critical) {
            // Crítico de qualquer um (eu, aliado ou inimigo) usa a
            // caixa de crítico — o lado da tela continua vindo de type.
            type += " critico";
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

        container.querySelectorAll(".raid-kick-button").forEach(button => {
            button.addEventListener("click", () => {
                RaidLobbyService.kickFromQueue(button.dataset.id);
            });
        });

        container.querySelectorAll(".raid-invite-button").forEach(button => {
            button.addEventListener("click", () => this.openInvite());
        });

        container.querySelector(".raid-proceed-button")?.addEventListener("click", () => {
            RaidLobbyService.allowShortSquad(this.matchId, this.currentFloor);
        });

        container.querySelector(".raid-leave-button")?.addEventListener("click", () => {
            RaidLobbyService.cancelFloorWait?.();
        });

    }

}
