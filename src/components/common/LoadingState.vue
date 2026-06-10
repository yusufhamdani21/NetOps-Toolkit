<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <div class="relative mb-4">
      <svg class="w-10 h-10 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" class="text-surface-700" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="text-primary-400" />
      </svg>
    </div>
    <p class="text-sm text-surface-400">{{ text || "Loading..." }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ text?: string }>();
</script>
