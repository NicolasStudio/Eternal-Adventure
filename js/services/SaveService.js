import classes from "../player/classes.js";
import Player from "../player/Player.js";
import enchantmentStone from "../data/enchantmentStone.js";
import StatsMigrationService, { CURRENT_BALANCE_VERSION } from "./StatsMigrationService.js";
import UpgradeService from "./UpgradeService.js";
import weapons from "../data/weapons.js";
import helmets from "../data/helmets.js";
import chests from "../data/chest.js";
import legs from "../data/legs.js";
import boots from "../data/boots.js";
import rings from "../data/ring.js";
import amulets from "../data/amulet.js";
import pets from "../data/pet.js";
import farmCrops from "../data/farmCrops.js";
import Toast from "../ui/components/Toast.js";
import AuthService from "./AuthService.js";
import PowerService from "./PowerService.js";
import TalentService from "./TalentService.js";
import { PET_MAX_LEVEL } from "../data/levelsPet.js";
import cards from "../data/cards.js";
import { sanitizeRemote, sanitizeText } from "./MatchSanitizer.js";
import { firestore, doc, getDoc, getDocs, setDoc, deleteDoc, runFirestoreTransaction, collection, query, orderBy, limit } from "./FirebaseService.js";

const STORAGE_KEY = "eternal-adventure-save";
// Formato de UM personagem (ver serialize). A conta inteira usa CONTAINER_VERSION.
const SAVE_VERSION = 1;
const CONTAINER_VERSION = 2;
const SAVES_COLLECTION = "saves";
const CHARACTER_NAMES_COLLECTION = "characterNames";
const LEADERBOARD_COLLECTION = "leaderboard";
const ENTITLEMENTS_COLLECTION = "entitlements";

// Quantos personagens uma conta pode ter: 1 grátis + 1 pago (ver entitlements).
export const MAX_SLOTS = 2;

// Todo item de equipamento conhecido, indexado por id — usado só pra
// "refrescar" itens salvos (ver refreshItemStats), nunca alterado.
const EQUIPMENT_BY_ID = {};
[weapons, helmets, chests, legs, boots, rings, amulets].forEach(pool => {
    Object.values(pool).forEach(item => { EQUIPMENT_BY_ID[item.id] = item; });
});

// Até o Anel/Amuleto virarem duas variantes cada (Primal/Moderno), só
// existia UM anel ("Anel do Primeiro Imperador", Vida/Armadura — hoje
// ringModernX) e UM amuleto ("Amuleto Primal", Ataque/Agilidade — hoje
// amuletPrimalX), com ids mais curtos (ringCommon, amuletLegendary...).
// Sem este mapa, quem já tinha um desses equipado/no inventário ficava
// com o item "travado" (refreshItemStats não acha mais o id salvo pra
// comparar) — ícone quebrado (o arquivo antigo foi renomeado/apagado)
// e nome congelado no que estava salvo.
const LEGACY_EQUIPMENT_IDS = {
    ringCommon: "ringModernCommon",
    ringIncommon: "ringModernIncommon",
    ringRare: "ringModernRare",
    ringMystic: "ringModernMystic",
    ringLegendary: "ringModernLegendary",
    ringUltraje: "ringModernUltraje",
    amuletCommon: "amuletPrimalCommon",
    amuletIncommon: "amuletPrimalIncommon",
    amuletRare: "amuletPrimalRare",
    amuletMystic: "amuletPrimalMystic",
    amuletLegendary: "amuletPrimalLegendary",
    amuletUltraje: "amuletPrimalUltraje"
};

// Todo alimento de pet (colheita da Fazenda) conhecido, indexado por
// id — usado só pra "refrescar" os já colhidos (ver refreshFoodItems),
// nunca alterado.
const FOOD_ITEM_BY_ID = {};
Object.values(farmCrops).forEach(crop => { FOOD_ITEM_BY_ID[crop.harvestedItem.id] = crop.harvestedItem; });

// Tetos usados só pra recusar valor absurdo num save adulterado (ver
// normalizeLoadedData) — bem acima do que o jogo consegue produzir.
// Teto de nível que um save, mesmo adulterado, pode ter. O jogo normal só
// deixa passar de 100 com o talento único "Rompendo Limites" (ver
// Player.getRequiredXP/TalentService.getMaxLevel) — este aqui é só a rede
// de segurança contra valor absurdo, por isso já nasce no teto expandido.
const MAX_PLAYER_LEVEL = 110;
const MAX_GOLD = 1e12;
const MAX_HP = 1e6;

export default class SaveService {

    static nameOwnerCache = new Map();

    // Conta inteira nesta aba (ver normalizeContainer).
    static container = null;
    // Personagem em jogo nesta aba (1 ou 2).
    static activeSlot = 1;
    // Quantos personagens a conta pode ter agora (ver loadMaxSlots).
    static maxSlots = 1;
    // "savedAt" da versão da nuvem que ESTA sessão leu ou gravou por último.
    // Se a nuvem tiver algo mais novo, quem está gravando é uma sessão
    // antiga e não pode sobrescrever (ver saveToCloud).
    static cloudStamp = null;
    // Gravações na nuvem andam uma por vez, pra uma não ser comparada
    // com a outra antes de terminar.
    static cloudQueue = Promise.resolve();

    /* =====================================================
       SERIALIZAÇÃO (Player -> objeto puro, pronto pra JSON)
    ===================================================== */

    static serialize(player) {

        return {

            version: SAVE_VERSION,
            savedAt: Date.now(),

            classId: player.class.id,
            name: player.name,

            level: player.level,
            gold: player.gold,
            currentXP: player.currentXP,
            currentHP: player.currentHP,
            maxHP: player.maxHP,

            baseStats: player.baseStats,
            balanceVersion: player.balanceVersion ?? CURRENT_BALANCE_VERSION,

            inventory: player.inventory,
            equipment: player.equipment,

            progress: player.progress,

            chest: player.chest,
            album: player.album,
            farm: player.farm,
            petLifeBonusApplied: player.petLifeBonusApplied,
            equipmentLifeBonusApplied: player.equipmentLifeBonusApplied,
            talentApplied: player.talentApplied,

            health: {
                burstMode: player.health.burstMode,
                regenerationPercent: player.health.regenerationPercent,
                regenerationTime: player.health.regenerationTime
            }

        };

    }

    // Confere o mínimo pra saber se é um arquivo de save válido
    // antes de tentar carregar (evita quebrar com arquivo errado).
    static isValidSave(data) {

        if (!data || typeof data !== "object") return false;
        if (!classes[data.classId]) return false;
        if (typeof data.level !== "number") return false;
        if (!Array.isArray(data.inventory)) return false;

        return true;

    }

    // Recria um Player do zero e aplica por cima os dados salvos.
    // Corrige NO LUGAR os valores que nenhum jogo legítimo produz, antes
    // de montar o personagem: o save é um JSON que o jogador consegue
    // editar (localStorage, ou o documento dele na nuvem). Não impede
    // trapaça "plausível" (isso só um servidor valida), mas barra valor
    // quebrado ou absurdo que travaria o jogo ou sujaria o ranking.
    static normalizeLoadedData(data) {

        const number = (value, min, max, fallback) => {
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) return fallback;
            return Math.min(max, Math.max(min, parsed));
        };

        data.level = Math.floor(number(data.level, 1, MAX_PLAYER_LEVEL, 1));
        data.gold = Math.floor(number(data.gold, 0, MAX_GOLD, 0));
        data.currentXP = Math.floor(number(data.currentXP, 0, Number.MAX_SAFE_INTEGER, 0));

        if (data.maxHP !== undefined) data.maxHP = Math.floor(number(data.maxHP, 1, MAX_HP, 100));
        if (data.currentHP !== undefined) data.currentHP = Math.floor(number(data.currentHP, 0, MAX_HP, 1));

        if (data.name !== undefined) data.name = sanitizeText(data.name).trim().slice(0, 30);

        // Álbum: só carta que existe, uma vez cada.
        const validCards = new Set(cards.map(card => card.id));
        data.album = [...new Set(Array.isArray(data.album) ? data.album : [])].filter(id => validCards.has(id));

        if (!Array.isArray(data.inventory)) data.inventory = [];
        data.inventory = data.inventory.filter(item => item && typeof item === "object");

        return data;

    }

    static deserialize(game, data) {

        this.normalizeLoadedData(data);

        const characterClass = classes[data.classId] ?? Object.values(classes)[0];

        const player = new Player(characterClass, data.name);

        player.level = data.level ?? player.level;
        player.gold = data.gold ?? player.gold;
        player.currentXP = data.currentXP ?? player.currentXP;

        // Saves gravados antes do campo balanceVersion existir são
        // sempre da curva original (v1). Se a curva de levels.js mudou
        // desde então, recalcula baseStats/maxHP na curva ATUAL —
        // preservando qualquer bônus que o personagem já tinha ganho
        // além do level up puro (pedra de encantamento, transcendência).
        // Sem isso, um personagem de nível alto salvo antes de um
        // reequilíbrio ficaria PRA SEMPRE com os números antigos, mesmo
        // com o jogo já rebalanceado — só quem começasse do zero sentiria
        // a mudança.
        const savedBalanceVersion = data.balanceVersion ?? 1;
        const savedBaseStats = data.baseStats ?? player.baseStats;
        const savedMaxHP = data.maxHP ?? player.maxHP;

        if (savedBalanceVersion < CURRENT_BALANCE_VERSION) {

            const migrated = StatsMigrationService.migrate(
                characterClass.id,
                player.level,
                savedBaseStats,
                savedMaxHP,
                savedBalanceVersion
            );

            player.baseStats = migrated.baseStats;
            player.maxHP = migrated.maxHP;
            player.currentHP = player.maxHP;
            player.balanceVersion = CURRENT_BALANCE_VERSION;

        } else {

            player.baseStats = savedBaseStats;
            player.maxHP = savedMaxHP;
            player.currentHP = data.currentHP ?? player.currentHP;
            player.balanceVersion = savedBalanceVersion;

        }

        // Rede de segurança independente da migração acima: nenhum
        // atributo-base deveria existir como número negativo — nada no
        // jogo tira pontos deles, só soma. Roda em TODO carregamento
        // (não só quando a migração dispara), pra corrigir sozinho
        // qualquer save que já tenha ficado com um valor negativo
        // gravado (ex: de uma migração anterior), mesmo que o
        // balanceVersion dele já esteja atualizado.
        for (const key of Object.keys(player.baseStats)) {
            player.baseStats[key] = Math.max(0, player.baseStats[key] ?? 0);
        }

        // Quartzo Rosa no Pútrido aprimorava Roubo de Vida (o especial
        // dele estava errado) — agora aprimora Miasma. Nada mais dá Roubo
        // de Vida-base pro Pútrido (nem level up nem transcendência), então
        // tudo que estiver ali veio da pedra e vira Miasma. Idempotente:
        // depois da primeira vez o Roubo de Vida-base já é 0.
        if (characterClass.id === "putrid" && player.baseStats.lifeSteal > 0) {
            player.baseStats.miasmaChance = (player.baseStats.miasmaChance ?? 0) + player.baseStats.lifeSteal;
            player.baseStats.lifeSteal = 0;
        }

        player.inventory = this.refreshFoodItems(this.repairStones(data.inventory ?? []));
        player.equipment = data.equipment ?? player.equipment;
        // Saves de antes do slot de pet existir não têm essa chave —
        // sem isso, `player.equipment.pet` fica undefined em vez de
        // null (funciona igual em todo `if`, mas evita a chave sumir).
        player.equipment.pet ??= null;

        // Arma/armadura guardam uma FOTO dos próprios atributos-base no
        // momento em que foram coletadas (item.baseStats) — se os
        // valores de weapons.js/helmets.js/etc. mudarem depois (ex: esse
        // reequilíbrio movendo Crítico/Roubo de Vida/Penetração/Absorção
        // pra dentro dos itens), um item que o jogador já tinha antes
        // dessa mudança ficaria PRA SEMPRE com os números antigos, só
        // itens NOVOS sairiam com os atuais. Isso re-sincroniza todo
        // item já possuído (mantendo raridade/qualidade/encantamento)
        // com a definição atual do jogo, toda vez que um save é
        // carregado — barato e sempre seguro de repetir.
        this.refreshAllItemStats(player);

        this.upgradeLifeEnchantments(player);

        player.progress = data.progress ?? player.progress;

        // Corrige save de antes do addXP() descartar o que sobra ao bater o
        // teto de nível (ver Player.addXP): se o personagem já está no teto
        // e sobrou XP acumulada, ela nunca mais seria gasta mesmo — descarta
        // aqui, uma vez, pra limpar quem ficou com esse valor preso.
        if (player.level >= TalentService.getMaxLevel(player)) {
            player.currentXP = 0;
        }

        // Saves de antes das conquistas existirem não têm esses dois
        // campos — sem isso, achievements/stats ficariam undefined pro
        // resto da sessão (AchievementService.evaluate() já protege com
        // "?? 0"/"?? []" em cada leitura, mas o registerKill/registerDeath/
        // etc. abaixo escrevem direto em progress.stats.X, então precisa
        // existir o objeto). Preserva qualquer contador que JÁ exista.
        player.progress.achievements ??= [];
        player.progress.stats = {
            killedMonsters: [],
            deaths: 0,
            hospitalHeals: 0,
            goldFromSelling: 0,
            pvpWins: 0,
            enchantStoneFamiliesUsed: [],
            usedLevel3Stone: false,
            eggsHatched: 0,
            petFeedCount: 0,
            seedsPlanted: 0,
            harvests: 0,
            harvestedFoodCount: 0,
            waterCount: 0,
            harvestedWithDrySoil: false,
            harvestedStrawberry: false,
            removedPlantedSeed: false,
            harvestedByCrop: {},
            harvestedCorn: false,
            harvestedPumpkinAtNight: false,
            pestsRemoved: 0,
            ...player.progress.stats
        };

        // Concessão RETROATIVA do ovo do pet gratuito: quem já estava no
        // nível 30+ antes desse sistema existir nunca vai subir aquele
        // nível de novo, então o gancho ao vivo em Player.addXP() nunca
        // dispararia pra esses jogadores — injusto contra quem alcançar
        // o 30 dali pra frente e ganhar automaticamente. Roda uma vez só
        // (mesma flag/mesma regra do addXP()), toda vez que um save é
        // carregado, até pegar todo mundo que já passou do nível.
        if (player.level >= 30 && !player.progress.stats.wolfEggGranted) {

            player.progress.stats.wolfEggGranted = true;

            const eggTemplate = pets.wolfPet1;

            player.addItem({ ...eggTemplate, icon: eggTemplate.image });

        }

        // Re-deriva a transcendência a partir da escolha salva (não guarda
        // o objeto pesado no save, e sempre pega os dados/imagens atuais
        // do upClasse.js, mesmo que ele mude depois).
        //
        // soulChoice sozinho só diz QUAL caminho foi escolhido — o bônus
        // de status em si (já somado em baseStats/maxHP, esses sim salvos
        // normalmente) só existe de verdade se a dungeon correspondente
        // já foi vencida ao menos uma vez.
        if (player.progress.soulChoice) {

            const dungeonId = player.progress.soulChoice === "dark" ? "dark_dungeon" : "light_dungeon";

            if (player.progress.dungeons?.[dungeonId]?.completed) {
                player.transcendence = player.getTranscendenceFor(player.progress.soulChoice);
            }

        }

        // Ajusta a transcendência ao upClasse.js atual (só a diferença).
        player.syncTranscendenceStats();

        // Mesma ideia pro bônus do talento único "Cara ou Coroa?" (ver
        // TalentService.js).
        TalentService.syncCoinFlipBonus(player);

        // Quem ainda estava com um talento único que saiu do jogo (ex:
        // Rei dos Encantamentos) é limpo sozinho aqui — ver
        // TalentService.sanitizeRemovedUniqueTalent.
        TalentService.sanitizeRemovedUniqueTalent(player);

        player.chest = data.chest ?? player.chest;
        player.album = data.album ?? [];
        player.farm = data.farm ?? player.farm;
        player.petLifeBonusApplied = data.petLifeBonusApplied ?? 0;
        player.equipmentLifeBonusApplied = data.equipmentLifeBonusApplied ?? 0;
        player.talentApplied = data.talentApplied ?? { lifeLost: 0, attack: 0, armor: 0, agility: 0 };

        // "Rei dos Encantamentos" deixou de liberar o Amuleto (só o Anel
        // continua) — tira o bônus de todo Amuleto que foi encantado
        // enquanto era permitido. Idempotente: depois da primeira vez não
        // sobra Amuleto encantado. Se saiu Vida, a conversão dos talentos
        // (% da Vida Máxima) é recalculada em cima do novo total.
        if (player.revertAccessoryEnchantments(["amulet"])) {
            TalentService.sync(player);
        }

        // Saves de antes da Anti-Praga existir não têm esses campos —
        // sem isso, applyPestSpawn() trataria "nunca nasceu nenhuma
        // praga ainda" como se lastPestSpawnAt fosse `undefined`, o que
        // já é tratado como "agora" (?? now) então nem precisaria, mas
        // os campos por canteiro (pestAt/pestLostMs) sim, senão
        // getPestLostMs quebraria tentando ler de undefined.
        player.farm.lastPestSpawnAt ??= Date.now();
        player.farm.plots.forEach(plot => {
            plot.pestAt ??= null;
            plot.pestLostMs ??= null;
        });

        if (data.health) {
            player.health.burstMode = data.health.burstMode ?? false;
            player.health.regenerationPercent = data.health.regenerationPercent ?? 1;
            player.health.regenerationTime = data.health.regenerationTime ?? 120000;
            player.health.startRegeneration();
        }

        return player;

    }

    // Recalcula item.baseStats/item.stats de UM item de equipamento a
    // partir da definição atual do jogo (weapons.js/helmets.js/etc.),
    // preservando tudo que é específico DESSE item salvo (raridade,
    // qualidade, encantamentos, uid). Pedra de encantamento e item sem
    // slot (ex: item genérico) não têm baseStats — ficam intocados.
    static refreshItemStats(item) {

        if (!item?.id || !item?.baseStats) return item;

        // Corrige o id ANTES de procurar — ver LEGACY_EQUIPMENT_IDS.
        // Só mexe de verdade uma vez: da segunda chamada em diante o id
        // já salvo é o novo, e o mapa não acha nada pra trocar.
        item.id = LEGACY_EQUIPMENT_IDS[item.id] ?? item.id;

        const canonical = EQUIPMENT_BY_ID[item.id];

        if (!canonical) return item;

        // Nome e ícone também vêm do cadastro atual — item renomeado
        // depois de já estar no save (ex: capacete do Pútrido, que era
        // "Máscara" e virou "Touca") continuava com o nome antigo.
        item.name = canonical.name;
        item.icon = canonical.icon;
        item.baseStats = structuredClone(canonical.stats);

        UpgradeService.applyStats(item);

        return item;

    }

    // Pet salvo antes da trava de nível (PET_MAX_LEVEL) volta pro nível
    // máximo, sem XP sobrando — os atributos dele são sempre calculados
    // a partir do nível, então não precisa de mais nenhum ajuste.
    static clampPetLevel(item) {

        if (item?.type !== "pet" || !item.shocked) return;

        if ((item.level ?? 0) > PET_MAX_LEVEL) {
            item.level = PET_MAX_LEVEL;
            item.xp = 0;
        }

    }

    // O Rubi (pedra de Vida) passou de 7/10/15 pra 50/150/300. O bônus de
    // Vida do encantamento é somado direto na Vida Máxima no momento em
    // que se encanta (Player.applyEnchantment) e a arma só guarda o valor
    // aplicado — então quem encantou antes ficava pra sempre com o
    // antigo. Troca o valor na arma e soma a DIFERENÇA na Vida Máxima.
    // Idempotente: valores antigos e novos não se repetem, então depois
    // da primeira vez não encontra mais nada pra converter.
    // (Arma vendida/descartada depois de encantada não é encontrada —
    // fica com o bônus antigo, não tem como saber que ela existiu.)
    static LIFE_ENCHANT_UPGRADES = { 7: 50, 10: 150, 15: 300 };

    static upgradeLifeEnchantments(player) {

        const weapons = [player.equipment.weapon, ...player.inventory]
            .filter(item => item?.slot === "weapon" && item.enchantments?.life != null);

        let gained = 0;

        weapons.forEach(weapon => {

            const upgraded = this.LIFE_ENCHANT_UPGRADES[weapon.enchantments.life];

            if (upgraded == null) return;

            gained += upgraded - weapon.enchantments.life;
            weapon.enchantments.life = upgraded;

        });

        if (gained > 0) {
            player.maxHP += gained;
            player.currentHP += gained;
        }

    }

    static refreshAllItemStats(player) {

        player.inventory.forEach(item => {
            this.clampPetLevel(item);
            this.refreshItemStats(item);
        });

        Object.values(player.equipment).forEach(item => {
            if (!item) return;
            this.clampPetLevel(item);
            this.refreshItemStats(item);
        });

    }

    // Saves de antes da raridade/descrição existirem nas pedras de
    // encantamento guardaram uma cópia "congelada" sem esses campos —
    // isso reidrata qualquer pedra salva com os dados atuais do jogo
    // (mantendo a quantidade que o jogador já tinha).
    static repairStones(inventory) {

        const stonesById = {};

        Object.values(enchantmentStone).forEach(stone => {
            stonesById[stone.id] = stone;
        });

        return inventory.map(item => {

            const current = stonesById[item.id];

            if (!current) return item;

            return {
                ...current,
                uid: item.uid,
                quantity: item.quantity
            };

        });

    }

    // Alimento de pet (colheita da Fazenda) guarda uma FOTO congelada
    // de petFeedValue/sellValue/etc. no momento em que foi colhido — se
    // farmCrops.js mudar esses números depois (ex: o rebalanceamento
    // que reduziu quanto cada colheita enche de fome/vira XP), um item
    // já colhido antes ficaria PRA SEMPRE com o valor antigo, só
    // colheitas NOVAS sairiam com o atual. Isso re-sincroniza todo
    // alimento já possuído (mantendo uid/quantidade) com a definição
    // atual do jogo, mesmo padrão de refreshAllItemStats pra equipamento.
    static refreshFoodItems(inventory) {

        return inventory.map(item => {

            const current = FOOD_ITEM_BY_ID[item.id];

            if (!current) return item;

            return {
                ...current,
                uid: item.uid,
                quantity: item.quantity
            };

        });

    }

    /* =====================================================
       CONTA (vários personagens)
       Formato da nuvem e do localStorage:
         { version: 2, savedAt, activeSlot,
           account: { album, achievements, stats },   // da conta
           slots: { "1": personagem, "2": personagem } }
       Cartas, conquistas e contadores são da CONTA. Ouro, nível,
       inventário, equipamento, pet, fazenda etc. são de cada personagem.
       Dentro do jogo o Player continua no formato plano de sempre
       (serialize/deserialize) — quem separa e junta é este bloco.
    ===================================================== */

    static emptyAccount() {
        return { album: [], achievements: [], stats: {} };
    }

    static emptyContainer() {
        return {
            version: CONTAINER_VERSION,
            savedAt: Date.now(),
            activeSlot: 1,
            account: this.emptyAccount(),
            slots: {}
        };
    }

    // Aceita o formato novo e o antigo (um personagem só, na raiz).
    static normalizeContainer(raw) {

        if (!raw || typeof raw !== "object") return null;

        if (raw.version === CONTAINER_VERSION && raw.slots && typeof raw.slots === "object") {
            return {
                version: CONTAINER_VERSION,
                savedAt: raw.savedAt ?? Date.now(),
                activeSlot: Number(raw.activeSlot) || 1,
                account: { ...this.emptyAccount(), ...raw.account },
                slots: { ...raw.slots }
            };
        }

        if (!raw.classId) return null;

        // Save antigo: o personagem é o próprio arquivo, cartas e conquistas
        // dentro dele. Vira a conta com o personagem no slot 1.
        const { account, character } = this.splitCharacter(raw);
        const container = this.emptyContainer();

        container.savedAt = raw.savedAt ?? Date.now();
        container.account = account;
        container.slots["1"] = character;

        return container;

    }

    // Separa um personagem (formato plano do serialize) entre o que é da
    // conta e o que é dele.
    static splitCharacter(flat) {

        const { album, progress = {}, ...rest } = flat;
        const { achievements, stats = {}, ...progressRest } = progress;
        const { wolfEggGranted, ...accountStats } = stats;

        return {
            account: {
                album: Array.isArray(album) ? [...album] : [],
                achievements: Array.isArray(achievements) ? [...achievements] : [],
                stats: accountStats
            },
            character: {
                ...rest,
                // O Ovo de Lobo é do personagem: cada um ganha o seu no nível 30.
                wolfEggGranted: wolfEggGranted === true,
                progress: progressRest
            }
        };

    }

    // Monta o formato plano que o deserialize() já entende, a partir de
    // um personagem da conta, com cartas e conquistas vindas da conta.
    static flatCharacter(container, slot) {

        const character = container?.slots?.[slot];

        if (!character) return null;

        const { wolfEggGranted, progress = {}, ...rest } = character;

        return {
            ...rest,
            album: [...(container.account?.album ?? [])],
            progress: {
                ...progress,
                achievements: [...(container.account?.achievements ?? [])],
                stats: {
                    ...(container.account?.stats ?? {}),
                    wolfEggGranted: wolfEggGranted === true
                }
            }
        };

    }

    static hasCharacter(container, slot) {
        return this.isValidSave(this.flatCharacter(container, slot));
    }

    // Primeiro slot livre dentro do limite da conta, ou null se está cheio.
    static pickNewSlot(container = this.container) {

        for (let slot = 1; slot <= this.maxSlots; slot++) {
            if (!this.hasCharacter(container, slot)) return slot;
        }

        return null;

    }

    static useContainer(container) {
        this.container = container ?? null;
    }

    // Personagem recém-criado recebe as cartas e conquistas da conta, senão
    // o próximo save zeraria o que a conta já tinha.
    static attachAccount(player) {

        const account = this.container?.account ?? this.emptyAccount();

        player.album = [...account.album];
        player.progress.achievements = [...account.achievements];
        player.progress.stats = { ...player.progress.stats, ...account.stats };

        return player;

    }

    // Grava o personagem atual no slot ativo e devolve a conta inteira.
    static commit(player) {

        const { account, character } = this.splitCharacter(this.serialize(player));
        const container = this.container ?? this.emptyContainer();

        container.account = account;
        container.slots[this.activeSlot] = character;
        container.activeSlot = this.activeSlot;
        container.savedAt = Date.now();

        this.container = container;

        return container;

    }

    // Quantos personagens a conta pode ter: 1 + slots extras liberados em
    // entitlements/{uid}. Só o servidor (ou você, no console) escreve esse
    // documento — ver firestore.rules.
    static async loadMaxSlots(uid) {

        try {

            const snapshot = await getDoc(doc(firestore, ENTITLEMENTS_COLLECTION, uid));
            const extra = snapshot.exists() ? Number(snapshot.data().extraSlots) : 0;

            this.maxSlots = Math.min(MAX_SLOTS, 1 + Math.max(0, Number.isFinite(extra) ? extra : 0));

        } catch (err) {

            console.warn("Falha ao checar os slots da conta:", err);
            this.maxSlots = 1;

        }

        return this.maxSlots;

    }

    /* =====================================================
       NUVEM (Firestore) — espelha o localStorage quando logado
    ===================================================== */

    // Best-effort: nunca trava o jogo se a rede/o Firestore falhar,
    // o localStorage continua sendo a fonte confiável imediata.
    //
    // Só grava se a nuvem ainda estiver na versão que esta sessão conhece
    // (cloudStamp). Se outra aba/aparelho gravou depois, a gravação daqui
    // é recusada — é o que impede um save antigo de apagar um mais novo.
    static saveToCloud(uid, container) {

        const write = () => this.writeCloud(uid, container);

        this.cloudQueue = this.cloudQueue.then(write, write);

        return this.cloudQueue;

    }

    static async writeCloud(uid, container) {

        const ref = doc(firestore, SAVES_COLLECTION, uid);

        try {

            const written = await runFirestoreTransaction(firestore, async (transaction) => {

                const snapshot = await transaction.get(ref);
                const cloudStamp = snapshot.exists() ? (snapshot.data().savedAt ?? 0) : 0;

                if (cloudStamp > (this.cloudStamp ?? 0)) return false;

                transaction.set(ref, container);

                return true;

            });

            if (!written) {
                console.warn("Save recusado: a nuvem tem uma versão mais nova desta conta.");
                Toast.show("Seu progresso NÃO foi salvo na nuvem: a conta foi aberta em outro lugar. Recarregue a página.");
                return false;
            }

            this.cloudStamp = container.savedAt;

            return true;

        } catch (err) {
            console.warn("Falha ao sincronizar save com a nuvem:", err);
            return false;
        }

    }

    // Devolve a conta no formato novo (ver normalizeContainer) ou null.
    static async loadFromCloud(uid) {

        try {

            const snapshot = await getDoc(doc(firestore, SAVES_COLLECTION, uid));

            if (!snapshot.exists()) return null;

            const raw = snapshot.data();

            // Esta sessão passa a conhecer ESTA versão da nuvem.
            this.cloudStamp = raw.savedAt ?? 0;

            // Conta no formato antigo tinha uma entrada de ranking por conta
            // (id = uid). Agora o ranking é por personagem (id = uid_slot),
            // então a antiga sai aqui.
            if (raw.version !== CONTAINER_VERSION) {
                deleteDoc(doc(firestore, LEADERBOARD_COLLECTION, uid)).catch(() => {});
            }

            return this.normalizeContainer(raw);

        } catch (err) {

            console.warn("Falha ao carregar save da nuvem:", err);
            return null;

        }

    }

    // Coleção separada, indexada pelo nome (minúsculo) do personagem —
    // só guarda quem reservou (uid), nada sensível. É o que permite
    // checar "nome já em uso" contra qualquer conta, não só o save
    // local desta máquina.
    static async isCharacterNameTaken(name) {

        try {

            const snapshot = await getDoc(doc(firestore, CHARACTER_NAMES_COLLECTION, name.trim().toLowerCase()));

            return snapshot.exists();

        } catch (err) {

            console.warn("Falha ao checar nome do personagem:", err);
            return false;

        }

    }

    // Acha um personagem pelo nome: devolve { uid, name, level } ou null
    // se o nome não existe. Usado pelo convite do Cooperativo.
    //
    // Procura no ranking (é de lá que vêm os nomes que o jogador VÊ no
    // jogo), comparando sem diferenciar maiúsculas, espaços nas pontas nem
    // a forma como o acento foi digitado. Um personagem que nunca entrou no
    // ranking não aparece aqui — a coleção de nomes reservados não guarda o
    // nível, então não serve pra checar o nível mínimo do convite.
    static async findCharacterByName(name) {

        const normalize = (text) => String(text ?? "").normalize("NFKC").trim().toLowerCase();
        const wanted = normalize(name);

        if (!wanted) return null;

        const ranked = (await this.getFullLeaderboard()).find(entry => normalize(entry.name) === wanted);

        if (!ranked) return null;

        return { uid: ranked.uid, name: ranked.name, level: ranked.level ?? null };

    }

    // Dono (uid) de um nome reservado, ou null se ninguém reservou.
    // Guarda a resposta enquanto a página está aberta — o chat consulta
    // isso a cada mensagem pra conferir se o nome é mesmo de quem enviou.
    static getCharacterNameOwner(name) {

        const key = String(name ?? "").trim().toLowerCase();

        if (!key || key.includes("/")) return Promise.resolve(null);

        if (!this.nameOwnerCache.has(key)) {

            const lookup = getDoc(doc(firestore, CHARACTER_NAMES_COLLECTION, key))
                .then(snapshot => snapshot.exists() ? (snapshot.data().uid ?? null) : null)
                .catch(() => {
                    // Falha de rede não pode ficar guardada como "sem dono".
                    this.nameOwnerCache.delete(key);
                    return null;
                });

            this.nameOwnerCache.set(key, lookup);

        }

        return this.nameOwnerCache.get(key);

    }

    static async reserveCharacterName(name, uid) {

        try {
            await setDoc(doc(firestore, CHARACTER_NAMES_COLLECTION, name.trim().toLowerCase()), { uid });
        } catch (err) {
            console.warn("Falha ao reservar nome do personagem:", err);
        }

    }

    // Libera o que é SÓ desse personagem (nome reservado + entrada no
    // ranking) — chamado tanto ao excluir um personagem quanto, pra
    // cada slot, ao excluir a conta inteira. As Regras de Segurança só
    // deixam apagar characterNames/leaderboard que sejam SEUS, então
    // chamar isso com um personagem de outra conta simplesmente falha
    // (ignorado — ver catch).
    static async releaseCharacterIdentity(uid, slot, name) {

        const tasks = [
            deleteDoc(doc(firestore, LEADERBOARD_COLLECTION, this.leaderboardId(uid, slot))).catch(() => {})
        ];

        if (name) {
            tasks.push(
                deleteDoc(doc(firestore, CHARACTER_NAMES_COLLECTION, name.trim().toLowerCase())).catch(() => {})
            );
        }

        await Promise.all(tasks);

    }

    // Exclusão TOTAL da conta: todo personagem (todos os slots), o save
    // inteiro e o que é da conta (cartas/conquistas, junto do save).
    // Chamado ANTES de AuthService.deleteCurrentUser() apagar o login em
    // si — nessa ordem porque, depois de apagado o login, as Regras de
    // Segurança (que conferem request.auth.uid) recusam qualquer
    // escrita dessa conta, inclusive um delete. entitlements/{uid} fica
    // órfão de propósito: só o servidor escreve lá (ver firestore.rules),
    // o cliente nunca teve permissão de apagar.
    static async deleteAccountData(uid) {

        const container = this.container ?? await this.loadFromCloud(uid);

        const slots = container?.slots ?? {};

        await Promise.all(
            Object.entries(slots).map(([slot, character]) =>
                this.releaseCharacterIdentity(uid, slot, character?.name)
            )
        );

        await deleteDoc(doc(firestore, SAVES_COLLECTION, uid));

        this.clearLocalSave();

    }

    // Dispara a sincronização em paralelo, sem esperar — só se tiver
    // alguém logado no momento (fora do fluxo de login, save local
    // continua funcionando normalmente sem conta nenhuma).
    // Retorna a promise pra quem PRECISA esperar a nuvem (ex: logout,
    // que limpa o save local logo em seguida).
    static syncCloudIfLoggedIn(player, container) {

        const user = AuthService.getCurrentUser();

        if (!user) return Promise.resolve();

        return Promise.all([
            this.saveToCloud(user.uid, container),
            this.updateLeaderboardEntry(user.uid, player, this.activeSlot)
        ]);

    }

    // Foto do que o jogador tem equipado e dos status finais, pra tela de
    // detalhe do ranking. Só o necessário pra montar os tooltips (nada de
    // inventário, ouro ou progresso) — tudo com null em vez de undefined,
    // porque o Firestore recusa undefined.
    static buildProfileSnapshot(player) {

        const stats = player.stats.getFinalStats();
        const equipment = {};

        ["weapon", "helmet", "chest", "leg", "boot", "ring", "amulet", "pet"].forEach(slot => {
            equipment[slot] = this.compactEquippedItem(player.equipment[slot]);
        });

        return {
            stats: {
                life: player.maxHP,
                attack: stats.attack,
                armor: stats.armor,
                agility: stats.agility,
                criticalChance: stats.criticalChance,
                lifeSteal: stats.lifeSteal,
                penetration: stats.penetration,
                absorption: stats.absorption,
                // Só o Pútrido tem isso > 0 — em qualquer outra classe
                // fica 0 (ver PlayerStats.getFinalStats).
                miasmaChance: stats.miasmaChance,
                // Só o Mímico tem isso > 0 (ver MimicService.js).
                reflection: stats.reflection
            },
            equipment
        };

    }

    static compactEquippedItem(item) {

        if (!item) return null;

        if (item.type === "pet") {

            return {
                type: "pet",
                shocked: item.shocked === true,
                slot: "pet",
                name: item.name,
                image: item.image ?? item.icon ?? null,
                icon: item.icon ?? item.image ?? null,
                stars: item.stars ?? null,
                family: item.family ?? null,
                level: item.level ?? 1,
                xp: 0,
                fome: item.fome ?? 0,
                description: item.description ?? null
            };

        }

        const pickInfo = info => info ? { id: info.id ?? null, name: info.name, color: info.color } : null;

        return {
            id: item.id ?? null,
            type: item.type ?? null,
            slot: item.slot ?? null,
            class: item.class ?? null,
            name: item.name,
            icon: item.icon ?? null,
            rarity: pickInfo(item.rarity),
            quality: pickInfo(item.quality),
            stats: item.stats ? { ...item.stats } : null,
            enchantments: item.enchantments ? { ...item.enchantments } : null
        };

    }

    // Entrada "leve" (sem inventário/progresso) só com o que o ranking
    // precisa mostrar — pública pra qualquer jogador logado poder ler,
    // ao contrário do save completo que é privado do dono.
    // Uma entrada por PERSONAGEM (id = uid_slot): o ranking mostra cada um
    // separado. O uid é a primeira parte do id — as regras só deixam o dono
    // escrever as próprias entradas.
    static leaderboardId(uid, slot) {
        return `${uid}_${slot}`;
    }

    static async updateLeaderboardEntry(uid, player, slot = this.activeSlot) {

        try {

            await setDoc(doc(firestore, LEADERBOARD_COLLECTION, this.leaderboardId(uid, slot)), {
                name: player.name ?? player.class.name,
                level: player.level,
                classId: player.class.id,
                // Título/retrato "reais" pro cabeçalho e pro painel de
                // status do detalhe do ranking — se o jogador já
                // transcendeu (upClasse.js), mostra a classe evoluída
                // (ex: "Mago da Escuridão"); senão, a classe base.
                // Resolvido aqui pra não precisar duplicar a lógica de
                // transcendência (que depende do lado luz/trevas
                // escolhido) no lado de quem só está VENDO o ranking.
                title: player.transcendence?.name ?? player.class.name,
                titleImage: player.transcendence?.image ?? player.class.image,
                power: PowerService.getPower(player),
                ...this.buildProfileSnapshot(player)
            });

        } catch (err) {

            console.warn("Falha ao atualizar o ranking:", err);

        }

    }

    static async getTopLeaderboard(count = 10) {

        try {

            const leaderboardQuery = query(
                collection(firestore, LEADERBOARD_COLLECTION),
                orderBy("power", "desc"),
                limit(count)
            );

            const snapshot = await getDocs(leaderboardQuery);

            // Cada entrada é gravada pelo navegador do próprio jogador —
            // nunca chega crua nas telas (ver MatchSanitizer.js).
            return snapshot.docs.map(entry => sanitizeRemote(entry.data()));

        } catch (err) {

            console.warn("Falha ao carregar o ranking:", err);
            return [];

        }

    }

    // uid de quem está no #1 do servidor AGORA (maior Poder) — usado só
    // pra decidir quem ganha a coroa ao lado do nome no Chat (ver
    // ChatHUD.js). Consulta leve (1 documento), não precisa do resto do
    // perfil que getTopLeaderboard já traria.
    static async getTopPlayerUid() {

        try {

            const topQuery = query(
                collection(firestore, LEADERBOARD_COLLECTION),
                orderBy("power", "desc"),
                limit(1)
            );

            const snapshot = await getDocs(topQuery);

            return snapshot.docs[0]?.id.split("_")[0] ?? null;

        } catch (err) {

            console.warn("Falha ao carregar o topo do ranking:", err);
            return null;

        }

    }

    // Igual getTopLeaderboard, mas sem limite — usado pelo Ranking
    // Global (todos os jogadores do servidor). Mantém o uid (o topo não
    // precisa dele, mas o Global cruza com PresenceService.getOnlineUids()
    // pra saber quem está online).
    static async getFullLeaderboard() {

        try {

            const leaderboardQuery = query(
                collection(firestore, LEADERBOARD_COLLECTION),
                orderBy("power", "desc")
            );

            const snapshot = await getDocs(leaderboardQuery);

            return snapshot.docs.map(entry => ({ ...sanitizeRemote(entry.data()), uid: entry.id.split("_")[0] }));

        } catch (err) {

            console.warn("Falha ao carregar o ranking global:", err);
            return [];

        }

    }

    /* =====================================================
       LOCALSTORAGE
    ===================================================== */

    static persist(container) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(container));
    }

    // Chamado no logout — sem isso, a próxima conta a logar neste
    // navegador puxaria o personagem da conta anterior (e salvar
    // duplicaria ele na conta nova).
    static clearLocalSave() {
        localStorage.removeItem(STORAGE_KEY);
        this.container = null;
        this.activeSlot = 1;
        this.maxSlots = 1;
        this.cloudStamp = null;
    }

    static hasLocalSave() {
        return !!localStorage.getItem(STORAGE_KEY);
    }

    // Devolve a conta (formato novo) ou null. Save antigo é convertido.
    static loadFromLocalStorage() {

        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return null;

        try {
            return this.normalizeContainer(JSON.parse(raw));
        } catch {
            return null;
        }

    }

    /* =====================================================
       AÇÕES DE ALTO NÍVEL
    ===================================================== */

    // Botão "Salvar": grava no localStorage e sincroniza com a conta
    // na nuvem (Firestore) — não gera mais arquivo .txt.
    static save(player) {

        const container = this.commit(player);

        this.persist(container);

        this.syncCloudIfLoggedIn(player, container);

        return container;

    }

    // Save silencioso — nunca baixa arquivo, só atualiza o localStorage.
    // Chamado automaticamente em alguns momentos-chave (sair de uma
    // dungeon, curar na enfermaria, melhorar/encantar um item), pra
    // reduzir o risco de perder progresso se a página for recarregada
    // sem o jogador ter clicado em "Salvar" manualmente.
    static autoSave(player) {

        if (!player) return Promise.resolve();

        try {

            const container = this.commit(player);

            this.persist(container);

            return this.syncCloudIfLoggedIn(player, container);

        } catch (err) {

            console.warn("Falha ao salvar automaticamente:", err);

            return Promise.resolve();

        }

    }

    // Aplica um personagem da conta (por padrão, o ativo) como o jogador
    // atual da partida. Usa a conta já carregada em this.container.
    static applyLoadedData(game, slot = this.activeSlot) {

        const flat = this.flatCharacter(this.container, slot);

        if (!this.isValidSave(flat)) return;

        this.activeSlot = Number(slot);

        // Antes do deserialize() mexer em nada — pra saber se a
        // concessão retroativa do ovo (ver deserialize) é coisa NOVA
        // desse carregamento ou já vinha do save.
        const hadWolfEggAlready = flat.progress.stats.wolfEggGranted === true;

        const player = this.deserialize(game, flat);

        game.player = player;

        // Garante a reserva do nome pra esta conta (personagens antigos
        // podem não ter) — é ela que o chat usa pra reconhecer quem está
        // usando o nome de outro jogador. Se o nome já for de outra conta,
        // as regras do banco recusam e nada muda.
        const user = AuthService.getCurrentUser();
        if (user && player.name) this.reserveCharacterName(player.name, user.uid);

        player.addListener(() => {
            game.hudScreen.updateHUD();
        });

        // Persiste o ESTADO DO PLAYER recém-montado (não o `data` bruto
        // que veio do arquivo/localStorage) — se o deserialize acabou de
        // migrar os status pra uma curva de balanceamento mais nova, é
        // essa versão migrada que precisa ficar salva, não a original.
        this.persist(this.commit(player));

        game.showScreen("hud");

        // A concessão em si já rodou dentro do deserialize() (silenciosa,
        // sem popup de level up já que não é um level up de verdade) —
        // esse Toast só avisa o jogador que ganhou algo novo ao entrar.
        if (!hadWolfEggAlready && player.progress.stats.wolfEggGranted) {
            Toast.show("Você ganhou um Ovo de Lobo!");
        }

    }

}
