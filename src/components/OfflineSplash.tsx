import React, {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';

import styles from './OfflineSplash.module.css';

/**
 * Splash screen del primo avvio dell'app installata.
 *
 * Solo in display-mode standalone (l'app installata): è l'unico contesto in cui
 * il service worker scarica le pagine per l'offline (offlineModeActivationStrategies
 * ['standalone'] in docusaurus.config.ts) — nel browser, mobile o desktop, non
 * si scarica nulla e questo componente non rende niente.
 *
 * Il SW (src/sw-custom.js) scarica in precache tutte le pagine + le foto delle
 * ricette durante il suo `install` e manda messaggi { done, total }: qui li
 * mostriamo a tutto schermo con una barra di avanzamento. A download completato
 * salviamo un flag e lo splash non compare più; gli aggiornamenti successivi
 * passano dal popup "Nuova versione disponibile" (src/theme/PwaReloadPopup).
 */

// Tipi messaggio condivisi con src/sw-custom.js.
const MSG_PROGRESS = 'PG_OFFLINE_PROGRESS';
const MSG_DONE = 'PG_OFFLINE_DONE';
const MSG_ERROR = 'PG_OFFLINE_ERROR';

const READY_FLAG = 'pg-offline-ready';
const DONE_HOLD_MS = 1200;
const REGISTRATION_POLL_MS = 400;
// Se entro questo tempo il SW non ha ancora iniziato a scaricare (niente
// registrazione, niente messaggi), lasciamo entrare l'utente comunque.
const START_TIMEOUT_MS = 15000;

type Phase = 'hidden' | 'waiting' | 'downloading' | 'done' | 'error';

interface SwMessage {
  type?: string;
  done?: number;
  total?: number;
}

/** Il SW attivo è quello "offline" dell'app (params nella query di sw.js)? */
function isOfflineWorker(worker: ServiceWorker): boolean {
  return decodeURIComponent(worker.scriptURL).includes('"offlineMode":true');
}

function readFlag(): boolean {
  try {
    return localStorage.getItem(READY_FLAG) === '1';
  } catch {
    return false;
  }
}

function writeFlag(): void {
  try {
    localStorage.setItem(READY_FLAG, '1');
  } catch {
    // storage non disponibile: lo splash ricomparirebbe solo se il SW riscarica
  }
}

export default function OfflineSplash(): ReactNode {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [progress, setProgress] = useState({done: 0, total: 0});
  // "Continua mentre scarica": il download prosegue ma lo splash non torna.
  const dismissed = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;
    // ?offlineMode=true = stesso test hook della strategia 'queryString' del SW,
    // per provare il flusso in una tab normale.
    const isApp =
      window.matchMedia('(display-mode: standalone)').matches ||
      new URLSearchParams(window.location.search).get('offlineMode') === 'true';
    if (!isApp) return undefined;
    if (readFlag()) return undefined;

    const sw = navigator.serviceWorker;
    let started = false;
    let finished = false;
    setPhase('waiting');

    const finish = () => {
      if (finished) return;
      finished = true;
      writeFlag();
      if (!dismissed.current) setPhase('done');
    };

    const onMessage = (event: MessageEvent<SwMessage>) => {
      const data = event.data;
      if (data?.type === MSG_PROGRESS && data.total) {
        started = true;
        setProgress({done: data.done ?? 0, total: data.total});
        if (!dismissed.current) {
          setPhase((p) => (p === 'done' ? p : 'downloading'));
        }
      } else if (data?.type === MSG_DONE) {
        finish();
      } else if (data?.type === MSG_ERROR) {
        started = true;
        if (!dismissed.current) setPhase('error');
      }
    };
    sw.addEventListener('message', onMessage);
    // I messaggi di un SW che non controlla (ancora) la pagina restano in coda
    // finché il client non li abilita esplicitamente.
    sw.startMessages();

    // Caso "già pronto": il download si è concluso in una sessione precedente
    // ma il flag manca (es. app chiusa a metà del messaggio finale) → c'è un SW
    // offline attivo che controlla la pagina e nessun install in corso. Su
    // Android il SW attivo può essere quello NON offline delle visite dal
    // browser: in quel caso aspettiamo che parta l'install di quello offline.
    const poll = setInterval(async () => {
      if (started || finished) return;
      const reg = await sw.getRegistration();
      if (reg?.installing || reg?.waiting) {
        started = true; // i messaggi di avanzamento arriveranno a breve
      } else if (reg?.active && isOfflineWorker(reg.active) && sw.controller) {
        finish();
      }
    }, REGISTRATION_POLL_MS);

    const giveUp = setTimeout(() => {
      if (!started && !finished) setPhase('hidden');
    }, START_TIMEOUT_MS);

    return () => {
      sw.removeEventListener('message', onMessage);
      clearInterval(poll);
      clearTimeout(giveUp);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'done') return undefined;
    const t = setTimeout(() => setPhase('hidden'), DONE_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'hidden') return null;

  const pct =
    phase === 'done'
      ? 100
      : progress.total
        ? Math.min(100, Math.round((progress.done / progress.total) * 100))
        : 0;

  const status =
    phase === 'waiting'
      ? 'Preparo il download…'
      : phase === 'downloading'
        ? `${pct}% · ${progress.done} di ${progress.total} file`
        : phase === 'done'
          ? 'Pronto! Ricette disponibili anche offline.'
          : 'Download interrotto: riprenderà alla prossima apertura con connessione.';

  return (
    <div
      className={phase === 'done' ? `${styles.splash} ${styles.leaving}` : styles.splash}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pg-offline-splash-title">
      <div className={styles.inner}>
        <img
          className={styles.logo}
          src="/img/pwa/icon-192.png"
          alt=""
          width={96}
          height={96}
        />
        <p id="pg-offline-splash-title" className={styles.title}>
          Pagine Giappe
        </p>
        <p className={styles.lead}>
          Al primo avvio scarico tutte le ricette sul dispositivo, così l’app
          funziona anche senza connessione.
        </p>

        {phase !== 'error' && (
          <div
            className={styles.track}
            role="progressbar"
            aria-label="Download per l’uso offline"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}>
            <div
              className={phase === 'waiting' ? styles.barIndeterminate : styles.bar}
              style={phase === 'waiting' ? undefined : {width: `${pct}%`}}
            />
          </div>
        )}
        <p className={styles.status} aria-live="polite">
          {status}
        </p>

        {(phase === 'downloading' || phase === 'error') && (
          <button
            className={styles.skip}
            type="button"
            onClick={() => {
              dismissed.current = true;
              setPhase('hidden');
            }}>
            {phase === 'error' ? 'Continua' : 'Continua mentre scarica'}
          </button>
        )}
      </div>
    </div>
  );
}
