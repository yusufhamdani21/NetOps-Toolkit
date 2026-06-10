import { defineStore } from "pinia";
import { ref } from "vue";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<Toast[]>([]);

  function add(toast: Omit<Toast, "id">) {
    const id = crypto.randomUUID();
    const t: Toast = { ...toast, id };
    toasts.value.push(t);

    const duration = toast.duration ?? 4000;
    setTimeout(() => remove(id), duration);
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, add, remove };
});
