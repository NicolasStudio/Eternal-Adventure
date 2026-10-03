/* ==========================================================
   ESCALA DE DIFICULDADE DOS MONSTROS (dungeons)
   A partir de FROM_LEVEL, vida e dano crescem linearmente (`start` no
   FROM_LEVEL até `end` no TO_LEVEL); abaixo disso nada muda. Aplicada
   uma vez na saída de monsters.js, então vale pra combate/skip/HUD sem
   editar monstro por monstro. Não afeta XP/ouro/armadura/agilidade,
   nem os chefes de Cooperativo (ver monstersRaid.js).
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
