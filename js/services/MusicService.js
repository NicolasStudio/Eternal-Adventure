import AudioSettings from "./AudioSettings.js";

/*
    Música ambiente do jogo — nunca é "efeito sonoro" (SFX), é sempre
    uma faixa de fundo em loop, uma por vez. Trocar de tela só troca
    de faixa quando a nova tela realmente pede uma faixa diferente;
    abrir um modal ou o inventário por cima não reinicia nada.
*/
const TRACKS = {
    home: "assets/audio/tela-inicial.mp3",
    dungeonMenu: "assets/audio/menu-combate.mp3",
    combat: "assets/audio/combate.mp3",
    city: "assets/audio/menu-cidade.mp3"
    // pvp: "assets/audio/combate-pvp.mp3" — reservado, ainda não usado
};

export default class MusicService {

    static audio = null;
    static currentTrack = null;
    static interactionBound = false;

    static init() {

        if (this.audio) return;

        this.audio = new Audio();
        this.audio.loop = true;

        this.applyVolume();
        this.bindFirstInteraction();

    }

    static applyVolume() {

        if (!this.audio) return;

        const settings = AudioSettings.get();

        this.audio.volume = Math.max(0, Math.min(1, settings.musicVolume / 100));
        this.audio.muted = !settings.musicEnabled;

    }

    // Navegadores bloqueiam áudio automático antes de qualquer clique do
    // usuário. Isso garante que, assim que ele interagir pela primeira
    // vez, a música (se já devia estar tocando) realmente começa.
    static bindFirstInteraction() {

        if (this.interactionBound) return;

        this.interactionBound = true;

        const resume = () => {

            const settings = AudioSettings.get();

            if (this.audio && this.currentTrack && this.audio.paused && settings.musicEnabled) {
                this.audio.play().catch(() => {});
            }

            document.removeEventListener("click", resume);
            document.removeEventListener("keydown", resume);

        };

        document.addEventListener("click", resume);
        document.addEventListener("keydown", resume);

    }

    // Toca uma faixa só se ela for diferente da atual — chamar de novo
    // com a mesma faixa (ex: reabrir o mesmo menu) não reinicia a música.
    static play(trackKey) {

        this.init();

        const src = TRACKS[trackKey];

        if (!src) return;

        if (this.currentTrack === trackKey) {
            this.applyVolume();
            const settings = AudioSettings.get();
            if (this.audio.paused && settings.musicEnabled) {
                this.audio.play().catch(() => {});
            }
            return;
        }

        this.currentTrack = trackKey;
        this.audio.src = src;

        this.applyVolume();

        const settings = AudioSettings.get();
        if (settings.musicEnabled) {
            this.audio.play().catch(() => {});
        }

    }

    static stop() {
        if (!this.audio) return;
        this.audio.pause();
        this.currentTrack = null;
    }

    // Chamado pelo modal de Configurações sempre que volume/liga-desliga muda.
    static refreshSettings() {

        this.applyVolume();

        if (!this.audio) return;

        const settings = AudioSettings.get();

        if (!settings.musicEnabled) {
            this.audio.pause();
        } else if (this.currentTrack && this.audio.paused) {
            this.audio.play().catch(() => {});
        }

    }

}
