---
layout: single
title: "Fiz um Jogo de Futebol de Botão Online: Física Determinística, Bot sem IA Treinada, Desafio Diário e Campanha"
author: Sávio Santos
excerpt: "Os bastidores do Peteleco Cards, um futebol de botão online com cartas de poder: como o mesmo chute simula igual no navegador e no servidor, como o computador joga sem rede neural, como o desafio do dia garante que sempre existe solução e como uma campanha de 48 missões virou só configuração."
header:
  teaser: /images/peteleco-cards/partida-super-chute.jpg
---

Quem cresceu no Brasil provavelmente jogou futebol de botão na mesa da cozinha. Eu queria esse jogo no celular, só que online e com um tempero a mais: **cartas de poder**. Daí nasceu o **[Peteleco Cards](https://petelecocards.com.br)**.

A ideia é simples: você mira, puxa o botão como um estilingue e dá o peteleco. A cada turno ganha energia para gastar em cartas como **Super Chute**, **Congelamento**, **Paredão** e **Bomba de Várzea**. Quem fizer dois gols primeiro vence, em partidas de no máximo três minutos. Contra o computador dá para jogar um jogo único ou uma série melhor de 3, e na **Rota do Brasil** você atravessa o país do Norte ao Sul, liberando times pelo caminho.

![Partida do Peteleco Cards com o rastro de fogo do Super Chute](/images/peteleco-cards/partida-super-chute.jpg)

Neste artigo, conto as decisões técnicas mais interessantes do projeto: a física que precisa dar o mesmo resultado em qualquer lugar, um adversário de computador que joga sem nenhum modelo treinado, um desafio diário que nunca sai impossível e uma campanha inteira montada com dados, sem código novo por missão.

---

## 🧱 A Arquitetura em Uma Frase: Regra e Física Moram no Core

O projeto é um monorepo em **TypeScript** com quatro partes principais:

- **`core`**: regras, cartas, energia, sorteios e o **simulador de chute em Matter.js**. Não importa Phaser nem DOM, então roda igual no navegador e no Node.
- **`app`**: o jogo em **Phaser 3** + **Vite**, empacotado para Android com **Capacitor**. O Phaser só desenha e lê o toque; ele **não roda física**.
- **`server`**: **Node.js + Socket.io**, rodando o mesmo `MatchRunner` do core como autoridade das partidas online, com API em Hono e Postgres via Drizzle.
- **`admin`**: um painel próprio com números de uso, replays e ajustes do jogo.

A regra de ouro: **o app nunca decide o resultado**. Ele manda uma *intenção* ("chutar com o botão 3, nessa direção e com essa força"), e o core devolve uma **gravação** do chute, com as posições quadro a quadro e os eventos (gol, explosão da Bomba, choques para o som). O Phaser só toca essa gravação.

```
 Jogador ──intenção──▶ MatchRunner (core) ──▶ simulateShot (Matter.js)
                              │                        │
                              ◀──────── gravação ──────┘
                              │
            App (Phaser) ◀────┴──── toca a animação e o som
```

Isso vale para os três modos. No **online**, o `MatchRunner` roda no servidor e as duas pessoas recebem a mesma gravação. **Contra o computador** e **a dois no mesmo aparelho**, o mesmo `MatchRunner` roda dentro do navegador. Resultado: as regras são idênticas em todos os modos, porque o código é literalmente o mesmo.

---

## 🎯 Física Determinística: o Mesmo Chute, o Mesmo Resultado

Para o servidor conseguir validar uma partida, ou para o painel mostrar o replay de um jogo antigo, **o mesmo chute precisa dar o mesmo resultado sempre**. Física de jogo costuma ser o oposto disso: depende do *frame rate*, da ordem de atualização e de sorteios espalhados pelo código.

As decisões que tornaram o simulador reproduzível:

1. **Passo fixo e fora da tela**: o chute é simulado inteiro de uma vez, em passos fixos de 1/60 s (até 1.200 passos), antes de qualquer animação. A velocidade do celular não influencia o resultado, só a fluidez com que a gravação é tocada.
2. **Gravação enxuta**: a gravação guarda as posições arredondadas com uma casa decimal, a cada dois passos. Ela fica leve para trafegar pelo Socket.io e para salvar no banco.
3. **Aleatoriedade só com seed**: todo sorteio da partida (mão de cartas, por exemplo) vem de um gerador guardado no estado, nunca de `Math.random`. Com a seed e a lista de jogadas, a partida inteira pode ser jogada de novo.
4. **Versão do simulador**: qualquer mudança que altere um resultado (física, regra de carta, posição de formação) incrementa um `simulatorVersion`. Cada gravação guarda essa versão, então dá para saber se um replay antigo ainda reproduz igual.

Na prática, isso rende uma funcionalidade gratuita: quando uma partida local termina, o app envia só a seed, os times e as jogadas. **O servidor não confia no placar**: ele joga a partida inteira de novo e só marca como verificada se o resultado bater. Ponto flutuante entre navegadores diferentes ainda pode divergir em casos raros; quando isso acontece, a partida é salva como não verificada, em vez de ser descartada.

### Física ajustável sem deploy

Quique do botão, quique da bola, freio, peso e força máxima são números inteiros (porcentagem, por mil e peso ×10.000) guardados numa versão de "ajustes do jogo". O painel publica uma versão nova e as próximas partidas já usam, sem gerar outro APK. Como cada partida carrega os ajustes com que começou, uma mudança no meio do dia não quebra o replay de quem já jogou.

---

## 🤖 Um Adversário de Computador sem Rede Neural

Treinar uma IA exigiria milhares de partidas gravadas, que ainda não existem. Então o adversário faz o que um bom jogador de botão faz: **testa jogadas na cabeça antes de chutar**. A diferença é que a "cabeça" dele é o próprio simulador.

A cada vez de jogar, o `BotPlanner`:

1. **Gera candidatos**: os botões mais perto da bola, mirando no gol (centro e cantos) ou em direções aleatórias, com três forças diferentes. Dá algo em torno de **60 chutes**.
2. **Simula cada um** com o mesmo `simulateShot` da partida.
3. **Dá nota ao resultado**: gol vale muito, gol contra tira muito, e ainda contam bola avançada, bola perto da linha do gol e se o rival ficou perto da bola depois do chute.
4. **Refina com as cartas**: pega os melhores chutes e testa de novo com cada carta que pode jogar. Cartas de defesa (Paredão, Barreira, Congelamento) ganham pontos quando a bola fica no próprio campo.
5. **Erra de propósito**: aplica um erro de mira e de força conforme o nível.

Os três níveis são só números:

| Nível   | Erro de mira | Erro de força | Botões testados | Chance de pensar em carta |
|---------|:------------:|:-------------:|:---------------:|:-------------------------:|
| Fácil   | 12°          | 20%           | 1               | 40%                       |
| Médio   | 4°           | 8%            | 3               | 100%                      |
| Difícil | 1°           | 3%            | 4               | 100%                      |

Como esses valores também ficam nos ajustes do jogo, dá para deixar o Difícil mais ou menos cruel pelo painel, sem publicar outra versão. E como simular 60 chutes pode levar alguns instantes num celular fraco, o planejamento é dividido em pequenas tarefas processadas aos poucos, sem travar a tela.

---

## 📅 Desafio do Dia: uma Jogada Igual para Todo Mundo

Um jogo online com pouca gente tem um problema clássico: você entra e não tem ninguém para jogar. O **desafio do dia** resolve isso com um motivo para voltar todo dia que não depende de ter alguém online.

![Tela do desafio do dia](/images/peteleco-cards/desafio-do-dia.jpg)

Todo dia, à meia-noite de Brasília, surge uma jogada montada: você tem dois botões, o rival tem goleiro e alguns defensores parados, você tem até **5 chutes** e uma **carta do dia**. Ganha o ranking quem fizer o gol com menos chutes, e cada pessoa tem 3 tentativas.

As partes técnicas mais divertidas:

- **Gerado pela data**: a seed sai de um *hash* do dia, então o mesmo código gera a mesma jogada no servidor e no admin, que mostra a prévia de amanhã.
- **Nunca impossível**: cada jogada gerada é resolvida antes pelo próprio bot, sem erro de mira. Se ele não resolve em 2 ou 3 chutes, a jogada é descartada. Se resolve em 1, também é descartada, por ser fácil demais. O número de chutes do computador vira a referência na tela.
- **Ranking à prova de trapaça**: o app envia os chutes, não o resultado. O servidor **re-simula a tentativa** com a mesma física guardada para aquele dia e só então grava no ranking.

![Ranking do desafio do dia](/images/peteleco-cards/desafio-ranking.jpg)

---

## 🗺️ Rota do Brasil: uma Campanha Feita de Configuração

Contra o computador faltava um motivo para jogar a próxima partida. A resposta foi uma campanha no estilo das missões de jogos de futebol mobile: **48 paradas** pelo mapa do Brasil, cada uma com rival, campo, objetivo e nível próprios, e até três estrelas por parada (vencer, não sofrer gol e ganhar em até dois minutos). Vencer um rival pela primeira vez libera o time dele, e no fim da viagem estão **Os Gigantes**.

O truque foi não escrever uma regra especial por missão. Cada parada é uma linha de configuração:

```ts
{ region: 'nordeste', rival: 'timbu', field: 'gramado', objective: 'gol_com_carta', level: 'medio', card: 'super_chute' }
```

E cada objetivo vira um `MatchSetup`, que ajusta a partida antes de ela começar: **gol único** muda o número de gols para vencer, **virada** começa o placar em 1 a 0 para o rival, **sem cartas** esvazia a sua mão, **rival com energia cheia** mexe na energia inicial e **tempo curto** corta para 90 segundos sem gol de ouro. O `MatchRunner` não sabe que existe uma campanha; ele só recebe uma partida com outro ponto de partida.

### Três campos, a mesma física

Os campos **terrão** e **molhado** não ganharam um simulador próprio. Cada um é só uma porcentagem aplicada sobre os ajustes de física da partida: no terrão, o freio do botão vai a 160% e o da bola a 240%; no molhado, caem para 55% e 60%. Como o campo entra nos ajustes com que a partida começou, o servidor re-simula igual e o replay do painel sai idêntico, sem nenhuma linha nova no código de validação.

O progresso (estrelas, times e campos liberados) fica no aparelho e no servidor, que junta os dois lados pela melhor nota de cada parada. Para ninguém liberar a campanha inteira com uma requisição, parada nova só é aceita na ordem e no ritmo de uma a cada 45 segundos.

---

## 🧪 Testes para uma Física que Muda Toda Semana

Balancear um jogo de física significa mexer em números o tempo todo, e cada ajuste pode quebrar algo que funcionava. Por isso o core tem uma suíte de testes com **Vitest** cobrindo regras, cartas, simulador, replay, bot, ajustes e desafio, que roda antes de cada `git push`.

Alguns testes nasceram direto de relatos de testadores:

- **Bola presa na quina**: num canto específico, a bola atravessava a parede e sumia embaixo da interface. Hoje o simulador devolve para dentro qualquer peça que passe da parede, e há um teste para cada um dos quatro cantos.
- **Alcance do chute**: com a força máxima, o botão não chegava ao outro lado do campo, e a bola entrava do meio com um toque fraco. Medi o alcance no Matter.js, ajustei força, freio e peso da bola, e o teste agora garante, por exemplo, que a força máxima atravessa o campo.

---

## 🚀 Deploy Barato e Teste de Carga

Tudo roda numa VPS pequena com **Docker Compose**: o servidor Node e o **Caddy** servindo o site com HTTPS. As imagens são buildadas no GitHub Actions e publicadas num registro de containers, e a VPS só baixa e roda. Todos os workflows são manuais (deploy, rollback, backup, APK de teste), e o deploy espera as partidas em andamento terminarem antes de reiniciar o servidor.

Para saber quanto essa máquina aguenta, fiz um workflow de **teste de carga**: robôs jogando partidas reais contra o servidor, enquanto eu acompanhava CPU e memória. Como cada partida só gasta processamento na hora do chute, a máquina mais simples já aguenta algumas centenas de partidas ao mesmo tempo, bem mais do que um jogo indie recém-lançado precisa. Com esse número em mãos, o servidor ganhou um teto de salas e conexões com folga: acima dele, quem chega vê uma mensagem de servidor lotado, e quem já está jogando continua normalmente.

---

## 🎮 Conclusão: Jogue e Me Diga o que Achou

O que mais me surpreendeu no projeto foi quanto uma única decisão, a de **manter física e regras num core determinístico e compartilhado**, simplificou todo o resto: modo online, modo offline, bot, replay no painel, validação de partidas, o desafio diário e os campos da Rota do Brasil são todos o mesmo simulador, usado de jeitos diferentes.

O Peteleco Cards já pode ser jogado **de graça no navegador**, e a versão Android está em teste fechado na Play Store:

🔗 **[petelecocards.com.br](https://petelecocards.com.br)**

Tem também os vídeos curtos no **[YouTube @petelecocards](https://www.youtube.com/@petelecocards)** e no **[TikTok @petelecocards](https://www.tiktok.com/@petelecocards)**, e um **[Discord](https://discord.gg/uUTEYqnnAj)** onde a galera posta o código da sala para jogar online. Se jogar, me conta qual carta você mais usou, ou o que te fez perder para o computador no Difícil. Isso ajuda muito no balanceamento.
