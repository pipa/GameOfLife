# Game of Life

Conway's Game of Life in plain, modern JavaScript: ES modules, no framework and no build step.

**Play:** https://pipa.github.io/GameOfLife/

## Using it

- **Draw:** click or drag on the grid (tap and drag on touch). With the grid focused, arrow keys move a cursor and Enter toggles a cell.
- **Run:** Play / Pause, Step one generation, Clear, Random soup.
- **Patterns:** Gosper glider gun, glider, lightweight spaceship, pulsar, pentadecathlon, R-pentomino, acorn.
- **Speed:** 1 to 30 generations per second. **Wrap edges:** the grid becomes a torus.
- Shortcuts: Space play/pause · N step · C clear · R random.

The grid sizes itself to the screen, pauses when the tab is hidden, and respects _Reduce motion_ (no fading trails, slower default speed).

## Run locally

ES modules need to be served over HTTP (browsers block them from `file://`):

```sh
npm start          # serves on http://localhost:5173
# or any static server, e.g. python3 -m http.server
```

## Develop

```sh
npm ci
npm run check      # lint + prettier + JSDoc typecheck + tests
npm test           # node:test, no browser needed
```

## Layout

```
index.html            page shell, stats, intro card, controls
styles.css            layout and theme
src/core/life.js      pure B3/S23 rules on a flat Uint8Array grid
src/core/patterns.js  classic patterns in plaintext format
src/core/loop.js      fixed-step accumulator + rAF loop
src/render.js         canvas drawing with fading trails (reads state only)
src/main.js           wiring: controls, pointer drawing, keyboard
test/                 node:test unit tests for the core
assets/               art (backdrop and icons generated with Grok Imagine)
```

Deploy: the repo root is the site. GitHub Pages serves it as-is.
