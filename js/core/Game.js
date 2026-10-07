import HomeScreen from "../ui/HomeScreen.js";
import ClassSelectionScreen from "../ui/ClassSelectionScreen.js";
import HudScreen from "../ui/HudScreen.js";
import LoginScreen from "../ui/LoginScreen.js";

import Loader from "./Loader.js";
import AuthService from "../services/AuthService.js";
import SaveService from "../services/SaveService.js";
import PresenceService from "../services/PresenceService.js";
import SessionConflictModal from "../ui/components/modals/SessionConflictModal.js";

const AUTO_SAVE_INTERVAL_MS = 60 * 60 * 1000; // 1h

export default class Game {

    constructor() {

        this.player = null;

        this.sessionConflictModal = new SessionConflictModal();

        this.loginScreen = new LoginScreen(this);

        this.homeScreen = new HomeScreen(this);

        this.classSelectionScreen = new ClassSelectionScreen(this);

        this.hudScreen = new HudScreen(this);

    }

    async start() {

        // Guardado na instância pra enterWithAccount() poder esconder a
        // tela de loading mais cedo, se precisar mostrar o modal de
        // conflito de sessão (ver comentário lá embaixo).
        this.loader = new Loader(this);

        // Carrega os assets e verifica a sessão do Firebase em
        // paralelo — assim, quando a tela de loading some, o destino
        // certo (login/home/hud) já está decidido e visível por trás,
        // sem piscar a tela de login por um instante antes de corrigir.
        const [, user] = await Promise.all([
            this.loader.load(),
            this.waitForAuthState()
        ]);

        if (user) {
            await this.enterWithAccount(user);
        } else {
            this.showScreen("login");
        }

        await this.loader.hide();

        this.startAutoSave();

    }

    // Salva sozinho de hora em hora (local + nuvem + ranking), além dos
    // saves que já acontecem em momentos-chave — cobre quem fica muito
    // tempo jogando sem clicar em "Salvar".
    startAutoSave() {

        clearInterval(this.autoSaveTimer);

        this.autoSaveTimer = setInterval(() => {

            if (!this.player) return;

            // No PVP a vida do personagem é alterada só durante a
            // animação da luta e restaurada no fim — salvar nesse meio
            // gravaria a vida "de mentira".
            if (this.hudScreen.inPvpCombat) return;

            SaveService.autoSave(this.player);

        }, AUTO_SAVE_INTERVAL_MS);

    }

    // Só a primeira notificação do Firebase Auth interessa aqui — ela
    // já vem com a sessão persistida (se tiver) sem precisar de
    // nenhuma outra chamada de rede.
    waitForAuthState() {

        return new Promise(resolve => {

            const unsubscribe = AuthService.onAuthStateChanged(user => {
                unsubscribe();
                resolve(user);
            });

        });

    }

    // Chamado tanto no boot (sessão já logada — inclusive uma 2ª aba da
    // MESMA conta, já que a sessão do Firebase Auth persiste sozinha)
    // quanto logo após um login/cadastro bem-sucedido em LoginScreen: se
    // já existe save na nuvem, entra direto no jogo; senão manda pra
    // Home criar personagem (fluxo de "Novo Jogo" continua igual).
    //
    // Antes de qualquer coisa, reivindica a sessão única da conta — igual
    // ao WhatsApp Web: se já tem outra aba/dispositivo ativo, pergunta se
    // quer desconectar a sessão anterior e continuar aqui; a aba antiga
    // percebe sozinha (watchForTakeover) e se desconecta na hora.
    async enterWithAccount(user) {

        const { claimed } = await PresenceService.claim(user.uid);

        if (!claimed) {

            // Esconde a tela de loading ANTES do modal — senão ele fica
            // esperando um clique atrás da tela de "Carregando...", que
            // só some depois que enterWithAccount() termina (e ela não
            // termina até alguém responder o modal). Chamar hide() de
            // novo no fim de start() não tem problema, é idempotente.
            await this.loader?.hide();

            const confirmed = await this.sessionConflictModal.show();

            if (!confirmed) {
                await AuthService.signOut();
                this.showScreen("login");
                return;
            }

            await PresenceService.forceClaim(user.uid);

        }

        PresenceService.watchForTakeover(user.uid, () => this.handleRemoteTakeover());

        const container = await SaveService.loadFromCloud(user.uid);

        await SaveService.loadMaxSlots(user.uid);
        SaveService.useContainer(container);

        // Entra direto no último personagem usado; sem personagem, Home.
        if (container && SaveService.hasCharacter(container, container.activeSlot)) {
            SaveService.persist(container);
            SaveService.applyLoadedData(this, container.activeSlot);
        } else {
            this.showScreen("home");
        }

    }

    // Esta aba foi desconectada porque outra (mais nova) assumiu a
    // conta — equivalente ao "conectado em outro lugar" do WhatsApp Web.
    // NÃO grava nada: o progresso da sessão nova é o que vale, e um save
    // daqui (com o estado antigo desta aba) sobrescreveria esse progresso.
    async handleRemoteTakeover() {

        PresenceService.forgetLocalSession();

        await AuthService.signOut();

        this.player = null;

        this.showScreen("login");
        this.loginScreen.showError("Sua conta foi aberta em outro lugar — esta sessão foi desconectada.");

    }

    showScreen(screen) {

        // O painel do chat vive no body, fora do #hud-screen — sem isso
        // ficaria aberto por cima da Home/Login depois de sair do jogo.
        if (screen !== "hud") this.hudScreen.chatHUD.shutdown();
        if (screen !== "hud") this.hudScreen.raidView.stopInviteListener();

        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("home-screen").classList.add("hidden");
        document.getElementById("class-selection-screen").classList.add("hidden");
        document.getElementById("hud-screen").classList.add("hidden");

        switch (screen) {

            case "login":
                this.loginScreen.show();
                break;

            case "home":
                this.homeScreen.show();
                break;

            case "class":
                this.classSelectionScreen.show();
                break;

            case "hud":
                this.hudScreen.show();
                break;

        }

    }

}