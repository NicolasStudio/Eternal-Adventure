export default [

    {
        version: "Alpha v0.8",
        date: "Agosto de 2026",
        changes: [
            "Balanceamento dos chefes de nível 30 e 40 (vida e defesa reduzidas) e reforço na armadura base do Mago no nível 30",
            "XP e ouro de todos os monstros do jogo recalculados para escalar de verdade com o nível (antes travava em um valor fixo a partir do nível 43)",
            "Corrigida uma inversão real de raridade: itens Raros estavam dando mais agilidade que os Místicos em armas de arqueiro, pernas e botas — agora a progressão de raridade é sempre crescente",
            "Renomeada a criatura 'Homem Lama' para 'Homem Musgo'",
            "Adicionado comparador de itens: passar o mouse num item do inventário agora mostra também a tooltip do item equipado no mesmo espaço, lado a lado",
            "Nova tentativa de correção definitiva do bug de tooltip bloqueando cliques na barra de ferramentas",
            "Músicas convertidas para um formato mais leve, reduzindo o tamanho total de áudio em mais de 60%",
            "Limpeza de código: removidos 11 arquivos JavaScript e 2 arquivos CSS que não eram mais usados por nada no jogo"
        ]
    },

    {
        version: "Alpha v0.7",
        date: "Agosto de 2026",
        changes: [
            "Botão Usar (poção) e Curar Vida Completa ganharam cores próprias (verde claro/escuro)",
            "Poção não pode mais ser usada com a vida já cheia",
            "Clicar em uma pedra de encantamento no inventário agora abre a Ferraria direto na aba Encantar",
            "Volume padrão da música reduzido",
            "Skip de Dungeon agora também pode ser usado em chefes, após três vitórias",
            "Botão de sair das Configurações renomeado para 'Sair do Jogo', e só aparece quando as Configurações são abertas de dentro de uma partida",
            "Corrigido contador de vitórias (badge) não aparecendo nos cards de dungeon de chefe",
            "Corrigido botão 'Em breve' não avisando nada ao ser clicado, e reduzida sua opacidade para não parecer uma opção clicável normal",
            "Clicar numa carta descoberta do Álbum agora abre ela em destaque na tela, com o fundo borrado — fecha clicando fora ou com Esc"
        ]
    },

    {
        version: "Alpha v0.6",
        date: "Agosto de 2026",
        changes: [
            "Balanceamento geral: preços de melhoria de qualidade, pedras de encantamento e custo de cura na Enfermaria revisados",
            "Corrigido bug onde itens sem raridade (poções, pedras) exibiam \"Nenhuma\" na Qualidade indevidamente",
            "Corrigido crash no Mercado ao tentar vender pedras de encantamento",
            "Corrigido bug que permitia \"equipar\" uma pedra de encantamento pelo inventário",
            "Unificados os 3 pop-ups de fim de andar (recompensa, inventário e continuar) em um só, com atalho de Sair da Dungeon",
            "Menus de navegação (Personagem, Dungeons, Cidade) agora minimizam ao clicar de novo neles",
            "Reduzido o tempo de espera do Baú de 5h para 3h30",
            "Adicionado blur e opção de visualizar na carta recém-obtida do Baú, igual ao Álbum",
            "Adicionada paginação completa no Álbum (Primeira, Anterior, Avançar, Última), removidas as setas laterais redundantes",
            "Corrigido item ficar \"preso\" no slot da Ferraria ao sair da aba sem confirmar a melhoria/encantamento",
            "Corrigido modal da Enfermaria podendo ficar aberto na tela após sair da Cidade",
            "Vida cheia não cobra mais (nem exibe) preço de cura na Enfermaria, e bloqueia o uso de poções",
            "Adicionado botão de cura completa nas poções, além do uso unitário",
            "Adicionado salvamento automático silencioso (localStorage) ao sair de uma dungeon, curar na Enfermaria ou melhorar/encantar um item",
            "Adicionada a Wiki do jogo (acessível pela barra de ferramentas), com guia de classes, itens, raridade, qualidade, Ferraria, Mercado, Enfermaria, Dungeons, Álbum e mais"
        ]
    },

    {
        version: "Alpha v0.5",
        date: "Agosto de 2026",
        changes: [
            "Criado 20 novas dungeons e 54 novos inimigos",
            "Liberado sistema de encantamento apartir do lv 50 no ferreiro",
            "Lv 100 liberado",
            "Novos itens adicionados: Pedras de Encantamento (TC de Rubi, Olbap Imperial, Marco de Safira e essenciaTurmalina) e Tripla Poção Média",
            "Melhoria nas Sprites das classes",
            "Adicionado missão missão secreta",
            "Tela de agradecimentos"
        ]
    },

    {
        version: "Alpha v0.4",
        date: "Julho de 2026",
        changes: [
            "Grande balanceamento de emergência",
            "Correções de layout",
            "Inserção do menu de opções (ainda não tem musica), limpar dados faz apaga os dados salvos no seu navegador",
            "Preparando o código para receber a função no ferreiro 'Encantar'",
            "Ajustes de balanceamento",
            "Adicionado método de Skip de Dungeon após tê-la completado três vezes",
            "Por fim adicionado vida, quer dizer trilha sonora ► ♫",
            "Ajustes no save, o jogador pode ter mais de um arquivo txt para ter outras campanhas salvas",
            "Ajustes na armadura total do Guerreiro, e aumentado o Life Steal",
            "Adicionado 'Esquiva de ataque', quanto maior a agilidade, maior a chance de esquivar do ataque inimigo",
        ]
    },

    {
        version: "Alpha v0.3",
        date: "Julho de 2026",
        changes: [
            "Realizado novos ajustes de responsividade",
            "Adicionado a Enfermagem",
            "Adicionado a função de compra no Mercado",
            "Ajustes nos preços de compra e venda",
            "Inserido novas fases e novos loots",
            "Ajustes nos lvs das dungeons e balanceamento",
            "Inserido duas novas partes da Ferraria Melhoria de Arma e Equipamento",
            "Nova mecânica de melhoria de item",
            "Adicionadas as Dungeons de caverna I, II, III e a Dungeon do Boss",
            "Adicionado sistema de card collection",
            "Por fim agora você pode salvar sua campanha!"
        ]
    },

    {
        version: "Alpha v0.2",
        date: "Julho de 2026",
        changes: [
            "Adicionadas as Dungeons II, III e a Dungeon do Boss",
            "Rebalanceamento da progressão de níveis do jogador",
            "Rebalanceamento dos atributos e da dificuldade dos monstros",
            "Correção do sistema de carregamento (Loading)",
            "Melhorias na interface do usuário (UI)",
            "Ajustes gerais de desempenho e estabilidade",
            "Inserido funcionalidade de Maximizar e Minimizar",
            "Inserido novos tipos de mensagem para ataques críticos e lifesteal",
            "Removido 'Andares' do boss"
        ]
    },

    {
        version: "Alpha v0.1",
        date: "Julho de 2026",
        changes: [
            "Início do desenvolvimento do projeto",
            "Implementação do sistema de seleção de classes",
            "Criação do sistema de atributos do personagem",
            "Implementação do sistema de equipamentos",
            "Desenvolvimento do inventário",
            "Criação da primeira Dungeon",
            "Implementação da progressão de andares das Dungeons",
            "Desenvolvimento do sistema de combate",
            "Implementação do sistema de loot",
            "Criação da Cidade",
            "Implementação do Mercado para compra e venda de itens",
            "Criação e padronização dos modais do jogo"
        ]
    }
];