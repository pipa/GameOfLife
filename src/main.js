// @ts-check
import { createWorld, get, place, population, randomize, resize, set, step } from './core/life.js';
import { PATTERNS } from './core/patterns.js';
import { advance, runLoop } from './core/loop.js';
import { createRenderer } from './render.js';

/** @typedef {import('./core/life.js').World} World */

const $ = (/** @type {string} */ sel) => /** @type {HTMLElement} */ (document.querySelector(sel));
const canvas = /** @type {HTMLCanvasElement} */ ($('#board'));
const stage = $('#stage');
const intro = $('#intro');
const playBtn = /** @type {HTMLButtonElement} */ ($('#play'));
const stepBtn = /** @type {HTMLButtonElement} */ ($('#step'));
const clearBtn = /** @type {HTMLButtonElement} */ ($('#clear'));
const randomBtn = /** @type {HTMLButtonElement} */ ($('#random'));
const patternSel = /** @type {HTMLSelectElement} */ ($('#pattern'));
const speedInput = /** @type {HTMLInputElement} */ ($('#speed'));
const speedOut = $('#speed-out');
const wrapToggle = /** @type {HTMLInputElement} */ ($('#wrap'));
const genEl = $('#gen');
const popEl = $('#pop');
const live = $('#live');

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const renderer = createRenderer(canvas);

for (const [id, p] of Object.entries(PATTERNS)) patternSel.add(new Option(p.name, id));
patternSel.add(new Option('Random soup', 'random'));

/** @type {World} */
let world = createWorld(40, 40);
let generation = 0;
let running = false;
let acc = 0;
/** @type {{ x: number, y: number } | null} */
let cursor = null;

if (motion.matches) speedInput.value = '4';

const stepMs = () => 1000 / Number(speedInput.value);

function updateStats() {
  genEl.textContent = String(generation);
  popEl.textContent = String(population(world));
}

/** @param {boolean} on */
function setRunning(on) {
  running = on;
  acc = 0;
  playBtn.textContent = on ? 'Pause' : 'Play';
  playBtn.setAttribute('aria-pressed', String(on));
  stepBtn.disabled = on;
  live.textContent = on ? 'Running' : `Paused at generation ${generation}`;
}

function dismissIntro() {
  intro.hidden = true;
}

function loadPattern() {
  const id = patternSel.value;
  world = id === 'random' ? randomize(world) : place(world, PATTERNS[id].cells);
  generation = 0;
  updateStats();
}

function tick() {
  world = step(world, wrapToggle.checked);
  generation++;
  updateStats();
  if (population(world) === 0 && running) {
    setRunning(false);
    live.textContent = `Everything died at generation ${generation}`;
  }
}

/** Grid size from the stage box: aim for ~14 CSS px cells, at least 40 columns so the gun fits. */
function fitGrid() {
  const rect = stage.getBoundingClientRect();
  const cellPx = Math.max(7, Math.min(14, rect.width / 40));
  const cols = Math.max(40, Math.floor(rect.width / cellPx));
  const rows = Math.max(24, Math.floor(rect.height / cellPx));
  if (cols !== world.cols || rows !== world.rows) world = resize(world, cols, rows);
  renderer.resize(world.cols, world.rows, rect);
}

// Pointer drawing: tap toggles, drag paints with the state of the first cell.
/** @type {0 | 1 | null} */
let paint = null;
/** @param {PointerEvent} e */
const cellAt = (e) => {
  const rect = canvas.getBoundingClientRect();
  const c = renderer.cssCell();
  return { x: Math.floor((e.clientX - rect.left) / c), y: Math.floor((e.clientY - rect.top) / c) };
};
canvas.addEventListener('pointerdown', (e) => {
  dismissIntro();
  canvas.setPointerCapture(e.pointerId);
  const { x, y } = cellAt(e);
  paint = get(world, x, y) ? 0 : 1;
  world = set(world, x, y, paint);
  cursor = null;
  updateStats();
});
canvas.addEventListener('pointermove', (e) => {
  if (paint === null) return;
  const { x, y } = cellAt(e);
  if (get(world, x, y) !== paint) {
    world = set(world, x, y, paint);
    updateStats();
  }
});
const stopPaint = () => (paint = null);
canvas.addEventListener('pointerup', stopPaint);
canvas.addEventListener('pointercancel', stopPaint);

// Keyboard: arrows move a cursor on the focused board, Enter toggles; global shortcuts below.
canvas.addEventListener('keydown', (e) => {
  /** @type {Record<string, [number, number]>} */
  const moves = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  const m = moves[e.key];
  if (m) {
    e.preventDefault();
    const c = cursor ?? { x: world.cols >> 1, y: world.rows >> 1 };
    cursor = {
      x: Math.min(world.cols - 1, Math.max(0, c.x + m[0])),
      y: Math.min(world.rows - 1, Math.max(0, c.y + m[1])),
    };
  } else if (e.key === 'Enter' && cursor) {
    e.preventDefault();
    world = set(world, cursor.x, cursor.y, get(world, cursor.x, cursor.y) ? 0 : 1);
    updateStats();
  }
});
canvas.addEventListener('blur', () => (cursor = null));

window.addEventListener('keydown', (e) => {
  if (e.target instanceof Element && e.target.closest('button, input, select') && e.key !== 'Escape') return;
  const k = e.key.toLowerCase();
  if (k === ' ') {
    e.preventDefault();
    dismissIntro();
    setRunning(!running);
  } else if (k === 'n' && !running) {
    tick();
  } else if (k === 'c') {
    clearBtn.click();
  } else if (k === 'r') {
    randomBtn.click();
  }
});

playBtn.addEventListener('click', () => {
  dismissIntro();
  setRunning(!running);
});
stepBtn.addEventListener('click', () => {
  dismissIntro();
  tick();
});
clearBtn.addEventListener('click', () => {
  dismissIntro();
  setRunning(false);
  world = createWorld(world.cols, world.rows);
  generation = 0;
  updateStats();
});
randomBtn.addEventListener('click', () => {
  dismissIntro();
  patternSel.value = 'random';
  loadPattern();
});
patternSel.addEventListener('change', () => {
  dismissIntro();
  loadPattern();
});
speedInput.addEventListener('input', () => {
  speedOut.textContent = `${speedInput.value}/s`;
});
$('#intro-start').addEventListener('click', () => {
  dismissIntro();
  setRunning(true);
  canvas.focus({ preventScroll: true });
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && running) setRunning(false);
});

new ResizeObserver(fitGrid).observe(stage);
fitGrid();
speedOut.textContent = `${speedInput.value}/s`;
loadPattern();

runLoop((_now, elapsed) => {
  if (running) {
    const r = advance(acc, elapsed, stepMs(), 3);
    acc = r.accumulator;
    for (let i = 0; i < r.steps && running; i++) tick();
  }
  renderer.draw(world, { elapsed, trails: !motion.matches, cursor });
});
