---
name: telegram-post
description: Componi e pubblica sul canale Telegram di paginegiappe.it un annuncio entusiasta per un nuovo articolo del blog o una nuova ricetta/pagina ingrediente. Usala quando l'utente dice cose come "posta su Telegram", "annuncia sul canale", "dai l'annuncio del nuovo articolo", dopo aver pubblicato un post o una ricetta. Mostra SEMPRE la bozza per la review e pubblica solo dopo l'OK esplicito.
---

# Annuncio Telegram per paginegiappe.it

Compone un messaggio entusiasta e naturale per il canale Telegram e lo pubblica **solo dopo che l'utente ha approvato la bozza**. Mai pubblicare senza OK esplicito.

## Prerequisiti

Le credenziali stanno in `.paginegiappe-telegram-token` nella root del repo (gitignored). Formato:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL=@paginegiappe        # @paginegiappe = prova, @amicojeko_news = definitivo
```

Se il file non esiste, dì all'utente di copiarlo da `.paginegiappe-telegram-token.sample` e fermati.

> Su Windows esegui i comandi via WSL, come da `CLAUDE.md`. Su macOS/Linux direttamente.

## Procedura

1. **Identifica il contenuto.** Se l'utente non lo specifica, prendi il post/ricetta aggiunto più di recente (es. `git log` / file più nuovo in `blog/` o `docs/`). Conferma con l'utente di quale contenuto si tratta se c'è ambiguità.

2. **Ricava titolo, descrizione e autore** dal frontmatter del file. Per i blog post, traduci la chiave autore in nome reale leggendo `blog/authors.yml`.

3. **Costruisci la URL di produzione.** Base: `https://paginegiappe.it`.
   - Pesca lo slug canonico da `build/sitemap.xml` (`grep` per una parola chiave del titolo → prendi il `<loc>`), come da convenzione in `CLAUDE.md`. **Non inventare la URL dal path delle cartelle.**
   - Se il sitemap è assente/stale, usa il campo `slug:` del frontmatter (le ricette/ingredienti hanno slug assoluto tipo `/ricette/...` o `/ingredienti/...`; i blog post hanno la URL finale `/blog/<slug>`). In dubbio, proponi un `npm run build` per rigenerare il sitemap.

4. **Scrivi il messaggio** seguendo la voce qui sotto. La URL va **da sola sull'ultima riga** (Telegram genera l'anteprima a card). Testo semplice, niente markdown.

5. **Mostra la bozza in chat** e chiedi conferma. Applica eventuali modifiche richieste e rimostra. **Non procedere senza un OK chiaro.**

6. **Pubblica** (vedi sotto). Riporta l'esito (`ok:true`) e il link al messaggio se disponibile.

## La voce (entusiasta, naturale, "amico che scrive di getto")

- Apertura calorosa e **variata**: a volte un saluto (`Ciao a tutti!!`, `Bella rega'!`, `Ciao canale!!`), a volte un gancio diretto (`Volete piangere?`, `Vi piacciono i germogli di bambù?`).
- Tono da amico appassionato, **mai** comunicato stampa o markettaro.
- Credita l'autore col **nome vero**, con epiteto giocoso quando calza (es. *Erick "il Fujitivo"*, *Mattia Curiosity Power*).
- Un piccolo gancio sul contenuto: 1-3 frasi, una curiosità, perché vale la pena leggerlo.
- Emoji con misura ma presenti (😂 😅 ❤️ 🥰). Doppi punti esclamativi ok.
- Riferimenti a Instagram/TikTok/video quando pertinenti (battutine incluse).
- Romanesco leggero ok se naturale (`daje`, `rega'`), mai forzato.
- **Niente firma finale.** URL di produzione da sola sull'ultima riga.
- Varia gli incipit tra un annuncio e l'altro: non ripetere sempre lo stesso schema.

### Esempi di riferimento (tono target)

```
Ciao canale!! Iniziamo subito con un articolo bellissimo scritto da Aki Nakagoe che ci racconta tutto sugli Udon!! a quelli di instagram glielo diciamo dopo perche non se lo meritano 😂
https://paginegiappe.it/blog/udon-storia-e-varieta/
```

```
Volete piangere? Dai che ci sta un bel pianterello il giovedi, di quelli che vi commuovete un po' e poi tutto passa! Allora leggetevi la storia di Miki Matsubara, la mitica cantante di "Stay with me"...
https://paginegiappe.it/blog/miki-matsubara/
```

```
Ciao a tutti!! Oggi abbiamo un nuovo articolo di Mattia Curiosity Power, sulle Hyorogan, le barrette energetiche dei ninja!! E presto avremo anche la ricetta!! ❤️ https://paginegiappe.it/blog/hyorogan/
```

```
Bella rega'! Iniziamo la settimana con un nuovo articolo sul blog! Carlo, sake sommelier di Aiki - Roma, ci parla del Mirin, di quanto sia diverso dal sake, e di quando si beveva (perche' si, esiste anche il Mirin da bere), daje e buona settimana!!
https://paginegiappe.it/blog/mirin-sake/
```

## Pubblicazione

Scrivi il messaggio approvato in un file temporaneo (evita problemi di escaping con emoji e a capo) e invialo. Esegui dalla root del repo:

```bash
set -a; source .paginegiappe-telegram-token; set +a

# Scrivi qui il testo approvato:
cat > /tmp/tg-msg.txt <<'EOF'
<TESTO APPROVATO QUI>
EOF

curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_CHANNEL}" \
  --data-urlencode "text@/tmp/tg-msg.txt" \
  -d "disable_web_page_preview=false"

rm -f /tmp/tg-msg.txt
```

Controlla che la risposta JSON contenga `"ok":true`. Se `ok:false`, riporta `description` all'utente (errori tipici: bot non admin del canale, `chat_id` sbagliato, token errato).
