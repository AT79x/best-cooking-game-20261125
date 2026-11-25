// Warung Nasi Goreng — keyboard and mouse. Clicks act on the game through the
// same world methods the keys use, so both controls always agree.
import { INGREDIENTS, LAYOUT, stationRect } from './config.js';
import { PHASE_OVER, PHASE_PLAY, PHASE_TITLE } from './world.js';

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function canvasPoint(canvas, event) {
  const bounds = canvas.getBoundingClientRect();
  const scaleX = canvas.width / bounds.width;
  const scaleY = canvas.height / bounds.height;
  return {
    x: (event.clientX - bounds.left) * scaleX,
    y: (event.clientY - bounds.top) * scaleY,
  };
}

/**
 * Wire the canvas and the keyboard to `world`.
 * `hooks` carries onStart, onRestart and playSound(name) from the boot code.
 */
export function bindInput(canvas, world, hooks) {
  const keyState = { left: false, right: false, up: false, down: false };

  function stationAt(point) {
    for (let index = 0; index < INGREDIENTS.length; index += 1) {
      if (pointInRect(point.x, point.y, stationRect(index))) return index;
    }
    return -1;
  }

  function customerAt(point) {
    for (let index = 0; index < world.customers.length; index += 1) {
      const cx = LAYOUT.customers.centres[index];
      const top = LAYOUT.customers.y;
      if (point.x >= cx - 46 && point.x <= cx + 46 && point.y >= top - 10 && point.y <= top + 96) return index;
    }
    return -1;
  }

  function plateAt(point) {
    for (let index = 0; index < LAYOUT.plates.slots.length; index += 1) {
      const slot = LAYOUT.plates.slots[index];
      if (Math.abs(point.x - slot.x) <= 56 && Math.abs(point.y - (slot.y + 12)) <= 34) return index;
    }
    return -1;
  }

  function wokAt(point) {
    return pointInRect(point.x, point.y, LAYOUT.wok);
  }

  function addFromStation(index) {
    const item = INGREDIENTS[index];
    const station = stationRect(index);
    world.chefTargetX = station.x + station.w / 2;
    if (world.addIngredient(item.id)) hooks.playSound('pick');
    else hooks.playSound('buzz');
  }

  function stationUnderChef() {
    for (let index = 0; index < INGREDIENTS.length; index += 1) {
      const rect = stationRect(index);
      if (world.chefX >= rect.x - 10 && world.chefX <= rect.x + rect.w + 10) return index;
    }
    return -1;
  }

  canvas.addEventListener('click', (event) => {
    const point = canvasPoint(canvas, event);
    if (world.phase === PHASE_TITLE) {
      hooks.onStart();
      return;
    }
    if (world.phase === PHASE_OVER) {
      hooks.onRestart();
      return;
    }
    const station = stationAt(point);
    if (station >= 0) {
      addFromStation(station);
      return;
    }
    if (wokAt(point)) {
      if (world.startCooking()) hooks.playSound('sizzle');
      else hooks.playSound('buzz');
      return;
    }
    const plate = plateAt(point);
    if (plate >= 0) {
      if (world.plates[plate]) {
        world.selectedPlate = world.selectedPlate === plate ? -1 : plate;
        hooks.playSound('pick');
      }
      return;
    }
    const customer = customerAt(point);
    if (customer >= 0) {
      if (world.selectedPlate >= 0) {
        const result = world.servePlate(world.selectedPlate, customer);
        hooks.playSound(result === 'served' ? 'ding' : 'buzz');
      }
    }
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    if (key === 'arrowleft' || key === 'a') keyState.left = true;
    if (key === 'arrowright' || key === 'd') keyState.right = true;
    if (key === 'arrowup' || key === 'w') keyState.up = true;
    if (key === 'arrowdown') keyState.down = true;
    if (world.phase === PHASE_TITLE && (key === 'enter' || key === ' ')) {
      hooks.onStart();
      return;
    }
    if (world.phase === PHASE_OVER && (key === 'r' || key === 'enter' || key === ' ')) {
      hooks.onRestart();
      return;
    }
    if (world.phase !== PHASE_PLAY) return;
    if (key === 'r') {
      hooks.onRestart();
      return;
    }
    if (key === 'p') {
      hooks.onPause();
      return;
    }
    const ingredient = INGREDIENTS.find((item) => item.key === key);
    if (ingredient) {
      addFromStation(INGREDIENTS.indexOf(ingredient));
      return;
    }
    if (key === 'e') {
      const index = stationUnderChef();
      if (index >= 0) addFromStation(index);
      return;
    }
    if (key === ' ') {
      if (world.startCooking()) hooks.playSound('sizzle');
      else hooks.playSound('buzz');
      return;
    }
    if (key === 's') {
      const result = world.serveSelected();
      hooks.playSound(result === 'served' ? 'ding' : 'buzz');
    }
  });

  window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') keyState.left = false;
    if (key === 'arrowright' || key === 'd') keyState.right = false;
    if (key === 'arrowup' || key === 'w') keyState.up = false;
    if (key === 'arrowdown') keyState.down = false;
  });

  /** Move the chef from the held arrow/WASD keys; call once per frame. */
  function applyHeldKeys(dt) {
    if (world.phase !== PHASE_PLAY) return;
    const speed = 420;
    if (keyState.left) {
      world.chefX = Math.max(40, world.chefX - speed * dt);
      world.chefTargetX = world.chefX;
    }
    if (keyState.right) {
      world.chefX = Math.min(920, world.chefX + speed * dt);
      world.chefTargetX = world.chefX;
    }
  }

  return { applyHeldKeys };
}
