import type {
  PingResult,
  TracerouteResult,
  MtrResult,
  DnsResult,
  ReverseDnsResult,
  WhoisResult,
  HttpStatusResult,
  CertCheckResult,
} from "@/types";

function getTimestamp() {
  return new Date().toISOString();
}

export class NetworkService {
  async ping(host: string): Promise<PingResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<PingResult>("ping_host", { host });
    }
    return this.mockPing(host);
  }

  async traceroute(host: string): Promise<TracerouteResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<TracerouteResult>("traceroute_host", { host });
    }
    return this.mockTraceroute(host);
  }

  async mtr(host: string): Promise<MtrResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<MtrResult>("mtr_host", { host });
    }
    return this.mockMtr(host);
  }

  async dnsLookup(domain: string, type = "A"): Promise<DnsResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<DnsResult>("dns_lookup", { domain, recordType: type });
    }
    return this.mockDns(domain, type);
  }

  async reverseDns(ip: string): Promise<ReverseDnsResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<ReverseDnsResult>("reverse_dns", { ip });
    }
    return this.mockReverseDns(ip);
  }

  async whois(query: string): Promise<WhoisResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<WhoisResult>("whois_lookup", { query });
    }
    return this.mockWhois(query);
  }

  async httpStatus(url: string): Promise<HttpStatusResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<HttpStatusResult>("http_status", { url });
    }
    return this.mockHttpStatus(url);
  }

  async certCheck(hostname: string): Promise<CertCheckResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<CertCheckResult>("cert_check", { hostname });
    }
    return this.mockCertCheck(hostname);
  }

  private mockPing(host: string): PingResult {
    const sent = 4;
    const received = Math.random() > 0.2 ? sent : sent - Math.floor(Math.random() * 3);
    const loss = ((sent - received) / sent) * 100;
    const baseLatency = Math.floor(Math.random() * 50) + 5;
    return {
      host,
      resolvedIp: `1.2.3.4`,
      packetsSent: sent,
      packetsReceived: received,
      packetLoss: loss,
      minLatency: baseLatency,
      maxLatency: baseLatency + Math.floor(Math.random() * 30),
      avgLatency: baseLatency + Math.floor(Math.random() * 10),
      jitter: Math.floor(Math.random() * 5),
      rawOutput: `PING ${host} (1.2.3.4): 56 data bytes\n64 bytes from 1.2.3.4: icmp_seq=0 ttl=56 time=${baseLatency}ms\n--- ${host} ping statistics ---\n${sent} packets transmitted, ${received} received, ${loss}% packet loss`,
      timestamp: getTimestamp(),
    };
  }

  private mockTraceroute(host: string): TracerouteResult {
    const hops = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
      hop: i + 1,
      hostname: `router-${i + 1}.isp.net`,
      ip: `10.0.${i}.1`,
      latencies: [Math.floor(Math.random() * 50) + 5],
      packetLoss: 0,
    }));
    return { target: host, hops, totalHops: hops.length, timestamp: getTimestamp() };
  }

  private mockMtr(host: string): MtrResult {
    const hops = Array.from({ length: 8 }, (_, i) => ({
      hop: i + 1,
      hostname: `hop-${i + 1}.example.net`,
      ip: `10.0.${i}.1`,
      lossPercent: Math.random() > 0.85 ? Math.floor(Math.random() * 20) : 0,
      sent: 10,
      last: Math.floor(Math.random() * 40) + 5,
      avg: Math.floor(Math.random() * 35) + 10,
      best: Math.floor(Math.random() * 20) + 2,
      worst: Math.floor(Math.random() * 60) + 20,
      stdDev: Math.floor(Math.random() * 8),
    }));
    return { target: host, hops, timestamp: getTimestamp() };
  }

  private mockDns(domain: string, type: string): DnsResult {
    const answers = [
      { name: domain, type, ttl: 300, data: "93.184.216.34" },
    ];
    return {
      domain,
      recordType: type,
      answers,
      server: "8.8.8.8",
      responseTime: Math.floor(Math.random() * 80) + 10,
      timestamp: getTimestamp(),
    };
  }

  private mockReverseDns(ip: string): ReverseDnsResult {
    return {
      ip,
      hostname: ip === "8.8.8.8" ? "dns.google" : `host-${ip.replace(/\./g, "-")}.example.com`,
      timestamp: getTimestamp(),
    };
  }

  private mockWhois(query: string): WhoisResult {
    return {
      query,
      data: `Domain Name: ${query}\nRegistry Domain ID: EXAMPLE_ID\nRegistrar: Example Registrar, Inc.\nCreation Date: 2020-01-01\nExpiration Date: 2030-01-01\nName Server: NS1.EXAMPLE.COM\nName Server: NS2.EXAMPLE.COM`,
      timestamp: getTimestamp(),
    };
  }

  private mockHttpStatus(url: string): HttpStatusResult {
    const statusCodes = [200, 200, 200, 200, 301, 403, 404, 500];
    const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    const statusText: Record<number, string> = {
      200: "OK",
      301: "Moved Permanently",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error",
    };
    return {
      url,
      statusCode,
      statusText: statusText[statusCode] || "Unknown",
      responseTime: Math.floor(Math.random() * 500) + 50,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        Server: "nginx/1.24.0",
        "Cache-Control": "public, max-age=3600",
      },
      body: "<html><body><h1>Example</h1></body></html>",
      timestamp: getTimestamp(),
    };
  }

  private mockCertCheck(hostname: string): CertCheckResult {
    const now = new Date();
    const validFrom = new Date(now.getTime() - 180 * 86400000);
    const validTo = new Date(now.getTime() + 90 * 86400000);
    return {
      hostname,
      valid: true,
      issuer: "C=US, O=Let's Encrypt, CN=R3",
      subject: `CN=${hostname}`,
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
      daysRemaining: 90,
      error: null,
      timestamp: getTimestamp(),
    };
  }
}

export const networkService = new NetworkService();
