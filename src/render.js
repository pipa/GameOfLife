// @ts-check
/** Canvas renderer. Reads the world, never changes it. Keeps a fading trail of recent deaths. */

/** @typedef {import('./core/life.js').World} World */

/** @param {HTMLCanvasElement} canvas */
export function createRenderer(canvas) {
  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  let cell = 12;
  /** Per-cell glow, 1 while alive, decays after death. */
  let heat = new Float32Array(0);

  /**
   * Sizes the canvas to fit inside a box, at device pixel ratio, with whole-pixel cells.
   * @param {number} cols @param {number} rows @param {{ width: number, height: number }} box
   */
  function resize(cols, rows, box) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cell = Math.max(2, Math.floor(Math.min(box.width / cols, box.height / rows) * dpr));
    canvas.width = cell * cols;
    canvas.height = cell * rows;
    canvas.style.width = `${canvas.width / dpr}px`;
    canvas.style.height = `${canvas.height / dpr}px`;
    heat = new Float32Array(cols * rows);
  }

  /** CSS pixels per cell, for pointer hit testing. */
  function cssCell() {
    return canvas.getBoundingClientRect().width / (canvas.width / cell);
  }

  /**
   * @param {World} w
   * @param {{ elapsed: number, trails: boolean, cursor: { x: number, y: number } | null }} f
   */
  function draw(w, { elapsed, trails, cursor }) {
    if (heat.length !== w.cells.length) heat = new Float32Array(w.cells.length);
    const decay = trails ? Math.exp(-elapsed / 220) : 0;
    ctx.fillStyle = 'rgba(6, 8, 28, 0.78)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (cell >= 6) {
      ctx.strokeStyle = 'rgba(120, 140, 255, 0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 1; x < w.cols; x++) {
        ctx.moveTo(x * cell + 0.5, 0);
        ctx.lineTo(x * cell + 0.5, canvas.height);
      }
      for (let y = 1; y < w.rows; y++) {
        ctx.moveTo(0, y * cell + 0.5);
        ctx.lineTo(canvas.width, y * cell + 0.5);
      }
      ctx.stroke();
    }

    const pad = cell >= 6 ? Math.max(1, cell * 0.1) : 0;
    const size = cell - pad * 2;
    const r = cell >= 6 ? cell * 0.25 : 0;

    // Fading trail (dead cells that were recently alive).
    ctx.fillStyle = '#7b5cff';
    for (let i = 0; i < w.cells.length; i++) {
      if (w.cells[i]) {
        heat[i] = 1;
        continue;
      }
      const h = (heat[i] *= decay);
      if (h < 0.04) continue;
      ctx.globalAlpha = h * 0.45;
      const x = i % w.cols;
      const y = (i / w.cols) | 0;
      ctx.fillRect(x * cell + pad, y * cell + pad, size, size);
    }
    ctx.globalAlpha = 1;

    // Live cells, one path for speed, with a glow.
    ctx.save();
    ctx.shadowColor = 'rgba(64, 232, 255, 0.8)';
    ctx.shadowBlur = cell * 0.7;
    ctx.fillStyle = '#6ff3ff';
    ctx.beginPath();
    for (let i = 0; i < w.cells.length; i++) {
      if (!w.cells[i]) continue;
      const x = i % w.cols;
      const y = (i / w.cols) | 0;
      if (r) ctx.roundRect(x * cell + pad, y * cell + pad, size, size, r);
      else ctx.rect(x * cell, y * cell, cell, cell);
    }
    ctx.fill();
    ctx.restore();

    if (cursor) {
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = Math.max(2, cell * 0.12);
      ctx.strokeRect(cursor.x * cell + 1, cursor.y * cell + 1, cell - 2, cell - 2);
    }
  }

  return { resize, draw, cssCell };
}
