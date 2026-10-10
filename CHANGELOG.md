# Changelog

All notable changes to Nomad are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-10

The first release. Nomad is a local-only work/break timer for the desktop.

### Added

- Work and break timer with start, pause, resume and reset.
- Automatic cycling: a finished work session starts a break, and a finished break starts work.
- Configurable work and break durations in minutes or hours (1 to 240), persisted to a local `settings.json`.
- Native notifications when a session ends. Linux uses libnotify directly; macOS and Windows use the system notification API.
- System tray icon with a live tooltip (phase and remaining time) and a menu with Open, Start, Pause, Resume, Stop and reset, and Quit.
- Closing the window hides it to the tray so the timer keeps running. Quit from the tray menu to exit.
- Settings and About pages.
- GitHub Actions workflows for CI checks and for building release installers on Linux, macOS and Windows.

[1.0.0]: https://github.com/Saffron-codes/nomad/releases/tag/v1.0.0
