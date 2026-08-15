# Debug Skill

Use this guide to diagnose gameplay, state, performance, input, and rendering problems systematically.

## Debugging Workflow

1. Reproduce the issue with exact steps.
2. Record expected and actual behavior.
3. Check the browser console for the first error, not only later symptoms.
4. Narrow the problem to input, state update, collision/rules, rendering, audio, or lifecycle.
5. Create the smallest reliable reproduction or temporary diagnostic display.
6. Fix the cause and remove temporary logging.
7. Retest the original case, nearby edge cases, and restart behavior.

## Common Checks

### Game Loop

- Confirm there is only one active `requestAnimationFrame` chain.
- Calculate delta time from animation timestamps and clamp long gaps.
- Stop or gate updates while paused or after the run ends.
- Keep rendering possible when a paused screen must remain visible.

### Input

- Track keydown and keyup independently for held controls.
- Clear held input on blur, pause, restart, and visibility changes.
- Ignore key repeat for one-shot actions where necessary.
- Convert pointer coordinates into game-space coordinates correctly after scaling.

### State and Restart

- Reset arrays, timers, counters, random seeds if used, and transient effects.
- Do not retain stale entity references after removal.
- Make state transitions explicit and reject invalid transitions.
- Confirm event listeners are registered once.

### Collision and Physics

- Draw temporary hitboxes when collision behavior is unclear.
- Keep coordinate origins and units consistent.
- Account for fast objects that can cross a target between frames.
- Resolve collisions in a stable order and avoid applying the same hit twice.

### Performance

- Profile before optimizing.
- Look for unbounded entity or particle collections.
- Avoid per-frame DOM layout reads and unnecessary object creation.
- Reuse sprites, sounds, gradients, and other expensive resources.

## Regression Checklist

- Fresh load
- Start with every supported input method
- Pause and resume
- Browser tab switch and return
- Resize or rotate the viewport
- Win or lose
- Restart repeatedly
- Mute and unmute
- Reload with saved settings or high score
- Run with the console open and confirm there are no uncaught errors
