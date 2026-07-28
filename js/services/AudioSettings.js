const STORAGE_KEY = "eternal-adventure-audio";

/*
    Ainda não existe áudio de verdade no jogo — isso guarda só a
    PREFERÊNCIA do jogador (ligado/desligado, volume), pronta pra
    quando os sons forem adicionados.
*/
const DEFAULTS = {
    musicEnabled: true,
    musicVolume: 70,
    sfxEnabled: true,
    sfxVolume: 80
};

export default class AudioSettings {

    static get() {

        try {

            const raw = localStorage.getItem(STORAGE_KEY);

            if (!raw) return { ...DEFAULTS };

            return { ...DEFAULTS, ...JSON.parse(raw) };

        } catch {
            return { ...DEFAULTS };
        }

    }

    static save(settings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

}
