import ADMIN_UIDS from "../data/admins.js";
import { rtdb, ref, set, onValue, serverTimestamp } from "./FirebaseService.js";

// Alto Falante — aviso global, só a conta admin pode mandar (ver
// admins.js/database.rules.json, nó "speaker/broadcast"). Guardado
// como UM nó só (não uma lista crescente tipo o chat): cada envio
// SOBRESCREVE o anterior, então não precisa de limpeza/expiração —
// quem está online recebe a notificação ao vivo (ver listen() abaixo),
// quem entra depois nunca vê um aviso antigo.
const BROADCAST_PATH = "speaker/broadcast";

export const SPEAKER_MAX_LENGTH = 200;

export default class SpeakerService {

    static isAdmin(uid) {
        return !!uid && ADMIN_UIDS.includes(uid);
    }

    // Liga ao nó e chama onMessage SÓ para avisos que chegarem DEPOIS de
    // começar a escutar — o primeiro disparo do onValue (o que já
    // estava gravado ali, possivelmente um aviso antigo) é ignorado de
    // propósito, senão todo mundo que entra no jogo veria o último
    // Alto Falante de novo. Devolve a função pra cancelar a escuta.
    static listen(onMessage) {

        let first = true;
        let lastKey = null;

        const unsubscribe = onValue(ref(rtdb, BROADCAST_PATH), snapshot => {

            if (first) {
                first = false;
                return;
            }

            const data = snapshot.val();

            if (!data?.text) return;

            const message = {
                name: String(data.name ?? "").slice(0, 30),
                text: String(data.text ?? "").slice(0, SPEAKER_MAX_LENGTH)
            };

            // Quem ENVIA o aviso recebe o próprio onValue disparar 2x:
            // uma vez na hora, com o serverTimestamp() ainda não
            // resolvido (valor "otimista" só local), e outra quando o
            // servidor confirma com o timestamp de verdade — só pra
            // quem mandou, quem só recebe nunca vê a fase otimista.
            // ts muda entre as duas, mas nome+texto não, então dedupe
            // por isso em vez de pelo timestamp.
            const key = `${message.name}\u0000${message.text}`;

            if (key === lastKey) return;

            lastKey = key;

            onMessage(message);

        });

        return () => unsubscribe();

    }

    static async send(uid, name, rawText) {

        const text = rawText.trim();

        if (!text) {
            return { ok: false, error: "Digite uma mensagem." };
        }

        if (text.length > SPEAKER_MAX_LENGTH) {
            return { ok: false, error: `Máximo de ${SPEAKER_MAX_LENGTH} caracteres.` };
        }

        try {

            await set(ref(rtdb, BROADCAST_PATH), {
                uid,
                name: String(name ?? "").slice(0, 30),
                text,
                ts: serverTimestamp()
            });

        } catch (err) {

            console.warn("Falha ao enviar o Alto Falante:", err);

            return { ok: false, error: "Não foi possível enviar agora." };

        }

        return { ok: true };

    }

}
