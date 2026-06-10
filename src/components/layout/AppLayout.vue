<template>
  <div class="min-h-screen bg-surface-950">
    <AppSidebar :collapsed="sidebarCollapsed" @toggle-collapse="sidebarCollapsed = !sidebarCollapsed" />
    <AppHeader @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" @open-command-palette="openPalette" />
    <CommandPalette ref="paletteRef" />

    <main class="transition-all duration-300 pt-16" :class="sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'">
      <div class="p-4 lg:p-6">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";
import CommandPalette from "@/components/common/CommandPalette.vue";
import ToastContainer from "@/components/common/ToastContainer.vue";

const sidebarCollapsed = ref(false);
const paletteRef = ref<InstanceType<typeof CommandPalette>>();

function openPalette() {
  paletteRef.value?.open();
}
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
