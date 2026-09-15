let player = { x: 0, y: 1.6, z: 15, vy: 0, isGrounded: true, angle: 0 };
let seek = { x: 0, y: 1.5, z: 28 };
let key = { x: 0, y: 5.5, z: -26, collected: false };
let door = { x: 0, y: 6, z: -27.5, open: false };

let gameOver = false;
let gameWon = false;
let startTimer = 0; 

const gravity = -0.015;
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

init = function() {
  player = { x: 0, y: 1.6, z: 15, vy: 0, isGrounded: true, angle: 0 };
  seek = { x: 0, y: 1.5, z: 28 };
  key = { x: 0, y: 5.5, z: -26, collected: false };
  door = { x: 0, y: 6, z: -27.5, open: false };
  gameOver = false;
  gameWon = false;
  startTimer = 0;
};

update = function() {
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
    player.vy = 0.25;
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
  if (player.y < -12) gameOver = true;

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

    if (dist3D < 1.3) gameOver = true;
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
    }
  }
};

// --- CÁLCULO DE PROJEÇÃO 3D COM ROTAÇÃO DE CÂMERA ---
function project(x, y, z) {
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

  let fov = 160;
  let scale = fov / (relZ < 0.1 ? 0.1 : relZ);

  return {
    x: relX * scale,
    y: relY * scale,
    size: scale,
    visible: relZ > 0.1
  };
}

draw = function() {
  screen.fillRect(0, 0, screen.width || 400, screen.height || 300, "#0b0b12");

  platforms.forEach(p => {
    let p3d = project(p.x, p.y, p.z);
    if (p3d.visible) {
      screen.fillRect(p3d.x, p3d.y, p.w * p3d.size, p.h * p3d.size, "#343a40");
    }
  });

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
    screen.fillRect(s3d.x, s3d.y, 25 * (s3d.size / 20), 45 * (s3d.size / 20), "#000000");
    screen.fillRect(s3d.x, s3d.y + 10 * (s3d.size / 20), 8 * (s3d.size / 20), 8 * (s3d.size / 20), "#ffffff");
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
};