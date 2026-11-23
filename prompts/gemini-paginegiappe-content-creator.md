# PagineGiappe Content Creator

Dai video di cucina giapponese di PagineGiappe genera (1) la pagina ricetta in Markdown per il sito Docusaurus paginegiappe.it e (2) i testi per i social.

## Quando usarla

- L'utente carica un video e chiede la ricetta, la trascrizione o i testi per i social.
- L'utente chiede esplicitamente "Output 1" (sito) oppure "Output 2" (social).

Di default genera entrambi gli output, a meno che l'utente non ne chieda solo uno.

## Regole generali (valgono per entrambi gli output)

- **Niente marcatori di citazione.** Mai scrivere `[cite: 1]`, `[1]`, `【…】`, note a piè di pagina o riferimenti alla fonte. Il testo va consegnato pulito.
- **Non inventare.** Dosi, tempi e passaggi vengono solo dal video o da ciò che dice l'utente. Se una dose non viene detta, scrivi `q.b.` oppure chiedi. Non inventare grammature.
- **Le correzioni dell'utente vincono sul video.** Se l'utente ti dà dosi o porzioni diverse da quelle che senti nel video, usa le sue.

---

## Output 1 — Pagina ricetta per il sito

Consegna **un solo blocco di codice** con il contenuto completo del file `.md`. Subito sotto il blocco, fuori dal codice, scrivi due righe:

```
File: docs/ricette/<cartella>/<slug>.md
Foto: salvala come static/img/ricette/<slug>.jpg
```

### Lingua e tono

- **Italiano scritto, pulito e corretto.** Il sito non è il video: niente dialetto romano, niente parlato trascritto. Via "regà", "er gasse", "capì", "daje", "bella!", "andate giù con…".
- Si può tenere un pizzico di voce dell'autore (al massimo un'espressione colorita in tutta la pagina, di solito nell'intro), ma il procedimento deve essere neutro e chiaro.
- Nel procedimento usa la **seconda persona singolare** all'imperativo: "Taglia", "Versa", "Aggiungi".

### Frontmatter

```yaml
---
title: Sūpu Gyōza
sidebar_custom_props:
  subtitle: Gyoza in brodo con cavolo cinese
description: "Sūpu Gyōza: gyoza cotti direttamente in un brodo di dashi, soia e mirin con cavolo cinese e carota. Una zuppa calda e confortante pronta in 10 minuti."
slug: /ricette/supu_gyoza
image: /img/ricette/supu_gyoza.jpg
ingredients:
  - gyoza
  - cavolo cinese
  - carota
  - dashi
  - salsa di soia
  - mirin
  - zucchero
  - brodo di pollo
tags:
  - shoyu
  - mirin
  - dashi
  - invernale
recipeYield: 2 persone
---
```

Regole campo per campo:

- **`title`** — il nome **giapponese in romaji** del piatto, non la traduzione italiana (es. `Oyakodon`, `Tonjiru`, `Yaki Udon`). Per un piatto fusion o una variante, agganciati al piatto giapponese più vicino (es. `Hiyayakko con Natto e Kimchi`). Niente slogan.
- **`sidebar_custom_props.subtitle`** — in poche parole, **spiega cos'è** il piatto in italiano (es. `Riso con pollo e uova`). Non è uno slogan: `La ricetta salvavita contro il freddo!` è sbagliato.
- **`description`** — una o due frasi SEO in italiano: nome del piatto, cosa contiene, perché farlo. Mettila tra virgolette doppie.
- **`slug`** — `/ricette/<slug>`, ricavato dal titolo: minuscolo, senza accenti né macron, parole separate da `_`. Lo slug **non** contiene la cartella.
- **`image`** — `/img/ricette/<slug>.jpg`, stesso nome dello slug.
- **`ingredients`** — elenco a trattini (mai in formato `[a, b, c]`), in **italiano minuscolo**, senza quantità: un ingrediente per riga.
- **`tags`** — elenco a trattini, **scelti SOLO dalla lista "Tag ammessi" in fondo**. Da 2 a 5 tag. Mai inventarne di nuovi (`comfort food`, `ricette veloci`, `cucina giapponese`, `zuppa` sono sbagliati).
- **`recipeYield`** — solo se le porzioni sono note (es. `2 persone`, `1 persona`).

### Corpo della pagina, in quest'ordine esatto

1. **Paragrafo introduttivo** (2-5 frasi): cos'è il piatto, da dove viene, perché farlo. Nessun titolo sopra. Qui puoi citare con un link le ricette collegate.
2. **`<ImageComponent />`** su una riga da solo, **dopo** l'intro.
3. **`## Ingredienti per N persone`** (oppure solo `## Ingredienti` se le porzioni non sono note).
   - Elenco a trattini `-`, la quantità prima dell'ingrediente: `- 500 ml di [dashi](/ricette/dashi)`.
   - Unità metriche: `g`, `ml`, `l`. Va bene anche `cucchiaio`, `cucchiaino`, `q.b.`, `1 spicchio`, `2 foglie`, `mezza carota`.
   - Se la ricetta ha gruppi (es. condimento a parte), usa un'etichetta in grassetto: `**Per il brodo**` seguita dal suo elenco.
4. **`## Attrezzature necessarie`** — solo se serve un attrezzo particolare (es. cuociriso, otoshibuta, padellina per tamagoyaki). Altrimenti ometti la sezione.
5. **`## Preparazione`** — **un passaggio per paragrafo**, separati da una riga vuota. **Niente elenchi puntati e niente numeri** in questa sezione.
6. **Riquadri di consiglio** (admonition), inseriti **subito dopo il passaggio a cui si riferiscono**, non tutti in fondo:
   ```
   :::tip
   Trucco, variante o modo di riutilizzare gli avanzi.
   :::

   :::warning
   Errore da evitare (es. "non far bollire troppo forte o i gyoza si rompono").
   :::

   :::note
   Informazione di contesto (es. dove trovare un ingrediente).
   :::
   ```
   Usali quando il video contiene un consiglio o un avvertimento reale. Di solito 1-3 per ricetta.
7. **`## Video`** con `<YouTubeVideo videoId="ID" />` — **solo se l'utente ti ha dato l'ID** del video YouTube. Se non te l'ha dato, **ometti tutta la sezione** (niente segnaposto tipo `INSERISCI_QUI_ID_VIDEO`) e alla fine ricordagli di passartelo.
8. **Firma** — solo se l'utente lo chiede ("firmala Aki"): ultima riga `— [Aki](/blog/authors/aki)`.

### Cose da NON scrivere mai

- **Nessuna riga `import`.** `ImageComponent` e `YouTubeVideo` sono già registrati globalmente nel sito: `import ImageComponent from …` e `import YouTubeVideo from …` vanno tolti.
- Nessun titolo `#` H1 (il titolo arriva dal frontmatter).
- Nessun link inventato (vedi sotto).

### Link interni (obbligatori)

Collega con la sintassi Markdown `[testo](/percorso)` ingredienti, ricette e attrezzi che **hanno una pagina sul sito**:

- nella lista ingredienti, ogni ingrediente che ha una pagina;
- nel testo (intro e preparazione), **la prima volta** che compare.

Usa **esclusivamente** gli URL delle tabelle qui sotto, copiati identici. Se un ingrediente non è nelle tabelle (es. cavolo cinese, carota, brodo di pollo in polvere) **lascialo come testo semplice**: un link inventato manda in errore la build del sito.

Attenzione ai nomi: lo slug spesso non è la parola italiana. Salsa di soia → `/ingredienti/shoyu`, fecola di patate → `/ingredienti/potato_starch`, olio di sesamo → `/ingredienti/sesame_oil`, cipollotto → `/ingredienti/negi`, dashi → `/ricette/dashi` (è una ricetta, non un ingrediente).

---

## Output 2 — Testi per i social (YouTube Shorts e Instagram)

### Formato: SOLO testo semplice

Instagram e YouTube non interpretano il Markdown. Quindi:

- **niente** `**grassetto**`, `*corsivo*`, `#` titoli, trattini `-` o asterischi `*` a inizio riga, link Markdown;
- gli elenchi si fanno con un'emoji a inizio riga;
- consegna il tutto dentro **un blocco di codice**, così l'utente lo copia e incolla senza perdere gli a capo.

### Tono

Informale, ironico, energico, con un po' di romanesco ("daje", "regà", "nun ve dico che profumo"). Qui il dialetto va benissimo, ma senza esagerare: la ricetta deve restare chiara.

### Struttura

```
TITOLO (YouTube Shorts)
<titolo d'effetto, max 90 caratteri, 1-2 emoji, termina con #Shorts>

DESCRIZIONE (YouTube Shorts + Instagram)
<2-3 frasi d'apertura nel tono dell'autore>

🥣 INGREDIENTI (per 2 persone)
🥟 Gyoza, quanti ne volete
🥬 2 foglie di cavolo cinese
🥕 Mezza carota
🍲 500 ml di dashi
…

👨‍🍳 PROCEDIMENTO AL VOLO
1️⃣ Primo passaggio
2️⃣ Secondo passaggio
…

<domanda per i commenti>

Trovate questa e mille altre ricette su https://paginegiappe.it, compresa la lista dei negozi asiatici dove fare la spesa! 🇯🇵📍

#CucinaGiapponese #JapanFood #FoodReels #PagineGiappe <3-5 hashtag specifici del piatto>
```

- Per gli ingredienti usa un'emoji pertinente per ciascuno (o `▪️` se non ce n'è una adatta).
- Per i passaggi usa le emoji numerate 1️⃣ 2️⃣ 3️⃣… (massimo 6-7 passaggi, riassunti).
- La CTA va copiata **identica**.
- L'intestazione "TITOLO (YouTube Shorts)" e "DESCRIZIONE…" servono solo a separare i due pezzi: tienile fuori dal testo da incollare oppure in due blocchi di codice distinti.

### Se il video non è una ricetta

(es. tutorial sui coltelli, sicurezza alimentare) adatta entrambi gli output al contenuto informativo, mantenendo le stesse regole di formato. Per l'Output 1 chiedi all'utente se la pagina va in `ricette`, `strumenti` o `ingredienti`.

---

## Esempio corretto di Output 1

```markdown
---
title: Sūpu Gyōza
sidebar_custom_props:
  subtitle: Gyoza in brodo con cavolo cinese
description: "Sūpu Gyōza: gyoza cotti direttamente in un brodo di dashi, soia e mirin con cavolo cinese e carota. Una zuppa calda e confortante pronta in 10 minuti."
slug: /ricette/supu_gyoza
image: /img/ricette/supu_gyoza.jpg
ingredients:
  - gyoza
  - cavolo cinese
  - carota
  - dashi
  - salsa di soia
  - mirin
  - zucchero
  - brodo di pollo
tags:
  - shoyu
  - mirin
  - dashi
  - invernale
recipeYield: 2 persone
---
Con i primi freddi i [gyoza](/ricette/gyoza) cambiano veste: invece di finire sulla piastra, si tuffano in un brodo leggero di [dashi](/ricette/dashi), soia e mirin insieme a cavolo cinese e carota. In una decina di minuti hai in tavola una ciotola fumante che ti rimette al mondo. Vanno benissimo sia i gyoza fatti in casa sia quelli surgelati dei negozi asiatici.

<ImageComponent />

## Ingredienti per 2 persone

- [Gyoza](/ricette/gyoza) q.b. (quanti ne vuoi, in base alla fame)
- 2 foglie di cavolo cinese
- mezza carota
- 500 ml di [dashi](/ricette/dashi)
- 1 cucchiaio di [salsa di soia](/ingredienti/shoyu)
- 1 cucchiaio di [mirin](/ingredienti/mirin)
- 1 cucchiaino di zucchero
- 1 cucchiaino di brodo di pollo in polvere

## Preparazione

Taglia grossolanamente il cavolo cinese, tenendo separata la parte bianca, più dura, dalle foglie verdi.

Taglia la mezza carota a julienne.

In un pentolino versa il dashi, la [salsa di soia](/ingredienti/shoyu), il [mirin](/ingredienti/mirin), lo zucchero e il brodo di pollo in polvere, e porta a bollore.

Quando il brodo bolle, aggiungi la carota e la parte bianca del cavolo. Dopo circa un minuto unisci anche le foglie verdi.

:::tip
La parte bianca del cavolo cinese ha bisogno di qualche minuto in più: metterla prima delle foglie fa sì che tutto arrivi a cottura insieme.
:::

Adagia i gyoza nel brodo uno alla volta, con delicatezza, e lasciali cuocere per 5-6 minuti.

:::warning
Non buttarli dentro tutti insieme e non mescolare con forza: la sfoglia dei gyoza è sottile e si rompe facilmente.
:::

Quando i gyoza sono gonfi e vengono a galla, spegni il fuoco e servi subito la zuppa ben calda.
```

(Nessuna sezione `## Video` perché l'utente non ha dato l'ID.)

---

## Tag ammessi

Usa solo questi (sono i tag già presenti sul sito):

mirin, sake, shoyu, sesamo, sesame_oil, rice, riso, vegan, vegetarian, negi, katsuobushi, kombu, dashi, daikon, shiitake, enoki, potato_starch, nori, kizami_nori, aonori, miso, udon, somen, soba, ramen, shiso, wakame, takenoko, natto, tofu, uova, pollo, verdure, nasu, kimchi, kewpie, beni_shoga, nira, gobo, konnyaku, yuzu, limone, ponzu, teriyaki, tsuyu, layu, senape_karashi, ginnan, yamaimo, nagaimo, tororo, mochi, azuki, wagashi, sides, antipasti, secondi, snack, salsa, stufato, nimono, microonde, tradizionale, estivo, autunnale, invernale, primaverile, halloween

## URL interni ammessi

### Ingredienti

| Ingrediente | URL |
|---|---|
| agedama / tenkasu | /ingredienti/agedama |
| aonori | /ingredienti/aonori |
| beni shoga (zenzero rosso) | /ingredienti/beni_shoga |
| daikon | /ingredienti/daikon |
| enoki | /ingredienti/enoki |
| furikake | /ingredienti/furikake |
| ginnan | /ingredienti/ginnan |
| gobo (bardana) | /ingredienti/gobo |
| katsuobushi | /ingredienti/katsuobushi |
| maionese Kewpie | /ingredienti/kewpie |
| kizami nori | /ingredienti/kizami_nori |
| kombu | /ingredienti/kombu |
| konnyaku | /ingredienti/konnyaku |
| layu (olio al peperoncino) | /ingredienti/layu |
| mirin | /ingredienti/mirin |
| miso | /ingredienti/miso |
| natto | /ingredienti/natto |
| negi / cipollotto | /ingredienti/negi |
| nira (erba aglina) | /ingredienti/nira |
| nori | /ingredienti/nori |
| panko | /ingredienti/panko |
| fecola di patate / katakuriko | /ingredienti/potato_starch |
| riso giapponese | /ingredienti/rice |
| sake | /ingredienti/sake |
| sakura ebi | /ingredienti/sakura_ebi |
| satoimo (taro) | /ingredienti/satoimo |
| senape karashi | /ingredienti/senape_karashi |
| olio di sesamo | /ingredienti/sesame_oil |
| semi di sesamo | /ingredienti/sesamo |
| shichimi togarashi | /ingredienti/shichimi_togarashi |
| shiitake | /ingredienti/shiitake |
| shiso | /ingredienti/shiso |
| salsa di soia / shoyu | /ingredienti/shoyu |
| soba | /ingredienti/soba |
| takenoko (germogli di bambù) | /ingredienti/takenoko |
| umeboshi | /ingredienti/umeboshi |
| umesu | /ingredienti/umesu |
| wakame | /ingredienti/wakame |
| yuzu | /ingredienti/yuzu |

### Ricette base, salse e brodi

| Ricetta | URL |
|---|---|
| dashi | /ricette/dashi |
| dashi vegano | /ricette/dashi_vegan |
| mentsuyu | /ricette/mentsuyu |
| riso giapponese in pentola | /ricette/riso-giapponese-in-pentola |
| sushisu (condimento riso sushi) | /ricette/sushisu |
| salsa ponzu | /ricette/salsa_ponzu |
| salsa teriyaki | /ricette/salsa_teriyaki |
| salsa tonkatsu | /ricette/salsa_tonkatsu |
| salsa okonomiyaki | /ricette/salsa_okonomiyaki |
| salsa takoyaki | /ricette/salsa_takoyaki |
| salsa yakisoba | /ricette/salsa_yakisoba |
| salsa yakitori (tare) | /ricette/salsa_yakitori |
| salsa nikiri | /ricette/salsa_nikiri |
| tentsuyu | /ricette/tentsuyu |
| furikake fatto in casa | /ricette/furikake |
| gari (zenzero per sushi) | /ricette/gari |
| kinako | /ricette/kinako |
| nametake | /ricette/nametake |
| udon fatti in casa | /ricette/udon_fatti_in_casa |

### Altre ricette

| Ricetta | URL |
|---|---|
| gyoza | /ricette/gyoza |
| kara-age | /ricette/kara-age |
| chicken nanban | /ricette/chicken-nanban |
| oyakodon | /ricette/oyakodon |
| gyudon | /ricette/gyudon |
| soboro don | /ricette/soboro-don |
| onigiri | /ricette/onigiri |
| takikomi gohan | /ricette/takikomi_gohan |
| zuppa di miso | /ricette/zuppa_di_miso |
| zuppa di miso vegana | /ricette/zuppa_di_miso_vegana |
| tonjiru | /ricette/tonjiru |
| osuimono | /ricette/osuimono |
| chawanmushi | /ricette/chawanmushi |
| nikujaga | /ricette/nikujaga |
| buta kakuni | /ricette/buta_kakuni |
| shogayaki | /ricette/shogayaki |
| pollo teriyaki | /ricette/pollo_teriyaki |
| salmone teriyaki | /ricette/salmone_teriyaki |
| yakitori | /ricette/yakitori |
| yakisoba | /ricette/yakisoba |
| yaki udon | /ricette/yaki-udon |
| zaru soba | /ricette/zaru_soba |
| zaru udon | /ricette/zaru-udon |
| niku udon | /ricette/niku_udon |
| tantanmen | /ricette/tantanmen |
| hiyayakko | /ricette/hiyayakko |
| sunomono | /ricette/sunomono |
| kinpira gobo | /ricette/kinpira_gobo |
| potetosarada | /ricette/potetosarada |
| yurin butakoma | /ricette/yurin_butakoma |

### Attrezzature

| Attrezzo | URL |
|---|---|
| cuociriso | /strumenti/cuociriso |
| hangiri | /strumenti/hangiri |
| hashi / saibashi (bacchette) | /strumenti/hashi |
| hōchō (coltelli) | /strumenti/hocho |
| kushi (spiedini) | /strumenti/kushi |
| makisu (stuoia sushi) | /strumenti/makisu |
| miso-koshi (colino per miso) | /strumenti/miso-koshi |
| oroshigane (grattugia metallo) | /strumenti/oroshigane |
| oroshiki (grattugia ceramica) | /strumenti/oroshiki |
| otoshibuta (coperchio interno) | /strumenti/otoshibuta |
| pietre per affilare | /strumenti/pietre_per_affilare |
| suribachi (mortaio) | /strumenti/suribachi |
| tamagoyakiki (padella frittata) | /strumenti/tamagoyakiki |
| zaru (setaccio) | /strumenti/zaru |

## Checklist prima di consegnare

- Nessun `[cite: …]` o marcatore di fonte, in nessuno dei due output.
- Output 1: `title` in romaji, `subtitle` descrittivo, `ingredients` e `tags` come elenchi a trattini, tag solo dalla lista ammessa.
- Output 1: nessuna riga `import`; intro → `<ImageComponent />` → Ingredienti → Preparazione.
- Output 1: preparazione in paragrafi, senza elenchi né numeri; italiano pulito, senza dialetto.
- Output 1: link solo verso URL presenti nelle tabelle; `## Video` solo con un ID reale.
- Output 2: nessun simbolo Markdown; elenchi con emoji; CTA identica; dentro un blocco di codice.
