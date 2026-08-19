import classes from "../player/classes.js";
import Player from "../player/Player.js";
import enchantmentStone from "../data/enchantmentStone.js";
import StatsMigrationService, { CURRENT_BALANCE_VERSION } from "./StatsMigrationService.js";

const STORAGE_KEY = "eternal-adventure-save";
const SAVE_VERSION = 1;

export default class SaveService {

    /* =====================================================
       SERIALIZAÇÃO (Player -> objeto puro, pronto pra JSON)
    ===================================================== */

    static serialize(player) {

        return {

            version: SAVE_VERSION,
            savedAt: Date.now(),

            classId: player.class.id,
            name: player.name,

            level: player.level,
            gold: player.gold,
            currentXP: player.currentXP,
            currentHP: player.currentHP,
            maxHP: player.maxHP,

            baseStats: player.baseStats,
            balanceVersion: player.balanceVersion ?? CURRENT_BALANCE_VERSION,

            inventory: player.inventory,
            equipment: player.equipment,

            progress: player.progress,

            chest: player.chest,
            album: player.album,

            health: {
                burstMode: player.health.burstMode,
                regenerationPercent: player.health.regenerationPercent,
                regenerationTime: player.health.regenerationTime
            }

        };

    }

    // Confere o mínimo pra saber se é um arquivo de save válido
    // antes de tentar carregar (evita quebrar com arquivo errado).
    static isValidSave(data) {

        if (!data || typeof data !== "object") return false;
        if (!classes[data.classId]) return false;
        if (typeof data.level !== "number") return false;
        if (!Array.isArray(data.inventory)) return false;

        return true;

    }

    // Recria um Player do zero e aplica por cima os dados salvos.
    static deserialize(game, data) {

        const characterClass = classes[data.classId] ?? Object.values(classes)[0];

        const player = new Player(characterClass, data.name);

        player.level = data.level ?? player.level;
        player.gold = data.gold ?? player.gold;
        player.currentXP = data.currentXP ?? player.currentXP;

        // Saves gravados antes do campo balanceVersion existir são
        // sempre da curva original (v1). Se a curva de levels.js mudou
        // desde então, recalcula baseStats/maxHP na curva ATUAL —
        // preservando qualquer bônus que o personagem já tinha ganho
        // além do level up puro (pedra de encantamento, transcendência).
        // Sem isso, um personagem de nível alto salvo antes de um
        // reequilíbrio ficaria PRA SEMPRE com os números antigos, mesmo
        // com o jogo já rebalanceado — só quem começasse do zero sentiria
        // a mudança.
        const savedBalanceVersion = data.balanceVersion ?? 1;
        const savedBaseStats = data.baseStats ?? player.baseStats;
        const savedMaxHP = data.maxHP ?? player.maxHP;

        if (savedBalanceVersion < CURRENT_BALANCE_VERSION) {

            const migrated = StatsMigrationService.migrate(
                characterClass.id,
                player.level,
                savedBaseStats,
                savedMaxHP,
                savedBalanceVersion
            );

            player.baseStats = migrated.baseStats;
            player.maxHP = migrated.maxHP;
            player.currentHP = player.maxHP;
            player.balanceVersion = CURRENT_BALANCE_VERSION;

        } else {

            player.baseStats = savedBaseStats;
            player.maxHP = savedMaxHP;
            player.currentHP = data.currentHP ?? player.currentHP;
            player.balanceVersion = savedBalanceVersion;

        }

        player.inventory = this.repairStones(data.inventory ?? []);
        player.equipment = data.equipment ?? player.equipment;

        player.progress = data.progress ?? player.progress;

        // Re-deriva a transcendência a partir da escolha salva (não guarda
        // o objeto pesado no save, e sempre pega os dados/imagens atuais
        // do upClasse.js, mesmo que ele mude depois).
        //
        // soulChoice sozinho só diz QUAL caminho foi escolhido — o bônus
        // de status em si (já somado em baseStats/maxHP, esses sim salvos
        // normalmente) só existe de verdade se a dungeon correspondente
        // já foi vencida ao menos uma vez.
        if (player.progress.soulChoice) {

            const dungeonId = player.progress.soulChoice === "dark" ? "dark_dungeon" : "light_dungeon";

            if (player.progress.dungeons?.[dungeonId]?.completed) {
                player.transcendence = player.getTranscendenceFor(player.progress.soulChoice);
            }

        }

        player.chest = data.chest ?? player.chest;
        player.album = data.album ?? [];

        if (data.health) {
            player.health.burstMode = data.health.burstMode ?? false;
            player.health.regenerationPercent = data.health.regenerationPercent ?? 1;
            player.health.regenerationTime = data.health.regenerationTime ?? 120000;
            player.health.startRegeneration();
        }

        return player;

    }

    // Saves de antes da raridade/descrição existirem nas pedras de
    // encantamento guardaram uma cópia "congelada" sem esses campos —
    // isso reidrata qualquer pedra salva com os dados atuais do jogo
    // (mantendo a quantidade que o jogador já tinha).
    static repairStones(inventory) {

        const stonesById = {};

        Object.values(enchantmentStone).forEach(stone => {
            stonesById[stone.id] = stone;
        });

        return inventory.map(item => {

            const current = stonesById[item.id];

            if (!current) return item;

            return {
                ...current,
                uid: item.uid,
                quantity: item.quantity
            };

        });

    }

    /* =====================================================
       LOCALSTORAGE
    ===================================================== */

    static persist(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    static hasLocalSave() {
        return !!localStorage.getItem(STORAGE_KEY);
    }

    static clearLocalSave() {
        localStorage.removeItem(STORAGE_KEY);
    }

    static loadFromLocalStorage() {

        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return null;

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }

    }

    /* =====================================================
       ARQUIVO (.txt em JSON)
    ===================================================== */

    static downloadFile(data) {

        const json = JSON.stringify(data, null, 2);

        const blob = new Blob([json], { type: "text/plain" });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = this.buildFileName(data);

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

    }

    // Monta um nome de arquivo único por save — classe + data/hora —
    // pra nunca repetir o mesmo nome (o navegador empilhava "(1)", "(2)"...
    // toda vez que baixava com o nome fixo de antes).
    static buildFileName(data) {

        const className = classes[data.classId]?.name?.toLowerCase() ?? "personagem";

        const date = new Date(data.savedAt ?? Date.now());

        const pad = (n) => String(n).padStart(2, "0");

        const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        const timeStr = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;

        return `${className}-eternal-adventure-save-${dateStr}-${timeStr}.txt`;

    }

    static readFile(file) {

        return new Promise((resolve, reject) => {

            const reader = new FileReader();

            reader.onload = () => {
                try {
                    resolve(JSON.parse(reader.result));
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(reader.error);

            reader.readAsText(file);

        });

    }

    /* =====================================================
       AÇÕES DE ALTO NÍVEL
    ===================================================== */

    // Botão "Salvar": grava no localStorage E baixa o .txt
    static save(player) {

        const data = this.serialize(player);

        this.persist(data);

        this.downloadFile(data);

        return data;

    }

    // Save silencioso — nunca baixa arquivo, só atualiza o localStorage.
    // Chamado automaticamente em alguns momentos-chave (sair de uma
    // dungeon, curar na enfermaria, melhorar/encantar um item), pra
    // reduzir o risco de perder progresso se a página for recarregada
    // sem o jogador ter clicado em "Salvar" manualmente.
    static autoSave(player) {

        if (!player) return;

        try {

            const data = this.serialize(player);

            this.persist(data);

        } catch (err) {

            console.warn("Falha ao salvar automaticamente:", err);

        }

    }

    // Aplica um save (do localStorage ou de um arquivo carregado)
    // como o jogador atual da partida.
    static applyLoadedData(game, data) {

        const player = this.deserialize(game, data);

        game.player = player;

        player.addListener(() => {
            game.hudScreen.updateHUD();
        });

        // Persiste o ESTADO DO PLAYER recém-montado (não o `data` bruto
        // que veio do arquivo/localStorage) — se o deserialize acabou de
        // migrar os status pra uma curva de balanceamento mais nova, é
        // essa versão migrada que precisa ficar salva, não a original.
        this.persist(this.serialize(player));

        game.showScreen("hud");

    }

}
