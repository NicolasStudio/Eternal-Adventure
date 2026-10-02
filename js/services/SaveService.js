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
import pets from "../data/pet.js";
import farmCrops from "../data/farmCrops.js";
import Toast from "../ui/components/Toast.js";
import AuthService from "./AuthService.js";
import PowerService from "./PowerService.js";
import { PET_MAX_LEVEL } from "../data/levelsPet.js";
import { firestore, doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from "./FirebaseService.js";

const STORAGE_KEY = "eternal-adventure-save";
const SAVE_VERSION = 1;
const SAVES_COLLECTION = "saves";
const CHARACTER_NAMES_COLLECTION = "characterNames";
const LEADERBOARD_COLLECTION = "leaderboard";

// Todo item de equipamento conhecido, indexado por id — usado só pra
// "refrescar" itens salvos (ver refreshItemStats), nunca alterado.
const EQUIPMENT_BY_ID = {};
[weapons, helmets, chests, legs, boots].forEach(pool => {
    Object.values(pool).forEach(item => { EQUIPMENT_BY_ID[item.id] = item; });
});

// Todo alimento de pet (colheita da Fazenda) conhecido, indexado por
// id — usado só pra "refrescar" os já colhidos (ver refreshFoodItems),
// nunca alterado.
const FOOD_ITEM_BY_ID = {};
Object.values(farmCrops).forEach(crop => { FOOD_ITEM_BY_ID[crop.harvestedItem.id] = crop.harvestedItem; });

export default class SaveService {

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
    static deserialize(game, data) {

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

        player.chest = data.chest ?? player.chest;
        player.album = data.album ?? [];
        player.farm = data.farm ?? player.farm;
        player.petLifeBonusApplied = data.petLifeBonusApplied ?? 0;

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
       NUVEM (Firestore) — espelha o localStorage quando logado
    ===================================================== */

    // Best-effort: nunca trava o jogo se a rede/o Firestore falhar,
    // o localStorage continua sendo a fonte confiável imediata.
    static async saveToCloud(uid, data) {

        try {
            await setDoc(doc(firestore, SAVES_COLLECTION, uid), data);
        } catch (err) {
            console.warn("Falha ao sincronizar save com a nuvem:", err);
        }

    }

    static async loadFromCloud(uid) {

        try {

            const snapshot = await getDoc(doc(firestore, SAVES_COLLECTION, uid));

            return snapshot.exists() ? snapshot.data() : null;

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

    static async reserveCharacterName(name, uid) {

        try {
            await setDoc(doc(firestore, CHARACTER_NAMES_COLLECTION, name.trim().toLowerCase()), { uid });
        } catch (err) {
            console.warn("Falha ao reservar nome do personagem:", err);
        }

    }

    // Dispara a sincronização em paralelo, sem esperar — só se tiver
    // alguém logado no momento (fora do fluxo de login, save local
    // continua funcionando normalmente sem conta nenhuma).
    // Retorna a promise pra quem PRECISA esperar a nuvem (ex: logout,
    // que limpa o save local logo em seguida).
    static syncCloudIfLoggedIn(player, data) {

        const user = AuthService.getCurrentUser();

        if (!user) return Promise.resolve();

        return Promise.all([
            this.saveToCloud(user.uid, data),
            this.updateLeaderboardEntry(user.uid, player)
        ]);

    }

    // Foto do que o jogador tem equipado e dos status finais, pra tela de
    // detalhe do ranking. Só o necessário pra montar os tooltips (nada de
    // inventário, ouro ou progresso) — tudo com null em vez de undefined,
    // porque o Firestore recusa undefined.
    static buildProfileSnapshot(player) {

        const stats = player.stats.getFinalStats();
        const equipment = {};

        ["weapon", "helmet", "chest", "leg", "boot", "pet"].forEach(slot => {
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
    static async updateLeaderboardEntry(uid, player) {

        try {

            await setDoc(doc(firestore, LEADERBOARD_COLLECTION, uid), {
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

            return snapshot.docs.map(entry => entry.data());

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

            return snapshot.docs[0]?.id ?? null;

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

            return snapshot.docs.map(entry => ({ uid: entry.id, ...entry.data() }));

        } catch (err) {

            console.warn("Falha ao carregar o ranking global:", err);
            return [];

        }

    }

    /* =====================================================
       LOCALSTORAGE
    ===================================================== */

    static persist(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // Chamado no logout — sem isso, a próxima conta a logar neste
    // navegador puxaria o personagem da conta anterior (e salvar
    // duplicaria ele na conta nova).
    static clearLocalSave() {
        localStorage.removeItem(STORAGE_KEY);
    }

    static hasLocalSave() {
        return !!localStorage.getItem(STORAGE_KEY);
    }

    static loadFromLocalStorage() {

        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return null;

        try {
            return JSON.parse(raw);
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

        const data = this.serialize(player);

        this.persist(data);

        this.syncCloudIfLoggedIn(player, data);

        return data;

    }

    // Save silencioso — nunca baixa arquivo, só atualiza o localStorage.
    // Chamado automaticamente em alguns momentos-chave (sair de uma
    // dungeon, curar na enfermaria, melhorar/encantar um item), pra
    // reduzir o risco de perder progresso se a página for recarregada
    // sem o jogador ter clicado em "Salvar" manualmente.
    static autoSave(player) {

        if (!player) return Promise.resolve();

        try {

            const data = this.serialize(player);

            this.persist(data);

            return this.syncCloudIfLoggedIn(player, data);

        } catch (err) {

            console.warn("Falha ao salvar automaticamente:", err);

            return Promise.resolve();

        }

    }

    // Aplica um save (do localStorage ou de um arquivo carregado)
    // como o jogador atual da partida.
    static applyLoadedData(game, data) {

        // Antes do deserialize() mexer em nada — pra saber se a
        // concessão retroativa do ovo (ver deserialize) é coisa NOVA
        // desse carregamento ou já vinha do save.
        const hadWolfEggAlready = data?.progress?.stats?.wolfEggGranted === true;

        const player = this.deserialize(game, data);

        game.player = player;

        player.addListener(() => {
            game.hudScreen.updateHUD();
        });

        // Persiste o ESTADO DO PLAYER recém-montado (não o `data` bruto
        // que veio do arquivo/localStorage) — se o deserialize acabou de
        // migrar os status pra uma curva de balanceamento mais nova, é
        // essa versão migrada que precisa ficar salva, não a original.
        this.persist(this.serialize(player));

        game.showScreen("hud");

        // A concessão em si já rodou dentro do deserialize() (silenciosa,
        // sem popup de level up já que não é um level up de verdade) —
        // esse Toast só avisa o jogador que ganhou algo novo ao entrar.
        if (!hadWolfEggAlready && player.progress.stats.wolfEggGranted) {
            Toast.show("Você ganhou um Ovo de Lobo!");
        }

    }

}
