import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  CUSTOM_CATEGORIES,
  bagClubList,
  resolveBagClub,
  type CustomClubCategory,
} from "@/lib/clubs";
import { clubRoll, modelCarryRaw, weatherMultiplier, type ConditionsInput } from "@/lib/model";
import { buildChart, fmtYd, roundConditions } from "@/lib/chart";
import { currentMph, isDirectShot, useBagStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Field, GhostButton, Pill, PrimaryButton, TextInput } from "./ui";

function timeLabel(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function shownYards(b: { carry: number; total?: number }, wx: number, rollWx: number) {
  const carry = Math.round(b.carry * wx);
  const roll = b.total != null ? (b.total - b.carry) * rollWx : null;
  const total = roll != null ? Math.round(carry + roll) : null;
  return { carry, total };
}

function signed(n: number) {
  const r = Math.round(n);
  if (r === 0) return "even";
  return `${r > 0 ? "+" : ""}${r}`;
}

function rangeLabel(clubs: { name: string }[]) {
  if (clubs.length === 0) return "";
  if (clubs.length === 1) return clubs[0].name;
  return `${clubs[0].name}–${clubs[clubs.length - 1].name}`;
}

export function BenchmarkTab() {
  const enabled = useBagStore((s) => s.enabledClubs);
  const customClubs = useBagStore((s) => s.customClubs);
  const mph = useBagStore(currentMph);
  const loft = useBagStore((s) => s.driverLoft);
  const logShot = useBagStore((s) => s.logShot);
  const remove = useBagStore((s) => s.deleteBenchmark);
  const clear = useBagStore((s) => s.clearBenchmarks);
  const list = useBagStore((s) => s.benchmarks);
  const useConditions = useBagStore((s) => s.useConditions);
  const weather = useBagStore((s) => s.weather);
  const windDir = useBagStore((s) => s.windDir);
  const windMph = useBagStore((s) => s.windMph);
  const adjustMode = useBagStore((s) => s.adjustMode);
  const setAdjustMode = useBagStore((s) => s.setAdjustMode);
  const overwriteBelow = useBagStore((s) => s.overwriteBelow);
  const setOverwriteBelow = useBagStore((s) => s.setOverwriteBelow);
  const revertFit = useBagStore((s) => s.revertFit);
  const canRevert = useBagStore((s) => s.fitHistory.length > 0);
  const draft = useBagStore((s) => s.fitDraft);
  const setFitDraft = useBagStore((s) => s.setFitDraft);
  const applyManualMph = useBagStore((s) => s.applyManualMph);
  const manualMph = useBagStore((s) => s.manualMph);
  const addCustomClub = useBagStore((s) => s.addCustomClub);

  const inBag = useMemo(
    () => bagClubList(customClubs).filter((c) => enabled[c.id]),
    [customClubs, enabled],
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const [speedEdit, setSpeedEdit] = useState<string | null>(null);
  const [pendingMph, setPendingMph] = useState<number | null>(null);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<CustomClubCategory>("iron");

  const clubId = draft.clubId;
  const carry = draft.carry;
  const total = draft.total;
  const activeClub = inBag.some((c) => c.id === clubId) ? clubId : (inBag[0]?.id ?? "dr");
  const activeMeta = resolveBagClub(activeClub, customClubs);
  const carryN = Number(carry);
  const totalN = Number(total);
  const canSave =
    inBag.length > 0 &&
    Number.isFinite(carryN) &&
    carryN >= 1 &&
    carryN <= 450 &&
    Number.isFinite(totalN) &&
    totalN >= carryN &&
    totalN <= 500 &&
    totalN - carryN <= 80;

  const conditions: ConditionsInput | null = useConditions
    ? {
        elevFt: weather?.elevFt ?? 0,
        tempF: weather?.tempF ?? 70,
        humidityPct: weather?.humidityPct ?? 50,
        pressureInhg: weather?.pressureInhg ?? 29.92,
        windDir,
        windMph,
      }
    : null;
  const wx = conditions ? weatherMultiplier(conditions) : 1;
  const rollWx = conditions && conditions.elevFt > 3000 ? 0.7 : 1;

  useEffect(() => {
    if (draft.clubId !== activeClub) {
      setFitDraft({ clubId: activeClub });
    }
  }, [activeClub, draft.clubId, setFitDraft]);

  useEffect(() => {
    if (draft.carry !== "" || draft.total !== "") return;
    const last = list.find((b) => b.clubId === activeClub && isDirectShot(b));
    if (!last) return;
    const shown = shownYards(last, wx, rollWx);
    setFitDraft({
      clubId: activeClub,
      carry: String(shown.carry),
      total: shown.total != null ? String(shown.total) : "",
    });
  }, [activeClub]);

  const modelId = activeMeta?.modelClubId ?? "dr";
  const modelCarry = modelCarryRaw(modelId, mph, loft);
  const modelTotal = modelCarry + clubRoll(modelId, loft);
  const shotCount = list.filter((b) => b.clubId === activeClub && isDirectShot(b)).length;

  const activeIdx = inBag.findIndex((c) => c.id === activeClub);
  const below = activeIdx >= 0 ? inBag.slice(activeIdx + 1) : [];
  const heldClubs = below.filter((c) => list.some((b) => b.clubId === c.id && isDirectShot(b)));
  const cascadeTargets = overwriteBelow
    ? below
    : below.filter((c) => !heldClubs.some((h) => h.id === c.id));
  const wholeChart = adjustMode === "chart" && below.length > 0;
  const belowRange = rangeLabel(below);

  const live =
    canSave && Number.isFinite(carryN)
      ? {
          storedCarry: Math.round(carryN / wx),
          storedTotal: Math.round(carryN / wx + (totalN - carryN) / rollWx),
          scalePct: modelCarry === 0 ? 0 : (carryN / wx / modelCarry - 1) * 100,
          roll: totalN - carryN,
        }
      : null;

  function onSave() {
    if (!canSave || !live) return;
    const { cascaded, held, overwritten } = logShot(
      {
        clubId: activeClub,
        carry: live.storedCarry,
        total: live.storedTotal,
        notes: "",
        driverMph: mph,
      },
      { wholeChart, overwrite: overwriteBelow },
    );
    const after = shotCount + 1;
    const bits = [
      wholeChart ? "Whole chart updated" : `Logged ${Math.round(carryN)}/${Math.round(totalN)}`,
    ];
    if (after > 1 && !wholeChart) bits.push(`${after} shots`);
    if (cascaded) bits.push(`${cascaded} below`);
    if (held) bits.push(`${held} held`);
    if (overwritten) bits.push(`${overwritten} overwritten`);
    setSavedFlash(bits.join(" · "));
    window.setTimeout(() => setSavedFlash(null), 2000);
  }

  const logEntries = list.filter(isDirectShot);

  function requestMph(raw: number) {
    if (!Number.isFinite(raw)) return;
    const next = Math.min(130, Math.max(55, Math.round(raw)));
    if (next === mph) return;
    if (logEntries.length > 0) {
      setPendingMph(next);
      return;
    }
    applyManualMph(next);
  }

  function confirmManualSpeed() {
    if (pendingMph == null) return;
    applyManualMph(pendingMph);
    setPendingMph(null);
  }

  const fitConditions = roundConditions({
    useConditions,
    elevFt: weather?.elevFt ?? 0,
    tempF: weather?.tempF ?? 70,
    humidityPct: weather?.humidityPct,
    pressureInhg: weather?.pressureInhg,
    windDir,
    windMph,
  });
  const compactChart = buildChart({
    enabledClubs: enabled,
    mph,
    loft,
    effort: 100,
    conditions: fitConditions,
    benchmarks: list,
    lockSpeed: true,
    customClubs,
  });

  function onAddCustom() {
    const club = addCustomClub({ name: customName, category: customCategory });
    if (!club) return;
    setCustomName("");
    setAddingCustom(false);
    setSavedFlash(`Added ${club.name}`);
    window.setTimeout(() => setSavedFlash(null), 1600);
  }

  function holdOverwriteCopy() {
    if (adjustMode === "single") {
      return `Only ${activeMeta?.name ?? activeClub} updates.`;
    }
    if (below.length === 0) {
      return `Nothing below ${activeMeta?.name ?? activeClub} — this log is this club only.`;
    }
    if (overwriteBelow) {
      return `Overwrite: clubs in ${belowRange} will have their custom shot data overwritten for full chart adjustment.`;
    }
    if (heldClubs.length) {
      return `Hold: custom club shot information in ${belowRange} will not be modified (keeping ${heldClubs.map((c) => c.name).join(", ")}). Other clubs in that range still scale.`;
    }
    return `Hold: custom club shot information in ${belowRange} will not be modified. Clubs without logged shots in that range will scale.`;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-medium tracking-tight">Log</h2>
          <p className="text-sm text-muted">
            Set a swing speed or log shots. Logged shots update the Custom speed; templates stay stock.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Slower"
              disabled={mph <= 55}
              onClick={() => requestMph(mph - 1)}
              className="flex size-10 items-center justify-center rounded-full bg-raised text-lg font-medium text-gold shadow-inset disabled:opacity-35"
            >
              −
            </button>
            <div className="flex size-[5.5rem] flex-col items-center justify-center rounded-full bg-gold text-gold-fg shadow-panel">
              <input
                aria-label="Predicted swing speed"
                inputMode="numeric"
                pattern="[0-9]*"
                value={speedEdit ?? String(mph)}
                onFocus={() => setSpeedEdit(String(mph))}
                onChange={(e) => setSpeedEdit(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                onBlur={() => {
                  const typed = speedEdit;
                  setSpeedEdit(null);
                  if (!typed) return;
                  const raw = Number(typed);
                  if (!Number.isFinite(raw)) return;
                  requestMph(raw);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                className="w-16 bg-transparent text-center font-display text-3xl leading-none font-medium text-gold-fg tabular-nums outline-none"
              />
              <span className="-mt-0.5 text-[10px] font-semibold tracking-widest uppercase">mph</span>
            </div>
            <button
              type="button"
              aria-label="Faster"
              disabled={mph >= 130}
              onClick={() => requestMph(mph + 1)}
              className="flex size-10 items-center justify-center rounded-full bg-raised text-lg font-medium text-gold shadow-inset disabled:opacity-35"
            >
              +
            </button>
          </div>
          <p className="mt-1.5 max-w-[8.5rem] text-center text-2xs leading-tight text-muted">
            {logEntries.length
              ? "From your shots · tap to set"
              : manualMph != null
                ? "Entered speed"
                : "Predicted swing speed"}
          </p>
        </div>
      </div>

      {pendingMph != null ? (
        <div className="rounded-xl bg-surface p-4 shadow-panel">
          <h3 className="font-display text-lg font-medium tracking-tight">Build a new chart?</h3>
          <p className="mt-2 text-sm text-muted">
            Entering {pendingMph} mph manually will erase your custom club chart and all logged
            shots, then build a new one from this speed.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <GhostButton className="w-full" onClick={() => setPendingMph(null)}>
              Cancel
            </GhostButton>
            <button
              type="button"
              onClick={confirmManualSpeed}
              className="inline-flex h-12 w-full items-center justify-center rounded-pill bg-danger px-5 text-sm font-semibold text-white"
            >
              Erase and set {pendingMph}
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl bg-surface p-4 shadow-panel">
        <Field label="Log a shot">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {inBag.map((c) => (
              <Pill
                key={c.id}
                active={activeClub === c.id}
                onClick={() => {
                  const last = list.find((b) => b.clubId === c.id && isDirectShot(b));
                  const shown = last ? shownYards(last, wx, rollWx) : null;
                  setFitDraft({
                    clubId: c.id,
                    carry: shown ? String(shown.carry) : "",
                    total: shown?.total != null ? String(shown.total) : "",
                  });
                }}
              >
                {c.id === "dr" ? "Dr" : c.name}
              </Pill>
            ))}
            <Pill
              active={addingCustom}
              onClick={() => setAddingCustom((v) => !v)}
              aria-label="Add custom club"
            >
              <Plus className="mr-0.5 inline size-3.5" strokeWidth={2.4} />
              Custom
            </Pill>
          </div>
        </Field>

        {addingCustom ? (
          <div className="mt-4 rounded-lg bg-raised p-3 shadow-inset">
            <Field label="Custom club name">
              <TextInput
                value={customName}
                placeholder="e.g. DI, 2I, UW"
                maxLength={24}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </Field>
            <div className="mt-3">
              <Field label="Category">
                <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                  {CUSTOM_CATEGORIES.map((cat) => (
                    <Pill
                      key={cat.id}
                      active={customCategory === cat.id}
                      onClick={() => setCustomCategory(cat.id)}
                    >
                      {cat.label}
                    </Pill>
                  ))}
                </div>
              </Field>
            </div>
            <p className="mt-2 text-xs text-muted">
              Uses the {CUSTOM_CATEGORIES.find((c) => c.id === customCategory)?.label.toLowerCase()}{" "}
              model for chart distances. Added clubs appear in Bag and on the Custom chart.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <GhostButton className="w-full" onClick={() => setAddingCustom(false)}>
                Cancel
              </GhostButton>
              <PrimaryButton disabled={!customName.trim()} onClick={onAddCustom}>
                Add club
              </PrimaryButton>
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="Carry (yd)">
            <TextInput
              inputMode="decimal"
              type="number"
              min={1}
              max={450}
              placeholder={`${Math.round(modelCarry)}`}
              value={carry}
              onChange={(e) => setFitDraft({ carry: e.target.value })}
            />
          </Field>
          <Field label="Total (yd)">
            <TextInput
              inputMode="decimal"
              type="number"
              min={1}
              max={500}
              placeholder={`${Math.round(modelTotal)}`}
              value={total}
              onChange={(e) => setFitDraft({ total: e.target.value })}
            />
          </Field>
        </div>

        {live ? (
          <p className="mt-3 text-sm text-gold">
            {Math.round(live.roll)} yd roll
            {wx !== 1 || rollWx !== 1 ? ` · stored ${live.storedCarry}/${live.storedTotal}` : ""}
          </p>
        ) : (
          <p className="mt-3 text-xs text-faint">
            Use a monitor. Placeholders are the {mph} mph template.
          </p>
        )}

        <div className="mt-4">
          <Field label="Adjustment">
            <div className="flex gap-1.5">
              <Pill
                className="flex-1"
                active={adjustMode === "single"}
                onClick={() => setAdjustMode("single")}
              >
                Single club
              </Pill>
              <Pill
                className="flex-1"
                active={adjustMode === "chart"}
                onClick={() => setAdjustMode("chart")}
              >
                Whole chart
              </Pill>
            </div>
          </Field>
        </div>

        {adjustMode === "chart" ? (
          <div className="mt-3">
            <Field label="Logged clubs below">
              <div className="flex gap-1.5">
                <Pill
                  className="flex-1"
                  active={!overwriteBelow}
                  onClick={() => setOverwriteBelow(false)}
                >
                  Hold
                </Pill>
                <Pill
                  className="flex-1"
                  active={overwriteBelow}
                  onClick={() => setOverwriteBelow(true)}
                >
                  Overwrite
                </Pill>
              </div>
            </Field>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-muted">{holdOverwriteCopy()}</p>

        {wholeChart && live ? (
          <p className="mt-2 text-xs text-gold">
            {cascadeTargets.length} club{cascadeTargets.length === 1 ? "" : "s"} below scale{" "}
            {signed(live.scalePct)}
            {!overwriteBelow && heldClubs.length ? ` · ${heldClubs.length} held` : ""}
            {overwriteBelow && heldClubs.length ? ` · ${heldClubs.length} overwritten` : ""}
          </p>
        ) : null}

        <PrimaryButton className="mt-5" disabled={!canSave} onClick={onSave}>
          {savedFlash ?? (wholeChart ? "Log whole chart" : "Log shot")}
        </PrimaryButton>
        {canRevert ? (
          <GhostButton
            className="mt-2 w-full"
            onClick={() => {
              if (revertFit()) {
                setSavedFlash("Chart restored");
                window.setTimeout(() => setSavedFlash(null), 1600);
              }
            }}
          >
            Revert last
          </GhostButton>
        ) : null}
      </div>

      <section>
        <h3 className="mb-2 px-1 text-2xs font-medium tracking-widest text-faint uppercase">Shot log</h3>

        {logEntries.length === 0 ? (
          <p className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-panel">
            No shots yet. Log carry and total from a monitor to start YOURS.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl bg-surface shadow-panel">
            {logEntries.map((b, i) => {
              const club = resolveBagClub(b.clubId, customClubs);
              const shown = shownYards(b, wx, rollWx);
              const mid = club?.modelClubId ?? "7i";
              const modelThen = modelCarryRaw(mid, b.driverMph, loft);
              const vs = b.carry - modelThen;
              const roll = shown.total != null ? Math.max(0, shown.total - shown.carry) : null;
              const cascaded = list.filter(
                (x) => x.kind === "cascade" && x.batchId === b.batchId,
              ).length;
              return (
                <li
                  key={b.id}
                  className={cn(
                    "flex items-start justify-between gap-2 px-3 py-3",
                    i < logEntries.length - 1 && "border-b border-line",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{club?.name ?? b.clubId}</span>
                      <span className="text-2xs text-muted tabular-nums">
                        {shown.carry}
                        {shown.total != null ? ` / ${shown.total}` : ""} yd
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {signed(vs)} vs model
                      {roll != null ? ` · ${roll} yd roll` : ""}
                      {` · ${b.driverMph} mph`}
                      {cascaded ? ` · cascaded ${cascaded}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-xs text-faint tabular-nums">{timeLabel(b.savedAt)}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${club?.name ?? b.clubId} shot`}
                      onClick={() => remove(b.id)}
                      className="flex size-11 items-center justify-center text-faint transition-colors duration-150 hover:text-danger"
                    >
                      <X className="size-4" strokeWidth={2} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-2 px-1 text-2xs font-medium tracking-widest text-faint uppercase">
          Custom chart
        </h3>
        <p className="mb-2 px-1 text-xs text-muted">
          Read-only preview from logged shots. To change distances, log benchmark shots above.
        </p>
        {compactChart.length === 0 ? (
          <p className="rounded-xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-panel">
            Turn on clubs in Bag to see distances.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl bg-surface shadow-panel">
            {compactChart.map((row, i) => (
              <li
                key={row.clubId}
                className={cn(
                  "grid grid-cols-[minmax(0,1fr)_3.25rem_3.25rem] items-center gap-2 px-3 py-2.5",
                  i < compactChart.length - 1 && "border-b border-line",
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold tracking-tight">{row.label}</span>
                    {row.isYours ? (
                      <span className="text-2xs font-semibold tracking-wide text-gold uppercase">
                        Yours
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="text-right text-base font-semibold text-gold tabular-nums">
                  {fmtYd(row.carry)}
                </span>
                <span className="text-right text-base font-semibold tabular-nums">
                  {fmtYd(row.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {list.length > 0 ? (
        <section className="rounded-xl bg-surface p-4 shadow-panel">
          {confirmClear ? (
            <div>
              <h3 className="font-display text-lg font-medium tracking-tight">Start over?</h3>
              <p className="mt-2 text-sm text-muted">
                This erases your custom club chart and all logged shots. You intend to start over
                from the stock templates.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <GhostButton className="w-full" onClick={() => setConfirmClear(false)}>
                  Cancel
                </GhostButton>
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setConfirmClear(false);
                    setSavedFlash(null);
                  }}
                  className="inline-flex h-12 w-full items-center justify-center rounded-pill bg-danger px-5 text-sm font-semibold text-white"
                >
                  Erase chart
                </button>
              </div>
            </div>
          ) : (
            <GhostButton className="w-full text-danger" onClick={() => setConfirmClear(true)}>
              Start over
            </GhostButton>
          )}
        </section>
      ) : null}
    </div>
  );
}
