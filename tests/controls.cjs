const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const polygons = [];
const ctx = vm.createContext({keyboard:{},screen:{width:400,height:300,fillRect(){},drawText(){},fillPolygon(points,color){polygons.push({points,color});}}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../main.js'),'utf8'),ctx);
const run = code => vm.runInContext(code,ctx);
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`);
for (const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]) {
  run(`startGame(); player.angle = ${angle};`);
  const p = run(`project(player.x + Math.sin(player.angle)*10, player.y, player.z-Math.cos(player.angle)*10)`);
  assert.ok(p.visible); near(p.x,0);
  assert.equal(run(`project(player.x-Math.sin(player.angle)*10,player.y,player.z+Math.cos(player.angle)*10).visible`),false);
  for (const [keys,forward,strafe] of [
    [{KEY_W:1,UP:1},1,0],[{KEY_S:1,DOWN:1},-1,0],
    [{KEY_A:1,LEFT:1},0,-1],[{KEY_D:1,RIGHT:1},0,1],
    [{ARROW_UP:1,UP:1},1,0],[{ARROW_DOWN:1,DOWN:1},-1,0],
    [{KEY_W:1,KEY_D:1,UP:1,RIGHT:1},Math.SQRT1_2,Math.SQRT1_2]
  ]) {
    run(`startGame(); player.angle=${angle};`); ctx.keyboard=keys; run('update()');
    near(run('player.angle'),angle);
    near(run('player.x'),(forward*Math.sin(angle)+strafe*Math.cos(angle))*.15);
    near(run('player.z'),15+(-forward*Math.cos(angle)+strafe*Math.sin(angle))*.15);
  }
}
for (const [key,sign] of [['ARROW_LEFT',-1],['ARROW_RIGHT',1]]) {
  run('startGame()'); ctx.keyboard={[key]:1}; run('update()');
  near(run('player.angle'),sign*.06);
  assert.ok(run('project(0,player.y,5).x')*sign<0);
}
run('startGame()'); const before=run('project(0,player.y,5).size');
ctx.keyboard={KEY_W:1}; run('update()');
assert.ok(run('project(0,player.y,5).size')>before);
run('draw()');
assert.ok(polygons.length > 0);
assert.ok(polygons.every(p => p.points.length >= 6 && p.points.every(Number.isFinite)));
// Um bloco isolado visto de cima e de lado precisa mostrar três faces.
run('startGame(); platforms = [{x:0,y:0,z:0,w:4,h:1,d:4}]; player.x=5; player.y=4; player.z=10;');
polygons.length = 0; run('drawPlatforms()');
assert.equal(polygons.length,3);
assert.equal(new Set(polygons.map(p => p.color)).size,3);
const top = polygons.find(p => p.color === '#879eae').points;
assert.ok(Math.abs(top[2]-top[0]) < Math.abs(top[4]-top[6]), 'Borda distante deve parecer menor');
// A face sob o jogador cruza o plano da câmera e deve continuar visível.
for (const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]) {
  run(`player.x=0; player.z=0; player.angle=${angle};`);
  polygons.length=0; run('drawPlatforms()');
  assert.equal(polygons.length,1);
  assert.ok(polygons[0].points.every(Number.isFinite));
}
run('player.z=-10; player.angle=0;');
polygons.length=0; run('drawPlatforms()');
assert.equal(polygons.length,0, 'Bloco atrás da câmera não deve aparecer');
console.log('OK: controles, aliases, diagonais, câmera em quatro orientações e desenho simulado.');
console.log('OK: volume das plataformas, perspectiva e recorte próximo da câmera.');
