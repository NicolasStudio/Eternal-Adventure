const achievements = [
    // Kills
    {
        id: 'conquest_01',
        name: 'Primeira Kill',
        description: 'Mate a primeira criatura',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_02',
        name: 'Aventureiro Aprendiz',
        description: 'Mate 10 criaturas diferentes',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_03',
        name: 'Jovem Aventureiro',
        description: 'Mate 25 criaturas diferentes',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_04',
        name: 'Aventureiro Experiente',
        description: 'Mate 50 criaturas diferentes',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_05',
        name: 'Mestre Aventureiro',
        description: 'Mate 75 criaturas diferentes',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_06',
        name: 'Caçador de Monstros',
        description: 'Mate 99 criaturas diferentes',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_07',
        name: 'Por mil caralhos',
        description: 'Mate a última criatura!',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Mortes
    {
        id: 'conquest_08',
        name: 'Primeira Morte',
        description: 'Morra 1 vez',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_09',
        name: 'Não está fácil pra ninguém',
        description: 'Morra 10 vezes',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_10',
        name: 'Isso é sério???',
        description: 'Morra 30 vezes',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Níveis
    {
        id: 'conquest_11',
        name: 'Level 5',
        description: 'Atinja lv 5',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_12',
        name: 'Level 20',
        description: 'Atinja lv 20',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_13',
        name: 'Level 30',
        description: 'Atinja lv 30',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_14',
        name: 'Level 50',
        description: 'Atinja lv 50',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_15',
        name: 'Level 70',
        description: 'Atinja lv 70',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_16',
        name: 'Level 100',
        description: 'Atinja lv 100',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Itens equipados
    {
        id: 'conquest_17',
        name: 'Me sinto protegido',
        description: 'Equipe todos os itens de classe: Comum',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_18',
        name: 'Me sinto seguro!',
        description: 'Equipe todos os itens de classe: Raro',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_19',
        name: 'Apesar da cor, me sinto seguro',
        description: 'Equipe todos os itens de classe: Mistico',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Fortificação
    {
        id: 'conquest_20',
        name: 'Me sinto mais forte I',
        description: 'Melhore seu primeiro equipamento!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_21',
        name: 'Me sinto mais forte II',
        description: 'Melhore seu primeiro equipamento para Excepcional',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Encantamento
    {
        id: 'conquest_22',
        name: 'Vodu é pra jacu!',
        description: 'Encante seu primeiro equipamento!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_23',
        name: 'Isso é possível?',
        description: 'Encante seu equipamento com cada pedra!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_24',
        name: 'Rei Alquimista',
        description: 'Encante seu equipamento com pedras nível 3',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Enfermaria
    {
        id: 'conquest_25',
        name: 'Você vem sempre aqui?',
        description: 'Cure 100 vezes na enfermagem!',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Loja
    {
        id: 'conquest_26',
        name: 'Capitalista',
        description: 'Consiga 100.000 em EACoins vendendo itens!',
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Dungeon
    {
        id: 'conquest_27',
        name: 'Killer Perfeito',
        description: 'Atinja o mínimo de conclusões experado nas dungeons!', // 3/3 em cada
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Álbum
    {
        id: 'conquest_28',
        name: 'Primeira Figurinha',
        description: 'Colete seu primeiro card!', 
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_29',
        name: 'Colecionador Iniciante',
        description: 'Colete 10 cards!', 
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_30',
        name: 'Colecionador Amador',
        description: 'Colete 25 cards!', 
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_31',
        name: 'Colecionador Intermediário',
        description: 'Colete 50 cards!', 
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_32',
        name: 'Colecionador Avançado',
        description: 'Colete 75 cards!', 
        icon: 'assets/img/icons/achievements/prata.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    {
        id: 'conquest_33',
        name: 'Colecionador René Doscards',
        description: 'Colete 100 cards!', 
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // PVP
    {
        id: 'conquest_34',
        name: 'O pai ta on!',
        description: 'Vença seu primeiro combate pvp!', 
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Fim
    {
        id: 'conquest_35',
        name: 'O FIM?',
        description: 'Colete todas as cartas, atinja a pontuação minima e esteja lv 100!',
        icon: 'assets/img/icons/achievements/ouro.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    },
    // Configurações
    {
        id: 'conquest_36',
        name: 'Shiii, faça silêncio...',
        description: 'Diminua a Música e os Efeitos sonoros a 0 no menu de Configurações!',
        icon: 'assets/img/icons/achievements/bronze.png',
        iconLocked:'assets/img/icons/achievements/bloqueado.png'
    }
];

export default achievements;
