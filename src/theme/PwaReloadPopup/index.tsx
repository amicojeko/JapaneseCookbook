// Swizzled from @docusaurus/plugin-pwa (PwaReloadPopup, --eject).
//
// Custom "new version available" toast, styled in the Bentō×Izakaya system
// (paper card, ink border, red action). Shown when a new service worker is
// waiting; clicking "Aggiorna" activates it and reloads. The site is
// Italian-only, so the copy is hardcoded in Italian (no <Translate> wrapper).

import React, {type ReactNode, useState} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

// Mirrors the Props of @theme/PwaReloadPopup. Declared locally rather than
// imported from the ambient '@theme/PwaReloadPopup' module: that augmentation
// lives in @docusaurus/plugin-pwa's own d.ts and isn't in scope for tsc in this
// project (webpack resolves it at build time, but `npm run typecheck` doesn't).
interface Props {
  readonly onReload: () => void;
}

export default function PwaReloadPopup({onReload}: Props): ReactNode {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.popup} role="status" aria-live="polite">
      <div className={styles.body}>
        <span className={styles.dot} aria-hidden="true" />
        <div className={styles.text}>
          <p className={styles.title}>Nuova versione disponibile</p>
          <p className={styles.subtitle}>
            Aggiorna per vedere le ultime ricette e novità.
          </p>
        </div>
        <button
          aria-label="Chiudi"
          className={styles.close}
          type="button"
          onClick={() => setIsVisible(false)}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <button
        className={clsx(styles.reload)}
        type="button"
        onClick={() => {
          setIsVisible(false);
          onReload();
        }}>
        Aggiorna
      </button>
    </div>
  );
}
