"use client";

import { useEffect, useState } from "react";
import { fetchWeather, FALLBACK_LOCATION, type WeatherData } from "@/lib/weather";

type Status = "loading" | "ready" | "error";

export default function WeatherWidget() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(lat: number, lon: number) {
      try {
        const weather = await fetchWeather(lat, lon);
        if (!cancelled) {
          setData(weather);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        // Denied or unavailable → fall back to a default city.
        () => load(FALLBACK_LOCATION.latitude, FALLBACK_LOCATION.longitude),
      );
    } else {
      load(FALLBACK_LOCATION.latitude, FALLBACK_LOCATION.longitude);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const pill =
    "rounded-full border border-black/10 px-3 py-1.5 text-sm dark:border-white/15";

  if (status === "error") {
    return (
      <span className={`${pill} text-neutral-400`} aria-label="Weather unavailable">
        —
      </span>
    );
  }

  if (status === "loading" || !data) {
    return (
      <span
        className={`${pill} animate-pulse text-neutral-400`}
        aria-label="Loading weather"
      >
        …
      </span>
    );
  }

  return (
    <span
      className={pill}
      title={data.label}
      aria-label={`${data.label}, ${Math.round(data.temperature)}${data.unit}`}
    >
      {data.emoji} {Math.round(data.temperature)}°
    </span>
  );
}
