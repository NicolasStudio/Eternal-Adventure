import monsters from "../data/monsters.js";
import CombatEngine from "../combat/CombatEngine.js";
import LootSystem from "../combat/LootSystem.js";

/*
    Simula uma dungeon inteira de uma vez, andar por andar, usando o
    MESMO motor de combate (CombatEngine) e o MESMO sistema de loot
    (LootSystem) do jogo normal — não é sorte "fake", é o combate de
    verdade rodando sem as animações/esperas entre golpes.

    Se o jogador perder num andar, a simulação para ali (igual
    aconteceria jogando manualmente): fica com o que já ganhou nos
    andares anteriores, mas não conclui a dungeon nem chega no final.

    Nunca é chamado pra dungeons de chefe (fights === 1) — isso é
    responsabilidade de quem chama (DungeonView), via player.canSkipDungeon().
*/
export default class DungeonSkipService {

    static run(player, dungeon) {

        const result = {
            success: false,
            floorReached: 0,
            totalFloors: dungeon.fights,
            xp: 0,
            gold: 0,
            items: [],
            levelUps: [],
            diedTo: null
        };

        for (let floor = 1; floor <= dungeon.fights; floor++) {

            const monsterId = dungeon.monsters[floor - 1];
            const template = monsters.find(m => m.id === monsterId);

            if (!template) continue;

            const monster = structuredClone(template);
            monster.status.vidaAtual = monster.status.vidaMaxima;

            const engine = new CombatEngine(player, monster);
            engine.currentTurn = engine.rollInitiative();

            // O dano mínimo é sempre 1 (garantido pelo CombatEngine), então
            // a vida de um dos dois lados SEMPRE cai a cada turno — o loop
            // não tem como travar infinitamente.
            let state = engine.checkCombatState();
            while (!state.finished) {
                engine.attack();
                engine.nextTurn();
                state = engine.checkCombatState();
            }

            if (state.winner !== "player") {
                result.floorReached = floor - 1;
                result.diedTo = monster.name;
                // Só pra alimentar as conquistas de morte (ver
                // AchievementService) — notify() explícito porque nada
                // mais muda no player nesse ramo.
                player.registerDeath();
                player.notify();
                return result;
            }

            // Idem, mas de kill — collectReward() logo abaixo já chama
            // notify() sozinho (soma XP/ouro), então não precisa repetir aqui.
            player.registerKill(monster.id);

            const reward = LootSystem.generate(monster, player);

            result.xp += reward.xp;
            result.gold += reward.gold;
            result.items.push(...reward.items);

            const levelUps = player.collectReward(reward);
            result.levelUps.push(...levelUps);

            result.floorReached = floor;

        }

        result.success = true;

        player.completeDungeon(dungeon.id);

        return result;

    }

}
