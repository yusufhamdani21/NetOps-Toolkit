<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-surface-100">CDN Inspector</h2>
      <p class="text-sm text-surface-400 mt-1">DNS resolution, edge node inspection, and cache status</p>
    </div>

    <div class="card p-5">
      <div class="flex gap-3">
        <input
          v-model="url"
          type="url"
          class="input flex-1"
          placeholder="https://cdn.example.com/file.js"
          @keyup.enter="inspect"
        />
        <button class="btn-primary" :disabled="loading || !url" @click="inspect">
          <IconGlobe v-if="!loading" class="w-4 h-4" />
          <IconRefreshCw v-else class="w-4 h-4 animate-spin" />
          {{ loading ? "Inspecting..." : "Inspect" }}
        </button>
      </div>
    </div>

    <LoadingState v-if="loading" text="Inspecting CDN edge..." />

    <template v-if="result && !loading">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
        <div class="card p-5 lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-surface-100">CDN Analysis</h3>
            <div class="flex gap-2">
              <button class="btn-secondary text-xs" @click="exportResult('txt')">
                <IconDownload class="w-3.5 h-3.5" /> TXT
              </button>
              <button class="btn-secondary text-xs" @click="exportResult('json')">
                <IconDownload class="w-3.5 h-3.5" /> JSON
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-surface-800">
              <span class="text-sm text-surface-400">CDN Vendor</span>
              <span v-if="result.cdnVendor" class="badge-blue">{{ result.cdnVendor }}</span>
              <span v-else class="text-sm text-surface-500">Unknown / Direct Origin</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-surface-800">
              <span class="text-sm text-surface-400">Resolved IP</span>
              <span class="text-sm font-mono text-surface-200">{{ result.resolvedIp }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-surface-800">
              <span class="text-sm text-surface-400">Server</span>
              <span class="text-sm font-mono text-surface-200">{{ result.server }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-surface-800">
              <span class="text-sm text-surface-400">Via</span>
              <span class="text-sm font-mono text-surface-200">{{ result.via || "N/A" }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-surface-800">
              <span class="text-sm text-surface-400">Cache-Control</span>
              <span class="text-sm text-surface-200">{{ result.cacheControl }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-surface-800">
              <span class="text-sm text-surface-400">Age</span>
              <span class="text-sm text-surface-200">{{ result.age }}s</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-surface-400">X-Cache</span>
              <span class="badge" :class="result.xCache === 'HIT' ? 'badge-green' : 'badge-yellow'">
                {{ result.xCache }}
              </span>
            </div>
          </div>
        </div>

        <div class="card p-5">
          <h3 class="text-base font-semibold text-surface-100 mb-4">Cache Status</h3>
          <div class="flex flex-col items-center justify-center py-6">
            <div
              class="w-20 h-20 rounded-full flex items-center justify-center mb-3"
              :class="result.xCache === 'HIT' ? 'bg-accent-500/10' : 'bg-warning-500/10'"
            >
              <IconCheckCircle v-if="result.xCache === 'HIT'" class="w-8 h-8 text-accent-400" />
              <IconAlertTriangle v-else class="w-8 h-8 text-warning-400" />
            </div>
            <span class="text-sm font-semibold" :class="result.xCache === 'HIT' ? 'text-accent-400' : 'text-warning-400'">
              {{ result.xCache === 'HIT' ? 'Cache HIT' : 'Cache MISS' }}
            </span>
            <span class="text-xs text-surface-500 mt-1">
              {{ result.cdnVendor ? `${result.cdnVendor} edge` : "Origin server" }}
            </span>
          </div>
        </div>
      </div>

      <div class="card p-5 animate-fade-in">
        <h3 class="text-base font-semibold text-surface-100 mb-4">Response Headers</h3>
        <div class="space-y-1">
          <div v-for="(value, key) in result.responseHeaders" :key="key" class="flex gap-4 py-1.5 text-sm border-b border-surface-800/50 last:border-0">
            <span class="text-surface-400 font-mono min-w-[200px]">{{ key }}:</span>
            <span class="text-surface-200 font-mono break-all">{{ value }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { cdnService } from "@/services/cdnService";
import { exportService } from "@/services/exportService";
import { useToast } from "@/composables/useToast";
import { useLogger } from "@/composables/useLogger";
import type { CdnInspectionResult, ExportFormat } from "@/types";
import LoadingState from "@/components/common/LoadingState.vue";
import { IconGlobe, IconRefreshCw, IconDownload, IconCheckCircle, IconAlertTriangle } from "@/utils/icons";

const logger = useLogger("CDN");
const toast = useToast();

const url = ref("");
const loading = ref(false);
const result = ref<CdnInspectionResult | null>(null);

async function inspect() {
  if (!url.value) return;
  loading.value = true;
  result.value = null;

  try {
    result.value = await cdnService.inspect(url.value);
    logger.info(`CDN inspect completed for ${url.value}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "CDN inspection failed";
    toast.error("Inspection Failed", message);
    logger.error("CDN inspect failed", err);
  } finally {
    loading.value = false;
  }
}

async function exportResult(format: ExportFormat) {
  if (!result.value) return;
  try {
    await exportService.exportToFile(result.value, `cdn-${new Date().getTime()}`, format);
    toast.success("Exported successfully", `Saved as ${format.toUpperCase()}`);
  } catch (err) {
    toast.error("Export failed", String(err));
  }
}
</script>
