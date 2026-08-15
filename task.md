# Game Implementation Task

## Objective

Build a complete, polished JavaScript browser game. Before implementation, replace the placeholders below with the chosen concept and measurable requirements.

## Game Brief

- **Player fantasy:** Pilot the last signal craft through a collapsing neon arena.
- **Core action:** Dodge shards, collect energy cores, and time an area-clearing pulse.
- **Objective:** Survive, destroy swarms efficiently, and earn the highest rank possible.
- **Primary obstacle:** Increasingly fast tracking shards arriving from every edge.
- **Win condition:** The game is score-driven; reaching higher named ranks is the mastery goal.
- **Loss condition:** The run ends after the player loses all three shields.
- **Controls:** WASD/arrows or pointer drag; Space or Pulse button; P/Escape to pause.

## Required Player Flow

1. The page opens to a clear title or start state.
2. The player can see the objective and controls.
3. Starting the game initializes a fresh run.
4. Gameplay becomes progressively challenging or meaningfully varied.
5. The game reaches an unmistakable victory or game-over state.
6. The result shows useful run information such as score or time.
7. The player can restart without reloading the page.

## Minimum Features

- Responsive game area
- Keyboard controls
- Touch or pointer controls if mobile play is in scope
- Score, progress, or survival-time display
- Start and restart controls
- Pause/resume behavior if real-time play can be interrupted
- Clear hit, success, damage, and end-state feedback
- Best score saved locally when scoring is used
- Mute control when audio is used

## Deliverables

- Game source files
- A short `README.md` with launch instructions and controls
- Any original local assets required by the game
- Updated project context for decisions made during implementation

## Acceptance Criteria

- The game can be launched using the documented local command.
- The complete player flow works without uncaught console errors.
- Input remains responsive during normal play.
- The game does not run faster or slower because of display refresh rate.
- Restart fully resets entities, timers, score, input, and end-state flags.
- Text and controls remain readable at 360 px viewport width.
- All third-party assets, if any, have documented licenses and attribution.

## Out of Scope Until Added Here

- Online multiplayer
- User accounts
- Server-side leaderboards
- Purchases or advertising
- Large frameworks or game engines
