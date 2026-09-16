---
name: microstudio-javascript
description: Editar e preparar o jogo JavaScript deste projeto para testes no microStudio, preservando suas APIs de runtime.
---
# microStudio JavaScript

- O arquivo main.js contém o código completo para o editor microStudio. Preserve os callbacks globais init, update e draw e as APIs screen e keyboard; não introduza DOM, imports ou require no código do jogo.
- Leia README.md para o endereço do projeto e o fluxo de transferência. Uma cópia local não comprova sincronização com o editor online.
- A documentação oficial em https://microstudio.dev/documentation/ define update a 60 Hz e draw separado da lógica. Mantenha a física em update.
- Para entradas distintas, use KEY_W/KEY_A/KEY_S/KEY_D e ARROW_UP/ARROW_DOWN/ARROW_LEFT/ARROW_RIGHT. UP/DOWN/LEFT/RIGHT combinam letras e setas no runtime; não use LEFT/RIGHT para rotação se A/D forem movimento lateral.
- Confirme APIs adicionais em https://microstudio.dev/documentation/API/ ou no código público do runtime. O preview precisa de foco para receber teclas.
- Rode node tests/controls.cjs ao alterar controles ou projeção. Informe separadamente verificações locais e testes efetivamente realizados no editor.

## Cenas, desenho e reinício

- `init()` abre o menu; `startGame()` reinicia diretamente a partida. Use `startGame()` nos testes de movimento para não testar um jogador bloqueado no menu.
- `scene` controla menu, lobby, settings, intro, playing, jumpscare, defeat e victory. Lobby usa movePlayer() sem perseguição; apenas playing executa `updateGame()`.
- `changeScene()` zera o relógio da cena, cancela sons e limpa a repetição do volume. `resetGame()` reinicia jogador, Seek, chave, porta e perseguição, preservando o volume.
- Iniciar, pular introdução e reiniciar usam `previousKeys` para detectar uma nova pressão. Segurar espaço não deve iniciar e pular a introdução na mesma ação.
- Os tempos são contados em updates: atualmente 540 frames de introdução e 75 de jumpscare. Sincronize batidas visuais e sonoras; dispare áudio em update, não em draw.
- `drawSeekFigure()` usa polígonos e é compartilhado pela introdução, partida e jumpscare. Confira a aparência nas diferentes escalas ao modificá-lo.

## Áudio e configurações

- Centralize efeitos em `sound()`, inclusive o jumpscare. O projeto usa `audio.beep`, sem arquivos externos.
- O volume da interface vai de 0 a 100. A curva atual é `(volume / 100)^2 * strength`; o comando textual do beeper recebe esse ganho multiplicado por 100. Já `audio.playSound` usa volume de 0 a 1.
- Em 0%, não emita novos sons. Ao ajustar, `previewVolume()` cancela o teste anterior antes de tocar outro. T permite ouvir o nível escolhido.
- Ajustes contínuos precisam de repetição por frames: detectar apenas uma nova pressão muda o volume só uma vez ao segurar. Atualmente ←/→ ou A/D ajustam imediatamente, repetem após 24 frames e depois a cada 12, limitados a 0–100.
- O volume permanece ao reiniciar partidas; não há persistência entre execuções. O navegador pode precisar de um clique na área do jogo para ativar o áudio.
- Para diagnosticar o beeper, consulte [beeper.js](https://github.com/pmgl/microstudio/blob/master/static/js/runtime/audio/beeper.js) e [audio.js](https://github.com/pmgl/microstudio/blob/master/static/js/runtime/audio/audio.js).

## Verificação

- Execute `node tests/game-flow.cjs` ao mudar cenas, introdução, áudio ou reinício. Ele cobre transições, teclas seguradas, limites, silêncio e intensidade enviada à API simulada.
- Execute também `node tests/controls.cjs` ao mudar movimento ou desenho compartilhado. Os testes não comprovam aparência, som audível ou sincronização com o editor online.
- Se Node não estiver no PATH, procure um executável instalado no ambiente antes de instalar dependências. Os testes usam apenas módulos nativos.

## Transferência e cenário

- main.js é a fonte principal; mantenha JOGO_COM_LOBBY.txt idêntico após alterações. Já houve uma aba antiga sobrescrevendo o arquivo: compare o conteúdo salvo antes de atribuir a diferença ao microStudio.
- enterLobby() seleciona lobbyMap; resetGame() restaura parkourMap, postura e progresso. E perto da porta inicia a introdução; configurações devem retornar ao lobby sem reiniciá-lo.
- doorBlocks() gera portas 3D; drawKeySprite() desenha a chave; drawGuidingLight() aponta para a próxima plataforma ou objetivo. hotelScenery() é decorativo. Preserve a distinção entre desenho e colisão.
- Leia ESTADO_DO_PROJETO.md na raiz para pendências e estado da última sessão.
