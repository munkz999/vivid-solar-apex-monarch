/** Short golf cup-drop foley for successful Log saves.
 * Audio: public/assets/cup-drop.{mp3,ogg} — original synthesized foley (CC0).
 * Not from broadcast/TV/game libraries.
 */
let cached: HTMLAudioElement | null = null;

function resolveSrc() {
  const base = import.meta.env.BASE_URL ?? "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  // Prefer mp3; browsers that need ogg can fall through via <source> if we expand later.
  return `${root}assets/cup-drop.mp3`;
}

export function playCupDrop() {
  if (typeof window === "undefined") return;
  try {
    if (!cached) {
      cached = new Audio(resolveSrc());
      cached.preload = "auto";
      cached.volume = 0.85;
    }
    cached.currentTime = 0;
    void cached.play().catch(() => {
      /* autoplay / gesture policies — ignore */
    });
  } catch {
    /* ignore missing audio support */
  }
}
