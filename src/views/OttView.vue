<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-surface-100">OTT Streaming</h2>
      <p class="text-sm text-surface-400 mt-1">HLS/DASH validation, segment analysis, and stream diagnostics</p>
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

      <div class="flex gap-3">
        <input
          v-model="url"
          type="url"
          class="input flex-1"
          placeholder="https://example.com/live.m3u8"
          @keyup.enter="run"
        />
        <button class="btn-primary" :disabled="loading || !url" @click="run">
          <IconTerminal v-if="!loading" class="w-4 h-4" />
          <IconRefreshCw v-else class="w-4 h-4 animate-spin" />
          {{ loading ? "Analyzing..." : "Analyze" }}
        </button>
      </div>
    </div>

    <LoadingState v-if="loading && !result" text="Analyzing stream..." />

    <template v-if="result && !loading">
      <div class="card p-5 animate-fade-in">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-surface-100 capitalize">{{ activeTool === 'validate-hls' ? 'HLS Validation' : activeTool === 'validate-dash' ? 'DASH Validation' : 'Analysis' }} Results</h3>
          <div class="flex gap-2">
            <button class="btn-secondary text-xs" @click="exportResult('txt')">
              <IconDownload class="w-3.5 h-3.5" /> TXT
            </button>
            <button class="btn-secondary text-xs" @click="exportResult('json')">
              <IconDownload class="w-3.5 h-3.5" /> JSON
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div v-if="result.httpStatus !== undefined" class="flex items-center gap-3">
            <span class="text-sm text-surface-400">HTTP Status:</span>
            <span class="badge" :class="result.httpStatus === 200 ? 'badge-green' : 'badge-red'">
              {{ result.httpStatus }}
            </span>
          </div>

          <div v-if="result.manifestValid !== undefined" class="flex items-center gap-3">
            <span class="text-sm text-surface-400">Manifest:</span>
            <span class="badge" :class="result.manifestValid ? 'badge-green' : 'badge-red'">
              {{ result.manifestValid ? "Valid" : "Invalid" }}
            </span>
          </div>

          <div v-if="result.segmentCount !== undefined" class="flex items-center gap-3">
            <span class="text-sm text-surface-400">Segments:</span>
            <span class="text-sm font-medium text-surface-200">{{ result.segmentCount }}</span>
          </div>

          <div v-if="result.responseTime !== undefined" class="flex items-center gap-3">
            <span class="text-sm text-surface-400">Response Time:</span>
            <span class="text-sm font-medium text-surface-200">{{ result.responseTime }}ms</span>
          </div>

          <div v-if="result.errors && (result.errors as string[]).length > 0" class="mt-4">
            <h4 class="text-sm font-medium text-danger-400 mb-2">Errors ({{ (result.errors as string[]).length }})</h4>
            <ul class="space-y-1">
              <li v-for="(err, i) in (result.errors as string[])" :key="i" class="text-sm text-danger-300 flex items-start gap-2">
                <span class="mt-1 w-1.5 h-1.5 rounded-full bg-danger-500 shrink-0" />
                {{ err }}
              </li>
            </ul>
          </div>

          <div v-if="result.errors && (result.errors as string[]).length === 0 && result.manifestValid" class="mt-4 p-3 rounded-lg bg-accent-500/10 border border-accent-500/20">
            <p class="text-sm text-accent-400 flex items-center gap-2">
              <IconCheckCircle class="w-4 h-4" />
              No issues detected
            </p>
          </div>

          <div class="mt-4">
            <pre class="output-block text-surface-300">{{ exportService.formatAsText(result) }}</pre>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ottService } from "@/services/ottService";
import { exportService } from "@/services/exportService";
import { useToast } from "@/composables/useToast";
import { useLogger } from "@/composables/useLogger";
import type { ExportFormat } from "@/types";
import LoadingState from "@/components/common/LoadingState.vue";
import { IconTerminal, IconRefreshCw, IconDownload, IconCheckCircle } from "@/utils/icons";

const logger = useLogger("OTT");
const toast = useToast();

const tools = [
  { id: "validate-hls", label: "Validate HLS" },
  { id: "validate-dash", label: "Validate DASH" },
  { id: "check-segment", label: "Check Segment" },
  { id: "response-time", label: "Response Time" },
  { id: "latency", label: "Latency Estimate" },
  { id: "parse", label: "Parse Playlist" },
];

const activeTool = ref("validate-hls");
const url = ref("");
const loading = ref(false);
const result = ref<Record<string, unknown> | null>(null);

watch(activeTool, () => {
  result.value = null;
  url.value = "";
});

async function run() {
  if (!url.value) return;
  loading.value = true;
  result.value = null;

  try {
    switch (activeTool.value) {
      case "validate-hls":
        result.value = await ottService.validateHls(url.value) as unknown as Record<string, unknown>;
        break;
      case "validate-dash":
        result.value = await ottService.validateDash(url.value) as unknown as Record<string, unknown>;
        break;
      case "check-segment":
        result.value = await ottService.checkSegment(url.value) as unknown as Record<string, unknown>;
        break;
      case "response-time":
        result.value = await ottService.measureResponseTime(url.value) as unknown as Record<string, unknown>;
        break;
      case "latency":
        result.value = await ottService.estimateLatency(url.value) as unknown as Record<string, unknown>;
        break;
      case "parse":
        result.value = await ottService.parsePlaylist(url.value) as unknown as Record<string, unknown>;
        break;
    }
    logger.info(`${activeTool.value} completed for ${url.value}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    toast.error("Analysis Failed", message);
    logger.error(`${activeTool.value} failed`, err);
    result.value = { error: message, timestamp: new Date().toISOString() };
  } finally {
    loading.value = false;
  }
}

async function exportResult(format: ExportFormat) {
  if (!result.value) return;
  try {
    await exportService.exportToFile(result.value, `ott-${activeTool.value}`, format);
    toast.success("Exported successfully", `Saved as ${format.toUpperCase()}`);
  } catch (err) {
    toast.error("Export failed", String(err));
  }
}
</script>
