export default [

    {
        version: "Alpha v0.14",
        date: "Setembro de 2026",
        changes: [
            "Adicionada a Fazenda: novo menu (a partir do nível 30) com 24 canteiros, 3 ferramentas — enxada, regador e luva — e 4 sementes (Batata, Alho-Poró, Cebola e Morango) vendidas numa aba própria do Mercado",
            "Fazenda: a umidade da terra no momento do plantio afeta o tempo de colheita — terra molhada acelera 50%, terra seca atrasa 50%, terra normal não muda nada",
            "Fazenda: adicionada confirmação (com o custo e seu ouro atual) antes de arar um canteiro, e confirmação antes de remover uma semente já plantada",
            "Adicionado o sistema de Pets: ao alcançar o nível 30 você ganha um Ovo de Lobo de graça, anunciado no próprio pop-up de level up — quem já estava acima do nível 30 antes dessa atualização também recebe, assim que carregar o save",
            "Pets: choque o ovo, alimente com colheitas da Fazenda e equipe pela nova aba 'Pets' da tela de Personagem — ele evolui sozinho em 3 estágios (nível 1, 18 e 32), trocando de nome, imagem e atributos automaticamente",
            "Pets: o pet equipado soma Vida, Ataque, Armadura e Agilidade ao personagem (escalados pela fome atual) e morde o inimigo a cada turno seu em Dungeons, PVP e Cooperativo",
            "Inventário: alimentar o pet agora abre um seletor de quantidade (botões 'Alimentar', que usa só o necessário pra saciar a fome, e 'Upar Pet', que libera todo o estoque pra gerar XP de propósito)",
            "Adicionadas músicas próprias para o combate de PVP/Cooperativo, para a Fazenda, e para a tela de Personagem — antes ela continuava tocando a música de onde o menu foi aberto",
            "Corrigido item sem nenhum uso no inventário (ex: semente, colheita da Fazenda) exibindo 'Encantar' e levando pra Ferraria por engano",
            "Aumentado em 1,5s o tempo de exibição das mensagens (toasts) do jogo",
            "Limpeza de código: removidos arquivos legados sem nenhuma referência no jogo atual (uma pasta de dados antiga em JSON e um conjunto de estilos em SCSS não utilizado)",
            "Adicionadas 18 novas conquistas para os sistemas de Pet e Fazenda (chocar ovos, fome, nível e estrelas do pet; arar terrenos, plantar, colher, regar, solo árido, morango e remover semente por engano)",
            "Aumentado o tamanho do retrato do personagem e do pet na tela de Personagem, que ficava pequeno e cortado nos estágios maiores do pet",
            "Corrigido o retrato do pet não conseguindo aumentar além dos limites da própria moldura ao passar o mouse por cima",
            "Absorção reformulada de novo: voltou a ser só mitigação (bloqueia o dano do golpe por completo, sem curar HP) — a versão anterior deixava quem tinha Absorção curando 2x no mesmo golpe (evitava o dano inteiro E ainda ganhava HP de bônus)",
            "Adicionado novo pet: Duende, com chance de 20% de dropar (como Ovo de Duende) do chefe da Caverna (Rei dos Goblins) — sua Mordida causa dano E cura você na mesma quantidade a cada ataque; em PVP 2x2 e Cooperativo, cura o time inteiro vivo, não só quem tem o pet equipado",
            "Adicionado texto de 'Chance de Drop' no tooltip de itens da tela de Dungeons, pra drops que não são 100% garantidos (ex: o novo Ovo de Duende)",
            "Corrigido o Ovo de Duende não conseguindo ser chocado",
            "Fazenda: adicionadas 4 novas sementes (Trigo, Milho, Uva e Abóbora) e rebalanceados tempo de colheita e preço de todas as 8 — de Batata (5min, 100$) até Abóbora (12h, 3000$)",
            "Reduzida a chance de drop do Ovo de Duende de 20% para 5%",
            "Unificada a exibição da habilidade do Duende no tooltip (antes mostrava 'dano' e 'cura' como duas linhas separadas, parecendo duas habilidades diferentes, sendo que é uma coisa só: tira do inimigo e dá a mesma quantidade pro(s) aliado(s))",
            "Aumentada a chance de equipamento Lendário no Cooperativo (3% -> 5%) e da pedra Quartzo Rosa (Especial) nível 3, que dropa junto (6% -> 15%)",
            "Fazenda: passar o mouse sobre uma plantação agora mostra um tooltip com o tempo restante até a colheita (contagem regressiva ao vivo)",
            "Fazenda: adicionada a Praga — nasce sozinha em canteiros semeados (a cada 5h) e atrasa o crescimento em 15% até ser removida com a nova ferramenta Anti-Praga",
            "Renomeada a habilidade do Duende de 'Toque Curativo' para 'Robin Hood' (tira do inimigo, dá pro aliado)",
            "Corrigido o valor da cura do Duende não aparecendo na aba Pets da tela de Personagem (mostrava só '+ cura', sem o número)",
            "Adicionadas 8 novas conquistas de Fazenda: colher Milho, Trigo, Cebola e Abóbora em quantidade, colher a primeira plantação de Milho, colher uma Abóbora à noite, ter ao menos um de cada alimento no inventário, e eliminar 100 Pragas",
            "Corrigido o Mercado (aba de venda) quebrando o layout com nomes de item longos (ex: pedras de encantamento) — agora trunca com reticências, e reduzido o tamanho das fontes do painel de detalhes, que também quebrava em telas menores",
            "Ferreiro - Encantar: layout do meio reorganizado — Arma e Pedra ficam lado a lado (com '+' no meio) em vez de empilhadas, removendo a barra de rolagem que aparecia sem necessidade",
            "Corrigido, nas telas do Ferreiro (Melhorar e Encantar), o hover do tooltip ativando no espaço vazio ao redor do item, não só em cima dele — e as listas de itens agora usam uma grade de 3 por linha, em vez de uma coluna única com bastante espaço morto",
            "Corrigida a label 'OURO' do Ferreiro de Armas, que tinha ficado pra trás — agora é 'SEU OURO', igual nas telas de Equipamentos e Encantar",
            "Corrigida a grade de canteiros da Fazenda ficando escondida atrás do HUD do personagem em janelas mais baixas/estreitas",
            "Corrigido o tooltip de comparação de pets (aba Pets, hover no inventário) usando o formato de equipamento por engano (raridade/qualidade/atributos zerados) — agora usa o mesmo formato do pet principal, e removida a repetição de texto na Habilidade dos pets que curam"
        ]
    },

    {
        version: "Alpha v0.13",
        date: "Agosto de 2026",
        changes: [
            "Corrigido bug onde apertar Enter na confirmação de 'Pular Dungeon' reabria o modal ou entrava direto em combate, em vez de apenas confirmar a escolha",
            "Ferraria: removida a confusa 'Próxima Qualidade: Máximo' ao melhorar um item já Excepcional — agora aparece um selo 'Máximo' centralizado",
            "Adicionado bloqueio de Dungeons, PVP e Cooperativo com a vida abaixo de 5% — um aviso pede para ir à Enfermaria ou usar poções antes de entrar em combate",
            "Corrigido os botões da barra de ferramentas (Wiki, Salvar, Carregar, Maximizar, Configurações) ficando sem nenhuma ação depois de fechar a tela de Personagem pelo X",
            "Cooperativo: posição dos 4 personagens na arena agora é organizada por armadura, do menor pro maior — quem aguenta mais dano fica mais perto do chefe",
            "Cooperativo: o chefe agora prioriza atacar Guerreiro (35%) e Bárbaro (25%), que têm forma própria de se manter em combate (Absorção e Roubo de Vida), em vez de mirar igualmente em todo mundo; Mago e Arqueiro levam 20% cada",
            "Absorção reformulada: agora, ao ativar, bloqueia o dano do golpe por completo (antes mitigava só metade)"
        ]
    },

    {
        version: "Alpha v0.12",
        date: "Agosto de 2026",
        changes: [
            "Adicionado sistema que conquistas ao todo 40 missões/tarefas",
            "Realizado micro ajuste no dano do Guerreiro e do Mago, estavam muito abaixo do arquiro, +2 para o guerreiro e +3 no mago, SOMENTE na arma mística",
            "Modo 2x2 está muito bugado devido a reclamações está indisponível momentâneamente",
            "Adicionado novo menu Cooperativo, junte-se com seus amigos para derrotar as novas criaturas lendárias", 
            "Adicionado muitas recompensas no modo Cooperativo"
        ]
    },

    {
        version: "Alpha v0.11",
        date: "Agosto de 2026",
        changes: [
            "Adicionado o sistema de Conquistas: 35 conquistas pra desbloquear (caça, mortes, nível, equipamento, melhoria, encantamento, enfermaria, loja, dungeons, álbum e PVP), com modal próprio na barra de ferramentas, pop-up e som ao desbloquear cada uma",
            "Absorção reformulada: agora é chance de ativar (como o Roubo de Vida), e quando ativa mitiga parte do dano recebido e cura HP proporcional ao que foi absorvido — antes era uma redução garantida em todo golpe, sem nenhuma cura",
            "Corrigido o contraste dos avisos de combate: crítico, roubo de vida e absorção às vezes ficavam com a cor do texto igual à do fundo da caixa, quase ilegíveis",
            "PVP: um combate que passa de 1 minuto acelera sozinho em 2x, sem precisar de nenhum controle manual",
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