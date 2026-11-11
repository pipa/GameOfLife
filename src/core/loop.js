// @ts-check
/**
 * Fixed-step accumulator. Pure: give it elapsed time, it tells you how many
 * simulation steps to run, so game speed does not depend on frame rate.
 */

/**
 * @param {number} accumulator Leftover ms from previous frames.
 * @param {number} elapsed Ms since the last frame.
 * @param {number} stepMs Ms per simulation step.
 * @param {number} [maxSteps] Cap to avoid a spiral after a long tab switch.
 * @returns {{ steps: number, accumulator: number }}
 */
export function advance(accumulator, elapsed, stepMs, maxSteps = 5) {
  let acc = accumulator + Math.max(0, elapsed);
  let steps = 0;
  while (acc >= stepMs && steps < maxSteps) {
    acc -= stepMs;
    steps++;
  }
  if (steps === maxSteps) acc = Math.min(acc, stepMs);
  return { steps, accumulator: acc };
}

/**
 * Starts a requestAnimationFrame loop.
 * @param {(now: number, elapsed: number) => void} frame
 * @returns {() => void} stop
 */
export function runLoop(frame) {
  let last = performance.now();
  let id = 0;
  /** @param {number} now */
  const tick = (now) => {
    const elapsed = Math.min(now - last, 250);
    last = now;
    frame(now, elapsed);
    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}
