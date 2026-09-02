export interface PlaceHit {
  name: string;
  detail: string;
  lat: number;
  lon: number;
}

export interface Forecast {
  tempF: number;
  elevFt: number;
  humidityPct: number;
  pressureInhg: number;
  windMph: number;
  lat: number;
  lon: number;
}

export async function searchPlaces(query: string): Promise<PlaceHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Place search failed");
  const data = (await res.json()) as {
    results?: {
      name: string;
      admin1?: string;
      country?: string;
      latitude: number;
      longitude: number;
    }[];
  };
  return (data.results ?? []).map((r) => {
    const bits = [r.admin1, r.country].filter(Boolean);
    return {
      name: r.name,
      detail: bits.join(", "),
      lat: r.latitude,
      lon: r.longitude,
    };
  });
}

function hpaToInhg(hpa: number) {
  return hpa / 33.863886;
}

export async function fetchForecast(lat: number, lon: number): Promise<Forecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m",
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Forecast failed");
  const data = (await res.json()) as {
    elevation?: number;
    current?: {
      temperature_2m?: number;
      relative_humidity_2m?: number;
      pressure_msl?: number;
      wind_speed_10m?: number;
    };
  };
  const cur = data.current ?? {};
  const tempF = cur.temperature_2m;
  if (typeof tempF !== "number") throw new Error("No temperature");
  const elevM = typeof data.elevation === "number" ? data.elevation : 0;
  const humidityPct = typeof cur.relative_humidity_2m === "number" ? cur.relative_humidity_2m : 50;
  const pressureInhg =
    typeof cur.pressure_msl === "number" ? hpaToInhg(cur.pressure_msl) : 29.92;
  const windMph = typeof cur.wind_speed_10m === "number" ? cur.wind_speed_10m : 0;
  return {
    tempF,
    elevFt: elevM * 3.28084,
    humidityPct,
    pressureInhg,
    windMph,
    lat,
    lon,
  };
}

export async function reversePlace(lat: number, lon: number): Promise<string> {
  try {
    const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("localityLanguage", "en");
    const res = await fetch(url.toString());
    if (!res.ok) return "My location";
    const data = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      principalSubdivisionCode?: string;
    };
    const city = data.city || data.locality;
    const region =
      data.principalSubdivisionCode?.replace(/^[A-Z]{2}-/, "") || data.principalSubdivision;
    if (city && region && city !== region) return `${city}, ${region}`;
    return city || region || "My location";
  } catch {
    return "My location";
  }
}
