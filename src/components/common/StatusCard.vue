<template>
  <div class="card p-5 animate-fade-in">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-medium uppercase tracking-wider text-surface-400">{{ title }}</span>
      <component :is="icon" v-if="icon" class="w-5 h-5 text-surface-500" />
    </div>
    <div class="flex items-end justify-between">
      <div>
        <p class="text-2xl font-semibold text-surface-100">{{ value }}</p>
        <p v-if="subtitle" class="text-xs text-surface-500 mt-1">{{ subtitle }}</p>
      </div>
      <div v-if="status">
        <StatusIndicator :status="status" :label="statusLabel" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import StatusIndicator from "./StatusIndicator.vue";

defineProps<{
  title: string;
  value: string;
  subtitle?: string;
  icon?: Component;
  status?: string;
  statusLabel?: string;
}>();
</script>
