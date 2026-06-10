use serde::Serialize;
use std::net::ToSocketAddrs;

#[derive(Debug, Serialize)]
pub struct DnsAnswer {
    pub name: String,
    pub r#type: String,
    pub ttl: u32,
    pub data: String,
}

impl Default for DnsAnswer {
    fn default() -> Self {
        Self {
            name: String::new(),
            r#type: String::new(),
            ttl: 0,
            data: String::new(),
        }
    }
}

pub struct NetworkService;

impl NetworkService {
    pub fn resolve_hostname(host: &str) -> Result<String, String> {
        let addr = (host, 0)
            .to_socket_addrs()
            .map_err(|e| format!("DNS resolution failed: {}", e))?
            .next()
            .ok_or_else(|| "No IP address found".to_string())?;
        Ok(addr.ip().to_string())
    }
}
