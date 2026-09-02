import { useSyncExternalStore } from "react";

/** Swap this storage for StoreKit / RevenueCat later. */
export const UNLOCK_STORAGE_KEY = "bagchart.pro";

const PRO_TAB_IDS = new Set(["benchmark", "round"]);

const listeners = new Set<() => void>();
let cached: boolean | null = null;

function emit() {
  listeners.forEach((fn) => fn());
}

export function isProTab(tab: string) {
  return PRO_TAB_IDS.has(tab);
}

export function hasUnlock(): boolean {
  if (typeof window === "undefined") return false;
  if (cached != null) return cached;
  try {
    const raw = window.localStorage.getItem(UNLOCK_STORAGE_KEY);
    cached = raw === "true" || raw === "1";
  } catch {
    cached = false;
  }
  return cached;
}

export function setUnlock(on: boolean) {
  cached = on;
  if (typeof window !== "undefined") {
    try {
      if (on) window.localStorage.setItem(UNLOCK_STORAGE_KEY, "true");
      else window.localStorage.removeItem(UNLOCK_STORAGE_KEY);
    } catch {
      // Private mode / blocked storage — in-memory flag still works this session.
    }
  }
  emit();
}

export function subscribeUnlock(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

/** One source of truth for the local Pro flag. */
export function useUnlock() {
  return useSyncExternalStore(subscribeUnlock, hasUnlock, () => false);
}
