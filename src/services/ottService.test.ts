import { describe, it, expect } from "vitest";
import { OttService } from "./ottService";

describe("OttService", () => {
  const service = new OttService();

  it("should validate HLS playlist", async () => {
    const result = await service.validateHls("https://example.com/live.m3u8");
    expect(result.url).toBe("https://example.com/live.m3u8");
    expect(result.httpStatus).toBe(200);
    expect(result.segmentCount).toBeGreaterThan(0);
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it("should validate DASH manifest", async () => {
    const result = await service.validateDash("https://example.com/manifest.mpd");
    expect(result.url).toBe("https://example.com/manifest.mpd");
    expect(result.segmentCount).toBeGreaterThan(0);
  });

  it("should check segment availability", async () => {
    const result = await service.checkSegment("https://example.com/segment.ts");
    expect(result.url).toBe("https://example.com/segment.ts");
    expect(result.statusCode).toBe(200);
  });

  it("should measure response time", async () => {
    const result = await service.measureResponseTime("https://example.com/live.m3u8");
    expect(result.url).toBe("https://example.com/live.m3u8");
    expect(result.totalTime).toBeGreaterThan(0);
  });

  it("should estimate latency", async () => {
    const result = await service.estimateLatency("https://example.com/live.m3u8");
    expect(result.url).toBe("https://example.com/live.m3u8");
    expect(result.estimatedLatency).toBeGreaterThan(0);
  });

  it("should parse playlist", async () => {
    const result = await service.parsePlaylist("https://example.com/live.m3u8");
    expect(result.url).toBe("https://example.com/live.m3u8");
    expect(result.parsed).toBeDefined();
    expect(result.parsed.segments.length).toBeGreaterThan(0);
  });
});
