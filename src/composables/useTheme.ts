import { storeToRefs } from "pinia";
import { useThemeStore } from "@/stores/theme";

export function useTheme() {
  const store = useThemeStore();
  const { isDark } = storeToRefs(store);
  return { isDark, toggle: store.toggle, init: store.init };
}
