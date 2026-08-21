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
        name: 'Colecionador René Doscards',
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
