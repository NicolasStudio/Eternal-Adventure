import achievements from "../data/achievements.js";
import dungeons from "../data/dungeons.js";
import cards from "../data/cards.js";
import AudioSettings from "./AudioSettings.js";

const EQUIPMENT_SLOTS = ["weapon", "helmet", "chest", "leg", "boot"];

function distinctKills(player) {
    const killed = player.progress.stats?.killedMonsters ?? [];
    // Os dois anjos do final secreto ficam fora da conta, do mesmo jeito
    // que ficam fora do álbum (cards.js já filtra excludeFromAlbum) —
    // o denominador das conquistas de caça é sempre cards.length.
    return killed.filter(id => cards.some(card => card.id === id)).length;
}

function hasFullSetOfRarity(player, rarityId) {
    return EQUIPMENT_SLOTS.every(slot => player.equipment[slot]?.rarity?.id === rarityId);
}

function allEquippedAndInventoryItems(player) {
    return [...player.inventory, ...Object.values(player.equipment)].filter(Boolean);
}

function hasAnyUpgradedItem(player) {
    return allEquippedAndInventoryItems(player).some(item => item.quality && item.quality.id !== "none");
}

function hasAnyExceptionalItem(player) {
    return allEquippedAndInventoryItems(player).some(item => item.quality?.id === "exceptional");
}

function hasAnyEnchantedItem(player) {
    return allEquippedAndInventoryItems(player).some(item => item.enchantments && Object.keys(item.enchantments).length > 0);
}

// Não depende do player — o volume mora em AudioSettings (localStorage),
// não em progress. Basta a Música e os Efeitos sonoros estarem os DOIS
// no 0 (o checkbox de liga/desliga não entra na conta, só o slider).
function allSoundMuted() {
    const settings = AudioSettings.get();
    return settings.musicVolume === 0 && settings.sfxVolume === 0;
}

function allDungeonsMaxed(player) {
    return dungeons
        .filter(dungeon => !dungeon.hidden)
        .every(dungeon => player.getDungeonClears(dungeon.id) >= 3);
}

// Um checador por conquista, indexado pelo MESMO id semântico usado em
// achievements.js (kill_1, level_5, silence, the_end, etc.) — nunca
// pela posição/ordem no array. Isso é o que evita o bug de reordenar
// achievements.js e a lógica de uma conquista passar a valer pra outra.
//
// Cada um só olha pro estado ATUAL do personagem (contadores em
// player.progress.stats, ou dados já existentes como nível/álbum/
// equipamento). Uma vez que um checador retorna true,
// AchievementService.evaluate() marca a conquista como desbloqueada
// PRA SEMPRE — mesmo que o estado que a disparou mude depois (ex:
// vender o item encantado, trocar de equipamento).
const CHECKS = {
    kill_1: player => distinctKills(player) >= 1,
    kill_10: player => distinctKills(player) >= 10,
    kill_25: player => distinctKills(player) >= 25,
    kill_50: player => distinctKills(player) >= 50,
    kill_75: player => distinctKills(player) >= 75,
    kill_99: player => distinctKills(player) >= 99,
    kill_all: player => distinctKills(player) >= cards.length,

    death_1: player => (player.progress.stats?.deaths ?? 0) >= 1,
    death_10: player => (player.progress.stats?.deaths ?? 0) >= 10,
    death_30: player => (player.progress.stats?.deaths ?? 0) >= 30,

    level_5: player => player.level >= 5,
    level_20: player => player.level >= 20,
    level_30: player => player.level >= 30,
    level_50: player => player.level >= 50,
    level_70: player => player.level >= 70,
    level_100: player => player.level >= 100,

    equip_common: player => hasFullSetOfRarity(player, "common"),
    equip_rare: player => hasFullSetOfRarity(player, "rare"),
    equip_mystic: player => hasFullSetOfRarity(player, "mystic"),

    upgrade_first: player => hasAnyUpgradedItem(player),
    upgrade_exceptional: player => hasAnyExceptionalItem(player),

    enchant_first: player => hasAnyEnchantedItem(player),
    enchant_all_families: player => (player.progress.stats?.enchantStoneFamiliesUsed?.length ?? 0) >= 4,
    enchant_level3: player => player.progress.stats?.usedLevel3Stone === true,

    hospital_100: player => (player.progress.stats?.hospitalHeals ?? 0) >= 100,

    sell_100k: player => (player.progress.stats?.goldFromSelling ?? 0) >= 100000,

    dungeons_maxed: player => allDungeonsMaxed(player),

    album_1: player => player.album.length >= 1,
    album_10: player => player.album.length >= 10,
    album_25: player => player.album.length >= 25,
    album_50: player => player.album.length >= 50,
    album_75: player => player.album.length >= 75,
    album_100: player => player.album.length >= 100,

    pvp_first_win: player => (player.progress.stats?.pvpWins ?? 0) >= 1,

    silence: () => allSoundMuted(),

    // Mesmas 3 condições de Player.canMakeSoulChoice() (nível 100 +
    // álbum completo + 3/3 em todas as dungeons) — só que sem o guard
    // de "progress.soulChoice já escolhido", porque aquele existe pra
    // parar de mostrar o MODAL de escolha de novo, não pra dizer que a
    // conquista deixou de valer depois que o jogador escolheu um lado.
    the_end: player =>
        player.level >= 100 &&
        player.album.length >= cards.length &&
        allDungeonsMaxed(player)
};

// "O FIM?" depende só de nível, álbum e conclusões de dungeon — os
// três só CRESCEM, nada no jogo os diminui. Então, ao contrário de
// tudo mais (que fica permanente de propósito, pra não punir quem
// vende um item encantado ou troca de equipamento), re-conferir essa
// de novo em toda avaliação não tira nada de quem ganhou de verdade —
// só corrige, pra sempre, um desbloqueio indevido.
const REVALIDATED_EVERY_CHECK = new Set(["the_end"]);

export default class AchievementService {

    static isUnlocked(player, id) {
        return player.progress.achievements?.includes(id) ?? false;
    }

    // Roda todos os checadores, desbloqueia (de forma permanente) quem
    // ainda não estava e devolve só as conquistas NOVAS dessa chamada —
    // é essa lista que vira o pop-up de notificação.
    static evaluate(player) {

        if (!player.progress.achievements) player.progress.achievements = [];

        for (const id of REVALIDATED_EVERY_CHECK) {

            if (!player.progress.achievements.includes(id)) continue;

            const check = CHECKS[id];

            if (check && !check(player)) {
                player.progress.achievements = player.progress.achievements.filter(existing => existing !== id);
            }

        }

        const newlyUnlocked = [];

        for (const achievement of achievements) {

            if (player.progress.achievements.includes(achievement.id)) continue;

            const check = CHECKS[achievement.id];

            if (!check) continue;

            if (check(player)) {
                player.progress.achievements.push(achievement.id);
                newlyUnlocked.push(achievement);
            }

        }

        return newlyUnlocked;

    }

}
