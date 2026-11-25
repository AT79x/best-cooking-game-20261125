// Warung Nasi Goreng — the rules. No drawing here, no input here: the world
// only holds state and answers "what happens when the player does X".
import {
  CAMPUR,
  COMBO_WINDOW_SECONDS,
  INGREDIENTS,
  MAX_CUSTOMERS,
  MAX_HEARTS,
  MAX_PLATES,
  MAX_WOK_ITEMS,
  RECIPES,
  ROUND_SECONDS,
  matchRecipe,
  recipeById,
} from './config.js';
import { makeRng, pick, range } from './rng.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_OVER = 'over';

const CUSTOMER_SHIRTS = ['#e74c3c', '#3498db', '#9b59b6', '#e67e22', '#1abc9c'];
const CUSTOMER_SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524'];

function spawnIntervalSeconds(elapsed) {
  return elapsed > 60 ? 6 : 9;
}

function patienceSeconds(elapsed) {
  return elapsed > 60 ? 20 : 26;
}

export class World {
  constructor(seed = 1) {
    this.seed = seed;
    this.reset(seed);
  }

  reset(seed = this.seed) {
    this.seed = seed;
    this.rng = makeRng(seed);
    this.phase = PHASE_TITLE;
    this.elapsed = 0;
    this.timeLeft = ROUND_SECONDS;
    this.score = 0;
    this.coins = 0;
    this.served = 0;
    this.servedCorrect = 0;
    this.lost = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.comboTimer = 0;
    this.lastServeAt = -100;
    this.hearts = MAX_HEARTS;
    this.customers = [];
    this.nextCustomerId = 1;
    this.spawnTimer = 2;
    this.wok = [];
    this.cooking = null;
    this.plates = [];
    this.selectedPlate = -1;
    this.chefX = 480;
    this.chefTargetX = 480;
    this.chefMoving = false;
    this.flash = '';
    this.flashTimer = 0;
    this.overReason = '';
  }

  start() {
    this.reset(this.seed);
    this.phase = PHASE_PLAY;
    this.spawnCustomer();
  }

  spawnCustomer() {
    if (this.customers.length >= MAX_CUSTOMERS) return null;
    const recipe = pick(this.rng, RECIPES);
    const patience = patienceSeconds(this.elapsed);
    const customer = {
      id: this.nextCustomerId,
      recipeId: recipe.id,
      patience,
      maxPatience: patience,
      shirt: CUSTOMER_SHIRTS[(this.nextCustomerId - 1) % CUSTOMER_SHIRTS.length],
      skin: CUSTOMER_SKINS[range(this.rng, 0, CUSTOMER_SKINS.length - 1)],
      mood: 'waiting',
      moodTimer: 0,
    };
    this.nextCustomerId += 1;
    this.customers.push(customer);
    return customer;
  }

  /** The recipe the wok currently matches, or null. */
  wokRecipe() {
    return this.wok.length === 0 ? null : matchRecipe(this.wok);
  }

  /** Add one ingredient to the wok. Returns true when it landed in the wok. */
  addIngredient(id) {
    if (this.phase !== PHASE_PLAY) return false;
    if (this.cooking) return false;
    if (this.wok.length >= MAX_WOK_ITEMS) {
      this.say('Wok penuh!');
      return false;
    }
    if (!INGREDIENTS.some((item) => item.id === id)) return false;
    this.wok.push(id);
    return true;
  }

  /** Start cooking what is in the wok. Returns true when the fire is lit. */
  startCooking() {
    if (this.phase !== PHASE_PLAY) return false;
    if (this.cooking) return false;
    if (this.wok.length < 2) {
      this.say('Masukkan minimal 2 bahan dulu!');
      return false;
    }
    if (this.plates.length >= MAX_PLATES) {
      this.say('Meja saji penuh — sajikan dulu!');
      return false;
    }
    const recipe = this.wokRecipe();
    const dish = recipe || CAMPUR;
    this.cooking = {
      dishId: dish.id,
      name: dish.name,
      points: dish.points,
      ingredients: [...this.wok],
      total: dish.cookSeconds,
      left: dish.cookSeconds,
    };
    this.wok = [];
    return true;
  }

  /**
   * Serve plate `plateIndex` to customer `customerIndex`.
   * Returns 'served', 'wrong' or 'none'.
   */
  servePlate(plateIndex, customerIndex) {
    if (this.phase !== PHASE_PLAY) return 'none';
    const plate = this.plates[plateIndex];
    const customer = this.customers[customerIndex];
    if (!plate || !customer) return 'none';
    const matches = plate.dishId === customer.recipeId || plate.dishId === CAMPUR.id;
    if (!matches) {
      this.say(`Bukan ${recipeById(customer.recipeId).name}!`);
      return 'wrong';
    }
    const patienceFraction = Math.max(0, customer.patience / customer.maxPatience);
    const tip = Math.round(patienceFraction * 10);
    if (this.elapsed - this.lastServeAt <= COMBO_WINDOW_SECONDS) {
      this.combo += 1;
    } else {
      this.combo = 1;
    }
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.lastServeAt = this.elapsed;
    this.comboTimer = COMBO_WINDOW_SECONDS;
    const multiplier = Math.min(2, 1 + (this.combo - 1) * 0.1);
    const gained = Math.round((plate.points + tip) * multiplier);
    this.score += gained;
    this.coins += plate.points;
    this.served += 1;
    if (plate.dishId === customer.recipeId) this.servedCorrect += 1;
    customer.mood = 'happy';
    customer.moodTimer = 0.9;
    this.customers.splice(customerIndex, 1);
    this.plates.splice(plateIndex, 1);
    this.selectedPlate = -1;
    this.say(`+${gained} — ${plate.name} tersaji!`);
    return 'served';
  }

  /** Serve the selected plate to the first customer whose order it matches. */
  serveSelected() {
    if (this.selectedPlate < 0 || this.selectedPlate >= this.plates.length) return 'none';
    const plate = this.plates[this.selectedPlate];
    let target = this.customers.findIndex((c) => c.recipeId === plate.dishId);
    if (target < 0 && plate.dishId === CAMPUR.id) target = 0;
    if (target < 0) {
      this.say('Tidak ada yang pesan ini!');
      return 'wrong';
    }
    return this.servePlate(this.selectedPlate, target);
  }

  say(text) {
    this.flash = text;
    this.flashTimer = 2.2;
  }

  endRound(reason) {
    if (this.phase !== PHASE_PLAY) return;
    this.phase = PHASE_OVER;
    this.overReason = reason;
    this.cooking = null;
  }

  /** Advance the world by `dt` seconds. */
  step(dt) {
    if (this.flashTimer > 0) this.flashTimer = Math.max(0, this.flashTimer - dt);
    if (this.comboTimer > 0) this.comboTimer = Math.max(0, this.comboTimer - dt);
    // The chef walks toward the last station the player used.
    const dx = this.chefTargetX - this.chefX;
    if (Math.abs(dx) > 4) {
      this.chefX += Math.sign(dx) * Math.min(Math.abs(dx), 420 * dt);
      this.chefMoving = true;
    } else {
      this.chefMoving = false;
    }
    if (this.phase !== PHASE_PLAY) return;

    this.elapsed += dt;
    this.timeLeft = Math.max(0, ROUND_SECONDS - this.elapsed);
    if (this.timeLeft <= 0) {
      this.endRound('Waktu habis! Jam tutup warung.');
      return;
    }

    // New customers walk in.
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnCustomer();
      this.spawnTimer = spawnIntervalSeconds(this.elapsed);
    }

    // Patience runs out: the customer storms off and a heart is lost.
    for (let index = this.customers.length - 1; index >= 0; index -= 1) {
      const customer = this.customers[index];
      if (customer.mood === 'happy') {
        customer.moodTimer -= dt;
        continue;
      }
      customer.patience -= dt;
      if (customer.patience <= 0) {
        this.customers.splice(index, 1);
        this.lost += 1;
        this.hearts -= 1;
        this.combo = 0;
        this.say('Pelanggan kabur — kesal menunggu!');
        if (this.hearts <= 0) {
          this.endRound('Semua pelanggan kabur — warung sepi!');
          return;
        }
      }
    }

    // The wok finishes: the dish lands on the serving counter.
    if (this.cooking) {
      this.cooking.left -= dt;
      if (this.cooking.left <= 0) {
        const dish = this.cooking;
        this.cooking = null;
        if (this.plates.length < MAX_PLATES) {
          this.plates.push({ dishId: dish.dishId, name: dish.name, points: dish.points, ingredients: dish.ingredients });
          this.say(`${dish.name} matang — siap disajikan!`);
        }
      }
    }
  }
}
