export type ClubId =
  | "dr"
  | "3w"
  | "4w"
  | "5w"
  | "7w"
  | "3h"
  | "4h"
  | "5h"
  | "3i"
  | "4i"
  | "5i"
  | "6i"
  | "7i"
  | "8i"
  | "9i"
  | "pw"
  | "gw"
  | "sw"
  | "lw";

export type ClubGroup = "woods" | "hybrids" | "irons" | "wedges";

/** User-facing category when adding a custom club in Bag. */
export type CustomClubCategory = "driver" | "wood" | "hybrid" | "iron" | "wedges";

export interface Club {
  id: ClubId;
  name: string;
  fullName: string;
  group: ClubGroup;
  defaultOn: boolean;
}

export interface CustomClub {
  id: string;
  name: string;
  fullName: string;
  category: CustomClubCategory;
  group: ClubGroup;
  /** Stock club used for model carry / roll. */
  modelClubId: ClubId;
  /** Degrees; optional for customs saved before loft was collected. */
  loft?: number;
}

/** Unified bag entry used by chart, log, and bag UI. */
export interface BagClub {
  id: string;
  name: string;
  fullName: string;
  group: ClubGroup;
  modelClubId: ClubId;
  isCustom: boolean;
  defaultOn: boolean;
  /** Degrees when known (customs with loft; stock from STOCK_LOFTS). */
  loft?: number;
}

export const CLUBS: Club[] = [
  { id: "dr", name: "Dr", fullName: "Driver", group: "woods", defaultOn: true },
  { id: "3w", name: "3W", fullName: "3 Wood", group: "woods", defaultOn: true },
  { id: "4w", name: "4W", fullName: "4 Wood", group: "woods", defaultOn: false },
  { id: "5w", name: "5W", fullName: "5 Wood", group: "woods", defaultOn: true },
  { id: "7w", name: "7W", fullName: "7 Wood", group: "woods", defaultOn: false },
  { id: "3h", name: "3H", fullName: "3 Hybrid", group: "hybrids", defaultOn: false },
  { id: "4h", name: "4H", fullName: "4 Hybrid", group: "hybrids", defaultOn: true },
  { id: "5h", name: "5H", fullName: "5 Hybrid", group: "hybrids", defaultOn: false },
  { id: "3i", name: "3i", fullName: "3 Iron", group: "irons", defaultOn: false },
  { id: "4i", name: "4i", fullName: "4 Iron", group: "irons", defaultOn: false },
  { id: "5i", name: "5i", fullName: "5 Iron", group: "irons", defaultOn: true },
  { id: "6i", name: "6i", fullName: "6 Iron", group: "irons", defaultOn: true },
  { id: "7i", name: "7i", fullName: "7 Iron", group: "irons", defaultOn: true },
  { id: "8i", name: "8i", fullName: "8 Iron", group: "irons", defaultOn: true },
  { id: "9i", name: "9i", fullName: "9 Iron", group: "irons", defaultOn: true },
  { id: "pw", name: "PW", fullName: "Pitching Wedge", group: "wedges", defaultOn: true },
  { id: "gw", name: "GW", fullName: "Gap Wedge", group: "wedges", defaultOn: true },
  { id: "sw", name: "SW", fullName: "Sand Wedge", group: "wedges", defaultOn: true },
  { id: "lw", name: "LW", fullName: "Lob Wedge", group: "wedges", defaultOn: false },
];

/**
 * Typical stock loft (° ) for bag/chart ordering and nearest-model lookup.
 * Industry-ish defaults (OEM midpoints), not player-fitted:
 * Dr 10.5 · 3W 15 · 4W 16.5 · 5W 18 · 7W 21 ·
 * 3H 19 · 4H 22 · 5H 25 ·
 * 3i 21 … PW 46 · GW 50 · SW 54 · LW 58.
 */
export const STOCK_LOFTS: Record<ClubId, number> = {
  dr: 10.5,
  "3w": 15,
  "4w": 16.5,
  "5w": 18,
  "7w": 21,
  "3h": 19,
  "4h": 22,
  "5h": 25,
  "3i": 21,
  "4i": 24,
  "5i": 27,
  "6i": 30,
  "7i": 34,
  "8i": 38,
  "9i": 42,
  pw: 46,
  gw: 50,
  sw: 54,
  lw: 58,
};

export const CLUB_BY_ID: Record<ClubId, Club> = Object.fromEntries(
  CLUBS.map((c) => [c.id, c]),
) as Record<ClubId, Club>;

export const GROUPS: { id: ClubGroup; label: string }[] = [
  { id: "woods", label: "Woods" },
  { id: "hybrids", label: "Hybrids" },
  { id: "irons", label: "Irons" },
  { id: "wedges", label: "Wedges" },
];

export const CUSTOM_CATEGORIES: {
  id: CustomClubCategory;
  label: string;
  group: ClubGroup;
  modelClubId: ClubId;
}[] = [
  { id: "driver", label: "Driver", group: "woods", modelClubId: "dr" },
  { id: "wood", label: "Wood", group: "woods", modelClubId: "5w" },
  { id: "hybrid", label: "Hybrid", group: "hybrids", modelClubId: "4h" },
  { id: "iron", label: "Iron", group: "irons", modelClubId: "7i" },
  { id: "wedges", label: "Wedges", group: "wedges", modelClubId: "pw" },
];

export const DEFAULT_ENABLED: Record<ClubId, boolean> = Object.fromEntries(
  CLUBS.map((c) => [c.id, c.defaultOn]),
) as Record<ClubId, boolean>;

export const DRIVER_LOFTS = [
  8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13,
] as const;

export const DEFAULT_LOFT = 10.5;

/** Sensible loft entry range for custom clubs (°). */
export const CUSTOM_LOFT_MIN = 5;
export const CUSTOM_LOFT_MAX = 65;

const STOCK_IDS = new Set<string>(CLUBS.map((c) => c.id));

export function isStockClubId(id: string): id is ClubId {
  return STOCK_IDS.has(id);
}

export function newCustomClubId() {
  return `cx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Nearest stock club in `group` by loft (ties → lower loft / earlier in list). */
export function modelClubIdFromLoft(group: ClubGroup, loft: number): ClubId {
  const stock = CLUBS.filter((c) => c.group === group);
  let best = stock[0]?.id ?? "7i";
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of stock) {
    const dist = Math.abs(STOCK_LOFTS[c.id] - loft);
    if (dist < bestDist) {
      bestDist = dist;
      best = c.id;
    }
  }
  return best;
}

export function loftForSort(club: {
  isCustom: boolean;
  loft?: number;
  modelClubId: ClubId;
  id: string;
}): number {
  if (typeof club.loft === "number" && Number.isFinite(club.loft)) return club.loft;
  if (!club.isCustom && isStockClubId(club.id)) return STOCK_LOFTS[club.id];
  return STOCK_LOFTS[club.modelClubId];
}

export function stockAsBagClub(c: Club): BagClub {
  return {
    id: c.id,
    name: c.name,
    fullName: c.fullName,
    group: c.group,
    modelClubId: c.id,
    isCustom: false,
    defaultOn: c.defaultOn,
    loft: STOCK_LOFTS[c.id],
  };
}

export function customAsBagClub(c: CustomClub): BagClub {
  return {
    id: c.id,
    name: c.name,
    fullName: c.fullName,
    group: c.group,
    modelClubId: c.modelClubId,
    isCustom: true,
    defaultOn: true,
    loft: typeof c.loft === "number" && Number.isFinite(c.loft) ? c.loft : undefined,
  };
}

/**
 * Stock + custom clubs per group, sorted ascending by loft
 * (lower loft = longer club = earlier). Customs interleave with stock.
 * Legacy customs without loft fall back to their model club's stock loft.
 */
export function bagClubList(customClubs: CustomClub[] = []): BagClub[] {
  const out: BagClub[] = [];
  for (const g of GROUPS) {
    const groupClubs: BagClub[] = [
      ...CLUBS.filter((x) => x.group === g.id).map(stockAsBagClub),
      ...customClubs.filter((x) => x.group === g.id).map(customAsBagClub),
    ];
    groupClubs.sort((a, b) => {
      const d = loftForSort(a) - loftForSort(b);
      if (d !== 0) return d;
      // Stable-ish: stock before custom on exact loft tie, then name.
      if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    out.push(...groupClubs);
  }
  return out;
}

export function resolveBagClub(id: string, customClubs: CustomClub[] = []): BagClub | undefined {
  if (isStockClubId(id)) return stockAsBagClub(CLUB_BY_ID[id]);
  const custom = customClubs.find((c) => c.id === id);
  return custom ? customAsBagClub(custom) : undefined;
}

export function modelClubIdFor(id: string, customClubs: CustomClub[] = []): ClubId {
  const club = resolveBagClub(id, customClubs);
  if (club) return club.modelClubId;
  if (isStockClubId(id)) return id;
  return "7i";
}

export function shortClubLabel(id: string, loft: number, customClubs: CustomClub[] = []): string {
  if (id === "dr") {
    const t = loft.toFixed(1);
    const loftTxt = t.endsWith(".0") ? t.slice(0, -2) : t;
    return `Dr ${loftTxt}°`;
  }
  return resolveBagClub(id, customClubs)?.name ?? id;
}

export function formatLoftDeg(loft: number): string {
  const t = loft.toFixed(1);
  return t.endsWith(".0") ? `${t.slice(0, -2)}°` : `${t}°`;
}
