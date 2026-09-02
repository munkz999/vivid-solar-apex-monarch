import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CLUBS, DEFAULT_ENABLED, DEFAULT_LOFT, type ClubId } from "./clubs";
import { clubRoll, fittedMph, modelCarryRaw, type WindDir } from "./model";

export type TabId = "chart" | "bag" | "benchmark" | "round" | "card";
export type SpeedPreset = "sr" | "slow" | "avg" | "pro" | "fit";
export type Gender = "men" | "women";
export type Source = "sim" | "course" | "range";
export type ShotKind = "shot" | "cascade";

export const SPEED_PRESETS: { id: SpeedPreset; label: string }[] = [
  { id: "sr", label: "Sr" },
  { id: "slow", label: "Slow" },
  { id: "avg", label: "Avg" },
  { id: "pro", label: "Pro" },
  { id: "fit", label: "Fit" },
];

/** Driver mph by gender. Men: Trackman amateur / PGA. Women: amateur charts / LPGA. */
export const PRESET_MPH: Record<Gender, Record<Exclude<SpeedPreset, "fit">, number>> = {
  men: { sr: 80, slow: 85, avg: 93, pro: 118 },
  women: { sr: 62, slow: 70, avg: 78, pro: 96 },
};

export interface Benchmark {
  id: string;
  clubId: ClubId;
  carry: number;
  total?: number;
  clubSpeed?: number;
  source?: Source;
  notes: string;
  savedAt: number;
  driverMph: number;
  kind?: ShotKind;
  fromClubId?: ClubId;
  batchId?: string;
}

export interface WeatherState {
  place: string;
  lat: number;
  lon: number;
  elevFt: number;
  tempF: number;
  humidityPct: number;
  pressureInhg: number;
  forecastWindMph?: number;
  fetchedAt: number;
}

export type ShotInput = Omit<Benchmark, "id" | "savedAt" | "kind" | "fromClubId" | "batchId">;
export type AdjustMode = "single" | "chart";
export interface FitDraft {
  clubId: ClubId;
  carry: string;
  total: string;
}

interface BagState {
  tab: TabId;
  speedPreset: SpeedPreset;
  gender: Gender;
  enabledClubs: Record<ClubId, boolean>;
  driverLoft: number;
  benchmarks: Benchmark[];
  useConditions: boolean;
  weather: WeatherState | null;
  windDir: WindDir;
  windMph: number;
  adjustMode: AdjustMode;
  overwriteBelow: boolean;
  fitHistory: Benchmark[][];
  fitDraft: FitDraft;
  manualMph: number | null;
  setTab: (tab: TabId) => void;
  setPreset: (preset: SpeedPreset) => void;
  setGender: (gender: Gender) => void;
  toggleClub: (id: ClubId) => void;
  setDriverLoft: (loft: number) => void;
  logShot: (
    b: ShotInput,
    opts: { wholeChart: boolean; overwrite: boolean },
  ) => { cascaded: number; held: number; overwritten: number };
  revertFit: () => boolean;
  deleteBenchmark: (id: string) => void;
  clearBenchmarks: () => void;
  setUseConditions: (on: boolean) => void;
  setWeather: (w: WeatherState | null) => void;
  patchWeather: (p: Partial<WeatherState>) => void;
  setWindDir: (d: WindDir) => void;
  setWindMph: (n: number) => void;
  setAdjustMode: (mode: AdjustMode) => void;
  setOverwriteBelow: (on: boolean) => void;
  setFitDraft: (p: Partial<FitDraft>) => void;
  applyManualMph: (mph: number) => void;
}

export function clampMph(n: number) {
  return Math.min(130, Math.max(55, Math.round(n)));
}

export function isDirectShot(b: Benchmark) {
  return b.kind !== "cascade";
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const CASCADE_MIN = 0.82;
const CASCADE_MAX = 1.22;
const ROLL_MIN = 0.5;
const ROLL_MAX = 2;
const HISTORY_MAX = 5;

function cloneShots(list: Benchmark[]): Benchmark[] {
  return list.map((x) => ({ ...x }));
}

function pushHistory(current: Benchmark[][], snapshot: Benchmark[]) {
  return [cloneShots(snapshot), ...current].slice(0, HISTORY_MAX);
}

const persistStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
});

export const useBagStore = create<BagState>()(
  persist(
    (set, get) => ({
      tab: "chart",
      speedPreset: "avg",
      gender: "men",
      enabledClubs: { ...DEFAULT_ENABLED },
      driverLoft: DEFAULT_LOFT,
      benchmarks: [],
      useConditions: false,
      weather: null,
      windDir: "ignore",
      windMph: 0,
      adjustMode: "single",
      overwriteBelow: false,
      fitHistory: [],
      fitDraft: { clubId: "dr", carry: "", total: "" },
      manualMph: null,
      setTab: (tab) => set({ tab }),
      setPreset: (preset) => set({ speedPreset: preset }),
      setGender: (gender) => set({ gender }),
      toggleClub: (id) =>
        set({ enabledClubs: { ...get().enabledClubs, [id]: !get().enabledClubs[id] } }),
      setDriverLoft: (loft) => set({ driverLoft: loft }),
      logShot: (b, opts) => {
        const state = get();
        const id = newId();
        const savedAt = Date.now();
        const shot: Benchmark = { ...b, id, savedAt, kind: "shot", batchId: id };
        const history = pushHistory(state.fitHistory, state.benchmarks);
        let rest = state.benchmarks.filter(
          (x) => !(x.kind === "cascade" && x.clubId === b.clubId),
        );
        const cascades: Benchmark[] = [];
        let held = 0;
        let overwritten = 0;
        if (opts.wholeChart) {
          const loft = state.driverLoft;
          const modelSrc = modelCarryRaw(b.clubId, b.driverMph, loft);
          const raw = modelSrc === 0 ? 1 : b.carry / modelSrc;
          const scale = Math.min(CASCADE_MAX, Math.max(CASCADE_MIN, raw));
          const srcRoll = clubRoll(b.clubId, loft);
          const loggedRoll = Math.max(0, (b.total ?? b.carry + srcRoll) - b.carry);
          const rollScale =
            srcRoll <= 0 ? 1 : Math.min(ROLL_MAX, Math.max(ROLL_MIN, loggedRoll / srcRoll));
          const idx = CLUBS.findIndex((c) => c.id === b.clubId);
          const below = CLUBS.slice(idx + 1).filter((c) => state.enabledClubs[c.id]);
          const srcName = CLUBS.find((x) => x.id === b.clubId)?.name ?? b.clubId;
          for (const c of below) {
            const hasDirect = rest.some((x) => x.clubId === c.id && isDirectShot(x));
            if (hasDirect && !opts.overwrite) {
              held += 1;
              continue;
            }
            if (hasDirect && opts.overwrite) {
              overwritten += 1;
              rest = rest.filter((x) => x.clubId !== c.id);
            }
            const cCarry = modelCarryRaw(c.id, b.driverMph, loft) * scale;
            const cRoll = clubRoll(c.id, loft) * rollScale;
            cascades.push({
              id: newId(),
              clubId: c.id,
              carry: Math.round(cCarry),
              total: Math.round(cCarry + Math.max(0, cRoll)),
              notes: `From ${srcName}`,
              savedAt,
              driverMph: b.driverMph,
              kind: "cascade",
              fromClubId: b.clubId,
              batchId: id,
            });
          }
          const hit = new Set(cascades.map((x) => x.clubId));
          rest = rest.filter((x) => !(x.kind === "cascade" && hit.has(x.clubId)));
        }
        set({ benchmarks: [shot, ...cascades, ...rest], fitHistory: history });
        return { cascaded: cascades.length, held, overwritten };
      },
      revertFit: () => {
        const [last, ...rest] = get().fitHistory;
        if (!last) return false;
        set({ benchmarks: last, fitHistory: rest });
        return true;
      },
      deleteBenchmark: (id) => {
        const item = get().benchmarks.find((x) => x.id === id);
        if (!item) return;
        if (isDirectShot(item) && item.batchId) {
          set({
            benchmarks: get().benchmarks.filter(
              (x) => x.id !== id && x.batchId !== item.batchId,
            ),
          });
          return;
        }
        set({ benchmarks: get().benchmarks.filter((x) => x.id !== id) });
      },
      clearBenchmarks: () =>
        set({
          fitHistory: pushHistory(get().fitHistory, get().benchmarks),
          benchmarks: [],
          manualMph: null,
          fitDraft: { ...get().fitDraft, carry: "", total: "" },
        }),
      setUseConditions: (on) => set({ useConditions: on }),
      setWeather: (w) => set({ weather: w }),
      patchWeather: (p) => {
        const cur = get().weather ?? {
          place: "Manual",
          lat: 0,
          lon: 0,
          elevFt: 0,
          tempF: 70,
          humidityPct: 50,
          pressureInhg: 29.92,
          fetchedAt: Date.now(),
        };
        set({ weather: { ...cur, ...p } });
      },
      setWindDir: (d) => set({ windDir: d }),
      setWindMph: (n) => set({ windMph: Math.min(30, Math.max(0, Math.round(n))) }),
      setAdjustMode: (mode) => set({ adjustMode: mode }),
      setOverwriteBelow: (on) => set({ overwriteBelow: on }),
      setFitDraft: (p) => set({ fitDraft: { ...get().fitDraft, ...p } }),
      applyManualMph: (n) => {
        const mph = clampMph(n);
        const state = get();
        const hasShots = state.benchmarks.some(isDirectShot);
        if (hasShots) {
          set({
            fitHistory: pushHistory(state.fitHistory, state.benchmarks),
            benchmarks: [],
            manualMph: mph,
            fitDraft: { ...state.fitDraft, carry: "", total: "" },
          });
          return;
        }
        set({ manualMph: mph });
      },
    }),
    {
      name: "bag-chart-v1",
      storage: persistStorage,
      partialize: (s) => ({
        tab: s.tab,
        speedPreset: s.speedPreset,
        gender: s.gender,
        enabledClubs: s.enabledClubs,
        driverLoft: s.driverLoft,
        benchmarks: s.benchmarks,
        useConditions: s.useConditions,
        weather: s.weather,
        windDir: s.windDir,
        windMph: s.windMph,
        adjustMode: s.adjustMode,
        overwriteBelow: s.overwriteBelow,
        fitHistory: s.fitHistory,
        fitDraft: s.fitDraft,
        manualMph: s.manualMph,
      }),
      version: 4,
      migrate: (persisted, version) => {
        const s = persisted as Record<string, unknown>;
        if (version < 2) {
          s.adjustMode = s.cascadeBelow ? "chart" : "single";
          s.overwriteBelow = false;
          s.fitHistory = [];
          delete s.cascadeBelow;
        }
        if (version < 3) {
          if (s.speedPreset === "pro") s.speedPreset = "heavy";
          else if (s.speedPreset === "custom") s.speedPreset = "yours";
          delete s.customMph;
        }
        if (version < 4) {
          const prev = String(s.speedPreset ?? "");
          const map: Record<string, SpeedPreset> = {
            senior: "sr",
            sr: "sr",
            light: "slow",
            slow: "slow",
            average: "avg",
            avg: "avg",
            heavy: "pro",
            pro: "pro",
            yours: "fit",
            fit: "fit",
            custom: "fit",
          };
          s.speedPreset = map[prev] ?? "avg";
          s.gender = "men";
          delete s.effort;
        }
        return s;
      },
    },
  ),
);

export function currentMph(s: {
  speedPreset: SpeedPreset;
  gender: Gender;
  driverLoft: number;
  benchmarks: Benchmark[];
  manualMph?: number | null;
}): number {
  if (s.speedPreset === "fit") {
    return fittedMph(s.benchmarks, s.driverLoft) ?? s.manualMph ?? PRESET_MPH[s.gender].avg;
  }
  return PRESET_MPH[s.gender][s.speedPreset];
}

export function presetLabel(id: SpeedPreset) {
  return SPEED_PRESETS.find((p) => p.id === id)?.label ?? id;
}

export function shotsForClub(benchmarks: Benchmark[], clubId: ClubId): Benchmark[] {
  return benchmarks.filter((b) => b.clubId === clubId);
}
