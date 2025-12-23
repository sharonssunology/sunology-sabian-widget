import sabians from "../data/sabians.js";
import interpretations from "../data/interpretations.js";
import images from "../data/images.js";

import { getSunLongitudeDeg } from "../lib/astro.js";
import { sabianAbsoluteDegreeFromLon } from "../lib/lookup.js";
import { geocodeToLatLon, latLonToIanaZone, localToUtcISO } from "../lib/timeplace.js";

export default async function handler(req, res) {
  try {
    const { date, time, place } = req.body || {};
    if (!date || !time || !place) {
      return res.status(400).json({ error: "Missing date, time, or place." });
    }

    const { lat, lon } = await geocodeToLatLon(place);
    const zone = latLonToIanaZone(lat, lon);
    const utcISO = localToUtcISO(date, time, zone); // "YYYY-MM-DDTHH:mm:ssZ"

    const sunLon = await getSunLongitudeDeg(utcISO); // Swiss Ephemeris
    const absDeg = sabianAbsoluteDegreeFromLon(sunLon);

    return res.status(200).json({
      utcISO,
      sunLon,
      absDeg,
      sabian: sabians[absDeg] ?? null,
      interpretation: interpretations[absDeg] ?? null,
      image: images[absDeg] ?? null
    });

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

