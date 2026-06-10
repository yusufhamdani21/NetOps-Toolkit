import { defineStore } from "pinia";
import { ref } from "vue";
import type { DeviceTest } from "@/types";

export const useDeviceTestStore = defineStore("deviceTests", () => {
  const tests = ref<DeviceTest[]>([]);

  function load() {
    try {
      const stored = localStorage.getItem("netops-device-tests");
      if (stored) tests.value = JSON.parse(stored);
    } catch {
      tests.value = [];
    }
  }

  function save(test: DeviceTest) {
    const idx = tests.value.findIndex((t) => t.id === test.id);
    if (idx >= 0) {
      tests.value[idx] = test;
    } else {
      tests.value.push(test);
    }
    persist();
  }

  function remove(id: string) {
    tests.value = tests.value.filter((t) => t.id !== id);
    persist();
  }

  function persist() {
    localStorage.setItem("netops-device-tests", JSON.stringify(tests.value));
  }

  load();

  return { tests, save, remove, load };
});
