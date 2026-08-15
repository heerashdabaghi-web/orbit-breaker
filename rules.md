# Project Rules

## Technology

- Use semantic HTML, CSS, and modern vanilla JavaScript by default.
- Add a framework or package only when it clearly reduces complexity and is approved in `context.md`.
- Keep the game runnable with a simple local development server.
- Do not require accounts, remote services, analytics, or network access for core gameplay.

## Architecture

- Separate game state, update logic, rendering, input, and audio responsibilities.
- Use one authoritative game-state object; do not duplicate mutable state in the DOM.
- Base movement and timers on elapsed time rather than frame count.
- Keep the main loop explicit: input, update, collision/rules, render.
- Use clear names and small functions. Comment decisions and non-obvious math, not self-evident syntax.
- Avoid global variables except for a single deliberate application entry point.

## Gameplay and Input

- Prevent browser scrolling for keys used by the game when the game has focus.
- Support keyboard input and add touch/pointer controls when the game is intended for mobile.
- Show controls before or at the start of play.
- Include clear start, pause when appropriate, game-over or victory, and restart states.
- Never make progress depend on sound, color alone, or extremely precise input.

## Visual and Audio Quality

- Keep a consistent visual style, spacing system, and color palette.
- Make important gameplay objects visually distinct from decoration.
- Provide immediate feedback for hits, pickups, damage, scoring, and state changes.
- Respect `prefers-reduced-motion` where practical.
- Start audio only after user interaction and provide a mute control if audio is used.

## Performance and Reliability

- Use `requestAnimationFrame` for real-time rendering.
- Avoid allocating large objects or querying the DOM repeatedly inside the game loop.
- Clamp unusually large frame deltas after tab switches or pauses.
- Remove or reuse event listeners, timers, particles, and off-screen entities.
- Validate all state transitions and make restart reset the entire run cleanly.

## Safety and Scope

- Do not overwrite unrelated work or generated assets without checking their use.
- Do not add secrets, tokens, tracking code, or unlicensed third-party assets.
- Prefer original shapes, text, and generated placeholder assets until final assets are approved.
- Keep changes focused on the current acceptance criteria in `task.md`.

