import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advance } from '../src/core/loop.js';

test('accumulates partial frames into whole steps', () => {
  let r = advance(0, 60, 100);
  assert.deepEqual(r, { steps: 0, accumulator: 60 });
  r = advance(r.accumulator, 60, 100);
  assert.deepEqual(r, { steps: 1, accumulator: 20 });
});

test('caps steps after a long stall', () => {
  const r = advance(0, 10_000, 100, 5);
  assert.equal(r.steps, 5);
  assert.ok(r.accumulator <= 100);
});
