import { firestore, doc, getDocs, setDoc, deleteDoc, collection, onSnapshot } from "./FirebaseService.js";
import ADMIN_UIDS from "../data/admins.js";

// Correio — provisório e unilateral (admin → jogador, ver admins.js e
// firestore.rules). Guardado como subcoleção POR DESTINATÁRIO
// (mail/{uid}/letters/{id}) de propósito: listar a caixa de entrada
// de alguém vira um getDocs simples na subcoleção, sem precisar de
// query "where" nenhuma.
const MAIL_COLLECTION = "mail";
const LETTERS_SUBCOLLECTION = "letters";

export const MAIL_EXPIRY_DAYS = 30;
export const MAIL_MAX_TITLE_LENGTH = 30;
export const MAIL_MAX_BODY_LENGTH = 250;
export const MAIL_MAX_ITEMS = 3;

const EXPIRY_MS = MAIL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export default class MailService {

    static isAdmin(uid) {
        return !!uid && ADMIN_UIDS.includes(uid);
    }

    static lettersRef(uid) {
        return collection(firestore, MAIL_COLLECTION, uid, LETTERS_SUBCOLLECTION);
    }

    static letterRef(uid, letterId) {
        return doc(firestore, MAIL_COLLECTION, uid, LETTERS_SUBCOLLECTION, letterId);
    }

    static isExpired(letter) {
        return Date.now() - (letter.sentAt ?? 0) > EXPIRY_MS;
    }

    // Caixa de entrada de um jogador, mais recente primeiro. Cartas
    // vencidas (ver isExpired) são devolvidas ao remetente ANTES de
    // entrar na lista devolvida pra tela — assim ninguém chega a ver
    // uma carta que já devia ter sumido. Não existe job de servidor
    // pra isso (sem Cloud Functions no projeto): quem "repara" a
    // expiração é sempre o cliente do PRÓPRIO destinatário, na
    // primeira vez que ele abre a caixa depois do prazo vencer.
    static async fetchInbox(uid) {

        const snapshot = await getDocs(this.lettersRef(uid));
        const letters = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        const active = [];

        for (const letter of letters) {

            if (this.isExpired(letter)) {
                await this.returnExpiredLetter(uid, letter).catch(() => {});
                continue;
            }

            active.push(letter);

        }

        return active.sort((a, b) => (b.sentAt ?? 0) - (a.sentAt ?? 0));

    }

    // Só conta quantas cartas existem (pro ícone/pulso) sem processar
    // expiração — chamado com mais frequência que fetchInbox (toda
    // entrada na home), não precisa do custo de corrigir expiradas
    // toda vez.
    static async countPending(uid) {
        const snapshot = await getDocs(this.lettersRef(uid));
        return snapshot.size;
    }

    // Escuta AO VIVO quantas cartas existem — callback(count) roda na
    // hora que abre e de novo toda vez que a caixa muda (chegou carta
    // nova, coletou, excluiu), sem precisar recarregar a página.
    // Devolve a função de cancelamento (chamar ao sair da home/fechar
    // o jogo, senão o listener fica ligado pra sempre).
    static watchPending(uid, callback) {
        return onSnapshot(this.lettersRef(uid), snapshot => callback(snapshot.size), () => callback(0));
    }

    // Envia uma carta — só a conta admin pode (ver isAdmin), travado
    // também nas Regras do Firestore (quem tentar contornando a UI
    // ainda esbarra lá). recipientUid já resolvido (ver
    // SaveService.findCharacterByName) e items já no formato
    // [{..itemSnapshot, quantity}] — cada item é uma cópia completa do
    // que estava no inventário de quem envia, sem o `uid` (que é só
    // da instância de inventário de origem, não faz sentido copiar).
    static async sendLetter({ senderUid, senderName, recipientUid, title, body, items }) {

        if (recipientUid === senderUid) {
            throw new Error("Não é possível enviar uma carta para si mesmo.");
        }

        if (!items.length || items.length > MAIL_MAX_ITEMS) {
            throw new Error(`A carta precisa ter entre 1 e ${MAIL_MAX_ITEMS} itens.`);
        }

        const letterId = crypto.randomUUID();

        await setDoc(this.letterRef(recipientUid, letterId), {
            senderUid,
            senderName,
            title: title.slice(0, MAIL_MAX_TITLE_LENGTH),
            body: body.slice(0, MAIL_MAX_BODY_LENGTH),
            items,
            sentAt: Date.now(),
            expiredReturn: false
        });

    }

    static async deleteLetter(uid, letterId) {
        await deleteDoc(this.letterRef(uid, letterId));
    }

    // 30 dias sem coleta: o item volta pro remetente original como uma
    // carta nova (marcada expiredReturn), e a carta vencida some da
    // caixa de quem não coletou.
    static async returnExpiredLetter(recipientUid, letter) {

        if (letter.items?.length) {

            const returnId = crypto.randomUUID();

            await setDoc(this.letterRef(letter.senderUid, returnId), {
                senderUid: recipientUid,
                senderName: "Devolução automática",
                title: `Devolvida: ${letter.title}`.slice(0, MAIL_MAX_TITLE_LENGTH),
                body: `Não foi coletada dentro do prazo de ${MAIL_EXPIRY_DAYS} dias.`,
                items: letter.items,
                sentAt: Date.now(),
                expiredReturn: true
            });

        }

        await this.deleteLetter(recipientUid, letter.id);

    }

}
