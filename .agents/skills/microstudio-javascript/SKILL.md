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
