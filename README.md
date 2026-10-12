<p align="center">
  <img src="public/logo.png" alt="Nomad logo" width="96" />
</p>

<h1 align="center">Nomad</h1>

<p align="center">
  Work in focused stretches. Rest on time.<br />
  A small, local-only work/break timer for the desktop.
</p>

---

Nomad is a desktop timer that alternates between work and break sessions. You set how long you want to work and how long to rest, press Start, and get on with your day. It sends a native notification when it is time to step away and again when it is time to come back, and it lives in your system tray so you can control it without opening the window.

There are no accounts, no cloud sync, no analytics and no subscription. Your settings are stored in a single JSON file on your machine.

<p align="center">
  <img src="docs/nomad-demo.gif" alt="Nomad demo: start a work session, change the routine to 25/5, read the about page, and return to the running timer" width="800" />
</p>
<p align="center">
  <sub>20-second demo. <a href="docs/nomad-demo.mp4">Download as MP4</a>.</sub>
</p>

## Features

- **Configurable sessions.** Set work and break durations in minutes or hours (1 to 240).
- **Automatic cycling.** When a work session ends a break starts, and vice versa, until you pause or reset.
- **Native notifications** on every work-to-break and break-to-work transition.
- **System tray presence.** The tray tooltip shows the current phase and remaining time. The tray menu offers Open, Start, Pause, Resume, Stop and reset, and Quit.
- **Stays running when closed.** Closing the window hides it to the tray. The app only exits from the tray's Quit item.
- **Cross-platform.** Built with Tauri v2 for Linux, macOS and Windows.

## Install

Download the installer for your platform from the [latest release](https://github.com/Saffron-codes/nomad/releases/latest).

| Platform              | Download                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Windows (64-bit)      | [Nomad_1.0.0_x64-setup.exe](https://github.com/Saffron-codes/nomad/releases/download/v1.0.0/Nomad_1.0.0_x64-setup.exe)   |
| Windows (MSI)         | [Nomad_1.0.0_x64_en-US.msi](https://github.com/Saffron-codes/nomad/releases/download/v1.0.0/Nomad_1.0.0_x64_en-US.msi)   |
| macOS (Apple Silicon) | [Nomad_1.0.0_aarch64.dmg](https://github.com/Saffron-codes/nomad/releases/download/v1.0.0/Nomad_1.0.0_aarch64.dmg)       |
| macOS (Intel)         | [Nomad_1.0.0_x64.dmg](https://github.com/Saffron-codes/nomad/releases/download/v1.0.0/Nomad_1.0.0_x64.dmg)               |
| Linux (Debian/Ubuntu) | [Nomad_1.0.0_amd64.deb](https://github.com/Saffron-codes/nomad/releases/download/v1.0.0/Nomad_1.0.0_amd64.deb)           |
| Linux (Fedora/RHEL)   | [Nomad-1.0.0-1.x86_64.rpm](https://github.com/Saffron-codes/nomad/releases/download/v1.0.0/Nomad-1.0.0-1.x86_64.rpm)     |
| Linux (AppImage)      | [Nomad_1.0.0_amd64.AppImage](https://github.com/Saffron-codes/nomad/releases/download/v1.0.0/Nomad_1.0.0_amd64.AppImage) |

The macOS builds are not code-signed yet. On first launch, right-click the app and choose Open, or allow it under System Settings > Privacy & Security. Windows SmartScreen may show a similar warning for the unsigned installer.

If you prefer to build it yourself, see [Building from source](#building-from-source).

## Building from source

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer and npm
- The [Rust toolchain](https://rustup.rs/) (stable)
- The platform dependencies listed in the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/)
- On Linux, the `libnotify` development package. The Rust side links against it directly for notifications.

  ```bash
  # Fedora
  sudo dnf install libnotify-devel
  # Debian / Ubuntu
  sudo apt install libnotify-dev
  ```

### Build

```bash
git clone https://github.com/Saffron-codes/nomad.git
cd nomad
npm install
npm run tauri build
```

Bundles are written to `src-tauri/target/release/bundle/`.

On distributions with a recent binutils (Fedora 40+, for example), the AppImage step can fail with `failed to run linuxdeploy` because the `strip` tool bundled inside linuxdeploy does not understand RELR relocations. Disable stripping for that step:

```bash
NO_STRIP=true npm run tauri build
```

## Development

```bash
npm install
npm run tauri dev       # full app: Vite dev server on port 1420 + Rust build
```

Other useful commands:

| Command                       | What it does                                               |
| ----------------------------- | ---------------------------------------------------------- |
| `npm run build`               | Type-check with `tsc` and build the frontend               |
| `npm run lint`                | Run ESLint (`npm run lint:fix` to autofix)                 |
| `npm run format:check`        | Check formatting with Prettier (`npm run format` to write) |
| `cd src-tauri && cargo check` | Fast Rust-only compile check                               |

`npm run dev` on its own serves the frontend in a browser, but every Tauri call fails outside the webview, so it is only useful for pure layout work.

There is no test runner yet. `tsc` and ESLint are the automated checks that must pass before a change is merged.

## How it works

The frontend is split into a pure timer core, a single store, side-effecting hooks and thin wrappers around Tauri APIs. The Rust side owns the tray and Linux notifications.

```
src/
├── core/timer/       Pure state machine: idle | work | break | paused. No React or Tauri imports.
├── stores/           One Zustand store holding timer state and persisted settings.
├── hooks/            All side effects: the 1s tick, notifications, tray updates, tray events.
├── services/         Interfaces + Tauri implementations for settings, notifications and tray.
├── components/       UI primitives and shared components.
└── pages/            Home (timer), Settings, and About.

src-tauri/src/lib.rs  Tray icon and menu, `notify` and `update_tray_snapshot` commands,
                      close-to-tray behaviour.
```

Key points for contributors:

- `transitionTimerState(state, event, durations)` in `src/core/timer/timerMachine.ts` is a pure reducer. Keep it free of side effects so it stays easy to reason about and test.
- Tray menu clicks are forwarded from Rust to the frontend as a `tray-action` event. The frontend drives the timer; Rust only renders what it is told.
- On Linux, notifications go through the Rust `notify` command (libnotify). On other platforms they use `@tauri-apps/plugin-notification`.
- Adding a Tauri plugin touches four places: `src-tauri/Cargo.toml`, the `.plugin(...)` chain in `lib.rs`, a permission in `src-tauri/capabilities/default.json`, and `package.json`.

## Roadmap

v1 scope is frozen and tracked in [`PLAN.md`](PLAN.md). The remaining work before the first release is cross-platform QA and publishing distributables.

Out of scope for v1, by design:

- Cloud sync or user accounts
- Team or shared schedules
- Analytics or statistics dashboards
- Mobile apps

Ideas beyond v1 are welcome as GitHub issues. Please open a discussion before starting work on a large feature so we can agree on the design first.

## Contributing

Bug reports, fixes and small improvements are very welcome.

1. Fork the repository and create a branch from `main`.
2. Make your change. Keep the timer core pure and put side effects in hooks.
3. Run `npm run lint`, `npm run format:check` and `npm run build`, and make sure `cargo check` passes in `src-tauri`.
4. Open a pull request with a short description of what changed and why.

When filing a bug, please include your operating system, how you installed Nomad, and the steps to reproduce.

## License

Nomad is released under the [MIT License](LICENSE).

## Acknowledgements

Nomad is built with [Tauri](https://tauri.app/), [React](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/), [Zustand](https://zustand.docs.pmnd.rs/) and [Lucide](https://lucide.dev/) icons.
