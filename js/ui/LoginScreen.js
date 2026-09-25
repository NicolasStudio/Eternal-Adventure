import AuthService from "../services/AuthService.js";
import SaveService from "../services/SaveService.js";
import Toast from "./components/Toast.js";
import NewsModal from "./NewsModal.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)+$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_RECOVERY_WORD_LENGTH = 4;

const AUTH_ERROR_MESSAGES = {
    "auth/email-already-in-use": "Esse e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "Senha muito fraca (mínimo 6 caracteres).",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-not-found": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente em instantes."
};

function digitsOnly(value) {
    return value.replace(/\D/g, "");
}

export default class LoginScreen {

    constructor(game) {

        this.game = game;
        this.element = document.getElementById("login-screen");
        this.mode = "login";
        this.busy = false;
        this.newsModal = new NewsModal();

        this.render();
        this.bindEvents();

    }

    show() {
        this.mode = "login";
        this.busy = false;
        this.render();
        this.bindEvents();
        this.element.classList.remove("hidden");
    }

    hide() {
        this.element.classList.add("hidden");
    }

    switchMode(mode) {
        this.mode = mode;
        this.busy = false;
        this.render();
        this.bindEvents();
    }

    render() {

        this.element.innerHTML = `
            <div class="login-screen">
                <button id="btn-news" class="btn-news">
                    <img class="pergaminho" src="assets/img/icons/pergaminho.png" alt="Pergaminho">
                </button>
                <div class="login-panel">
                    <h1 class="login-title">Eternal Adventure</h1>
                    ${this.renderMode()}
                    <span class="continue-warning login-error" hidden></span>
                </div>
            </div>
        `;

    }

    renderMode() {

        if (this.mode === "signup") return this.renderSignup();
        if (this.mode === "recover") return this.renderRecover();
        return this.renderLogin();

    }

    renderLogin() {
        return `
            <h2 class="login-subtitle">Entrar</h2>
            <input type="email" class="name-entry-input login-email" placeholder="E-mail" autocomplete="username">
            <input type="password" class="name-entry-input login-password" placeholder="Senha" autocomplete="current-password">
            <button class="login-link" id="login-forgot">Esqueci a senha</button>
            <div class="continue-actions">
                <button class="name-entry-confirm" id="login-submit">Entrar</button>
            </div>
            <p class="login-switch">Não tem conta? <button class="login-link" id="login-goto-signup">Criar conta</button></p>
        `;
    }

    renderSignup() {

        const showMigration = SaveService.hasLocalSave();

        return `
            <h2 class="login-subtitle">Criar conta</h2>
            <input type="email" class="name-entry-input signup-email" placeholder="E-mail" autocomplete="username">
            <input type="text" class="name-entry-input signup-fullname" placeholder="Nome completo" autocomplete="name">
            <input type="tel" class="name-entry-input signup-phone" placeholder="Telefone" autocomplete="tel">
            <input type="date" class="name-entry-input signup-birthdate" autocomplete="bday">
            <input type="text" class="name-entry-input signup-recovery" placeholder="Palavra de Recuperação" autocomplete="off">
            <input type="password" class="name-entry-input signup-password" placeholder="Senha" autocomplete="new-password">
            <input type="password" class="name-entry-input signup-password-confirm" placeholder="Repetir Senha" autocomplete="new-password">
            ${showMigration ? `
                <label class="login-checkbox">
                    <input type="checkbox" class="signup-migrate" checked>
                    Vincular meu progresso salvo neste navegador a esta conta
                </label>
            ` : ""}
            <div class="continue-actions">
                <button class="name-entry-confirm" id="signup-submit">Criar conta</button>
            </div>
            <p class="login-switch">Já tem conta? <button class="login-link" id="login-goto-login">Entrar</button></p>
        `;

    }

    renderRecover() {
        return `
            <h2 class="login-subtitle">Recuperar senha</h2>
            <p class="name-entry-hint">Confirme os dados do seu cadastro pra receber o e-mail de redefinição.</p>
            <input type="email" class="name-entry-input recover-email" placeholder="E-mail" autocomplete="username">
            <input type="date" class="name-entry-input recover-birthdate" autocomplete="bday">
            <input type="tel" class="name-entry-input recover-phone" placeholder="Telefone" autocomplete="tel">
            <input type="text" class="name-entry-input recover-recovery" placeholder="Palavra de Recuperação" autocomplete="off">
            <div class="continue-actions">
                <button class="name-entry-confirm" id="recover-submit">Verificar</button>
            </div>
            <p class="login-switch"><button class="login-link" id="login-goto-login">Voltar pro login</button></p>
        `;
    }

    bindEvents() {

        this.element.querySelector("#btn-news")?.addEventListener("click", () => this.newsModal.show());

        this.element.querySelector("#login-goto-signup")?.addEventListener("click", () => this.switchMode("signup"));
        this.element.querySelector("#login-goto-login")?.addEventListener("click", () => this.switchMode("login"));
        this.element.querySelector("#login-forgot")?.addEventListener("click", () => this.switchMode("recover"));

        this.element.querySelector("#login-submit")?.addEventListener("click", () => this.submitLogin());
        this.element.querySelector("#signup-submit")?.addEventListener("click", () => this.submitSignup());
        this.element.querySelector("#recover-submit")?.addEventListener("click", () => this.submitRecover());

        this.element.querySelectorAll("input").forEach(input => {
            input.addEventListener("keydown", event => {
                if (event.key !== "Enter") return;
                if (this.mode === "login") this.submitLogin();
                else if (this.mode === "signup") this.submitSignup();
                else this.submitRecover();
            });
        });

    }

    showError(message) {
        const errorLabel = this.element.querySelector(".login-error");
        if (!errorLabel) return;
        errorLabel.textContent = message;
        errorLabel.hidden = !message;
    }

    setBusy(busy) {
        this.busy = busy;
        this.element.querySelectorAll("button").forEach(button => { button.disabled = busy; });
    }

    async submitLogin() {

        if (this.busy) return;

        const email = this.element.querySelector(".login-email").value.trim();
        const password = this.element.querySelector(".login-password").value;

        if (!email || !password) {
            this.showError("Preencha e-mail e senha.");
            return;
        }

        this.showError("");
        this.setBusy(true);

        try {

            const user = await AuthService.signIn(email, password);
            await this.game.enterWithAccount(user);

        } catch (err) {

            this.setBusy(false);
            this.showError(AUTH_ERROR_MESSAGES[err.code] ?? "Não foi possível entrar.");

        }

    }

    validateSignup({ email, fullName, phone, birthDate, recoveryWord, password, passwordConfirm }) {

        if (!EMAIL_REGEX.test(email)) return "E-mail inválido.";
        if (!NAME_REGEX.test(fullName)) return "Digite seu nome completo, só letras.";
        if (digitsOnly(phone).length < 10 || digitsOnly(phone).length > 11) return "Telefone inválido.";

        if (!birthDate) return "Informe sua data de nascimento.";
        if (new Date(birthDate) > new Date()) return "Data de nascimento inválida.";

        if (recoveryWord.length < MIN_RECOVERY_WORD_LENGTH) return "Palavra de Recuperação muito curta.";

        if (password.length < MIN_PASSWORD_LENGTH) return "Senha tem que ter mais de 5 caracteres.";
        if (password !== passwordConfirm) return "As senhas não são iguais.";

        return null;

    }

    async submitSignup() {

        if (this.busy) return;

        const fields = {
            email: this.element.querySelector(".signup-email").value.trim(),
            fullName: this.element.querySelector(".signup-fullname").value.trim(),
            phone: this.element.querySelector(".signup-phone").value.trim(),
            birthDate: this.element.querySelector(".signup-birthdate").value,
            recoveryWord: this.element.querySelector(".signup-recovery").value.trim(),
            password: this.element.querySelector(".signup-password").value,
            passwordConfirm: this.element.querySelector(".signup-password-confirm").value
        };

        const error = this.validateSignup(fields);

        if (error) {
            this.showError(error);
            return;
        }

        this.showError("");
        this.setBusy(true);

        const shouldMigrate = this.element.querySelector(".signup-migrate")?.checked ?? false;
        const localSave = shouldMigrate ? SaveService.loadFromLocalStorage() : null;

        try {

            const user = await AuthService.signUp(fields);

            if (localSave) {

                await SaveService.saveToCloud(user.uid, localSave);

                if (localSave.name) {
                    await SaveService.reserveCharacterName(localSave.name, user.uid);
                }

                await this.game.enterWithAccount(user);

            } else {

                this.game.showScreen("home");

            }

        } catch (err) {

            this.setBusy(false);
            this.showError(AUTH_ERROR_MESSAGES[err.code] ?? "Não foi possível criar a conta.");

        }

    }

    async submitRecover() {

        if (this.busy) return;

        const email = this.element.querySelector(".recover-email").value.trim();
        const birthDate = this.element.querySelector(".recover-birthdate").value;
        const phone = this.element.querySelector(".recover-phone").value.trim();
        const recoveryWord = this.element.querySelector(".recover-recovery").value.trim();

        if (!email || !birthDate || !phone || !recoveryWord) {
            this.showError("Preencha todos os campos.");
            return;
        }

        this.showError("");
        this.setBusy(true);

        try {

            await AuthService.verifyRecovery({ email, birthDate, phone, recoveryWord });
            this.switchMode("login");
            Toast.show("Enviamos um e-mail pra você redefinir sua senha.");

        } catch {

            this.setBusy(false);
            this.showError("Dados não conferem.");

        }

    }

}
