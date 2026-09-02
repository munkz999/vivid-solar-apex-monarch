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

export interface Club {
  id: ClubId;
  name: string;
  fullName: string;
  group: ClubGroup;
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

export const DEFAULT_ENABLED: Record<ClubId, boolean> = Object.fromEntries(
  CLUBS.map((c) => [c.id, c.defaultOn]),
) as Record<ClubId, boolean>;

export const DRIVER_LOFTS = [
  8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13,
] as const;

export const DEFAULT_LOFT = 10.5;
