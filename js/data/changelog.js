export default [

    {
        version: "Beta 0.3.4 — Troca de Nome",
        date: "Outubro de 2026",
        changes: [
            "Agora dá pra trocar o nome do personagem: Configurações (dentro do jogo) → Personagem → Trocar nome. É grátis, uma vez a cada 6 meses por personagem, com as mesmas regras de nome da criação (5 a 8 letras ou números, sem caractere especial, e não pode estar em uso por outro jogador). O nome antigo fica livre pra outros jogadores e o Ranking passa a mostrar o novo"
        ]
    },
    {
        version: "Beta 0.3.3 — Cassino",
        date: "Outubro de 2026",
        changes: [
            "Novo: Cassino! O dado ao lado do Correio, na tela inicial, abre um caça-níquel de 3 bobinas — só a linha do meio conta, e ganha quem tirar o mesmo símbolo nas 3 bobinas dela. Prêmios, do mais comum ao mais raro: Semente de Batata, 5x Tripla Poção Média, o dobro do valor apostado em ouro, 1x Morango, 1x Quartzo Rosa Nível I e, muitíssimo mais raro que todo o resto, a arma Lendária da sua própria classe (cada classe só pode ganhar a própria arma)",
            "Cassino: 3 giros grátis por dia, por personagem, que resetam à meia-noite de Brasília — validado pelo relógio do servidor, não pelo do computador. Depois das 3 grátis, cada giro custa 5.000 de ouro"
        ]
    },

    {
        version: "Beta 0.3.2 — Anéis e Amuletos",
        date: "Outubro de 2026",
        changes: [
            "Anel e Amuleto reorganizados: cada variante agora dá só UM atributo (antes dava dois). Anel/Amuleto Primal passa a dar só Agilidade (antes Ataque+Agilidade); Anel/Amuleto do Primeiro Imperador (Amuleto renomeado de 'Moderno') passa a dar só Armadura (antes Vida+Armadura); Anel/Amuleto do Crânio, renomeado para 'do Cavaleiro Caveira', passa a dar só Ataque (antes Ataque+Sorte)",
            "2 variantes novas de Anel/Amuleto: 'do Amor' (dá Vida) e 'do Leprechaun' (dá Sorte) — reaproveitam as curvas de valor das variantes antigas",
            "2 novos chefes no Cooperativo: Dragão Caveira e Dragão de Sakura",
            "A versão Lendária de cada Anel/Amuleto agora é fixa por chefe do Cooperativo, em vez de sorteada entre todas as variantes: Dragão Caveira dropa 'do Cavaleiro Caveira', Dragão Varejeiro dropa 'Primal', Dragão de Indra dropa 'do Primeiro Imperador', e Dragão de Sakura dropa 'do Amor' e 'do Leprechaun'"
        ]
    },

    {
        version: "Beta 0.3.1 — Correções de Status",
        date: "Outubro de 2026",
        changes: [
            "Encantamento: agora vale UM de cada tipo (Vida, Ataque, Armadura, Agilidade e Especial) por personagem, não por arma — antes dava pra encantar várias armas e somar os bônus (ex: dois Rubis III = +600 de Vida), e o bônus continuava mesmo depois de fundir ou vender a arma. Uma pedra melhor que a sua melhor daquele tipo continua substituindo a anterior; uma igual ou pior é bloqueada, sem gastar a pedra. Quem tinha encantamentos acumulados fica com o melhor de cada tipo",
            "Corrigido: o rebalanceamento da versão 0.2.9 não chegou pra quem já tinha entrado no jogo um dia antes dele — esses personagens continuavam com a curva de nível anterior. Agora os status de todo personagem são recalculados ao entrar no jogo, a partir do nível, do Upgrade de Classe, do encantamento, dos talentos e do equipamento",
            "Wiki (Classe vs Classe): a simulação agora alterna os lados a cada luta — antes a classe da linha sempre começava atacando nos empates de Agilidade e levava o desempate no limite de rodadas, o que deixava algumas células do confronto direto até ~8 pontos fora. A legenda da tabela também foi corrigida: cada célula é a % de vitória da classe da linha contra a da coluna (não existe atacante/defensor no combate)"
        ]
    },
    {
        version: "Beta 0.3.0 — Vizinhos na Fazenda",
        date: "Outubro de 2026",
        changes: [
            "Visite fazendas! Na Fazenda, o novo botão de casinha (ao lado do chat) abre a lista de jogadores acima do nível 30 — clique em Visitar pra ver a fazenda deles. Lá você pode regar, eliminar pragas e roubar 2 alimentos de cada planta pronta (uma vez só por planta: quem chegar depois vê 'Esse alimento já foi roubado'), até 12 canteiros de cada fazenda por dia (zera à meia-noite). Ao abrir a sua Fazenda, um resumo mostra quem regou, tirou pragas ou roubou de você. Precisa estar logado na sua conta",
            "Fazenda: a dica de uma planta pronta mostra quanto ela rende (ex: Melancia 7/7)",
            "Fazenda: ao escolher a semente, o novo botão Plantar em todos planta a mesma semente em todos os canteiros arados e vazios de uma vez (até acabar a semente)",
            "12 conquistas novas: Amigo ou inimigo? (I, II e III), Senhor Furtado e Acho que a grama do vizinho é mais verde na Fazenda; Fuuuuusão (I a IV) na Fusão; e Já ta valendo? (I, II e III) pelas vitórias no Combate Ranqueado",
            "Mercado: equipamentos Incomuns, Raros e Místicos ficaram mais caros de novo — a compra triplicou e a venda passou a valer o antigo preço de compra (ex: Espada Incomum 360→1.080, Rara 3.240→9.720, Mística 9.720→29.160; venda da Mística 1.620→9.720). Itens que você já tem passam a vender pelo valor novo",
            "Árvore de Talentos: os talentos de Troca de Atributo passam a mover 10 por nível (antes 15) — até 30 no 3/3"
        ]
    },

    {
        version: "Beta 0.2.9 — Rebalanceamento de Classes e Pets",
        date: "Outubro de 2026",
        changes: [
            "Rebalanceamento geral das 10 classes, agora feito a partir de milhares de lutas simuladas no Combate Ranqueado (1x1) com a classe COMPLETA de uma vez — curva de nível, Upgrade de Classe (Luz/Trevas) e Arma/Elmo Lendário simulados JUNTOS, nos níveis 20, 40, 60, 80 e 100, e no fim de jogo (nível 100 com tudo equipado e transcendido). Antes, algumas classes venciam quase todos os confrontos e outras quase nenhum, mesmo quando cada parte do equipamento parecia equilibrada isoladamente; agora todas ficam perto de 50% de vitória média em todo cenário testado. Seus status são recalculados automaticamente ao entrar no jogo (encantamentos, fusão e bônus já conquistados são mantidos). Agilidade não mudou em nenhuma classe, EXCETO o Pútrido. Valores de curva abaixo são o total acumulado no nível 100; valores de Arma/Elmo são o status base do item Lendário; valores de Upgrade de Classe são o bônus do Portal da Luz/Trevas",
            "Guerreiro: menos resistente e mais ofensivo, pra encurtar as lutas mais longas do jogo — Vida 1750→1774, Ataque 75→111, Armadura 95→46 na curva de nível (Armadura de Elmo/Peitoral/Calças/Botas já tinha caído ~55% antes, não mudou agora). Espada Lendária Ataque 43→38 e Absorção 11%→9,7%; Elmo Lendário Absorção 8%→7%. Upgrade de Classe (Luz) Vida 100→119, Ataque 10→12, Armadura 46→56 — ficou melhor pra compensar a queda na arma. Continua sendo a classe mais resistente do jogo",
            "Arqueiro: Vida 1189→1278, Ataque 94→101, Armadura 55→59 na curva. Arco Lendário Ataque 32→44 e Crítico 11%→15%; Elmo Crítico 8%→10,9% — ficou mais forte pra compensar uma curva mais contida",
            "Mago: Vida 1291→1309, Ataque 162→164, Armadura praticamente igual (14→14) na curva — a classe virou uma 'canhão de vidro' pura: dano altíssimo, quase sem Armadura. Cetro Lendário, que já tinha caído de 41→25, caiu mais uma vez (25→15) e a Penetração 11%→6,5% (Elmo 8%→4,7%); Upgrade de Classe (Luz) Vida 80→36 e Ataque 85→53 — era, de longe, a classe mais forte equipada e teve o corte mais pesado de toda a rodada",
            "Bárbaro: Vida 988→1036, Ataque 124→129, Armadura 67→74 na curva — era a classe mais fraca equipada (a menor Vida do jogo, perdia a maioria das lutas mesmo com bom Ataque). Machado Lendário Ataque 34→87 e Roubo de Vida 11%→28,2% (Elmo Roubo de Vida 8%→20,5%); Upgrade de Classe reforçado nos dois lados (Luz Vida 140→171, Trevas Vida 100→129) pra lhe dar sobrevivência de verdade, não só mais dano",
            "Pútrido: era a classe mais forte do jogo com folga sem equipamento a partir do nível 40 — Vida 1818→1368, Ataque 122→121 (praticamente igual, depois de ter caído demais numa rodada anterior) e Armadura 56→41. Agilidade 144→108: 36 pontos viraram Ataque, já contados acima — a classe tinha Agilidade quase de Arqueiro sem conseguir bater forte o suficiente pra aproveitar. Arma e Elmo Lendários quase não mudaram (Miasma 11%→10,8% e 8%→7,8%)",
            "Mímico: era a classe mais fraca sem equipamento (Vida 991→1241, Ataque 70→87, Armadura 85→108 na curva) e, ao mesmo tempo, a mais forte de longe quando equipada — a Imitação dela copia Ataque/Armadura/Agilidade de quem ela enfrenta, e isso escala rápido demais com itens fortes. Espelho Lendário Ataque 15→5 e Imitação 5%→1,8% (Elmo Imitação 3%→1,1%) — cortes pesados na parte que mais pesava, mantendo o reforço na curva sem equipamento",
            "Louca: Vida 850→952, Ataque 172→194, Armadura 15→18 na curva. Marreta Lendária Ataque 55→67 e Confusão 11%→13,4% (Elmo Confusão 8%→9,7%)",
            "Eletro: Vida 1200→1081, Ataque 150→134, Armadura 60→54 na curva. Bobina Tesla Lendária praticamente igual (Ataque 36→39, Paralisia 11%→11,9%)",
            "Samurai: Vida 1150→1190, Ataque 105→109, Armadura 62→64 na curva — quase sem mudança nesta rodada. Katana Lendária Ataque 32→30 e Golpe Duplo 11%→10,3% (Elmo 8%→7,5%)",
            "Singularidade: Vida 1700→1521, Ataque 132→118, Armadura 56→50 na curva. Martelo Lendário Ataque 36→42 e Pressão Gravitacional 11%→12,7% (Elmo 8%→9,2%)",
            "Upgrade de Classe (Portal da Luz/Trevas): rebalanceado junto com o resto pela primeira vez — o bônus de cada lado (Luz e Trevas) muda de tamanho por classe, mas a chance de vitória média continua perto de 50% dos dois lados pra todo mundo. Maiores mudanças além das já citadas: Eletro (Luz/Trevas Vida e Ataque caem ~30%, estava forte demais combinado com o equipamento) e Louca (Luz Ataque 45→61 e Agilidade 30→41, estava fraca combinada)",
            "Equipamentos Místicos ficam 3% mais fortes e Lendários 10% mais fracos (valor final na qualidade máxima da Ferraria), pra diminuir o salto entre as duas raridades — vale pra Ataque, Armadura, Agilidade, Vida e Sorte de armas, armaduras, anéis e amuletos de todas as classes. Ex: Cetro Místico Excepcional 59→61, Espada Lendária com qualidade Lendária 92→83. Atributos especiais (Crítico, Miasma, Confusão etc.) não mudaram. Itens que você já tem são atualizados sozinhos",
            "Drops mais generosos: equipamentos Raros caem com 23% de chance (antes 18%) e Místicos com 13% (antes 8%) nas Masmorras; nos dragões do Cooperativo, o equipamento Lendário passa a cair com 7% de chance (antes 5%)",
            "Mercado: equipamentos Raros e Místicos custam 3x mais pra comprar (ex: Espada Rara 1.080→3.240, Mística 3.240→9.720). O valor de venda não mudou",
            "Fusão: o nível máximo agora é +5, e a chance de sucesso ficou menor — +0→+1 60% (antes 70%), +1→+2 45% (55%), +2→+3 30% (40%), +3→+4 20% (30%), +4→+5 10% (15%). A Sorte continua somando até +20 pontos de chance. Em compensação, cada nível de fusão agora soma +7 (antes +5) em cada atributo não-especial: +7, +14, +21, +28 e +35 no +5. Itens já fundidos são atualizados sozinhos",
            "Duende: a cura passa a ser igual ao nível do pet (nível 50 = 50 de cura, antes 82) — antes curava mais do que um golpe inteiro do oponente no fim de jogo",
            "Urso: era o pet menos atrativo — agora dá +10 de Armadura e +10 de Agilidade em todos os níveis e bem mais Ataque, com menos Vida. No nível 50: Vida 294→200, Ataque 6→36, Armadura 42→52, Agilidade 2→12",
            "Aranha e Aranha de Halloween: Vida máxima 152→120 e Agilidade máxima 30→24 (nível 50). A cópia de dano não mudou",
            "Boitatá: Vida máxima 435→150 (nível 50). Contra jogadores (Ranqueado 1x1 e 2x2), a Queimadura passa a ter dano fixo por estágio — 10 (Filhote), 20 (Jovem) e 30 (Adulto), antes chegava a 82 por turno. Contra monstros, nas Masmorras e no Cooperativo, continua igual",
            "Yggdrasil: Vida máxima 730→200 e Ataque máximo 71→50 (nível 50). Mordida e Reviver não mudaram",
            "Árvore de Talentos: o botão Resetar agora reseta só o talento selecionado (100 mil de ouro, ou 500 mil se for o talento único). O novo botão Resetar tudo desfaz todos os talentos de uma vez, inclusive o único. Se o talento resetado for o seu único em 3/3, o talento único também é desfeito, já que é pré-requisito dele",
            "Corrigido: na Árvore de Talentos, os botões do rodapé ficavam fora da tela em monitores menores — agora a lista de talentos rola dentro da janela",
            "Corrigido: no Combate Ranqueado 1x1, uma luta que chegava ao limite de rodadas com os dois vivos dava a vitória sempre ao mesmo lado — agora vence quem tem mais vida restante (proporcional), igual ao 2x2",
            "O pareamento do Ranqueado (1x1 e 2x2) agora só junta jogadores com a mesma versão do jogo, pra os dois lados sempre verem o mesmo resultado da luta — se a fila demorar, recarregue a página"
        ]
    },

    {
        version: "Beta 0.2.8 — Troca de Atributo",
        date: "Outubro de 2026",
        changes: [
            "Árvore de Talentos: 6 novos talentos de Troca de Atributo, abaixo dos 3 de sempre e usando o mesmo pool de pontos por região. Cada um troca uma quantidade FIXA (não porcentagem de vida) de um atributo pelo outro: 15 por nível, até 45 no 3/3, sem custar vida máxima — Armadura↔Velocidade, Armadura↔Ataque e Ataque↔Velocidade, nos dois sentidos cada",
            "Maxear qualquer um dos 9 talentos simples agora libera os Talentos Únicos, não só os 3 originais (Dano/Armadura/Velocidade)"
        ]
    },

    {
        version: "Beta 0.2.7 — Fusão de Equipamentos",
        date: "Outubro de 2026",
        changes: [
            "Novo sistema de Fusão: combine 4 equipamentos da mesma categoria (Arma, Elmo, Peitoral, Perna, Bota, Anel ou Amuleto), raridade e nível de fusão pra tentar criar uma versão aprimorada de um deles (+1, +2, +3...). Anel/Amuleto também precisam ser exatamente a mesma peça (não dá pra misturar Primal/Moderno/Crânio). O item que vira a base é sempre o melhor dos 4 (maior qualidade, desempate por encantamento) — os outros 3 são consumidos",
            "Cada nível de fusão soma +5 em TODO atributo não-especial do equipamento (Ataque na arma; Armadura e Agilidade na calça; Ataque, Armadura e Sorte no Anel/Amuleto do Crânio) — atributos especiais de classe (Crítico, Roubo de Vida, etc) nunca recebem esse bônus. Cada um aparece separado na tooltip (ex: '+33  +5')",
            "Fusão tem chance de sucesso, caindo quanto maior o nível de fusão dos itens (70% de +0 pra +1, até 15% de +4 pra +5) — a primeira mecânica do jogo com risco de falha de verdade. Falhar consome os 4 itens e o ouro gasto",
            "Novo atributo Sorte: melhora a chance de sucesso da Fusão E converte direto em % extra no atributo especial da sua classe (Crítico pro Arqueiro, Roubo de Vida pro Bárbaro, etc) — 0,5% a cada 50 pontos de Sorte, sem teto. Só vem de equipamento/talento (sem curva por nível) e não entra no cálculo de Poder",
            "Custo da Fusão varia pela raridade dos itens: 30 mil (Comum) até 150 mil de ouro (Lendário)",
            "Menu da Cidade reorganizado: Ferraria virou Equipamentos, com Melhorar Equipamentos (Arma, Elmo, Peitoral, Perna, Bota e Acessórios numa tela só, em vez de Melhorar Arma e Melhorar Armadura separados), Encantar (sem mudança) e a nova Fundir",
            "Novo item: Proteção de Sorte — vendido na loja a partir do nível 10 (30 mil de ouro). Se colocado no 5º slot da Fusão, uma falha destrói só ele em vez dos 4 equipamentos (o ouro gasto na fusão ainda é perdido)",
            "Novo Anel/Amuleto do Crânio — terceira variante (além de Primal e Moderno), com Ataque, Armadura e a nova Sorte. Comum na Caverna III e no chefe do nível 30, Incomum no chefe do nível 40 e no Deserto I, Raro no Deserto II, Místico nos chefes dos níveis 60 e 70 — o Lendário cai dos mesmos dragões do Cooperativo que já soltam anel/amuleto lendário",
            "Corrigido o Anel do Primeiro Imperador (Moderno) aparecendo duplicado na prévia de drops do chefe do nível 90 (Inferno)",
            "Corrigido o Correio não deixando mandar carta de um personagem pro outro da mesma conta — antes era tratado como 'enviar pra si mesmo' mesmo sendo um personagem diferente",
            "Corrigido o Ranking Global mostrando os dois personagens de uma mesma conta como online ao mesmo tempo — agora só aparece com a bolinha verde o personagem realmente ativo no momento",
            "Removida a 'Chance de Drop' da tooltip dos itens de masmorra"
        ]
    },

    {
        version: "Beta 0.2.6 — Lobby e Torneio",
        date: "Outubro de 2026",
        changes: [
            "PVP redesenhado: agora abre num lobby — clique em 'Entrar' pra escolher entre Combate Livre e Combate Ranqueado, em vez de cair direto na escolha de modo",
            "Combate Livre ganhou o modo 3x3 (trios), além do 1x1 e 2x2 de sempre — mesma regra de até 5.000 de diferença de Poder entre os pareados e arena sorteada entre os chefes do jogo",
            "Novo Combate Ranqueado: leva pro Modo Torneio, que por enquanto mostra um aviso de 'em breve' — quando estiver pronto, terá 1x1/2x2/3x3 próprios, pareamento mais restrito (até 2.500 de diferença de Poder), arena sempre fixa e pontos de ranking na vitória (1 no 1x1, 2 no 2x2, 3 no 3x3)",
            "Novo ícone de Torneio na barra de ferramentas, ao lado do Ranking Global: lista os jogadores pelos pontos do Combate Ranqueado, com 1º/2º/3º lugar destacados em ouro, prata e bronze. Começa vazio até o Combate Ranqueado ser destravado",
            "Corrigido o fundo do Combate Livre: antes trocava pra tela de arena genérica assim que você escolhia o modo; agora continua mostrando o lobby até o combate em si começar",
            "Corrigidos ícones quebrados que não apareciam: os de 'escolher combate' no PVP (trocados por um punho) e o do Arqueiro na Wiki (trocado por um alvo) — eram ícones que só existem na versão paga do Font Awesome",
            "Corrigido os botões de Dungeons, PVP e Cooperativo continuando com aparência de travados depois de curar na Enfermaria e passar dos 5% de vida — antes só destravavam ao trocar de menu na mão",
            "Corrigido Anel e Amuleto não aparecendo pra comprar na loja — novas abas Anéis e Amuletos, liberadas pelos mesmos critérios dos outros equipamentos (vencer a dungeon que os dropa)",
            "Corrigido Caverna IV-VI, Oceano I-III, Floresta I-III e Inferno I-III: a tooltip da dungeon prometia Tripla Poção (Pequena ou Média, conforme o nível), mas os monstros de lá ainda soltavam poção de um estágio mais antigo — agora o drop bate com o que a tooltip mostra",
            "Botão de Maximizar/Minimizar saiu da barra de ferramentas e virou uma opção dentro de Configurações",
            "Corrigido o jogo travando (nenhum clique funcionava) depois de maximizar — a tela cheia pedia só a área do jogo, deixando qualquer modal aberto (incluindo o próprio de Configurações) fora dela e sem resposta a clique"
        ]
    },

    {
        version: "Beta 0.2.5 — Regras de Item",
        date: "Outubro de 2026",
        changes: [
            "Cada raridade agora exige um nível mínimo pra ser equipada: Comum 1, Incomum 10, Raro 20 e Místico 40 — raridades mais altas pedem nível ainda maior. Tentar equipar algo acima do seu nível mostra o motivo, em vez de simplesmente não fazer nada",
            "Itens agora guardam um selo USADO/NÃO USADO, visível no tooltip — equipar, melhorar na Ferraria ou encantar uma arma marca o item como usado. Ainda não tem efeito nenhum hoje, mas prepara o terreno pra quando a transferência de itens entre contas existir",
            "Tooltip de arma: a seção 'Efeito' só aparece quando ela tem encantamento de verdade — sem encantamento, a seção some (antes mostrava 'Este item não possui efeitos especiais' sem necessidade, já que quem tem efeito é o encantamento, não a arma em si)",
            "Corrigido o tooltip e o equipar não reconhecendo o nível mínimo em itens de contas mais antigas — o jogo agora resolve esse valor direto pela raridade atual do item, em vez de confiar só no que foi salvo na hora do drop",
            "Poção Pequena passa a aparecer na loja assim que a primeira fase do Bosque (Bosque I) é vencida, em vez de esperar o chefe do Bosque — evita deixar alguém sem nenhuma poção pra comprar logo no começo da jornada",
            "Corrigido o progresso dos dragões do Cooperativo (e a liberação da Poção Grande) vazando entre os personagens da mesma conta — vencer um dragão com um personagem não libera mais a poção nem as conquistas de dragão pros outros personagens da mesma conta",
            "Corrigida a tentativa de equipar um item de nível ou classe incompatível não mostrando nenhum aviso — agora o jogo avisa o motivo exato de não poder equipar"
        ]
    },

    {
        version: "Beta 0.2.4 — Novas Classes",
        date: "Outubro de 2026",
        changes: [
            "Alto Falante: novo ícone ao lado do Correio, só pra administração — abre um aviso que aparece correndo no topo da tela de todo mundo que estiver online na hora",
            "Nova classe: Eletro — parecido com o Mago (segundo maior dano do jogo), mas com Armadura, Agilidade e Vida medianas em vez de extremas. Atributo exclusivo Paralisia: chance a cada golpe certeiro de paralisar o alvo até o próximo ataque dele, que simplesmente não acontece (sem sortear nada, diferente da Confusão da Louca). Vale contra monstros, chefes, PVP e Cooperativo. Novos itens exclusivos: Bastão de Tesla (arma), Óculos Chocante (elmo), Jaqueta (peitoral), Calça de Serviço (calças) e Bota Emborrachada (botas)",
            "Informações do Combate ganhou mais 2 números: Paralisia (quantas vezes você paralisou o oponente) e Ataques paralisados (quantos dos seus próprios ataques se perderam por estar paralisado)",
            "Nova classe: Samurai — Ataque mediano (metade do normal de propósito), Armadura e Vida também medianas, e Agilidade alta (atrás só do Arqueiro). Atributo exclusivo Golpe Duplo: chance em todo golpe seu que acerta de repetir o MESMO dano uma segunda vez na mesma rodada, sem rolar Crítico, Roubo de Vida ou Absorção de novo. Vale contra monstros, chefes, PVP e Cooperativo. Novos itens exclusivos: Katana (arma), Máscara Tengu (elmo), Kimono (peitoral), Hakama (calças) e Chinelo de Japonês (botas)",
            "Informações do Combate ganhou mais 1 número: Golpe Duplo (quantas vezes você acertou o mesmo golpe uma segunda vez)",
            "Removido o talento único 'Cara ou Coroa?' — sortear qualquer atributo especial de qualquer classe estava virando combinação demais pra testar/balancear, agora que cada classe nova ganha o seu próprio. Quem já tinha esse talento ativo é limpo sozinho ao carregar, igual já acontecia com o Rei dos Encantamentos",
            "Nova classe: Singularidade — Ataque um pouco acima do Bárbaro, Armadura parecida com a do Pútrido, Vida um pouco abaixo do Guerreiro e Agilidade baixa (só na frente do Guerreiro). Atributo exclusivo Pressão Gravitacional: chance a cada golpe certeiro de acumular 1 marca no alvo — a cada 3 marcas, elas são consumidas e o alvo recebe Gravidade Máxima, perdendo a próxima ação de ataque por completo e tendo a Armadura reduzida à metade no próximo golpe recebido (depois volta ao normal e a contagem reinicia). Vale contra monstros, chefes, PVP e Cooperativo. Novos itens exclusivos: Marreta Gravítica (arma), Tiara Cósmica (elmo), Sobretudo Cósmico (peitoral), Calça Cósmica (calças) e Cuturno Intergaláctico (botas)",
            "Informações do Combate ganhou mais 2 números: Pressão Gravitacional (quantas vezes você acumulou uma marca no oponente) e Ataques sob Gravidade Máxima (quantos dos seus próprios ataques se perderam por estar sob esse efeito)",
            "Tela de 'Escolha sua Classe' redesenhada: virou um carrossel horizontal (setas ou arrastar com o mouse/touch) em vez de uma grade que empilhava linha após linha a cada classe nova — os retratos também ficaram bem maiores",
            "Clicar no retrato de um jogador no Ranking ou no Ranking Global agora expande ele no centro da tela, igual já acontecia com o retrato do personagem e do pet no Inventário"
        ]
    },

    {
        version: "Beta 0.2.3 — Talentos Únicos",
        date: "Outubro de 2026",
        changes: [
            "Árvore de Talentos: nova linha de Talentos Únicos, abaixo da conversão de vida. Só libera depois de deixar algum talento simples em 3/3. Cada um custa 1.000.000 de ouro, é tudo ou nada (1/1) e só um dos dois pode estar ativo por vez",
            "Rompendo Limites: libera o nível máximo até 110 (o normal é 100)",
            "Cara ou Coroa?: sorteia um atributo especial que não é o principal da sua classe e soma +8% nele",
            "Resetar os talentos com um talento único ativo custa 500.000 de ouro a mais que o reset normal, e desfaz os dois de uma vez",
            "Resetar o talento Rompendo Limites também devolve o personagem pro nível 100, desfazendo os status ganhos acima disso",
            "Corrigido o XP ficando acumulado pra sempre (e a barra mostrando 'X / 0') quando um ganho grande de XP cruzava o nível máximo de uma vez",
            "Cooperativo: Dragão Solaria, Dragão de Tenebris e Dragão Yggdrasil (andares 5, 6 e 7) mais difíceis — mais vida, armadura, agilidade e dano dos ataques, crescendo a cada andar",
            "Pets: a fome agora cai 10 pontos a cada 20 minutos (antes a cada 50)",
            "Conquistas novas: Qual é o seu talento?, Chocolate, Rompendo limites, Uma lenda (Poder acima de 45 mil) e Pai e filho (duas classes no nível 100 na mesma conta)",
            "Aviso único ao entrar no jogo, com uma recompensa pra coletar (ouro, ração de pet e um Pet Exclusivo)",
            "Mago: +13 de Agilidade ao longo dos níveis 66 a 100. Bárbaro: enfraquecido nos níveis 94 a 98 — personagens já existentes são atualizados sozinhos ao carregar",
            "Arqueiro: armadura reduzida — itens lendários, bônus de transcendência e a curva de nível, todos um pouco mais fracos. Personagens já existentes são atualizados sozinhos ao carregar",
            "Corrigido o modal de recompensa (o que aparece depois de toda luta), a confirmação de talento único/Portal da Luz e das Trevas, e o de dungeon concluída ficando cortados em telas com pouca altura — como uma janela de navegador mais curta ou um tablet — sem conseguir rolar pra ver o botão de baixo",
            "Corrigido o mesmo problema na tela da Cidade: em telas mais baixas os cards de Ferraria/Mercado/Saúde ficavam cortados em cima e embaixo",
            "Corrigido um personagem podendo voltar pro nível salvo mais antigo ao entrar de novo (ex: perder o nível 101+ do Rompendo Limites) quando o jogo era fechado ou recarregado logo depois de salvar — o envio pra nuvem roda em segundo plano e podia não ter terminado ainda",
            "Guerreiro: +200 de Vida ao longo dos níveis 5 a 100, e 50 de Agilidade a menos (itens místicos e lendários de Calças/Botas, e o upgrade de classe). Personagens já existentes são atualizados sozinhos ao carregar",
            "Guerreiro: +64 de Armadura (itens lendários de Capacete/Peitoral/Calças/Botas, upgrade de classe e a curva de nível). Arqueiro: -19 de Armadura (itens lendários e upgrade de classe), pra não ficar tão perto do Guerreiro nesse atributo. Personagens já existentes são atualizados sozinhos ao carregar",
            "Guerreiro: -10 de Armadura dos itens lendários, e -10 de Ataque do upgrade de classe, depois de testes de PVP mostrarem ele forte demais. Personagens já existentes são atualizados sozinhos ao carregar",
            "Pútrido: +33 de Ataque na curva de nível entre os níveis 80 e 100 (ganho crescente, maior quanto mais perto do 100). Personagens já existentes são atualizados sozinhos ao carregar",
            "Poção Grande passa a aparecer na loja pra comprar assim que o primeiro dragão do Cooperativo (Dragão Abissal) for vencido uma vez",
            "Corrigido o card da Dungeon e o da Cidade (Saúde) ficando sozinhos numa segunda linha em telas entre 768px e 992px de largura — os cards encolhem um pouco nessa faixa pra caber os 3 numa linha só, e quando sobra só 1 card (ex: Portal da Luz/Trevas) ele fica centralizado em vez de preso na esquerda",
            "Em telas entre 768px e 992px de largura, o menu de cima (ícones), o menu de baixo (Personagem/Dungeons/Cidade/...), o painel de status do personagem e a logo da tela de carregamento ficam um pouco menores",
            "Chat: novo botão de emojis ao lado do campo de mensagem — abre uma gradinha pra inserir na posição do cursor, sem fechar depois de cada clique. O painel do chat ficou um pouco mais largo pra caber o botão",
            "Escolher um Talento Único agora espera a nuvem confirmar o salvamento antes de liberar normalmente — antes disso o salvamento rodava em segundo plano sem aviso nenhum se falhasse, o que já fez algum jogador perder o Rompendo Limites ao trocar de aparelho logo depois de escolher",
            "Cooperativo: o pet de cura agora foca em quem está com a vida atual mais baixa do squad, em vez de sortear um alvo qualquer",
            "Cooperativo: o host agora pode começar a raid com 3 jogadores na fila, sem precisar esperar o 4º — basta clicar em 'Iniciar com 3 jogadores'",
            "Corrigido o convite de um substituto (vaga de quem saiu entre andares) às vezes falhando quando o resto do squad já estava todo pronto — entrar na sala e avançar o andar viraram uma escrita só, em vez de duas que podiam correr uma contra a outra",
            "Nova Zona de Perigo nas Configurações (tela inicial): botão pra excluir a conta inteira — login, todos os personagens, álbum, conquistas, tudo, pra sempre. Exige digitar 'EXCLUIR' e confirmar a senha antes do botão liberar",
            "Anel e Amuleto agora têm duas variantes, dropadas pelas mesmas dungeons de antes: Primal (foco em Ataque e Agilidade) e Moderno (foco em Vida e Armadura)",
            "Novas fontes garantidas do Anel/Amuleto Moderno: Caverna I e IV (anel comum/incomum), Caverna II e V (amuleto comum/incomum), Oceano I (anel e amuleto raros), Boss do Vulcão (amuleto místico) e Boss do Inferno (anel místico) — além dos drops que já existiam. Dragão Varejeiro e Dragão de Indra, no Cooperativo, agora podem soltar tanto anel quanto amuleto lendário",
            "Corrigido o Anel/Amuleto que já estava equipado antes da atualização acima ficando com ícone quebrado e preso nos atributos antigos — a criação das duas variantes mudou o identificador interno desses itens, e quem já tinha um não era mais reconhecido. Personagens afetados são corrigidos sozinhos ao carregar",
            "Tooltip de drop das dungeons: o atributo Vida estava sem ícone (❤️) — mesma correção aplicada na tooltip de item",
            "Novo botão 'Informações do Combate' depois de cada luta (Dungeons, PVP 1x1, PVP 2x2 e Cooperativo), com 14 números — dano causado, recebido, mitigado pela armadura, real (sem a armadura do alvo), absorvido e vida roubada; quantidade de esquivas, Absorções, Críticos, Imitações, Miasmas e Roubos de Vida; e cura/dano do pet — some ao continuar ou sair da tela",
            "Informações do Combate ganhou uma aba 'Gráfico': linha por rodada pra cada um dos 14 números, escolhendo uma métrica por vez numa lista colorida",
            "Novo Correio: ícone de envelope na tela inicial, com caixa de entrada (até 3 itens por carta, 30 dias pra coletar antes de expirar). Enviar carta ainda está restrito à administração por enquanto",
            "Convite do Cooperativo: novo botão ao lado do campo de nome que abre a lista dos jogadores online e com nível suficiente pra entrar — clicar num nome já preenche o campo",
            "Pets: XP necessária pra subir de nível entre o 25 e o 49 ficou 25% mais cara (além do dobro que já valia a partir do 18, os dois juntam: 2,5x a curva normal nessa faixa)",
            "Nova classe: Louca — o maior Ataque e Agilidade do jogo, mas a menor Armadura e Vida de todas. Atributo exclusivo Confusão: chance a cada golpe certeiro de deixar o alvo confuso até o próximo ataque dele, que sai sorteado entre acertar o oponente de sempre (+20% de dano), acertar a si mesmo (+50% de dano) ou errar por completo. Vale contra monstros, chefes, PVP e Cooperativo. Novos itens exclusivos: Marreta Biônica (arma), Óculos Tontos (elmo), Camisa de Força (peitoral), Calça Jagger (calças) e Chinelo (botas)",
            "Louca: +7 de Armadura e -8 de Ataque a partir do nível 51 (chegando a +9/-10 no nível 110), depois de simulações de PVP mostrarem ela perdendo quase sempre pro Guerreiro e pro Pútrido em níveis altos. Personagens já existentes são atualizados sozinhos ao carregar",
            "Louca: -45 de Agilidade na curva de nível até o nível 100 (mais -4 entre 101 e 110) — personagens de fim de jogo (equipamento + anel/amuleto + pet + talentos somados) estavam passando de 500 de Agilidade. Personagens já existentes são atualizados sozinhos ao carregar",
            "Informações do Combate ganhou mais 2 números: Confusão (quantas vezes você confundiu o oponente) e Ataques confusos (quantos dos seus próprios ataques saíram errados por estar confuso)",
            "Poções: agora são 6 tipos (Pequena, Tripla Pequena, Média, Tripla Média, Grande e Tripla Grande), e os drops das dungeons e chefes foram reorganizados pra escalar com o nível — Pequena até o nível 18, Tripla Pequena do 20 ao 38, Média do 40 ao 68, Tripla Média do 70 ao 100",
            "Corrigido o item Tripla Poção Pequena, que estava com identificador, nome e ícone errados (copiados da Poção Pequena), e a raridade da Tripla Poção Média, que aparecia como 'Raro' em vez de 'Místico'",
            "Vender Pet (Mercado), Veterinário (Saúde) e a aba Pets da tela de Personagem agora só ficam disponíveis a partir do nível 30, mesmo nível que libera a Fazenda",
            "Novo Jogo: quando todos os personagens da conta já estão em uso, a confirmação de sobrescrever agora mostra nome, classe e nível de quem seria sobrescrito, em vez de perguntar às cegas",
            "Removido o aviso único 'Aviso de Balanceamento' (pedido de desculpas pela remoção do Rei dos Encantamentos e ajuste do Cara ou Coroa?, com recompensa em ouro, ração e um pet exclusivo) — quem ainda não tinha coletado não recebe mais essa recompensa",
            "XP necessária pra subir de nível ficou mais cara entre os níveis 20 e 100 — 10% do 20 ao 50, 20% do 51 ao 70, 25% do 71 ao 79, 30% do 80 ao 89 e 35% do 90 ao 100. A XP ganha em combate não mudou, só o quanto precisa pra passar de nível"
        ]
    },

    {
        version: "Beta 0.2.2 — Personagens",
        date: "Outubro de 2026",
        changes: [
            "Conta com até dois personagens: o primeiro é grátis e o segundo fica bloqueado até ser liberado nesta conta",
            "Cartas e conquistas são da conta: o que você descobre ou desbloqueia num personagem vale pros outros também",
            "Ouro, nível, equipamento, inventário, pet, fazenda e talentos são de cada personagem",
            "Ranking: cada personagem aparece separado, com o próprio Poder",
            "Tela Continuar: mostra os personagens da conta e permite criar o segundo quando ele estiver liberado",
            "Novo Jogo: usa o primeiro slot livre; só pede confirmação quando todos estão ocupados",
            "Conta: uma sessão antiga (aba ou aparelho que perdeu a conta) não sobrescreve mais o progresso da sessão nova na nuvem",
            "Conta: se a nuvem tiver uma versão mais nova que a desta sessão, o save é recusado com um aviso em vez de substituir o progresso",
            "Transcendência: quem já venceu o Portal da Luz ou das Trevas recebe a diferença quando os valores do bônus mudam, em vez de ficar com os números antigos",
            "Slot extra: ao clicar no slot bloqueado, aparece o pagamento via Pix (R$ 5,00) com QR code e botão pra copiar o código. A liberação é manual: envie o comprovante com seu nick no WhatsApp",
            "Slot extra: o pagamento ainda é manual e em fase de testes, então o valor é simbólico",
            "Pet Boitatá (5★): vida dos níveis 30 a 50 dobrada, +12 de dano entre os níveis 38 e 50, +7 de agilidade entre os níveis 18 e 50 e +6 de armadura entre os níveis 30 e 50",
            "Pet Urso (4★): +16 de armadura, +2 de dano e +2 de agilidade ao longo da evolução",
            "Pet Duende: perde toda a vida que ganhava na evolução, +4 de dano, −1 de armadura e +2 de agilidade ao longo da evolução",
            "Pet Aranha: perde toda a vida que ganhava na evolução, +5 de dano e +5 de agilidade ao longo da evolução",
            "Pet Aranha: volta a ganhar vida na evolução — +120 de vida entre os níveis 10 e 50",
            "Mago: +300 de vida ao longo dos níveis 1 a 100 — personagens já criados recebem a diferença ao carregar"
        ]
    },

    {
        version: "Beta 0.2.1 — Segurança",
        date: "Outubro de 2026",
        changes: [
            "Conta: recuperar a senha agora pede só o e-mail — o link de redefinição chega na sua caixa de entrada. A Palavra de Recuperação deixou de existir e não é mais pedida no cadastro",
            "Conta: os dados antigos de recuperação (data de nascimento, telefone e Palavra de Recuperação) foram apagados do servidor — ficavam acessíveis a quem soubesse o e-mail da conta",
            "Conta: a tela de recuperar senha não revela mais se um e-mail tem cadastro no jogo",
            "Conta: o cadastro não pede mais telefone nem data de nascimento — o jogo só guarda e-mail e nome. Os dados antigos dessas contas são apagados no próximo login",
            "PVP e Cooperativo: corrigida uma falha que permitia a um jogador mal-intencionado executar código na tela de quem fosse pareado com ele, usando o nome do personagem — nome, imagem, nível e atributos de outros jogadores agora são filtrados antes de aparecer",
            "Ranking: o mesmo filtro passou a valer para o ranking e para o perfil dos jogadores (lupa)",
            "Chat: mensagens enviadas com o nome de outro jogador aparecem riscadas e com um aviso ao lado do nome",
            "Chat: fechada uma brecha que permitia burlar o intervalo de 3 segundos entre mensagens e o bloqueio de mensagem repetida",
            "Saves com valores impossíveis (nível acima de 100, ouro negativo, cartas que não existem) são corrigidos ao carregar",
            "Fila, partidas e convites do PVP e do Cooperativo agora exigem login — antes ficavam acessíveis a qualquer pessoa na internet, mesmo sem conta",
            "Convites do Cooperativo: ninguém mais consegue listar os convites pendentes dos outros jogadores",
            "Nomes de personagem: não é mais possível reservar um nome em nome de outra conta, nem transferir a reserva pra outra pessoa",
            "Ranking: o servidor passou a recusar entradas com formato inválido (nome longo demais, nível fora de 1 a 100, Poder negativo)",
            "Sessão: o registro de 'quem está online' só aceita os dados que o jogo realmente usa",
            "O jogo passou a executar apenas scripts dele mesmo e do Firebase (política de conteúdo), e os arquivos externos de ícones e gráficos são conferidos antes de carregar"
        ]
    },

    {
        version: "Beta 0.2",
        date: "Outubro de 2026",
        changes: [
            "Nova classe: Pútrido — o especial dele é o Miasma: cada ativação intoxica o alvo (até 4 acúmulos), tirando Ataque, Agilidade e Armadura, além de enfraquecer os atributos especiais até o fim da luta e cortá-los pela metade no golpe seguinte",
            "Miasma: agora vai até 4 acúmulos (era 3) e também reduz a Armadura do alvo, não só Ataque e Agilidade — em Dungeons/Cooperativo os valores são 5/10/15/20%, no PVP 3/6/9/15%; o corte dos atributos especiais (Crítico, Roubo de Vida, Penetração, Absorção) do alvo intoxicado também dobrou, de −25% pra −50% enquanto durar a Intoxicação",
            "Nova classe: Mímico — o especial dele é a Imitação: soma uma % do Ataque, Armadura e Agilidade de quem ele está enfrentando aos status dele mesmo, recalculado a cada golpe",
            "Mímico: a % copiada pela Imitação tem um teto de 30%, definido pela arma e pelo elmo equipados (quanto maior a raridade e a Qualidade, mais perto do teto)",
            "Pútrido e Mímico ganharam transcendência (Portal da Luz/Trevas)",
            "Corrigido o Mímico não recebendo a melhoria de classe mesmo vencendo o Anjo — a vitória no Portal agora sempre tenta aplicar o bônus (não só na primeira vez), resolvendo também quem tinha ficado travado por esse bug antes da correção",
            "Mímico: Vida por nível reduzida (12 → 9), cerca de 300 a menos no nível 100 — personagens já existentes são atualizados sozinhos ao carregar o save",
            "Absorção (Guerreiro): agora absorve o golpe inteiro contra monstros e chefes, e metade contra jogadores",
            "Golpe Crítico agora multiplica o dano por 1,6x (era 1,5x)",
            "Rebalanceamento de transcendências: Mago −5 de Ataque, Arqueiro +10 de Ataque e +5 de Agilidade, Bárbaro +10 de Ataque e mais Vida",
            "Guerreiro: mais Agilidade na Calça e nas Botas Místicas, pra encarar os chefes a partir do nível 70",
            "Pets: a cura do Duende e a queimadura do Boitatá agora crescem com o pet (nível de evolução + nível atual — até 82 no nível 50); mordida do Lobo aumentada",
            "Pedra Rubi (Vida) aumentada pra 50/150/300 — armas já encantadas são atualizadas sozinhas ao carregar o save",
            "Anjos Caídos com 500 de Vida a menos; chefes do Cooperativo mais resistentes",
            "Cooperativo: corrigido trocar de pet entre andares (vida acima do máximo, habilidade do pet errado); lutas longas aceleram pra 2x depois de 1 minuto e 4x depois de 2, e depois de uns 4 minutos as mensagens de combate somem (só a vida atualiza), já que no 4x elas ficavam rápidas demais pra ler",
            "PVP 2x2: mensagens de combate não ficam mais escondidas atrás dos cartões de vida",
            "Novo padrão de cores das mensagens de combate: normal, crítico, cura e pet cada um com sua cor",
            "Tooltips: atributos especiais zerados não aparecem mais nos itens, e as explicações dos atributos foram atualizadas",
            "Chat: a aba do navegador mostra quantas mensagens novas chegaram; corrigido o botão do chat sem clique na Fazenda",
            "Conta: sair da conta agora salva e limpa os dados do navegador, evitando puxar o personagem de outra conta",
            "Conta: sua sessão agora é única — abrir a mesma conta em outra aba ou dispositivo pergunta se quer desconectar a sessão anterior e continuar ali (igual ao WhatsApp Web), evitando duas abas sobrescrevendo o progresso uma da outra",
            "Corrigido o aviso de sessão em uso ficando escondido atrás da tela de 'Carregando...' e nunca aparecendo",
            "Adicionado o Ranking Global (ícone de globo na barra de ferramentas): lista todos os jogadores do servidor por Poder, com uma bolinha verde/vermelha mostrando quem está online agora",
            "Adicionadas 2 novas conquistas de Ouro: 'Instinto Superior' (Poder acima de 32 mil) e 'Quase um senhor' (nível 50 com o Pet)",
            "Guerreiro: mais Armadura nos itens Místicos e Lendários, +27 de Vida e −18 de Agilidade a partir do nível 70 (metade vindo dos níveis, metade dos equipamentos) — ajuste fino depois do reforço de Agilidade desta mesma atualização",
            "Adicionados dois novos slots de equipamento, Anel ('Anel do Primeiro Imperador') e Amuleto ('Amuleto Primal') — usáveis por qualquer classe: o anel soma Vida e Armadura, o amuleto soma Ataque e Agilidade",
            "Anel e Amuleto dropam com 5% de chance em 8 pontos fixos: Bosque (andar 3), Caverna (andar 6), Oceano (andares 2 e 3), Deserto (andar 3) e os chefes dos níveis 10, 20 e 90 — raridades de Comum a Místico",
            "Inventário: nova aba 'Acessórios' (Anel e Amuleto), visível só nas abas Status e Equipados",
            "Ferraria: nova aba 'Acessórios' na Melhoria de Equipamento, permitindo melhorar Anel e Amuleto até Lendário",
            "Ranking: a lupa de detalhe do jogador agora mostra também o Anel e o Amuleto equipados",
            "Adicionado novo chefe do Cooperativo: Dragão Varejeiro (elemento Inseto, 3º andar) — dropa Anel ou Amuleto Lendário",
            "O pet Boitatá agora também é super efetivo (+70% de dano na queimadura) contra criaturas do tipo Inseto",
            "Pútrido: +20 de Vida, +3 de Ataque, +4 de Armadura e +4 de Agilidade pelos níveis 70-100, mais +4 de Ataque (arma), +4 de Armadura (elmo/peitoral/calça/botas) e +4 de Agilidade (calça/botas) nos itens Místicos — a classe estava ficando frágil demais contra os chefes dessa faixa",
            "Pútrido: mais +5 de Armadura, concentrados nos níveis 78-83 — reforço extra bem localizado, nesse trecho em que a dificuldade sobe mais rápido",
            "Pútrido: mais +12 de Vida nos níveis 44, 45, 50, 60 e 65, além de +1 de Ataque (nível 50) e +1 de Armadura (nível 45)",
            "Pútrido: mais +100 de Vida nos níveis 50-100 — ainda estava muito atrás da Vida dos chefes do Cooperativo nessa faixa",
            "Pútrido: +10 de Agilidade (5 na Calça, 5 na Bota) nos itens Místicos e Lendários",
            "Pútrido: mais +100 de Vida (em todos os níveis) e +40 de Agilidade (espalhados pela curva inteira) — mesmo com Anel e Amuleto, ele ainda ficava atrás do Arqueiro em Agilidade e quase empatava em Vida",
            "Cidade: a Enfermaria agora fica no card Saúde, e o novo Veterinário (🐾) converte um pet em Ração de Pet — a Ração guarda toda a XP do pet e dá essa XP ao pet equipado. O preço sobe com o nível e as estrelas do pet",
            "Veterinário: converter um pet agora pede confirmação antes, avisando que o pet vai desaparecer",
            "Mercado: novo menu Vender Pet — vende só pets chocados, por 25 mil por estrela a partir da 3ª + 800 por nível. A tela mostra todas as informações do pet (descrição, atributos, habilidade) antes da venda",
            "Veterinário: o preço da conversão passou a 50 mil por estrela a partir da 3ª + 1 mil por nível",
            "Ração de Pet: fica na aba Comidas e mostra a XP armazenada na tooltip",
            "Cooperativo: a busca mostra quem está na fila esperando, e entre os andares aparece quem já confirmou o Continuar e quem ainda não confirmou",
            "Nova Árvore de Talentos (barra de ferramentas, entre o Global e o Álbum): cada região concluída (3 fases + boss, 3 vitórias em cada) dá 1 ponto. Cada ponto gasto num talento dá 1% da vida máxima em Dano de ataque, Armadura ou Velocidade e tira 3% da vida máxima (até 3 pontos por talento). Cada nível custa ouro: 50 mil, 70 mil e 100 mil",
            "Fazenda: rebalanceado o rendimento das colheitas — culturas longas agora rendem mais itens, e a Batata rende menos. O lucro por hora de cada fruta ficou bem mais parecido (antes ia de 292 a 7.440 por hora)",
            "Fazenda: 4 novas culturas — Berinjela (20 min), Cenoura (1h30), Laranja (6 horas) e Melancia (24 horas), com sementes no Mercado. A conquista Quitandinha agora pede os 12 alimentos",
            "Árvore de Talentos: clicar num talento seleciona e mostra o preço dele; o botão Melhorar confirma. Resetar custa 100 mil de ouro e pede confirmação",
            "Miasma: além de Ataque e Agilidade, agora também reduz a Armadura do alvo em Dungeons e Cooperativo — assim o próprio Pútrido passa a bater mais forte em quem já está intoxicado, não só apanhar menos (sem mudança no PVP)",
            "Novo chefe do Cooperativo: Dragão de Indra (elemento Energia, 4º andar); os 7 dragões agora dropam cada um um item Lendário diferente (Botas, Calça, Anel, Amuleto, Peitoral, Elmo e por último, no 7º andar, a Arma)",
            "Wiki: adicionado o Mímico, a nova seção de Acessórios (Anel e Amuleto) e atualizadas as seções de Classes, Itens, Pets, Ferraria, Cooperativo, Salvar e Ranking",
            "Pets: do nível 18 ao 50 cada nível agora custa o dobro de XP; em troca, a Vida que o pet ganha depois do nível 18 vale o triplo",
            "Cooperativo: os três últimos dragões ficaram mais fortes — Solaria (5º andar), Tenebris (6º) e Yggdrasil (7º) causam +32% de dano em todos os golpes, e o Yggdrasil ganhou +100 de Armadura",
            "Cooperativo: o primeiro da fila agora é o host da sala (coroa ao lado do nome) — só ele pode tirar um jogador da fila pelo X e convidar pelo botão Convidar das vagas livres",
            "Cooperativo: convite por nome — o convidado recebe um aviso com o andar e quantas pessoas estão na sala e escolhe Sim ou Não (30 segundos pra responder). O convite avisa quando o nome não existe, o jogador está offline ou ainda não chegou ao nível 100",
            "Cooperativo: um jogador sair entre os andares não encerra mais a run — abre uma vaga, e o host pode convidar um substituto (que entra direto no andar seguinte) ou seguir com o squad que ficou. Se o host sair, o próximo da ordem assume",
            "Cooperativo: a tela de confirmação entre andares ganhou o botão Sair do Cooperativo, e o host pode remover um jogador da sala pelo X ao lado do nome"
        ]
    }

];
