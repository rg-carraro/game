const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx=vm.createContext({keyboard:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../main.js'),'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run('startGame()');
// Percurso completo: salto a partir do centro, soltar avanço sobre o destino.
for(let i=1;i<run('parkourMap.length');i++) {
  run(`player.angle=Math.atan2(parkourMap[${i}].x-player.x,player.z-parkourMap[${i}].z);`);
  let frames=0;
  do {
    ctx.keyboard={SPACE:frames===0,KEY_W:run(`Math.hypot(parkourMap[${i}].x-player.x,parkourMap[${i}].z-player.z)>speed/2`)};
    run('update()');frames++;
    assert.equal(run('gameOver'),false,`Derrota no salto ${i}`);
    assert.ok(frames<150,`Sem pouso no salto ${i}`);
  } while(!run('player.isGrounded'));
  assert.equal(run('routeStep'),i);
}
run('player.angle=0');
ctx.keyboard={KEY_W:1};
for(let i=0;i<15;i++) run('update()');
assert.equal(run('scene'),'playing','Teto baixo deve bloquear jogador em pé');
ctx.keyboard={KEY_W:1,KEY_Q:1};
for(let i=0;i<45;i++) run('update()');
assert.equal(run('scene'),'victory');
run('startGame(); player.x=key.x; player.z=key.z; player.y=-5;');
ctx.keyboard={};run('update()');
assert.equal(run('key.collected'),false);
// Não subir magicamente para o topo quando o jogador vem por baixo.
run('startGame(); player.y=-1; player.vy=.2; player.isGrounded=false; update()');
assert.equal(run('player.isGrounded'),false);
run('enterLobby()');
ctx.keyboard={KEY_D:1};for(let i=0;i<300;i++)run('update()');
assert.ok(run('player.x<=10.5'));
assert.equal(run('startTimer'),0);
console.log('OK: onze saltos consecutivos, vitória, altura da chave, pouso e limites do lobby.');
