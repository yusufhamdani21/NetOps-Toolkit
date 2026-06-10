<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <transition-group name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="pointer-events-auto card p-4 flex items-start gap-3 animate-fade-in shadow-2xl border-l-4"
          :class="borderClass(toast.type)"
        >
          <div class="mt-0.5">
            <IconAlertCircle v-if="toast.type === 'error'" class="w-5 h-5 text-danger-400" />
            <IconCheckCircle v-else-if="toast.type === 'success'" class="w-5 h-5 text-accent-400" />
            <IconAlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-warning-400" />
            <IconInfo v-else class="w-5 h-5 text-primary-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-100">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-xs text-surface-400 mt-0.5">{{ toast.message }}</p>
          </div>
          <button @click="toastStore.remove(toast.id)" class="btn-ghost p-0.5 -m-1">
            <IconX class="w-4 h-4" />
          </button>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import type { Toast } from "@/stores/toast";

const toastStore = useToastStore();

function borderClass(type: Toast["type"]) {
  switch (type) {
    case "success": return "border-l-accent-500";
    case "error": return "border-l-danger-500";
    case "warning": return "border-l-warning-500";
    case "info": return "border-l-primary-500";
    default: return "border-l-surface-500";
  }
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(24px); }
.toast-leave-to { opacity: 0; transform: translateX(24px); }
</style>
