const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx=vm.createContext({keyboard:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../main.js'),'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
const tick=(keys,n=1)=>{ctx.keyboard=keys;for(let i=0;i<n;i++)run('movePlayer()');};
run('startGame()');tick({KEY_Q:1});
assert.ok(Math.abs(run('player.y-eyeHeight')-.5)<1e-9);
assert.equal(run('crouching'),true);
tick({});assert.equal(run('eyeHeight'),1.6);
// Teto bloqueia em pé, permite atravessar agachado e impede levantar dentro.
run('player.x=0; player.z=-68; player.y=7.1;');
tick({KEY_W:1},15);assert.ok(run('player.z>-68.45'));
tick({KEY_W:1,KEY_Q:1},10);assert.ok(run('player.z<-68.5'));
tick({SPACE:1});assert.equal(run('crouching'),true);assert.equal(run('player.vy'),0);
tick({KEY_W:1,KEY_Q:1},25);tick({});assert.equal(run('crouching'),false);
// Caixa bloqueia caminhada e pode ser superada com pulo.
run('startGame(); player.x=-4.5;player.z=-6.7;player.y=3.6;');
tick({KEY_W:1},8);assert.ok(run('player.z>-7.3'));
tick({SPACE:1});tick({},8);tick({KEY_W:1},18);
assert.ok(run('player.z<-8'));
// Cabeça bate no teto durante a subida.
run('enterLobby(); player.x=6;player.z=0;eyeHeight=.8;player.y=1.3;player.vy=.3;player.isGrounded=false;');
tick({KEY_Q:1});assert.equal(run('player.vy'),0);
assert.ok(run('player.y-eyeHeight+1<=1.65+1e-9'));
// O corpo ainda apoiado na borda não pode cair dentro da colisão lateral.
for (const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]) {
  run(`startGame(); player.angle=${angle}; player.x=Math.sin(player.angle)*2.9; player.z=15-Math.cos(player.angle)*2.9;`);
  tick({KEY_W:1},2);
  assert.equal(run('crouching'),false,'Borda não deve forçar agachamento');
  assert.equal(run('player.isGrounded'),true,'Raio do corpo ainda apoiado');
  tick({KEY_W:1},5);
  assert.ok(run('Math.hypot(player.x,player.z-15)>3.8'),'Deve conseguir sair da borda');
}
// Pouso rasante: parte do corpo sobre a plataforma também conta como apoio.
run('startGame(); player.x=3.1;player.y=2.3;player.vy=-.3;player.isGrounded=false;');
tick({});assert.equal(run('player.isGrounded'),true);
tick({SPACE:1});assert.ok(run('player.vy>0'),'Pode pular novamente na borda');
console.log('OK: agachar, pés fixos, teto, caixa, salto e bordas sem travamento.');
