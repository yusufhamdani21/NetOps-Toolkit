import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const isDark = ref(true);

  function init() {
    const stored = localStorage.getItem("netops-theme");
    if (stored === "light") {
      isDark.value = false;
    } else {
      isDark.value = true;
    }
    applyTheme();
  }

  function toggle() {
    isDark.value = !isDark.value;
    localStorage.setItem("netops-theme", isDark.value ? "dark" : "light");
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.classList.toggle("dark", isDark.value);
    document.documentElement.classList.toggle("light", !isDark.value);
  }

  watch(isDark, applyTheme);

  return { isDark, init, toggle };
});
