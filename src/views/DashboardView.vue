<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-surface-100">Dashboard</h2>
        <p class="text-sm text-surface-400 mt-1">System overview and network health</p>
      </div>
      <button class="btn-primary" :disabled="loading" @click="refresh">
        <IconRefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        {{ loading ? "Refreshing..." : "Refresh" }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard title="Local IP" :value="data.localIp" :icon="IconServer" status="online" />
      <StatusCard title="Public IP" :value="data.publicIp" :icon="IconGlobe" status="online" />
      <StatusCard title="DNS Server" :value="data.dnsServer" :icon="IconNetwork" status="online" />
      <StatusCard
        title="Network Status"
        value="Connected"
        :status="data.networkStatus"
        :status-label="data.networkStatus === 'online' ? 'Online' : data.networkStatus === 'degraded' ? 'Degraded' : 'Offline'"
        :icon="IconWifi"
      />
      <StatusCard title="Latency" :value="`${data.currentLatency} ms`" :icon="IconActivity" :status="data.currentLatency < 30 ? 'healthy' : data.currentLatency < 100 ? 'warning' : 'critical'" />
      <StatusCard title="Packet Loss" :value="`${data.packetLoss}%`" :icon="IconAlertTriangle" :status="data.packetLoss === 0 ? 'healthy' : data.packetLoss < 5 ? 'warning' : 'critical'" />
      <StatusCard title="Last Diagnostic" :value="data.lastDiagnosticRun ? formatDate(data.lastDiagnosticRun) : 'Never'" :icon="IconClock" />
      <StatusCard
        title="Quick Health"
        value="All Systems Operational"
        :status="data.quickHealth"
        :status-label="data.quickHealth === 'healthy' ? 'Healthy' : data.quickHealth === 'warning' ? 'Warning' : 'Critical'"
        :icon="IconCheckCircle"
      />
    </div>

    <div class="card p-6">
      <h3 class="text-base font-semibold text-surface-100 mb-4">Quick Actions</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <router-link to="/network" class="flex items-center gap-3 p-3 rounded-lg bg-surface-850 border border-surface-800 hover:border-primary-500/50 hover:bg-surface-800 transition-all group">
          <IconTerminal class="w-5 h-5 text-surface-400 group-hover:text-primary-400" />
          <span class="text-sm font-medium text-surface-300 group-hover:text-surface-100">Diagnose Network</span>
        </router-link>
        <router-link to="/ott" class="flex items-center gap-3 p-3 rounded-lg bg-surface-850 border border-surface-800 hover:border-primary-500/50 hover:bg-surface-800 transition-all group">
          <IconVideo class="w-5 h-5 text-surface-400 group-hover:text-primary-400" />
          <span class="text-sm font-medium text-surface-300 group-hover:text-surface-100">Check Stream</span>
        </router-link>
        <router-link to="/cdn" class="flex items-center gap-3 p-3 rounded-lg bg-surface-850 border border-surface-800 hover:border-primary-500/50 hover:bg-surface-800 transition-all group">
          <IconGlobe class="w-5 h-5 text-surface-400 group-hover:text-primary-400" />
          <span class="text-sm font-medium text-surface-300 group-hover:text-surface-100">Inspect CDN</span>
        </router-link>
        <router-link to="/device-testing" class="flex items-center gap-3 p-3 rounded-lg bg-surface-850 border border-surface-800 hover:border-primary-500/50 hover:bg-surface-800 transition-all group">
          <IconSmartphone class="w-5 h-5 text-surface-400 group-hover:text-primary-400" />
          <span class="text-sm font-medium text-surface-300 group-hover:text-surface-100">Test Device</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useDashboardStore } from "@/stores/dashboard";
import { storeToRefs } from "pinia";
import StatusCard from "@/components/common/StatusCard.vue";
import {
  IconRefreshCw,
  IconServer,
  IconGlobe,
  IconNetwork,
  IconWifi,
  IconActivity,
  IconAlertTriangle,
  IconClock,
  IconCheckCircle,
  IconTerminal,
  IconVideo,
  IconSmartphone,
} from "@/utils/icons";

const store = useDashboardStore();
const { data, loading } = storeToRefs(store);
const { refresh } = store;

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

onMounted(() => {
  refresh();
});
</script>
