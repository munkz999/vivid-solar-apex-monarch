/**
 * One-shot caddy club pick — pure distance math (no React).
 *
 * Factor order applied to the shot:
 * 1. Chart distances (from buildChart — already include weather when conditions are on)
 * 2. Weather overlay is therefore reused via chart rows, not re-applied here
 * 3. Lie factor (multiplier on pin yards)
 * 4. Elevation (additive yards after lie)
 *
 * Elevation units: yards. Rule of thumb documented in UI:
 * ~1 yard plays-like per 1 yard of elevation (uphill +, downhill −).
 */

export type LieType = "fairway" | "rough" | "bunker";
export type LieQuality = "favorable" | "buried";

/** Multiplier on pin distance (higher = needs more club). Tunable named constants. */
export const LIE_FACTORS = {
  fairway: {
    favorable: 1.0,
    buried: 1.1,
  },
  rough: {
    favorable: 1.12,
    buried: 1.35,
  },
  bunker: {
    favorable: 1.25,
    buried: 1.45,
  },
} as const satisfies Record<LieType, Record<LieQuality, number>>;

export const LIE_TYPE_LABELS: Record<LieType, string> = {
  fairway: "Fairway",
  rough: "Rough",
  bunker: "Bunker",
};

export const LIE_QUALITY_LABELS: Record<LieQuality, string> = {
  favorable: "Favorable",
  buried: "Buried",
};

export interface PlaysLikeInput {
  /** Distance to pin in yards. */
  pinYards: number;
  lieType: LieType;
  lieQuality: LieQuality;
  /**
   * Elevation change to pin in yards (+ uphill, − downhill).
   * Applied after lie: playsLike = pin * lieFactor + elevationYards.
   */
  elevationYards: number;
}

export interface PlaysLikeResult {
  pinYards: number;
  lieFactor: number;
  afterLieYards: number;
  elevationYards: number;
  /** Final plays-like distance used for club pick. */
  playsLikeYards: number;
}

export function lieFactor(lieType: LieType, lieQuality: LieQuality): number {
  return LIE_FACTORS[lieType][lieQuality];
}

/**
 * Compute plays-like yards from pin distance, lie, and elevation.
 * Does not touch weather — chart rows already reflect conditions when applied.
 */
export function playsLike(input: PlaysLikeInput): PlaysLikeResult {
  const pinYards = Math.max(0, input.pinYards);
  const factor = lieFactor(input.lieType, input.lieQuality);
  const afterLieYards = pinYards * factor;
  const elevationYards = input.elevationYards;
  const playsLikeYards = afterLieYards + elevationYards;
  return {
    pinYards,
    lieFactor: factor,
    afterLieYards,
    elevationYards,
    playsLikeYards,
  };
}

export interface ChartDistance {
  clubId: string;
  label: string;
  /** Chart carry yards (weather already baked in when conditions are on). */
  carry: number;
}

export interface ClubPick {
  clubId: string;
  label: string;
  carry: number;
  /** carry − playsLikeYards (positive = club is longer than needed). */
  delta: number;
}

/**
 * Closest chart carry to plays-like. On an absolute-distance tie, prefer the
 * longer club (more club). Empty chart → null.
 */
export function pickClub(playsLikeYards: number, chart: ChartDistance[]): ClubPick | null {
  if (chart.length === 0) return null;
  let best = chart[0]!;
  let bestAbs = Math.abs(best.carry - playsLikeYards);
  for (let i = 1; i < chart.length; i++) {
    const row = chart[i]!;
    const abs = Math.abs(row.carry - playsLikeYards);
    if (abs < bestAbs || (abs === bestAbs && row.carry > best.carry)) {
      best = row;
      bestAbs = abs;
    }
  }
  return {
    clubId: best.clubId,
    label: best.label,
    carry: best.carry,
    delta: best.carry - playsLikeYards,
  };
}

/** e.g. `162 pin → 148 plays-like → 7i` */
export function formatBreakdown(
  pinYards: number,
  playsLikeYards: number,
  clubLabel: string,
): string {
  const pin = Math.round(pinYards);
  const pl = Math.round(playsLikeYards);
  return `${pin} pin → ${pl} plays-like → ${clubLabel}`;
}
