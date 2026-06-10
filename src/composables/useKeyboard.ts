import { onMounted, onUnmounted } from "vue";

type KeyHandler = (e: KeyboardEvent) => void;

const handlers = new Map<string, KeyHandler[]>();

function handleKeyDown(e: KeyboardEvent) {
  const key = [
    e.ctrlKey || e.metaKey ? "Ctrl" : "",
    e.altKey ? "Alt" : "",
    e.shiftKey ? "Shift" : "",
    e.key.toUpperCase(),
  ]
    .filter(Boolean)
    .join("+");

  const h = handlers.get(key);
  if (h) h.forEach((fn) => fn(e));
}

export function useKeyboard(key: string, handler: KeyHandler) {
  const normalizedKey = key
    .replace(/Cmd|Meta/gi, "Ctrl")
    .split("+")
    .map((s) => s.trim())
    .filter(Boolean)
    .join("+");

  onMounted(() => {
    if (handlers.size === 0) {
      window.addEventListener("keydown", handleKeyDown);
    }
    const existing = handlers.get(normalizedKey) || [];
    existing.push(handler);
    handlers.set(normalizedKey, existing);
  });

  onUnmounted(() => {
    const existing = handlers.get(normalizedKey) || [];
    handlers.set(
      normalizedKey,
      existing.filter((h) => h !== handler),
    );
    if (handlers.size === 0) {
      window.removeEventListener("keydown", handleKeyDown);
    }
  });
}
