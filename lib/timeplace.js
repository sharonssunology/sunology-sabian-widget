// lib/timeplace.js
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";

// 1) Place string -> {lat, lon}
// Supports:
// - "38.9784,-76.4922" (direct)
// - "Annapolis, Maryland" (geocode via Nominatim)
export async function geocodeToLatLon(place) {
  if (!place || typeof place !== "string") {
    throw new Error("Place not found: " + String(place));
  }

  const trimmed = place.trim();

  // Direct "lat,lon" shortcut
  const m = trimmed.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/
  );
  if (m) {
    const lat = Number(m[1]);
    const lon = Number(m[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("Invalid lat/lon: " + trimmed);
    }
    return { lat, lon };
  }

  // Free geocode: OpenStreetMap Nominatim
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: trimmed,
      format: "json",
      limit: "1"
    }).toString();

  const res = await fetch(url, {
    headers: {
      // Nominatim likes having a UA; Vercel/Node fetch allows this header.
      "User-Agent": "sunology-sabian-widget/1.0 (contact: you@example.com)"
    }
  });

  if (!res.ok) {
    throw new Error("Geocode request failed: " + res.status);
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Place not found: " + trimmed);
  }

  const lat = Number(data[0].lat);
  const lon = Number(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Geocode parse failed for: " + trimmed);
  }

  return { lat, lon };
}

// 2) Lat/Lon -> IANA timezone string
export function latLonToIanaZone(lat, lon) {
  return tzlookup(lat, lon);
}

// 3) Local date + local time + timezone -> UTC ISO string
export function localToUtcISO(date, time, zone) {
  // date: "YYYY-MM-DD"
  // time: "HH:mm" (or "HH:mm:ss")
  const dt = DateTime.fromISO(`${date}T${time}`, { zone });
  if (!dt.isValid) {
    throw new Error("Invalid date/time: " + dt.invalidReason);
  }
  return dt.toUTC().toISO({ suppressMilliseconds: true });
}
