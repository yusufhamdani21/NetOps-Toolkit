import { describe, it, expect } from "vitest";
import { NetworkService } from "./networkService";

describe("NetworkService", () => {
  const service = new NetworkService();

  it("should ping and return mock result", async () => {
    const result = await service.ping("example.com");
    expect(result.host).toBe("example.com");
    expect(result.packetsSent).toBe(4);
    expect(result.packetLoss).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  it("should traceroute and return hops", async () => {
    const result = await service.traceroute("example.com");
    expect(result.target).toBe("example.com");
    expect(result.hops.length).toBeGreaterThan(0);
    expect(result.timestamp).toBeDefined();
  });

  it("should do DNS lookup and return answers", async () => {
    const result = await service.dnsLookup("example.com", "A");
    expect(result.domain).toBe("example.com");
    expect(result.answers.length).toBeGreaterThan(0);
    expect(result.recordType).toBe("A");
  });

  it("should do reverse DNS", async () => {
    const result = await service.reverseDns("8.8.8.8");
    expect(result.ip).toBe("8.8.8.8");
    expect(result.hostname).toBeTruthy();
  });

  it("should check HTTP status", async () => {
    const result = await service.httpStatus("https://example.com");
    expect(result.url).toBe("https://example.com");
    expect(result.statusCode).toBeGreaterThanOrEqual(200);
  });

  it("should check certificate", async () => {
    const result = await service.certCheck("example.com");
    expect(result.hostname).toBe("example.com");
    expect(result.valid).toBe(true);
    expect(result.daysRemaining).toBeGreaterThan(0);
  });
});
