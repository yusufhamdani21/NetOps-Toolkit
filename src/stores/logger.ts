import { defineStore } from "pinia";
import { ref } from "vue";
import type { LogEntry } from "@/types";

export const useLoggerStore = defineStore("logger", () => {
  const logs = ref<LogEntry[]>([]);
  const maxEntries = 1000;

  function log(level: LogEntry["level"], module: string, message: string, data?: unknown) {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };
    logs.value.unshift(entry);

    if (logs.value.length > maxEntries) {
      logs.value = logs.value.slice(0, maxEntries);
    }

    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("netops-logs") || "[]");
        stored.unshift(entry);
        localStorage.setItem("netops-logs", JSON.stringify(stored.slice(0, maxEntries)));
      } catch {
        // ignore storage errors
      }
    }

    if (level === "error") {
      console.error(`[${module}] ${message}`, data || "");
    } else if (level === "warn") {
      console.warn(`[${module}] ${message}`, data || "");
    } else {
      console.log(`[${module}] ${message}`, data || "");
    }
  }

  function debug(module: string, message: string, data?: unknown) {
    log("debug", module, message, data);
  }

  function info(module: string, message: string, data?: unknown) {
    log("info", module, message, data);
  }

  function warn(module: string, message: string, data?: unknown) {
    log("warn", module, message, data);
  }

  function error(module: string, message: string, data?: unknown) {
    log("error", module, message, data);
  }

  function clear() {
    logs.value = [];
    localStorage.removeItem("netops-logs");
  }

  function getByModule(module: string) {
    return logs.value.filter((l) => l.module === module);
  }

  function getByLevel(level: LogEntry["level"]) {
    return logs.value.filter((l) => l.level === level);
  }

  return { logs, log, debug, info, warn, error, clear, getByModule, getByLevel };
});
