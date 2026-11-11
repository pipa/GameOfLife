// @ts-check
/**
 * Pure Game of Life rules on a flat Uint8Array grid (1 = alive, 0 = dead).
 * No DOM, no timers, so everything here is unit tested in Node.
 */

/**
 * @typedef {object} World
 * @property {number} cols
 * @property {number} rows
 * @property {Uint8Array} cells Row-major, length cols * rows.
 */

/** @param {number} cols @param {number} rows @returns {World} */
export function createWorld(cols, rows) {
  return { cols, rows, cells: new Uint8Array(cols * rows) };
}

/** @param {World} w @param {number} x @param {number} y */
export function get(w, x, y) {
  return w.cells[y * w.cols + x];
}

/**
 * Returns a new world with one cell set.
 * @param {World} w @param {number} x @param {number} y @param {0 | 1} value
 * @returns {World}
 */
export function set(w, x, y, value) {
  if (x < 0 || y < 0 || x >= w.cols || y >= w.rows) return w;
  const cells = w.cells.slice();
  cells[y * w.cols + x] = value;
  return { ...w, cells };
}

/**
 * Counts live neighbours of (x, y).
 * @param {World} w @param {number} x @param {number} y @param {boolean} wrap
 */
export function neighbours(w, x, y, wrap) {
  const { cols, rows, cells } = w;
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      let nx = x + dx;
      let ny = y + dy;
      if (wrap) {
        nx = (nx + cols) % cols;
        ny = (ny + rows) % rows;
      } else if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) {
        continue;
      }
      n += cells[ny * cols + nx];
    }
  }
  return n;
}

/**
 * B3/S23: a dead cell with 3 neighbours is born, a live cell with 2 or 3 survives.
 * @param {0 | 1 | number} alive @param {number} n @returns {0 | 1}
 */
export function rule(alive, n) {
  return n === 3 || (alive === 1 && n === 2) ? 1 : 0;
}

/**
 * Advances one generation.
 * @param {World} w @param {boolean} [wrap]
 * @returns {World}
 */
export function step(w, wrap = false) {
  const next = new Uint8Array(w.cells.length);
  for (let y = 0; y < w.rows; y++) {
    for (let x = 0; x < w.cols; x++) {
      const i = y * w.cols + x;
      next[i] = rule(w.cells[i], neighbours(w, x, y, wrap));
    }
  }
  return { ...w, cells: next };
}

/** @param {World} w */
export function population(w) {
  let n = 0;
  for (const c of w.cells) n += c;
  return n;
}

/**
 * Copies a world into a new size, keeping it centred.
 * @param {World} w @param {number} cols @param {number} rows @returns {World}
 */
export function resize(w, cols, rows) {
  const out = createWorld(cols, rows);
  const ox = Math.floor((cols - w.cols) / 2);
  const oy = Math.floor((rows - w.rows) / 2);
  for (let y = 0; y < w.rows; y++) {
    for (let x = 0; x < w.cols; x++) {
      const nx = x + ox;
      const ny = y + oy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) out.cells[ny * cols + nx] = w.cells[y * w.cols + x];
    }
  }
  return out;
}

/**
 * Fills with random cells.
 * @param {World} w @param {number} [density] @param {() => number} [rng] @returns {World}
 */
export function randomize(w, density = 0.25, rng = Math.random) {
  const cells = new Uint8Array(w.cells.length);
  for (let i = 0; i < cells.length; i++) cells[i] = rng() < density ? 1 : 0;
  return { ...w, cells };
}

/**
 * Stamps a pattern (rows of '.' and 'O') centred on the world, replacing its contents.
 * @param {World} w @param {readonly string[]} pattern @returns {World}
 */
export function place(w, pattern) {
  const out = createWorld(w.cols, w.rows);
  const ph = pattern.length;
  const pw = Math.max(...pattern.map((r) => r.length));
  const ox = Math.floor((w.cols - pw) / 2);
  const oy = Math.floor((w.rows - ph) / 2);
  pattern.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const nx = x + ox;
      const ny = y + oy;
      if (ch === 'O' && nx >= 0 && ny >= 0 && nx < w.cols && ny < w.rows) out.cells[ny * w.cols + nx] = 1;
    });
  });
  return out;
}
