<template>
  <header class="h-16 border-b border-surface-800 flex items-center justify-between px-4 lg:px-6 bg-surface-900/80 backdrop-blur-md sticky top-0 z-30">
    <div class="flex items-center gap-3">
      <button @click="emit('toggleSidebar')" class="btn-ghost lg:hidden">
        <span class="w-5 h-5" />
      </button>
      <h1 class="text-lg font-semibold text-surface-100">{{ pageTitle }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <button @click="openCommandPalette" class="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-surface-500 bg-surface-800 border border-surface-700 rounded-lg hover:text-surface-300 transition-colors">
        <IconSearch class="w-3.5 h-3.5" />
        <span>Search...</span>
        <kbd class="text-surface-600 bg-surface-850 px-1 rounded text-[10px] font-mono">Ctrl+K</kbd>
      </button>

      <button @click="themeStore.toggle()" class="btn-ghost" :title="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
        <IconSun v-if="themeStore.isDark" class="w-4 h-4" />
        <IconMoon v-else class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useThemeStore } from "@/stores/theme";
import { IconSearch, IconSun, IconMoon } from "@/utils/icons";

const route = useRoute();
const themeStore = useThemeStore();

const emit = defineEmits<{ toggleSidebar: []; openCommandPalette: [] }>();

const pageTitle = computed(() => (route.meta?.title as string) || "NetOps Toolkit");

function openCommandPalette() {
  emit("openCommandPalette");
}
</script>
