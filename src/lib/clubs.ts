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

/** User-facing category when adding a custom club in Log. */
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

const STOCK_IDS = new Set<string>(CLUBS.map((c) => c.id));

export function isStockClubId(id: string): id is ClubId {
  return STOCK_IDS.has(id);
}

export function newCustomClubId() {
  return `cx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
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
  };
}

/** Stock clubs in order, with custom clubs appended after their group. */
export function bagClubList(customClubs: CustomClub[] = []): BagClub[] {
  const out: BagClub[] = [];
  for (const g of GROUPS) {
    for (const c of CLUBS.filter((x) => x.group === g.id)) {
      out.push(stockAsBagClub(c));
    }
    for (const c of customClubs.filter((x) => x.group === g.id)) {
      out.push(customAsBagClub(c));
    }
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
