use serde::Serialize;
use std::net::ToSocketAddrs;
use std::time::{Duration, Instant};
use tauri::command;
use whois::{WhoIs, WhoIsLookupOptions};
use x509_parser::prelude::{FromDer, X509Certificate};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardInfo {
    pub local_ip: String,
    pub public_ip: String,
    pub dns_server: String,
    pub network_status: String,
    pub current_latency: u64,
    pub packet_loss: f64,
    pub last_diagnostic_run: Option<String>,
    pub quick_health: String,
}

#[command]
pub async fn get_dashboard_info() -> DashboardInfo {
    let local_ip = local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "Unknown".to_string());

    let start = Instant::now();
    let public_ip = match get_public_ip().await {
        Ok(ip) => {
            let latency = start.elapsed().as_millis() as u64;
            return DashboardInfo {
                local_ip,
                public_ip: ip,
                dns_server: "8.8.8.8".to_string(),
                network_status: "online".to_string(),
                current_latency: latency,
                packet_loss: 0.0,
                last_diagnostic_run: None,
                quick_health: if latency < 100 { "healthy" } else if latency < 300 { "warning" } else { "critical" }.to_string(),
            };
        }
        Err(_) => "Unknown".to_string(),
    };

    DashboardInfo {
        local_ip,
        public_ip,
        dns_server: "8.8.8.8".to_string(),
        network_status: "offline".to_string(),
        current_latency: 0,
        packet_loss: 0.0,
        last_diagnostic_run: None,
        quick_health: "critical".to_string(),
    }
}

async fn get_public_ip() -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get("https://api.ipify.org")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch public IP: {}", e))?;

    response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingResult {
    pub host: String,
    pub resolved_ip: String,
    pub packets_sent: u32,
    pub packets_received: u32,
    pub packet_loss: f64,
    pub min_latency: f64,
    pub max_latency: f64,
    pub avg_latency: f64,
    pub jitter: f64,
    pub raw_output: String,
    pub timestamp: String,
}

#[command]
pub async fn ping_host(host: String) -> PingResult {
    use std::process::Command;

    let timestamp = chrono::Utc::now().to_rfc3339();
    let resolved_ip = resolve_hostname(&host).await.unwrap_or_else(|_| host.clone());

    let output = if cfg!(target_os = "windows") {
        Command::new("ping")
            .args(["-n", "4", &host])
            .output()
    } else {
        Command::new("ping")
            .args(["-c", "4", &host])
            .output()
    };

    match output {
        Ok(out) => {
            let raw = String::from_utf8_lossy(&out.stdout).to_string();
            let raw_output = raw.clone();
            let raw_lower = raw.to_lowercase();

            let received = if raw_lower.contains("ttl") {
                raw.matches("ttl").count() as u32
            } else if raw_lower.contains("bytes from") {
                raw.matches("bytes from").count() as u32
            } else {
                0
            };

            let sent = 4u32;
            let loss = if sent > 0 {
                ((sent - received) as f64 / sent as f64) * 100.0
            } else {
                0.0
            };

            let latencies: Vec<f64> = raw
                .lines()
                .filter_map(|line| {
                    let line = line.to_lowercase();
                    if line.contains("time=") || line.contains("time<") {
                        let s = if line.contains("time=") {
                            line.split("time=").nth(1)
                        } else {
                            line.split("time<").nth(1)
                        };
                        if let Some(val) = s {
                            let val = val.trim().trim_start_matches('<');
                            let val = val.trim_end_matches("ms").trim();
                            val.parse::<f64>().ok()
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                })
                .collect();

            let min_latency = latencies.iter().cloned().fold(f64::MAX, f64::min);
            let max_latency = latencies.iter().cloned().fold(f64::MIN, f64::max);
            let avg_latency = if !latencies.is_empty() {
                latencies.iter().sum::<f64>() / latencies.len() as f64
            } else {
                0.0
            };
            let jitter = if latencies.len() > 1 {
                let diff: f64 = latencies
                    .windows(2)
                    .map(|w| (w[1] - w[0]).abs())
                    .sum();
                diff / (latencies.len() - 1) as f64
            } else {
                0.0
            };

            PingResult {
                host: host.clone(),
                resolved_ip,
                packets_sent: sent,
                packets_received: received,
                packet_loss: loss,
                min_latency,
                max_latency,
                avg_latency,
                jitter,
                raw_output,
                timestamp,
            }
        }
        Err(e) => PingResult {
            host: host.clone(),
            resolved_ip,
            packets_sent: 4,
            packets_received: 0,
            packet_loss: 100.0,
            min_latency: 0.0,
            max_latency: 0.0,
            avg_latency: 0.0,
            jitter: 0.0,
            raw_output: format!("Ping execution failed: {}", e),
            timestamp,
        },
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TracerouteHop {
    pub hop: u32,
    pub hostname: String,
    pub ip: String,
    pub latencies: Vec<f64>,
    pub packet_loss: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TracerouteResult {
    pub target: String,
    pub hops: Vec<TracerouteHop>,
    pub total_hops: u32,
    pub timestamp: String,
}

#[command]
pub async fn traceroute_host(host: String) -> TracerouteResult {
    use std::process::Command;

    let timestamp = chrono::Utc::now().to_rfc3339();
    let output = if cfg!(target_os = "windows") {
        Command::new("tracert").arg("-d").arg(&host).output()
    } else {
        Command::new("traceroute").args(["-n", &host]).output()
    };

    match output {
        Ok(out) => {
            let raw = String::from_utf8_lossy(&out.stdout).to_string();
            let hops: Vec<TracerouteHop> = raw
                .lines()
                .filter_map(|line| {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() < 2 {
                        return None;
                    }
                    let hop = parts[0].parse::<u32>().ok()?;
                    let ip = parts.last()?.to_string();
                    Some(TracerouteHop {
                        hop,
                        hostname: format!("hop-{}", hop),
                        ip,
                        latencies: vec![],
                        packet_loss: 0.0,
                    })
                })
                .collect();

            let total_hops = hops.len() as u32;
            TracerouteResult {
                target: host,
                hops,
                total_hops,
                timestamp,
            }
        }
        Err(_) => TracerouteResult {
            target: host,
            hops: vec![],
            total_hops: 0,
            timestamp,
        },
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MtrHop {
    pub hop: u32,
    pub hostname: String,
    pub ip: String,
    pub loss_percent: f64,
    pub sent: u32,
    pub last: f64,
    pub avg: f64,
    pub best: f64,
    pub worst: f64,
    pub std_dev: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MtrResult {
    pub target: String,
    pub hops: Vec<MtrHop>,
    pub timestamp: String,
}

#[command]
pub async fn mtr_host(host: String) -> MtrResult {
    use std::process::Command;

    let timestamp = chrono::Utc::now().to_rfc3339();
    let output = if cfg!(target_os = "windows") {
        Command::new("pathping").args(["-n", "-h", "10", &host]).output()
    } else {
        Command::new("mtr").args(["-r", "-n", "-c", "5", "--report-wide", &host]).output()
    };

    match output {
        Ok(out) => {
            let raw = String::from_utf8_lossy(&out.stdout).to_string();
            let hops: Vec<MtrHop> = raw
                .lines()
                .filter_map(|line| {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if parts.len() < 8 {
                        return None;
                    }
                    let hop = parts[0].parse::<u32>().ok()?;
                    Some(MtrHop {
                        hop,
                        hostname: format!("hop-{}", hop),
                        ip: parts.get(1).unwrap_or(&"?").to_string(),
                        loss_percent: parts.get(2).and_then(|s| s.trim_end_matches('%').parse().ok()).unwrap_or(0.0),
                        sent: parts.get(3).and_then(|s| s.parse().ok()).unwrap_or(0),
                        last: parts.get(4).and_then(|s| s.parse().ok()).unwrap_or(0.0),
                        avg: parts.get(5).and_then(|s| s.parse().ok()).unwrap_or(0.0),
                        best: parts.get(6).and_then(|s| s.parse().ok()).unwrap_or(0.0),
                        worst: parts.get(7).and_then(|s| s.parse().ok()).unwrap_or(0.0),
                        std_dev: parts.get(8).and_then(|s| s.parse().ok()).unwrap_or(0.0),
                    })
                })
                .collect();

            MtrResult {
                target: host,
                hops,
                timestamp,
            }
        }
        Err(_) => MtrResult {
            target: host,
            hops: vec![],
            timestamp,
        },
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DnsResult {
    pub domain: String,
    pub record_type: String,
    pub answers: Vec<DnsAnswer>,
    pub server: String,
    pub response_time: u64,
    pub timestamp: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DnsAnswer {
    pub name: String,
    pub r#type: String,
    pub ttl: u32,
    pub data: String,
}

#[command]
pub async fn dns_lookup(domain: String, record_type: String) -> DnsResult {
    use trust_dns_resolver::config::{ResolverConfig, ResolverOpts};
    use trust_dns_resolver::TokioAsyncResolver;

    let timestamp = chrono::Utc::now().to_rfc3339();
    let start = Instant::now();

    let resolver = TokioAsyncResolver::tokio(ResolverConfig::default(), ResolverOpts::default());

    let answers = match record_type.to_uppercase().as_str() {
        "A" => {
            match resolver.ipv4_lookup(&domain).await {
                Ok(response) => response
                    .iter()
                    .map(|ip| DnsAnswer {
                        name: domain.clone(),
                        r#type: "A".to_string(),
                        ttl: 300,
                        data: ip.to_string(),
                    })
                    .collect(),
                Err(_) => vec![],
            }
        }
        "AAAA" => {
            match resolver.ipv6_lookup(&domain).await {
                Ok(response) => response
                    .iter()
                    .map(|ip| DnsAnswer {
                        name: domain.clone(),
                        r#type: "AAAA".to_string(),
                        ttl: 300,
                        data: ip.to_string(),
                    })
                    .collect(),
                Err(_) => vec![],
            }
        }
        "MX" => {
            match resolver.mx_lookup(&domain).await {
                Ok(response) => response
                    .iter()
                    .map(|mx| DnsAnswer {
                        name: domain.clone(),
                        r#type: "MX".to_string(),
                        ttl: 300,
                        data: format!("{} {}", mx.preference(), mx.exchange()),
                    })
                    .collect(),
                Err(_) => vec![],
            }
        }
        "NS" => {
            match resolver.ns_lookup(&domain).await {
                Ok(response) => response
                    .iter()
                    .map(|ns| DnsAnswer {
                        name: domain.clone(),
                        r#type: "NS".to_string(),
                        ttl: 300,
                        data: ns.to_string(),
                    })
                    .collect(),
                Err(_) => vec![],
            }
        }
        "TXT" => {
            match resolver.txt_lookup(&domain).await {
                Ok(response) => response
                    .iter()
                    .flat_map(|txt| {
                        txt.iter()
                            .map(|d| DnsAnswer {
                                name: domain.clone(),
                                r#type: "TXT".to_string(),
                                ttl: 300,
                                data: String::from_utf8_lossy(d).to_string(),
                            })
                            .collect::<Vec<_>>()
                    })
                    .collect(),
                Err(_) => vec![],
            }
        }
        _ => {
            match resolver.lookup(&domain, trust_dns_resolver::proto::rr::RecordType::A).await {
                Ok(response) => response
                    .iter()
                    .map(|r| DnsAnswer {
                        name: domain.clone(),
                        r#type: record_type.clone(),
                        ttl: 300,
                        data: r.to_string(),
                    })
                    .collect(),
                Err(_) => vec![],
            }
        }
    };

    let response_time = start.elapsed().as_millis() as u64;

    DnsResult {
        domain,
        record_type,
        answers,
        server: "system".to_string(),
        response_time,
        timestamp,
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReverseDnsResult {
    pub ip: String,
    pub hostname: Option<String>,
    pub timestamp: String,
}

#[command]
pub async fn reverse_dns(ip: String) -> ReverseDnsResult {
    use trust_dns_resolver::config::{ResolverConfig, ResolverOpts};
    use trust_dns_resolver::TokioAsyncResolver;

    let timestamp = chrono::Utc::now().to_rfc3339();

    let resolver = TokioAsyncResolver::tokio(ResolverConfig::default(), ResolverOpts::default());

    let addr: std::net::IpAddr = match ip.parse() {
        Ok(a) => a,
        Err(_) => {
            return ReverseDnsResult {
                ip,
                hostname: None,
                timestamp,
            };
        }
    };

    match resolver.reverse_lookup(addr).await {
        Ok(response) => {
            let hostname = response.iter().next().map(|n| n.to_string());
            ReverseDnsResult {
                ip,
                hostname,
                timestamp,
            }
        }
        Err(_) => ReverseDnsResult {
            ip,
            hostname: None,
            timestamp,
        },
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WhoisResult {
    pub query: String,
    pub data: String,
    pub timestamp: String,
}

#[command]
pub async fn whois_lookup(query: String) -> WhoisResult {
    let timestamp = chrono::Utc::now().to_rfc3339();

    let whois = match WhoIs::from_host("whois.verisign-grs.com") {
        Ok(w) => w,
        Err(e) => {
            return WhoisResult {
                query,
                data: format!("WHOIS client init failed: {}", e),
                timestamp,
            };
        }
    };

    let options = match WhoIsLookupOptions::from_string(&query) {
        Ok(o) => o,
        Err(e) => {
            return WhoisResult {
                query,
                data: format!("Invalid WHOIS query: {}", e),
                timestamp,
            };
        }
    };

    match whois.lookup(options) {
        Ok(response) => WhoisResult {
            query,
            data: response,
            timestamp,
        },
        Err(e) => WhoisResult {
            query,
            data: format!("WHOIS lookup failed: {}", e),
            timestamp,
        },
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpStatusResult {
    pub url: String,
    pub status_code: u16,
    pub status_text: String,
    pub response_time: u64,
    pub headers: std::collections::HashMap<String, String>,
    pub body: String,
    pub timestamp: String,
}

#[command]
pub async fn http_status(url: String) -> HttpStatusResult {
    let timestamp = chrono::Utc::now().to_rfc3339();
    let start = Instant::now();

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .unwrap_or_default();

    match client.get(&url).send().await {
        Ok(response) => {
            let status_code = response.status().as_u16();
            let status_text = response.status().canonical_reason().unwrap_or("Unknown").to_string();
            let response_time = start.elapsed().as_millis() as u64;
            let headers: std::collections::HashMap<String, String> = response
                .headers()
                .iter()
                .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
                .collect();
            let body = response.text().await.unwrap_or_default().chars().take(1000).collect();

            HttpStatusResult {
                url,
                status_code,
                status_text,
                response_time,
                headers,
                body,
                timestamp,
            }
        }
        Err(e) => HttpStatusResult {
            url,
            status_code: 0,
            status_text: format!("Error: {}", e),
            response_time: start.elapsed().as_millis() as u64,
            headers: std::collections::HashMap::new(),
            body: String::new(),
            timestamp,
        },
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CertCheckResult {
    pub hostname: String,
    pub valid: bool,
    pub issuer: String,
    pub subject: String,
    pub valid_from: String,
    pub valid_to: String,
    pub days_remaining: i64,
    pub error: Option<String>,
    pub timestamp: String,
}

#[command]
pub async fn cert_check(hostname: String) -> CertCheckResult {
    use native_tls::TlsConnector;
    use std::net::TcpStream;

    let timestamp = chrono::Utc::now().to_rfc3339();

    match TcpStream::connect(format!("{}:443", hostname)) {
        Ok(stream) => {
            match TlsConnector::new() {
                Ok(connector) => {
                    match connector.connect(&hostname, stream) {
                        Ok(tls_stream) => {
                            if let Some(cert) = tls_stream.peer_certificate().ok().flatten() {
                                match cert.to_der() {
                                    Ok(der) => {
                                        match X509Certificate::from_der(&der) {
                                            Ok((_, parsed)) => {
                                                let subject = parsed.subject().to_string();
                                                let issuer = parsed.issuer().to_string();
                                                let valid_from_ts = parsed.validity().not_before.timestamp();
                                                let valid_to_ts = parsed.validity().not_after.timestamp();
                                                let valid_from = chrono::DateTime::from_timestamp(valid_from_ts, 0)
                                                    .map(|dt| dt.to_rfc3339())
                                                    .unwrap_or_default();
                                                let valid_to = chrono::DateTime::from_timestamp(valid_to_ts, 0)
                                                    .map(|dt| dt.to_rfc3339())
                                                    .unwrap_or_default();
                                                let days_remaining = chrono::DateTime::from_timestamp(valid_to_ts, 0)
                                                    .map(|dt| (dt - chrono::Utc::now()).num_days().max(0))
                                                    .unwrap_or(0);

                                                CertCheckResult {
                                                    hostname,
                                                    valid: true,
                                                    issuer,
                                                    subject,
                                                    valid_from,
                                                    valid_to,
                                                    days_remaining,
                                                    error: None,
                                                    timestamp,
                                                }
                                            }
                                            Err(e) => CertCheckResult {
                                                hostname,
                                                valid: false,
                                                issuer: String::new(),
                                                subject: String::new(),
                                                valid_from: String::new(),
                                                valid_to: String::new(),
                                                days_remaining: 0,
                                                error: Some(format!("Failed to parse certificate: {}", e)),
                                                timestamp,
                                            },
                                        }
                                    }
                                    Err(e) => CertCheckResult {
                                        hostname,
                                        valid: false,
                                        issuer: String::new(),
                                        subject: String::new(),
                                        valid_from: String::new(),
                                        valid_to: String::new(),
                                        days_remaining: 0,
                                        error: Some(format!("Failed to decode certificate: {}", e)),
                                        timestamp,
                                    },
                                }
                            } else {
                                CertCheckResult {
                                    hostname,
                                    valid: false,
                                    issuer: String::new(),
                                    subject: String::new(),
                                    valid_from: String::new(),
                                    valid_to: String::new(),
                                    days_remaining: 0,
                                    error: Some("No peer certificate".to_string()),
                                    timestamp,
                                }
                            }
                        }
                        Err(e) => CertCheckResult {
                            hostname,
                            valid: false,
                            issuer: String::new(),
                            subject: String::new(),
                            valid_from: String::new(),
                            valid_to: String::new(),
                            days_remaining: 0,
                            error: Some(format!("TLS handshake failed: {}", e)),
                            timestamp,
                        },
                    }
                }
                Err(e) => CertCheckResult {
                    hostname,
                    valid: false,
                    issuer: String::new(),
                    subject: String::new(),
                    valid_from: String::new(),
                    valid_to: String::new(),
                    days_remaining: 0,
                    error: Some(format!("TLS connector failed: {}", e)),
                    timestamp,
                },
            }
        }
        Err(e) => CertCheckResult {
            hostname,
            valid: false,
            issuer: String::new(),
            subject: String::new(),
            valid_from: String::new(),
            valid_to: String::new(),
            days_remaining: 0,
            error: Some(format!("Connection failed: {}", e)),
            timestamp,
        },
    }
}

async fn resolve_hostname(host: &str) -> Result<String, String> {
    let addr = (host, 0)
        .to_socket_addrs()
        .map_err(|e| format!("DNS resolution failed: {}", e))?
        .next()
        .ok_or_else(|| "No IP address found".to_string())?;
    Ok(addr.ip().to_string())
}
