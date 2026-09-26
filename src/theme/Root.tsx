import React, {useEffect} from 'react';
import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import {gtagEvent} from '@site/src/lib/analytics';
import {UTM_SOURCE} from '@site/src/lib/utm';
import OfflineSplash from '@site/src/components/OfflineSplash';

interface Props {
  children: ReactNode;
}

const SITE_URL = 'https://paginegiappe.it';

/**
 * Schema globale WebSite + SearchAction. Iniettato SSR cosi' Google lo
 * vede al crawl. Il SearchAction punta a /search?q=... (Algolia gestisce
 * la modal — il path e' fittizio ma semantically valido per il sitelinks
 * search box di Google).
 */
const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Pagine Giappe',
  alternateName: 'Le Ricette Giapponesi di Jeko',
  url: SITE_URL + '/',
  inLanguage: 'it-IT',
  potentialAction: {
    '@type': 'SearchAction',
    // Trailing slash perche' il sito usa trailingSlash: true (senza slash
    // Docusaurus ridireziona 301).
    target: {
      '@type': 'EntryPoint',
      urlTemplate: SITE_URL + '/search/?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// GA4 key-event social domain → platform label (P6). PayPal e store-map sono
// gestiti separatamente perche' hanno event name / parametri dedicati.
const SOCIAL_PLATFORMS: ReadonlyArray<readonly [string, string]> = [
  ['instagram.com', 'instagram'],
  ['tiktok.com', 'tiktok'],
  ['youtube.com', 'youtube'],
  ['youtu.be', 'youtube'],
  ['x.com', 'x'],
  ['twitter.com', 'x'],
  ['linkedin.com', 'linkedin'],
  ['github.com', 'github'],
];

/**
 * Delegation globale sui click per gli outbound key-event (paypal / social /
 * store map). Registrato una sola volta su document; il path viene letto al
 * momento del click cosi' e' corretto anche dopo navigazioni SPA.
 */
function handleOutboundClick(ev: MouseEvent): void {
  const link = (ev.target as HTMLElement | null)?.closest('a');
  if (!link || !link.href) return;

  const url = link.href;
  const path = window.location.pathname;

  // PayPal — misura il supporto.
  if (url.includes('paypal.me/jeko23')) {
    gtagEvent('paypal_click', {link_url: url, page_path: path});
    return;
  }

  // Affiliati Amazon (link nei /libri) — misura la monetizzazione.
  if (url.includes('amzn.to') || url.includes('amazon.')) {
    gtagEvent('amazon_click', {link_url: url, page_path: path});
    return;
  }

  // Sito di un negozio — riconosciuto dagli UTM che withUtm() appende solo a
  // questi link (vedi src/lib/utm.ts). Prima del check social: il "sito" di un
  // negozio potrebbe un giorno essere una pagina Instagram.
  if (url.includes(`utm_source=${UTM_SOURCE}`)) {
    const surface = path.includes('/negozi_orientali/online')
      ? 'online'
      : path.includes('/negozi_orientali/mappa')
        ? 'mappa'
        : 'regione';
    gtagEvent('store_site_click', {link_url: url, surface, page_path: path});
    return;
  }

  // Social outbound (esclude i link interni con questi domini nel testo).
  for (const [domain, platform] of SOCIAL_PLATFORMS) {
    if (url.includes(domain) && !url.includes('paginegiappe.it')) {
      gtagEvent('social_click', {platform, page_path: path});
      return;
    }
  }

  // Mappa Google nelle pagine negozio — conversion locale.
  if (url.includes('maps.app.goo.gl') || url.includes('maps.google.com')) {
    const region = path.match(/\/negozi_orientali\/([^/]+)/)?.[1];
    gtagEvent('store_map_click', {
      link_url: url,
      region: region ?? 'unknown',
      page_path: path,
    });
  }
}

/**
 * Algolia DocSearch non emette un evento nativo. Quando l'utente apre la
 * ricerca cerchiamo l'input per pochi frame e agganciamo un listener con
 * debounce 1s. Evitiamo un MutationObserver permanente sull'intero body:
 * durante navigazioni e rendering React verrebbe richiamato per ogni gruppo di
 * mutazioni, aggiungendo lavoro al main thread proprio vicino alle interazioni.
 */
function setupAlgoliaTracking(): () => void {
  let currentInput: HTMLInputElement | null = null;
  let debounce: ReturnType<typeof setTimeout> | undefined;
  let frame: number | undefined;
  let attempts = 0;

  const onInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = input.value.trim();
      if (q.length >= 3) {
        gtagEvent('algolia_search', {query: q.slice(0, 100)});
        // Content-gap: la query non ha prodotto risultati. DocSearch monta
        // .DocSearch-NoResults quando l'indice non ha match — a 1s di
        // debounce la fetch e' gia' risolta.
        if (document.querySelector('.DocSearch-NoResults')) {
          gtagEvent('search_no_results', {query: q.slice(0, 100)});
        }
      }
    }, 1000);
  };

  const attach = (): boolean => {
    const input = document.querySelector(
      '.DocSearch-Input, .DocSearch-SearchBar-input',
    ) as HTMLInputElement | null;
    if (!input) return false;
    if (input === currentInput) return true;
    currentInput?.removeEventListener('input', onInput);
    currentInput = input;
    currentInput.addEventListener('input', onInput);
    return true;
  };

  const seekInput = () => {
    frame = undefined;
    if (attach() || attempts++ >= 30) return;
    frame = requestAnimationFrame(seekInput);
  };

  const scheduleAttach = () => {
    if (frame != null) cancelAnimationFrame(frame);
    attempts = 0;
    frame = requestAnimationFrame(seekInput);
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.DocSearch-Button')) scheduleAttach();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const isTyping =
      target?.isContentEditable ||
      target?.tagName === 'INPUT' ||
      target?.tagName === 'SELECT' ||
      target?.tagName === 'TEXTAREA';
    const opensWithShortcut =
      ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') ||
      (event.key === '/' && !isTyping);
    if (opensWithShortcut) {
      scheduleAttach();
    }
  };

  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  attach(); // caso in cui la modal sia gia' montata

  return () => {
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    currentInput?.removeEventListener('input', onInput);
    if (frame != null) cancelAnimationFrame(frame);
    clearTimeout(debounce);
  };
}

/**
 * Custom Root component: global WebSite schema + GA4 key-event tracking (P6).
 *
 * Note: we deliberately do NOT inject dns-prefetch hints for the analytics
 * domains. @docusaurus/plugin-google-gtag already emits a `preconnect` for both
 * www.googletagmanager.com and www.google-analytics.com (verified in the built
 * HTML), and a `preconnect` is a strict superset of `dns-prefetch` (it does the
 * DNS lookup plus the TCP + TLS handshake). Re-adding dns-prefetch to those two
 * origins was pure redundancy and pushed PSI past its "more than 4 preconnect
 * origins" budget (3 preconnect + 2 dns-prefetch = 5). Route prefetching is
 * handled separately by src/clientModules/deferPrefetch.ts.
 *
 * Il tracking key-event `youtube_video_play` vive nel componente YouTubeVideo
 * (facade), dove il click sul play e' un segnale piu' preciso dell'iframe.
 */
export default function Root({children}: Props): ReactNode {
  const {pathname} = useLocation();

  // Listener globali: registrati una sola volta.
  useEffect(() => {
    document.addEventListener('click', handleOutboundClick, {passive: true});
    const teardownAlgolia = setupAlgoliaTracking();
    return () => {
      document.removeEventListener('click', handleOutboundClick);
      teardownAlgolia();
    };
  }, []);

  // Scroll depth 75% sulle ricette. Ri-armato ad ogni navigazione SPA.
  useEffect(() => {
    if (!pathname.startsWith('/ricette/')) return undefined;

    let fired = false;
    const onScroll = () => {
      if (fired) return;
      const scrollPct =
        (window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight;
      if (scrollPct >= 0.75) {
        fired = true;
        gtagEvent('recipe_scroll_75', {
          page_path: pathname,
          recipe_slug: pathname.replace('/ricette/', '').replace(/\/$/, ''),
        });
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(WEBSITE_SCHEMA)}</script>
      </Head>
      {children}
      <OfflineSplash />
    </>
  );
}
