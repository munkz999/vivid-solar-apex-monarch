/** Original morning-on-the-course sting. Not the Masters theme. */

let ctx: AudioContext | null = null;
let active: { stop: () => void } | null = null;

function audio(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
  }
  return ctx;
}

function tone(
  ac: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  gain: number,
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.04);
  g.gain.exponentialRampToValueAtTime(gain * 0.7, start + dur * 0.55);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

const MELODY: [number, number, number][] = [
  [369.99, 0.0, 0.42],
  [440.0, 0.36, 0.42],
  [587.33, 0.72, 0.62],
  [554.37, 1.22, 0.36],
  [493.88, 1.52, 0.46],
  [440.0, 1.92, 0.4],
  [369.99, 2.28, 0.5],
  [293.66, 2.74, 0.4],
  [440.0, 3.1, 0.5],
  [587.33, 3.55, 1.85],
];

export function isStingPlaying() {
  return active != null;
}

export function stopCourseSting() {
  active?.stop();
  active = null;
}

export async function toggleCourseSting(): Promise<boolean> {
  if (active) {
    stopCourseSting();
    return false;
  }
  const ac = audio();
  if (ac.state === "suspended") await ac.resume();
  const t0 = ac.currentTime + 0.04;
  const master = ac.createGain();
  master.gain.value = 0.16;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2400;
  filter.Q.value = 0.7;
  master.connect(filter);
  filter.connect(ac.destination);

  tone(ac, master, 146.83, t0, 5.6, "sine", 0.12);
  tone(ac, master, 220.0, t0 + 0.7, 4.9, "sine", 0.07);
  tone(ac, master, 293.66, t0 + 3.5, 2.1, "triangle", 0.05);

  for (const [freq, at, dur] of MELODY) {
    tone(ac, master, freq, t0 + at, dur, "triangle", 0.2);
    tone(ac, master, freq * 2, t0 + at, dur * 0.85, "sine", 0.04);
  }

  const timer = window.setTimeout(() => {
    if (active) {
      active = null;
      window.dispatchEvent(new Event("bag-chart-sting"));
    }
  }, 5800);

  active = {
    stop: () => {
      window.clearTimeout(timer);
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setValueAtTime(master.gain.value, ac.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.12);
      window.setTimeout(() => master.disconnect(), 180);
    },
  };
  return true;
}
