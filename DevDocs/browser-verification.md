# Browser verification — 2026-10-18

Tested against the running local Vite application through T3 collaborative browser tools.

- Fresh navigation successfully loads the app and all four local photographic plates.
- Actual WebGL camera render inspected in assembled and exploded modes.
- Desktop 1280px and mobile 390px renders inspected. At 390px, document scroll width equals viewport width; no descendant overflow detected.
- Selecting 500mm disables the aperture control and sets f/8.
- Switching Portra 400 to CineStill 800T adds exactly +1.0 stop to the meter; 1/500 to 1/1000 returns it to balanced.
- Capturing creates a contact-sheet frame and opens a result inspector.
- Correct exposure/focus/framing passes the bird exercise.
- Focus at 3m for the bird at virtual 20m fails with explicit focus feedback.
- Wrong quiz answer requests retry; correct answer gives causal explanation.
- Scenario changes update names, quiz, target distance and goals.
- Leaving 500mm re-enables variable aperture.
- All four scenarios passed end-to-end capture with the documented setups in optics.test.mjs.
- Four comparison canvases exist and render in every scenario. Comparison screenshot inspected.
- Restoring a captured frame restores scenario and aperture; full state assignment inspected in source.
- Optical finder blacks out during exposure; canvas pixel and image-change checks passed.
- JS syntax checks pass for all four source modules.
- npm install after Vite update reported zero dependency vulnerabilities.

## Limits

No automated pixel-diff baseline, no calibrated camera/film validation, no true touchscreen hardware test, and no forced no-WebGL browser test. Chrome reports GPU readback performance warnings during screenshot capture; no application error appeared in the successfully loaded view. A missing array bracket in the initial draft was corrected before this verification; stale dev module parsing was cleared via the entry script revision.

## F3 controls update — 2026-10-18

Verified desktop 1280×800 and mobile 390×844 with the T3 collaborative browser. New control closeups display highlighted rings/dial and current setting. Actual mesh rotation observations: shutter -0.992082→-1.653470 for 500→125; aperture 0.427282→1.067282 for f/8→16; focus -0.444660→-1.492944 for 20→3m. Other rotations stayed unchanged in each check. Reflex reports apertureRotation=fixed, disabled aperture select, and no aperture-ring callout. 300mm focus closeup, cutaway and exploded modes visually inspected. Mobile document scrollWidth=390, innerWidth=390.

## Parts and decision practice — 2026-10-18

Verified 12 definitions and 8 selectable questions. Wrong answer gives specific feedback without credit; all eight correct choices reach 8/8; repeating a correct choice does not add credit; reset returns 0/8. Loading cyclist setup sets scenario=cyclist, shutter=125, focus=30 and inspects shutter. Mirror guide opens cutaway/expose. Desktop question layout and mobile expanded definitions visually inspected; mobile width=scrollWidth=390.
