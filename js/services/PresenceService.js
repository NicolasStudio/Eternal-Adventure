import { rtdb, ref, get, set, update, remove, onDisconnect, runTransaction, onValue, off } from "./FirebaseService.js";

// Trava de sessão única + lista de "quem está online" — as duas coisas
// vivem no mesmo nó (sessions/{uid}) porque são a mesma informação por
// baixo: "essa conta está sendo usada ativamente AGORA, por esta aba".
//
// Cada aba que reivindica a vaga manda um heartbeat (lastSeen) de tempos
// em tempos; uma sessão sem heartbeat recente é considerada "morta" (aba
// fechou sem avisar, crash, etc.) e libera a vaga pra próxima tentativa.
// onDisconnect() cobre o caso limpo (fechar a aba, perda de rede) quase
// na hora; o timeout do heartbeat é só o reforço pro caso sujo.
const SESSIONS_PATH = "sessions";
const HEARTBEAT_INTERVAL_MS = 25 * 1000;
const STALE_AFTER_MS = 90 * 1000;

let heartbeatTimer = null;
let currentUid = null;
let currentSessionId = null;
let takeoverUnsubscribe = null;

function randomSessionId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export default class PresenceService {

    static get STALE_AFTER_MS() {
        return STALE_AFTER_MS;
    }

    // Tenta reivindicar a sessão única da conta. Usa transação (não um
    // set direto) pra duas abas tentando ao mesmo tempo nunca as duas
    // "ganharem" — o Realtime Database resolve isso sozinho reexecutando
    // a transação perdedora com o valor mais novo.
    static async claim(uid) {

        const sessionRef = ref(rtdb, `${SESSIONS_PATH}/${uid}`);
        const sessionId = randomSessionId();

        const result = await runTransaction(sessionRef, current => {

            if (current && (Date.now() - (current.lastSeen ?? 0)) < STALE_AFTER_MS) {
                // Sessão de outra aba/dispositivo ainda ativa — não
                // mexe em nada (abortar a transação é retornar undefined).
                return;
            }

            return { sessionId, lastSeen: Date.now() };

        });

        if (!result.committed || result.snapshot.val()?.sessionId !== sessionId) {
            return { claimed: false };
        }

        this.adoptSession(uid, sessionId, sessionRef);

        return { claimed: true };

    }

    // Assume a vaga NA MARRA, mesmo com outra sessão ativa — usado
    // depois que o jogador confirma "desconectar a sessão anterior e
    // continuar aqui" (ver SessionConflictModal). A aba antiga percebe
    // sozinha pelo listener armado em watchForTakeover().
    static async forceClaim(uid) {

        const sessionRef = ref(rtdb, `${SESSIONS_PATH}/${uid}`);
        const sessionId = randomSessionId();

        await set(sessionRef, { sessionId, lastSeen: Date.now() });

        this.adoptSession(uid, sessionId, sessionRef);

        return { claimed: true };

    }

    static adoptSession(uid, sessionId, sessionRef) {

        currentUid = uid;
        currentSessionId = sessionId;

        // Só limpa a sessão no disconnect se ainda for A MESMA (evita um
        // onDisconnect "fantasma" de uma aba zumbi apagar a vaga de quem
        // reivindicou depois dela ter expirado por timeout, ou de quem
        // tomou a vaga na marra).
        onDisconnect(sessionRef).remove();

        this.startHeartbeat();

    }

    // Fica de olho na própria vaga: se o sessionId mudar pra um valor
    // que não é mais o nosso, é porque outra aba tomou a conta (ver
    // forceClaim) — chama onKicked() pra essa aba se desconectar
    // sozinha, igual ao "conectado em outro lugar" do WhatsApp Web.
    static watchForTakeover(uid, onKicked) {

        this.stopWatchingForTakeover();

        const sessionRef = ref(rtdb, `${SESSIONS_PATH}/${uid}`);

        const listener = (snapshot) => {

            const val = snapshot.val();

            // As nossas próprias escritas (claim/forceClaim/heartbeat)
            // também disparam esse evento — só reage quando o
            // sessionId virou um valor que não é mais o nosso.
            if (currentSessionId && val?.sessionId && val.sessionId !== currentSessionId) {
                onKicked();
            }

        };

        onValue(sessionRef, listener);

        takeoverUnsubscribe = () => off(sessionRef);

    }

    static stopWatchingForTakeover() {
        takeoverUnsubscribe?.();
        takeoverUnsubscribe = null;
    }

    // Chamado quando ESTA aba foi expulsa por outra mais nova — só
    // limpa o estado local (heartbeat, listener). NUNCA mexe no servidor
    // aqui: o nó já pertence à sessão nova, apagar ou sobrescrever
    // destruiria a vaga de quem acabou de assumir.
    static forgetLocalSession() {
        this.stopHeartbeat();
        this.stopWatchingForTakeover();
        currentUid = null;
        currentSessionId = null;
    }

    static startHeartbeat() {

        this.stopHeartbeat();

        heartbeatTimer = setInterval(() => {

            if (!currentUid) return;

            update(ref(rtdb, `${SESSIONS_PATH}/${currentUid}`), { lastSeen: Date.now() });

        }, HEARTBEAT_INTERVAL_MS);

    }

    static stopHeartbeat() {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }

    // Chamado no logout explícito — libera a vaga na hora, sem esperar
    // o onDisconnect (que só dispara quando o socket cai de verdade).
    static async release() {

        this.stopHeartbeat();
        this.stopWatchingForTakeover();

        if (!currentUid) return;

        const sessionRef = ref(rtdb, `${SESSIONS_PATH}/${currentUid}`);

        try {

            const snapshot = await get(sessionRef);

            // Só remove se a sessão salva ainda for a NOSSA — nunca
            // apaga a vaga de uma sessão mais nova que já tomou o lugar.
            if (snapshot.val()?.sessionId === currentSessionId) {
                await remove(sessionRef);
            }

        } catch {
            // Sem rede/sem permissão no instante do logout — tudo bem,
            // o onDisconnect (já registrado) ainda cobre esse caso.
        }

        currentUid = null;
        currentSessionId = null;

    }

    // uids com heartbeat dentro do prazo AGORA — usado pelo Ranking
    // Global pra pintar a bolinha verde/vermelha.
    static async getOnlineUids() {

        try {

            const snapshot = await get(ref(rtdb, SESSIONS_PATH));
            const data = snapshot.val() ?? {};
            const now = Date.now();

            return new Set(
                Object.entries(data)
                    .filter(([, session]) => (now - (session?.lastSeen ?? 0)) < STALE_AFTER_MS)
                    .map(([uid]) => uid)
            );

        } catch {
            return new Set();
        }

    }

}
