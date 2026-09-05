import { CloudSun, Crosshair, Flag, LayoutList, Briefcase, Lock } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { bagClubList } from "@/lib/clubs";
import { currentMph, SPEED_PRESETS, useBagStore, type Gender, type TabId } from "@/lib/store";
import { isProTab, requestNativePurchase, requestNativeRestore, setUnlock, useNativeUnlockListener, useUnlock } from "@/lib/unlock";
import { cn } from "@/lib/utils";
import { GhostButton, Pill, PrimaryButton } from "./ui";
import { ChartTab } from "./chart-tab";
import { BagTab } from "./bag-tab";
import { BenchmarkTab } from "./benchmark-tab";
import { RoundTab } from "./round-tab";
import { CourseStingButton } from "./course-sting-button";
import { FlagMenuSheets, type FlagSheet } from "./flag-menu";

const TABS: { id: TabId; label: string; icon: typeof LayoutList }[] = [
  { id: "chart", label: "Chart", icon: LayoutList },
  { id: "bag", label: "Bag", icon: Briefcase },
  { id: "benchmark", label: "Log", icon: Crosshair },
  { id: "round", label: "Conditions", icon: CloudSun },
];

const LONG_PRESS_MS = 650;
const DEV_TOAST_MS = 1600;
const TITLE_TAP_WINDOW_MS = 800;

export function AppShell() {
  const tab = useBagStore((s) => s.tab);
  const setTab = useBagStore((s) => s.setTab);
  const gender = useBagStore((s) => s.gender);
  const setGender = useBagStore((s) => s.setGender);
  const preset = useBagStore((s) => s.speedPreset);
  const setPreset = useBagStore((s) => s.setPreset);
  const mph = useBagStore(currentMph);
  const clubCount = useBagStore((s) => bagClubList(s.customClubs).filter((c) => s.enabledClubs[c.id]).length);
  const unlocked = useUnlock();
  useNativeUnlockListener();
  const onFit = tab === "benchmark" && unlocked;
  const mainRef = useRef<HTMLElement>(null);
  const longPressTimer = useRef<number | undefined>(undefined);
  const longPressFired = useRef(false);
  const titleTapCount = useRef(0);
  const titleTapTimer = useRef<number | undefined>(undefined);
  const [paywallFor, setPaywallFor] = useState<TabId | "fit" | null>(null);
  const [devToast, setDevToast] = useState<string | null>(null);
  const [flagSheet, setFlagSheet] = useState<FlagSheet>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    if (onFit && preset !== "fit") setPreset("fit");
  }, [onFit, preset, setPreset]);

  useEffect(() => {
    if ((tab as string) === "card") setTab("chart");
  }, [tab, setTab]);

  useEffect(() => {
    if (unlocked) return;
    if (isProTab(tab)) {
      setTab("chart");
      setPaywallFor(null);
    }
    if (preset === "fit") setPreset("avg");
  }, [unlocked, tab, preset, setTab, setPreset]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current != null) window.clearTimeout(longPressTimer.current);
      if (titleTapTimer.current != null) window.clearTimeout(titleTapTimer.current);
    };
  }, []);

  function requestTab(id: TabId) {
    if (isProTab(id) && !unlocked) {
      setPaywallFor(id);
      return;
    }
    setPaywallFor(null);
    setTab(id);
  }

  function confirmUnlock() {
    if (requestNativePurchase()) return;
    setUnlock(true);
    const next = paywallFor;
    setPaywallFor(null);
    if (next === "fit") setPreset("fit");
    else if (next) setTab(next);
  }

  function toggleDemoPro() {
    const next = !unlocked;
    setUnlock(next);
    setPaywallFor(null);
    setDevToast(next ? "Pro on" : "Pro off");
    window.setTimeout(() => setDevToast(null), DEV_TOAST_MS);
  }

  function onMenuTitleDemoTap() {
    titleTapCount.current += 1;
    window.clearTimeout(titleTapTimer.current);
    titleTapTimer.current = window.setTimeout(() => {
      titleTapCount.current = 0;
    }, TITLE_TAP_WINDOW_MS);
    if (titleTapCount.current < 5) return;
    titleTapCount.current = 0;
    toggleDemoPro();
  }

  function clearLongPress() {
    if (longPressTimer.current != null) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = undefined;
  }

  function onFlagPointerDown() {
    longPressFired.current = false;
    clearLongPress();
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      toggleDemoPro();
    }, LONG_PRESS_MS);
  }

  function onFlagPointerUp() {
    const wasLong = longPressFired.current;
    clearLongPress();
    if (wasLong) return;
    setFlagSheet((s) => (s ? null : "menu"));
  }

  function onFlagPointerCancel() {
    clearLongPress();
  }

  function onFlagClick(e: ReactMouseEvent) {
    // Pointer handlers own open/toggle; suppress synthetic click after touch.
    e.preventDefault();
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-bg print:h-auto print:overflow-visible">
      <div className="relative mx-auto flex h-full min-h-0 w-full min-w-0 max-w-md flex-col bg-bg print:h-auto">
        <header className="shrink-0 border-b border-line bg-bg px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 print:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onPointerDown={onFlagPointerDown}
                onPointerUp={onFlagPointerUp}
                onPointerCancel={onFlagPointerCancel}
                onPointerLeave={onFlagPointerCancel}
                onClick={onFlagClick}
                aria-label="Menu"
                aria-haspopup="dialog"
                aria-expanded={flagSheet != null}
                className="flex size-9 items-center justify-center rounded-md bg-surface text-gold shadow-panel"
              >
                <Flag className="size-4" strokeWidth={2.2} />
              </button>
              <div>
                <h1 className="font-display text-xl leading-tight font-medium tracking-tight text-ink italic">
                  Bag Chart
                </h1>
                <p className="text-2xs tracking-wide text-muted tabular-nums">
                  {mph} mph · {gender === "women" ? "Women" : "Men"} · {clubCount} clubs
                </p>
              </div>
            </div>
            <div
              className="flex h-11 rounded-pill bg-raised p-1 shadow-inset"
              role="group"
              aria-label="Player"
            >
              {(["men", "women"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={cn(
                    "h-9 min-w-14 rounded-pill px-2.5 text-xs font-semibold",
                    "transition-[background-color,color] duration-150 ease-out-smooth",
                    gender === g ? "bg-gold text-gold-fg" : "text-muted",
                  )}
                >
                  {g === "men" ? "Men" : "Women"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-1">
            {SPEED_PRESETS.map((p) => {
              const fitLocked = p.id === "fit" && !unlocked;
              const onFitLocked = onFit && p.id !== "fit";
              return (
                <Pill
                  key={p.id}
                  active={preset === p.id && !fitLocked}
                  disabled={onFitLocked}
                  onClick={() => {
                    if (fitLocked) {
                      setPaywallFor("fit");
                      return;
                    }
                    if (onFitLocked) return;
                    setPreset(p.id);
                  }}
                  className="h-10 w-full min-w-0 px-1 text-xs"
                >
                  {p.label}
                </Pill>
              );
            })}
          </div>
        </header>

        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-5 print:overflow-visible print:pt-0"
        >
          {tab === "chart" ? <ChartTab /> : null}
          {tab === "bag" ? <BagTab /> : null}
          {tab === "benchmark" && unlocked ? <BenchmarkTab /> : null}
          {tab === "round" && unlocked ? <RoundTab /> : null}
        </main>

        <nav
          className="flex shrink-0 items-center gap-0.5 border-t border-line bg-surface/95 px-1 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-md print:hidden"
          aria-label="Primary"
        >
          <CourseStingButton />
          <ul className="grid min-w-0 flex-1 grid-cols-4">
            {TABS.map((t) => {
              const Icon = t.icon;
              const on = tab === t.id;
              const locked = isProTab(t.id) && !unlocked;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => requestTab(t.id)}
                    aria-label={locked ? `${t.label}, locked` : t.label}
                    className={cn(
                      "flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-md",
                      "transition-colors duration-150 ease-out-smooth",
                      on ? "text-gold" : "text-faint",
                    )}
                  >
                    <span className="relative">
                      <Icon className="size-5" strokeWidth={on ? 2.3 : 1.8} />
                      {locked ? (
                        <Lock
                          className="absolute -top-0.5 -right-2 size-2.5 text-gold"
                          strokeWidth={2.6}
                          aria-hidden
                        />
                      ) : null}
                    </span>
                    <span className="text-2xs font-medium tracking-wide">{t.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <FlagMenuSheets
          sheet={flagSheet}
          setSheet={setFlagSheet}
          onDemoToggle={onMenuTitleDemoTap}
          toast={devToast}
          onThanks={(msg) => {
            setDevToast(msg);
            window.setTimeout(() => setDevToast(null), DEV_TOAST_MS);
          }}
        />

        {paywallFor ? (
          <div
            className="absolute inset-0 z-50 flex items-end bg-bg/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm print:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pro-paywall-title"
            onClick={() => setPaywallFor(null)}
          >
            <div
              className="w-full rounded-xl bg-surface p-5 shadow-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-2xs font-medium tracking-widest text-gold uppercase">$4.99 · one-time</p>
              <h2 id="pro-paywall-title" className="mt-1 font-display text-xl font-medium tracking-tight text-ink italic">
                Unlock Pro
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Unlocking Pro is a one-time fee used to support continual improvement and development of Bag Chart. This purchase enables you to:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                <li>log your swing metrics or known club swing speed to build and fine tune your distance chart</li>
                <li>apply real-time weather conditions to your chart based on your location, further refining your chart by considering environmental factors affecting ball flight</li>
              </ul>
              <PrimaryButton className="mt-5" onClick={confirmUnlock}>
                Unlock · $4.99
              </PrimaryButton>
              <GhostButton className="mt-2 w-full" onClick={() => setPaywallFor(null)}>
                Not now
              </GhostButton>
              <button
                type="button"
                className="mt-3 w-full text-center text-xs text-faint"
                onClick={() => {
                  if (!requestNativeRestore()) setUnlock(true);
                }}
              >
                Restore purchase
              </button>
            </div>
          </div>
        ) : null}

        {devToast ? (
          <p
            className="pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top))] left-1/2 z-50 -translate-x-1/2 rounded-pill bg-gold px-3 py-1 text-2xs font-semibold text-gold-fg shadow-panel print:hidden"
            role="status"
          >
            {devToast}
          </p>
        ) : null}
      </div>
    </div>
  );
}
