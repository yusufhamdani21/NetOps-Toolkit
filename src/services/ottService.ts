import type {
  HlsValidationResult,
  DashValidationResult,
  StreamResponseTime,
  StreamLatency,
  PlaylistData,
  ParsedPlaylist,
  PlaylistSegment,
} from "@/types";

export class OttService {
  async validateHls(url: string): Promise<HlsValidationResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<HlsValidationResult>("validate_hls", { url });
    }
    return this.mockHlsValidation(url);
  }

  async validateDash(url: string): Promise<DashValidationResult> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<DashValidationResult>("validate_dash", { url });
    }
    return this.mockDashValidation(url);
  }

  async checkSegment(url: string): Promise<{ url: string; statusCode: number; responseTime: number; size: number }> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke("check_segment", { url });
    }
    return {
      url,
      statusCode: 200,
      responseTime: Math.floor(Math.random() * 200) + 50,
      size: Math.floor(Math.random() * 5000000) + 100000,
    };
  }

  async measureResponseTime(url: string): Promise<StreamResponseTime> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<StreamResponseTime>("measure_stream_response", { url });
    }
    return this.mockResponseTime(url);
  }

  async estimateLatency(url: string): Promise<StreamLatency> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<StreamLatency>("estimate_stream_latency", { url });
    }
    return {
      url,
      estimatedLatency: Math.floor(Math.random() * 30) + 5,
      method: "Estimated (playlist-based)",
      timestamp: new Date().toISOString(),
    };
  }

  async parsePlaylist(url: string): Promise<PlaylistData> {
    if (window.__TAURI_INTERNALS__) {
      const { invoke } = await import("@tauri-apps/api/core");
      return invoke<PlaylistData>("parse_playlist", { url });
    }
    return this.mockPlaylistParse(url);
  }

  private mockHlsValidation(url: string): HlsValidationResult {
    const errors: string[] = [];
    const valid = Math.random() > 0.3;
    if (!valid) errors.push("EXTINF duration mismatch on segment 3");
    if (Math.random() > 0.8) errors.push("Missing EXT-X-ENDLIST tag");

    return {
      url,
      httpStatus: 200,
      manifestValid: valid,
      segmentCount: Math.floor(Math.random() * 50) + 10,
      responseTime: Math.floor(Math.random() * 300) + 50,
      errors,
      playlistType: "VOD",
      targetDuration: 6,
      version: 7,
      timestamp: new Date().toISOString(),
    };
  }

  private mockDashValidation(url: string): DashValidationResult {
    const errors: string[] = [];
    const valid = Math.random() > 0.3;
    if (!valid) errors.push("Segment timeline mismatch");

    return {
      url,
      httpStatus: 200,
      manifestValid: valid,
      segmentCount: Math.floor(Math.random() * 100) + 20,
      responseTime: Math.floor(Math.random() * 400) + 100,
      errors,
      profiles: ["urn:mpeg:dash:profile:isoff-live:2011"],
      minBufferTime: "PT2.00S",
      timestamp: new Date().toISOString(),
    };
  }

  private mockResponseTime(url: string): StreamResponseTime {
    return {
      url,
      dnsTime: Math.floor(Math.random() * 20) + 5,
      connectTime: Math.floor(Math.random() * 50) + 20,
      tlsTime: Math.floor(Math.random() * 80) + 40,
      firstByteTime: Math.floor(Math.random() * 100) + 30,
      totalTime: Math.floor(Math.random() * 300) + 100,
      timestamp: new Date().toISOString(),
    };
  }

  private mockPlaylistParse(url: string): PlaylistData {
    const segments: PlaylistSegment[] = Array.from({ length: 20 }, (_, i) => ({
      duration: 6,
      uri: `segment-${i}.ts`,
      title: "",
    }));

    const parsed: ParsedPlaylist = {
      version: 7,
      type: "VOD",
      targetDuration: 6,
      mediaSequence: 0,
      segments,
      endList: true,
    };

    const raw = `#EXTM3U\n#EXT-X-VERSION:7\n#EXT-X-TARGETDURATION:6\n#EXT-X-MEDIA-SEQUENCE:0\n${segments.map((s) => `#EXTINF:${s.duration},\n${s.uri}`).join("\n")}\n#EXT-X-ENDLIST`;

    return { url, raw, parsed, timestamp: new Date().toISOString() };
  }
}

export const ottService = new OttService();
