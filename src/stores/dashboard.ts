import { defineStore } from "pinia";
import { ref } from "vue";
import type { DashboardData } from "@/types";

export const useDashboardStore = defineStore("dashboard", () => {
  const data = ref<DashboardData>({
    localIp: "192.168.1.100",
    publicIp: "203.0.113.42",
    dnsServer: "8.8.8.8",
    networkStatus: "online",
    currentLatency: 12,
    packetLoss: 0,
    lastDiagnosticRun: null,
    quickHealth: "healthy",
  });

  const loading = ref(false);

  async function refresh() {
    loading.value = true;
    try {
      if (window.__TAURI_INTERNALS__) {
        const { invoke } = await import("@tauri-apps/api/core");
        const result = await invoke<DashboardData>("get_dashboard_info");
        Object.assign(data.value, result);
      } else {
        const mockData: DashboardData = {
          localIp: "192.168.1.100",
          publicIp: "203.0.113.42",
          dnsServer: "8.8.8.8",
          networkStatus: "online",
          currentLatency: Math.floor(Math.random() * 30) + 5,
          packetLoss: Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0,
          lastDiagnosticRun: new Date().toISOString(),
          quickHealth: "healthy",
        };
        Object.assign(data.value, mockData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard info:", error);
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, refresh };
});
