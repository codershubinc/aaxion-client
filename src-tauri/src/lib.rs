use mdns_sd::{ServiceDaemon, ServiceEvent};
use serde::Serialize;
use std::collections::{HashMap, HashSet}; // Added HashSet for better dedup
use std::time::{Duration, Instant};

#[derive(Serialize, Debug, Clone)] // Added Clone
struct ServerInfo {
    hostname: String,
    fullname: String,
    addresses: Vec<String>,
    port: u16,
    txt: HashMap<String, String>,
}

#[tauri::command]
fn discover_server() -> Result<Vec<ServerInfo>, String> {
    println!("🚀 Starting mDNS discovery...");

    // 1. Create the daemon
    // In production, if this fails, it's often because of a port conflict.
    // However, mdns-sd usually handles SO_REUSEADDR. If it fails, we catch it here.
    let mdns = ServiceDaemon::new().map_err(|e| {
        eprintln!("❌ Failed to create mDNS daemon: {}", e);
        format!("mDNS Error: {}", e)
    })?;

    // 2. Browse specifically for YOUR service
    // Make sure your Go/Python server is broadcasting exactly this type.
    let receiver = mdns.browse("_aaxion._tcp.local.").map_err(|e| {
        eprintln!("❌ Failed to browse: {}", e);
        e.to_string()
    })?;

    let mut servers = Vec::new();
    let mut seen_fullnames = HashSet::new(); // Faster deduplication

    // 3. Scan duration (Reduced to 1.5s for snappier UI, usually sufficient)
    let start = Instant::now();
    let timeout = Duration::from_millis(1500);

    println!("🔎 Scanning for _aaxion._tcp.local. ...");

    while start.elapsed() < timeout {
        // Recv timeout allows us to keep checking the loop condition
        if let Ok(event) = receiver.recv_timeout(Duration::from_millis(100)) {
            match event {
                ServiceEvent::ServiceResolved(info) => {
                    let fullname = info.get_fullname().to_string();

                    // Deduplicate immediately
                    if seen_fullnames.contains(&fullname) {
                        continue;
                    }

                    // Extract properties safely
                    let mut txt = HashMap::new();
                    for prop in info.get_properties().iter() {
                        txt.insert(prop.key().to_string(), prop.val_str().to_string());
                    }

                    // Filter out IPv6 if you only want IPv4 (optional but recommended for internal LAN tools)
                    let addresses: Vec<String> = info
                        .get_addresses()
                        .iter()
                        .map(|ip| ip.to_string())
                        .collect();

                    let server = ServerInfo {
                        hostname: info.get_hostname().to_string(),
                        fullname: fullname.clone(),
                        addresses,
                        port: info.get_port(),
                        txt,
                    };

                    println!("✨ Found Server: {:?}", server);
                    servers.push(server);
                    seen_fullnames.insert(fullname);
                }
                _ => {} // Ignore other events like ServiceFound (wait for Resolved)
            }
        }
    }

    // 4. CRITICAL: Shutdown the daemon to release the socket!
    // If you don't do this, the next time you call this function, it might fail to bind.
    if let Err(e) = mdns.shutdown() {
        eprintln!("⚠️ Warning: Failed to shutdown daemon cleanly: {}", e);
    }

    println!("✅ Discovery finished. Found {} servers.", servers.len());
    Ok(servers)
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        // 👇 REGISTER THE COMMAND HERE
        .invoke_handler(tauri::generate_handler![discover_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
