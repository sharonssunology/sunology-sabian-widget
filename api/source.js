export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({
    name: "Sunology Sabian API",
    sourceCodeUrl: process.env.PUBLIC_SOURCE_URL || null,
    commit: process.env.PUBLIC_COMMIT || null,
    license: "AGPL-3.0-or-later",
    thirdParty: [
      {
        name: "Swiss Ephemeris (via sweph bindings)",
        license: "AGPL (Swiss Ephemeris licensing)",
        info: "https://www.astro.com/swisseph/"
      }
    ]
  });
}
