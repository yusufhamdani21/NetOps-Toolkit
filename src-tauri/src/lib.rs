mod commands;
mod services;

use commands::network::*;
use commands::ott::*;
use commands::cdn::*;
use commands::system::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_dashboard_info,
            ping_host,
            traceroute_host,
            mtr_host,
            dns_lookup,
            reverse_dns,
            whois_lookup,
            http_status,
            cert_check,
            validate_hls,
            validate_dash,
            check_segment,
            measure_stream_response,
            estimate_stream_latency,
            parse_playlist,
            inspect_cdn,
            export_pdf,
        ])
        .run(tauri::generate_context!())
        .expect("error while running NetOps Toolkit");
}
