import { describe, it, expect } from "vitest";
import { ExportService } from "./exportService";

describe("ExportService", () => {
  const service = new ExportService();

  it("should format data as text", () => {
    const data = { name: "Test", value: 42, active: true };
    const text = service.formatAsText(data);
    expect(text).toContain("Name: Test");
    expect(text).toContain("Value: 42");
    expect(text).toContain("Active: true");
  });

  it("should handle nested objects in text format", () => {
    const data = { metadata: { version: "1.0" } };
    const text = service.formatAsText(data);
    expect(text).toContain("Metadata:");
    expect(text).toContain('"version": "1.0"');
  });

  it("should handle string input for text format", () => {
    const text = service.formatAsText("plain string");
    expect(text).toBe("plain string");
  });

  it("should handle null/undefined values in text format", () => {
    const data = { key: null };
    const text = service.formatAsText(data);
    expect(text).toContain("Key: N/A");
  });
});
