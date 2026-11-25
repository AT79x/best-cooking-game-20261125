// Warung Nasi Goreng — boot and game loop.
// ?shot=<scene>&seed=<n> stages one deterministic scene and renders a single
// frame (the screenshot path); without it the game runs live from the title.
import { CANVAS } from './config.js';
import { World, PHASE_OVER, PHASE_PLAY, PHASE_TITLE } from './world.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { Sfx } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS.width;
canvas.height = CANVAS.height;

const params = new URLSearchParams(window.location.search);
const seed = Number.parseInt(params.get('seed') || '7', 10) || 7;
const shot = params.get('shot');
const world = new World(seed);
const sfx = new Sfx();
let paused = false;
let lastTick = performance.now();

// Test handle: the play-test drives the real game through this, never a stub.
window.__warung = { world, params };

const input = bindInput(canvas, world, {
  playSound: (name) => sfx.play(name),
  onStart: () => {
    sfx.ensure();
    world.start();
  },
  onRestart: () => {
    world.start();
  },
  onPause: () => {
    paused = !paused;
  },
});

function frame(now) {
  const dt = Math.min(0.05, (now - lastTick) / 1000);
  lastTick = now;
  if (!paused) {
    input.applyHeldKeys(dt);
    world.step(dt);
  }
  render(ctx, world);
  if (paused && world.phase === PHASE_PLAY) {
    ctx.fillStyle = 'rgba(20, 20, 20, 0.6)';
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 32px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JEDA — tekan P untuk lanjut', CANVAS.width / 2, CANVAS.height / 2);
  }
  requestAnimationFrame(frame);
}

if (shot) {
  stageShot(shot, world);
  render(ctx, world);
  document.title = `Warung Nasi Goreng — ${shot}`;
} else {
  world.phase = PHASE_TITLE;
  requestAnimationFrame(frame);
}
