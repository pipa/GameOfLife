# AGENTS.md

Guidance for coding agents working in this repo.

- Plain JavaScript only. No TypeScript sources, no bundler, no framework, no build step. The repo root must stay directly servable as a static site (GitHub Pages).
- Every source file starts with `// @ts-check` and uses JSDoc types; `npm run typecheck` runs `tsc` in strict mode with `noEmit`.
- Keep game rules in `src/core/` pure: no DOM, timers, `Math.random` without injection, or globals. Rendering (`src/render.js`) must not mutate the world.
- Add or update a `node:test` test in `test/` for any rule change.
- Before pushing: `npm run check` must pass (ESLint, Prettier, typecheck, tests). CI runs the same.
- Keep runtime dependencies at zero. Dev dependencies only for tooling.
- Respect `prefers-reduced-motion`, keep visible focus styles and 44px touch targets.
- Work on a branch and open a PR; never push to `master` directly or force-push.
