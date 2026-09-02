import { CloudSun, Crosshair, Flag, LayoutList, Briefcase, IdCard } from "lucide-react";
import { useEffect, useRef } from "react";
import { CLUBS } from "@/lib/clubs";
import { currentMph, SPEED_PRESETS, useBagStore, type Gender, type TabId } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Pill } from "./ui";
import { ChartTab } from "./chart-tab";
import { BagTab } from "./bag-tab";
import { BenchmarkTab } from "./benchmark-tab";
import { RoundTab } from "./round-tab";
import { CardTab } from "./card-tab";
import { CourseStingButton } from "./course-sting-button";

const TABS: { id: TabId; label: string; icon: typeof LayoutList }[] = [
  { id: "chart", label: "Chart", icon: LayoutList },
  { id: "bag", label: "Bag", icon: Briefcase },
  { id: "benchmark", label: "Fit", icon: Crosshair },
  { id: "round", label: "Round", icon: CloudSun },
  { id: "card", label: "Card", icon: IdCard },
];

export function AppShell() {
  const tab = useBagStore((s) => s.tab);
  const setTab = useBagStore((s) => s.setTab);
  const gender = useBagStore((s) => s.gender);
  const setGender = useBagStore((s) => s.setGender);
  const preset = useBagStore((s) => s.speedPreset);
  const setPreset = useBagStore((s) => s.setPreset);
  const mph = useBagStore(currentMph);
  const clubCount = useBagStore((s) => CLUBS.filter((c) => s.enabledClubs[c.id]).length);
  const onFit = tab === "benchmark";
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    if (onFit && preset !== "fit") setPreset("fit");
  }, [onFit, preset, setPreset]);

  return (
    <div className="h-dvh w-full overflow-hidden bg-bg print:h-auto print:overflow-visible">
      <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-md flex-col bg-bg print:h-auto">
        <header className="shrink-0 border-b border-line bg-bg px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 print:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-md bg-surface text-gold shadow-panel">
                <Flag className="size-4" strokeWidth={2.2} />
              </span>
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
              const locked = onFit && p.id !== "fit";
              return (
                <Pill
                  key={p.id}
                  active={preset === p.id}
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
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
          {tab === "benchmark" ? <BenchmarkTab /> : null}
          {tab === "round" ? <RoundTab /> : null}
          {tab === "card" ? <CardTab /> : null}
        </main>

        <nav
          className="flex shrink-0 items-center gap-0.5 border-t border-line bg-surface/95 px-1 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-md print:hidden"
          aria-label="Primary"
        >
          <CourseStingButton />
          <ul className="grid min-w-0 flex-1 grid-cols-5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const on = tab === t.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-md",
                      "transition-colors duration-150 ease-out-smooth",
                      on ? "text-gold" : "text-faint",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={on ? 2.3 : 1.8} />
                    <span className="text-2xs font-medium tracking-wide">{t.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
