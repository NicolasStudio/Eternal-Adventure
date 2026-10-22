import { firestore, doc, getDoc, runFirestoreTransaction } from "./FirebaseService.js";

// Controle dos 3 giros grátis por dia do Cassino. A proteção de verdade
// NÃO está aqui — está em firestore.rules (coleção casinoDaily, função
// today()), que calcula o dia usando request.time (relógio do
// SERVIDOR). Esse arquivo só PROPÕE o próximo valor; quem decide se
// aceita é a regra. Por isso mudar a hora do computador não adianta:
// o pior que pode acontecer é a proposta do cliente ficar errada e a
// escrita ser rejeitada (perde uma grátis de verdade) — nunca o
// contrário (ganhar uma a mais).
export const CASINO_FREE_SPINS_PER_DAY = 3;

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

// Mesma conta de "dia de Brasília" usada em firestore.rules (today()) e
// em FarmSyncService — só um PALPITE local pra montar a proposta.
function localBrtDay() {
    return Math.floor((Date.now() - BRT_OFFSET_MS) / 86400000);
}

function docRef(uid, slot) {
    return doc(firestore, "casinoDaily", `${uid}_${slot}`);
}

export default class CasinoDailyService {

    // Só pra EXIBIR quantas sobram antes de girar — não garante nada
    // sozinho (ver consumeFreeSpin, que é quem realmente vale). Em caso
    // de erro (offline, etc.) assume 0 pra não prometer uma grátis que
    // depois pode ser rejeitada na hora de girar.
    static async getFreeSpinsLeft(uid, slot) {

        if (!uid) return 0;

        try {

            const snap = await getDoc(docRef(uid, slot));

            if (!snap.exists()) return CASINO_FREE_SPINS_PER_DAY;

            const data = snap.data();

            if (data.day !== localBrtDay()) return CASINO_FREE_SPINS_PER_DAY;

            return Math.max(0, CASINO_FREE_SPINS_PER_DAY - data.used);

        } catch {
            return 0;
        }

    }

    // Tenta gastar 1 giro grátis de hoje. true = conseguiu (não cobra
    // ouro desse giro); false = acabou as de hoje (ou deu erro) — quem
    // chamou cai pro giro pago. Transação com retry automático do
    // próprio Firestore contra leitura desatualizada (ex: duas abas).
    static async consumeFreeSpin(uid, slot) {

        if (!uid) return false;

        const ref = docRef(uid, slot);

        try {

            await runFirestoreTransaction(firestore, async transaction => {

                const snap = await transaction.get(ref);
                const today = localBrtDay();
                const data = snap.exists() ? snap.data() : null;
                const sameDay = data?.day === today;
                const nextUsed = sameDay ? data.used + 1 : 1;

                // Só propõe — se nextUsed > 3 (ou "today" não bater com o
                // que o servidor calcula), firestore.rules rejeita e isso
                // joga pro catch abaixo.
                transaction.set(ref, { day: today, used: nextUsed });

            });

            return true;

        } catch {
            return false;
        }

    }

}
