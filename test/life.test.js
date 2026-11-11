import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createWorld,
  get,
  neighbours,
  place,
  population,
  randomize,
  resize,
  rule,
  set,
  step,
} from '../src/core/life.js';
import { PATTERNS } from '../src/core/patterns.js';

/** @param {readonly string[]} rows */
const fromRows = (rows) => {
  const w = createWorld(rows[0].length, rows.length);
  rows.forEach((r, y) => [...r].forEach((c, x) => (w.cells[y * w.cols + x] = c === 'O' ? 1 : 0)));
  return w;
};
/** @param {import('../src/core/life.js').World} w */
const toRows = (w) =>
  Array.from({ length: w.rows }, (_, y) =>
    Array.from({ length: w.cols }, (_, x) => (get(w, x, y) ? 'O' : '.')).join(''),
  );

test('B3/S23 rule table', () => {
  assert.equal(rule(0, 3), 1);
  assert.equal(rule(0, 2), 0);
  assert.equal(rule(1, 2), 1);
  assert.equal(rule(1, 3), 1);
  assert.equal(rule(1, 1), 0);
  assert.equal(rule(1, 4), 0);
});

test('blinker oscillates with period 2', () => {
  const a = fromRows(['.....', '..O..', '..O..', '..O..', '.....']);
  const b = step(a);
  assert.deepEqual(toRows(b), ['.....', '.....', '.OOO.', '.....', '.....']);
  assert.deepEqual(toRows(step(b)), toRows(a));
});

test('block is a still life', () => {
  const a = fromRows(['....', '.OO.', '.OO.', '....']);
  assert.deepEqual(toRows(step(a)), toRows(a));
});

test('glider moves one cell diagonally every 4 generations', () => {
  let w = fromRows(['.O....', '..O...', 'OOO...', '......', '......', '......']);
  for (let i = 0; i < 4; i++) w = step(w);
  assert.deepEqual(toRows(w), ['......', '..O...', '...O..', '.OOO..', '......', '......']);
});

test('edges are dead without wrap and connected with wrap', () => {
  const w = fromRows(['O...O', '.....', '.....', '.....', 'O...O']);
  assert.equal(neighbours(w, 0, 0, false), 0);
  assert.equal(neighbours(w, 0, 0, true), 3);
  assert.equal(population(step(w, false)), 0);
  assert.equal(population(step(w, true)), 4); // A 2x2 block across the corners.
});

test('step and set never mutate their input', () => {
  const a = fromRows(['.O.', '.O.', '.O.']);
  const before = toRows(a);
  step(a);
  set(a, 0, 0, 1);
  assert.deepEqual(toRows(a), before);
  assert.equal(set(a, 99, 99, 1), a);
});

test('resize keeps the pattern centred', () => {
  const a = fromRows(['O']);
  const b = resize(a, 3, 3);
  assert.deepEqual(toRows(b), ['...', '.O.', '...']);
  assert.deepEqual(toRows(resize(b, 1, 1)), ['O']);
});

test('place centres a pattern and clears the rest', () => {
  const w = place(set(createWorld(5, 5), 0, 0, 1), PATTERNS.glider.cells);
  assert.equal(population(w), 5);
  assert.equal(get(w, 0, 0), 0);
  assert.equal(get(w, 2, 1), 1);
});

test('randomize respects density with an injected rng', () => {
  assert.equal(population(randomize(createWorld(4, 4), 0.5, () => 0.9)), 0);
  assert.equal(population(randomize(createWorld(4, 4), 0.5, () => 0.1)), 16);
});

test('every built-in pattern is well formed', () => {
  for (const [id, p] of Object.entries(PATTERNS)) {
    assert.ok(
      p.cells.every((r) => /^[.O]+$/.test(r)),
      id,
    );
    assert.ok(population(place(createWorld(40, 30), p.cells)) > 0, id);
  }
});

test('Gosper gun emits a glider: population grows after 30 generations', () => {
  let w = place(createWorld(50, 30), PATTERNS.gun.cells);
  const start = population(w);
  for (let i = 0; i < 30; i++) w = step(w);
  assert.ok(population(w) > start);
});
