# Game Teteu — Parkour com Seek

## Testar no microStudio
1. Abra https://microstudio.dev/projects/projetoparkourlouco/code/ e confirme que a linguagem do projeto é JavaScript.
2. Copie todo o conteúdo de main.js para o arquivo principal de código, substituindo a versão anterior.
3. Reinicie a execução e clique na área do jogo para ela receber o teclado.

Controles: W/↑ avança, S/↓ recua, A/D anda de lado, ←/→ gira a câmera e espaço pula. As letras usam posições físicas WASD.

Correções: câmera alinhada ao avanço, rotação coerente, A/D sem rotação acidental e velocidade diagonal normalizada.

As plataformas são desenhadas como blocos em perspectiva, com topo mais claro e laterais sombreadas. O volume usa a mesma largura, altura e profundidade das colisões.

O pulo foi ajustado para uma força moderada (0.55). Nas travessias mais longas, avance um pouco em direção à próxima plataforma antes de pular. Solte W/↑ quando estiver sobre a plataforma para cair nela. O personagem também começa na altura correta do chão, permitindo pular imediatamente.

Esta cópia foi feita a partir do código fornecido na conversa. Não foi sincronizada com o editor online. A colisão vertical e a altura exigida pelos objetivos ainda precisam de revisão.

## Verificação local
O jogo abre no menu: espaço inicia uma introdução de 9 segundos (espaço novamente pula a cena). O Seek aparece perseguindo o jogador e depois bate na porta antes da partida começar.

A perseguição acelera com passos e batimentos; as batidas ficam mais fortes, a porta racha e começa a abrir. O Seek tem olho único detalhado, reflexos, garras e membros animados, com o mesmo desenho na introdução, na partida e no jumpscare.

Pressione C no menu ou na tela de resultado para configurar o volume com ←/→ ou A/D (0% silencia). Segurar a tecla repete o ajuste; T toca um som de teste no volume escolhido. Espaço volta. Clique na área do jogo para ativar o áudio se necessário. Os efeitos são sintetizados no código, sem arquivos de áudio adicionais; o volume vale também para o jumpscare. A preferência é mantida ao jogar novamente durante a execução.

Após uma derrota há um jumpscare e uma tela de reinício. R ou espaço reinicia diretamente a partida; M retorna ao menu. Essas opções também aparecem na vitória.

Execute `node tests/game-flow.cjs` para verificar menu, áudio simulado, introdução, derrota e reinício.

Execute node tests/controls.cjs. O teste usa as APIs de teclado e desenho simuladas; o teste visual final é no microStudio.

## Skills locais
As skills estão em .agents/skills. A skill microstudio-javascript orienta edição e integração; parkour-controls orienta câmera e testes de movimento.

Referências: https://microstudio.dev/documentation/ e https://microstudio.dev/documentation/API/
