// Convert ecliptic longitude (0–360) to Sabian absolute degree (1–360)
export function sabianAbsoluteDegreeFromLon(lon) {
  if (typeof lon !== "number" || isNaN(lon)) {
    throw new Error("Invalid longitude");
  }

  // Normalize longitude just in case
  const normalized = ((lon % 360) + 360) % 360;

  const wholeDeg = Math.floor(normalized);
  const frac = normalized - wholeDeg;

  // Traditional Sabian rule:
  // exact degree → same number
  // any minutes → next degree
  let absDeg = frac === 0 ? wholeDeg : wholeDeg + 1;

  // Sabian degrees are 1–360, not 0–359
  if (absDeg === 0) absDeg = 360;
  if (absDeg > 360) absDeg = 360;

  return absDeg;
}
