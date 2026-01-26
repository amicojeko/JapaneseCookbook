# AGENTS.md

## Scopo del repository
Questo repository contiene un sito Docusaurus in italiano dedicato alla cucina giapponese: ricette, ingredienti, attrezzature e negozi. I contenuti devono essere human readable (Markdown) e allo stesso tempo funzionali al sito.

## Lingua e unita di misura
- Lingua: italiano.
- Unita: sistema metrico decimale.
- Mantieni il tono e lo stile dei file esistenti.

## Struttura contenuti
- Ricette: `docs/ricette/**`
- Ingredienti: `docs/ingredienti/**`
- Strumenti: `docs/strumenti/**`
- Negozi: dati in `src/data/negozi.ts`, pagine in `docs/negozi/**`

## Componenti e integrazioni
- `src/components/ImageComponent.tsx`: mostra immagini ricetta partendo dal frontmatter.
- `src/components/YouTubeVideo.tsx`: mostra video nelle pagine.
- Negozi:
  - Lista dati: `src/data/negozi.ts`
  - Rendering: `src/components/RegionShopList.tsx` e `src/components/NegoziMap.tsx`

## Immagini e metadati
- Lo script `scripts/generate-image-metadata.js` genera `build/image-metadata.json`.
- `build/` e `build/image-metadata.json` sono artefatti generati: non modificarli a mano, rigenerarli quando serve.
- Se aggiungi immagini, verifica che il frontmatter della pagina e il flusso di build le rendano disponibili.

## Frontmatter ricette
Le ricette usano frontmatter con almeno:
- `title`, `description`, `slug`
- `image` per l'immagine principale
- `ingredients` come lista base usata dal sito

## Flusso di lavoro e vincoli
- Mantieni la struttura dei file esistenti (titoli, sezioni, ordine).
- Non spostare contenuti tra cartelle senza chiedere.
- Evita modifiche a file generati o di build.
- Per aggiornare `ricettario.json`, usa lo script indicato nel README.

## Prompt suggerito (per agenti)
Segui le istruzioni in `AGENTS.md`. Mantieni lo stile italiano e il sistema metrico. Modifica solo i contenuti in `docs/` o i file TypeScript necessari (es. `src/data/negozi.ts`) e non toccare i file generati in `build/`.
