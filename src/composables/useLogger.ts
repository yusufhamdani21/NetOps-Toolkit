import { useLoggerStore } from "@/stores/logger";

export function useLogger(module: string) {
  const store = useLoggerStore();

  return {
    debug: (message: string, data?: unknown) => store.debug(module, message, data),
    info: (message: string, data?: unknown) => store.info(module, message, data),
    warn: (message: string, data?: unknown) => store.warn(module, message, data),
    error: (message: string, data?: unknown) => store.error(module, message, data),
    logs: store.logs,
    getByModule: store.getByModule,
    getByLevel: store.getByLevel,
    clear: store.clear,
  };
}
