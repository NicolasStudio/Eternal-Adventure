import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    firestore,
    doc,
    setDoc
} from "./FirebaseService.js";

const USERS_COLLECTION = "users";

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function normalizePhone(phone) {
    return phone.replace(/\D/g, "");
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

    static async signUp({ email, password, fullName, phone, birthDate }) {

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

        return credential.user;

    }

    // "Esqueci a senha": só o e-mail. Quem protege a troca é o próprio
    // link de redefinição do Firebase Auth, que só chega na caixa de
    // entrada do dono da conta. As perguntas de antes (nascimento,
    // telefone, Palavra de Recuperação) eram conferidas aqui no
    // navegador contra uma coleção legível sem login — não barravam
    // ninguém e ainda expunham esses dados.
    //
    // Conta inexistente não é erro: quem chama mostra sempre a mesma
    // mensagem, pra tela não servir de teste de "esse e-mail joga?".
    static async sendPasswordReset(email) {

        try {

            await sendPasswordResetEmail(auth, normalizeEmail(email));

        } catch (err) {

            if (err.code !== "auth/user-not-found") throw err;

        }

    }

}
