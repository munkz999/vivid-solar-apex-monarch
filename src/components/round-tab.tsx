import { useEffect, useRef, useState } from "react";
import { weatherMultiplier, weatherParts } from "@/lib/model";
import { fetchForecast, reversePlace, searchPlaces, type PlaceHit } from "@/lib/weather";
import { useBagStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Field, GhostButton, Panel, Pill, PrimaryButton, Switch, TextInput } from "./ui";

const WIND: { id: "ignore" | "head" | "tail" | "cross"; label: string }[] = [
  { id: "ignore", label: "Ignore" },
  { id: "head", label: "Head" },
  { id: "tail", label: "Tail" },
  { id: "cross", label: "Cross" },
];

function pct(n: number) {
  const r = Math.round(n * 1000) / 10;
  if (r === 0) return "0";
  return `${r > 0 ? "+" : ""}${r}`;
}

export function RoundTab() {
  const useOn = useBagStore((s) => s.useConditions);
  const setUse = useBagStore((s) => s.setUseConditions);
  const weather = useBagStore((s) => s.weather);
  const setWeather = useBagStore((s) => s.setWeather);
  const patchWeather = useBagStore((s) => s.patchWeather);
  const windDir = useBagStore((s) => s.windDir);
  const setWindDir = useBagStore((s) => s.setWindDir);
  const windMph = useBagStore((s) => s.windMph);
  const setWindMph = useBagStore((s) => s.setWindMph);

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingWx, setLoadingWx] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const seq = useRef(0);
  const autoGeoTried = useRef(false);
  const userChosePlace = useRef(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const id = window.setTimeout(async () => {
      const n = ++seq.current;
      setSearching(true);
      try {
        const results = await searchPlaces(q);
        if (seq.current === n) setHits(results);
      } catch {
        if (seq.current === n) setError("Search failed — check connection.");
      } finally {
        if (seq.current === n) setSearching(false);
      }
    }, 280);
    return () => window.clearTimeout(id);
  }, [query]);

  async function applyPlace(
    place: string,
    lat: number,
    lon: number,
    opts?: { fromUser?: boolean },
  ) {
    if (opts?.fromUser) userChosePlace.current = true;
    setLoadingWx(true);
    setError(null);
    setGeoHint(null);
    try {
      const f = await fetchForecast(lat, lon);
      const wind = Math.min(30, Math.max(0, Math.round(f.windMph)));
      setWeather({
        place,
        lat: f.lat,
        lon: f.lon,
        elevFt: Math.round(f.elevFt),
        tempF: Math.round(f.tempF),
        humidityPct: Math.round(f.humidityPct),
        pressureInhg: Math.round(f.pressureInhg * 100) / 100,
        forecastWindMph: wind,
        fetchedAt: Date.now(),
      });
      setWindMph(wind);
      setHits([]);
      setQuery("");
      if (!useOn) setUse(true);
    } catch {
      setError("Weather unavailable. Distances stay on standard air until this works.");
    } finally {
      setLoadingWx(false);
    }
  }

  function useMyLocation(opts?: { silent?: boolean; fromUser?: boolean }) {
    const silent = opts?.silent === true;
    const fromUser = opts?.fromUser !== false && !silent;
    if (!navigator.geolocation) {
      if (silent) setGeoHint("Location unavailable — search a city, course, zip, or address.");
      else setError("Location isn’t available in this browser.");
      return;
    }
    setGeoBusy(true);
    if (!silent) setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Don’t overwrite an explicit place the user already chose / persisted.
          if (silent) {
            const cur = useBagStore.getState().weather;
            if (userChosePlace.current) return;
            if (cur && cur.place && !(cur.lat === 0 && cur.lon === 0)) return;
          }
          const name = await reversePlace(latitude, longitude);
          await applyPlace(name, latitude, longitude, { fromUser });
        } finally {
          setGeoBusy(false);
        }
      },
      () => {
        setGeoBusy(false);
        if (silent) {
          setGeoHint("Couldn’t get location — search a city, course, zip, or address.");
        } else {
          setError("Couldn’t read location. Search a city or course instead.");
        }
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
    );
  }

  // Auto-request device location on first Conditions open when no place is set yet.
  useEffect(() => {
    if (autoGeoTried.current) return;
    autoGeoTried.current = true;
    const cur = weather;
    if (userChosePlace.current) return;
    if (cur && cur.place && !(cur.lat === 0 && cur.lon === 0)) return;
    useMyLocation({ silent: true, fromUser: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);

  function editAir(p: Parameters<typeof patchWeather>[0]) {
    patchWeather(p);
    if (!useOn) setUse(true);
  }

  const elev = weather?.elevFt ?? 0;
  const temp = weather?.tempF ?? 70;
  const humidity = weather?.humidityPct ?? 50;
  const pressure = weather?.pressureInhg ?? 29.92;
  const input = {
    elevFt: useOn ? elev : 0,
    tempF: useOn ? temp : 70,
    humidityPct: useOn ? humidity : 50,
    pressureInhg: useOn ? pressure : 29.92,
    windDir: useOn ? windDir : ("ignore" as const),
    windMph: useOn ? windMph : 0,
  };
  const parts = weatherParts(input);
  const flightPct = Math.round(weatherMultiplier(input) * 100);
  const forecastWind = weather?.forecastWindMph;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-medium tracking-tight">Conditions</h2>
        <p className="text-sm text-muted">
          Elevation, temperature, humidity, pressure, and wind. Pull from a location or type them
          in.
        </p>
      </div>

      <Panel className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">Use conditions this round</div>
          <div className="text-xs text-muted">Scales carry on Chart and Log</div>
        </div>
        <Switch checked={useOn} onChange={setUse} label="Use conditions this round" />
      </Panel>

      <Panel>
        <Field label="Location">
          <TextInput
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            placeholder="Course, city, zip, or address"
            autoComplete="off"
          />
        </Field>
        {searching ? <p className="mt-2 text-xs text-faint">Searching…</p> : null}
        {hits.length > 0 ? (
          <ul className="mt-2 overflow-hidden rounded-md bg-raised">
            {hits.map((h) => (
              <li key={`${h.lat},${h.lon}`} className="border-b border-line last:border-0">
                <button
                  type="button"
                  className="flex min-h-12 w-full flex-col items-start px-3 py-2 text-left"
                  onClick={() => applyPlace(h.detail ? `${h.name}, ${h.detail}` : h.name, h.lat, h.lon, { fromUser: true })}
                >
                  <span className="text-sm font-medium">{h.name}</span>
                  {h.detail ? <span className="text-xs text-muted">{h.detail}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <PrimaryButton onClick={() => useMyLocation({ fromUser: true })} disabled={geoBusy || loadingWx}>
            {geoBusy ? "Locating…" : "Use my location"}
          </PrimaryButton>
          <GhostButton
            className="w-full"
            disabled={!weather || loadingWx || (weather.lat === 0 && weather.lon === 0)}
            onClick={() => weather && applyPlace(weather.place, weather.lat, weather.lon, { fromUser: true })}
          >
            {loadingWx ? "Updating…" : "Refresh"}
          </GhostButton>
        </div>
      </Panel>

      <Panel>
        <h3 className="text-2xs font-medium tracking-widest text-faint uppercase">Air</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <NumField
            label="Elevation"
            suffix="ft"
            value={weather?.elevFt}
            fallback={0}
            onChange={(n) => editAir({ elevFt: Math.min(14000, Math.max(-200, Math.round(n))) })}
          />
          <NumField
            label="Temp"
            suffix="°F"
            value={weather?.tempF}
            fallback={70}
            onChange={(n) => editAir({ tempF: Math.min(130, Math.max(-20, Math.round(n))) })}
          />
          <NumField
            label="Humidity"
            suffix="%"
            value={weather?.humidityPct}
            fallback={50}
            onChange={(n) => editAir({ humidityPct: Math.min(100, Math.max(0, Math.round(n))) })}
          />
          <NumField
            label="Pressure"
            suffix="inHg"
            step="0.01"
            value={weather?.pressureInhg}
            fallback={29.92}
            onChange={(n) =>
              editAir({ pressureInhg: Math.min(32, Math.max(24, Math.round(n * 100) / 100)) })
            }
          />
        </div>
        <p className="mt-3 text-xs text-faint">
          Pressure is sea-level. Elevation already covers altitude; this is high/low weather.
        </p>
      </Panel>

      <Panel>
        <Field label="Wind">
          <div className="grid grid-cols-4 gap-1.5">
            {WIND.map((w) => (
              <Pill key={w.id} active={windDir === w.id} onClick={() => setWindDir(w.id)} className="px-2">
                {w.label}
              </Pill>
            ))}
          </div>
        </Field>
        {windDir !== "ignore" ? (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-2xs font-medium tracking-widest text-muted uppercase">Speed</span>
              <span className="text-sm text-gold tabular-nums">{windMph} mph</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={windMph}
              onChange={(e) => setWindMph(Number(e.target.value))}
              className="w-full"
              aria-label="Wind speed"
            />
            {forecastWind != null ? (
              <p className="mt-2 text-xs text-muted">
                Station wind {forecastWind} mph
                {forecastWind !== windMph ? (
                  <>
                    {" · "}
                    <button
                      type="button"
                      className="font-medium text-gold"
                      onClick={() => setWindMph(forecastWind)}
                    >
                      Use it
                    </button>
                  </>
                ) : (
                  " · applied"
                )}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-xs text-faint">
            Pick a direction for the hole. Location fills speed
            {forecastWind != null ? ` (${forecastWind} mph)` : ""}.
          </p>
        )}
      </Panel>

      <Panel>
        <h3 className="text-2xs font-medium tracking-widest text-faint uppercase">Ball flight</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
          <Stat label="Place" value={weather?.place ?? "—"} />
          <Stat label="Ball-flight" value={`${flightPct}%`} gold />
          <Stat label="Elev" value={`${Math.round(elev)} ft`} />
          <Stat label="Temp" value={`${Math.round(temp)}°F`} />
          <Stat label="Humidity" value={`${Math.round(humidity)}%`} />
          <Stat label="Pressure" value={`${pressure.toFixed(2)} inHg`} />
        </dl>
        {useOn ? (
          <ul className="mt-4 space-y-1 text-xs text-muted tabular-nums">
            <li>Elevation {pct(parts.elev)}%</li>
            <li>Temperature {pct(parts.temp)}%</li>
            <li>Humidity {pct(parts.humidity)}%</li>
            <li>Pressure {pct(parts.pressure)}%</li>
            <li>Wind {pct(parts.wind)}%</li>
          </ul>
        ) : (
          <p className="mt-3 text-xs text-faint">Conditions off — 100% standard air.</p>
        )}
        {useOn && elev > 3000 ? (
          <p className="mt-3 text-xs text-gold">Above 3,000 ft — roll reduced.</p>
        ) : null}
      </Panel>

      {geoHint && !error ? <p className="px-1 text-sm text-muted">{geoHint}</p> : null}
      {error ? <p className="px-1 text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function NumField({
  label,
  suffix,
  value,
  fallback,
  onChange,
  step,
}: {
  label: string;
  suffix: string;
  value: number | undefined;
  fallback: number;
  onChange: (n: number) => void;
  step?: string;
}) {
  return (
    <Field label={`${label} (${suffix})`}>
      <TextInput
        inputMode="decimal"
        type="number"
        step={step ?? "1"}
        value={
          step
            ? Number(value ?? fallback).toFixed(2)
            : String(Math.round(value ?? fallback))
        }
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isFinite(n)) return;
          onChange(n);
        }}
      />
    </Field>
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <dt className="text-2xs tracking-widest text-faint uppercase">{label}</dt>
      <dd className={cn("mt-0.5 truncate text-base font-medium tabular-nums", gold ? "text-gold" : "text-ink")}>
        {value}
      </dd>
    </div>
  );
}
