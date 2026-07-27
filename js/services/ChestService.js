import cards from "../data/cards.js";

const COOLDOWN_MS = 5 * 60 * 60 * 1000; // 5 horas

export default class ChestService {

    static isReady(player) {
        return Date.now() >= player.chest.readyAt;
    }

    static getRemainingMs(player) {
        return Math.max(0, player.chest.readyAt - Date.now());
    }

    // Formata o tempo restante como HH:MM:SS
    static formatRemaining(player) {

        const totalSeconds = Math.floor(this.getRemainingMs(player) / 1000);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (n) => String(n).padStart(2, "0");

        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    }

    // Sorteia uma carta aleatória (pode repetir, sem problema),
    // registra no álbum do player e reinicia o cooldown de 5h.
    static open(player) {

        if (!this.isReady(player)) return null;

        const card = cards[Math.floor(Math.random() * cards.length)];

        player.unlockCard(card.id);

        player.chest.readyAt = Date.now() + COOLDOWN_MS;

        player.notify();

        return card;

    }

    static getTotalCards() {
        return cards.length;
    }

    static getDiscoveredCount(player) {
        return player.album?.length ?? 0;
    }

}
