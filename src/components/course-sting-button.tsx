import { useEffect, useState } from "react";
import { toggleCourseSting, isStingPlaying } from "@/lib/course-sting";
import { cn } from "@/lib/utils";

export function CourseStingButton() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isStingPlaying());
    window.addEventListener("bag-chart-sting", sync);
    return () => window.removeEventListener("bag-chart-sting", sync);
  }, []);

  return (
    <button
      type="button"
      aria-label={on ? "Stop the course sting" : "Play a short course sting"}
      aria-pressed={on}
      onClick={async () => {
        const playing = await toggleCourseSting();
        setOn(playing);
      }}
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full",
        "transition-transform duration-150 ease-out-smooth active:scale-96",
        on && "animate-pulse",
      )}
    >
      <GolfBallIcon playing={on} />
    </button>
  );
}

function GolfBallIcon({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
      <defs>
        <radialGradient id="ball" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff8e8" />
          <stop offset="55%" stopColor="#e8e0cc" />
          <stop offset="100%" stopColor="#c4b896" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill="url(#ball)" />
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke={playing ? "#d4b45a" : "color-mix(in oklab, #f4ecd6 28%, transparent)"}
        strokeWidth="1.25"
      />
      <circle cx="12" cy="11" r="1.05" fill="#b8ad90" opacity="0.7" />
      <circle cx="17.5" cy="9.5" r="1.05" fill="#b8ad90" opacity="0.65" />
      <circle cx="21" cy="13.5" r="1.05" fill="#b8ad90" opacity="0.6" />
      <circle cx="11.5" cy="16.5" r="1.05" fill="#b8ad90" opacity="0.55" />
      <circle cx="16.5" cy="15" r="1.05" fill="#b8ad90" opacity="0.5" />
      <circle cx="20.5" cy="18.5" r="1.05" fill="#b8ad90" opacity="0.55" />
      <circle cx="13.5" cy="21" r="1.05" fill="#b8ad90" opacity="0.5" />
      <circle cx="18" cy="21.5" r="1.05" fill="#b8ad90" opacity="0.45" />
    </svg>
  );
}
