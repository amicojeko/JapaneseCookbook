/**
 * Italian regions — single source of truth for components that need to render
 * the list of regions and/or build /negozi_orientali/<slug>/ URLs.
 *
 * Add a region's `slug` only once a docs/negozi/<slug>.md page actually exists —
 * regions without a slug render as "in arrivo" placeholders (no link).
 *
 * Why this lives here: previously RegionsList.tsx, RegionShopList.tsx and
 * OnlineShopList.tsx each kept their own hardcoded copy and they had already
 * drifted (e.g. Basilicata + Molise missing in one). Centralising avoids
 * silent broken links as the dataset grows.
 */

export type Region = {
    name: string;
    /** URL slug — matches docs/negozi/<slug>.md filename. Omitted for regions without a published page. */
    slug?: string;
};

export const REGIONI: ReadonlyArray<Region> = [
    { name: "Abruzzo", slug: "abruzzo" },
    { name: "Basilicata" },
    { name: "Calabria", slug: "calabria" },
    { name: "Campania", slug: "campania" },
    { name: "Emilia-Romagna", slug: "emilia_romagna" },
    { name: "Friuli-Venezia Giulia", slug: "friuli-venezia_giulia" },
    { name: "Lazio", slug: "lazio" },
    { name: "Liguria", slug: "liguria" },
    { name: "Lombardia", slug: "lombardia" },
    { name: "Marche", slug: "marche" },
    { name: "Molise" },
    { name: "Piemonte", slug: "piemonte" },
    { name: "Puglia", slug: "puglia" },
    { name: "Sardegna", slug: "sardegna" },
    { name: "Sicilia", slug: "sicilia" },
    { name: "Toscana", slug: "toscana" },
    { name: "Trentino-Alto Adige", slug: "trentino-alto_adige" },
    { name: "Umbria", slug: "umbria" },
    { name: "Valle d'Aosta", slug: "valle_d_aosta" },
    { name: "Veneto", slug: "veneto" },
];

/** Region display-name → URL slug (only for regions with a published page). */
export const REGION_SLUG_BY_NAME: Readonly<Record<string, string>> =
    Object.freeze(
        Object.fromEntries(
            REGIONI.flatMap((r) => (r.slug ? [[r.name, r.slug]] : []))
        )
    );

/** Look up a region's URL slug. Returns `undefined` for regions without a published page. */
export function regionSlug(name: string): string | undefined {
    return REGION_SLUG_BY_NAME[name];
}
