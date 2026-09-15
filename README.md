# Game Teteu — Parkour com Seek

## Testar no microStudio
1. Abra https://microstudio.dev/projects/projetoparkourlouco/code/ e confirme que a linguagem do projeto é JavaScript.
2. Copie todo o conteúdo de main.js para o arquivo principal de código, substituindo a versão anterior.
3. Reinicie a execução e clique na área do jogo para ela receber o teclado.

Controles: W/↑ avança, S/↓ recua, A/D anda de lado, ←/→ gira a câmera e espaço pula. As letras usam posições físicas WASD.

Correções: câmera alinhada ao avanço, rotação coerente, A/D sem rotação acidental e velocidade diagonal normalizada.

Esta cópia foi feita a partir do código fornecido na conversa. Não foi sincronizada com o editor online. Saltos, colisões e objetivos mantêm os parâmetros originais; o alcance do salto e a colisão vertical ainda precisam de revisão.

## Verificação local
Execute node tests/controls.cjs. O teste usa as APIs de teclado e desenho simuladas; o teste visual final é no microStudio.

## Skills locais
As skills estão em .agents/skills. A skill microstudio-javascript orienta edição e integração; parkour-controls orienta câmera e testes de movimento.

Referências: https://microstudio.dev/documentation/ e https://microstudio.dev/documentation/API/
