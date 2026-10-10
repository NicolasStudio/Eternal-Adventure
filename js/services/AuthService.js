import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider,
    firestore,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    deleteField
} from "./FirebaseService.js";

const USERS_COLLECTION = "users";

function normalizeEmail(email) {
    return email.trim().toLowerCase();
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
        await this.removeLegacyPersonalData(credential.user.uid);
        return credential.user;
    }

    // Contas criadas antes desta versão têm telefone e data de nascimento
    // gravados. O jogo não usa mais esses campos, então apaga aqui, na
    // primeira vez que a conta entra. Falha em silêncio: se o documento
    // não existir ou a rede cair, o login segue normal.
    static async removeLegacyPersonalData(uid) {
        try {
            await updateDoc(doc(firestore, USERS_COLLECTION, uid), {
                phone: deleteField(),
                birthDate: deleteField()
            });
        } catch {
            // ignorado de propósito — ver comentário acima
        }
    }

    static async signOut() {
        await firebaseSignOut(auth);
    }

    static async signUp({ email, password, fullName }) {

        const normalizedEmail = normalizeEmail(email);

        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const uid = credential.user.uid;

        await setDoc(doc(firestore, USERS_COLLECTION, uid), {
            email: normalizedEmail,
            fullName: fullName.trim(),
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

    // Exclusão de conta: o Firebase recusa deleteUser() se o login foi
    // há muito tempo (auth/requires-recent-login) — tem que reautenticar
    // com a senha de novo antes. Quem chama decide quando pedir a senha
    // (ver AccountDangerModal), tentando deleteCurrentUser() primeiro e
    // só caindo aqui se ele recusar por esse motivo específico.
    static async reauthenticate(password) {

        const user = auth.currentUser;

        if (!user?.email) throw new Error("Nenhuma conta logada.");

        const credential = EmailAuthProvider.credential(user.email, password);

        await reauthenticateWithCredential(user, credential);

    }

    // Apaga a conta de autenticação em si — o resto dos dados (save,
    // nome reservado, entrada no ranking) já precisa ter sido apagado
    // ANTES de chamar isso (ver SaveService.deleteAccountData), porque
    // depois daqui `auth.currentUser` vira null e as Regras de
    // Segurança (que conferem request.auth.uid) passam a recusar
    // qualquer escrita dessa conta.
    static async deleteCurrentUser() {

        const user = auth.currentUser;

        if (!user) throw new Error("Nenhuma conta logada.");

        await deleteDoc(doc(firestore, USERS_COLLECTION, user.uid));

        await deleteUser(user);

    }

}
