import {
    firestore,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    collection,
    getDocs,
    runFirestoreTransaction
} from "./FirebaseService.js";
import AuthService from "./AuthService.js";
import SaveService from "./SaveService.js";
import FarmService from "./FarmService.js";

/* ==========================================================
   VISITA À FAZENDA
   A fazenda de verdade continua no save do dono (player.farm, privado —
   ver firestore.rules/saves). Pra outros jogadores poderem ver e mexer,
   cada personagem logado ESPELHA os 24 canteiros em:

     farms/{uid_slot}/plots/{0..23}   — um documento por canteiro
     farms/{uid_slot}/events/{auto}   — o que cada visitante fez

   O visitante só pode regar, tirar praga e roubar (as regras do
   Firestore travam os campos — ver firestore.rules/farms), e cada ação
   dele deixa um evento. Quando o dono abre a Fazenda, pullAndMerge()
   traz essas mudanças pro save dele, devolve os eventos pro resumo e
   apaga-os.

   O dono só envia os CAMPOS que ele mesmo mudou desde o último envio
   (pushChanged) — senão um save do dono apagaria uma rega/roubo que um
   visitante fez enquanto ele jogava.
========================================================== */

const FARMS_COLLECTION = "farms";

const PLOT_FIELDS = [
    "tilled", "tilledAt", "seedId", "plantedAt", "wateredAt", "growthModifier",
    "pestAt", "pestLostMs", "pestRemovedAt", "stolen", "stolenBy"
];

const NUMBER_FIELDS = ["tilledAt", "plantedAt", "wateredAt", "growthModifier", "pestAt", "pestLostMs", "pestRemovedAt"];

// A lista de fazendas mostra só quem está ACIMA desse nível (a Fazenda
// libera no 30).
const VISIT_MIN_LEVEL = 30;

const VISITOR_TYPES = ["water", "pest", "steal"];

// Cada jogador rouba de no máximo esse tanto de canteiros da MESMA
// fazenda por dia (dia de Brasília, UTC−3) — contador em
// farms/{farmId}/thieves/{uid}. O mesmo número e a mesma conta de dia
// estão em firestore.rules; mudar aqui exige mudar lá também.
const DAILY_STEAL_LIMIT = 12;
const BRASILIA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export default class FarmSyncService {

    // Último estado enviado (ou lido) de cada canteiro, por
    // "farmId:índice" — base do diff de pushChanged.
    static lastPushed = new Map();

    // Fazendas já lidas da nuvem nesta sessão — pushChanged só envia
    // depois disso, senão o primeiro envio (sem base de diff) mandaria o
    // canteiro inteiro e apagaria um roubo/rega que já estava lá.
    static syncedFarms = new Set();

    /* =====================================================
       IDENTIDADE / REFERÊNCIAS
    ===================================================== */

    // Fazenda do personagem ATUAL — null sem conta logada (sem login não
    // existe nuvem, então nem aparece pra visitas).
    static currentFarmId() {
        const user = AuthService.getCurrentUser();
        return user ? `${user.uid}_${SaveService.activeSlot}` : null;
    }

    static plotRef(farmId, index) {
        return doc(firestore, FARMS_COLLECTION, farmId, "plots", String(index));
    }

    static plotsRef(farmId) {
        return collection(firestore, FARMS_COLLECTION, farmId, "plots");
    }

    static eventsRef(farmId) {
        return collection(firestore, FARMS_COLLECTION, farmId, "events");
    }

    static thiefRef(farmId, uid) {
        return doc(firestore, FARMS_COLLECTION, farmId, "thieves", uid);
    }

    /* =====================================================
       LIMITE DIÁRIO DE ROUBO
    ===================================================== */

    static get DAILY_STEAL_LIMIT() {
        return DAILY_STEAL_LIMIT;
    }

    // Número do dia em Brasília (dias desde 1970) — o firestore.rules
    // calcula igual a partir do relógio do servidor.
    static today(now = Date.now()) {
        return Math.floor((now - BRASILIA_OFFSET_MS) / DAY_MS);
    }

    // Quantos canteiros desta fazenda esse jogador já roubou HOJE.
    static stealsTodayFrom(counter, day = this.today()) {
        return counter && counter.day === day ? (Number(counter.count) || 0) : 0;
    }

    static async getStealsToday(farmId) {

        const uid = AuthService.getCurrentUser()?.uid;

        if (!uid) return 0;

        try {
            const snapshot = await getDoc(this.thiefRef(farmId, uid));
            return this.stealsTodayFrom(snapshot.exists() ? snapshot.data() : null);
        } catch (err) {
            console.warn("Falha ao ler o limite de roubo:", err);
            return 0;
        }

    }

    /* =====================================================
       FORMATO
    ===================================================== */

    // Canteiro local → documento (só os campos conhecidos, sem undefined —
    // o Firestore recusa undefined).
    static toCloud(plot) {

        const data = {};

        PLOT_FIELDS.forEach(key => { data[key] = plot?.[key] ?? null; });

        data.tilled = !!plot?.tilled;
        data.stolen = Number(plot?.stolen) || 0;

        return data;

    }

    // Documento vindo do banco (pode ter sido gravado por qualquer
    // navegador) → canteiro com tipos garantidos.
    static fromCloud(data = {}) {

        const plot = { tilled: data.tilled === true };

        NUMBER_FIELDS.forEach(key => {
            const value = Number(data[key]);
            plot[key] = data[key] == null || !Number.isFinite(value) ? null : value;
        });

        plot.seedId = typeof data.seedId === "string" ? data.seedId : null;
        plot.stolen = Math.max(0, Math.min(FarmService.STEAL_AMOUNT, Number(data.stolen) || 0));
        plot.stolenBy = typeof data.stolenBy === "string" ? data.stolenBy.slice(0, 30) : null;

        return plot;

    }

    static emptyPlot() {
        return this.fromCloud({ tilled: false });
    }

    /* =====================================================
       DONO
    ===================================================== */

    // Envia só os campos que mudaram desde o último envio/leitura de
    // cada canteiro. Falha silenciosa (sem nuvem, a fazenda continua
    // funcionando normal pelo save local).
    static async pushChanged(player) {

        const farmId = this.currentFarmId();

        if (!farmId || !player?.farm?.plots || !this.syncedFarms.has(farmId)) return;

        const writes = [];

        player.farm.plots.forEach((plot, index) => {

            const key = `${farmId}:${index}`;
            const next = this.toCloud(plot);
            const previous = this.lastPushed.get(key);

            const changed = previous
                ? Object.fromEntries(PLOT_FIELDS.filter(field => previous[field] !== next[field]).map(field => [field, next[field]]))
                : next;

            if (Object.keys(changed).length === 0) return;

            writes.push(
                setDoc(this.plotRef(farmId, index), changed, { merge: true })
                    .then(() => this.lastPushed.set(key, next))
            );

        });

        const results = await Promise.allSettled(writes);

        if (results.some(result => result.status === "rejected")) {
            console.warn("Falha ao espelhar a fazenda na nuvem:", results.find(r => r.status === "rejected").reason);
        }

    }

    // Chamado quando o dono abre a Fazenda: traz o que visitantes
    // fizeram (rega, praga, roubo) pro save local, espelha o resto e
    // devolve os eventos (já apagados da nuvem) pro modal de resumo.
    static async pullAndMerge(player) {

        const farmId = this.currentFarmId();

        if (!farmId) return { events: [] };

        try {

            const snapshot = await getDocs(this.plotsRef(farmId));

            let changed = false;

            snapshot.forEach(entry => {

                const index = Number(entry.id);
                const local = player.farm.plots[index];

                if (!local) return;

                const cloud = this.fromCloud(entry.data());

                if (this.mergeVisitorChanges(local, cloud)) changed = true;

                // A base do diff passa a ser o que está na nuvem — o
                // pushChanged abaixo manda só o que o local tem diferente.
                this.lastPushed.set(`${farmId}:${index}`, this.toCloud(cloud));

            });

            if (changed) {
                player.notify();
                SaveService.autoSave(player);
            }

            this.syncedFarms.add(farmId);

            await this.pushChanged(player);

            return { events: await this.takeEvents(farmId) };

        } catch (err) {

            console.warn("Falha ao sincronizar a fazenda:", err);
            return { events: [] };

        }

    }

    // Aplica no canteiro local o que um visitante mudou na nuvem. Rega
    // vale sempre (é da terra); praga e roubo só se a nuvem ainda fala do
    // MESMO plantio (mesma semente e mesmo horário de plantio).
    static mergeVisitorChanges(local, cloud) {

        let changed = false;

        if (local.tilled && cloud.wateredAt && cloud.wateredAt > (local.wateredAt ?? 0)) {
            local.wateredAt = cloud.wateredAt;
            changed = true;
        }

        const samePlanting = !!local.seedId
            && cloud.seedId === local.seedId
            && cloud.plantedAt === local.plantedAt;

        if (!samePlanting) return changed;

        if (local.pestAt && !cloud.pestAt && cloud.pestRemovedAt && cloud.pestRemovedAt >= local.pestAt) {
            local.pestAt = null;
            local.pestLostMs = Math.max(local.pestLostMs ?? 0, cloud.pestLostMs ?? 0);
            local.pestRemovedAt = cloud.pestRemovedAt;
            changed = true;
        }

        if (cloud.stolen > (local.stolen ?? 0)) {
            local.stolen = cloud.stolen;
            local.stolenBy = cloud.stolenBy;
            changed = true;
        }

        return changed;

    }

    // Antes do dono colher: numa transação, lê o canteiro na nuvem (pega
    // um roubo que aconteceu depois da última sincronização) e já grava
    // ele vazio — a partir daí nenhum visitante consegue roubar dele (as
    // regras exigem semente plantada). Sem nuvem, não faz nada e a
    // colheita segue só pelo save local.
    static async claimHarvest(player, index) {

        const farmId = this.currentFarmId();

        if (!farmId) return;

        const local = player.farm.plots[index];
        const ref = this.plotRef(farmId, index);

        try {

            await runFirestoreTransaction(firestore, async (transaction) => {

                const snapshot = await transaction.get(ref);

                if (snapshot.exists()) this.mergeVisitorChanges(local, this.fromCloud(snapshot.data()));

                transaction.set(ref, {
                    seedId: null,
                    plantedAt: null,
                    growthModifier: null,
                    pestAt: null,
                    pestLostMs: null,
                    stolen: 0,
                    stolenBy: null
                }, { merge: true });

            });

        } catch (err) {

            console.warn("Falha ao confirmar a colheita na nuvem:", err);

        }

    }

    // Lê e apaga os eventos dos visitantes (mais antigos primeiro).
    static async takeEvents(farmId) {

        const snapshot = await getDocs(this.eventsRef(farmId));

        const events = snapshot.docs
            .map(entry => ({ ref: entry.ref, ...this.sanitizeEvent(entry.data()) }))
            .filter(event => VISITOR_TYPES.includes(event.type))
            .sort((a, b) => a.at - b.at);

        await Promise.allSettled(snapshot.docs.map(entry => deleteDoc(entry.ref)));

        return events.map(({ ref, ...event }) => event);

    }

    static sanitizeEvent(data = {}) {
        return {
            type: String(data.type ?? ""),
            visitorName: String(data.visitorName ?? "Alguém").slice(0, 30),
            plotIndex: Number(data.plotIndex) || 0,
            cropName: data.cropName ? String(data.cropName).slice(0, 30) : null,
            amount: Number(data.amount) || 0,
            at: Number(data.at) || 0
        };
    }

    /* =====================================================
       VISITANTE
    ===================================================== */

    // Jogadores do Ranking Global acima do nível 30, sem nenhum
    // personagem da própria conta (roubar de si mesmo não faz sentido).
    static async getVisitableFarms() {

        const myUid = AuthService.getCurrentUser()?.uid;

        if (!myUid) return [];

        const entries = await SaveService.getFullLeaderboard();

        return entries
            .filter(entry => (Number(entry.level) || 0) > VISIT_MIN_LEVEL && entry.uid && entry.uid !== myUid)
            .map(entry => ({
                farmId: `${entry.uid}_${entry.slot}`,
                name: entry.name,
                level: Number(entry.level) || 0
            }))
            .sort((a, b) => b.level - a.level || String(a.name).localeCompare(String(b.name)));

    }

    // Os 24 canteiros da fazenda de outro jogador — null se ele ainda não
    // espelhou a fazenda (não abriu o jogo logado desde a atualização).
    static async loadFarm(farmId) {

        const snapshot = await getDocs(this.plotsRef(farmId));

        if (snapshot.empty) return null;

        const plots = Array.from({ length: FarmService.PLOT_COUNT }, () => this.emptyPlot());

        snapshot.forEach(entry => {
            const index = Number(entry.id);
            if (index >= 0 && index < plots.length) plots[index] = this.fromCloud(entry.data());
        });

        return plots;

    }

    // Regar ("water"), tirar praga ("pest") ou roubar ("steal") um
    // canteiro da fazenda de outro jogador. Transação: dois visitantes ao
    // mesmo tempo nunca roubam a mesma planta. Devolve
    // { ok, message, plot (estado novo), crop (só no roubo) }.
    static async visitorAction(farmId, index, type, visitorName) {

        const visitorUid = AuthService.getCurrentUser()?.uid;

        if (!visitorUid) return { ok: false, message: "Entre com sua conta pra visitar fazendas." };

        const ref = this.plotRef(farmId, index);
        const thiefRef = this.thiefRef(farmId, visitorUid);

        try {

            return await runFirestoreTransaction(firestore, async (transaction) => {

                // Todas as leituras antes de qualquer escrita (regra das
                // transações do Firestore).
                const snapshot = await transaction.get(ref);
                const thiefSnapshot = type === "steal" ? await transaction.get(thiefRef) : null;

                if (!snapshot.exists()) return { ok: false, message: "Isso não pode ser feito!" };

                const plot = this.fromCloud(snapshot.data());
                const crop = plot.seedId ? FarmService.getCrop(plot.seedId) : null;
                const now = Date.now();
                const day = this.today(now);
                const stealsToday = thiefSnapshot
                    ? this.stealsTodayFrom(thiefSnapshot.exists() ? thiefSnapshot.data() : null, day)
                    : null;

                let update;
                let message;

                if (type === "water") {

                    const moisture = FarmService.getMoistureState(plot);

                    if (moisture !== "normal" && moisture !== "dry") {
                        return { ok: false, message: "Essa terra não pode ser molhada.", plot };
                    }

                    update = { wateredAt: now };
                    message = "Você regou a plantação!";

                } else if (type === "pest") {

                    if (!plot.pestAt) return { ok: false, message: "Só funciona em pragas!", plot };

                    update = {
                        pestLostMs: FarmService.pestLostAfterRemoval(plot, now),
                        pestAt: null,
                        pestRemovedAt: now
                    };
                    message = "Você eliminou as Pragas!";

                } else if (type === "steal") {

                    if (!crop) return { ok: false, message: "Não tem nada plantado aqui.", plot };

                    if (!FarmService.isReadyToHarvest(plot)) {
                        return { ok: false, message: "Ainda não está pronto, aguarde mais um tempo!", plot };
                    }

                    if (plot.stolen > 0) return { ok: false, message: "Esse alimento já foi roubado!", plot, stealsToday };

                    if (stealsToday >= DAILY_STEAL_LIMIT) {
                        return {
                            ok: false,
                            message: `Você já roubou ${DAILY_STEAL_LIMIT} canteiros desta fazenda hoje. Volte amanhã!`,
                            plot,
                            stealsToday
                        };
                    }

                    update = { stolen: FarmService.STEAL_AMOUNT, stolenBy: String(visitorName ?? "Alguém").slice(0, 30) };
                    message = `Você roubou ${FarmService.STEAL_AMOUNT} ${crop.name}!`;

                    // +1 no contador do dia, na MESMA transação do roubo —
                    // a regra do Firestore só aceita os dois juntos.
                    transaction.set(thiefRef, { day, count: stealsToday + 1 });

                } else {

                    return { ok: false, message: "Isso não pode ser feito!" };

                }

                transaction.update(ref, update);

                transaction.set(doc(this.eventsRef(farmId)), {
                    type,
                    visitorUid,
                    visitorName: String(visitorName ?? "Alguém").slice(0, 30),
                    plotIndex: index,
                    cropName: crop?.name ?? null,
                    amount: type === "steal" ? FarmService.STEAL_AMOUNT : 0,
                    at: now
                });

                return {
                    ok: true,
                    message,
                    plot: { ...plot, ...update },
                    crop: type === "steal" ? crop : null,
                    stealsToday: type === "steal" ? stealsToday + 1 : null
                };

            });

        } catch (err) {

            console.warn("Falha na ação de visita:", err);
            return { ok: false, message: "Não foi possível falar com o servidor. Tente de novo." };

        }

    }

}
