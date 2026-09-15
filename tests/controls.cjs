const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ctx = vm.createContext({keyboard:{},screen:{width:400,height:300,fillRect(){},drawText(){}}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../main.js'),'utf8'),ctx);
const run = code => vm.runInContext(code,ctx);
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`);
for (const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]) {
  run(`init(); player.angle = ${angle};`);
  const p = run(`project(player.x + Math.sin(player.angle)*10, player.y, player.z-Math.cos(player.angle)*10)`);
  assert.ok(p.visible); near(p.x,0);
  assert.equal(run(`project(player.x-Math.sin(player.angle)*10,player.y,player.z+Math.cos(player.angle)*10).visible`),false);
  for (const [keys,forward,strafe] of [
    [{KEY_W:1,UP:1},1,0],[{KEY_S:1,DOWN:1},-1,0],
    [{KEY_A:1,LEFT:1},0,-1],[{KEY_D:1,RIGHT:1},0,1],
    [{ARROW_UP:1,UP:1},1,0],[{ARROW_DOWN:1,DOWN:1},-1,0],
    [{KEY_W:1,KEY_D:1,UP:1,RIGHT:1},Math.SQRT1_2,Math.SQRT1_2]
  ]) {
    run(`init(); player.angle=${angle};`); ctx.keyboard=keys; run('update()');
    near(run('player.angle'),angle);
    near(run('player.x'),(forward*Math.sin(angle)+strafe*Math.cos(angle))*.15);
    near(run('player.z'),15+(-forward*Math.cos(angle)+strafe*Math.sin(angle))*.15);
  }
}
for (const [key,sign] of [['ARROW_LEFT',-1],['ARROW_RIGHT',1]]) {
  run('init()'); ctx.keyboard={[key]:1}; run('update()');
  near(run('player.angle'),sign*.06);
  assert.ok(run('project(0,player.y,5).x')*sign<0);
}
run('init()'); const before=run('project(0,player.y,5).size');
ctx.keyboard={KEY_W:1}; run('update()');
assert.ok(run('project(0,player.y,5).size')>before);
run('draw()');
console.log('OK: controles, aliases, diagonais, câmera em quatro orientações e desenho simulado.');
