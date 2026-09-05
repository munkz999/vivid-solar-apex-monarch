import { CLUBS, DRIVER_LOFTS, GROUPS, bagClubList } from "@/lib/clubs";
import { useBagStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { GhostButton, Switch } from "./ui";

export function BagTab() {
  const enabled = useBagStore((s) => s.enabledClubs);
  const customClubs = useBagStore((s) => s.customClubs);
  const toggle = useBagStore((s) => s.toggleClub);
  const removeCustom = useBagStore((s) => s.removeCustomClub);
  const loft = useBagStore((s) => s.driverLoft);
  const setLoft = useBagStore((s) => s.setDriverLoft);
  const all = bagClubList(customClubs);
  const count = all.filter((c) => enabled[c.id]).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="font-display text-xl font-medium tracking-tight">Your bag</h2>
          <p className="text-sm text-muted">{count} clubs in play</p>
        </div>
      </div>

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
                      <div className="font-medium text-ink">
                        {club.fullName}
                        {club.isCustom ? (
                          <span className="ml-1.5 text-2xs font-semibold tracking-wide text-gold uppercase">
                            Custom
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-faint">{club.name}</div>
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

      {customClubs.length === 0 ? (
        <p className="px-1 text-xs text-muted">
          Add a custom club from Log (category: driver, wood, hybrid, iron, or wedges). Stock list has{" "}
          {CLUBS.length} clubs.
        </p>
      ) : null}
    </div>
  );
}
