import classes from "../player/classes.js";
import Player from "../player/Player.js";

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

            level: player.level,
            gold: player.gold,
            currentXP: player.currentXP,
            currentHP: player.currentHP,
            maxHP: player.maxHP,

            baseStats: player.baseStats,

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

        const player = new Player(characterClass);

        player.level = data.level ?? player.level;
        player.gold = data.gold ?? player.gold;
        player.currentXP = data.currentXP ?? player.currentXP;
        player.currentHP = data.currentHP ?? player.currentHP;
        player.maxHP = data.maxHP ?? player.maxHP;

        player.baseStats = data.baseStats ?? player.baseStats;

        player.inventory = data.inventory ?? [];
        player.equipment = data.equipment ?? player.equipment;

        player.progress = data.progress ?? player.progress;

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

    // Aplica um save (do localStorage ou de um arquivo carregado)
    // como o jogador atual da partida.
    static applyLoadedData(game, data) {

        const player = this.deserialize(game, data);

        game.player = player;

        player.addListener(() => {
            game.hudScreen.updateHUD();
        });

        // mantém o localStorage sincronizado com o que acabou de carregar
        this.persist(data);

        game.showScreen("hud");

    }

}
