#[cfg(target_os = "macos")]
mod window_capture;

// ── Tauri commands ────────────────────────────────────────────────────────────

#[tauri::command]
fn list_windows() -> Vec<serde_json::Value> {
    #[cfg(target_os = "macos")]
    {
        window_capture::list_windows_impl()
            .into_iter()
            .map(|w| serde_json::json!({ "id": w.id, "title": w.title, "app": w.app }))
            .collect()
    }
    #[cfg(not(target_os = "macos"))]
    {
        vec![]
    }
}

#[tauri::command]
fn capture_window(id: u32) -> String {
    #[cfg(target_os = "macos")]
    {
        window_capture::capture_window_impl(id).unwrap_or_default()
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = id;
        String::new()
    }
}

// ── App entry ─────────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![list_windows, capture_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
