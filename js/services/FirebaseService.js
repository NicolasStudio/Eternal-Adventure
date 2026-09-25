// Ponto único de acesso ao Firebase — o resto do jogo nunca importa
// direto do CDN do Google, sempre passa por aqui. Isso deixa fácil
// trocar de banco no futuro (ou desligar o PVP inteiro) sem precisar
// caçar imports espalhados pelo projeto.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    update,
    remove,
    onValue,
    off,
    onDisconnect,
    push,
    get,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// A apiKey abaixo é segura de deixar pública — a proteção de verdade
// do banco vem das Regras de Segurança configuradas no console do
// Firebase, não de esconder essa chave.
const firebaseConfig = {
    apiKey: "AIzaSyC0F-8_WUy-0oLxd-_M37YQ-rqUveaTsQU",
    authDomain: "eternal-adventure-pvp.firebaseapp.com",
    databaseURL: "https://eternal-adventure-pvp-default-rtdb.firebaseio.com",
    projectId: "eternal-adventure-pvp",
    storageBucket: "eternal-adventure-pvp.firebasestorage.app",
    messagingSenderId: "614429832745",
    appId: "1:614429832745:web:7f00fb1e2ea271ebbece38"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Alias explícito pro Realtime Database — só pra deixar claro, em
// código novo, que "db" aqui é o RTDB do lobby, não o Firestore das
// contas/saves ("firestore" abaixo). O nome "db" continua exportado
// como estava pra não quebrar o PVP/Raid.
const rtdb = db;

export {
    db,
    rtdb,
    ref,
    set,
    update,
    remove,
    onValue,
    off,
    onDisconnect,
    push,
    get,
    runTransaction,
    serverTimestamp,
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail,
    firestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    orderBy,
    limit,
    getDocs
};
