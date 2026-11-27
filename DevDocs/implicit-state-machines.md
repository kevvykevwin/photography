# State machines in photography

Reviewed 2026-11-27 in the primary checkout, branch `main`, HEAD `e7885649569844c7c9b90cb1ed9de2e04b44d450`. Describes the working-tree source at review time; local edits may differ from HEAD. These are documentation models, not runtime changes or test results.

## Photo capture and asset readiness

The prototype's `phase`, `busy`, and `photosReady` variables jointly encode capture eligibility.

| From | Trigger/guard | To |
|---|---|---|
| Photos loading | Asset promise resolves | Photos ready; enable shutter |
| Photos loading | Asset promise rejects | Loading error text; reload is the offered retry |
| Ready, not busy | Shutter click | Set busy, disable shutter, snapshot settings and result, append captured frame, phase `expose` |
| Exposing | 180 ms timer | Phase `return`, publish feedback/contact sheet, clear busy and enable shutter |
| Any phase | Scenario or lesson setup selected | Phase `compose` and update settings |
| Any phase | Manual mechanism button | Set selected phase directly |
| Preview/other phase | Depth-of-field toggle | Compose/preview, respectively |

[State](../src/main.js#L7), [capture handler](../src/main.js#L70). The phase buttons permit nonsequential inspection, so the pedagogical compose/preview/expose/return order is not a universally enforced capture sequence. Capture stores a settings copy, keeping prior frames independent from later controls. The shutter handler has no `try/finally`; an exception after setting busy can leave capture disabled. That is an observed recovery gap, not a new behavior added here.

Lesson progress is separate: each answer records a choice; correct answers add the lesson to a solved set; a later wrong answer does not remove it; reset clears both. [Lesson handlers](../src/main.js#L72).

## Review boundary

Coverage is the source-linked lifecycles above. Other modules may contain additional machines; this is not a proof that every possible transition or race has been enumerated. No live services or test suites were run for this documentation review.
