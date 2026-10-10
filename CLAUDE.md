# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Nomad is a Tauri v2 desktop focus/break timer (React 19 + TypeScript + Vite + Tailwind v4 frontend, Rust backend). v1 scope is frozen in `PLAN.md`: configurable work/break durations, native notifications on phase transitions, and timer state in the system tray. No cloud, accounts, analytics, or mobile. Use https://tauri.app/ as the reference for any Tauri API questions.

## Commands

```bash
npm install
npm run tauri dev      # full app (Vite on strict port 1420 + Rust build); this is the normal dev loop
npm run tauri build    # production bundles via src-tauri
npm run build          # tsc type-check + vite build (frontend only)
npm run lint           # eslint .   (npm run lint:fix to autofix)
npm run format:check   # prettier   (npm run format to write)
cd src-tauri && cargo check   # fast Rust-only compile check
```

- `npm run dev` alone serves the frontend in a browser, but every `invoke`/plugin call fails outside the Tauri webview, so it is only useful for pure layout work.
- There is no test runner configured. `tsc` (via `npm run build`) and `eslint` are the only automated checks.
- Linux builds link against the system `libnotify` (Rust crate `libnotify`), so the dev library must be installed.

## Architecture

The frontend is split into a pure core, a single Zustand store, side-effecting hooks, and thin service wrappers around Tauri. The Rust side owns the tray and Linux notifications.

**Timer core (`src/core/timer/`)** – `transitionTimerState(state, event, durations)` is a pure reducer with no side effects. Phases are `idle | work | break | paused`; `activeSession` remembers which session a pause came from. A `TICK` that reaches zero immediately flips to the opposite session (work→break→work) and reloads the duration. Durations are stored as a number plus a unit (`minutes | hours`); the reducer converts hours by multiplying by 60. Keep this module free of React/Tauri imports.

**Store (`src/stores/timerStore.ts`)** – one Zustand store (`useTimerStore`, devtools-wrapped) holding timer state, the persisted `AppSettings`, and settings load/save flags. `transition(event)` runs the reducer against the settings currently in the store, so settings must be loaded before the timer reads them.

**Hooks (`src/hooks/`)** – all side effects live here, not in components:

- `useTimer` runs the 1s `TICK` interval while in work/break, fires notifications when the phase crosses work↔break (tracked with a previous-phase ref), pushes every state change to the tray, and listens for the `tray-action` Tauri event to drive `start | pause | resume | reset` from the tray menu.
- `useSettings` loads settings from disk on mount and exposes `saveSettings`. Each page that calls it triggers a load.

**Services (`src/services/`)** – each exports an interface plus a `Tauri*` implementation:

- `settings/settingsStore.ts` persists `AppSettings` to `settings.json` via `@tauri-apps/plugin-store` and validates the shape on read (falls back to `defaultSettings`).
- `notifications/notificationService.ts` branches on platform: Linux calls the Rust `notify` command (libnotify); everything else uses `@tauri-apps/plugin-notification` with a permission check.
- `tray/trayService.ts` wraps the Rust `update_tray_snapshot` command with a `TraySnapshot` of `status` and `remainingSeconds`. Tray failures are logged and swallowed so they never interrupt the timer.

**Rust (`src-tauri/src/lib.rs`)** – builds the tray icon with a menu (Open / Start / Pause / Resume / Reset / Quit). Menu clicks for timer actions are forwarded to the frontend as a `tray-action` event carrying the menu id; the tooltip is updated by the `update_tray_snapshot` command. Closing the window is intercepted and hides it instead; the app only exits via the tray Quit item. New commands must be added to `generate_handler!`.

**Adding a Tauri plugin** touches four places: `src-tauri/Cargo.toml`, the `.plugin(...)` chain in `lib.rs`, a permission in `src-tauri/capabilities/default.json`, and the npm package in `package.json`.

**UI** – `react-router` with routes `/` (HomePage: timer + inline minute-only settings), `/settings` (SettingsPage: durations with unit selectors), `/story`. Shared primitives are in `src/components/ui/` and re-exported from its `index.ts`. Duration bounds (1–240) are defined as constants in both pages. Colors come from Tailwind v4 `@theme` tokens in `src/styles.css` and are used as `bg-nomad-surface`, `text-nomad-text-muted`, etc.; `src/config/theme.ts` mirrors the same tokens for non-class usage.
