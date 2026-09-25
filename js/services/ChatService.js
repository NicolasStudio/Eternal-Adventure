import AuthService from "./AuthService.js";
import {
    rtdb,
    ref,
    get,
    push,
    update,
    serverTimestamp,
    rtdbQuery,
    orderByChild,
    startAt,
    endAt,
    limitToLast,
    limitToFirst,
    onChildAdded,
    onChildRemoved
} from "./FirebaseService.js";

const CHAT_PATH = "chat/global";
const LAST_PATH = "chatLast";

export const MAX_LENGTH = 150;

const MESSAGE_TTL_MS = 60 * 60 * 1000;
const REPEAT_WINDOW_MS = 5 * 60 * 1000;
const MIN_INTERVAL_MS = 3000;
const HISTORY_LIMIT = 50;
const CLEANUP_BATCH = 50;
// Folga na hora de apagar, pra diferença de relógio nunca fazer o
// banco recusar apagar algo que o cliente achou que já tinha vencido.
const CLEANUP_MARGIN_MS = 5000;

export default class ChatService {

    static offset = 0;
    static unsubscribers = [];
    static lastText = "";
    static lastSentAt = 0;

    // Horário do servidor (o relógio do jogador não é confiável).
    static serverNow() {
        return Date.now() + this.offset;
    }

    // Escuta as mensagens da última hora + as novas em tempo real.
    // Só fica conectado enquanto o painel do chat está aberto.
    static async start(onAdd, onRemove) {

        this.stop();

        try {
            const snapshot = await get(ref(rtdb, ".info/serverTimeOffset"));
            this.offset = snapshot.val() ?? 0;
        } catch {
            this.offset = 0;
        }

        const messagesQuery = rtdbQuery(
            ref(rtdb, CHAT_PATH),
            orderByChild("ts"),
            startAt(this.serverNow() - MESSAGE_TTL_MS),
            limitToLast(HISTORY_LIMIT)
        );

        this.unsubscribers = [
            onChildAdded(messagesQuery, snapshot => onAdd({ id: snapshot.key, ...snapshot.val() })),
            onChildRemoved(messagesQuery, snapshot => onRemove(snapshot.key))
        ];

        this.cleanupExpired();

    }

    static stop() {
        this.unsubscribers.forEach(unsubscribe => unsubscribe());
        this.unsubscribers = [];
    }

    // Não existe relógio no servidor pra apagar sozinho (sem Cloud
    // Function), então quem abre o chat aproveita pra apagar as
    // mensagens que já passaram de 1 hora — as regras do banco só
    // permitem apagar mensagem vencida.
    static async cleanupExpired() {

        try {

            const expired = await get(rtdbQuery(
                ref(rtdb, CHAT_PATH),
                orderByChild("ts"),
                endAt(this.serverNow() - MESSAGE_TTL_MS - CLEANUP_MARGIN_MS),
                limitToFirst(CLEANUP_BATCH)
            ));

            if (!expired.exists()) return;

            const removals = {};

            expired.forEach(child => {
                removals[`${CHAT_PATH}/${child.key}`] = null;
            });

            await update(ref(rtdb), removals);

        } catch (err) {

            console.warn("Falha ao limpar mensagens antigas do chat:", err);

        }

    }

    // Valida o que dá pra validar no cliente (resposta imediata pro
    // jogador). As regras do banco repetem essas checagens no servidor,
    // que são as que valem de verdade.
    static async send(rawText, name) {

        const user = AuthService.getCurrentUser();

        if (!user) {
            return { ok: false, error: "Você precisa estar logado." };
        }

        const text = rawText.trim();

        if (!text) {
            return { ok: false, error: "Digite uma mensagem." };
        }

        if (text.length > MAX_LENGTH) {
            return { ok: false, error: `Máximo de ${MAX_LENGTH} caracteres.` };
        }

        const now = Date.now();
        const normalized = text.toLowerCase();

        if (now - this.lastSentAt < MIN_INTERVAL_MS) {
            return { ok: false, error: "Aguarde alguns segundos pra enviar de novo." };
        }

        if (normalized === this.lastText && now - this.lastSentAt < REPEAT_WINDOW_MS) {
            return { ok: false, error: "Mensagem repetida. Aguarde 5 minutos pra enviar a mesma." };
        }

        const key = push(ref(rtdb, CHAT_PATH)).key;

        try {

            // Uma escrita só nos dois lugares: a mensagem e o registro
            // "última mensagem deste jogador", que as regras usam pra
            // barrar repetição e envio rápido demais.
            await update(ref(rtdb), {
                [`${CHAT_PATH}/${key}`]: { uid: user.uid, name, text, ts: serverTimestamp() },
                [`${LAST_PATH}/${user.uid}`]: { text: normalized, ts: serverTimestamp() }
            });

        } catch (err) {

            console.warn("Falha ao enviar mensagem do chat:", err);

            return {
                ok: false,
                error: "Não foi possível enviar (mensagem repetida ou rápido demais?)."
            };

        }

        this.lastText = normalized;
        this.lastSentAt = now;

        return { ok: true };

    }

}
