use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            let window = app.get_webview_window("main").expect("Window failed");
            window
                .set_ignore_cursor_events(true)
                .expect("Failed to set ignore cursor events");
            #[cfg(not(target_os = "linux"))]
            window.maximize().expect("Could not maximize window");

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}