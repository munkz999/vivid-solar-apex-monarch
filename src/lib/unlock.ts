import { useEffect, useSyncExternalStore } from "react";

export const UNLOCK_STORAGE_KEY = "bagchart.pro";
export const IAP_PRODUCT_ID = "com.texastyler.bagchart.pro";

const PRO_TAB_IDS = new Set(["benchmark", "round"]);

const listeners = new Set<() => void>();
let cached: boolean | null = null;

function emit() {
  listeners.forEach((fn) => fn());
}

export function isProTab(tab: string) {
  return PRO_TAB_IDS.has(tab);
}

function nativeBridge(): { postMessage: (msg: string) => void } | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { ReactNativeWebView?: { postMessage: (msg: string) => void } })
    .ReactNativeWebView;
}

export function requestNativePurchase() {
  const bridge = nativeBridge();
  if (!bridge) return false;
  bridge.postMessage(JSON.stringify({ type: "purchase", productId: IAP_PRODUCT_ID }));
  return true;
}

export function requestNativeRestore() {
  const bridge = nativeBridge();
  if (!bridge) return false;
  bridge.postMessage(JSON.stringify({ type: "restore" }));
  return true;
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

export function useUnlock() {
  return useSyncExternalStore(subscribeUnlock, hasUnlock, () => false);
}

/** Native IAP posts bagchart-iap messages into this page after a successful buy/restore. */
export function useNativeUnlockListener() {
  useEffect(() => {
    function onMsg(ev: MessageEvent | Event) {
      const data = "data" in ev ? (ev as MessageEvent).data : undefined;
      let parsed: { type?: string } | null = null;
      try {
        parsed = typeof data === "string" ? JSON.parse(data) : data;
      } catch {
        return;
      }
      if (parsed?.type === "unlocked") setUnlock(true);
    }
    window.addEventListener("message", onMsg);
    document.addEventListener("message", onMsg as EventListener);
    return () => {
      window.removeEventListener("message", onMsg);
      document.removeEventListener("message", onMsg as EventListener);
    };
  }, []);
}
