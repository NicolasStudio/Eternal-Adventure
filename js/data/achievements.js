// O `id` de cada conquista é usado como CHAVE em AchievementService.js
// (é lá que mora a lógica de quando ela desbloqueia) — por isso os ids
// aqui são semânticos (descrevem O QUE a conquista é), não numeração
// sequencial tipo "conquest_01, conquest_02...". Pode reordenar,
// renomear o `name`/`description`, mudar o ícone à vontade — só NÃO
// mude o `id` de uma conquista já existente sem atualizar o id
// correspondente em AchievementService.js também, senão a lógica de
// uma conquista passa a valer pra outra (foi exatamente esse bug que
// a numeração sequencial antiga causou quando a ordem mudou).
const achievements = [
    // Kills
    {
        id: 'kill_1',
        name: 'Primeira Kill',
        description: 'Mate a primeira criatura',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'kill_10',
        name: 'Aventureiro Aprendiz',
        description: 'Mate 10 criaturas diferentes',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'kill_25',
        name: 'Jovem Aventureiro',
        description: 'Mate 25 criaturas diferentes',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'kill_50',
        name: 'Aventureiro Experiente',
        description: 'Mate 50 criaturas diferentes',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'kill_75',
        name: 'Mestre Aventureiro',
        description: 'Mate 75 criaturas diferentes',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'kill_99',
        name: 'Caçador de Monstros',
        description: 'Mate 99 criaturas diferentes',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'kill_all',
        name: 'Por mil caralhos',
        description: 'Mate a última criatura!',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Mortes
    {
        id: 'death_1',
        name: 'Primeira Morte',
        description: 'Morra 1 vez',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'death_10',
        name: 'Não está fácil pra ninguém',
        description: 'Morra 10 vezes',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'death_30',
        name: 'Isso é sério???',
        description: 'Morra 30 vezes',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Níveis
    {
        id: 'level_5',
        name: 'Level 5',
        description: 'Atinja lv 5',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'level_20',
        name: 'Level 20',
        description: 'Atinja lv 20',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'level_30',
        name: 'Level 30',
        description: 'Atinja lv 30',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'level_50',
        name: 'Level 50',
        description: 'Atinja lv 50',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'level_70',
        name: 'Level 70',
        description: 'Atinja lv 70',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'level_100',
        name: 'Level 100',
        description: 'Atinja lv 100',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Pet
    {
        id: 'egg_hatch_1',
        name: 'Quem nasceu primeiro?',
        description: 'Choque seu primeiro ovo!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'egg_hatch_5',
        name: 'Filho de chocadeira',
        description: 'Choque 5 ovos!',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'pet_hunger_zero',
        name: 'Jejum intermitente?',
        description: 'Fique com 0 de fome!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'pet_feed_first',
        name: 'De grão em grão...',
        description: 'Alimente-se',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'pet_level_up',
        name: 'Fase de crescimento',
        description: 'Ganhe um nível com seu PET.',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'pet_level_18',
        name: 'Nossas crianças crescem tão rápido...',
        description: 'Atinja nível 18 com seu PET.',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'pet_level_32',
        name: 'De repente 30...',
        description: 'Atinja nível 32 com seu PET.',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'pet_5_stars',
        name: 'Aclamado pela crítica',
        description: 'Consiga um PET 5 estrelas',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Fazenda
    {
        id: 'farm_till_first',
        name: 'Fazendeiro',
        description: 'Libere seu primeiro terreno',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_till_all',
        name: 'Arador do ano',
        description: 'Libere todos os terrenos',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_seed_first',
        name: 'Cultivador',
        description: 'Plante sua primeira semente',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_seed_100',
        name: 'Máquina de Plantio',
        description: 'Plante 100 sementes',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_first',
        name: 'Coletor',
        description: 'Colha seu primeiro alimento.',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_1000',
        name: 'Quase uma colheitadeira',
        description: 'Adquira 1000 alimentos colhidos.',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_water_50',
        name: 'Seria bom se chovesse...',
        description: 'Regue a plantação 50 vezes.',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_dry_soil',
        name: 'Isso não é um Cacto',
        description: 'Colha um alimento com o solo árido.',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_strawberry',
        name: 'Morango do nordeste',
        description: 'Colha uma plantação de morango',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_miss_click',
        name: 'Miss Click',
        description: 'Are uma terra que já foi semeada.',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_corn_first',
        name: 'Mió',
        description: 'Colha uma plantação inteira de milho',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_corn_1000',
        name: 'Pop corn, ice cream',
        description: 'Colha 1000 milhos',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_wheat_1000',
        name: 'Intrigado',
        description: 'Colha 1000 trigos',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_onion_1000',
        name: 'Seu-Bolinha',
        description: 'Colha 1000 cebolas',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_pumpkin_night',
        name: 'Gostosuras e travessuras',
        description: 'Colha uma abóbora durante a noite',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_harvest_pumpkin_1000',
        name: 'Abrobra',
        description: 'Colha 1000 Abóboras',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_food_collection',
        name: 'Quitandinha',
        description: 'Tenha ao menos um de cada alimento',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'farm_pest_100',
        name: '8ª Praga do Egito',
        description: 'Elimine 100 pestes',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Itens equipados
    {
        id: 'equip_common',
        name: 'Me sinto protegido',
        description: 'Equipe todos os itens de classe: Comum',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'equip_rare',
        name: 'Me sinto seguro!',
        description: 'Equipe todos os itens de classe: Raro',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'equip_mystic',
        name: 'Apesar da cor, me sinto seguro',
        description: 'Equipe todos os itens de classe: Mistico',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'equip_legendary',
        name: 'O Cintilante',
        description: 'Equipe todos os itens de classe: Lendário',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Fortificação
    {
        id: 'upgrade_first',
        name: 'Me sinto mais forte I',
        description: 'Melhore seu primeiro equipamento!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'upgrade_exceptional',
        name: 'Me sinto mais forte II',
        description: 'Melhore seu primeiro equipamento para Excepcional',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Encantamento
    {
        id: 'enchant_first',
        name: 'Vodu é pra jacu!',
        description: 'Encante seu primeiro equipamento!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'enchant_all_families',
        name: 'Isso é possível?',
        description: 'Encante seu equipamento com cada pedra!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'enchant_level3',
        name: 'Rei Alquimista',
        description: 'Encante seu equipamento com pedras nível 3',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Enfermaria
    {
        id: 'hospital_100',
        name: 'Você vem sempre aqui?',
        description: 'Cure 100 vezes na enfermagem!',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Loja
    {
        id: 'sell_100k',
        name: 'Capitalista',
        description: 'Consiga 100.000 em EACoins vendendo itens!',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Dungeon
    {
        id: 'dungeons_maxed',
        name: 'Killer Perfeito',
        description: 'Atinja o mínimo de conclusões experado nas dungeons!', // 3/3 em cada
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Configurações
    {
        id: 'silence',
        name: 'Disse algo?',
        description: 'Shiii, faça silêncio...',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Álbum
    {
        id: 'album_1',
        name: 'Primeira Figurinha',
        description: 'Colete seu primeiro card!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'album_10',
        name: 'Colecionador Iniciante',
        description: 'Colete 10 cards!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'album_25',
        name: 'Colecionador Amador',
        description: 'Colete 25 cards!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'album_50',
        name: 'Colecionador Intermediário',
        description: 'Colete 50 cards!',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'album_75',
        name: 'Colecionador Avançado',
        description: 'Colete 75 cards!',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'album_100',
        name: 'Colecionador René DosCards',
        description: 'Colete 100 cards!',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // PVP
    {
        id: 'pvp_first_win',
        name: 'O pai ta on!',
        description: 'Vença seu primeiro combate pvp!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Cooperativo (dragões)
    {
        id: 'dragon_first',
        name: 'Não seria "Como treinar seu dragão?"',
        description: 'Derrote seu primeiro dragão.',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'dragon_all',
        name: 'Caçador de Dragões',
        description: 'Derrote todos dragões existentes',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Transcendência
    {
        id: 'class_transcendence',
        name: "Oto patamá",
        description: 'Melhore sua classe',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Fim
    {
        id: 'the_end',
        name: 'O FIM?',
        description: 'Colete todas as cartas, atinja a pontuação minima e esteja lv 100!',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },

];

export default achievements;
