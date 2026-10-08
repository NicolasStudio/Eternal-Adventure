/* ==========================================================
   LIMPEZA DO QUE VEM DE OUTROS JOGADORES
   Fila, partida, convite (PVP e Cooperativo) e a entrada do ranking
   são gravados no banco pelo navegador de OUTRO jogador — nome, imagem, nível etc. podem vir
   adulterados. As telas montam HTML com esses valores, então tudo que
   sai do banco passa por aqui ANTES de chegar nelas: texto perde os
   caracteres de HTML, imagem só vale se for um arquivo do próprio
   jogo, e o que deveria ser número vira número.

   Roda igual em todos os clientes — a luta é simulada em cada
   navegador (ver PvpCombatService/RaidCombatService) e precisa partir
   dos mesmos dados em todos.
========================================================== */

const MAX_TEXT_LENGTH = 60;

// Chave de objeto (id de jogador/partida, nome de campo): o banco
// aceita aspas e < > numa chave, e várias viram atributo HTML.
const SAFE_KEY = /^[A-Za-z0-9_-]{1,80}$/;

// Só imagem servida pelo próprio jogo.
const SAFE_IMAGE = /^assets\/img\/[A-Za-z0-9_\-./]+\.(png|jpe?g|webp|gif)$/;

const IMAGE_KEYS = new Set(["image", "hud", "icon", "titleImage"]);

// Campos que as telas e a simulação tratam como número.
const NUMBER_KEYS = new Set([
    "level", "power", "simVersion", "seat", "joinedAt", "createdAt", "sentAt",
    "seed", "floor", "waitFloor", "count", "proceedShort",
    "maxHP", "currentHP", "attack", "armor", "agility",
    "criticalChance", "lifeSteal", "penetration", "absorption",
    "miasmaChance", "reflection",
    "petBiteDamage", "petHealAmount", "petMimicRatio", "petBurnDamage",
    "petRevivePercent"
]);

// Mapas { [idDoJogador]: número } — o valor é número mesmo com a chave
// sendo um id.
const NUMBER_MAP_KEYS = new Set(["hp"]);

function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

export function sanitizeText(value) {
    return String(value ?? "")
        .replace(/[<>&"'`\u0000-\u001f\u007f]/g, "")
        .slice(0, MAX_TEXT_LENGTH);
}

function sanitizeImage(value) {
    const path = String(value ?? "");
    return SAFE_IMAGE.test(path) && !path.includes("..") ? path : "";
}

// Limpa qualquer valor vindo do banco, descendo em objetos. `key` é o
// nome do campo (decide a regra) e `parentKey` o do objeto que o contém.
export function sanitizeRemote(value, key = "", parentKey = "") {

    if (value === null || value === undefined) return null;

    if (NUMBER_KEYS.has(key) || NUMBER_MAP_KEYS.has(parentKey)) return toNumber(value);

    if (typeof value === "number") return Number.isFinite(value) ? value : 0;

    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
        return IMAGE_KEYS.has(key) ? sanitizeImage(value) : sanitizeText(value);
    }

    if (Array.isArray(value)) {
        return value
            .map(item => sanitizeRemote(item, key, parentKey))
            .filter(item => item !== null);
    }

    if (typeof value === "object") {

        const clean = {};

        for (const [childKey, childValue] of Object.entries(value)) {

            if (!SAFE_KEY.test(childKey)) continue;

            const child = sanitizeRemote(childValue, childKey, key);

            if (child !== null) clean[childKey] = child;

        }

        return clean;

    }

    return null;

}
