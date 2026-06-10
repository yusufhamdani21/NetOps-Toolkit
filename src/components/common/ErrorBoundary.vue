<template>
  <div v-if="hasError" class="flex flex-col items-center justify-center py-16 px-4">
    <div class="card p-8 max-w-md w-full text-center">
      <div class="w-12 h-12 rounded-full bg-danger-500/10 flex items-center justify-center mx-auto mb-4">
        <IconAlertTriangle class="w-6 h-6 text-danger-400" />
      </div>
      <h3 class="text-lg font-semibold text-surface-100 mb-2">Something went wrong</h3>
      <p class="text-sm text-surface-400 mb-6">{{ errorMessage }}</p>
      <button @click="retry" class="btn-primary">
        <IconRefreshCw class="w-4 h-4" />
        Try Again
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";

const hasError = ref(false);
const errorMessage = ref("");

onErrorCaptured((err) => {
  hasError.value = true;
  errorMessage.value = err instanceof Error ? err.message : "An unexpected error occurred";
  return false;
});

function retry() {
  hasError.value = false;
  errorMessage.value = "";
}
</script>
