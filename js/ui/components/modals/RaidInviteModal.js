// O nome vem do banco (de outro jogador) — nunca pode entrar como HTML.
export function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>"']/g, char => (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
    ));
}

// Os dois modais do convite do Cooperativo, na mesma estrutura/CSS do
// FarmConfirmModal.js (.continue-modal-overlay):
// - prompt(): o HOST digita o nome de quem quer convidar.
// - confirm(): o CONVIDADO responde Sim/Não, com prazo.
export default class RaidInviteModal {

    constructor() {
        this.overlay = null;
        this.close = null;
    }

    mount(html) {

        this.hide();

        this.overlay = document.createElement("div");
        this.overlay.className = "continue-modal-overlay";
        this.overlay.innerHTML = html;

        document.body.appendChild(this.overlay);
        document.activeElement?.blur();

    }

    // onSubmit(name) valida e envia — devolve a mensagem de erro (o modal
    // continua aberto, mostrando ela) ou null (convite enviado, fecha).
    prompt({ floor, onSubmit }) {

        this.mount(`
            <div class="continue-modal raid-invite-modal">
                <h2 class="continue-title">Convidar</h2>
                <hr>
                <p class="continue-message">Nome do jogador pra chamar pro Andar ${floor}:</p>
                <input class="raid-invite-input" type="text" maxlength="30" autocomplete="off" placeholder="Nome do personagem">
                <p class="raid-invite-error" hidden></p>
                <div class="continue-actions">
                    <button class="continue-no">Cancelar</button>
                    <button class="continue-yes continue-yes-success">Enviar</button>
                </div>
            </div>
        `);

        const overlay = this.overlay;
        const input = overlay.querySelector(".raid-invite-input");
        const error = overlay.querySelector(".raid-invite-error");
        const send = overlay.querySelector(".continue-yes");

        let busy = false;

        const submit = async () => {

            if (busy) return;

            busy = true;
            send.disabled = true;
            send.textContent = "Verificando...";
            error.hidden = true;

            let message;

            try {
                message = await onSubmit(input.value);
            } catch (err) {
                console.warn("Falha ao enviar o convite:", err);
                message = "Não foi possível enviar o convite. Tente de novo.";
            }

            // Fechado (Cancelar/Esc) enquanto validava.
            if (this.overlay !== overlay) return;

            if (!message) {
                this.hide();
                return;
            }

            busy = false;
            send.disabled = false;
            send.textContent = "Enviar";
            error.textContent = message;
            error.hidden = false;
            input.focus();

        };

        const handleKeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                submit();
            } else if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                this.hide();
            }
        };

        document.addEventListener("keydown", handleKeydown, true);
        this.close = () => document.removeEventListener("keydown", handleKeydown, true);

        overlay.querySelector(".continue-no").addEventListener("click", () => this.hide());
        send.addEventListener("click", submit);

        input.focus();

    }

    // Resolve true (Sim), false (Não) ou null (o prazo acabou sem resposta).
    confirm({ fromName, floor, count, timeoutMs }) {

        return new Promise(resolve => {

            const people = count === 1 ? "1 pessoa" : `${count} pessoas`;

            this.mount(`
                <div class="continue-modal raid-invite-modal">
                    <h2 class="continue-title">Convite</h2>
                    <hr>
                    <p class="continue-message">
                        <strong>${escapeHtml(fromName)}</strong> convidou você.<br>
                        Deseja ir para o modo cooperativo?<br>
                        <strong>Andar ${floor}</strong> — ${people} na fila.
                    </p>
                    <div class="continue-actions">
                        <button class="continue-no continue-no-danger">Não</button>
                        <button class="continue-yes continue-yes-success">Sim</button>
                    </div>
                </div>
            `);

            const finish = (result) => {
                this.hide();
                resolve(result);
            };

            const handleKeydown = (event) => {
                if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    finish(false);
                }
            };

            const timer = setTimeout(() => finish(null), timeoutMs);

            document.addEventListener("keydown", handleKeydown, true);
            this.close = () => {
                clearTimeout(timer);
                document.removeEventListener("keydown", handleKeydown, true);
            };

            this.overlay.querySelector(".continue-no").addEventListener("click", () => finish(false));
            this.overlay.querySelector(".continue-yes").addEventListener("click", () => finish(true));

        });

    }

    hide() {

        this.close?.();
        this.close = null;

        if (!this.overlay) return;

        this.overlay.remove();
        this.overlay = null;

    }

}
