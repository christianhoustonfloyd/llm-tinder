import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildForecastUrl,
  weatherCodeToInfo,
  fetchWeather,
} from "@/lib/weather";

describe("weatherCodeToInfo", () => {
  it("maps representative WMO codes to a label + emoji", () => {
    expect(weatherCodeToInfo(0)).toEqual({ label: "Clear sky", emoji: "☀️" });
    expect(weatherCodeToInfo(2)).toEqual({ label: "Partly cloudy", emoji: "⛅" });
    expect(weatherCodeToInfo(48)).toEqual({ label: "Fog", emoji: "🌫️" });
    expect(weatherCodeToInfo(61)).toEqual({ label: "Rain", emoji: "🌧️" });
    expect(weatherCodeToInfo(73)).toEqual({ label: "Snow", emoji: "❄️" });
    expect(weatherCodeToInfo(81)).toEqual({ label: "Showers", emoji: "🌦️" });
    expect(weatherCodeToInfo(95)).toEqual({ label: "Thunderstorm", emoji: "⛈️" });
  });

  it("falls back to Unknown for unrecognized codes", () => {
    expect(weatherCodeToInfo(999)).toEqual({ label: "Unknown", emoji: "🌡️" });
  });
});

describe("buildForecastUrl", () => {
  it("builds an Open-Meteo URL with the expected query params", () => {
    const url = new URL(buildForecastUrl(40.71, -74.01));
    expect(url.origin + url.pathname).toBe("https://api.open-meteo.com/v1/forecast");
    expect(url.searchParams.get("latitude")).toBe("40.71");
    expect(url.searchParams.get("longitude")).toBe("-74.01");
    expect(url.searchParams.get("current")).toBe("temperature_2m,weather_code");
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
  });
});

describe("fetchWeather", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps the Open-Meteo current payload to a WeatherData DTO", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 72.4, weather_code: 61 },
        current_units: { temperature_2m: "°F" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const weather = await fetchWeather(40.71, -74.01);

    expect(weather).toEqual({
      temperature: 72.4,
      unit: "°F",
      code: 61,
      label: "Rain",
      emoji: "🌧️",
    });
    expect(fetchMock).toHaveBeenCalledWith(buildForecastUrl(40.71, -74.01));
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(fetchWeather(0, 0)).rejects.toThrow("Open-Meteo request failed: 500");
  });
});
