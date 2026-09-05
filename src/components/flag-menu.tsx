import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Field, GhostButton, Pill, PrimaryButton } from "./ui";

export type FlagSheet = "menu" | "feedback" | "instructions" | "faq" | null;

const FEEDBACK_CATS = [
  { id: "bug", label: "Bug / glitch" },
  { id: "recommendation", label: "Recommendation" },
  { id: "feature", label: "Feature request" },
  { id: "general", label: "General feedback" },
  { id: "praise", label: "What’s working" },
] as const;

type FeedbackCat = (typeof FEEDBACK_CATS)[number]["id"];

const FEEDBACK_KEY = "bag-chart-feedback-v1";

function storeFeedbackLocally(entry: {
  category: FeedbackCat;
  message: string;
  at: number;
}) {
  try {
    const raw = window.localStorage.getItem(FEEDBACK_KEY);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    const next = Array.isArray(list) ? [...list, entry].slice(-40) : [entry];
    window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

function SheetFrame({
  title,
  onClose,
  children,
  onTitleTap,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  onTitleTap?: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-bg/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(88dvh,40rem)] w-full flex-col rounded-xl bg-surface shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-5 pt-5 pb-3">
          <button
            type="button"
            className="min-w-0 text-left"
            onClick={onTitleTap}
            aria-label={title}
          >
            <h2 className="font-display text-xl font-medium tracking-tight text-ink italic">{title}</h2>
          </button>
          <GhostButton className="h-10 shrink-0 px-3 text-xs" onClick={onClose}>
            Close
          </GhostButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function FeedbackForm({
  onDone,
  onBack,
}: {
  onDone: (msg: string) => void;
  onBack: () => void;
}) {
  const [category, setCategory] = useState<FeedbackCat>("general");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const canSend = message.trim().length >= 3;

  function submit() {
    if (!canSend) return;
    const entry = { category, message: message.trim(), at: Date.now() };
    storeFeedbackLocally(entry);
    console.info("[bag-chart feedback]", entry);
    setStatus("Thanks — your feedback was saved on this device. We’ll review it soon.");
    window.setTimeout(
      () => onDone("Thanks — your feedback was saved on this device. We’ll review it soon."),
      700,
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Tell us what’s broken, confusing, or missing. Feedback is saved on this device for now —
        we’ll add a shared inbox soon.
      </p>
      <Field label="Category">
        <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
          {FEEDBACK_CATS.map((c) => (
            <Pill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </Pill>
          ))}
        </div>
      </Field>
      <Field label="Your note">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 1200))}
          rows={5}
          placeholder="What happened? What would you change?"
          className={cn(
            "w-full rounded-md bg-raised px-3.5 py-3 text-base text-ink outline-none shadow-inset",
            "placeholder:text-faint focus:shadow-gold-focus",
          )}
        />
      </Field>
      {status ? <p className="text-sm text-gold">{status}</p> : null}
      <PrimaryButton disabled={!canSend} onClick={submit}>
        Submit
      </PrimaryButton>
      <GhostButton className="w-full" onClick={onBack}>
        Back
      </GhostButton>
    </div>
  );
}

function InstructionsBody() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted">
      <section>
        <h3 className="font-medium text-ink">Profiles</h3>
        <p className="mt-1">
          Use <span className="text-ink">Men</span> or <span className="text-ink">Women</span> in the
          header. Each profile has different stock swing-speed templates.
        </p>
      </section>
      <section>
        <h3 className="font-medium text-ink">Swing speed presets</h3>
        <p className="mt-1">
          Stock starting templates by typical distance — not a certified WHS handicap lookup. They
          never change from your logged shots.
        </p>
        <ul className="mt-1.5 list-disc space-y-1.5 pl-5">
          <li>
            <span className="text-ink">High</span> — higher-handicap players, roughly index{" "}
            <span className="text-ink">18+</span>. Preset driver ~85 mph men / ~70 mph women.
          </li>
          <li>
            <span className="text-ink">Mid</span> — middle of the pack, roughly{" "}
            <span className="text-ink">8–17</span>. Preset ~93 men / ~78 women.
          </li>
          <li>
            <span className="text-ink">Low</span> — stronger ball-strikers / lower handicaps, roughly{" "}
            <span className="text-ink">0–7</span>. Tour-leaning template (~118 men / ~96 women); once
            Pro is unlocked, <span className="text-ink">Custom</span> is the better fit.
          </li>
          <li>
            <span className="text-ink">Sr</span> — senior / older-swinger template (not a handicap
            band).
          </li>
          <li>
            <span className="text-ink">Custom</span> — Pro; built from your Log shots.
          </li>
        </ul>
      </section>
      <section>
        <h3 className="font-medium text-ink">Pro · Custom chart</h3>
        <p className="mt-1">
          Unlock Pro (one-time) for <span className="text-ink">Custom</span>,{" "}
          <span className="text-ink">Log</span>, and <span className="text-ink">Conditions</span>.
          Custom builds a personal chart from your speed and logged shots.
        </p>
      </section>
      <section>
        <h3 className="font-medium text-ink">Log</h3>
        <ul className="mt-1 list-disc space-y-1.5 pl-5">
          <li>Start by nudging the mph dial to your estimated driver speed, or jump straight into logging shots.</li>
          <li>
            Best first pass: log a solid <span className="text-ink">driver</span> shot with{" "}
            <span className="text-ink">Whole chart</span> so every club below scales from that result.
          </li>
          <li>
            Use <span className="text-ink">Hold</span> to keep existing custom shot data on clubs below, or{" "}
            <span className="text-ink">Overwrite</span> to replace that range for a full chart rebuild.
          </li>
          <li>Add custom clubs (driving iron, utility, etc.) from Log with a category so they sit in Bag and on the chart.</li>
        </ul>
      </section>
      <section>
        <h3 className="font-medium text-ink">Conditions (weather)</h3>
        <p className="mt-1">
          When Conditions is on, Chart and Log overlay elevation, temperature, humidity, pressure, and
          wind on ball flight. Location fills in automatically when allowed; search a course, city,
          zip, or address to override.
        </p>
      </section>
      <section>
        <h3 className="font-medium text-ink">Tabs</h3>
        <ul className="mt-1 list-disc space-y-1.5 pl-5">
          <li>
            <span className="text-ink">Chart</span> — your bag card; print or save an image for the course.
          </li>
          <li>
            <span className="text-ink">Bag</span> — which clubs are in play, plus driver loft.
          </li>
          <li>
            <span className="text-ink">Log</span> — swing speed and benchmark shots (Pro).
          </li>
          <li>
            <span className="text-ink">Conditions</span> — weather overlay (Pro).
          </li>
        </ul>
      </section>
      <section>
        <h3 className="font-medium text-ink">Tips</h3>
        <p className="mt-1">
          Prefer averages from a launch monitor or sim over one lucky range ball. Flag → Submit
          feedback to report bugs or ideas.
        </p>
      </section>
    </div>
  );
}

function FaqBody() {
  const items: { q: string; a: string }[] = [
    {
      q: "Are simulators better for logging?",
      a: "Yes. Sims and launch monitors are more reliable for shot tracking and pure swing stats than a single range session with mixed contact.",
    },
    {
      q: "One great shot or an average?",
      a: "Average several solid shots, then log that number. Outlier bombs or mishits will skew the whole Custom chart.",
    },
    {
      q: "How do I submit feedback or report a bug?",
      a: "Tap the flag (top left) → Submit feedback. Pick a category, write a short note, and Submit. Your note is saved on this device for now — we’ll review it soon.",
    },
    {
      q: "What does Unlock Pro include?",
      a: "A one-time unlock for Custom speed, Log, and Conditions. Use Restore purchase on the paywall if you already bought it on this Apple ID.",
    },
    {
      q: "What do High / Mid / Low mean?",
      a: "Rough handicap-index bands for the stock speed templates — not a certified WHS lookup. High ≈ 18+ (men ~85 mph / women ~70 mph). Mid ≈ 8–17 (~93 / ~78). Low ≈ 0–7, a tour-leaning fast template (~118 / ~96); use Custom once Pro is unlocked. Sr is a senior / older-swinger template, not a handicap band. Custom (Pro) is built from your Log shots.",
    },
    {
      q: "Custom vs Sr / High / Mid / Low?",
      a: "Presets are stock distance templates (see High / Mid / Low above). Custom is your fitted chart from entered speed and logged shots; presets stay unchanged.",
    },
    {
      q: "Hold vs Overwrite on Whole chart?",
      a: "Hold keeps custom shot data already logged on clubs in the range below. Overwrite replaces that range so the full chart can adjust from the shot you’re logging.",
    },
    {
      q: "Location and weather?",
      a: "Conditions tries your location first. Search anytime to override. Toggle “Use conditions this round” to apply elevation, temp, humidity, pressure, and wind on Chart and Log.",
    },
    {
      q: "I paid but Pro is locked again?",
      a: "Open any locked tab → Restore purchase. On the web demo, purchases may not persist across browsers; the iPhone app uses the App Store receipt.",
    },
  ];
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <section key={item.q} className="rounded-lg bg-raised px-3 py-3 shadow-inset">
          <h3 className="text-sm font-medium text-ink">{item.q}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.a}</p>
        </section>
      ))}
    </div>
  );
}

export function FlagMenuSheets({
  sheet,
  setSheet,
  onDemoToggle,
  toast,
  onThanks,
}: {
  sheet: FlagSheet;
  setSheet: (s: FlagSheet) => void;
  onDemoToggle: () => void;
  toast?: string | null;
  onThanks?: (msg: string) => void;
}) {
  if (!sheet) return null;

  if (sheet === "menu") {
    return (
      <SheetFrame title="Menu" onClose={() => setSheet(null)} onTitleTap={onDemoToggle}>
        <div className="flex flex-col gap-2">
          {(
            [
              { id: "feedback" as const, label: "Submit feedback", hint: "Bugs, ideas, praise" },
              { id: "instructions" as const, label: "Instructions", hint: "How to use Bag Chart" },
              { id: "faq" as const, label: "FAQ", hint: "Common questions" },
            ] as const
          ).map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSheet(row.id)}
              className="flex min-h-14 items-center justify-between gap-3 rounded-lg bg-raised px-4 text-left shadow-inset transition-transform duration-150 active:scale-96"
            >
              <span>
                <span className="block font-medium text-ink">{row.label}</span>
                <span className="block text-xs text-muted">{row.hint}</span>
              </span>
              <span className="text-gold">›</span>
            </button>
          ))}
          <p className="mt-3 px-1 text-2xs leading-relaxed text-faint">
            Long-press the flag anytime for a discreet Pro demo toggle.
          </p>
        </div>
        {toast ? (
          <p className="mt-3 text-center text-xs font-semibold text-gold" role="status">
            {toast}
          </p>
        ) : null}
      </SheetFrame>
    );
  }

  if (sheet === "feedback") {
    return (
      <SheetFrame title="Submit feedback" onClose={() => setSheet(null)}>
        <FeedbackForm
          onBack={() => setSheet("menu")}
          onDone={(msg) => {
            setSheet(null);
            onThanks?.(msg);
          }}
        />
      </SheetFrame>
    );
  }

  if (sheet === "instructions") {
    return (
      <SheetFrame title="Instructions" onClose={() => setSheet(null)} onTitleTap={onDemoToggle}>
        <InstructionsBody />
        <GhostButton className="mt-4 w-full" onClick={() => setSheet("menu")}>
          Back to menu
        </GhostButton>
      </SheetFrame>
    );
  }

  return (
    <SheetFrame title="FAQ" onClose={() => setSheet(null)}>
      <FaqBody />
      <GhostButton className="mt-4 w-full" onClick={() => setSheet("menu")}>
        Back to menu
      </GhostButton>
    </SheetFrame>
  );
}

