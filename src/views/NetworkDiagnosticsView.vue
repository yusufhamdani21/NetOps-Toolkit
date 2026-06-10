<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-surface-100">Network Diagnostics</h2>
      <p class="text-sm text-surface-400 mt-1">Ping, traceroute, DNS, WHOIS, and more</p>
    </div>

    <div class="card p-5">
      <div class="flex flex-wrap gap-3 mb-4">
        <button
          v-for="tool in tools"
          :key="tool.id"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          :class="activeTool === tool.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-surface-800 text-surface-300 hover:text-surface-100 hover:bg-surface-700 border border-surface-700'"
          @click="activeTool = tool.id"
        >
          {{ tool.label }}
        </button>
      </div>

      <div class="flex gap-3 mb-4">
        <input
          v-model="target"
          type="text"
          class="input flex-1"
          :placeholder="placeholder"
          @keyup.enter="run"
        />
        <button class="btn-primary" :disabled="loading || !target" @click="run">
          <IconTerminal v-if="!loading" class="w-4 h-4" />
          <IconRefreshCw v-else class="w-4 h-4 animate-spin" />
          {{ loading ? "Running..." : "Run" }}
        </button>
      </div>

      <div v-if="activeTool === 'dns' && target" class="mb-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="type in dnsTypes"
            :key="type"
            class="px-3 py-1 text-xs rounded-md font-medium transition-all"
            :class="dnsType === type ? 'bg-accent-600/30 text-accent-400 border border-accent-500/30' : 'bg-surface-800 text-surface-400 hover:text-surface-200 border border-surface-700'"
            @click="dnsType = type; run()"
          >
            {{ type }}
          </button>
        </div>
      </div>
    </div>

    <LoadingState v-if="loading && !result" text="Running diagnostic..." />

    <div v-if="result && !loading" class="space-y-4 animate-fade-in">
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-surface-100 capitalize">{{ activeTool }} Results</h3>
          <div class="flex gap-2">
            <button class="btn-secondary text-xs" @click="exportResult('txt')">
              <IconDownload class="w-3.5 h-3.5" /> TXT
            </button>
            <button class="btn-secondary text-xs" @click="exportResult('json')">
              <IconDownload class="w-3.5 h-3.5" /> JSON
            </button>
          </div>
        </div>

        <pre class="output-block text-surface-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">{{ formattedOutput }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { networkService } from "@/services/networkService";
import { exportService } from "@/services/exportService";
import { useToast } from "@/composables/useToast";
import { useLogger } from "@/composables/useLogger";
import type { ExportFormat } from "@/types";
import LoadingState from "@/components/common/LoadingState.vue";
import { IconTerminal, IconRefreshCw, IconDownload } from "@/utils/icons";

const logger = useLogger("NetworkDiagnostics");
const toast = useToast();

const tools = [
  { id: "ping", label: "Ping" },
  { id: "traceroute", label: "Traceroute" },
  { id: "mtr", label: "MTR" },
  { id: "dns", label: "DNS Lookup" },
  { id: "reverse-dns", label: "Reverse DNS" },
  { id: "whois", label: "WHOIS" },
  { id: "http-status", label: "HTTP Status" },
  { id: "cert", label: "SSL Certificate" },
];

const dnsTypes = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA"];
const activeTool = ref("ping");
const target = ref("");
const dnsType = ref("A");
const loading = ref(false);
const result = ref<unknown>(null);

const placeholder = computed(() => {
  switch (activeTool.value) {
    case "ping": return "example.com or 8.8.8.8";
    case "traceroute": return "example.com";
    case "mtr": return "example.com";
    case "dns": return "example.com";
    case "reverse-dns": return "8.8.8.8";
    case "whois": return "example.com or IP";
    case "http-status": return "https://example.com";
    case "cert": return "example.com";
    default: return "Enter target";
  }
});

const formattedOutput = computed(() => {
  if (!result.value) return "";
  return exportService.formatAsText(result.value);
});

watch(activeTool, () => {
  result.value = null;
  target.value = "";
});

async function run() {
  if (!target.value) return;
  loading.value = true;
  result.value = null;

  try {
    switch (activeTool.value) {
      case "ping":
        result.value = await networkService.ping(target.value);
        break;
      case "traceroute":
        result.value = await networkService.traceroute(target.value);
        break;
      case "mtr":
        result.value = await networkService.mtr(target.value);
        break;
      case "dns":
        result.value = await networkService.dnsLookup(target.value, dnsType.value);
        break;
      case "reverse-dns":
        result.value = await networkService.reverseDns(target.value);
        break;
      case "whois":
        result.value = await networkService.whois(target.value);
        break;
      case "http-status":
        result.value = await networkService.httpStatus(target.value);
        break;
      case "cert":
        result.value = await networkService.certCheck(target.value);
        break;
    }
    logger.info(`${activeTool.value} completed for ${target.value}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Diagnostic failed";
    toast.error("Diagnostic Failed", message);
    logger.error(`${activeTool.value} failed`, err);
    result.value = { error: message, timestamp: new Date().toISOString() };
  } finally {
    loading.value = false;
  }
}

async function exportResult(format: ExportFormat) {
  if (!result.value) return;
  try {
    await exportService.exportToFile(result.value, `network-${activeTool.value}-${target.value}`, format);
    toast.success("Exported successfully", `Saved as ${format.toUpperCase()}`);
  } catch (err) {
    toast.error("Export failed", String(err));
  }
}
</script>
