---
title: NomeRomanji                        # es. Dashi, Oyakodon — romanji del nome giapponese
sidebar_custom_props:
  subtitle: Sottotitolo breve in italiano  # OBBLIGATORIO — es. "Il brodo base giapponese"
description: Descrizione SEO in una frase   # compare come snippet e OG description
slug: /ricette/nome-ricetta                 # OBBLIGATORIO — assoluto, derivato dal titolo
image: /img/ricette/nome-ricetta.jpg        # OBBLIGATORIO — master; il resto lo genera husky
ingredients:                                # OBBLIGATORIO — collega alle pagine ingrediente
  - ingrediente uno
  - ingrediente due
  - ingrediente tre
tags:                                       # OBBLIGATORIO — riusa i tag esistenti quando puoi
  - tag1
  - tag2
recipeYield: 2 persone                      # opzionale ma consigliato (scaling dosi MCP)
---
Paragrafo introduttivo: cos'e' il piatto, da dove viene, perche' vale la pena farlo, quanto e'
semplice, come si conserva. 2-5 frasi. Cita qui, con link interni, le ricette collegate (es. la
[zuppa di miso](/ricette/...)) se ha senso. Nessun heading prima di questo paragrafo.

<ImageComponent />

## Ingredienti

- quantita' metrica di [ingrediente uno](/ingredienti/ingrediente-uno)
- quantita' metrica di [ingrediente due](/ingredienti/ingrediente-due)
- quantita' metrica di ingrediente senza pagina (lascia testo semplice, niente link morto)

<!-- Verifica ogni slug su build/sitemap.xml: gli slug NON coincidono col path cartelle. -->

## Attrezzature per la cottura

<!-- Sezione opzionale: includila solo se serve un attrezzo particolare. -->

- attrezzo eventuale (es. padellina monoporzione, termometro)

## Preparazione

Procedimento fedele al testo dell'utente, un passaggio per paragrafo.

:::note
Informazione di contesto o dettaglio importante (es. qualita' dell'acqua, riposo, temperatura).
:::

Altro passaggio del procedimento.

:::warning
Errore da evitare / rischio (es. "non deve bollire", "non strizzare"). Usala dove c'e' un rischio reale.
:::

Passaggio finale.

:::tip
Trucco, riutilizzo o alternativa (es. seconda preparazione, come riciclare gli scarti, variante vegana
con [link interno](/ricette/...)).
:::

<!-- Varianti / sotto-preparazioni: aggiungi sezioni ## / ### solo se presenti nel contenuto,
     come Ichiban / Niban dashi. Altrimenti rimuovi questo blocco. -->

## Video

<!-- SEZIONE OPZIONALE: includila SOLO se l'utente ha fornito almeno un videoId.
     Se non te lo ha dato, cancella tutta questa sezione. -->

<YouTubeVideo videoId="ID_FORNITO_DALL_UTENTE" />

<!-- Piu' video con ruoli diversi: mettili sotto ### con etichetta, come nel dashi:
### Prima preparazione
<YouTubeVideo videoId="..." />
### Seconda preparazione
<YouTubeVideo videoId="..." />
-->

<!-- FIRMA OPZIONALE: aggiungila come ULTIMA riga SOLO se l'utente ha chiesto di firmare.
     <chiave> = chiave autore in blog/authors.yml (Aki -> aki). Altrimenti cancella questa riga. -->

— [Aki](/blog/authors/aki)
