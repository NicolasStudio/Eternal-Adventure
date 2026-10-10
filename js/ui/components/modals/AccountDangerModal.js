// Zona de perigo da conta: excluir a conta inteira (login, todos os
// personagens, tudo). É irreversível, então não usa o padrão Sim/Não
// de FarmConfirmModal.js (com Enter confirmando) — aqui é preciso
// DIGITAR "EXCLUIR" pra sequer habilitar o botão vermelho, e Enter
// nunca confirma sozinho.
export default class AccountDangerModal {

    constructor() {
        this.overlay = null;
    }

    hide() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    // Devolve a senha digitada (pra reautenticar, se o Firebase pedir)
    // ou null se cancelou. Exige digitar "EXCLUIR" (maiúsculo) além da
    // senha — é a ação mais destrutiva do jogo, apaga TODOS os
    // personagens e a conta de login.
    confirmDeleteAccount() {

        return new Promise(resolve => {

            this.hide();

            this.overlay = document.createElement("div");
            this.overlay.className = "continue-modal-overlay danger-zone-overlay";
            this.overlay.innerHTML = `
                <div class="continue-modal danger-zone-modal">
                    <h2 class="continue-title">Excluir Conta</h2>
                    <hr>
                    <p class="continue-message">
                        Isso apaga TODOS os seus personagens, o álbum, as conquistas e a
                        própria conta de login — pra sempre. Não tem como desfazer, nem
                        pela gente: os dados são apagados de verdade, não só escondidos.
                    </p>
                    <label class="danger-zone-label">
                        Digite <strong>EXCLUIR</strong> pra confirmar:
                        <input type="text" id="danger-zone-word" autocomplete="off" spellcheck="false">
                    </label>
                    <label class="danger-zone-label">
                        Confirme sua senha:
                        <input type="password" id="danger-zone-password" autocomplete="current-password">
                    </label>
                    <div class="continue-actions">
                        <button class="continue-no">Cancelar</button>
                        <button class="continue-yes continue-yes-danger" id="danger-zone-confirm" disabled>Excluir Conta</button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.overlay);

            document.activeElement?.blur();

            const wordInput = this.overlay.querySelector("#danger-zone-word");
            const passwordInput = this.overlay.querySelector("#danger-zone-password");
            const confirmButton = this.overlay.querySelector("#danger-zone-confirm");

            const finish = (value) => {
                document.removeEventListener("keydown", handleEscape, true);
                this.hide();
                resolve(value);
            };

            const handleEscape = (event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    finish(null);
                }
            };
            document.addEventListener("keydown", handleEscape, true);

            const updateButtonState = () => {
                confirmButton.disabled = wordInput.value !== "EXCLUIR" || !passwordInput.value;
            };
            wordInput.addEventListener("input", updateButtonState);
            passwordInput.addEventListener("input", updateButtonState);

            this.overlay.querySelector(".continue-no").addEventListener("click", () => finish(null));

            confirmButton.addEventListener("click", () => {
                if (!confirmButton.disabled) finish(passwordInput.value);
            });

        });

    }

}
