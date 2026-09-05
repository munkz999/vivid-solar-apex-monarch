import {
  GROUPS,
  bagClubList,
  effectiveClubLoft,
  loftForSort,
  shortClubLabel,
  type BagClub,
  type ClubGroup,
  type CustomClub,
} from "./clubs";
import {
  blendedYours,
  computeYardage,
  type ConditionsInput,
  type Effort,
  type Yardage,
} from "./model";
import { isDirectShot, type Benchmark } from "./store";

export function loftLabel(loft: number) {
  const t = loft.toFixed(1);
  return t.endsWith(".0") ? t.slice(0, -2) : t;
}

export function fmtYd(n: number) {
  return String(Math.round(n));
}

export type FitOrigin = "model" | "shots" | "cascade";

export interface ChartRow extends Yardage {
  shotCount: number;
  label: string;
  fitOrigin: FitOrigin;
  fromClubId?: string;
  /** Bag section — Woods / Hybrids / Irons / Wedges. */
  group: ClubGroup;
  /** Effective loft used for yardage + section sort (°). */
  loft: number;
  isCustom: boolean;
  name: string;
}

export interface ChartSection {
  id: ClubGroup;
  label: string;
  rows: ChartRow[];
}

/** Group chart rows into Bag GROUPS order; empty sections omitted. */
export function chartSections(rows: ChartRow[]): ChartSection[] {
  return GROUPS.map((g) => ({
    id: g.id,
    label: g.label,
    rows: rows.filter((r) => r.group === g.id),
  })).filter((s) => s.rows.length > 0);
}

/** Loft asc within section; stock before custom; name last-resort only. */
export function compareClubsByLoft(a: BagClub, b: BagClub): number {
  const d = loftForSort(a) - loftForSort(b);
  if (d !== 0) return d;
  if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
  return a.name.localeCompare(b.name);
}

/**
 * After bagClubList + enable filter: re-group by club.group and re-sort each
 * group by effective loft. Never uses name/id as the primary key.
 */
export function orderClubsForChart(clubs: BagClub[]): BagClub[] {
  const out: BagClub[] = [];
  for (const g of GROUPS) {
    const groupClubs = clubs.filter((c) => c.group === g.id);
    groupClubs.sort(compareClubsByLoft);
    out.push(...groupClubs);
  }
  return out;
}

export function roundConditions(opts: {
  useConditions: boolean;
  elevFt: number;
  tempF: number;
  humidityPct?: number;
  pressureInhg?: number;
  windDir: ConditionsInput["windDir"];
  windMph: number;
}): ConditionsInput | null {
  if (!opts.useConditions) return null;
  return {
    elevFt: opts.elevFt,
    tempF: opts.tempF,
    humidityPct: opts.humidityPct ?? 50,
    pressureInhg: opts.pressureInhg ?? 29.92,
    windDir: opts.windDir,
    windMph: opts.windMph,
  };
}

export function resolveYours(
  benchmarks: Benchmark[],
  clubId: string,
  mph: number,
  loft: number,
  lockSpeed = false,
  modelClubId?: BagClub["modelClubId"],
): {
  carry: number;
  roll: number | null;
  count: number;
  origin: Exclude<FitOrigin, "model">;
  fromClubId?: string;
} | null {
  const direct = benchmarks.filter((b) => b.clubId === clubId && isDirectShot(b));
  const blend = blendedYours(direct, clubId, mph, loft, lockSpeed, modelClubId);
  if (blend) return { ...blend, origin: "shots" };
  const cascades = benchmarks.filter((b) => b.clubId === clubId && b.kind === "cascade");
  if (cascades.length === 0) return null;
  const latest = cascades.reduce((a, b) => (a.savedAt >= b.savedAt ? a : b));
  const scaled = blendedYours([latest], clubId, mph, loft, lockSpeed, modelClubId);
  if (!scaled) return null;
  return {
    carry: scaled.carry,
    roll: scaled.roll,
    count: 0,
    origin: "cascade",
    fromClubId: latest.fromClubId,
  };
}

export function buildChart(opts: {
  enabledClubs: Record<string, boolean>;
  mph: number;
  /** Driver loft (header / Dr label); per-club loft comes from overrides when present. */
  loft: number;
  effort: Effort;
  conditions: ConditionsInput | null;
  benchmarks: Benchmark[];
  lockSpeed?: boolean;
  customClubs?: CustomClub[];
  clubLoftOverrides?: Record<string, number>;
}): ChartRow[] {
  const lockSpeed = opts.lockSpeed ?? false;
  const customs = opts.customClubs ?? [];
  const overrides = opts.clubLoftOverrides ?? {};
  const enabled = bagClubList(customs, overrides, opts.loft).filter(
    (c) => opts.enabledClubs[c.id],
  );
  // Bulletproof: group by section, sort each by effective loft (not name/id).
  const clubs = orderClubsForChart(enabled);
  return clubs.map((club) => {
    const clubLoft = effectiveClubLoft(club.id, {
      clubLoftOverrides: overrides,
      customClubs: customs,
      driverLoft: opts.loft,
    });
    const fit = resolveYours(
      opts.benchmarks,
      club.id,
      opts.mph,
      clubLoft,
      lockSpeed,
      club.modelClubId,
    );
    const row = computeYardage({
      clubId: club.id,
      mph: opts.mph,
      loft: clubLoft,
      effort: opts.effort,
      conditions: opts.conditions,
      modelClubId: club.modelClubId,
      benchmark: fit
        ? {
            clubId: club.id,
            carry: fit.carry,
            driverMph: opts.mph,
            roll: fit.roll,
          }
        : null,
    });
    const label = shortClubLabel(club.id, clubLoft, customs, overrides);
    return {
      ...row,
      shotCount: fit?.count ?? 0,
      label,
      fitOrigin: fit?.origin ?? "model",
      fromClubId: fit?.fromClubId,
      group: club.group,
      loft: clubLoft,
      isCustom: club.isCustom,
      name: club.name,
    };
  });
}
