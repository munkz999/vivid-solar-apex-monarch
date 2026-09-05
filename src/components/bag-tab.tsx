import { useState } from "react";
import { Plus } from "lucide-react";
import {
  CLUBS,
  CUSTOM_CATEGORIES,
  CUSTOM_LOFT_MAX,
  CUSTOM_LOFT_MIN,
  DRIVER_LOFTS,
  GROUPS,
  bagClubList,
  formatLoftDeg,
  type CustomClubCategory,
} from "@/lib/clubs";
import { useBagStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Field, GhostButton, Pill, PrimaryButton, Switch, TextInput } from "./ui";

export function BagTab() {
  const enabled = useBagStore((s) => s.enabledClubs);
  const customClubs = useBagStore((s) => s.customClubs);
  const toggle = useBagStore((s) => s.toggleClub);
  const removeCustom = useBagStore((s) => s.removeCustomClub);
  const addCustomClub = useBagStore((s) => s.addCustomClub);
  const loft = useBagStore((s) => s.driverLoft);
  const setLoft = useBagStore((s) => s.setDriverLoft);
  const all = bagClubList(customClubs);
  const count = all.filter((c) => enabled[c.id]).length;

  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customLoft, setCustomLoft] = useState("");
  const [customCategory, setCustomCategory] = useState<CustomClubCategory>("iron");
  const [flash, setFlash] = useState<string | null>(null);

  const loftN = Number(customLoft);
  const canSave =
    customName.trim().length > 0 &&
    Number.isFinite(loftN) &&
    loftN >= CUSTOM_LOFT_MIN &&
    loftN <= CUSTOM_LOFT_MAX;

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
                      <div className="text-xs text-faint">
                        {club.isCustom ? (
                          <>
                            {typeof club.loft === "number" ? (
                              <>
                                {formatLoftDeg(club.loft)}
                                <span className="mx-1">·</span>
                              </>
                            ) : null}
                            <span className="font-semibold tracking-wide text-gold uppercase">
                              Custom
                            </span>
                          </>
                        ) : (
                          club.name
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
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
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-2xs font-medium tracking-widest text-muted uppercase">
                          Loft
                        </span>
                        <span className="text-sm text-gold tabular-nums">{loft}°</span>
                      </div>
                      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                        {DRIVER_LOFTS.map((deg) => {
                          const active = loft === deg;
                          return (
                            <button
                              key={deg}
                              type="button"
                              onClick={() => setLoft(deg)}
                              className={cn(
                                "h-11 min-w-12 shrink-0 rounded-pill px-2.5 text-sm tabular-nums",
                                "transition-[background-color,color,transform] duration-150 ease-out-smooth",
                                "active:scale-96",
                                active
                                  ? "bg-gold font-semibold text-gold-fg"
                                  : "bg-raised text-muted shadow-inset",
                              )}
                            >
                              {deg}°
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="px-1 text-xs text-muted">
        Add a custom club with name, loft, and category so it sorts into the right group on Bag and
        Chart. Stock list has {CLUBS.length} clubs.
      </p>

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
                  placeholder="e.g. DI, 2I, UW"
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
    </div>
  );
}
