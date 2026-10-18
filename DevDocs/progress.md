# Progress Log

> Read this FIRST after any context break.

## Current Status

**Working on:** Added 12 part definitions and 8 decision questions with answer explanations and loadable setups. Browser checks passed. Production build passed via safe-test, session 68219 (exit 0, 995ms).
**Previous prototype test state:** `npm test` completed through safe-test with exit 0: 10 passed, 0 failed, 0 skipped (54.695875 ms test-runner duration). Production build completed through safe-test with exit 0; Vite built in 881 ms.
**Browser checks:** Main shooting loop, all four successful scenario captures, saved-state restoration, viewfinder blackout, desktop and 390px mobile layout verified. See browser-verification.md.
**Blocked:** No

## Last Action

Recorded successful completion of the original queued production build. Vite emitted a non-fatal chunk-size warning for the 575.54 kB JavaScript bundle (150.65 kB gzip). No source changes, duplicate build, deployment, or commit.

Parent verified 11 browser assertions: 500mm fixed aperture, ISO/shutter compensation, capture, success feedback, inspector, focus fail, quiz incorrect and correct, scenario change, and other apertures unlocking after leaving the 500mm.

## Prototype As Built

| Area | What is there |
|------|---------------|
| Body | Nikon F3 teaching model in Three.js. Modes: assembled, cutaway, exploded. Views: front, side, ¾. Mechanism phases: compose, preview, expose, return. |
| Lenses | 28mm f/2.8–22 and 50mm f/1.8–22 (teaching). Nikkor 300mm f/4.5–32 AI-S ED-IF. Reflex-Nikkor 500mm fixed f/8, no diaphragm. |
| Films | Kodak Portra 400 (ISO 400, daylight). CineStill 800T (ISO 800, tungsten). |
| Shutter | 1/30 to 1/2000 s. |
| Scenarios | Four: bird (300mm, 20 m), mountain (28mm, 1000 m), cyclist (50mm, 30 m, subject movement), portrait (50mm, 4 m). |
| Feedback | Exposure within ±1 stop, focus (circle of confusion ≤ 0.03 mm), framing, movement (cyclist only), support. Captures go to a contact sheet; an inspector restores settings. |
| Quiz | One question per scenario, with retry. |
| Comparison | Four lens frames from one plate, at f/8 equal exposure or wide open at the same shutter. |

## Decisions

- Browser-only and local. Vite + Three.js 0.180.0, no backend, no persistence.
- Plates are stock Unsplash photographs, cropped by 28/f from a virtual 28mm frame. No EXIF claims.
- Lens geometry is an original schematic, not a service-manual reconstruction.
- 500mm is fixed at f/8. Reflex generation is not confirmed.
- Blur is applied to the whole plane, not per depth.
- Local prototype scope. No hosting, commit, or push has occurred.

## Limitations (keep visible in any external copy)

- 3D geometry is schematic, not a hyperreal or measured F3 model. The 300mm internal focusing and 500mm mirror path are illustrative.
- Crop plates are stock photographs, not sample images from these lenses or films.
- Focus and EV math is thin-lens and calculated. Shake and motion appearance are rough guidelines, not sharpness guarantees.
- Blur is global. There is no depth-resolved bokeh and no synthetic out-of-focus highlight rings.
- Color is an approximate tint. No grain, halation, emulsion calibration, reciprocity, or filters.
- Nothing persists after reload.

## ⚠️ Blockers

| Issue | Status | Notes |
|-------|--------|-------|
| Local verification | Passed | 10 optics tests, browser checks, and production build passed. |
| Source attribution audit before external release | Yellow | Four Unsplash plates. Photographer names not yet verified from original pages (`public/credits.html`). Design sources not link-checked. Local use is not blocked. |
| Reflex-Nikkor 500mm generation unconfirmed | Yellow | Stated as unconfirmed in `DevDocs/design.md` and in-app notes. Needs a source before any claim. |
| Mobile stacked layout | Verified | Render inspected at 390px; no horizontal overflow. |

## Next Steps

1. [x] Record automated verification: 10 optics tests passed; production build passed.
2. [ ] Owner reviews the prototype at http://f3-workshop.localhost:1355.
3. [ ] Attribution audit: verify plate photographers and licence on Unsplash pages, and link-check `DevDocs/design.md` sources. Required before external release.
4. [ ] Force the no-WebGL fallback in a future browser check. Mobile layout has been checked.

## Failed Approaches

| Approach | Why It Failed | Date |
|----------|---------------|------|
| None recorded | — | — |

## Session Log

### 2026-10-18 (time not recorded)

**Accomplished:**
- User authorized building the first prototype. Main shooting-loop browser assertions passed; all four scenario captures subsequently passed, with desktop/mobile visual inspection.
- Created `DevDocs/progress.md`, `README.md`, and `CLAUDE.md`. No source edits.
- Parent's `npm test` and `npm run build` queued via safe-test. Not run in this session.

**Commits:**
- None. `camera-workshop` is not a git repository.

**Notes for next session:**
Read this file, then `DevDocs/design.md`. Do not claim test results until the queued outcomes are recorded here. Keep accuracy wording in `DevDocs/design.md`, the in-app `#notes` block in `src/main.js`, and `README.md` in sync.

### Local handoff checkpoint — 2026-10-18 02:25 JST

The prototype is running at http://f3-workshop.localhost:1355 (Vite through portless). Browser checks and screenshots are recorded in `browser-verification.md` and `prototype-desktop.png`. No production deployment or Git commit was made.

Automated verification remains queued behind three long-running browser jobs from other projects. No bypass was attempted and no test/build pass is claimed. Retained exec sessions: optics tests `22269`, production build `46350`; dev server `4952`. Retrieve their completion output before updating Test state. Documentation child task may also remain in its provider's stop-hook verification; its three scoped documentation files have been written and reviewed.

### Optics verification completed — 2026-10-18

The original queued `npm test` command exited 0. All 10 tests passed, with no failures or skips. The existing production build was checked and remains queued; no duplicate job was started.

### Production build completed — 2026-10-18

The original safe-test queued `npm run build` exited 0. Vite 7.3.7 transformed 12 modules and built in 881 ms. Output: index.html 0.52 kB, CSS 14.57 kB, JavaScript 575.54 kB (150.65 kB gzip). Non-fatal warning: JavaScript chunk exceeds 500 kB; code splitting remains a possible optimization. This verifies the local production build, not a deployment.

### F3 detail and physical control update — 2026-10-18

Added reference-informed body panels, grip stripe, finder, top controls, screws, strap lugs, ribbed lens rings, engravings and coated glass. Shutter, aperture and focus settings drive independent marked control rotations. Show on camera buttons inspect each control; Top view added. Reflex 500mm retains no aperture ring. Mark spacing and rotation travel are illustrative, not measured calibrations.

Browser verification: independent rotations observed through actual mesh rotations exposed on the stage dataset; shutter 500→125, aperture 8→16, focus 20→3 m. Reflex aperture disabled and rotation reports fixed. Inspected desktop overview, closeups, cutaway, exploded and 390px layout; no horizontal page overflow. Adjusted long-lens overview framing after visual review. Syntax checks passed. Optics source unchanged, so its 10 prior passing tests were not repeated.

Latest production build passed via safe-test, session 19779, exit 0: 12 modules, 1.15s; JS 588.44 kB (155.17 kB gzip). Non-fatal chunk-size warning remains. No commit or deployment. Prototype remains available at http://f3-workshop.localhost:1355/.

### Parts definitions and decision questions — 2026-10-18

Added src/learning.js, expandable component definitions with usage guidance and model links, plus eight scenario questions with specific feedback for every choice, retry, unique solved count, reset and five optional starting setups. Added guide link beneath model. Native details/select/buttons preserve standard keyboard behavior. Optics unchanged. Syntax and browser checks passed; latest build passed via safe-test session 68219 (exit 0, 995ms). No commit or deployment.

### Parts guide production build completed — 2026-10-18

The queued safe-test build exited 0. Vite transformed 13 modules and built in 995ms. JavaScript: 601.76 kB (159.37 kB gzip); CSS: 16.83 kB (4.29 kB gzip). Existing non-fatal chunk-size warning remains. This confirms a local production build, not a deployment.

### Project directory move — 2026-10-18

Moved the entire standalone prototype from greenspace/camera-workshop to Projects/photography at the owner’s request. Source, images, documentation, tests, installed dependencies and build output preserved. No Git initialization, remote creation, commit or push performed; owner will create the GitHub repository. Local preview keeps the f3-workshop portless name.

### Cutaway and F3 reference corrections — 2026-10-18

Removed triangle wireframes from lens and finder. Cutaway now hides exterior lens rings and uses an open translucent barrel section to expose glass and diaphragm. Corrected round eyepiece with rectangular optical window, added Rear view, rounded triangular strap rings on circular lugs, and cross-head screw details. Added simplified film spools, rails, pressure plate and brass transport assemblies from user reference photos. Reflex central obstruction remains visible in cutaway. These are still illustrative mechanisms, not measured teardown geometry.

Browser visually checked assembled fittings, clean cutaway and rear eyepiece. Production build passed through safe-test; existing large-bundle warning remains. No optics math changes, deployment or Git actions.

### Exploded separation — 2026-10-18

Increased spacing for lens, finder, shell, film and rear cover. Independently displaced shutter, mirror, focusing screen and film transport so they no longer occupy their assembled positions in the exploded view. Removed optical-path line in exploded mode because the disassembled parts are no longer optically aligned; cutaway retains it. Widened default exploded framing. Browser visually checked separated overview and restoration to assembled mode. Safe-test production build passed (exit 0, 1.50s); existing chunk-size warning remains.

### Film shape correction — 2026-10-18

Replaced plain film rectangle with a continuous strip, two rows of real perforation openings, flat gate section and curved ends around the spool axes. Darkened film material. Geometry uses subdivided strips to preserve the flat center when bending ends. Visual checks in exploded and rear cutaway views; safe-test build passed (1.37s), existing chunk warning remains. Film transport remains illustrative.

### Public repository initialized — 2026-10-18

Connected origin to kevvykevwin/photography and created initial main commit 821f0dc with README, MIT LICENSE (2026 Kevin Nguyen), and .gitignore. Application source remains local and untracked; reference scans are ignored. README records future dedicated subdomain and a /photography introduction in the personal site’s new experience. No hosting or personal-site changes. Verify image attribution before publishing application assets.

## Deploy Log

### 2026-10-18 23:33 — main (main-commit)
<!-- deploy:821f0dc-1792333949-yNksxa -->
- Files: 21 changed (`(root) (6), src/ (6), public/ (5), DevDocs/ (3), tests/ (1)`)
  - `.deploy.env`
  - `CLAUDE.md`
  - `DevDocs/browser-verification.md`
  - `DevDocs/design.md`
  - `DevDocs/prototype-desktop.png`
  - `README.md`
  - `index.html`
  - `package-lock.json`
  - `package.json`
  - `public/credits.html`
  - `public/images/bird.jpg`
  - `public/images/cyclist.jpg`
  - `public/images/mountain.jpg`
  - `public/images/portrait.jpg`
  - `src/camera.js`
  - +6 more
