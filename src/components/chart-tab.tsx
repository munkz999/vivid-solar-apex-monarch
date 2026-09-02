import { IdCard } from "lucide-react";
import { CLUB_BY_ID } from "@/lib/clubs";
import { weatherMultiplier } from "@/lib/model";
import { buildChart, fmtYd, roundConditions, type ChartRow } from "@/lib/chart";
import { currentMph, useBagStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "./ui";

function signed(n: number) {
  const r = Math.round(n);
  if (r === 0) return "even vs model";
  return `${r > 0 ? "+" : ""}${r} vs model`;
}

function vsLabel(row: ChartRow) {
  if (!row.isYours || row.vsModel === null) return "model";
  const delta = signed(row.vsModel);
  if (row.fitOrigin === "cascade") {
    const from = row.fromClubId ? CLUB_BY_ID[row.fromClubId].name : "fit";
    return `from ${from} · ${delta}`;
  }
  const avg = row.shotCount <= 1 ? "1 shot" : `${row.shotCount}-shot avg`;
  return `${avg} · ${delta}`;
}

export function ChartTab() {
  const enabledClubs = useBagStore((s) => s.enabledClubs);
  const driverLoft = useBagStore((s) => s.driverLoft);
  const benchmarks = useBagStore((s) => s.benchmarks);
  const useConditions = useBagStore((s) => s.useConditions);
  const weather = useBagStore((s) => s.weather);
  const windDir = useBagStore((s) => s.windDir);
  const windMph = useBagStore((s) => s.windMph);
  const mph = useBagStore(currentMph);
  const preset = useBagStore((s) => s.speedPreset);
  const setTab = useBagStore((s) => s.setTab);

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
  const chart = buildChart({
    enabledClubs,
    mph,
    loft: driverLoft,
    effort: 100,
    conditions,
    benchmarks: isFit ? benchmarks : [],
    lockSpeed: isFit,
  });

  const flightPct = conditions ? Math.round(weatherMultiplier(conditions) * 100) : 100;

  return (
    <div className="flex flex-col gap-4">
      {useConditions ? (
        <div className="flex items-center justify-between rounded-lg bg-surface px-3.5 py-2.5 text-xs text-muted shadow-panel">
          <span className="truncate">{weather?.place ?? "No location yet"}</span>
          <span className="font-medium text-gold tabular-nums">{flightPct}% flight</span>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl bg-surface shadow-panel">
        <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-end gap-2 border-b border-line px-4 pt-3 pb-2">
          <span className="text-2xs font-medium tracking-widest text-faint uppercase">Club</span>
          <span className="text-2xs text-right font-medium tracking-widest text-faint uppercase">
            Carry
          </span>
          <span className="text-2xs text-right font-medium tracking-widest text-faint uppercase">
            Total
          </span>
        </div>

        {chart.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Turn on clubs in Bag to build your chart.
          </p>
        ) : (
          <ul>
            {chart.map((row, i) => (
              <li
                key={row.clubId}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-2 px-4 py-3",
                  i < chart.length - 1 && "border-b border-line",
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tracking-tight text-ink">{row.label}</span>
                    {row.isYours ? (
                      <span className="rounded-pill bg-gold/15 px-1.5 py-0.5 text-2xs font-semibold tracking-wide text-gold uppercase">
                        Yours
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 text-xs text-faint">{vsLabel(row)}</div>
                </div>
                <div className="text-stat text-right font-sans text-gold tabular-nums">{fmtYd(row.carry)}</div>
                <div className="text-stat text-right font-sans text-ink tabular-nums">{fmtYd(row.total)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PrimaryButton disabled={chart.length === 0} onClick={() => setTab("card")}>
        <IdCard className="mr-2 size-4" strokeWidth={2} />
        Bag card
      </PrimaryButton>

      <p className="px-1 text-center text-xs text-faint">
        {isFit
          ? benchmarks.some((b) => b.kind !== "cascade")
            ? `Fit bag · ${mph} mph`
            : "Log shots in Fit to build this chart — showing Avg until then"
          : `${preset === "sr" ? "Sr" : preset[0].toUpperCase() + preset.slice(1)} template · ${mph} mph`}
        {useConditions ? " · conditions on" : ""}
      </p>
    </div>
  );
}
