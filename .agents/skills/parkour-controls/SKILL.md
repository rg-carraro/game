---
name: parkour-controls
description: Corrigir ou testar movimento em primeira pessoa e projeção do parkour Game Teteu quando houver inversões ou mudanças de câmera.
---
# Controles e projeção do parkour

- O eixo Y aponta para cima; player.y representa a altura dos olhos. Ângulo zero olha para -Z e ângulo positivo gira para a direita.
- A frente no plano XZ é (sin(angle), -cos(angle)); a direita é (cos(angle), sin(angle)). A profundidade projetada é o produto escalar com a frente, positivo para objetos visíveis.
- Ao mudar a convenção, altere movimento e projeção juntos. Normalize o movimento combinado para não acelerar diagonais.
- Valide W/S, A/D e ambas as setas de rotação com os aliases reais do microStudio presentes. A/D não deve alterar angle.
- Use node tests/controls.cjs para regressão. Verifique frente e trás em quatro orientações e que avançar aumenta o tamanho aparente de um objeto à frente.
- Ao trabalhar na física, avalie o alcance dos saltos frente aos vãos e diferenças de altura. Não considere uma correção de controles como prova de que o percurso inteiro é jogável.

## Saltos e colisões

- Os parâmetros atuais são `jumpSpeed = 0.55`, `gravity = -0.015` e `speed = 0.15` por update. São escolhas ajustáveis, não exigências do runtime.
- O usuário preferiu reduzir o pulo de 0.65 para 0.55. Considere facilidade de controle e altura aparente, além do alcance horizontal.
- A posição inicial dos olhos é 2.1: topo da plataforma (0.5) mais 1.6. Começar abaixo dessa altura fazia a colisão cancelar o salto no primeiro frame.
- Simule a física real entre plataformas consecutivas, considerando deslocamento lateral, subida e pouso. O mapa atual de 12 plataformas é verificado por tests/map.cjs com saltos a partir do centro e avanço solto sobre o destino.
- O pouso verifica cruzamento do topo na descida e escolhe o topo mais alto. Use overlapsXZ tanto no apoio quanto nas laterais: misturar centro no pouso e raio nas laterais causava travamento nas bordas.
- Q agacha preservando os pés, reduzindo eyeHeight e velocidade; só bloqueie levantar quando já estiver agachado sob um teto. Contato lateral não deve forçar agachamento.
- Rode node tests/obstacles.cjs e node tests/map.cjs ao mudar colisões. Cubra bordas nas quatro direções, pouso rasante, teto, caixas e passagem baixa antes da saída.
- Chave usa distância 3D; saída exige proximidade, altura e isGrounded. Plataformas e obstáculos são sólidos; portas e paredes decorativas não participam das colisões.

## Plataformas em perspectiva

- Use `w`, `h` e `d` para construir os oito vértices do bloco, correspondendo ao volume das colisões.
- `cameraPoint()` fornece coordenadas da câmera; `project()` projeta pontos. `drawPlatforms()` seleciona faces voltadas ao jogador e ordena da mais distante para a mais próxima.
- Recorte faces contra o plano próximo (`z = 0.1`) com `clipPlatformFace()` antes de dividir pela profundidade. Descartar o bloco pelo centro faz a plataforma sob o jogador desaparecer; projetar vértices atrás da câmera sem recorte distorce o desenho.
- O topo claro e as laterais sombreadas indicam profundidade. `screen.fillPolygon(points, color)` recebe pares x/y.
- Verifique bloco visto de cima e de lado, redução aparente da borda distante, faces cruzando o plano próximo e blocos atrás da câmera. Os testes existentes cobrem esses casos e quatro orientações.
- A ordenação pela profundidade média é aproximada; personagens e objetivos são desenhados depois das plataformas. Isso não é oclusão 3D completa.
