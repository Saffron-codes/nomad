# Nomad

Nomad is a desktop focus/break assistant that runs work and break cycles with native notifications and system tray presence.

## v1 Scope

- Configure work duration and break duration.
- Notify when it is time to take a break.
- Notify when it is time to return to work.
- Show active timer state in the system tray.

Detailed phase plan is tracked in `PLAN.md`.

## Tech Stack

- Tauri v2
- React + TypeScript + Vite
- Tailwind CSS v4
- ESLint + Prettier

## Development

- `npm install`
- `npm run tauri dev`
- `npm run tauri build`
- `npm run lint`
- `npm run format:check`

## Phase 2 Architecture Scaffold

- `src/core/timer`: timer state types and transition function.
- `src/services/settings`: local settings persistence abstraction.
- `src/services/notifications`: notification service abstraction.
- `src/services/tray`: tray service abstraction (native wiring in later phase).
- `src/config/theme.ts`: central theme tokens shared by UI.
