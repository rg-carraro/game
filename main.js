let player = { x: 0, y: 2.1, z: 15, vy: 0, isGrounded: true, angle: 0 };
let seek = { x: 0, y: 1.5, z: 28 };
let key = { x: 0, y: 5.5, z: -26, collected: false };
let door = { x: 0, y: 6, z: -27.5, open: false };

let gameOver = false;
let gameWon = false;
let startTimer = 0; 
let scene = "menu";
let sceneTimer = 0;
let volume = 50;
let previousKeys = {};
let defeatReason = "";
let settingsReturn = "menu";
let volumeHoldDirection = 0;
let volumeHoldFrames = 0;

const gravity = -0.015;
// Pulo moderado, com alcance para atravessar os vãos entre plataformas.
const jumpSpeed = 0.55;
const speed = 0.15;
const seekSpeed = 0.055; 

// Plataformas do Parkour
let platforms = [
  { x: 0, y: 0, z: 15, w: 6, h: 1, d: 6 },
  { x: 0, y: 1, z: 5, w: 4, h: 1, d: 4 },
  { x: -3, y: 2, z: -5, w: 3, h: 1, d: 3 },
  { x: 3, y: 3, z: -15, w: 3, h: 1, d: 3 },
  { x: 0, y: 4, z: -25, w: 6, h: 1, d: 6 }
];

function resetGame() {
  player = { x: 0, y: 2.1, z: 15, vy: 0, isGrounded: true, angle: 0 };
  seek = { x: 0, y: 1.5, z: 28 };
  key = { x: 0, y: 5.5, z: -26, collected: false };
  door = { x: 0, y: 6, z: -27.5, open: false };
  gameOver = false;
  gameWon = false;
  startTimer = 0;
}

init = function() {
  resetGame();
  previousKeys = {};
  changeScene("menu");
};

function stopSounds() {
  if (typeof audio !== "undefined") audio.cancelBeeps();
}

function sound(type, notes, duration, strength) {
  if (volume === 0 || typeof audio === "undefined") return;
  // Curva de volume: os níveis baixos ficam perceptivelmente mais suaves.
  const gain = Math.pow(volume / 100, 2) * strength;
  audio.beep(type + " duration " + duration + " volume " +
    (gain * 100).toFixed(2) + " span 80 " + notes);
}

function previewVolume() {
  stopSounds();
  sound("sine", "C4 E4", 180, 0.5);
}

function changeScene(next) {
  stopSounds();
  scene = next;
  sceneTimer = 0;
  volumeHoldDirection = 0;
  volumeHoldFrames = 0;
}

function startGame() {
  resetGame();
  changeScene("playing");
}

function lose(reason) {
  gameOver = true;
  defeatReason = reason;
  changeScene("jumpscare");
  sound("saw", "C2 F5 C2", 120, 0.7);
}

update = function() {
  const pressed = name => !!keyboard[name] && !previousKeys[name];
  sceneTimer++;
  if (scene === "menu") {
    if (pressed("SPACE")) { resetGame(); changeScene("intro"); }
    else if (pressed("KEY_C")) { settingsReturn = "menu"; changeScene("settings"); }
  } else if (scene === "settings") {
    const direction = (keyboard.ARROW_RIGHT || keyboard.KEY_D ? 1 : 0)
      - (keyboard.ARROW_LEFT || keyboard.KEY_A ? 1 : 0);
    volumeHoldFrames = direction === volumeHoldDirection ? volumeHoldFrames + 1 : 0;
    volumeHoldDirection = direction;
    if (direction && (volumeHoldFrames === 0 ||
        (volumeHoldFrames >= 24 && (volumeHoldFrames - 24) % 12 === 0))) {
      const nextVolume = Math.max(0, Math.min(100, volume + direction * 10));
      if (nextVolume !== volume) {
        volume = nextVolume;
        previewVolume();
      }
    }
    if (pressed("KEY_T")) previewVolume();
    if (pressed("SPACE")) changeScene(settingsReturn);
  } else if (scene === "intro") {
    if (pressed("SPACE") || sceneTimer >= 540) startGame();
    else {
      if (sceneTimer < 270 && sceneTimer % (sceneTimer < 135 ? 30 : 18) === 1)
        sound("noise", "C2", 70, 0.2);
      if (sceneTimer < 270 && sceneTimer % 60 === 15)
        sound("sine", "C2 C2", 110, 0.25);
      if (sceneTimer === 270) sound("noise", "C2", 180, 0.6);
      if ([300, 342, 384, 426, 468].indexOf(sceneTimer) >= 0)
        sound("noise", "C2 C2", 90, 0.35 + (sceneTimer - 300) / 672);
      if (sceneTimer === 500) sound("noise", "C2 D2 C2", 100, 0.65);
    }
  } else if (scene === "playing") {
    updateGame();
  } else if (scene === "jumpscare") {
    if (sceneTimer >= 75) changeScene("defeat");
  } else if (scene === "defeat" || scene === "victory") {
    if (pressed("KEY_R") || pressed("SPACE")) startGame();
    else if (pressed("KEY_M")) { resetGame(); changeScene("menu"); }
    else if (pressed("KEY_C")) { settingsReturn = scene; changeScene("settings"); }
  }
  previousKeys = {};
  ["SPACE", "KEY_C", "KEY_R", "KEY_M", "KEY_T", "ARROW_LEFT", "ARROW_RIGHT"].forEach(name => {
    previousKeys[name] = !!keyboard[name];
  });
};

function updateGame() {
  if (gameOver || gameWon) return;

  startTimer += 1;

  // Setas físicas: LEFT/RIGHT também incluem A/D no microStudio.
  if (keyboard.ARROW_LEFT) player.angle -= 0.06;
  if (keyboard.ARROW_RIGHT) player.angle += 0.06;

  // Ângulo zero olha para -Z; ângulo positivo vira para a direita.
  let forward = (keyboard.KEY_W || keyboard.ARROW_UP ? 1 : 0)
              - (keyboard.KEY_S || keyboard.ARROW_DOWN ? 1 : 0);
  let strafe = (keyboard.KEY_D ? 1 : 0) - (keyboard.KEY_A ? 1 : 0);
  let length = Math.hypot(forward, strafe);
  if (length > 0) {
    forward /= length;
    strafe /= length;
    const sinA = Math.sin(player.angle);
    const cosA = Math.cos(player.angle);
    player.x += (forward * sinA + strafe * cosA) * speed;
    player.z += (-forward * cosA + strafe * sinA) * speed;
  }

  // Pulo
  if (keyboard.SPACE && player.isGrounded) {
    player.vy = jumpSpeed;
    player.isGrounded = false;
  }

  // Gravidade
  player.vy += gravity;
  player.y += player.vy;

  // Colisão com Plataformas
  player.isGrounded = false;
  platforms.forEach(p => {
    let halfW = p.w / 2;
    let halfD = p.d / 2;
    let topY = p.y + p.h / 2;

    if (
      player.x >= p.x - halfW && player.x <= p.x + halfW &&
      player.z >= p.z - halfD && player.z <= p.z + halfD &&
      player.y <= topY + 1.6 && player.y >= topY - 0.5
    ) {
      player.y = topY + 1.6;
      player.vy = 0;
      player.isGrounded = true;
    }
  });

  // Queda no Vazio
  if (player.y < -12) { lose("Você caiu no vazio."); return; }

  // --- PERSEGUIÇÃO DO SEEK ---
  if (startTimer > 180) {
    let dx = player.x - seek.x;
    let dz = player.z - seek.z;
    let dy = player.y - seek.y;
    let dist2D = Math.sqrt(dx * dx + dz * dz);
    let dist3D = Math.sqrt(dx * dx + dz * dz + dy * dy);

    if (dist2D > 0.5) {
      seek.x += (dx / dist2D) * seekSpeed;
      seek.z += (dz / dist2D) * seekSpeed;
      
      if (Math.abs(dy) > 0.2) {
        seek.y += (dy / Math.abs(dy)) * (seekSpeed * 0.5);
      }
    }

    if (dist3D < 1.3) { lose("O Seek te pegou!"); return; }
  }

  // Pegar Chave
  if (!key.collected) {
    let kdx = player.x - key.x;
    let kdz = player.z - key.z;
    if (Math.sqrt(kdx * kdx + kdz * kdz) < 1.5) {
      key.collected = true;
      door.open = true;
    }
  }

  // Saída
  if (door.open) {
    let ddx = player.x - door.x;
    let ddz = player.z - door.z;
    if (Math.sqrt(ddx * ddx + ddz * ddz) < 1.8) {
      gameWon = true;
      changeScene("victory");
      sound("sine", "C4 E4 G4 C5", 160, 0.3);
    }
  }
};

// --- CÁLCULO DE PROJEÇÃO 3D COM ROTAÇÃO DE CÂMERA ---
function cameraPoint(x, y, z) {
  // Diferença de posição do mundo pro jogador
  let dx = x - player.x;
  let dy = y - player.y;
  let dz = z - player.z;

  // Mesma base da movimentação: direita e frente da câmera.
  let cosA = Math.cos(player.angle);
  let sinA = Math.sin(player.angle);
  let relX = dx * cosA + dz * sinA;
  let relZ = dx * sinA - dz * cosA;
  let relY = dy;

  return { x: relX, y: relY, z: relZ };
}

function project(x, y, z) {
  const point = cameraPoint(x, y, z);
  const relX = point.x, relY = point.y, relZ = point.z;
  let fov = 160;
  let scale = fov / (relZ < 0.1 ? 0.1 : relZ);

  return {
    x: relX * scale,
    y: relY * scale,
    size: scale,
    visible: relZ > 0.1
  };
}

// Recorta as faces perto da câmera, inclusive a plataforma sob o jogador.
function clipPlatformFace(vertices) {
  const near = 0.1;
  const result = [];
  let previous = vertices[vertices.length - 1];
  for (const current of vertices) {
    if ((previous.z >= near) !== (current.z >= near)) {
      const t = (near - previous.z) / (current.z - previous.z);
      result.push({
        x: previous.x + (current.x - previous.x) * t,
        y: previous.y + (current.y - previous.y) * t,
        z: near
      });
    }
    if (current.z >= near) result.push(current);
    previous = current;
  }
  return result;
}

function drawPlatforms() {
  const faces = [];
  platforms.forEach(p => {
    const left = p.x - p.w / 2, right = p.x + p.w / 2;
    const bottom = p.y - p.h / 2, top = p.y + p.h / 2;
    const back = p.z - p.d / 2, front = p.z + p.d / 2;
    const vertices = [
      [left, bottom, back], [right, bottom, back],
      [right, bottom, front], [left, bottom, front],
      [left, top, back], [right, top, back],
      [right, top, front], [left, top, front]
    ].map(v => cameraPoint(v[0], v[1], v[2]));
    const sides = [
      { indices: [4, 5, 6, 7], visible: player.y > top, color: "#879eae" },
      { indices: [0, 3, 2, 1], visible: player.y < bottom, color: "#252c34" },
      { indices: [3, 7, 6, 2], visible: player.z > front, color: "#485b6b" },
      { indices: [0, 1, 5, 4], visible: player.z < back, color: "#3b4c5a" },
      { indices: [0, 4, 7, 3], visible: player.x < left, color: "#344451" },
      { indices: [1, 2, 6, 5], visible: player.x > right, color: "#596f80" }
    ];
    sides.forEach(side => {
      if (!side.visible) return;
      const clipped = clipPlatformFace(side.indices.map(i => vertices[i]));
      if (clipped.length < 3) return;
      faces.push({
        vertices: clipped,
        depth: clipped.reduce((sum, v) => sum + v.z, 0) / clipped.length,
        color: side.color
      });
    });
  });
  // Desenha primeiro as faces distantes para as próximas cobrirem as de trás.
  faces.sort((a, b) => b.depth - a.depth);
  faces.forEach(face => {
    const points = [];
    face.vertices.forEach(v => points.push(v.x * 160 / v.z, v.y * 160 / v.z));
    screen.fillPolygon(points, face.color);
  });
}

function drawSeekFigure(x, y, size, time) {
  const stride = Math.sin(time * 0.18);
  const sway = stride * 0.035;
  // Coordenadas locais: silhueta orgânica, membros e olho único.
  const shape = (points, color) => {
    const scaled = [];
    for (let i = 0; i < points.length; i += 2)
      scaled.push(x + (points[i] + sway) * size, y + points[i+1] * size);
    screen.fillPolygon(scaled, color);
  };
  shape([-.22,-.2,-.04,-.28,-.12,-.72,-.31-stride*.08,-.86,-.39,-.8,-.24,-.59],"#050609");
  shape([.04,-.28,.22,-.2,.24,-.59,.39,-.8,.31-stride*.08,-.86,.12,-.72],"#090a10");
  for (const side of [-1,1]) {
    const arm = stride * side * .09;
    shape([side*.19,.13,side*.36,.04,side*.45,-.23+arm,
      side*.57,-.5+arm,side*.46,-.55+arm,side*.31,-.27,side*.15,-.07],"#07080d");
    for (let finger=0;finger<3;finger++) {
      const fx=side*(.46+finger*.045), fy=-.49+arm;
      shape([fx,fy,fx+side*.03,fy-.16-finger*.02,fx+side*.055,fy-.05],"#07080d");
    }
  }
  shape([-.17,.19,-.29,.07,-.2,-.3,0,-.39,.2,-.3,.29,.07,.17,.19],"#0b0d14");
  shape([-.16,.13,-.2,-.06,-.1,-.28,-.12,-.03,-.05,.12],"#202531");
  shape([-.23,.26,-.2,.43,-.1,.52,.1,.52,.22,.41,.24,.23,.14,.1,-.14,.1],"#08090f");
  shape([-.21,.33,-.15,.44,.1,.46,.19,.37,.06,.41,-.12,.4],"#2c303a");
  shape([-.2,.3,-.12,.37,.03,.39,.18,.33,.21,.29,.12,.23,-.04,.21,-.16,.25],"#b2bec6");
  shape([-.17,.3,-.09,.35,.05,.36,.17,.3,.08,.25,-.05,.24],"#fff8e5");
  shape([-.045,.36,.035,.36,.06,.3,.025,.24,-.04,.25,-.065,.3],"#07090f");
  shape([-.025,.34,.005,.34,.005,.315,-.025,.315],"#ffffff");
}

function caption(text, y, size, color) {
  screen.drawText(text, 0, y, size, color || "#e7eaf0");
}

function drawIntro() {
  const t = sceneTimer;
  const w = screen.width || 400, h = screen.height || 200;
  const bob = t < 270 ? Math.sin(t*.3) * (t < 135 ? 1 : 3) : 0;
  // Corredor visto para trás durante a fuga; as faixas passam pela câmera.
  screen.fillRect(0, 0, w, h, "#17121a");
  screen.fillPolygon([-w/2,-h/2, -25,-15, 25,-15, w/2,-h/2], "#35303a");
  screen.fillPolygon([-w/2,h/2, -25,35, -25,-15, -w/2,-h/2], "#29212a");
  screen.fillPolygon([w/2,h/2, 25,35, 25,-15, w/2,-h/2], "#211b25");
  for (let i = 0; i < 7; i++) {
    const f = ((i * 40 + t * 2) % 280) / 280;
    screen.fillRect(0, -15 - f*f*(h/2-15) + bob, 50 + f*f*w, 1, "#61535b");
  }
  // Batentes de portas passando pelas laterais do corredor.
  for (let i=0;i<4;i++) {
    const f=((i*70+t*1.5)%280)/280;
    const offset=30+f*f*w*.5, height=30+f*f*h;
    for (const side of [-1,1]) {
      screen.fillRect(side*offset,bob,3+f*3,height,"#47343c");
      screen.fillRect(side*(offset+8+f*14),bob,10+f*20,height*.86,"#0e0d13");
    }
  }
  if (t < 270) {
    const size = 25 + Math.pow(t/270,2)*125;
    drawSeekFigure(Math.sin(t*0.04)*8, 5+bob, size, t);
    caption(t < 135 ? "Você ouviu passos atrás de você..." : "É O SEEK! CORRA!", 76, 12, "#ffbdba");
  } else {
    const hit = [300,342,384,426,468].some(frame => t >= frame && t < frame+12);
    const shake = hit ? Math.sin(t*2)*4 : 0;
    screen.fillRect(shake, 0, 112, 158, "#100e13");
    screen.fillRect(shake, 0, 100, 146, "#614033");
    screen.fillRect(shake-23, 24, 36, 74, "#482c28");
    screen.fillRect(shake+23, 24, 36, 74, "#482c28");
    screen.fillRect(shake+34, -12, 7, 7, "#d9b977");
    screen.fillRect(shake, -32, 116, 9, "#8f795a");
    if (t >= 384) screen.fillPolygon([shake-4,60,shake+3,29,shake-2,33,shake+6,2,shake-9,29],"#150e13");
    if (t >= 426) screen.fillPolygon([shake+6,2,shake+27,-8,shake+14,-7,shake+31,-37,shake+7,-15],"#150e13");
    if (t >= 468) {
      screen.fillPolygon([shake-5,35,shake-30,13,shake-21,16,shake-35,-9,shake-17,11],"#150e13");
      for(let i=0;i<6;i++) {
        const fall=(t-468+i*7)%45;
        screen.fillRect(shake-28+i*11,25-fall*2,3,5,"#a27652");
      }
    }
    caption(t < 300 ? "Você trancou a porta." : "ELE ESTÁ BATENDO NA PORTA!", 84, 11, "#ffbdba");
    if (hit) caption("TUM!", 8, 25, "#ffe0b1");
    if (t >= 468) caption("Atravesse as plataformas e encontre a chave!", -66, 9);
    if (t >= 500) {
      const opening = Math.min(1,(t-500)/30);
      screen.fillRect(0,0,opening*90,140,"#07080e");
      drawSeekFigure(0,-5,45+opening*55,t);
      caption("A PORTA NÃO VAI AGUENTAR!", 59, 11, "#ffbdba");
    }
  }
  screen.fillRect(0,h/2-7,w,14,"#06060b");
  screen.fillRect(0,-h/2+7,w,14,"#06060b");
  caption("ESPAÇO: pular introdução", -89, 8, "#b8b0bc");
}

function drawFrontEnd() {
  if (scene === "intro") { drawIntro(); return; }
  if (scene === "jumpscare") {
    screen.fillRect(0, 0, screen.width || 400, screen.height || 200, "#5d1124");
    const size = 130 + Math.min(sceneTimer, 25)*4;
    drawSeekFigure(Math.sin(sceneTimer*1.7)*5, -25, size, sceneTimer);
    return;
  }
  screen.fillRect(0, 0, 188, 184, "#171a25");
  screen.fillRect(0, 89, 188, 2, "#b7415b");
  if (scene === "menu") {
    caption("GAME TETEU", 65, 21);
    caption("A FUGA DO SEEK", 43, 12, "#f0788e");
    caption("ESPAÇO  •  Jogar", 10, 13);
    caption("C  •  Configurações", -13, 11);
    caption("Encontre a chave e alcance a porta verde.", -40, 8);
    caption("WASD: mover   |   ← →: olhar", -60, 8, "#aab3c7");
    caption("ESPAÇO: pular", -74, 8, "#aab3c7");
  } else if (scene === "settings") {
    caption("CONFIGURAÇÕES", 61, 16);
    caption("Volume dos efeitos", 30, 11);
    caption(volume === 0 ? "SILENCIADO" : volume + "%", 9, 16, "#f0788e");
    screen.fillRect(0, -13, 140, 9, "#303748");
    if (volume > 0) screen.fillRect(-70 + volume*0.7, -13, volume*1.4, 9, "#e46b83");
    caption("Segure ← / → ou A / D para ajustar", -34, 8);
    caption("T  •  Ouvir teste", -51, 10);
    caption("ESPAÇO  •  Voltar", -69, 11);
    caption("Sem som? Clique na área do jogo.", -83, 7, "#aab3c7");
  } else {
    const won = scene === "victory";
    caption(won ? "VOCÊ ESCAPOU!" : "FIM DE JOGO", 60, 19, won ? "#8ce7b0" : "#f0788e");
    caption(won ? "A porta se fechou. Você está a salvo." : defeatReason, 32, 9);
    caption("R / ESPAÇO  •  Jogar novamente", 1, 10);
    caption("M  •  Menu principal", -24, 10);
    caption("C  •  Configurações", -47, 10);
    caption("Mais uma tentativa? Você consegue!", -74, 8, "#aab3c7");
  }
}

draw = function() {
  screen.fillRect(0, 0, screen.width || 400, screen.height || 300, "#0b0b12");
  if (scene !== "playing") { drawFrontEnd(); return; }

  drawPlatforms();

  if (!key.collected) {
    let k3d = project(key.x, key.y, key.z);
    if (k3d.visible) {
      screen.fillRect(k3d.x, k3d.y, 12 * (k3d.size / 20), 12 * (k3d.size / 20), "#ffcc00");
    }
  }

  let d3d = project(door.x, door.y, door.z);
  if (d3d.visible) {
    let color = door.open ? "#00ff66" : "#ff0000";
    screen.fillRect(d3d.x, d3d.y, 20 * (d3d.size / 20), 35 * (d3d.size / 20), color);
  }

  let s3d = project(seek.x, seek.y, seek.z);
  if (s3d.visible) {
    drawSeekFigure(s3d.x, s3d.y, 1.65 * s3d.size, startTimer);
  }

  if (startTimer <= 180) {
    screen.drawText("CORRA! O SEEK ESTÁ CHEGANDO!", 0, 70, 14, "#ff0055");
  } else if (key.collected && !gameWon) {
    screen.drawText("Chave coletada! Corra para a porta verde!", 0, 80, 14, "#00ff66");
  }

  if (gameOver) {
    screen.fillRect(0, 0, screen.width || 400, screen.height || 300, "#000000");
    screen.drawText("O SEEK TE PEGOU!", 0, 10, 24, "#ff0000");
  }

  if (gameWon) {
    screen.fillRect(0, 0, screen.width || 400, screen.height || 300, "#000000");
    screen.drawText("VOCÊ ESCAPOU!", 0, 10, 24, "#00ff66");
  }
}
