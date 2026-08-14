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

export {
    db,
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
};
