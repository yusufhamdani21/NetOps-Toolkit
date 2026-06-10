<template>
  <ErrorBoundary>
    <AppLayout />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useTheme } from "@/composables/useTheme";
import AppLayout from "@/components/layout/AppLayout.vue";
import ErrorBoundary from "@/components/common/ErrorBoundary.vue";

const { init } = useTheme();

onMounted(() => {
  init();
});
</script>
