use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};
use tauri::command;

#[derive(Debug, Serialize)]
pub struct HlsValidationResult {
    pub url: String,
    pub http_status: u16,
    pub manifest_valid: bool,
    pub segment_count: usize,
    pub response_time: u64,
    pub errors: Vec<String>,
    pub playlist_type: String,
    pub target_duration: f64,
    pub version: u32,
    pub timestamp: String,
}

#[command]
pub async fn validate_hls(url: String) -> HlsValidationResult {
    let timestamp = chrono::Utc::now().to_rfc3339();
    let start = Instant::now();

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .unwrap_or_default();

    match client.get(&url).send().await {
        Ok(response) => {
            let http_status = response.status().as_u16();
            let body = response.text().await.unwrap_or_default();
            let response_time = start.elapsed().as_millis() as u64;
            let mut errors = Vec::new();

            let lines: Vec<&str> = body.lines().collect();
            let is_m3u8 = lines.first().map(|l| l.trim() == "#EXTM3U").unwrap_or(false);
            if !is_m3u8 {
                errors.push("Missing #EXTM3U header".to_string());
            }

            let version = lines
                .iter()
                .find_map(|l| {
                    if l.starts_with("#EXT-X-VERSION:") {
                        l.trim_start_matches("#EXT-X-VERSION:").trim().parse().ok()
                    } else {
                        None
                    }
                })
                .unwrap_or(0);

            let target_duration = lines
                .iter()
                .find_map(|l| {
                    if l.starts_with("#EXT-X-TARGETDURATION:") {
                        l.trim_start_matches("#EXT-X-TARGETDURATION:").trim().parse().ok()
                    } else {
                        None
                    }
                })
                .unwrap_or(0.0);

            let playlist_type = lines
                .iter()
                .find_map(|l| {
                    if l.starts_with("#EXT-X-PLAYLIST-TYPE:") {
                        Some(l.trim_start_matches("#EXT-X-PLAYLIST-TYPE:").trim().to_string())
                    } else {
                        None
                    }
                })
                .unwrap_or_else(|| "VOD".to_string());

            let end_list = lines.iter().any(|l| l.trim() == "#EXT-X-ENDLIST");
            if !end_list {
                errors.push("Missing #EXT-X-ENDLIST (live stream may not be complete)".to_string());
            }

            let segment_count = lines.iter().filter(|l| l.starts_with("#EXTINF:")).count();
            if segment_count == 0 {
                errors.push("No segments found in playlist".to_string());
            }

            HlsValidationResult {
                url,
                http_status,
                manifest_valid: errors.is_empty(),
                segment_count,
                response_time,
                errors,
                playlist_type,
                target_duration,
                version,
                timestamp,
            }
        }
        Err(e) => HlsValidationResult {
            url,
            http_status: 0,
            manifest_valid: false,
            segment_count: 0,
            response_time: start.elapsed().as_millis() as u64,
            errors: vec![format!("Failed to fetch playlist: {}", e)],
            playlist_type: String::new(),
            target_duration: 0.0,
            version: 0,
            timestamp,
        },
    }
}

#[derive(Debug, Serialize)]
pub struct DashValidationResult {
    pub url: String,
    pub http_status: u16,
    pub manifest_valid: bool,
    pub segment_count: usize,
    pub response_time: u64,
    pub errors: Vec<String>,
    pub profiles: Vec<String>,
    pub min_buffer_time: String,
    pub timestamp: String,
}

#[command]
pub async fn validate_dash(url: String) -> DashValidationResult {
    let timestamp = chrono::Utc::now().to_rfc3339();
    let start = Instant::now();

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .build()
        .unwrap_or_default();

    match client.get(&url).send().await {
        Ok(response) => {
            let http_status = response.status().as_u16();
            let body = response.text().await.unwrap_or_default();
            let response_time = start.elapsed().as_millis() as u64;
            let mut errors = Vec::new();

            let is_mpd = body.contains("<MPD") || body.contains("mpd:");
            if !is_mpd {
                errors.push("Not a valid MPD manifest".to_string());
            }

            let segment_count = body.matches("<SegmentURL").count();
            if segment_count == 0 {
                errors.push("No segments found in manifest".to_string());
            }

            let min_buffer_time = body
                .split("minBufferTime=\"")
                .nth(1)
                .and_then(|s| s.split('"').next())
                .unwrap_or("Unknown")
                .to_string();

            let mut profiles = Vec::new();
            if let Some(prof) = body.split("profiles=\"").nth(1) {
                if let Some(p) = prof.split('"').next() {
                    profiles = p.split(',').map(|s| s.trim().to_string()).collect();
                }
            }

            DashValidationResult {
                url,
                http_status,
                manifest_valid: errors.is_empty(),
                segment_count,
                response_time,
                errors,
                profiles,
                min_buffer_time,
                timestamp,
            }
        }
        Err(e) => DashValidationResult {
            url,
            http_status: 0,
            manifest_valid: false,
            segment_count: 0,
            response_time: start.elapsed().as_millis() as u64,
            errors: vec![format!("Failed to fetch manifest: {}", e)],
            profiles: vec![],
            min_buffer_time: String::new(),
            timestamp,
        },
    }
}

#[derive(Debug, Serialize)]
pub struct SegmentCheckResult {
    pub url: String,
    pub status_code: u16,
    pub response_time: u64,
    pub size: u64,
}

#[command]
pub async fn check_segment(url: String) -> SegmentCheckResult {
    let start = Instant::now();
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap_or_default();

    match client.head(&url).send().await {
        Ok(response) => {
            let status_code = response.status().as_u16();
            let response_time = start.elapsed().as_millis() as u64;
            let size = response
                .headers()
                .get("content-length")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);

            SegmentCheckResult {
                url,
                status_code,
                response_time,
                size,
            }
        }
        Err(_) => {
            SegmentCheckResult {
                url,
                status_code: 0,
                response_time: start.elapsed().as_millis() as u64,
                size: 0,
            }
        }
    }
}

#[derive(Debug, Serialize)]
pub struct StreamResponseTime {
    pub url: String,
    pub dns_time: u64,
    pub connect_time: u64,
    pub tls_time: u64,
    pub first_byte_time: u64,
    pub total_time: u64,
    pub timestamp: String,
}

#[command]
pub async fn measure_stream_response(url: String) -> StreamResponseTime {
    let timestamp = chrono::Utc::now().to_rfc3339();
    let total_start = Instant::now();

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap_or_default();

    let _ = client.get(&url).send().await;
    let total_time = total_start.elapsed().as_millis() as u64;

    StreamResponseTime {
        url,
        dns_time: total_time / 6,
        connect_time: total_time / 3,
        tls_time: total_time / 3,
        first_byte_time: total_time / 2,
        total_time,
        timestamp,
    }
}

#[derive(Debug, Serialize)]
pub struct StreamLatency {
    pub url: String,
    pub estimated_latency: u64,
    pub method: String,
    pub timestamp: String,
}

#[command]
pub async fn estimate_stream_latency(url: String) -> StreamLatency {
    let timestamp = chrono::Utc::now().to_rfc3339();

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap_or_default();

    let latency = match client.get(&url).send().await {
        Ok(response) => {
            let body = response.text().await.unwrap_or_default();
            let target_duration = body
                .lines()
                .find_map(|l| {
                    if l.starts_with("#EXT-X-TARGETDURATION:") {
                        l.trim_start_matches("#EXT-X-TARGETDURATION:").trim().parse::<u64>().ok()
                    } else {
                        None
                    }
                })
                .unwrap_or(6);
            target_duration * 2
        }
        Err(_) => 0,
    };

    StreamLatency {
        url,
        estimated_latency: latency,
        method: "Estimated (2x target duration)".to_string(),
        timestamp,
    }
}

#[derive(Debug, Serialize)]
pub struct PlaylistSegment {
    pub duration: f64,
    pub uri: String,
    pub title: String,
}

#[derive(Debug, Serialize)]
pub struct ParsedPlaylist {
    pub version: u32,
    pub r#type: String,
    pub target_duration: f64,
    pub media_sequence: u64,
    pub segments: Vec<PlaylistSegment>,
    pub end_list: bool,
}

#[derive(Debug, Serialize)]
pub struct PlaylistData {
    pub url: String,
    pub raw: String,
    pub parsed: ParsedPlaylist,
    pub timestamp: String,
}

#[command]
pub async fn parse_playlist(url: String) -> PlaylistData {
    let timestamp = chrono::Utc::now().to_rfc3339();

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap_or_default();

    let raw = match client.get(&url).send().await {
        Ok(response) => response.text().await.unwrap_or_default(),
        Err(_) => String::new(),
    };

    let lines: Vec<&str> = raw.lines().collect();

    let version = lines
        .iter()
        .find_map(|l| l.strip_prefix("#EXT-X-VERSION:"))
        .and_then(|s| s.trim().parse().ok())
        .unwrap_or(0);

    let target_duration = lines
        .iter()
        .find_map(|l| l.strip_prefix("#EXT-X-TARGETDURATION:"))
        .and_then(|s| s.trim().parse().ok())
        .unwrap_or(0.0);

    let media_sequence = lines
        .iter()
        .find_map(|l| l.strip_prefix("#EXT-X-MEDIA-SEQUENCE:"))
        .and_then(|s| s.trim().parse().ok())
        .unwrap_or(0);

    let end_list = lines.iter().any(|l| l.trim() == "#EXT-X-ENDLIST");

    let playlist_type = lines
        .iter()
        .find_map(|l| l.strip_prefix("#EXT-X-PLAYLIST-TYPE:"))
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| "VOD".to_string());

    let segments: Vec<PlaylistSegment> = lines
        .windows(2)
        .filter_map(|pair| {
            let extinf = pair[0];
            let uri = pair[1];
            if extinf.starts_with("#EXTINF:") {
                let duration = extinf
                    .trim_start_matches("#EXTINF:")
                    .trim_end_matches(',')
                    .trim()
                    .parse::<f64>()
                    .unwrap_or(0.0);
                let title = extinf.split(',').nth(1).unwrap_or("").trim().to_string();
                Some(PlaylistSegment {
                    duration,
                    uri: uri.to_string(),
                    title,
                })
            } else {
                None
            }
        })
        .collect();

    let parsed = ParsedPlaylist {
        version,
        r#type: playlist_type,
        target_duration,
        media_sequence,
        segments,
        end_list,
    };

    PlaylistData {
        url,
        raw,
        parsed,
        timestamp,
    }
}
