import monsters from "./monsters.js";

/*
    Cada monstro do jogo vira uma carta do álbum/bestiário — EXCETO os
    marcados com `excludeFromAlbum: true` (os anjos do final secreto do
    nível 100, que não são sorteáveis no baú nem contam pro álbum).

    A imagem segue o padrão: assets/img/assets/card_album/card_{id}.png
*/
const cards = monsters
    .filter(monster => !monster.excludeFromAlbum)
    .map(monster => ({
        id: monster.id,
        name: monster.name,
        level: monster.level,
        image: `assets/img/assets/card_album/card_${monster.id}.png`
    }));

export default cards;
