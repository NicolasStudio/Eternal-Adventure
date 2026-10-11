import { db, ref, set, update, remove, get, onValue, off, onDisconnect } from "./FirebaseService.js";
import SaveService from "./SaveService.js";
import PresenceService from "./PresenceService.js";
import { sanitizeRemote } from "./MatchSanitizer.js";

// Um convite por CONTA (uid) de quem recebe — o host grava, o convidado
// responde no mesmo nó (status) e o host apaga. Fica fora de pvpLobby/,
// pra nenhuma regra de fila alcançar esse caminho.
const INVITES_PATH = "raidInvites";

// Tempo que o convidado tem pra responder — depois disso o convite some
// dos dois lados.
export const INVITE_TIMEOUT_MS = 30 * 1000;

export const RAID_MIN_LEVEL = 100;

/*
    Convite do host do Cooperativo (ver RaidView): o host digita o NOME
    do personagem, que é resolvido pra conta (uid) pela mesma coleção
    usada na checagem de "nome já em uso" — é o uid que diz se o jogador
    está online (PresenceService) e em que nível está (ranking).
*/
export default class RaidInviteService {

    static listeningUid = null;
    static pending = new Map(); // targetUid -> { timer, inviteRef }

    static invitePath(uid) {
        return `${INVITES_PATH}/${uid}`;
    }

    // Valida o nome digitado ANTES de enviar: personagem inexistente,
    // o próprio host, abaixo do nível mínimo e offline. Devolve
    // { error } com a mensagem pro modal, ou { uid, name }.
    static async resolveTarget(name, selfUid) {

        const typed = (name ?? "").trim();

        if (!typed) {
            return { error: "Digite o nome do jogador." };
        }

        const target = await SaveService.findCharacterByName(typed);

        if (!target) {
            return { error: `Nenhum jogador chamado "${typed}" foi encontrado.` };
        }

        if (target.uid === selfUid) {
            return { error: "Você não pode convidar a si mesmo." };
        }

        if ((target.level ?? 0) < RAID_MIN_LEVEL) {
            const current = target.level ? ` (está no ${target.level})` : "";
            return { error: `${target.name} ainda não chegou ao nível ${RAID_MIN_LEVEL}${current}.` };
        }

        if (!await PresenceService.isOnline(target.uid)) {
            return { error: `${target.name} está offline.` };
        }

        return { uid: target.uid, name: target.name };

    }

    // Candidatos pro autocompletar do campo de nome (ver RaidInviteModal) —
    // mesmas regras de elegibilidade do resolveTarget (nível mínimo,
    // não é o próprio host), já filtrando só quem está online agora.
    // Mesmo cruzamento ranking+presença do GlobalRankingModal.
    static async listInvitableOnlinePlayers(selfUid) {

        const [entries, onlineUids] = await Promise.all([
            SaveService.getFullLeaderboard(),
            PresenceService.getOnlineUids()
        ]);

        return entries
            .filter(entry => entry.uid !== selfUid)
            .filter(entry => onlineUids.has(entry.uid))
            .filter(entry => (entry.level ?? 0) >= RAID_MIN_LEVEL)
            .map(entry => ({ uid: entry.uid, name: entry.name, level: entry.level }))
            .sort((a, b) => a.name.localeCompare(b.name));

    }

    // invite: { fromName, matchId (null = fila), waitFloor, floor, count }.
    // onReply(status) — "accepted" | "declined" | "busy" | "timeout".
    static async send(targetUid, invite, onReply) {

        if (this.pending.has(targetUid)) {
            return { error: "Você já enviou um convite pra esse jogador — aguarde a resposta." };
        }

        const inviteRef = ref(db, this.invitePath(targetUid));
        const sentAt = Date.now();

        // Só o destinatário lê o próprio convite, então não dá pra checar
        // antes. A regra recusa criar em cima de um convite já existente.
        try {
            await set(inviteRef, { ...invite, sentAt, status: "pending" });
        } catch {
            return { error: "Esse jogador já tem um convite pendente." };
        }

        onDisconnect(inviteRef).remove();

        const finish = (status) => {

            const entry = this.pending.get(targetUid);

            if (!entry) return;

            clearTimeout(entry.timer);
            off(inviteRef);
            onDisconnect(inviteRef).cancel();
            remove(inviteRef);
            this.pending.delete(targetUid);

            onReply?.(status);

        };

        const timer = setTimeout(() => finish("timeout"), INVITE_TIMEOUT_MS + 2000);

        this.pending.set(targetUid, { timer, inviteRef });

        onValue(inviteRef, (snapshot) => {

            const data = snapshot.val();

            // Só reage à resposta do MEU convite (mesmo sentAt).
            if (data?.sentAt === sentAt && data.status && data.status !== "pending") {
                finish(data.status);
            }

        });

        return { ok: true };

    }

    // Fica de olho nos convites que chegam pra esta conta enquanto o
    // jogador está no jogo. onInvite(invite) só é chamado pra convite
    // ainda dentro do prazo.
    static listen(uid, onInvite) {

        this.stopListening();

        if (!uid) return;

        this.listeningUid = uid;

        let lastSentAt = null;

        onValue(ref(db, this.invitePath(uid)), (snapshot) => {

            // Gravado pelo navegador de quem convidou (ver MatchSanitizer.js).
            const data = sanitizeRemote(snapshot.val());

            if (!data || data.status !== "pending" || data.sentAt === lastSentAt) return;

            lastSentAt = data.sentAt;

            const remaining = INVITE_TIMEOUT_MS - (Date.now() - (data.sentAt ?? 0));

            if (remaining <= 0) return;

            onInvite(data, remaining);

        });

    }

    static stopListening() {

        if (!this.listeningUid) return;

        off(ref(db, this.invitePath(this.listeningUid)));
        this.listeningUid = null;

    }

    // Resposta do convidado. Confere o sentAt pra nunca responder um
    // convite mais novo (de outro host) com a resposta do anterior.
    static async respond(uid, invite, status) {

        const inviteRef = ref(db, this.invitePath(uid));
        const current = (await get(inviteRef)).val();

        if (!current || current.sentAt !== invite.sentAt) return;

        await update(inviteRef, { status });

    }

}
