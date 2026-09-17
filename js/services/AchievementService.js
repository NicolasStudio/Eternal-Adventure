import achievements from "../data/achievements.js";
import dungeons from "../data/dungeons.js";
import cards from "../data/cards.js";
import monstersRaid from "../data/monstersRaid.js";
import farmCrops from "../data/farmCrops.js";
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

// Ovos (não chocados) e pets (chocados) são o MESMO tipo de item
// ("pet") — cobre inventário e o que está equipado, sem duplicar caso
// o equipado também apareça em inventory (não aparece, mas por via
// das dúvidas não custa nada).
function ownedPets(player) {
    return [...player.inventory, player.equipment.pet].filter(item => item?.type === "pet");
}

function hasPetAtLevel(player, level) {
    return ownedPets(player).some(pet => (pet.level ?? 0) >= level);
}

function hasPetWithStars(player, minStars) {
    return ownedPets(player).some(pet => (pet.stars?.length ?? 0) >= minStars);
}

// hungerHitZero mora no PRÓPRIO pet (ver PetService.applyHungerDecay),
// não em progress.stats — mais simples que ter que encanar `player`
// por toda a cadeia de chamadas só pra registrar o decaimento.
function hasPetHungerZero(player) {
    return ownedPets(player).some(pet => pet.hungerHitZero === true);
}

// "Quitandinha" — posse ATUAL (não histórico) de pelo menos 1 unidade
// de cada uma das 8 colheitas da Fazenda ao mesmo tempo.
function hasOneOfEachFood(player) {
    return Object.values(farmCrops).every(crop =>
        player.inventory.some(item => item.id === crop.harvestedItem.id && (item.quantity ?? 1) > 0)
    );
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
    equip_legendary: player => hasFullSetOfRarity(player, "legendary"),

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

    dragon_first: player => (player.progress.stats?.raidBossesDefeated?.length ?? 0) >= 1,
    dragon_all: player => (player.progress.stats?.raidBossesDefeated?.length ?? 0) >= monstersRaid.length,

    class_transcendence: player => player.transcendence != null,

    egg_hatch_1: player => (player.progress.stats?.eggsHatched ?? 0) >= 1,
    egg_hatch_5: player => (player.progress.stats?.eggsHatched ?? 0) >= 5,

    pet_hunger_zero: player => hasPetHungerZero(player),
    pet_feed_first: player => (player.progress.stats?.petFeedCount ?? 0) >= 1,

    // Ovos chocam já no nível 1 (ver PetService.hatch) — "ganhar um
    // nível" só conta a partir do 2, senão desbloquearia no mesmo
    // instante do choco.
    pet_level_up: player => hasPetAtLevel(player, 2),
    pet_level_18: player => hasPetAtLevel(player, 18),
    pet_level_32: player => hasPetAtLevel(player, 32),
    pet_5_stars: player => hasPetWithStars(player, 5),

    farm_till_first: player => player.farm.plots.some(plot => plot.tilled),
    farm_till_all: player => player.farm.plots.every(plot => plot.tilled),

    farm_seed_first: player => (player.progress.stats?.seedsPlanted ?? 0) >= 1,
    farm_seed_100: player => (player.progress.stats?.seedsPlanted ?? 0) >= 100,

    farm_harvest_first: player => (player.progress.stats?.harvests ?? 0) >= 1,
    farm_harvest_1000: player => (player.progress.stats?.harvestedFoodCount ?? 0) >= 1000,

    farm_water_50: player => (player.progress.stats?.waterCount ?? 0) >= 50,

    farm_harvest_dry_soil: player => player.progress.stats?.harvestedWithDrySoil === true,
    farm_harvest_strawberry: player => player.progress.stats?.harvestedStrawberry === true,

    // Clicar a enxada numa terra que já tem semente dispara a
    // confirmação de "Remover Semente" em vez de arar (ver
    // FarmView.handleHoeClick) — exatamente o misclick que dá nome à
    // conquista.
    farm_miss_click: player => player.progress.stats?.removedPlantedSeed === true,

    farm_harvest_corn_first: player => player.progress.stats?.harvestedCorn === true,
    farm_harvest_corn_1000: player => (player.progress.stats?.harvestedByCrop?.corn ?? 0) >= 1000,
    farm_harvest_wheat_1000: player => (player.progress.stats?.harvestedByCrop?.wheat ?? 0) >= 1000,
    farm_harvest_onion_1000: player => (player.progress.stats?.harvestedByCrop?.onion ?? 0) >= 1000,
    farm_harvest_pumpkin_night: player => player.progress.stats?.harvestedPumpkinAtNight === true,
    farm_harvest_pumpkin_1000: player => (player.progress.stats?.harvestedByCrop?.pumpkin ?? 0) >= 1000,

    farm_food_collection: player => hasOneOfEachFood(player),

    farm_pest_100: player => (player.progress.stats?.pestsRemoved ?? 0) >= 100,

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

    // Ids salvos que não batem com NENHUM achievement.id atual — sobras
    // de uma numeração antiga (ex: os "conquest_NN" de antes da migração
    // pra ids semânticos, ver [[achievements-id-coupling]]) ou de uma
    // conquista removida do jogo. Sem essa limpeza eles ficam presos no
    // array pra sempre, inflando a contagem de "X/36" além de 100%.
    //
    // Pra cada um removido, reconfere SILENCIOSAMENTE (sem toast, sem
    // entrar em newlyUnlocked) se o id NOVO correspondente já devia
    // estar desbloqueado — não é uma conquista nova, é a mesma que o
    // personagem já tinha, só sob outro nome. Idempotente: rodar de
    // novo com o array já limpo não faz nada.
    static sanitize(player) {

        if (!player.progress.achievements) {
            player.progress.achievements = [];
            return;
        }

        const validIds = new Set(achievements.map(a => a.id));

        const hasOrphans = player.progress.achievements.some(id => !validIds.has(id));

        if (!hasOrphans) return;

        player.progress.achievements = player.progress.achievements.filter(id => validIds.has(id));

        for (const achievement of achievements) {

            if (player.progress.achievements.includes(achievement.id)) continue;

            const check = CHECKS[achievement.id];

            if (check && check(player)) {
                player.progress.achievements.push(achievement.id);
            }

        }

    }

    // Roda todos os checadores, desbloqueia (de forma permanente) quem
    // ainda não estava e devolve só as conquistas NOVAS dessa chamada —
    // é essa lista que vira o pop-up de notificação.
    static evaluate(player) {

        if (!player.progress.achievements) player.progress.achievements = [];

        this.sanitize(player);

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
