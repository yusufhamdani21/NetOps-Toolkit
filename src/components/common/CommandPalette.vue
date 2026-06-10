<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh]" @click.self="close">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="close" />
        <div class="relative w-full max-w-xl mx-4 card p-0 shadow-2xl overflow-hidden animate-fade-in border-surface-700">
          <div class="flex items-center gap-3 px-4 py-3 border-b border-surface-800">
            <IconSearch class="w-5 h-5 text-surface-400 shrink-0" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="Search commands..."
              class="flex-1 bg-transparent text-surface-100 placeholder-surface-500 outline-none text-sm"
              @keydown="handleKeydown"
            />
            <kbd class="hidden sm:inline-flex text-xs text-surface-500 bg-surface-800 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>
          <div class="max-h-80 overflow-y-auto p-2">
            <div v-if="filteredResults.length === 0" class="text-center py-8 text-surface-500 text-sm">
              No results found
            </div>
            <button
              v-for="(result, idx) in filteredResults"
              :key="result.to"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              :class="{
                'bg-primary-600/20 text-primary-300': idx === selectedIndex,
                'text-surface-300 hover:bg-surface-800 hover:text-surface-100': idx !== selectedIndex,
              }"
              @click="navigate(result.to)"
              @mouseenter="selectedIndex = idx"
            >
              <component :is="result.icon" class="w-4 h-4 shrink-0" />
              <span class="flex-1 text-left">{{ result.title }}</span>
              <kbd class="text-xs text-surface-500 bg-surface-800 px-1.5 py-0.5 rounded font-mono">{{ result.shortcut }}</kbd>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isOpen = ref(false);
const query = ref("");
const selectedIndex = ref(0);
const inputRef = ref<HTMLInputElement>();

const routes = computed(() =>
  router.getRoutes().filter((r) => r.meta?.title).map((r) => ({
    to: r.path,
    title: r.meta?.title as string,
    icon: "span",
    shortcut: "",
  })),
);

const filteredResults = computed(() => {
  if (!query.value) return routes.value;
  const q = query.value.toLowerCase();
  return routes.value.filter((r) => r.title.toLowerCase().includes(q));
});

function open() {
  isOpen.value = true;
  query.value = "";
  selectedIndex.value = 0;
  nextTick(() => inputRef.value?.focus());
}

function close() {
  isOpen.value = false;
}

function navigate(to: string) {
  router.push(to);
  close();
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    close();
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % filteredResults.value.length;
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value - 1 + filteredResults.value.length) % filteredResults.value.length;
    return;
  }
  if (e.key === "Enter" && filteredResults.value[selectedIndex.value]) {
    navigate(filteredResults.value[selectedIndex.value].to);
    return;
  }
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (isOpen.value) close();
    else open();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("keydown", onKeydown);
}

defineExpose({ open, close });
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
