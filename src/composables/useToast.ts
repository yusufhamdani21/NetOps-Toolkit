import { useToastStore } from "@/stores/toast";
import type { Toast } from "@/stores/toast";

export function useToast() {
  const store = useToastStore();

  function success(title: string, message = "") {
    store.add({ type: "success", title, message });
  }

  function error(title: string, message = "") {
    store.add({ type: "error", title, message, duration: 6000 });
  }

  function warning(title: string, message = "") {
    store.add({ type: "warning", title, message, duration: 5000 });
  }

  function info(title: string, message = "") {
    store.add({ type: "info", title, message });
  }

  return { ...store, success, error, warning, info };
}
