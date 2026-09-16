const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const sounds = [];
const labels = [];
let cancellations = 0;
const finite = values => assert.ok(values.every(Number.isFinite));
const ctx = vm.createContext({
  keyboard: {},
  audio: {beep(value) {sounds.push(value);}, cancelBeeps() {cancellations++;}},
  screen: {
    width: 356, height: 200,
    fillRect(x,y,w,h) {finite([x,y,w,h]);},
    fillPolygon(points) {finite(points); assert.ok(points.length >= 6);},
    drawText(text,x,y,size) {labels.push(text); finite([x,y,size]);}
  }
});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../main.js'),'utf8'),ctx);
const run = code => vm.runInContext(code,ctx);
const tick = (keys = {}) => {ctx.keyboard=keys; run('update(); draw();');};
const tap = name => {tick(); tick({[name]:1});};
run('init(); draw();');
assert.equal(run('scene'),'menu');
const initial = run('JSON.stringify(player)');
for(let i=0;i<200;i++) tick({KEY_W:1});
assert.equal(run('JSON.stringify(player)'),initial);
assert.equal(run('startTimer'),0);
tap('KEY_C'); assert.equal(run('scene'),'settings');
for(let i=0;i<15;i++) tap('ARROW_LEFT');
assert.equal(run('volume'),0);
const mutedCount=sounds.length;
run('sound("noise","C2",100,1)'); assert.equal(sounds.length,mutedCount);
for(let i=0;i<15;i++) tap('ARROW_RIGHT');
assert.equal(run('volume'),100);
tap('SPACE'); assert.equal(run('scene'),'menu');
tap('SPACE'); assert.equal(run('scene'),'lobby');
tap('KEY_E'); assert.equal(run('scene'),'lobby');
for(let i=0;i<400;i++) tick({KEY_W:1});
assert.equal(run('scene'),'lobby');
assert.equal(run('startTimer'),0);
assert.ok(run('player.z>=-9.5'));
tap('KEY_C'); assert.equal(run('scene'),'settings');
tap('SPACE'); assert.equal(run('scene'),'lobby');
run('player.x=0; player.z=-7;');
tap('KEY_E'); assert.equal(run('scene'),'intro');
// Segurar espaço não pula a introdução iniciada pela mesma tecla.
for(let i=0;i<20;i++) tick({KEY_E:1});
assert.equal(run('scene'),'intro');
while(run('scene')==='intro') tick();
assert.equal(run('scene'),'playing');
assert.equal(run('startTimer'),0);
assert.ok(labels.includes('ELE ESTÁ BATENDO NA PORTA!'));
assert.ok(sounds.filter(s=>s.includes('noise duration 90')).length===5);
// Captura causa um único susto; movimento fica bloqueado durante a animação.
run('startTimer=181; seek.x=player.x; seek.y=player.y; seek.z=player.z;');
tick(); assert.equal(run('scene'),'jumpscare');
const captured = run('JSON.stringify(player)');
for(let i=0;i<75;i++) tick({KEY_W:1});
assert.equal(run('scene'),'defeat');
assert.equal(run('JSON.stringify(player)'),captured);
assert.equal(sounds.filter(s=>s.startsWith('saw')).length,1);
tap('KEY_C'); assert.equal(run('scene'),'settings');
tap('SPACE'); assert.equal(run('scene'),'defeat');
tap('KEY_R'); assert.equal(run('scene'),'playing');
assert.equal(run('gameOver || gameWon || key.collected || door.open'),false);
assert.equal(run('volume'),100);
run('player.y=-13;'); tick(); assert.equal(run('scene'),'jumpscare');
for(let i=0;i<75;i++) tick();
assert.equal(run('defeatReason'),'Você caiu no vazio.');
tap('KEY_M'); assert.equal(run('scene'),'menu');
tap('SPACE'); run('player.x=0; player.z=-7;'); tap('KEY_E'); tap('SPACE'); assert.equal(run('scene'),'playing');
run('player.x=key.x; player.z=key.z; player.y=7.1;');
tick(); assert.equal(run('key.collected'),true);
run('player.z=door.z;'); tick(); assert.equal(run('scene'),'victory');
tap('SPACE'); assert.equal(run('scene'),'playing');
assert.equal(run('player.z'),15);
// Tecla segurada repete o ajuste, sem depender da repetição do sistema.
run('changeScene("settings"); volume=50;');
tick({ARROW_LEFT:1}); assert.equal(run('volume'),40);
for(let i=0;i<23;i++) tick({ARROW_LEFT:1});
assert.equal(run('volume'),40);
tick({ARROW_LEFT:1}); assert.equal(run('volume'),30);
for(let i=0;i<80;i++) tick({ARROW_LEFT:1});
assert.equal(run('volume'),0);
const silentCount = sounds.length;
const beforeCancel = cancellations;
tap('KEY_T');
assert.equal(sounds.length,silentCount);
assert.ok(cancellations > beforeCancel);
tick(); tick({KEY_D:1}); assert.equal(run('volume'),10);
for(let i=0;i<150;i++) tick({KEY_D:1});
assert.equal(run('volume'),100);
for(let i=0;i<30;i++) tick({ARROW_LEFT:1,ARROW_RIGHT:1});
assert.equal(run('volume'),100);
tap('KEY_A'); assert.equal(run('volume'),90);
// Confere a intensidade enviada ao áudio, além da porcentagem da tela.
run('volume=20;'); tap('KEY_T');
const low = Number(sounds.at(-1).match(/volume ([\d.]+)/)[1]);
run('volume=80;'); tap('KEY_T');
const high = Number(sounds.at(-1).match(/volume ([\d.]+)/)[1]);
assert.equal(low,2); assert.equal(high,32);
const previewCount = sounds.length;
for(let i=0;i<10;i++) tick({KEY_T:1});
assert.equal(sounds.length,previewCount);
console.log('OK: menu, volume, introdução, batidas, pular cena, jumpscare, queda, vitória e reinício.');
console.log('OK: volume com tecla segurada, A/D, limites, silêncio e intensidade do áudio.');
