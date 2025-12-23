// lib/timeplace.js
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";

export async function geocodeToLatLon(place) {
  if (!place || typeof place !== "string") {
    throw new Error("Place not found: " + String(place));
  }

  const trimmed = place.trim();

  // Allow direct "lat,lon"
  const m = trimmed.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (m) {
    const lat = Number(m[1]);
    const lon = Number(m[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("Invalid lat/lon: " + trimmed);
    }
    return { lat, lon };
  }

  // 1) Try Nominatim (official endpoint) with better compliance
  try {
    const nominatimUrl =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({
        q: trimmed,
        format: "json",
        limit: "1",
        addressdetails: "0",
        // Nominatim often prefers a contact in the request; use your own email:
        email: process.env.GEOCODER_EMAIL || "contact@example.com"
      }).toString();

    const res = await fetch(nominatimUrl, {
      headers: {
        // Identify your app. Put something real here.
        "User-Agent": process.env.GEOCODER_UA || "sunology-sabian-widget/1.0",
        "Accept": "application/json"
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(data[0].lat);
        const lon = Number(data[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
      }
      throw new Error("Place not found: " + trimmed);
    }

    // If blocked/rate-limited, throw to fallback
    throw new Error("Geocode request failed: " + res.status);
  } catch (e) {
    // fall through to Open-Meteo
  }

  // 2) Fallback: Open-Meteo geocoding (friendly for serverless)
  const meteoUrl =
    "https://geocoding-api.open-meteo.com/v1/search?" +
    new URLSearchParams({
      name: trimmed,
      count: "1",
      language: "en",
      format: "json"
    }).toString();

  const res2 = await fetch(meteoUrl, { headers: { "Accept": "application/json" } });
  if (!res2.ok) {
    throw new Error("Geocode request failed: " + res2.status);
  }

  const data2 = await res2.json();
  if (!data2 || !Array.isArray(data2.results) || data2.results.length === 0) {
    throw new Error("Place not found: " + trimmed);
  }

  const lat = Number(data2.results[0].latitude);
  const lon = Number(data2.results[0].longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Geocode parse failed for: " + trimmed);
  }

  return { lat, lon };
}

export function latLonToIanaZone(lat, lon) {
  return tzlookup(lat, lon);
}

export function localToUtcISO(date, time, zone) {
  const dt = DateTime.fromISO(`${date}T${time}`, { zone });
  if (!dt.isValid) throw new Error("Invalid date/time");
  return dt.toUTC().toISO({ suppressMilliseconds: true });
}
