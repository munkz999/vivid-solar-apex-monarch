import { CLUBS, STOCK_LOFTS, type ClubId } from "./clubs";

export const MPH_KEYS = [75, 85, 95, 105, 115] as const;

/** Carry yards at 75 / 85 / 95 / 105 / 115 driver mph. */
export const CARRY_TABLE: Record<ClubId, readonly [number, number, number, number, number]> = {
  dr: [177, 201, 226, 250, 275],
  "3w": [152, 173, 194, 215, 236],
  "4w": [147, 167, 187, 207, 228],
  "5w": [142, 161, 181, 200, 220],
  "7w": [132, 151, 170, 188, 206],
  "3h": [140, 160, 180, 198, 216],
  "4h": [135, 153, 172, 190, 209],
  "5h": [128, 146, 164, 181, 198],
  // 2i extrapolated from 3i↔4i spacing (no separate OEM table row).
  "2i": [137, 155, 176, 194, 213],
  "3i": [132, 150, 168, 186, 204],
  "4i": [127, 145, 160, 178, 195],
  "5i": [120, 137, 154, 170, 187],
  "6i": [113, 129, 145, 160, 176],
  "7i": [106, 121, 137, 152, 166],
  "8i": [98, 112, 126, 140, 154],
  "9i": [90, 103, 116, 128, 140],
  pw: [82, 94, 105, 116, 128],
  gw: [74, 85, 94, 104, 114],
  sw: [64, 73, 81, 90, 99],
  lw: [52, 58, 64, 71, 78],
};

/** Roll yards for non-driver clubs, bag order. Floor 5 on wedges. */
const OTHER_ROLL: Record<Exclude<ClubId, "dr">, number> = {
  "3w": 18,
  "4w": 17,
  "5w": 16,
  "7w": 14,
  "3h": 13,
  "4h": 12,
  "5h": 11,
  "2i": 12,
  "3i": 11,
  "4i": 10,
  "5i": 10,
  "6i": 9,
  "7i": 8,
  "8i": 7,
  "9i": 6,
  pw: 6,
  gw: 5,
  sw: 5,
  lw: 5,
};

export const EFFORT_80 = 0.8 ** 0.88;
export const REF_LOFT = 10.5;

/**
 * Light heuristic: ~yd carry per ° vs that club's stock loft
 * (lower loft than stock → slightly more carry). Not a full ball-flight model.
 */
export const LOFT_CARRY_PER_DEG = 1.6;
/** Extra roll yards per ° below stock loft (lower loft runs out a bit more). */
export const LOFT_ROLL_PER_DEG = 0.35;

export type WindDir = "ignore" | "head" | "tail" | "cross";
export type Effort = 80 | 100;

export interface ConditionsInput {
  elevFt: number;
  tempF: number;
  humidityPct: number;
  pressureInhg: number;
  windDir: WindDir;
  windMph: number;
}

export interface BenchmarkShot {
  clubId: string;
  carry: number;
  driverMph: number;
  total?: number;
  roll?: number | null;
}

export function interpolateCarry(clubId: ClubId, mph: number): number {
  const values = CARRY_TABLE[clubId];
  const keys = MPH_KEYS;
  if (mph <= keys[0]) {
    const slope = (values[1] - values[0]) / (keys[1] - keys[0]);
    return values[0] + slope * (mph - keys[0]);
  }
  const last = keys.length - 1;
  if (mph >= keys[last]) {
    const slope = (values[last] - values[last - 1]) / (keys[last] - keys[last - 1]);
    return values[last] + slope * (mph - keys[last]);
  }
  for (let i = 0; i < last; i++) {
    if (mph <= keys[i + 1]) {
      const t = (mph - keys[i]) / (keys[i + 1] - keys[i]);
      return values[i] + t * (values[i + 1] - values[i]);
    }
  }
  return values[last];
}

export function driverLoftAdj(loft: number, mph: number): number {
  const dLoft = loft - REF_LOFT;
  return -2.2 * dLoft + 1.4 * dLoft * -((mph - 95) / 20);
}

/** Carry/roll delta vs STOCK_LOFTS for non-driver clubs. */
export function stockLoftDelta(clubId: ClubId, loft: number): { carry: number; roll: number } {
  const std = STOCK_LOFTS[clubId];
  const d = std - loft; // positive when loft is lower than stock
  return { carry: d * LOFT_CARRY_PER_DEG, roll: d * LOFT_ROLL_PER_DEG };
}

export function modelCarryRaw(clubId: ClubId, mph: number, loft: number): number {
  const base = interpolateCarry(clubId, mph);
  if (clubId === "dr") return base + driverLoftAdj(loft, mph);
  return base + stockLoftDelta(clubId, loft).carry;
}

export function driverRoll(loft: number): number {
  const dLoft = loft - REF_LOFT;
  // 12.5° → 20 yd; lower loft runs out more. Floor 20.
  return Math.max(20, 23.2 - dLoft * 1.6);
}

export function clubRoll(clubId: ClubId, loft: number): number {
  if (clubId === "dr") return driverRoll(loft);
  const raw = OTHER_ROLL[clubId] + stockLoftDelta(clubId, loft).roll;
  const floor = clubId === "gw" || clubId === "sw" || clubId === "lw" || clubId === "pw" ? 5 : 4;
  return Math.max(floor, raw);
}

export function weatherParts(c: ConditionsInput) {
  const elev = (c.elevFt / 1000) * 0.012;
  const temp = (c.tempF - 70) * 0.0011;
  const humidity = ((c.humidityPct ?? 50) - 50) * 0.00018;
  const pressure = (29.92 - (c.pressureInhg ?? 29.92)) * 0.012;
  let wind = 0;
  if (c.windDir === "head") wind = -0.01 * c.windMph;
  else if (c.windDir === "tail") wind = 0.005 * c.windMph;
  else if (c.windDir === "cross") wind = -0.002 * c.windMph;
  const raw = 1 + elev + temp + humidity + pressure + wind;
  return { elev, temp, humidity, pressure, wind, total: Math.max(0.75, raw) };
}

export function weatherMultiplier(c: ConditionsInput): number {
  return weatherParts(c).total;
}

export interface Yardage {
  clubId: string;
  carry: number;
  total: number;
  modelCarry: number;
  modelCarryRaw: number;
  yoursRaw: number | null;
  vsModel: number | null;
  isYours: boolean;
}

export function rollFactors(effort: Effort, conditions: ConditionsInput | null) {
  let f = effort >= 95 ? 1 : 0.7;
  if (conditions && conditions.elevFt > 3000) f *= 0.7;
  return f;
}

export function appliedRoll(
  clubId: ClubId,
  loft: number,
  effort: Effort,
  conditions: ConditionsInput | null,
  yoursRollRaw?: number | null,
) {
  const raw = yoursRollRaw ?? clubRoll(clubId, loft);
  return Math.max(0, raw * rollFactors(effort, conditions));
}

export function blendedYours(
  shots: BenchmarkShot[],
  clubId: string,
  mph: number,
  loft: number,
  lockSpeed = false,
  modelId?: ClubId,
): { carry: number; roll: number | null; count: number } | null {
  const clubShots = shots.filter((s) => s.clubId === clubId);
  if (clubShots.length === 0) return null;
  const mid = modelId ?? (clubId as ClubId);
  const modelNow = modelCarryRaw(mid, mph, loft);
  let sum = 0;
  let rollSum = 0;
  let rollN = 0;
  for (const s of clubShots) {
    const modelThen = modelCarryRaw(mid, s.driverMph, loft);
    const scale = lockSpeed || modelThen === 0 ? 1 : modelNow / modelThen;
    sum += s.carry * scale;
    const rawRoll =
      s.roll != null
        ? s.roll
        : s.total != null
          ? Math.max(0, s.total - s.carry)
          : null;
    if (rawRoll != null) {
      rollSum += rawRoll;
      rollN += 1;
    }
  }
  return {
    carry: sum / clubShots.length,
    roll: rollN ? rollSum / rollN : null,
    count: clubShots.length,
  };
}

export function computeYardage(opts: {
  clubId: string;
  mph: number;
  loft: number;
  effort: Effort;
  conditions: ConditionsInput | null;
  benchmark: BenchmarkShot | null;
  modelClubId?: ClubId;
}): Yardage {
  const { clubId, mph, loft, effort, conditions, benchmark } = opts;
  const mid = opts.modelClubId ?? (clubId as ClubId);
  const modelAtMph = modelCarryRaw(mid, mph, loft);

  let yoursRaw: number | null = null;
  let yoursRollRaw: number | null = null;
  if (benchmark) {
    const modelAtSave = modelCarryRaw(mid, benchmark.driverMph, loft);
    const scale = modelAtSave === 0 ? 1 : modelAtMph / modelAtSave;
    yoursRaw = benchmark.carry * scale;
    if (benchmark.roll != null) yoursRollRaw = benchmark.roll;
    else if (benchmark.total != null) yoursRollRaw = Math.max(0, benchmark.total - benchmark.carry);
  }

  const baseRaw = yoursRaw ?? modelAtMph;
  const effortScale = effort < 95 ? EFFORT_80 : 1;
  const wxScale = conditions ? weatherMultiplier(conditions) : 1;

  const carry = baseRaw * effortScale * wxScale;
  const modelCarry = modelAtMph * effortScale * wxScale;
  const roll = appliedRoll(mid, loft, effort, conditions, yoursRollRaw);

  const vsModel = yoursRaw === null ? null : yoursRaw - modelAtMph;

  return {
    clubId,
    carry,
    total: carry + roll,
    modelCarry,
    modelCarryRaw: modelAtMph,
    yoursRaw,
    vsModel,
    isYours: yoursRaw !== null,
  };
}

export function enabledClubList(enabled: Record<ClubId, boolean>) {
  return CLUBS.filter((c) => enabled[c.id]);
}

/** Driver mph that would produce this carry on the stock model. */
export function impliedMph(clubId: ClubId, carry: number, loft: number): number {
  let lo = 40;
  let hi = 160;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (modelCarryRaw(clubId, mid, loft) < carry) lo = mid;
    else hi = mid;
  }
  return Math.min(130, Math.max(55, (lo + hi) / 2));
}

export function fittedMph(
  shots: Array<BenchmarkShot & { kind?: string }>,
  loft: number,
  resolveModelId?: (clubId: string) => ClubId,
  resolveLoft?: (clubId: string) => number,
): number | null {
  const direct = shots.filter((s) => s.kind !== "cascade");
  if (direct.length === 0) return null;
  const byClub = new Map<string, number[]>();
  for (const s of direct) {
    const list = byClub.get(s.clubId) ?? [];
    list.push(s.carry);
    byClub.set(s.clubId, list);
  }
  let sum = 0;
  for (const [id, carries] of byClub) {
    const avg = carries.reduce((a, b) => a + b, 0) / carries.length;
    const mid = resolveModelId ? resolveModelId(id) : (id as ClubId);
    const clubLoft = resolveLoft ? resolveLoft(id) : loft;
    sum += impliedMph(mid, avg, clubLoft);
  }
  return Math.round(sum / byClub.size);
}
