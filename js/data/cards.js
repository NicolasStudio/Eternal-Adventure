import monsters from "./monsters.js";

/*
    Cada monstro do jogo vira uma carta do álbum/bestiário.
    A imagem segue o padrão: assets/img/assets/card_album/card_{id}.png

    Ainda não existe arte pra todos os monstros (só wolf, boar e
    threeWolf por enquanto) — os demais vão aparecer com a imagem
    quebrada até a arte ser adicionada, mas o card já funciona
    normalmente (sorteio, registro no álbum, etc).
*/
const cards = monsters.map(monster => ({
    id: monster.id,
    name: monster.name,
    level: monster.level,
    image: `assets/img/assets/card_album/card_${monster.id}.png`
}));

export default cards;
