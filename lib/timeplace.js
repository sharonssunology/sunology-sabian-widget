// lib/timeplace.js
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";

export async function geocodeToLatLon(place) {
  const q = encodeURIComponent(place);

  // Open-Meteo Geocoding API (no key needed)
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed: HTTP ${res.status}`);

  const data = await res.json();
  const hit = data?.results?.[0];
  if (!hit) throw new Error(`Place not found: ${place}`);

  return { lat: hit.latitude, lon: hit.longitude };
}

export function latLonToIanaZone(lat, lon) {
  // tz-lookup expects numbers
  return tzlookup(Number(lat), Number(lon));
}

export function localToUtcISO(date, time, zone) {
  // Expecting date="YYYY-MM-DD" and time="HH:mm" (or "HH:mm:ss")
  const dt = DateTime.fromISO(`${date}T${time}`, { zone });

  if (!dt.isValid) {
    throw new Error(`Invalid local date/time/zone: ${date} ${time} ${zone} (${dt.invalidReason || "unknown"})`);
  }

  return dt.toUTC().toISO({ suppressMilliseconds: true });
}
