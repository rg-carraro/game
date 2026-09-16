# Estado do projeto — 15/09/2026

## Implementado

- Jogo JavaScript autocontido para microStudio: `init`, `update`, `draw`, sem dependências de jogo externas.
- Menu com corredor, Seek animado, faixas de alerta; configurações de som; vitória, derrota, jumpscare e reinício.
- Lobby seguro: movimento, treino de salto à esquerda, treino de agachamento à direita e porta acionada por E.
- Introdução de nove segundos: perseguição, passos e batimentos, porta rachando e abrindo. Espaço pula a cena.
- Percurso de 12 plataformas com curvas e subidas, numeração, minimapa e progresso. Seek começa a seguir após 180 updates da partida.
- Pulo de 0.55, gravidade de -0.015, velocidade de 0.15; movimento diagonal normalizado e rotação pelas setas.
- Q agacha: olhos de 1.6 para 0.8, corpo de 1.8 para 1, velocidade reduzida a 55%. Não pula agachado nem levanta sob teto.
- Caixas nas plataformas e passagem baixa antes da saída. Colisões laterais, teto e pouso pelo cruzamento do topo na descida.
- Correção do travamento nas bordas: apoio e laterais usam o mesmo raio de 0.22; pouso prioriza o topo mais alto. Contato lateral não força agachamento.
- Chave exige proximidade em 3D; saída exige chave, proximidade horizontal, altura compatível e apoio no chão.
- Visual inspirado em hotel de perseguição: madeira, paredes escuras, luminárias, luz azul e partículas no próximo destino, portas 3D e chave dourada desenhada por polígonos.
- Áudio sintetizado: volume 0–100 com curva quadrática, repetição ao segurar setas/A/D e teste na tecla T. Configuração preservada durante reinícios da partida.

## Arquivos e testes

`main.js` é a fonte principal; `JOGO_COM_LOBBY.txt` deve conter exatamente o mesmo código. O TXT foi criado porque uma aba antiga do editor estava sendo copiada ou sobrescrevendo a versão no disco. Compare os arquivos antes de transferir uma nova versão.

| Teste | Cobertura |
| --- | --- |
| `node tests/controls.cjs` | Controles, aliases, diagonais, câmera e volume visual das plataformas |
| `node tests/game-flow.cjs` | Menu, lobby, cenas, áudio simulado, reinício e vitória |
| `node tests/map.cjs` | Onze saltos consecutivos, passagem agachada, vitória e limites do lobby |
| `node tests/obstacles.cjs` | Agachamento, pés fixos, teto, caixas, bordas e pouso rasante |

As APIs são simuladas nos testes. O usuário confirmou que a versão com lobby funcionou no microStudio; as últimas mudanças visuais ainda precisam de avaliação no editor. Publicar no GitHub não atualiza o microStudio.

## Limitações e próximos passos

1. Conferir visual e som no microStudio, principalmente portas de vários ângulos, luz guia nas curvas, chave de perto e leitura dos obstáculos.
2. A renderização ordena faces pela profundidade média: não há buffer de profundidade. Luz, textos, chave e Seek podem aparecer sobre objetos que deveriam ocultá-los.
3. Paredes do hotel e portas 3D são geometria visual, fora da lista de colisões. Seek também segue diretamente o jogador, sem navegar pelos obstáculos.
4. Não há checkpoints, salvamento permanente do volume, controles por mouse/toque ou inclinação vertical da câmera.
5. A luz guia usa o maior índice de plataforma alcançado; voltar pelo percurso não recalcula esse progresso para trás.
6. Testar o desempenho real do cenário do hotel: os blocos decorativos são reconstruídos a cada desenho; otimizar se houver queda de fluidez.

## Retomada sugerida

Leia este arquivo, o README e as skills locais; confira o Git antes de editar. Comece pelo teste manual da última versão, anote problemas concretos e mantenha `main.js` e o TXT sincronizados. Não há nova funcionalidade já combinada para a próxima sessão.
