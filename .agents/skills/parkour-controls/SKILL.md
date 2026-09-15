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
