/* ==========================================================
   ESCALA DE DIFICULDADE DOS MONSTROS (dungeons)

   A partir de FROM_LEVEL, vida e dano de todo monstro ganham um
   multiplicador que cresce de forma linear com o nível do monstro:
   começa em `start` no FROM_LEVEL e chega em `end` no TO_LEVEL.
   Abaixo do FROM_LEVEL nada muda.

   A escala é aplicada uma vez só, na saída de monsters.js — combate,
   pular dungeon e HUD do monstro leem todos os mesmos valores, então
   não precisa editar monstro por monstro. XP, ouro, armadura e
   agilidade NÃO são alterados. (Os chefes de Cooperativo ficam de fora,
   ver monstersRaid.js.)

   Pra ajustar a dificuldade, mexa só nos números abaixo.
========================================================== */

export const FROM_LEVEL = 35;
export const TO_LEVEL = 100;

export const HP_MULTIPLIER = { start: 1.4, end: 2.4 };
export const DAMAGE_MULTIPLIER = { start: 1.08, end: 1.25 };

function interpolate(range, level) {

    const progress = Math.min(1, Math.max(0, (level - FROM_LEVEL) / (TO_LEVEL - FROM_LEVEL)));

    return range.start + (range.end - range.start) * progress;

}

export function getMonsterScale(level) {

    if (level < FROM_LEVEL) {
        return { hp: 1, damage: 1 };
    }

    return {
        hp: interpolate(HP_MULTIPLIER, level),
        damage: interpolate(DAMAGE_MULTIPLIER, level)
    };

}

export function scaleMonsters(monsters) {

    return monsters.map(monster => {

        if (monster.level < FROM_LEVEL) return monster;

        const scale = getMonsterScale(monster.level);

        return {
            ...monster,
            status: {
                ...monster.status,
                vidaMaxima: Math.round(monster.status.vidaMaxima * scale.hp),
                dano: monster.status.dano == null
                    ? monster.status.dano
                    : Math.round(monster.status.dano * scale.damage)
            }
        };

    });

}
