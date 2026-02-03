use mdns_sd::{ServiceDaemon, ServiceEvent};
use serde::Serialize;
use std::collections::HashMap;
use std::time::{Duration, Instant};

#[derive(Serialize)]
struct ServerInfo {
    hostname: String,
    fullname: String,
    addresses: Vec<String>,
    port: u16,
    txt: HashMap<String, String>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[tauri::command]
fn discover_server() -> Result<Vec<ServerInfo>, String> {
    // 1. Create a daemon
    let mdns = ServiceDaemon::new().map_err(|e| e.to_string())?;

    // 2. Browse for our specific service type
    let receiver = mdns
        .browse("_aaxion._tcp.local.")
        .map_err(|e| e.to_string())?;

    // 3. Collect servers for up to 2 seconds
    let mut servers: Vec<ServerInfo> = Vec::new();
    let start = Instant::now();

    // Using a shorter timeout for quicker UI response while still gathering potential multiples
    while start.elapsed() < Duration::from_secs(2) {
        if let Ok(event) = receiver.recv_timeout(Duration::from_millis(100)) {
            match event {
                ServiceEvent::ServiceResolved(info) => {
                    let mut txt = HashMap::new();
                    for prop in info.get_properties().iter() {
                        txt.insert(prop.key().to_string(), prop.val_str().to_string());
                    }

                    let addresses: Vec<String> = info
                        .get_addresses()
                        .iter()
                        .map(|ip| ip.to_string())
                        .collect();

                    let server = ServerInfo {
                        hostname: info.get_hostname().to_string(),
                        fullname: info.get_fullname().to_string(),
                        addresses,
                        port: info.get_port(),
                        txt,
                    };

                    // Simple deduplication based on fullname
                    if !servers.iter().any(|s| s.fullname == server.fullname) {
                        servers.push(server);
                    }
                }
                _ => {}
            }
        }
    }

    Ok(servers)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        // 👇 REGISTER THE COMMAND HERE
        .invoke_handler(tauri::generate_handler![discover_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
