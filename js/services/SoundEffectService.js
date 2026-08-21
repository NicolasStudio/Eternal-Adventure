import AudioSettings from "./AudioSettings.js";

/*
    Efeitos sonoros pontuais (SFX) — diferente de MusicService.js, que
    toca UMA faixa em loop de cada vez: aqui cada play() cria seu
    próprio <audio>, então dois efeitos podem soar em cima um do outro
    sem um cortar o outro. Lê o volume/liga-desliga de "Efeitos
    sonoros" (AudioSettings) na hora de tocar, sempre atualizado —
    nunca precisa de um refreshSettings() como o da música.
*/
const SOUNDS = {
    achievementUnlocked: "assets/audio/Achievements.mp3"
};

export default class SoundEffectService {

    static play(key) {

        const src = SOUNDS[key];

        if (!src) return;

        const settings = AudioSettings.get();

        if (!settings.sfxEnabled) return;

        const audio = new Audio(src);

        audio.volume = Math.max(0, Math.min(1, settings.sfxVolume / 100));

        audio.play().catch(() => {});

    }

}
