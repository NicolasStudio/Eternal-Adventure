import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    firestore,
    doc,
    getDoc,
    setDoc
} from "./FirebaseService.js";

// Guarda os campos de verificação ("esqueci a senha") numa coleção
// própria, indexada pelo e-mail (não pelo uid) — é o único jeito de
// achar o documento certo ANTES de estar autenticado, já que quem
// esqueceu a senha ainda não tem uid disponível no cliente.
const RECOVERY_COLLECTION = "recovery";
const USERS_COLLECTION = "users";

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function normalizePhone(phone) {
    return phone.replace(/\D/g, "");
}

function normalizeRecoveryWord(word) {
    return word.trim().toLowerCase();
}

async function sha256(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

export default class AuthService {

    static onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    }

    static getCurrentUser() {
        return auth.currentUser;
    }

    static async signIn(email, password) {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        return credential.user;
    }

    static async signOut() {
        await firebaseSignOut(auth);
    }

    static async signUp({ email, password, fullName, phone, birthDate, recoveryWord }) {

        const normalizedEmail = normalizeEmail(email);

        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const uid = credential.user.uid;

        await setDoc(doc(firestore, USERS_COLLECTION, uid), {
            email: normalizedEmail,
            fullName: fullName.trim(),
            phone: normalizePhone(phone),
            birthDate,
            createdAt: new Date().toISOString()
        });

        const [birthDateHash, phoneHash, recoveryWordHash] = await Promise.all([
            sha256(birthDate),
            sha256(normalizePhone(phone)),
            sha256(normalizeRecoveryWord(recoveryWord))
        ]);

        await setDoc(doc(firestore, RECOVERY_COLLECTION, normalizedEmail), {
            uid,
            birthDateHash,
            phoneHash,
            recoveryWordHash
        });

        return credential.user;

    }

    // Confere os 3 dados de identidade contra o hash salvo no cadastro
    // e, só se todos baterem, dispara o e-mail de redefinição padrão
    // do Firebase Auth (trocar a senha na hora exigiria um backend,
    // que o projeto não tem — ver plano). Nunca aponta qual campo
    // errou, pra não ajudar tentativa por eliminação.
    static async verifyRecovery({ email, birthDate, phone, recoveryWord }) {

        const normalizedEmail = normalizeEmail(email);

        const snapshot = await getDoc(doc(firestore, RECOVERY_COLLECTION, normalizedEmail));

        if (!snapshot.exists()) {
            throw new Error("Dados não conferem.");
        }

        const stored = snapshot.data();

        const [birthDateHash, phoneHash, recoveryWordHash] = await Promise.all([
            sha256(birthDate),
            sha256(normalizePhone(phone)),
            sha256(normalizeRecoveryWord(recoveryWord))
        ]);

        const matches = stored.birthDateHash === birthDateHash
            && stored.phoneHash === phoneHash
            && stored.recoveryWordHash === recoveryWordHash;

        if (!matches) {
            throw new Error("Dados não conferem.");
        }

        await sendPasswordResetEmail(auth, normalizedEmail);

    }

}
