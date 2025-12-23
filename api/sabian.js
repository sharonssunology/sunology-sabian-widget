import { 
  sabianAbsoluteDegreeFromLon,
  signAndDegreeFromAbsolute
} from "../lib/lookup.js";
import sabians from "../data/sabians.js";
import interpretations from "../data/interpretations.js";
import images from "../data/images.js";

import { getSunLongitudeDeg } from "../lib/astro.js";
import { sabianAbsoluteDegreeFromLon } from "../lib/lookup.js";
import { geocodeToLatLon, latLonToIanaZone, localToUtcISO } from "../lib/timeplace.js";

export default async function handler(req, res) {

  // ---------- GET sanity check ----------
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, endpoint: "/api/sabian" });
  }

  // ---------- CORS (must be before method guard) ----------
  const origin = req.headers.origin;

  // about:blank sends Origin: "null" (string). Treat that as "*".
  const allowOrigin = (!origin || origin === "null") ? "*" : origin;

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ---------- Method guard ----------
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { date, time, place } = req.body || {};
    if (!date || !time || !place) {
      return res.status(400).json({ error: "Missing date, time, or place." });
    }

    const { lat, lon } = await geocodeToLatLon(place);
    const zone = latLonToIanaZone(lat, lon);
    const utcISO = localToUtcISO(date, time, zone);

    const sunLon = await getSunLongitudeDeg(utcISO);
    const absDeg = sabianAbsoluteDegreeFromLon(sunLon);
    const { sign, degreeInSign } = signAndDegreeFromAbsolute(absDeg);
    const imageFile = images[absDeg] ?? null;

    // Absolute URL for Squarespace
    const baseUrl =
  process.env.PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

const imageUrl = imageFile ? `${baseUrl}/symbol-images/${imageFile}` : null;

return res.status(200).json({
  utcISO,
  sunLon,
  absDeg,
  sign,
  degInSign: degreeInSign,
  sabian: sabians[absDeg] ?? null,
  interpretation: interpretations[absDeg] ?? null,
  imageUrl
});

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
