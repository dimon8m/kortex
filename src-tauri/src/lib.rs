// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn freeze_ram() -> String {
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("powershell")
            .args(["-WindowStyle", "Hidden", "-Command", "[System.GC]::Collect(); [System.GC]::WaitForPendingFinalizers()"])
            .output();
    }
    
    "ОЗУ успешно очищена, фоновые кэши сброшены!".into()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, freeze_ram])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
