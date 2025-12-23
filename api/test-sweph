import { getSunLongitudeDeg } from "../lib/astro.js";

export default async function handler(req, res) {
  try {
    const lon = await getSunLongitudeDeg("2000-01-01T12:00:00Z");
    res.status(200).json({ ok: true, sunLon: lon });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
