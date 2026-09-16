# Game Teteu — Parkour com Seek

## Testar no microStudio
1. Abra https://microstudio.dev/projects/projetoparkourlouco/code/ e confirme que a linguagem do projeto é JavaScript.
2. Copie todo o conteúdo de main.js para o arquivo principal de código, substituindo a versão anterior.
3. Reinicie a execução e clique na área do jogo para ela receber o teclado.

Controles: W/↑ avança, S/↓ recua, A/D anda de lado, ←/→ gira a câmera e espaço pula. As letras usam posições físicas WASD.

Correções: câmera alinhada ao avanço, rotação coerente, A/D sem rotação acidental e velocidade diagonal normalizada.

As plataformas são desenhadas como blocos em perspectiva, com topo mais claro e laterais sombreadas. O volume usa a mesma largura, altura e profundidade das colisões.

O pulo foi ajustado para uma força moderada (0.55). Nas travessias mais longas, avance um pouco em direção à próxima plataforma antes de pular. Solte W/↑ quando estiver sobre a plataforma para cair nela. O personagem também começa na altura correta do chão, permitindo pular imediatamente.

O mapa tem 12 plataformas numeradas, curvas, subidas graduais e um minimapa da rota. Caixas alaranjadas podem ser saltadas ou contornadas; uma passagem baixa amarela protege a saída. Segure **Q para agachar**: a câmera baixa e o movimento fica mais lento. Não é possível pular agachado nem levantar sob um teto. Há uma passagem de treino à direita no lobby.

Os blocos têm colisão lateral, pouso e colisão com a cabeça; chave e saída respeitam a altura do jogador.

`main.js` é a fonte principal. `JOGO_COM_LOBBY.txt` é uma cópia para transferência e deve permanecer idêntica. Não há sincronização automática com o microStudio. Se a aba mostrar código antigo, reabra o arquivo salvo sem sobrescrevê-lo com a aba desatualizada.

## Fluxo do jogo

O jogo abre no menu: espaço entra no lobby, uma área segura para andar e treinar saltos nos blocos dourados. C abre o som e M volta ao menu. Aproxime-se da porta de madeira e pressione E para iniciar a introdução de 9 segundos (espaço pula a cena). O Seek aparece perseguindo o jogador e depois bate na porta antes da partida começar.

A perseguição acelera com passos e batimentos; as batidas ficam mais fortes, a porta racha e começa a abrir. O Seek tem olho único detalhado, reflexos, garras e membros animados, com o mesmo desenho na introdução, na partida e no jumpscare.

Pressione C no menu ou na tela de resultado para configurar o volume com ←/→ ou A/D (0% silencia). Segurar a tecla repete o ajuste; T toca um som de teste no volume escolhido. Espaço volta. Clique na área do jogo para ativar o áudio se necessário. Os efeitos são sintetizados no código, sem arquivos de áudio adicionais; o volume vale também para o jumpscare. A preferência é mantida ao jogar novamente durante a execução.

Após uma derrota há um jumpscare e uma tela de reinício. R ou espaço reinicia diretamente a partida; M retorna ao menu. Essas opções também aparecem na vitória.

## Verificação local

Execute `node tests/game-flow.cjs` para verificar menu, áudio simulado, introdução, derrota e reinício.

Execute `node tests/map.cjs` para simular o percurso inteiro, a vitória e os limites do lobby.
Execute `node tests/obstacles.cjs` para verificar agachamento, caixas e tetos.

Execute node tests/controls.cjs. O teste usa as APIs de teclado e desenho simuladas; o teste visual final é no microStudio.

## Visual da perseguição

O percurso tem piso de madeira, paredes escuras e luminárias de hotel. Uma seta azul e partículas flutuantes indicam a próxima plataforma; no final, guiam até a chave e a saída. As portas do lobby e da saída têm moldura, painéis, maçaneta e espessura em 3D. A chave dourada tem argola, haste e dentes e flutua suavemente. As paredes laterais são cenário decorativo, fora do percurso.

## Skills locais
As skills estão em .agents/skills. A skill microstudio-javascript orienta edição e integração; parkour-controls orienta câmera e testes de movimento.

Referências: https://microstudio.dev/documentation/ e https://microstudio.dev/documentation/API/

## Retomar o desenvolvimento

Veja [ESTADO_DO_PROJETO.md](ESTADO_DO_PROJETO.md) para o resumo da sessão de 15/09/2026, limites conhecidos e próximos testes manuais.
