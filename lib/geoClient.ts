"use client";

export type Geo = { country: string; isAzerbaijan: boolean; defaultLang: string; defaultCurrency: string };

let pending: Promise<Geo | null> | null = null;

function fromCountry(country: string): Geo {
  const c = country.toUpperCase();
  const az = c === "AZ";
  return { country: c, isAzerbaijan: az, defaultLang: az ? "az" : "en", defaultCurrency: az ? "AZN" : "USD" };
}

/**
 * Visitor's country, asked once per page load. The middleware already stores it in the
 * horwalle_geo_country cookie, so usually no request is needed at all.
 */
export function getGeo(): Promise<Geo | null> {
  if (pending) return pending;
  const m = typeof document !== "undefined" ? /(?:^|;\s*)horwalle_geo_country=([A-Za-z]{2})/.exec(document.cookie) : null;
  if (m) return (pending = Promise.resolve(fromCountry(m[1])));
  pending = fetch("/api/geo", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d && d.country ? fromCountry(String(d.country)) : null))
    .catch(() => null);
  return pending;
}
