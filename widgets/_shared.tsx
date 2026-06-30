/**
 * Helper condivisi dai widget della ChatGPT App (Apps SDK).
 * Runtime: Preact in un iframe sandbox. I dati arrivano da `window.openai.toolOutput`
 * (structuredContent del tool). Vedi netlify/lib/mcp-tools.mjs.
 */
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

// `window.openai` è iniettato dall'host ChatGPT; tipizzato lasco di proposito.
declare global {
  interface Window {
    openai?: {
      toolOutput?: unknown;
      toolInput?: unknown;
      theme?: string;
      locale?: string;
      maxHeight?: number;
      callTool?: (name: string, params: Record<string, unknown>) => Promise<unknown>;
      sendFollowUpMessage?: (arg: { prompt: string }) => void;
      requestDisplayMode?: (arg: { mode: 'inline' | 'pip' | 'fullscreen' }) => void;
      setWidgetState?: (state: unknown) => void;
      widgetState?: unknown;
    };
  }
}

/** Tipi minimi dei payload (combaciano con gli outputSchema dei tool). */
export interface Recipe {
  title: string;
  description?: string | null;
  url?: string | null;
  image?: string | null;
  category?: string | null;
  tags?: string[];
  recipeYield?: string | null;
  ingredients?: string[];
  instructions?: string | null;
  servings_note?: string | null;
  role?: string | null;
}
export interface Shop {
  name: string;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  lat?: number | null;
  lng?: number | null;
  distance_km?: number | null;
  note?: string | null;
  url?: string | null;
}
export interface OnlineShop {
  name: string;
  category?: string | null;
  note?: string | null;
  url?: string | null;
}

/**
 * Legge `window.openai.toolOutput` e si aggiorna quando l'host invia nuovi risultati.
 * Difensivo: copre sia il global che la notifica postMessage `ui/notifications/tool-result`.
 */
export function useToolOutput<T = unknown>(): T | undefined {
  const [data, setData] = useState<T | undefined>(() => window.openai?.toolOutput as T | undefined);

  useEffect(() => {
    const sync = () => setData(window.openai?.toolOutput as T | undefined);
    // Eventi globali noti/candidati emessi dall'host quando i globals cambiano.
    const evNames = ['openai:set_globals', 'openai:tool_response', 'openai:toolOutput'];
    evNames.forEach((n) => window.addEventListener(n, sync as EventListener));
    // Fallback: notifiche JSON-RPC via postMessage.
    const onMsg = (e: MessageEvent) => {
      const m = e?.data;
      if (m && m.method === 'ui/notifications/tool-result' && m.params?.result) {
        const sc = m.params.result.structuredContent;
        if (sc !== undefined) setData(sc as T);
      }
    };
    window.addEventListener('message', onMsg);
    return () => {
      evNames.forEach((n) => window.removeEventListener(n, sync as EventListener));
      window.removeEventListener('message', onMsg);
    };
  }, []);

  return data;
}

/** Apre una ricerca/ricetta come follow-up nella conversazione (drill-down). */
export function openRecipe(title: string) {
  const o = window.openai;
  if (o?.sendFollowUpMessage) o.sendFollowUpMessage({ prompt: `Mostrami la ricetta "${title}"` });
}

/** Card ricetta standalone (no dipendenze Docusaurus). */
export function RecipeCard({ r, badge }: { r: Recipe; badge?: string | null }) {
  const yieldLabel = r.recipeYield ? `Resa: ${r.recipeYield}` : null;
  return (
    <article class="pg-card">
      {r.image ? (
        <a class="pg-card__imgwrap" href={r.url ?? '#'} target="_blank" rel="noopener noreferrer">
          <img class="pg-card__img" src={r.image} alt={r.title} loading="lazy" decoding="async" />
          {badge ? <span class="pg-card__badge">{badge}</span> : null}
        </a>
      ) : null}
      <div class="pg-card__body">
        <h3 class="pg-card__title">
          {r.url ? (
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              {r.title}
            </a>
          ) : (
            r.title
          )}
        </h3>
        <div class="pg-card__meta">
          {r.category ? <span>{r.category}</span> : null}
          {yieldLabel ? <span>{yieldLabel}</span> : null}
        </div>
        {r.description ? <p class="pg-card__desc">{r.description}</p> : null}
        {r.servings_note ? <p class="pg-card__note">📐 {r.servings_note}</p> : null}
        {r.ingredients?.length ? (
          <details class="pg-card__det">
            <summary>Ingredienti ({r.ingredients.length})</summary>
            <ul>
              {r.ingredients.map((i) => (
                <li>{i}</li>
              ))}
            </ul>
          </details>
        ) : null}
        {r.url ? (
          <a class="pg-card__cta" href={r.url} target="_blank" rel="noopener noreferrer">
            Ricetta completa →
          </a>
        ) : null}
      </div>
    </article>
  );
}

/** CSS condiviso card ricetta + griglia (iniettato dai widget). */
export const CARD_CSS = `
.pg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.pg-card { background: var(--pg-paper-2); border: 1px solid var(--pg-rule-soft); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.pg-card__imgwrap { display: block; position: relative; aspect-ratio: 4 / 3; overflow: hidden; }
.pg-card__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pg-card__badge { position: absolute; top: 8px; left: 8px; background: var(--pg-red); color: #fff; font-family: var(--pg-font-mono); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; }
.pg-card__body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; }
.pg-card__title { font-size: 17px; line-height: 1.25; }
.pg-card__meta { display: flex; flex-wrap: wrap; gap: 6px; font-family: var(--pg-font-mono); font-size: 11px; color: var(--pg-ink-faint); text-transform: uppercase; letter-spacing: .06em; }
.pg-card__meta span:not(:last-child)::after { content: '·'; margin-left: 6px; }
.pg-card__desc { font-size: 13.5px; color: var(--pg-ink-soft); margin: 2px 0 0; }
.pg-card__note { font-size: 12.5px; color: var(--pg-red-ink); background: var(--pg-red-soft); border-radius: 6px; padding: 5px 8px; margin: 2px 0 0; }
.pg-card__det { font-size: 13px; color: var(--pg-ink-soft); }
.pg-card__det summary { cursor: pointer; font-family: var(--pg-font-mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--pg-ink-faint); }
.pg-card__det ul { margin: 6px 0 0; padding-left: 18px; }
.pg-card__cta { margin-top: 4px; font-weight: 600; font-size: 13.5px; }
`;

/** Monta un componente Preact dentro #pg-root, iniettando il CSS extra del widget. */
export function mount(node: preact.ComponentChild, css?: string) {
  if (css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
  const root = document.getElementById('pg-root');
  if (root) render(node as any, root);
}
