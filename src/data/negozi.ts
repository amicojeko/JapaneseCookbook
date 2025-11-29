// src/data/negozi.ts
export type Negozio = {
  id: string;
  name: string;
  region: string;      // es: "Lombardia"
  city: string;
  address: string;
  lat: number;
  lng: number;
  url?: string;
  note?: string;
};

export const NEGOZI: Negozio[] = [
  {
    id: 'kathay-milano',
    name: 'Kathay',
    region: 'Lombardia',
    city: 'Milano',
    address: 'Via Paolo Sarpi 21, Milano',
    lat: 45.485,
    lng: 9.182,
    url: 'https://www.kathay.it',
    note: 'Supermercato asiatico con molti prodotti giapponesi',
  },
  // aggiungi qui tutti gli altri negozi
];
