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

## Template e componenti custom
- Template tag pages: `src/theme/DocTagDocListPage/index.tsx` e `styles.module.css`
  - Mostra le card dei documenti con immagini caricate da `/image-metadata.json`
  - Usa un layout a griglia per visualizzare i documenti taggati
  - Utilizza il componente condiviso `DocCard` per le card
- Componente `DocCard`: `src/components/DocCard.tsx`
  - Componente riusabile per mostrare una card documento (ricette, ingredienti, strumenti)
  - Carica automaticamente l'immagine da `/image-metadata.json`
  - Usato sia nelle pagine tag che nelle pagine index delle categorie
- Componente `CategoryIndexPage`: `src/components/CategoryIndexPage.tsx`
  - Componente per creare homepage di categoria che mostrano le ricette come card
  - Da usare in file `index.md` nelle cartelle di categoria (es. `docs/ricette/agemono/index.md`)
  - Usa automaticamente i metadati dei doc nella cartella corrente (esclude l'index)
  - Esempio di utilizzo:
    ```markdown
    ---
    title: "🍤 Agemono - fritti"
    description: "Ricette di fritture giapponesi"
    slug: "/ricette/agemono"
    ---

    import CategoryIndexPage from '@site/src/components/CategoryIndexPage';

    <CategoryIndexPage />
    ```

## Prompt suggerito (per agenti)
Segui le istruzioni in `AGENTS.md`. Mantieni lo stile italiano e il sistema metrico. Modifica solo i contenuti in `docs/` o i file TypeScript necessari (es. `src/data/negozi.ts`) e non toccare i file generati in `build/`. Se non trovi un file o un template, chiedi invece di inventare.
