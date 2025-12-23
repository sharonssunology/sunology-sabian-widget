import path from "path";
import * as sweph from "sweph";

// Set ephemeris path once per cold start
const EPHE_PATH = path.join(process.cwd(), "ephe");
sweph.set_ephe_path(EPHE_PATH);

// Convert ISO UTC -> Julian Day UT
function toJulianDayUT(utcISO) {
  const d = new Date(utcISO);

  if (isNaN(d)) {
    throw new Error("Invalid UTC date");
  }

  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hour =
    d.getUTCHours() +
    d.getUTCMinutes() / 60 +
    d.getUTCSeconds() / 3600;

  return sweph.julday(
    year,
    month,
    day,
    hour,
    sweph.constants.SE_GREG_CAL
  );
}

export function getSunLongitudeDeg(utcISO) {
  const jd = toJulianDayUT(utcISO);

  const flags = sweph.constants.SEFLG_SWIEPH;
  const result = sweph.calc_ut(
    jd,
    sweph.constants.SE_SUN,
    flags
  );

  if (result.error) {
    throw new Error(`Swiss Ephemeris error: ${result.error}`);
  }

  return result.data[0]; // longitude in degrees (0..360)
}
