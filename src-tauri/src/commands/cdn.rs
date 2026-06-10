use serde::Serialize;
use std::collections::HashMap;
use std::time::{Duration, Instant};
use tauri::command;

#[derive(Debug, Serialize)]
pub struct CdnInspectionResult {
    pub url: String,
    pub resolved_ip: String,
    pub server: String,
    pub via: String,
    pub cache_control: String,
    pub age: u64,
    pub x_cache: String,
    pub cdn_vendor: Option<String>,
    pub response_headers: HashMap<String, String>,
    pub timestamp: String,
}

fn detect_cdn_vendor(headers: &HashMap<String, String>) -> Option<String> {
    let server = headers.get("server").map(|s| s.as_str()).unwrap_or("");
    let via = headers.get("via").map(|s| s.as_str()).unwrap_or("");
    let x_cache = headers.get("x-cache").map(|s| s.as_str()).unwrap_or("");
    let powered_by = headers.get("x-powered-by").map(|s| s.as_str()).unwrap_or("");

    let combined = format!("{} {} {} {}", server, via, x_cache, powered_by);

    let patterns: [(&str, &str); 10] = [
        ("cloudflare", "Cloudflare"),
        ("akamai", "Akamai"),
        ("fastly", "Fastly"),
        ("cloudfront", "AWS CloudFront"),
        ("keycdn", "KeyCDN"),
        ("stackpath", "StackPath"),
        ("bunnycdn", "BunnyCDN"),
        ("jsdelivr", "jsDelivr"),
        ("unpkg", "unpkg"),
        ("cdnjs", "cdnjs"),
    ];

    for (pattern, vendor) in &patterns {
        if combined.to_lowercase().contains(pattern) {
            return Some(vendor.to_string());
        }
    }
    None
}

#[command]
pub async fn inspect_cdn(url: String) -> CdnInspectionResult {
    use std::net::ToSocketAddrs;

    let timestamp = chrono::Utc::now().to_rfc3339();

    let host = url
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .split('/')
        .next()
        .unwrap_or(&url);

    let resolved_ip = (host, 0)
        .to_socket_addrs()
        .ok()
        .and_then(|mut addrs| addrs.next())
        .map(|addr| addr.ip().to_string())
        .unwrap_or_else(|| "Unknown".to_string());

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap_or_default();

    match client.get(&url).send().await {
        Ok(response) => {
            let headers: HashMap<String, String> = response
                .headers()
                .iter()
                .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
                .collect();

            let server = headers.get("server").cloned().unwrap_or_default();
            let via = headers.get("via").cloned().unwrap_or_default();
            let cache_control = headers.get("cache-control").cloned().unwrap_or_default();
            let age = headers.get("age").and_then(|v| v.parse().ok()).unwrap_or(0);
            let x_cache = headers.get("x-cache").cloned().unwrap_or_default();
            let cdn_vendor = detect_cdn_vendor(&headers);

            CdnInspectionResult {
                url,
                resolved_ip,
                server,
                via,
                cache_control,
                age,
                x_cache,
                cdn_vendor,
                response_headers: headers,
                timestamp,
            }
        }
        Err(e) => CdnInspectionResult {
            url,
            resolved_ip,
            server: String::new(),
            via: String::new(),
            cache_control: String::new(),
            age: 0,
            x_cache: String::new(),
            cdn_vendor: None,
            response_headers: HashMap::new(),
            timestamp,
        },
    }
}
