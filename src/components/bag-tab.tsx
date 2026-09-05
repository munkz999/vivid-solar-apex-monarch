import { useState } from "react";
import { Plus } from "lucide-react";
import {
  CLUBS,
  CUSTOM_CATEGORIES,
  CUSTOM_LOFT_MAX,
  CUSTOM_LOFT_MIN,
  DRIVER_LOFTS,
  GROUPS,
  STANDARD_LOFTS,
  bagClubList,
  clampClubLoft,
  formatLoftDeg,
  type CustomClubCategory,
} from "@/lib/clubs";
import { useBagStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Field, GhostButton, Pill, PrimaryButton, Switch, TextInput } from "./ui";

type AdjustTarget = { id: string; name: string; loft: number } | null;

export function BagTab() {
  const enabled = useBagStore((s) => s.enabledClubs);
  const customClubs = useBagStore((s) => s.customClubs);
  const loftOverrides = useBagStore((s) => s.clubLoftOverrides);
  const toggle = useBagStore((s) => s.toggleClub);
  const removeCustom = useBagStore((s) => s.removeCustomClub);
  const addCustomClub = useBagStore((s) => s.addCustomClub);
  const driverLoft = useBagStore((s) => s.driverLoft);
  const setDriverLoft = useBagStore((s) => s.setDriverLoft);
  const setClubLoft = useBagStore((s) => s.setClubLoft);
  const resetClubLofts = useBagStore((s) => s.resetClubLofts);
  const all = bagClubList(customClubs, loftOverrides, driverLoft);
  const count = all.filter((c) => enabled[c.id]).length;
  const hasOverrides = Object.keys(loftOverrides).length > 0;

  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customLoft, setCustomLoft] = useState("");
  const [customCategory, setCustomCategory] = useState<CustomClubCategory>("iron");
  const [flash, setFlash] = useState<string | null>(null);

  const [adjustTarget, setAdjustTarget] = useState<AdjustTarget>(null);
  const [adjustDraft, setAdjustDraft] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<AdjustTarget>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const loftN = Number(customLoft);
  const canSave =
    customName.trim().length > 0 &&
    Number.isFinite(loftN) &&
    loftN >= CUSTOM_LOFT_MIN &&
    loftN <= CUSTOM_LOFT_MAX;

  const adjustDraftN = Number(adjustDraft);
  const canApplyAdjust =
    !!adjustTarget &&
    Number.isFinite(adjustDraftN) &&
    adjustDraftN >= CUSTOM_LOFT_MIN &&
    adjustDraftN <= CUSTOM_LOFT_MAX;

  function resetForm() {
    setCustomName("");
    setCustomLoft("");
    setCustomCategory("iron");
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  function onSaveCustom() {
    if (!canSave) return;
    const club = addCustomClub({
      name: customName,
      category: customCategory,
      loft: loftN,
    });
    if (!club) return;
    closeModal();
    setFlash(`Added ${club.name}`);
    window.setTimeout(() => setFlash(null), 1600);
  }

  function openAdjust(club: { id: string; fullName: string; loft?: number }) {
    const loft =
      typeof club.loft === "number"
        ? club.loft
        : club.id === "dr"
          ? driverLoft
          : STANDARD_LOFTS[club.id as keyof typeof STANDARD_LOFTS] ?? 30;
    setAdjustTarget({ id: club.id, name: club.fullName, loft });
    setAdjustDraft(String(loft));
  }

  function requestApplyAdjust() {
    if (!canApplyAdjust || !adjustTarget) return;
    const next = clampClubLoft(adjustDraftN);
    if (Math.abs(next - adjustTarget.loft) < 0.049) {
      setAdjustTarget(null);
      return;
    }
    setPendingConfirm({ id: adjustTarget.id, name: adjustTarget.name, loft: next });
  }

  function confirmApplyAdjust() {
    if (!pendingConfirm) return;
    setClubLoft(pendingConfirm.id, pendingConfirm.loft);
    setFlash(`${pendingConfirm.name} → ${formatLoftDeg(pendingConfirm.loft)}`);
    window.setTimeout(() => setFlash(null), 1600);
    setPendingConfirm(null);
    setAdjustTarget(null);
  }

  function onResetLofts() {
    resetClubLofts();
    setConfirmReset(false);
    setFlash("Lofts reset to standards");
    window.setTimeout(() => setFlash(null), 1600);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-medium tracking-tight">Your bag</h2>
          <p className="text-sm text-muted">{count} clubs in play</p>
        </div>
        <GhostButton
          className="h-10 shrink-0 px-3 text-xs"
          onClick={() => setOpen(true)}
          aria-label="Add custom club"
        >
          <Plus className="mr-1 inline size-3.5" strokeWidth={2.4} />
          Custom
        </GhostButton>
      </div>

      {flash ? (
        <p className="px-1 text-sm text-gold" role="status">
          {flash}
        </p>
      ) : null}

      {GROUPS.map((g) => {
        const groupClubs = all.filter((c) => c.group === g.id);
        if (groupClubs.length === 0) return null;
        return (
          <section key={g.id} className="overflow-hidden rounded-xl bg-surface shadow-panel">
            <h3 className="border-b border-line px-4 py-2.5 text-2xs font-medium tracking-widest text-faint uppercase">
              {g.label}
            </h3>
            <ul>
              {groupClubs.map((club, i, arr) => (
                <li key={club.id} className={cn(i < arr.length - 1 && "border-b border-line")}>
                  <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
                    <div className="min-w-0">
                      <div className="font-medium text-ink">{club.fullName}</div>
                      <div className="flex flex-wrap items-center gap-x-1 text-xs text-faint">
                        {typeof club.loft === "number" ? (
                          <button
                            type="button"
                            className="tabular-nums text-muted underline-offset-2 hover:text-gold hover:underline"
                            onClick={() => openAdjust(club)}
                            aria-label={`Adjust loft for ${club.fullName}`}
                          >
                            {formatLoftDeg(club.loft)}
                            {club.loftAdjusted ? (
                              <span className="ml-1 text-gold">· adjusted</span>
                            ) : null}
                          </button>
                        ) : (
                          <span>—</span>
                        )}
                        {club.isCustom ? (
                          <>
                            <span className="mx-0.5">·</span>
                            <span className="font-semibold tracking-wide text-gold uppercase">
                              Custom
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <GhostButton
                        className="h-10 px-3 text-xs"
                        onClick={() => openAdjust(club)}
                      >
                        Adjust
                      </GhostButton>
                      {club.isCustom ? (
                        <GhostButton
                          className="h-10 px-3 text-xs text-danger"
                          onClick={() => removeCustom(club.id)}
                        >
                          Remove
                        </GhostButton>
                      ) : null}
                      <Switch
                        checked={!!enabled[club.id]}
                        onChange={() => toggle(club.id)}
                        label={`${enabled[club.id] ? "Remove" : "Add"} ${club.fullName}`}
                      />
                    </div>
                  </div>
                  {club.id === "dr" ? (
                    <div className="px-4 pt-1 pb-4">
                      <label className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-2xs font-medium tracking-widest text-muted uppercase">
                          Driver loft
                        </span>
                        <select
                          className={cn(
                            "h-11 min-w-[6.5rem] rounded-md bg-raised px-3 text-sm text-ink tabular-nums outline-none shadow-inset",
                            "focus:shadow-gold-focus",
                          )}
                          value={String(driverLoft)}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            if (!Number.isFinite(next)) return;
                            setPendingConfirm({
                              id: "dr",
                              name: "Driver",
                              loft: next,
                            });
                          }}
                          aria-label="Driver loft"
                        >
                          {DRIVER_LOFTS.map((deg) => (
                            <option key={deg} value={String(deg)}>
                              {deg}°
                            </option>
                          ))}
                        </select>
                      </label>
                      <p className="text-2xs text-faint">
                        Menu changes also update Chart distances for the driver.
                      </p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className="px-1">
        <GhostButton
          className="h-11 w-full text-xs"
          onClick={() => setConfirmReset(true)}
          disabled={!hasOverrides && Math.abs(driverLoft - STANDARD_LOFTS.dr) < 0.049}
        >
          Reset all lofts to standards
        </GhostButton>
        <p className="mt-2 text-xs text-muted">
          Shows loft under every club. Adjust only if you know your true lofts — Reset restores stock
          standards (customs keep the loft entered when added). Stock list has {CLUBS.length} clubs
          including 2 Iron.
        </p>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-custom-club-title"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="add-custom-club-title"
              className="font-display text-lg font-medium tracking-tight text-ink"
            >
              Add custom club
            </h3>
            <p className="mt-1 text-xs text-muted">
              Name, loft, and category place it on Bag and Chart by loft within its group.
            </p>

            <div className="mt-4">
              <Field label="Name">
                <TextInput
                  value={customName}
                  placeholder="e.g. DI, UW"
                  maxLength={24}
                  autoFocus
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-3">
              <Field label="Loft (°)">
                <TextInput
                  inputMode="decimal"
                  type="number"
                  min={CUSTOM_LOFT_MIN}
                  max={CUSTOM_LOFT_MAX}
                  step={0.5}
                  placeholder="18"
                  value={customLoft}
                  onChange={(e) => setCustomLoft(e.target.value)}
                />
              </Field>
              <p className="mt-1 text-2xs text-faint">
                {CUSTOM_LOFT_MIN}–{CUSTOM_LOFT_MAX}° · used for order and distance model
              </p>
            </div>

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

            <div className="mt-5 grid grid-cols-2 gap-2">
              <GhostButton className="w-full" onClick={closeModal}>
                Cancel
              </GhostButton>
              <PrimaryButton disabled={!canSave} onClick={onSaveCustom}>
                Add club
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}

      {adjustTarget && !pendingConfirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="adjust-loft-title"
          onClick={() => setAdjustTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="adjust-loft-title"
              className="font-display text-lg font-medium tracking-tight text-ink"
            >
              Adjust loft · {adjustTarget.name}
            </h3>
            <p className="mt-1 text-xs text-muted">
              Current {formatLoftDeg(adjustTarget.loft)}. Changes affect Chart ordering and modeled
              distances.
            </p>
            <div className="mt-4">
              <Field label="Loft (°)">
                <TextInput
                  inputMode="decimal"
                  type="number"
                  min={CUSTOM_LOFT_MIN}
                  max={CUSTOM_LOFT_MAX}
                  step={0.5}
                  value={adjustDraft}
                  autoFocus
                  onChange={(e) => setAdjustDraft(e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <GhostButton className="w-full" onClick={() => setAdjustTarget(null)}>
                Cancel
              </GhostButton>
              <PrimaryButton disabled={!canApplyAdjust} onClick={requestApplyAdjust}>
                Continue
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}

      {pendingConfirm ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="loft-warn-title"
          onClick={() => setPendingConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="loft-warn-title"
              className="font-display text-lg font-medium tracking-tight text-ink"
            >
              Confirm loft change
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Only adjust lofts if you’re certain of your clubs’ lofts. Wrong values will shift Chart
              distances and ordering.
            </p>
            <p className="mt-2 text-sm text-ink">
              {pendingConfirm.name} →{" "}
              <span className="font-semibold text-gold tabular-nums">
                {formatLoftDeg(pendingConfirm.loft)}
              </span>
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <GhostButton
                className="w-full"
                onClick={() => {
                  setPendingConfirm(null);
                }}
              >
                Cancel
              </GhostButton>
              <PrimaryButton onClick={confirmApplyAdjust}>Confirm</PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}

      {confirmReset ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-loft-title"
          onClick={() => setConfirmReset(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="reset-loft-title"
              className="font-display text-lg font-medium tracking-tight text-ink"
            >
              Reset all lofts?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Restores every stock club (including driver) to its standard loft and clears loft
              overrides. Custom clubs keep the loft you entered when you added them.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <GhostButton className="w-full" onClick={() => setConfirmReset(false)}>
                Cancel
              </GhostButton>
              <PrimaryButton onClick={onResetLofts}>Reset lofts</PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
