// Screenshot scenes for Warung Nasi Goreng. Each scene plays the real rules
// forward from a fresh world with a fixed seed, so the frame is what a short
// game really looks like and the same seed always gives the same frame.
// ?shot=kitchen|ingredients|assembly|serve (any other name is kitchen).
import { PHASE_PLAY } from './world.js';

const STEP = 1 / 60;

/** Run the world forward `seconds` with no input. */
function advance(world, seconds) {
  for (let t = 0; t < seconds; t += STEP) world.step(STEP);
}

/**
 * Set `world` to the named scene and return the phase to draw.
 * The world is always left in PHASE_PLAY so the frame shows live play.
 */
export function stageShot(name, world) {
  world.reset(world.seed);
  world.phase = PHASE_PLAY;
  world.spawnCustomer();
  if (name === 'ingredients') {
    advance(world, 2);
    world.addIngredient('nasi');
    world.addIngredient('telur');
    advance(world, 0.5);
    return { screen: PHASE_PLAY };
  }
  if (name === 'assembly') {
    advance(world, 2);
    world.spawnCustomer();
    world.addIngredient('nasi');
    world.addIngredient('telur');
    world.addIngredient('kecap');
    world.startCooking();
    advance(world, 2.4);
    return { screen: PHASE_PLAY };
  }
  if (name === 'serve') {
    advance(world, 2);
    world.spawnCustomer();
    const order = world.customers[0];
    const recipe = order.recipeId;
    const needs = {
      'nasi-goreng': ['nasi', 'telur', 'kecap'],
      'mie-goreng': ['mie', 'telur', 'sayur'],
      'nasi-ayam': ['nasi', 'ayam', 'kecap'],
      'mie-ayam': ['mie', 'ayam', 'kecap'],
      spesial: ['nasi', 'telur', 'ayam', 'kecap'],
    }[recipe];
    needs.forEach((id) => world.addIngredient(id));
    world.startCooking();
    advance(world, 6);
    // Park the clock mid-round so the timer reads as running.
    world.elapsed = 75;
    world.step(0);
    return { screen: PHASE_PLAY };
  }
  // kitchen: the stall at work, orders up, nothing cooked yet.
  advance(world, 3);
  world.spawnCustomer();
  advance(world, 1.5);
  return { screen: PHASE_PLAY };
}
