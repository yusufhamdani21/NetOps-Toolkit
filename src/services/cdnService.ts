import type { CdnInspectionResult } from "@/types";

const CDN_PATTERNS: [RegExp, string][] = [
  [/cloudflare/i, "Cloudflare"],
  [/Akamai/i, "Akamai"],
  [/Fastly/i, "Fastly"],
  [/Amazon.*CloudFront|CloudFront/i, "AWS CloudFront"],
  [/Cloudflare/i, "Cloudflare"],
  [/KeyCDN/i, "KeyCDN"],
  [/StackPath/i, "StackPath"],
  [/BunnyCDN/i, "BunnyCDN"],
  [/cdn.*js|js.*cdn/i, "jsDelivr"],
  [/unpkg/i, "unpkg"],
  [/cdnjs/i, "cdnjs"],
];

function detectCdnVendor(headers: Record<string, string>): string | null {
  const server = headers["server"] || "";
  const via = headers["via"] || "";
  const xCache = headers["x-cache"] || "";
  const poweredBy = headers["x-powered-by"] || "";

  const combined = `${server} ${via} ${xCache} ${poweredBy}`;

  for (const [pattern, vendor] of CDN_PATTERNS) {
    if (pattern.test(combined)) return vendor;
  }
  return null;
}

export class CdnService {
  async inspect(url: string): Promise<CdnInspectionResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<CdnInspectionResult>("inspect_cdn", { url });
    }
    return this.mockInspect(url);
  }

  private mockInspect(url: string): CdnInspectionResult {
    const vendors = ["Cloudflare", "Akamai", "Fastly", "AWS CloudFront", null];
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];

    const headers: Record<string, string> = {
      server: vendor || "nginx/1.24.0",
      via: vendor ? `1.1 ${vendor.toLowerCase()}` : "",
      "cache-control": "public, max-age=3600, s-maxage=86400",
      age: String(Math.floor(Math.random() * 3600)),
      "x-cache": Math.random() > 0.5 ? "HIT" : "MISS",
      "x-powered-by": vendor || "Express",
      "content-type": "application/json; charset=utf-8",
      "content-length": "12345",
      etag: `"${Math.random().toString(36).slice(2)}"`,
      "last-modified": new Date(Date.now() - 86400000).toUTCString(),
    };

    return {
      url,
      resolvedIp: `198.51.100.${Math.floor(Math.random() * 255)}`,
      server: headers.server,
      via: headers.via,
      cacheControl: headers["cache-control"],
      age: parseInt(headers["age"]),
      xCache: headers["x-cache"],
      cdnVendor: vendor,
      responseHeaders: headers,
      timestamp: new Date().toISOString(),
    };
  }
}

export const cdnService = new CdnService();
export { detectCdnVendor };
