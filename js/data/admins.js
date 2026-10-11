// uids com selo de admin no Chat (ver ChatHUD.js) e, agora, com
// permissão de ENVIAR carta no Correio (ver MailService.js/
// MailModal.js). Fixo no código de propósito — diferente do #1 do
// ranking (que é dinâmico, recalculado toda vez que o chat abre),
// admin é uma identidade permanente, não algo que muda com o Poder de
// ninguém.
//
// IMPORTANTE: o uid abaixo também está hardcoded em firestore.rules
// (regra de /mail/{recipientUid}/letters/{letterId}) — a regra não lê
// este arquivo, então trocar/adicionar um admin aqui exige atualizar
// os dois lugares à mão.
export default [
    "qgZA5v7Q1IWLjYc99bNrrRJd14X2"
];
