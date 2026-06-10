<template>
  <aside
    class="fixed left-0 top-0 h-full w-60 bg-surface-900 border-r border-surface-800 flex flex-col z-40 transition-all duration-300"
    :class="collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0'"
  >
    <div class="flex items-center gap-3 px-4 h-16 border-b border-surface-800 shrink-0">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
        N
      </div>
      <transition name="fade">
        <span v-if="!collapsed" class="font-semibold text-sm text-surface-100 whitespace-nowrap">NetOps Toolkit</span>
      </transition>
    </div>

    <nav class="flex-1 overflow-y-auto p-2 space-y-1">
      <button
        v-for="item in navItems"
        :key="item.to"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
        :class="isActive(item.to) ? 'bg-primary-600/20 text-primary-300' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'"
        @click="navigate(item.to)"
      >
        <component :is="item.icon" class="w-5 h-5 shrink-0" />
        <transition name="fade">
          <span v-if="!collapsed" class="truncate">{{ item.title }}</span>
        </transition>
      </button>
    </nav>

    <div class="p-2 border-t border-surface-800">
      <button
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-all"
        @click="toggleCollapse"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
        <transition name="fade">
          <span v-if="!collapsed" class="truncate">Collapse</span>
        </transition>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useThemeStore } from "@/stores/theme";
import {
  IconLayoutDashboard,
  IconNetwork,
  IconVideo,
  IconGlobe,
  IconSmartphone,
  IconAlertTriangle,
  IconWrench,
} from "@/utils/icons";

const router = useRouter();
const route = useRoute();
const themeStore = useThemeStore();

const props = defineProps<{ collapsed: boolean }>();
const emit = defineEmits<{ toggleCollapse: [] }>();

const navItems = computed(() => [
  { to: "/", title: "Dashboard", icon: IconLayoutDashboard },
  { to: "/network", title: "Network Diagnostics", icon: IconNetwork },
  { to: "/ott", title: "OTT Streaming", icon: IconVideo },
  { to: "/cdn", title: "CDN Inspector", icon: IconGlobe },
  { to: "/device-testing", title: "Device Testing", icon: IconSmartphone },
  { to: "/incident-reports", title: "Incident Reports", icon: IconAlertTriangle },
  { to: "/utilities", title: "Utilities", icon: IconWrench },
]);

function isActive(path: string) {
  return route.path === path;
}

function navigate(to: string) {
  router.push(to);
}

function toggleCollapse() {
  emit("toggleCollapse");
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
