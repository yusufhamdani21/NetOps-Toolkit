<template>
  <span class="inline-flex items-center gap-1.5">
    <span
      class="inline-block w-2 h-2 rounded-full"
      :class="{
        'bg-accent-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]': status === 'healthy' || status === 'online',
        'bg-warning-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]': status === 'warning' || status === 'degraded',
        'bg-danger-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]': status === 'critical' || status === 'offline',
        'bg-surface-500': !status,
      }"
    />
    <span class="text-xs font-medium" :class="statusColor">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  status: string;
  label?: string;
}>();

const statusColor = computed(() => {
  switch (props.status) {
    case "healthy":
    case "online":
      return "text-accent-400";
    case "warning":
    case "degraded":
      return "text-warning-400";
    case "critical":
    case "offline":
      return "text-danger-400";
    default:
      return "text-surface-400";
  }
});
</script>
