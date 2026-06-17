// Weather data layer: helpers around the free, key-less Open-Meteo API.
// https://open-meteo.com/en/docs

export type WeatherData = {
  temperature: number; // rounded by the caller for display
  unit: string; // e.g. "°F"
  code: number; // WMO weather code
  label: string; // human description, e.g. "Light rain"
  emoji: string; // glanceable icon, e.g. "🌧️"
};

// Used when the browser denies/cannot provide geolocation. New York City.
export const FALLBACK_LOCATION = { latitude: 40.71, longitude: -74.01 };

export function buildForecastUrl(lat: number, lon: number): string {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,weather_code",
    temperature_unit: "fahrenheit",
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

// Maps a WMO weather code to a label + emoji. Ranges per Open-Meteo's docs.
export function weatherCodeToInfo(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: "Clear sky", emoji: "☀️" };
  if (code >= 1 && code <= 3) return { label: "Partly cloudy", emoji: "⛅" };
  if (code === 45 || code === 48) return { label: "Fog", emoji: "🌫️" };
  if (code >= 51 && code <= 67) return { label: "Rain", emoji: "🌧️" };
  if (code >= 71 && code <= 77) return { label: "Snow", emoji: "❄️" };
  if (code >= 80 && code <= 82) return { label: "Showers", emoji: "🌦️" };
  if (code >= 95 && code <= 99) return { label: "Thunderstorm", emoji: "⛈️" };
  return { label: "Unknown", emoji: "🌡️" };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const res = await fetch(buildForecastUrl(lat, lon));
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status}`);
  }

  const data = await res.json();
  const temperature: number = data.current.temperature_2m;
  const code: number = data.current.weather_code;
  const { label, emoji } = weatherCodeToInfo(code);

  return {
    temperature,
    unit: data.current_units?.temperature_2m ?? "°F",
    code,
    label,
    emoji,
  };
}
