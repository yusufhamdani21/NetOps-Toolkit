import type { ExportFormat } from "@/types";

export class ExportService {
  async exportToFile(data: unknown, filename: string, format: ExportFormat): Promise<void> {
    switch (format) {
      case "txt":
        return this.exportTxt(data, filename);
      case "json":
        return this.exportJson(data, filename);
      case "pdf":
        return this.exportPdf(data, filename);
    }
  }

  private async exportTxt(data: unknown, filename: string): Promise<void> {
    const content = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: "text/plain" });
    await this.downloadBlob(blob, `${filename}.txt`);
  }

  private async exportJson(data: unknown, filename: string): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    await this.downloadBlob(blob, `${filename}.json`);
  }

  private async exportPdf(data: unknown, filename: string): Promise<void> {
    const content =
      typeof data === "string"
        ? data
        : Object.entries(data as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");

    const htmlContent = `
      <html>
        <head><style>body { font-family: sans-serif; padding: 2em; }</style></head>
        <body><pre>${content}</pre></body>
      </html>
    `;

    if (window.__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("export_pdf", { html: htmlContent, filename });
        return;
      } catch {
        // fallback to download
      }
    }

    const blob = new Blob([htmlContent], { type: "text/html" });
    await this.downloadBlob(blob, `${filename}.html`);
  }

  formatAsText(data: unknown): string {
    if (typeof data === "string") return data;

    const obj = data as Record<string, unknown>;
    const lines: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
      if (value && typeof value === "object") {
        lines.push(`${label}:`);
        lines.push(`  ${JSON.stringify(value, null, 2)}`);
      } else {
        lines.push(`${label}: ${value ?? "N/A"}`);
      }
    }
    return lines.join("\n");
  }

  private async downloadBlob(blob: Blob, filename: string): Promise<void> {
    if (window.__TAURI_INTERNALS__) {
      try {
        const { writeFile } = await import("@tauri-apps/plugin-fs");
        const { save } = await import("@tauri-apps/plugin-dialog");
        const buffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        const path = await save({ defaultPath: filename });
        if (path) await writeFile(path, uint8);
        return;
      } catch {
        // fallback
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
