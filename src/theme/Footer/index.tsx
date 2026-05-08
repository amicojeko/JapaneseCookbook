import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const SOCIALS: ReadonlyArray<{ label: string; href: string; title: string }> = [
  { label: 'IG', href: 'https://www.instagram.com/amicojeko', title: 'Instagram' },
  { label: 'TT', href: 'https://www.tiktok.com/@amicojeko', title: 'TikTok' },
  { label: 'YT', href: 'https://youtube.com/amicojeko', title: 'YouTube' },
  { label: 'X', href: 'https://www.x.com/jeko', title: 'X' },
  { label: 'IN', href: 'https://www.linkedin.com/in/stefanog', title: 'LinkedIn' },
  { label: 'GH', href: 'https://github.com/amicojeko/japanesecookbook', title: 'GitHub' },
];

const ESPLORA: ReadonlyArray<{ label: string; to: string }> = [
  { label: 'Negozi orientali', to: '/negozi_orientali' },
  { label: 'Viaggi in Giappone', to: '/viaggi' },
  { label: 'Libri consigliati', to: '/libri' },
  { label: 'Film, anime, serie TV', to: '/film_anime_serie_tv' },
  { label: 'Blog', to: '/blog' },
];

const APPROFONDIRE: ReadonlyArray<{ label: string; href: string }> = [
  {
    label: "Jeko's GPT",
    href: 'https://chatgpt.com/g/g-6820cb0fed508191adafb39249db35f0-jeko-s-japanese-recipes-assistant/',
  },
  { label: 'Ricettario JSON', href: '/ricettario.json' },
  { label: 'RSS feed', href: '/blog/rss.xml' },
  { label: 'GitHub del sito', href: 'https://github.com/amicojeko/japanesecookbook' },
];

export default function Footer(): React.ReactElement {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Brand column */}
        <div>
          <div className={styles.brand}>
            <span className={styles.kanji}>ジェコ</span>
            Jeko
          </div>
          <p className={styles.tagline}>
            Un taccuino di cucina giapponese in italiano. Ricette, ingredienti, strumenti e
            viaggi, raccolti da Stefano Guglielmetti dal 2020.
          </p>
          <div className={styles.socials}>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.title}
                title={s.title}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Esplora */}
        <div>
          <h5 className={styles.colTitle}>Esplora</h5>
          <ul className={styles.list}>
            {ESPLORA.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Per approfondire */}
        <div>
          <h5 className={styles.colTitle}>Per approfondire</h5>
          <ul className={styles.list}>
            {APPROFONDIRE.map((l) => (
              <li key={l.label}>
                <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Supporta */}
        <div>
          <h5 className={styles.colTitle}>Supporta</h5>
          <p className={styles.tagline}>
            Se il sito ti è stato utile, puoi offrirmi un caffè ☕
          </p>
          <a
            className={styles.paypalBtn}
            href="https://paypal.me/jeko23"
            target="_blank"
            rel="noopener noreferrer"
          >
            Supporta con PayPal
          </a>
        </div>
      </div>

      <div className={styles.copy}>
        <span>© {year} Stefano Guglielmetti · Built with Docusaurus</span>
        <span>made with ❤️ in Italia</span>
      </div>
    </footer>
  );
}
