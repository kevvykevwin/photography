# photography

Browser teaching prototype for a Nikon F3, its lenses, and film. Native Three.js + Vite. Git repository: kevvykevwin/photography.

## Recovery

After compaction or session start:

```
cat DevDocs/progress.md
cat DevDocs/design.md
```

Run `git status --short` before editing. Application source is included in this repository. Local reference scans are ignored. Treat the Test state in `DevDocs/progress.md` as pending until its recorded outcome matches a real run.

## Commands

- Install: `npm install` (npm, `package-lock.json`)
- Dev: `npm run dev` serves at http://f3-workshop.localhost:1355 through portless. Fallback: `npm run dev:raw`
- Test: `~/.claude/hooks/safe-test --workers 1 --timeout 300 -- npm test`
- Build: `~/.claude/hooks/safe-test --workers 1 --timeout 300 -- npm run build`

Run tests and builds only through `safe-test`. This project uses `node --test`, not Vitest, but the queue rule covers any test or build run. The worker claims are judgement calls for single-process runs; adjust if the queue shows different load.

## Testing

- `node:test` in `tests/*.test.mjs`. Only `src/optics.js` is unit-tested. `camera.js`, `photo.js`, and `main.js` depend on WebGL, canvas, and the DOM, and are covered only by browser checks.
- Put new logic in pure functions in `optics.js` so it can be tested without mocks.
- Every test name states the bug it catches.

## Structure

See `README.md` for the file layout. Two points matter when editing:

- `src/optics.js` is the only source of exposure, focus, and field-of-view math. Do not duplicate formulas in the UI.
- `src/main.js` holds the UI markup as one template string. Text changes go there.

## Conventions

- Accuracy wording must match across three places: `DevDocs/design.md` ("Accuracy boundaries"), the in-app `#notes` block in `src/main.js`, and `README.md`. Change them together.
- Do not present stock plates as samples from these lenses or films. Do not add EXIF or focal-length claims for them.
- Do not add synthetic bokeh rings, grain, or film calibration unless the model actually computes them. The copy must describe only what the code does.
- Keep the Reflex-Nikkor 500mm generation marked as unconfirmed until a source supports it.
- No hosting, commit, push, or sharing without Kevin's explicit instruction.
- Before any external release, complete the attribution audit for `public/credits.html`.
- No machine-specific paths (for example `/Users/...`) in config or source.
- Update `DevDocs/progress.md` at milestones and session end. Record test outcomes only from actual runs.
