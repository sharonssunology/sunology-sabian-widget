import sabians from "../data/sabians.js";
import interpretations from "../data/interpretations.js";
import images from "../data/images.js";

import { getSunLongitudeDeg } from "../lib/astro.js";
import { sabianAbsoluteDegreeFromLon } from "../lib/lookup.js";
import { geocodeToLatLon, latLonToIanaZone, localToUtcISO } from "../lib/timeplace.js";

export default async function handler(req, res) {
  // ---- CORS (fix preflight + allow Squarespace later) ----
  const origin = req.headers.origin;

  // For now: allow any origin (safe enough while you're developing).
  // Later, we can lock this down to your Squarespace domains.
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle the preflight request
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  // -------------------------------------------------------

  try {
    const { date, time, place } = req.body || {};
    if (!date || !time || !place) {
      return res.status(400).json({ error: "Missing date, time, or place." });
    }

    const { lat, lon } = await geocodeToLatLon(place);
    const zone = latLonToIanaZone(lat, lon);
    const utcISO = localToUtcISO(date, time, zone); // "YYYY-MM-DDTHH:mm:ssZ"

    const sunLon = await getSunLongitudeDeg(utcISO);
    const absDeg = sabianAbsoluteDegreeFromLon(sunLon);

    const imageFile = images[absDeg] ?? null;

    // IMPORTANT: return an absolute URL so Squarespace can load it
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
    const imageUrl = imageFile ? `${baseUrl}/symbol-images/${imageFile}` : null;

    return res.status(200).json({
      utcISO,
      sunLon,
      absDeg,
      sabian: sabians[absDeg] ?? null,
      interpretation: interpretations[absDeg] ?? null,
      imageUrl
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
