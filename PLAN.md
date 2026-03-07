# Nomad Plan

## Phase 1 - Product Definition and Scope Lock

### Product statement
Nomad is a desktop app that helps users alternate between focused work and short breaks using a configurable timer cycle.

### v1 goals
1. Users can set a work duration (in minutes).
2. Users can set a break duration (in minutes).
3. The app notifies users when work ends and break should start.
4. The app notifies users when break ends and work should resume.
5. The app shows current timer state in the system tray on supported desktop platforms.

### v1 non-goals
1. No cloud sync or user accounts.
2. No team/shared schedules.
3. No analytics dashboard.
4. No mobile app in v1.

### Locked stack for implementation
1. Desktop runtime: Tauri v2.
2. Frontend: React + TypeScript + Vite.
3. Styling: Tailwind CSS (required by UI guideline).
4. Native/system features: Tauri APIs/plugins for notifications, tray, and local persistence.

### UX direction (v1)
1. Attractive, clean, domain-neutral interface.
2. Theme that works for users across multiple professions.
3. Timer-first layout: current mode, remaining time, start/pause/reset controls.
4. Simple settings for work/break durations.

### Success criteria for Phase 1
1. v1 scope is defined and frozen in this file.
2. Core stack decisions are finalized.
3. Clear boundary exists between v1 and future features.
4. Team can start implementation without additional product clarification.

---

## Phase 2 - Project Setup and Architecture
- Scaffold module structure for timer engine, notifications, tray, and settings persistence.
- Set up Tailwind CSS and base design tokens.
- Prepare linting, formatting, and build conventions.

## Phase 3 - Core Timer Flow
- Implement work/break state machine with start, pause, resume, and reset.
- Build settings UI for durations and persist values locally.
- Render current phase and remaining time in the main app view.

## Phase 4 - Notifications and Tray
- Add native notifications for work->break and break->work transitions.
- Add system tray status and quick actions.
- Keep app running in tray when window is minimized/closed (as configured).

## Phase 5 - Visual Polish and UX Refinement
- Apply final visual theme and spacing/typography consistency.
- Improve accessibility basics (contrast, focus, readable defaults).
- Handle edge states and validation feedback.

## Phase 6 - QA and Release
- Validate behavior on target operating systems.
- Build distributables and smoke test installation and startup flows.
- Publish v1 with brief usage instructions.
