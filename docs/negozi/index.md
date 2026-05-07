---
title: 🏪 Negozi orientali
description: Elenco completo di negozi fisici e online in Italia per acquistare ingredienti e prodotti giapponesi
draft: false
slug: "/negozi_orientali"
sidebar_position: 4
hide_title: true
---
import Link from '@docusaurus/Link';
import RegionsList from '@site/src/components/RegionsList';
import NegoziStats from '@site/src/components/NegoziStats';

<header className="regions-hero">
  <span className="pg-kicker">Sezione · Negozi orientali</span>
  <h1>Negozi orientali in Italia.</h1>
  <p className="lead">
    Una guida regione per regione dei negozi fisici dove trovare ingredienti, utensili e prodotti giapponesi, coreani e cinesi. Più gli e-commerce italiani che ho provato e che consiglio.
  </p>
  <NegoziStats />
  <div className="quick-cta">
    <Link className="btn red" to="/negozi_orientali/mappa">🗺️ Apri la mappa</Link>
    <Link className="btn primary" to="/negozi_orientali/online">🌐 Negozi online</Link>
    <a className="btn" href="https://instagram.com/amicojeko" target="_blank" rel="noopener noreferrer">✉️ Segnalane uno</a>
  </div>
</header>

<RegionsList />

<aside className="submit-cta">
  <div className="ico">🏪</div>
  <div className="copy">
    <h3>Conosci un negozio non in lista?</h3>
    <p>Scrivimi su Instagram <strong>@amicojeko</strong> con nome, indirizzo e link Google Maps. Lo aggiungo io. Grazie!</p>
  </div>
  <a className="btn" href="https://instagram.com/amicojeko" target="_blank" rel="noopener noreferrer">Segnala un negozio →</a>
</aside>
