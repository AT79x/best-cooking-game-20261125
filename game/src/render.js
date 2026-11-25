// Warung Nasi Goreng — everything the player sees, drawn on one canvas.
// No game rules here: render only reads the world and paints it.
import { CANVAS, INGREDIENTS, LAYOUT, RECIPES, STATION_WIDTH, ingredientById, recipeById, stationRect } from './config.js';
import { PHASE_OVER, PHASE_TITLE } from './world.js';

const WALL = '#f3e3c0';
const WOOD = '#8b5a2b';
const WOOD_DARK = '#6e451f';
const BOARD = '#2f3b2f';
const CHALK = '#f5f5dc';
const RED = '#c0392b';
const GOLD = '#f1c40f';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** One ingredient's picture: a bowl with the ingredient drawn inside it. */
export function drawIngredientIcon(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  // Bowl.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b0a080';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.clip();
  if (id === 'nasi') {
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.arc(0, 2, r * 0.72, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#e8ddc0';
    for (let i = 0; i < 6; i += 1) {
      ctx.fillRect(-r * 0.5 + i * r * 0.18, -r * 0.25 + (i % 2) * r * 0.2, 2, 2);
    }
  } else if (id === 'telur') {
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.8, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = '#c47a3a';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.1, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5e6cc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.3);
    ctx.lineTo(r * 0.75, r * 0.7);
    ctx.stroke();
    ctx.fillStyle = '#f5e6cc';
    ctx.beginPath();
    ctx.arc(r * 0.8, r * 0.75, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'mie') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.4 + i * r * 0.4);
      ctx.quadraticCurveTo(0, -r * 0.7 + i * r * 0.4, r * 0.7, -r * 0.4 + i * r * 0.4);
      ctx.stroke();
    }
  } else if (id === 'sayur') {
    ctx.fillStyle = '#58b368';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(-r * 0.4 + i * r * 0.4, -r * 0.1 + (i % 2) * r * 0.25, r * 0.3, r * 0.5, (i - 1) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.6);
    ctx.lineTo(0, r * 0.6);
    ctx.stroke();
  } else if (id === 'kecap') {
    ctx.fillStyle = '#5b3a29';
    ctx.fillRect(-r * 0.35, -r * 0.5, r * 0.7, r * 1.1);
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(-r * 0.2, -r * 0.85, r * 0.4, r * 0.4);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-r * 0.35, -r * 0.1, r * 0.7, r * 0.3);
  }
  ctx.restore();
}

/** A finished dish on a plate: a mound tinted by its first ingredient. */
function drawDishOnPlate(ctx, dish, x, y, r) {
  const first = dish.ingredients[0] || 'nasi';
  const base = ingredientById(first);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9bfa5';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = base ? base.color : '#f5f0dc';
  ctx.beginPath();
  ctx.arc(x, y - r * 0.22, r * 0.55, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#58b368';
  ctx.fillRect(x - r * 0.3, y - r * 0.55, r * 0.6, 3);
  if (dish.dishId === 'spesial') {
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(x + r * 0.35, y - r * 0.5, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCustomer(ctx, customer, cx, top) {
  // Body and head behind the counter.
  ctx.fillStyle = customer.shirt;
  roundRect(ctx, cx - 42, top + 34, 84, 62, 12);
  ctx.fill();
  ctx.fillStyle = customer.skin;
  ctx.beginPath();
  ctx.arc(cx, top + 18, 26, 0, Math.PI * 2);
  ctx.fill();
  // Hair.
  ctx.fillStyle = '#2d2d2d';
  ctx.beginPath();
  ctx.arc(cx, top + 8, 26, Math.PI, 0);
  ctx.fill();
  // Face: eyes and a mouth that follows the mood.
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(cx - 9, top + 16, 3, 0, Math.PI * 2);
  ctx.arc(cx + 9, top + 16, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (customer.mood === 'happy') {
    ctx.arc(cx, top + 22, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  } else if (customer.patience < customer.maxPatience * 0.35) {
    ctx.arc(cx, top + 32, 7, 1.15 * Math.PI, 1.85 * Math.PI);
  } else {
    ctx.moveTo(cx - 6, top + 27);
    ctx.lineTo(cx + 6, top + 27);
  }
  ctx.stroke();
  // Patience bar.
  const fraction = Math.max(0, customer.patience / customer.maxPatience);
  ctx.fillStyle = '#222';
  ctx.fillRect(cx - 42, top + 82, 84, 8);
  ctx.fillStyle = fraction > 0.5 ? '#2ecc71' : fraction > 0.25 ? '#f39c12' : '#e74c3c';
  ctx.fillRect(cx - 41, top + 83, 82 * fraction, 6);
}

function drawChef(ctx, world) {
  const x = world.chefX;
  const y = LAYOUT.chefLane.y + 28;
  const bob = world.chefMoving ? Math.sin(world.elapsed * 14) * 3 : 0;
  // Apron body.
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x - 20, y - 18 + bob, 40, 34, 8);
  ctx.fill();
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(x - 20, y - 18 + bob, 40, 8);
  // Head and toque.
  ctx.fillStyle = '#f1c27d';
  ctx.beginPath();
  ctx.arc(x, y - 28 + bob, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 8, y - 38 + bob, 8, 0, Math.PI * 2);
  ctx.arc(x + 8, y - 38 + bob, 8, 0, Math.PI * 2);
  ctx.arc(x, y - 42 + bob, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(x - 5, y - 29 + bob, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 5, y - 29 + bob, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

export function render(ctx, world) {
  const { width, height } = CANVAS;
  // Wall and floor.
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#e8d3a8';
  ctx.fillRect(0, 540, width, 100);
  ctx.strokeStyle = '#d9c08a';
  ctx.lineWidth = 2;
  for (let x = 0; x < width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 540);
    ctx.lineTo(x - 30, height);
    ctx.stroke();
  }
  // Awning stripes.
  for (let i = 0; i < 12; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? RED : GOLD;
    ctx.fillRect(i * 80, 0, 80, 14);
  }
  ctx.fillStyle = '#7a1f16';
  ctx.fillRect(0, 14, width, 4);

  drawHud(ctx, world);
  drawOrderBoard(ctx, world);
  drawMenuBoard(ctx);
  drawCustomers(ctx, world);
  drawCounter(ctx, world);
  drawWok(ctx, world);
  drawPlates(ctx, world);
  drawChef(ctx, world);
  drawHint(ctx, world);

  if (world.phase === PHASE_TITLE) drawTitle(ctx, world);
  if (world.phase === PHASE_OVER) drawGameOver(ctx, world);
}

function drawHud(ctx, world) {
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 18, CANVAS.width, 38);
  text(ctx, 'WARUNG NASI GORENG', 16, 37, 20, GOLD);
  text(ctx, `Skor ${world.score}`, 330, 37, 18, '#ffffff');
  text(ctx, `Koin ${world.coins}`, 470, 37, 18, '#ffffff');
  if (world.combo > 1) {
    text(ctx, `Combo x${world.combo}!`, 580, 37, 18, '#ff9f43');
  }
  // Hearts.
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < world.hearts ? '#e74c3c' : '#555';
    ctx.beginPath();
    ctx.arc(700 + i * 26, 37, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  // Round timer.
  const minutes = Math.floor(world.timeLeft / 60);
  const seconds = Math.floor(world.timeLeft % 60);
  const label = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const urgent = world.timeLeft <= 20 && world.phase === 'play';
  text(ctx, `Waktu ${label}`, 800, 37, 20, urgent ? '#ff6b6b' : '#ffffff', 'left');
}

function drawOrderBoard(ctx, world) {
  const board = LAYOUT.orderBoard;
  ctx.fillStyle = BOARD;
  roundRect(ctx, board.x, board.y, board.w, board.h, 8);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'PESANAN', board.x + 12, board.y + 16, 13, GOLD);
  for (let slot = 0; slot < 3; slot += 1) {
    const customer = world.customers[slot];
    const x = board.x + 90 + slot * 150;
    if (!customer) {
      text(ctx, '— kosong —', x + 65, board.y + 46, 13, '#7d8b7d', 'center');
      continue;
    }
    const recipe = recipeById(customer.recipeId);
    text(ctx, `#${customer.id} ${recipe.name}`, x, board.y + 22, 13, CHALK);
    // Needed ingredients as dots.
    recipe.needs.forEach((id, i) => {
      const item = ingredientById(id);
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x + 10 + i * 20, board.y + 46, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    // Patience bar.
    const fraction = Math.max(0, customer.patience / customer.maxPatience);
    ctx.fillStyle = '#111';
    ctx.fillRect(x, board.y + 62, 130, 8);
    ctx.fillStyle = fraction > 0.5 ? '#2ecc71' : fraction > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(x + 1, board.y + 63, 128 * fraction, 6);
  }
}

function drawMenuBoard(ctx) {
  const board = LAYOUT.menuBoard;
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, board.x, board.y, board.w, board.h, 8);
  ctx.fill();
  ctx.strokeStyle = WOOD;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'MENU — resep warung', board.x + 12, board.y + 16, 13, WOOD_DARK);
  RECIPES.forEach((recipe, i) => {
    const y = board.y + 36 + i * 11;
    text(ctx, `${recipe.name}: ${recipe.needs.join(' + ')}`, board.x + 12, y, 11, '#333', 'left', 'normal');
    text(ctx, `${recipe.points}`, board.x + board.w - 14, y, 11, '#c0392b', 'right');
  });
}

function drawCustomers(ctx, world) {
  world.customers.forEach((customer, index) => {
    const cx = LAYOUT.customers.centres[index];
    drawCustomer(ctx, customer, cx, LAYOUT.customers.y);
  });
}

function drawCounter(ctx, world) {
  const counter = LAYOUT.counter;
  ctx.fillStyle = WOOD;
  roundRect(ctx, counter.x, counter.y, counter.w, counter.h, 10);
  ctx.fill();
  ctx.fillStyle = WOOD_DARK;
  ctx.fillRect(counter.x, counter.y, counter.w, 10);
  INGREDIENTS.forEach((item, index) => {
    const rect = stationRect(index);
    ctx.fillStyle = '#a06a35';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
    ctx.fill();
    drawIngredientIcon(ctx, item.id, rect.x + rect.w / 2, rect.y + 34, 26);
    text(ctx, item.name, rect.x + rect.w / 2, rect.y + 76, 14, '#ffffff', 'center');
    text(ctx, `[${item.key}]`, rect.x + rect.w / 2, rect.y + 96, 12, GOLD, 'center');
    // Wok contents echo: a gold ring when this ingredient is in the wok.
    const count = world.wok.filter((id) => id === item.id).length;
    if (count > 0) {
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(rect.x + rect.w / 2, rect.y + 34, 32, 0, Math.PI * 2);
      ctx.stroke();
      text(ctx, `x${count}`, rect.x + rect.w - 18, rect.y + 18, 13, GOLD, 'center');
    }
  });
}

function drawWok(ctx, world) {
  const wok = LAYOUT.wok;
  ctx.fillStyle = '#5d4037';
  roundRect(ctx, wok.x, wok.y, wok.w, wok.h, 10);
  ctx.fill();
  text(ctx, 'WOK — tekan SPASI untuk memasak', wok.x + wok.w / 2, wok.y + 14, 12, '#d7ccc8', 'center');
  // Fire.
  const cx = wok.x + 90;
  const cy = wok.y + 66;
  if (world.cooking) {
    ctx.fillStyle = '#ff6d00';
    ctx.beginPath();
    ctx.moveTo(cx - 34, cy + 18);
    ctx.quadraticCurveTo(cx - 20, cy - 26, cx, cy - 6);
    ctx.quadraticCurveTo(cx + 20, cy - 26, cx + 34, cy + 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 18);
    ctx.quadraticCurveTo(cx - 8, cy - 8, cx, cy + 2);
    ctx.quadraticCurveTo(cx + 8, cy - 8, cx + 18, cy + 18);
    ctx.closePath();
    ctx.fill();
  }
  // The wok bowl.
  ctx.fillStyle = '#37474f';
  ctx.beginPath();
  ctx.arc(cx, cy, 42, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#263238';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 42, 12, 0, 0, Math.PI);
  ctx.fill();
  // Ingredients tumbling in the wok.
  world.wok.forEach((id, i) => {
    drawIngredientIcon(ctx, id, cx - 24 + i * 24, cy - 6, 11);
  });
  if (world.cooking) {
    world.cooking.ingredients.forEach((id, i) => {
      drawIngredientIcon(ctx, id, cx - 24 + i * 24, cy - 6, 11);
    });
    const fraction = 1 - world.cooking.left / world.cooking.total;
    ctx.fillStyle = '#222';
    ctx.fillRect(wok.x + 150, wok.y + 40, 130, 14);
    ctx.fillStyle = '#ff9800';
    ctx.fillRect(wok.x + 151, wok.y + 41, 128 * fraction, 12);
    text(ctx, world.cooking.name, wok.x + 215, wok.y + 72, 13, '#ffffff', 'center');
    text(ctx, `${Math.ceil(world.cooking.left)} dtk`, wok.x + 215, wok.y + 90, 12, GOLD, 'center');
  } else if (world.wok.length > 0) {
    const matched = world.wokRecipe();
    text(ctx, matched ? matched.name : 'Campuran…', wok.x + 215, wok.y + 48, 13, '#ffffff', 'center');
    text(ctx, `${world.wok.length} bahan di wok`, wok.x + 215, wok.y + 68, 12, GOLD, 'center');
  } else {
    text(ctx, 'Wok kosong', wok.x + 215, wok.y + 48, 13, '#9e9e9e', 'center');
    text(ctx, 'klik bahan di atas', wok.x + 215, wok.y + 68, 12, '#9e9e9e', 'center');
  }
}

function drawPlates(ctx, world) {
  const area = LAYOUT.plates;
  ctx.fillStyle = '#6d4c41';
  roundRect(ctx, area.x, area.y, area.w, area.h, 10);
  ctx.fill();
  text(ctx, 'MEJA SAJI', area.x + area.w / 2, area.y + 12, 12, '#d7ccc8', 'center');
  text(ctx, 'klik piring, lalu pelanggan / S', area.x + area.w / 2, area.y + 27, 11, '#bcaaa4', 'center', 'normal');
  area.slots.forEach((slot, index) => {
    const plate = world.plates[index];
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.ellipse(slot.x, slot.y + 12, 52, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    if (plate) {
      drawDishOnPlate(ctx, plate, slot.x, slot.y + 8, 34);
      text(ctx, plate.name, slot.x, slot.y + 40, 12, '#ffffff', 'center');
      if (world.selectedPlate === index) {
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(slot.x, slot.y + 12, 58, 18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      text(ctx, '—', slot.x, slot.y + 8, 16, '#a1887f', 'center');
    }
  });
}

function drawHint(ctx, world) {
  text(ctx, 'Klik bahan (1–6) • SPASI masak • Klik piring lalu pelanggan / S sajikan • P jeda • R ulang', 480, LAYOUT.hint.y + 12, 12, '#6d4c41', 'center', 'normal');
  if (world.flash && world.flashTimer > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    roundRect(ctx, 280, 580, 400, 30, 8);
    ctx.fill();
    text(ctx, world.flash, 480, 595, 14, GOLD, 'center');
  }
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(20, 20, 20, 0.72)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  text(ctx, 'WARUNG', 480, 180, 56, GOLD, 'center');
  text(ctx, 'NASI GORENG', 480, 240, 56, '#ffffff', 'center');
  text(ctx, 'Masak cepat, sajikan tepat — pelanggan tidak suka menunggu!', 480, 300, 17, '#ffe0b2', 'center');
  text(ctx, 'Klik bahan di konter, masak di wok, sajikan sebelum pelanggan kabur.', 480, 330, 15, '#ffffff', 'center', 'normal');
  text(ctx, 'Tekan ENTER atau klik untuk mulai', 480, 400, 18, GOLD, 'center');
  text(ctx, 'Panah / WASD gerakkan koki • E ambil bahan • SPASI masak • S sajikan', 480, 440, 13, '#cccccc', 'center', 'normal');
}

function drawGameOver(ctx, world) {
  ctx.fillStyle = 'rgba(20, 20, 20, 0.78)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  text(ctx, 'TUTUP WARUNG', 480, 190, 48, GOLD, 'center');
  text(ctx, world.overReason, 480, 250, 17, '#ffffff', 'center', 'normal');
  text(ctx, `Skor akhir: ${world.score}   •   Piring tersaji: ${world.served}   •   Combo terbaik: x${world.bestCombo}`, 480, 310, 18, '#ffe0b2', 'center');
  text(ctx, `Pelanggan kabur: ${world.lost}   •   Koin: ${world.coins}`, 480, 345, 15, '#ffffff', 'center', 'normal');
  text(ctx, 'Tekan R atau klik untuk main lagi', 480, 410, 18, GOLD, 'center');
}
