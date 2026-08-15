# Game Project Context

This file is the living source of truth for decisions that affect the whole game. Replace the placeholders as the concept becomes clear.

## Product

- **Working title:** Orbit Breaker
- **Genre:** Neon arcade survival
- **One-sentence pitch:** Dodge tracking shards, collect volatile cores, and release a charged shockwave before the orbit closes in.
- **Target players:** Casual browser-game players
- **Target session length:** 3–10 minutes
- **Primary platform:** Modern desktop browsers
- **Secondary platform:** Mobile browsers, when touch controls are included

## Technical Baseline

- **Runtime:** Browser
- **Stack:** HTML, CSS, and vanilla JavaScript
- **Rendering:** Choose DOM, Canvas 2D, or WebGL based on the game; prefer Canvas 2D for real-time 2D play
- **Persistence:** `localStorage` only for non-sensitive settings and high scores
- **Core offline behavior:** The game must remain playable without a backend
- **Browser target:** Current versions of Chrome, Edge, Firefox, and Safari

## Experience Goals

- The objective should be clear within the first few seconds.
- Input should feel immediate and predictable.
- Failure should feel fair and teach the player what to try next.
- Each important action should have visible feedback.
- Restarting should take one clear action and no page reload.

## Current Decisions

Record confirmed choices here so future work does not reopen them accidentally.

| Decision | Choice | Reason |
| --- | --- | --- |
| Language | JavaScript | Runs directly in browsers |
| Dependencies | None initially | Keep setup and delivery simple |
| Art during prototype | Original procedural shapes | Fast, consistent, and license-safe |
| Interface language | Persian (RTL) | Match the intended audience |

## Open Questions

- **Core action:** Continuous movement, dodging, collecting, and timing a pulse.
- **Escalation:** Shards spawn faster and move faster as survival time increases.
- **End condition:** A run ends after three shard collisions; score and rank measure success.
- **Inputs:** WASD, arrow keys, pointer/touch drag, Space, and on-screen controls.
- **Sound:** Lightweight synthesized feedback with a visible mute toggle.
- **Accessibility:** High contrast, redundant shape/color signals, keyboard focus, and reduced-motion support.
