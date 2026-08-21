export default [

    {
        version: "Alpha v0.11",
        date: "Agosto de 2026",
        changes: [
            "Adicionado o sistema de Conquistas: 35 conquistas pra desbloquear (caça, mortes, nível, equipamento, melhoria, encantamento, enfermaria, loja, dungeons, álbum e PVP), com modal próprio na barra de ferramentas, pop-up e som ao desbloquear cada uma",
            "Absorção reformulada: agora é chance de ativar (como o Roubo de Vida), e quando ativa mitiga parte do dano recebido e cura HP proporcional ao que foi absorvido — antes era uma redução garantida em todo golpe, sem nenhuma cura",
            "Corrigido o contraste dos avisos de combate: crítico, roubo de vida e absorção às vezes ficavam com a cor do texto igual à do fundo da caixa, quase ilegíveis",
            "PVP: um combate que passa de 1 minuto acelera sozinho em 2x, sem precisar de nenhum controle manual",
            "Nova condição pro final secreto (Portal da Luz/Trevas): além de nível 100 e álbum completo, agora também exige 3/3 conclusões em todas as dungeons",
            "Personagem no nível máximo não ganha mais experiência à toa",
            "Corrigido um caso raro em que um atributo secundário (ex: Penetração) podia ficar negativo em saves antigos, impedindo alcançar o teto real do item"
        ]
    },

    {
        version: "Alpha v0.10",
        date: "Agosto de 2026",
        changes: [
            "Adicionada uma quarta classe jogável: Bárbaro — foco em Roubo de Vida, com machado, elmo, peitoral, calças e botas próprios em todas as raridades",
            "Adicionado um atributo novo, Absorção: chance de mitigar parte do dano de um golpe recebido e recuperar HP proporcional ao que foi absorvido — igual ao Roubo de Vida, só que do lado de quem apanha em vez de quem ataca — virou o atributo especial do Guerreiro",
            "Guerreiro reequilibrado: ataque, armadura, agilidade e a nova Absorção foram recalculados nível a nível; Roubo de Vida deixou de ser o especial dele e virou um atributo secundário",
            "Corrigida a fórmula de esquiva do PVP: travava em 0% sempre que o defensor não fosse mais ágil que quem atacou, o que deixava o Guerreiro praticamente sem chance contra qualquer classe mais rápida, não importa o quanto investisse em vida e armadura",
            "Personagens salvos antes desse reequilíbrio são recalculados automaticamente pra curva de status atual ao carregar o save, preservando qualquer bônus de pedra de encantamento ou transcendência já conquistado",
            "Corrigido o PVP 2x2: em alguns casos um jogador acabava enfrentando a si mesmo, ou ficava preso 'procurando partida' pra sempre sem nunca ser pareado",
            "Álbum de Criaturas: a escolha de revelar as cartas com spoiler agora fica salva — não pede a mesma confirmação toda vez que a tela é reaberta",
            "Itens e melhoria de qualidade recalibrados: o bônus de 'Excepcional' em atributos secundários (Crítico, Roubo de Vida, Penetração, Absorção) não soma mais um valor enorme numa peça só — agora arma e capacete (ou machado e botas, no caso do Bárbaro) precisam estar as duas totalmente melhoradas pra alcançar o teto de cada raridade, sem desperdiçar metade do investimento como antes",
            "Corrigido botão 'Curar Vida Completa' aparecendo mesmo com só uma poção no inventário"
        ]
    },

    {
        version: "Alpha v0.9",
        date: "Agosto de 2026",
        changes: [
            "Adicionado o modo PVP: lobby de espera, pareamento automático contra outro jogador e combate resolvido pelos status dos personagens",
            "Cerimônia de início de partida: sorteio animado da arena entre os cenários de chefe do jogo",
            "Combate PVP agora usa a mesma tela e as mesmas mensagens de ataque do combate contra monstros — o adversário aparece no lugar do monstro, com HUD de vida próprio",
            "Corrigido botão de fechar (X) da Arena PVP não respondendo ao clique em algumas telas",
            "Corrigido z-index da janela do PVP, que ficava escondida atrás do baú diário",
            "Sair da Arena PVP (pelo X ou pelo botão Voltar) agora sempre fecha por completo e restaura o cenário padrão",
            "Removida a trepidação da animação de sorteio da arena",
            "Corrigido tooltip do botão de maximizar, que continuava dizendo 'Maximizar' mesmo em tela cheia",
            "Corrigido clique em carta borrada do Álbum abrindo o destaque antes da carta ser revelada — agora só abre depois de 'Visualizar Cartas'",
            "Poções agora aparecem no Mercado somente depois de vencer, ao menos uma vez, o chefe que as dropa",
            "Valor de compra das poções reajustado, e valor de venda recalculado para 1/3 do valor de compra"
        ]
    },

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