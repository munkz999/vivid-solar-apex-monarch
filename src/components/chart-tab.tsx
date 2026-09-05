import { useState } from "react";
import { Printer, Share } from "lucide-react";
import { weatherMultiplier } from "@/lib/model";
import { buildChart, fmtYd, loftLabel, roundConditions } from "@/lib/chart";
import { saveBagCardPng } from "@/lib/bag-card";
import { currentMph, useBagStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { GhostButton, PrimaryButton } from "./ui";

export function ChartTab() {
  const enabledClubs = useBagStore((s) => s.enabledClubs);
  const driverLoft = useBagStore((s) => s.driverLoft);
  const benchmarks = useBagStore((s) => s.benchmarks);
  const manualClubYards = useBagStore((s) => s.manualClubYards);
  const useConditions = useBagStore((s) => s.useConditions);
  const weather = useBagStore((s) => s.weather);
  const windDir = useBagStore((s) => s.windDir);
  const windMph = useBagStore((s) => s.windMph);
  const mph = useBagStore(currentMph);
  const preset = useBagStore((s) => s.speedPreset);
  const gender = useBagStore((s) => s.gender);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const conditions = roundConditions({
    useConditions,
    elevFt: weather?.elevFt ?? 0,
    tempF: weather?.tempF ?? 70,
    humidityPct: weather?.humidityPct,
    pressureInhg: weather?.pressureInhg,
    windDir,
    windMph,
  });
  const isFit = preset === "fit";
  const rows = buildChart({
    enabledClubs,
    mph,
    loft: driverLoft,
    effort: 100,
    conditions,
    benchmarks: isFit ? benchmarks : [],
    lockSpeed: isFit,
    manualClubYards: isFit ? manualClubYards : {},
  });
  const flightPct = conditions ? Math.round(weatherMultiplier(conditions) * 100) : null;
  const yoursCount = rows.filter((r) => r.isYours).length;
  const loft = loftLabel(driverLoft);

  async function onSave() {
    if (rows.length === 0 || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await saveBagCardPng(rows, {
        mph,
        gender,
        loftLabel: loft,
        place: useConditions ? weather?.place : undefined,
        flightPct: flightPct ?? undefined,
      });
      if (result === "shared") setStatus("Shared");
      else if (result === "downloaded") setStatus("Saved to files");
    } catch {
      setStatus("Could not save");
    } finally {
      setBusy(false);
      window.setTimeout(() => setStatus(null), 1800);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="no-print">
        <h2 className="font-display text-xl font-medium tracking-tight">Chart</h2>
        <p className="text-sm text-muted">
          Your bag distances — print or save for the course.
        </p>
      </div>

      <div
        id="bag-card"
        className="overflow-hidden rounded-xl bg-surface px-4 pt-5 pb-4 shadow-panel"
      >
        <div className="text-center">
          <h3 className="font-display text-3xl leading-none font-medium text-gold italic">Bag Chart</h3>
          <p className="mt-2 text-xs tracking-wide text-muted tabular-nums">
            {mph} mph · Dr {loft}° · {gender === "women" ? "Women" : "Men"}
          </p>
          {useConditions && weather ? (
            <p className="mt-1 text-2xs text-faint">
              {weather.place} · {flightPct}% flight
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem] gap-2 border-t border-line pt-2">
          <span className="text-2xs font-medium tracking-widest text-faint uppercase">Club</span>
          <span className="text-2xs text-right font-medium tracking-widest text-faint uppercase">
            Carry
          </span>
          <span className="text-2xs text-right font-medium tracking-widest text-faint uppercase">
            Total
          </span>
        </div>

        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Turn on clubs in Bag first.</p>
        ) : (
          <ul>
            {rows.map((row, i) => (
              <li
                key={row.clubId}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem] items-center gap-2 py-2",
                  i < rows.length - 1 && "border-b border-line",
                )}
              >
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <span className="font-semibold tracking-tight">{row.label}</span>
                  {row.isYours ? (
                    <span className="text-2xs font-semibold tracking-wide text-gold uppercase">
                      Yours
                    </span>
                  ) : null}
                </div>
                <span className="text-right text-lg font-semibold text-gold tabular-nums">
                  {fmtYd(row.carry)}
                </span>
                <span className="text-right text-lg font-semibold tabular-nums">{fmtYd(row.total)}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 border-t border-line pt-3 text-center text-2xs tracking-wide text-faint uppercase">
          Yards
          {yoursCount ? ` · ${yoursCount} yours` : " · model"}
          {` · ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
        </p>
      </div>

      <div className="no-print grid grid-cols-2 gap-2">
        <GhostButton
          className="w-full"
          disabled={rows.length === 0}
          onClick={() => window.print()}
        >
          <Printer className="mr-2 size-4" strokeWidth={2} />
          Print
        </GhostButton>
        <PrimaryButton disabled={rows.length === 0 || busy} onClick={onSave}>
          <Share className="mr-2 size-4" strokeWidth={2} />
          {status ?? (busy ? "Saving…" : "Save image")}
        </PrimaryButton>
      </div>

      <p className="no-print px-1 text-center text-xs text-faint">
        {isFit
          ? benchmarks.some((b) => b.kind !== "cascade") ||
            Object.keys(manualClubYards).length > 0
            ? `Custom bag · ${mph} mph`
            : "Log shots in Log to build this chart — showing Avg until then"
          : `${preset === "sr" ? "Sr" : preset[0].toUpperCase() + preset.slice(1)} template · ${mph} mph`}
        {useConditions ? " · conditions on" : ""}
      </p>
    </div>
  );
}
