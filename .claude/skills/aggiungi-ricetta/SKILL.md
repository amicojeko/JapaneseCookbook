---
name: aggiungi-ricetta
description: Crea una nuova ricetta per paginegiappe.it partendo dal contenuto fornito dall'utente, seguendo tutte le convenzioni del progetto (frontmatter completo, immagine obbligatoria, link interni, admonition). Usala quando l'utente dice cose come "aggiungi una ricetta", "crea la ricetta per X", "facciamo la pagina del piatto Y", oppure passa direttamente il testo/procedimento di una ricetta da pubblicare.
---

# Aggiungi una ricetta a paginegiappe.it

Trasforma il contenuto di una ricetta fornito dall'utente in una pagina Markdown/MDX completa dentro `docs/ricette/`, rispettando tutte le convenzioni del progetto. Prendi come modello di riferimento di "ricetta complessa e ben fatta" `docs/ricette/preparazioni_di_base/brodi/dashi.md` e usa `template-ricetta.md` (in questa cartella) come scheletro.

**Regola d'oro:** posiziona il contenuto dell'utente il più fedelmente possibile. Aggiungi struttura (heading, admonition, link interni, ImageComponent) ma non stravolgere il testo. Se pensi serva un'edit di sostanza, proponila in chat e aspetta l'OK.

## Cosa raccogliere prima di scrivere

Prima di generare il file, assicurati di avere queste cose. Se manca qualcosa di **bloccante**, chiedila e fermati.

1. **Contenuto della ricetta** (ingredienti + procedimento). Bloccante: senza non si scrive.

2. **Immagine (OBBLIGATORIA).** Ogni ricetta deve avere un'immagine.
   - Cercala **prima** tra i file non committati/non tracciati: `git status --short` e guarda in `static/img/ricette/`. Spesso l'immagine master (`nome.jpg`) è già lì, appena aggiunta.
   - Se non la trovi, **chiedila all'utente** ("Mi passi l'immagine per la ricetta?") e fermati finché non te la mette lui. Non inventare un path e non usare un placeholder.
   - Nel frontmatter va il path del master: `image: /img/ricette/<slug-o-nome>.jpg`. Le varianti responsive (`-320w`/`-640w`… `.webp`/`.jpg`) le genera l'hook husky in fase di commit — non le crei tu.

3. **Video YouTube (opzionale).** Molte ricette hanno uno o più video.
   - **Chiedi sempre all'utente l'ID (o gli ID) del video** ("Hai un video YouTube per questa ricetta? Se sì passami l'ID").
   - Se l'utente **non** te lo dà, **non** aggiungere la sezione `## Video`. Non cercarlo tu su YouTube, non inventarlo.

4. **Titolo (romanji) e sottotitolo.** Il `title:` deve **richiamare una ricetta giapponese nota**: usa la versione **romanji** del nome del piatto (es. `Oyakodon`, `Tonjiru`, `Dashi`), non la traduzione italiana. Per un piatto-fusione o una variante, aggancialo alla ricetta canonica più vicina invece di inventare un nome descrittivo (es. un tofu freddo caricato con natto e kimchi → `Hiyayakko con Natto e Kimchi`, non `Tofu, natto, kimchi e ponzu`). Il `sidebar_custom_props.subtitle` **spiega in poche parole di che si tratta** in italiano (es. `Tofu freddo con natto, kimchi e ponzu`); la traduzione/descrizione più estesa va nel `description:`.

5. **Categoria.** Scegli la sottocartella giusta sotto `docs/ricette/` in base al metodo/tipo di piatto. Cartelle esistenti: `agemono`, `antipasti`, `fish`, `menrui`, `nimono`, `preparazioni_di_base`, `riso`, `sides`, `tsukemono`, `wagashi`, `yakimono`, `zuppe`. In dubbio, chiedi all'utente in quale categoria metterla.

6. **Firma (opzionale).** Se l'utente ti chiede di **firmare** la ricetta (es. "firmala Aki", "mettici la firma di Aki come sugli udon"), aggiungi la firma dell'autore come **ultima riga** del corpo (vedi sotto). Se non te lo chiede, non firmare.

## Firma dell'autore

Quando l'utente chiede di firmare la ricetta, chiudi il corpo — **dopo ogni altra sezione, `## Video` compresa** — con una riga em-dash + link alla pagina autore:

```markdown
— [Aki](/blog/authors/aki)
```

- Il testo del link è il **nome** dell'autore; l'URL è `/blog/authors/<chiave>`, dove `<chiave>` è la chiave dell'autore in [`blog/authors.yml`](../../../blog/authors.yml) (per Aki: `aki` → `/blog/authors/aki`). Verifica la chiave lì, non inventarla.
- È lo stesso formato usato in fondo a `docs/ricette/menrui/udon_fatti_in_casa.md` (la ricetta di riferimento per la firma).
- Separala dal resto con una riga vuota; nessun heading sopra.

## Frontmatter (sempre completo)

```yaml
---
title: Oyakodon                         # romanji del nome giapponese
sidebar_custom_props:
  subtitle: Riso con pollo e uova       # OBBLIGATORIO: sottotitolo breve in italiano
description: L'Oyakodon e' la carbonara giapponese   # descrizione SEO 1 frase
slug: /ricette/oyakodon                 # significativo, derivato dal titolo
image: /img/ricette/oyakodon.jpg        # OBBLIGATORIO
ingredients:                            # OBBLIGATORIO: collega la ricetta agli ingredienti
  - cipolla bianca
  - cosce di pollo
  - dashi
  - mirin
tags:                                   # OBBLIGATORIO
  - mirin
  - rice
recipeYield: 1 persona                  # opzionale ma consigliato (abilita lo scaling dosi via MCP)
---
```

Regole sul frontmatter:
- **`sidebar_custom_props.subtitle`**: sempre presente. È il sottotitolo che compare in sidebar e nelle card.
- **`slug`**: sempre assoluto, forma `/ricette/<slug>`, derivato dal titolo (romanji, minuscolo, con underscore se serve — guarda gli slug esistenti). Deve essere significativo, **non** ricalcare per forza il path delle cartelle.
- **`ingredients`** e **`tags`**: sempre presenti. Servono a collegare la ricetta alle pagine ingrediente (`IngredientRecipeList`) e ai tag. Elenca gli ingredienti in italiano; i tag pescali tra quelli già usati quando possibile.

## Struttura del corpo (in quest'ordine)

1. **Paragrafo introduttivo** — 2-5 frasi che raccontano cos'è il piatto, da dove viene, perché farlo. Come nel dashi. Niente heading prima di questo.
2. **`<ImageComponent />`** — subito dopo l'intro, senza props (legge `image` dal frontmatter e renderizza l'hero). Registrato globalmente, nessun import.
3. **`## Ingredienti`** — lista con le quantità in **sistema metrico**. Metti i **link interni** sugli ingredienti che hanno una pagina (vedi sotto).
4. **`## Attrezzature per la cottura`** — solo se rilevante (es. padellina monoporzione per l'oyakodon).
5. **`## Preparazione`** — il procedimento, fedele al testo dell'utente.
6. **Varianti / sotto-preparazioni** — se la ricetta ne ha (come Ichiban/Niban dashi), usa `##`/`###`. Solo se presenti nel contenuto.
7. **`## Video`** — **solo se** l'utente ha fornito almeno un ID. Un `<YouTubeVideo videoId="..." />` per video; se ce ne sono più con ruoli diversi, mettili sotto `###` con etichetta (come nel dashi).
8. **Firma** — **solo se** l'utente l'ha chiesta. Ultima riga in assoluto: `— [Nome](/blog/authors/<chiave>)` (vedi "Firma dell'autore").

## Link interni (OBBLIGATORIO, vedi CLAUDE.md)

Sia nel testo che nella lista ingredienti, collega **sempre** ingredienti e altre ricette citate alle loro pagine interne.

- Dentro liste/testo Markdown puoi usare la sintassi `[testo](/percorso)`: es. `[dashi](/ricette/dashi)`, `[mirin](/ingredienti/mirin)`, `[salsa di soia](/ingredienti/shoyu)`, `[negi](/ingredienti/negi)`.
- **Non inventare le URL.** Ricava lo slug corretto dal `build/sitemap.xml` (`grep <parola> build/sitemap.xml` → prendi il `<loc>`, togli `https://paginegiappe.it`). Se il sitemap è stale/assente, leggi il `slug:` dal frontmatter della pagina di destinazione. Attenzione: lo slug spesso **non** coincide col path delle cartelle (es. il dashi è a `/ricette/dashi`).
- Per gli ingredienti, la pagina è tipicamente `/ingredienti/<nome>`; verifica in `docs/ingredienti/` che esista. Se un ingrediente citato **non** ha ancora una pagina, lascialo come testo semplice (niente link morto).
- Nota di CLAUDE.md: dentro `.md`/`.mdx` per link SPA interni si può anche usare `<Link to="/path">` (import `@docusaurus/Link`); la sintassi Markdown `[](…)` è comunque accettata negli elenchi come fanno le ricette esistenti. I link esterni restano `<a target="_blank" rel="noopener noreferrer">`.

## Admonition (usale quando servono)

Usa i callout di Docusaurus per i consigli e gli avvertimenti, come nel dashi:
- `:::note` — informazioni di contesto / dettagli importanti (es. qualità dell'acqua).
- `:::tip` — trucchi, riutilizzi, alternative (es. fare il niban dashi, il furikake, la versione vegana).
- `:::warning` — errori da evitare (es. "non deve bollire", "non strizzare il katsuobushi").

Non forzarle: mettile solo dove il contenuto lo giustifica, ma quando c'è un rischio o un consiglio chiave, usale.

## Dopo aver scritto il file

1. **Verifica gli slug dei link** contro `build/sitemap.xml` (o i frontmatter di destinazione).
2. **`npm run build`** — obbligatorio (via WSL: `wsl.exe -d ubuntu-20.04 -- bash -c "cd … && npm run build"`). Il prebuild rigenera `src/data/recipe-data.ts`, `ingredient-recipes.ts` e `paginegiappe-knowledge.json`, altrimenti la ricetta non compare in home, nelle card ingrediente né nell'export AI. I file `src/data/*.ts` rigenerati vanno **nello stesso commit** della ricetta.
   - Se ottieni `npm: command not found`, node è gestito da nvm e non è sul PATH della shell non interattiva. Anteponi il bin di node 20: `bash -c 'export PATH="/home/jeko/.nvm/versions/node/v20.19.5/bin:$PATH"; cd /home/jeko/Workspace/JapaneseCookbook && npm run build'`.
3. Ricorda all'utente che l'immagine master, al commit, farà scattare l'hook husky che genera le varianti responsive.
4. Non committare a meno che l'utente non lo chieda.

## Checklist finale

- [ ] `title` = romanji del nome giapponese
- [ ] `sidebar_custom_props.subtitle` presente
- [ ] `slug` significativo, assoluto, derivato dal titolo
- [ ] `image` presente e il master esiste in `static/img/ricette/`
- [ ] `ingredients` e `tags` popolati
- [ ] Intro → `<ImageComponent />` → Ingredienti → Preparazione → (Varianti) → (Video)
- [ ] Link interni su ingredienti/ricette citati, slug verificati sul sitemap
- [ ] `:::note` / `:::tip` / `:::warning` dove servono
- [ ] Sezione `## Video` **solo** se l'utente ha dato l'ID
- [ ] Firma `— [Nome](/blog/authors/<chiave>)` in ultima riga **solo** se l'utente l'ha chiesta
- [ ] `npm run build` eseguito
