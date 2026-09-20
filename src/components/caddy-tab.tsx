import { useState } from "react";
import {
  formatBreakdown,
  LIE_QUALITY_LABELS,
  LIE_TYPE_LABELS,
  pickClub,
  playsLike,
  type LieQuality,
  type LieType,
} from "@/lib/caddy";
import { buildChart, roundConditions } from "@/lib/chart";
import { currentMph, useBagStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Field, GhostButton, Panel, Pill, PrimaryButton, StepperButton, Switch, TextInput } from "./ui";

const LIE_TYPES: LieType[] = ["fairway", "rough", "bunker"];
const QUALITIES: LieQuality[] = ["favorable", "buried"];

type ElevSign = "up" | "down" | "flat";

export function CaddyTab() {
  const enabledClubs = useBagStore((s) => s.enabledClubs);
  const customClubs = useBagStore((s) => s.customClubs);
  const driverLoft = useBagStore((s) => s.driverLoft);
  const clubLoftOverrides = useBagStore((s) => s.clubLoftOverrides);
  const benchmarks = useBagStore((s) => s.benchmarks);
  const caddyUseConditions = useBagStore((s) => s.caddyUseConditions);
  const setCaddyUseConditions = useBagStore((s) => s.setCaddyUseConditions);
  const weather = useBagStore((s) => s.weather);
  const windDir = useBagStore((s) => s.windDir);
  const windMph = useBagStore((s) => s.windMph);
  const mph = useBagStore(currentMph);
  const preset = useBagStore((s) => s.speedPreset);

  const [lieType, setLieType] = useState<LieType>("fairway");
  const [lieQuality, setLieQuality] = useState<LieQuality>("favorable");
  const [pinText, setPinText] = useState("");
  const [elevSign, setElevSign] = useState<ElevSign>("flat");
  const [elevMagText, setElevMagText] = useState("");
  const [result, setResult] = useState<{
    breakdown: string;
    clubLabel: string;
    playsLikeYards: number;
    pinYards: number;
    lieFactor: number;
    weatherOn: boolean;
  } | null>(null);

  // Caddy-local toggle (independent of Chart/Log “Use conditions this round”).
  // When on: bake store weather into chart rows (same elev/temp/humidity/pressure/wind path).
  const conditions = roundConditions({
    useConditions: caddyUseConditions,
    elevFt: weather?.elevFt ?? 0,
    tempF: weather?.tempF ?? 70,
    humidityPct: weather?.humidityPct,
    pressureInhg: weather?.pressureInhg,
    windDir,
    windMph,
  });
  const isFit = preset === "fit";

  const chartRows = buildChart({
    enabledClubs,
    mph,
    loft: driverLoft,
    effort: 100,
    conditions,
    benchmarks: isFit ? benchmarks : [],
    lockSpeed: isFit,
    customClubs,
    clubLoftOverrides,
  });

  const effectiveQuality: LieQuality = lieType === "fairway" ? "favorable" : lieQuality;

  function onLieType(next: LieType) {
    setLieType(next);
    if (next === "fairway") setLieQuality("favorable");
  }

  const elevMagValue = (() => {
    const mag = Number.parseFloat(elevMagText);
    return Number.isFinite(mag) && mag >= 0 ? mag : 0;
  })();

  /** Magnitude only; direction (+/−) is separate. Clamp at 0 — never negative yards. */
  function bumpElevMag(delta: number) {
    const parsed = Number.parseFloat(elevMagText);
    const current = Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
    const next = Math.max(0, Math.min(200, current + delta));
    setElevMagText(String(next));
  }

  function recommend() {
    const pinYards = Number.parseFloat(pinText);
    if (!Number.isFinite(pinYards) || pinYards <= 0) {
      setResult(null);
      return;
    }
    const mag = Number.parseFloat(elevMagText);
    const elevMag = Number.isFinite(mag) && mag > 0 ? mag : 0;
    const elevationYards =
      elevSign === "flat" || elevMag === 0 ? 0 : elevSign === "up" ? elevMag : -elevMag;

    const pl = playsLike({
      pinYards,
      lieType,
      lieQuality: effectiveQuality,
      elevationYards,
    });
    const pick = pickClub(
      pl.playsLikeYards,
      chartRows.map((r) => ({ clubId: r.clubId, label: r.label, carry: r.carry })),
    );
    if (!pick) {
      setResult(null);
      return;
    }
    setResult({
      breakdown: formatBreakdown(pl.pinYards, pl.playsLikeYards, pick.label),
      clubLabel: pick.label,
      playsLikeYards: pl.playsLikeYards,
      pinYards: pl.pinYards,
      lieFactor: pl.lieFactor,
      weatherOn: Boolean(caddyUseConditions && conditions),
    });
  }

  function reset() {
    setLieType("fairway");
    setLieQuality("favorable");
    setPinText("");
    setElevSign("flat");
    setElevMagText("");
    setResult(null);
  }

  const canRecommend =
    chartRows.length > 0 &&
    Number.isFinite(Number.parseFloat(pinText)) &&
    Number.parseFloat(pinText) > 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl font-medium tracking-tight">Caddy</h2>
        <p className="text-sm text-muted">
          One-shot club pick from your Chart — lie, elevation, and Conditions when on.
        </p>
      </div>

      {result ? (
        <Panel className="flex flex-col gap-3">
          <p className="text-2xs font-medium tracking-widest text-gold uppercase">Recommended</p>
          <p className="font-display text-4xl font-medium tracking-tight text-gold italic">
            {result.clubLabel}
          </p>
          <p className="text-sm tabular-nums text-ink">{result.breakdown}</p>
          <p className="text-xs text-faint">
            Lie ×{result.lieFactor.toFixed(2)}
            {result.weatherOn ? " · weather on chart" : " · standard air"}
            {" · elev in yards (~1 yd / 1 yd elev)"}
          </p>
          <GhostButton className="mt-1 w-full" onClick={reset}>
            Reset / New shot
          </GhostButton>
        </Panel>
      ) : (
        <>
          <Panel className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">Use Conditions</div>
              <div className="text-xs text-muted">
                Weather from your location (or current Conditions settings)
              </div>
            </div>
            <Switch
              checked={caddyUseConditions}
              onChange={setCaddyUseConditions}
              label="Use Conditions"
            />
          </Panel>

          <Panel className="flex flex-col gap-4">
            <Field label="Lie">
              <div className="grid grid-cols-3 gap-1.5">
                {LIE_TYPES.map((t) => (
                  <Pill
                    key={t}
                    active={lieType === t}
                    onClick={() => onLieType(t)}
                    className="h-11 w-full min-w-0 px-2 text-xs"
                  >
                    {LIE_TYPE_LABELS[t]}
                  </Pill>
                ))}
              </div>
            </Field>

            {lieType !== "fairway" ? (
              <Field label="Lie quality" hint="Favorable sits up; Buried is dug in.">
                <div className="grid grid-cols-2 gap-1.5">
                  {QUALITIES.map((q) => (
                    <Pill
                      key={q}
                      active={lieQuality === q}
                      onClick={() => setLieQuality(q)}
                      className="h-11 w-full min-w-0 px-2 text-xs"
                    >
                      {LIE_QUALITY_LABELS[q]}
                    </Pill>
                  ))}
                </div>
              </Field>
            ) : (
              <p className="text-xs text-faint">Fairway uses Favorable lie (Buried hidden).</p>
            )}

            <Field label="Distance to pin (yd)">
              <TextInput
                inputMode="decimal"
                placeholder="e.g. 162"
                value={pinText}
                onChange={(e) => setPinText(e.target.value)}
                aria-label="Distance to pin in yards"
              />
            </Field>

            <Field
              label="Elevation to pin"
              hint="Yards of elevation. ~1 yd plays-like per 1 yd elev (uphill +, downhill −)."
            >
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    ["up", "Uphill +"],
                    ["flat", "Flat"],
                    ["down", "Downhill −"],
                  ] as const
                ).map(([id, label]) => (
                  <Pill
                    key={id}
                    active={elevSign === id}
                    onClick={() => setElevSign(id)}
                    className="h-11 w-full min-w-0 px-1 text-xs"
                  >
                    {label}
                  </Pill>
                ))}
              </div>
              {elevSign !== "flat" ? (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <StepperButton
                    aria-label="Decrease elevation by 1 yard"
                    disabled={elevMagValue <= 0}
                    onClick={() => bumpElevMag(-1)}
                  >
                    −
                  </StepperButton>
                  <TextInput
                    className="w-[5.5rem] shrink-0 px-2 text-center tabular-nums"
                    inputMode="decimal"
                    placeholder="yd"
                    value={elevMagText}
                    onChange={(e) => setElevMagText(e.target.value)}
                    aria-label="Elevation magnitude in yards"
                  />
                  <StepperButton
                    aria-label="Increase elevation by 1 yard"
                    disabled={elevMagValue >= 200}
                    onClick={() => bumpElevMag(1)}
                  >
                    +
                  </StepperButton>
                </div>
              ) : null}
            </Field>
          </Panel>

          {chartRows.length === 0 ? (
            <p className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-panel">
              Turn on clubs in Bag and check Chart distances first.
            </p>
          ) : null}

          <PrimaryButton disabled={!canRecommend} onClick={recommend}>
            Recommend
          </PrimaryButton>

          <p
            className={cn(
              "px-1 text-center text-xs text-faint",
              caddyUseConditions && conditions ? "text-muted" : "",
            )}
          >
            {caddyUseConditions && conditions
              ? `Using Chart with conditions${weather?.place ? ` · ${weather.place}` : ""}`
              : "Using Chart distances (conditions off)"}
          </p>
        </>
      )}
    </div>
  );
}
