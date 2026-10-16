use serde::Deserialize;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{Emitter, Manager, WindowEvent};

const TRAY_ID: &str = "main-tray";
const TRAY_EVENT_NAME: &str = "tray-action";
const TICK_EVENT_NAME: &str = "timer-tick";
const TICK_INTERVAL: Duration = Duration::from_secs(1);

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TraySnapshot {
    status: String,
    remaining_seconds: u64,
}

/// Drives the frontend timer from a native thread. Webviews throttle
/// JavaScript timers in hidden windows, and Nomad hides to the tray, so the
/// tick must come from outside the webview. Each tick carries the clock
/// reading (epoch milliseconds) it was taken at.
fn spawn_ticker(app: tauri::AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(TICK_INTERVAL);
        let now_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|elapsed| elapsed.as_millis() as u64)
            .unwrap_or(0);
        if app.emit(TICK_EVENT_NAME, now_ms).is_err() {
            break;
        }
    });
}

fn format_remaining(seconds: u64) -> String {
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let secs = seconds % 60;
    if hours > 0 {
        format!("{hours}:{minutes:02}:{secs:02}")
    } else {
        format!("{minutes:02}:{secs:02}")
    }
}

/// Linux desktop notification via libnotify. Other platforms use the
/// notification plugin from the frontend instead.
#[cfg(target_os = "linux")]
#[tauri::command]
fn notify(title: &str, body: &str) -> Result<(), String> {
    libnotify::init("Nomad").map_err(|e| e.to_string())?;
    let result = libnotify::Notification::new(title, body, None)
        .show()
        .map(|_| ())
        .map_err(|e| e.to_string());
    libnotify::uninit();
    result
}

/// The frontend only calls `notify` on Linux; keep the command registered
/// elsewhere so the invoke surface is identical on every platform.
#[cfg(not(target_os = "linux"))]
#[tauri::command]
fn notify(_title: &str, _body: &str) -> Result<(), String> {
    Err("Native libnotify notifications are only available on Linux".to_string())
}

#[tauri::command]
fn update_tray_snapshot(app: tauri::AppHandle, snapshot: TraySnapshot) -> Result<(), String> {
    let tray = app
        .tray_by_id(TRAY_ID)
        .ok_or_else(|| "Tray is not initialized".to_string())?;

    let tooltip = match snapshot.status.as_str() {
        "work" => format!("Nomad – Working – {} left", format_remaining(snapshot.remaining_seconds)),
        "break" => format!("Nomad – On a break – {} left", format_remaining(snapshot.remaining_seconds)),
        "paused" => format!("Nomad – Paused – {} left", format_remaining(snapshot.remaining_seconds)),
        _ => "Nomad – Ready to start".to_string(),
    };

    tray.set_tooltip(Some(tooltip)).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            let open_item = MenuItem::with_id(app, "open", "Open Nomad", true, None::<&str>)?;
            let start_item =
                MenuItem::with_id(app, "start", "Start working", true, None::<&str>)?;
            let pause_item = MenuItem::with_id(app, "pause", "Pause", true, None::<&str>)?;
            let resume_item = MenuItem::with_id(app, "resume", "Resume", true, None::<&str>)?;
            let reset_item = MenuItem::with_id(app, "reset", "Stop and reset", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu = Menu::with_items(
                app,
                &[
                    &open_item,
                    &start_item,
                    &pause_item,
                    &resume_item,
                    &reset_item,
                    &quit_item,
                ],
            )?;

            let tray_icon = app
                .default_window_icon()
                .cloned()
                .ok_or("No app icon bundled for the tray")?;

            let _tray = TrayIconBuilder::with_id(TRAY_ID)
                .icon(tray_icon)
                .tooltip("Nomad – Ready to start")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                    "start" | "pause" | "resume" | "reset" => {
                        let _ = app.emit(TRAY_EVENT_NAME, event.id.as_ref());
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            spawn_ticker(app.handle().clone());

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![update_tray_snapshot, notify])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
