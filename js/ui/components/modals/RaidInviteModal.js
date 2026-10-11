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
        this.picker = null;
        this.pickerOutsideClickHandler = null;
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
    // candidates: [{name, level}] pro painel de jogadores online (ver
    // RaidInviteService.listInvitableOnlinePlayers) — já vem filtrado
    // pra quem está online e elegível, aqui é só exibição. Mesmo padrão
    // do seletor de emoji do chat (ChatHUD.bindEmojiPicker): um botão
    // ao lado do campo abre um painel próprio, clicar num nome preenche
    // e fecha — em vez do <datalist> nativo do navegador, que não dá
    // pra estilizar com a cara do jogo.
    prompt({ floor, onSubmit, candidates = [] }) {

        this.mount(`
            <div class="continue-modal raid-invite-modal">
                <h2 class="continue-title">Convidar</h2>
                <hr>
                <p class="continue-message">Nome do jogador pra chamar pro Andar ${floor}:</p>
                <div class="raid-invite-input-row">
                    <input class="raid-invite-input" type="text" maxlength="30" autocomplete="off" placeholder="Nome do personagem">
                    <button type="button" class="raid-invite-picker-toggle" id="raid-invite-picker-toggle" title="Jogadores online">
                        <i class="fa-solid fa-user"></i>
                    </button>
                </div>
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

        this.bindPicker(candidates, input);

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
                // Painel aberto: Enter não deve enviar o convite com o
                // que já estiver digitado, só fecha o painel — igual
                // Esc, evita confundir "escolher na lista" com "enviar".
                if (this.picker) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.closePicker();
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
                submit();
            } else if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                // Esc com o painel aberto só fecha ELE — fechar o modal
                // inteiro de uma vez seria perder o nome já digitado por
                // um Esc que a pessoa só queria dar no painel (mesmo
                // raciocínio do seletor de emoji do chat).
                if (this.picker) {
                    this.closePicker();
                } else {
                    this.hide();
                }
            }
        };

        document.addEventListener("keydown", handleKeydown, true);
        this.close = () => {
            this.closePicker();
            document.removeEventListener("keydown", handleKeydown, true);
        };

        overlay.querySelector(".continue-no").addEventListener("click", () => this.hide());
        send.addEventListener("click", submit);

        input.focus();

    }

    // Botão de jogadores online: abre um painel ao lado do campo —
    // clicar fora ou Esc fecha, clicar num nome preenche o campo e
    // fecha (mesmo padrão do seletor de emoji do chat, ver
    // ChatHUD.bindEmojiPicker/openEmojiPicker).
    bindPicker(candidates, input) {

        const toggle = this.overlay.querySelector("#raid-invite-picker-toggle");

        toggle.addEventListener("click", event => {
            event.stopPropagation();
            if (this.picker) this.closePicker();
            else this.openPicker(candidates, input, toggle);
        });

    }

    openPicker(candidates, input, toggle) {

        this.closePicker();

        this.picker = document.createElement("div");
        this.picker.className = "raid-invite-picker";
        this.picker.innerHTML = candidates.length
            ? candidates.map(c => `
                <button type="button" class="raid-invite-picker-item" data-name="${escapeHtml(c.name)}">
                    <span class="raid-invite-picker-name">${escapeHtml(c.name)}</span>
                    <span class="raid-invite-picker-level">Nv. ${c.level}</span>
                </button>
            `).join("")
            : `<p class="raid-invite-picker-empty">Ninguém disponível agora.</p>`;

        toggle.insertAdjacentElement("afterend", this.picker);

        this.picker.querySelectorAll(".raid-invite-picker-item").forEach(button => {
            button.addEventListener("click", event => {
                event.stopPropagation();
                input.value = button.dataset.name;
                this.closePicker();
                input.focus();
            });
        });

        // Clicar fora fecha — o próprio botão de abrir já tem
        // stopPropagation(), então um clique nele não conta como "fora".
        this.pickerOutsideClickHandler = event => {
            if (!this.picker?.contains(event.target)) this.closePicker();
        };
        document.addEventListener("click", this.pickerOutsideClickHandler);

    }

    closePicker() {

        if (this.picker) {
            this.picker.remove();
            this.picker = null;
        }

        if (this.pickerOutsideClickHandler) {
            document.removeEventListener("click", this.pickerOutsideClickHandler);
            this.pickerOutsideClickHandler = null;
        }

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
