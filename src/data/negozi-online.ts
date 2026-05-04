import { NEGOZI } from './negozi';

/**
 * Online-only shops — e-commerce stores without a physical address.
 * Physical shops in `negozi.ts` that ALSO have a `url` field are merged in
 * automatically by `getAllOnlineShops()`.
 */
export type OnlineShop = {
    id: string;
    name: string;
    url: string;
    note?: string;
    category?: string; // e.g. "Coltelli & accessori"
    city?: string;
    region?: string;
};

export const ONLINE_ONLY: OnlineShop[] = [
    { id: "sushitalia", name: "Sushitalia", url: "https://sushitalia.com" },
    { id: "orientalitalia", name: "Oriental Italia", url: "https://www.orientalitalia.com" },
    { id: "fusioneat", name: "FusionEat", url: "https://www.fusioneat.it" },
    {
        id: "zanzino",
        name: "Zanzino",
        url: "https://www.zanzino.it/gb/",
        category: "Coltelli & accessori",
    },
];

/**
 * Combined list of all online shops: ONLINE_ONLY plus physical shops from
 * NEGOZI that have a `url` field. Sorted alphabetically (Italian collation).
 */
export function getAllOnlineShops(): OnlineShop[] {
    const fromNegozi: OnlineShop[] = NEGOZI
        .filter((s) => !!s.url)
        .map((s) => ({
            id: s.id,
            name: s.name,
            url: s.url as string,
            note: s.note,
            city: s.city,
            region: s.region,
        }));
    return [...ONLINE_ONLY, ...fromNegozi].sort((a, b) =>
        a.name.localeCompare(b.name, "it", { sensitivity: "base" })
    );
}
