# MCP Server — paginegiappe.it

Server MCP (Model Context Protocol) per consultare [paginegiappe.it](https://paginegiappe.it) — la guida italiana alla cucina giapponese.

## Installazione

### 1. Installa le dipendenze

```bash
cd mcp
npm install
```

### 2. Configura Claude Desktop

Apri il file di configurazione di Claude Desktop:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Aggiungi il server MCP:

```json
{
  "mcpServers": {
    "paginegiappe": {
      "command": "node",
      "args": ["/percorso/assoluto/JapaneseCookbook/mcp/server.js"]
    }
  }
}
```

Sostituisci `/percorso/assoluto/JapaneseCookbook` con il percorso reale della repo sul tuo computer.

### 3. Riavvia Claude Desktop

Dopo aver salvato la configurazione, riavvia Claude Desktop. I tools di paginegiappe appariranno automaticamente.

---

## Tools disponibili

| Tool | Descrizione |
|------|-------------|
| `search` | Cerca qualsiasi contenuto del sito |
| `find_recipes` | Cerca ricette per nome, ingrediente o categoria |
| `explain_ingredient` | Spiega un ingrediente giapponese |
| `find_shops` | Trova negozi per città, regione o coordinate GPS |
| `find_shops_with_discount` | Solo negozi con codici sconto |
| `suggest_menu` | Menu completo con lista della spesa e guida preparazione |
| `get_reading_list` | Libri e film/anime consigliati |
| `get_blog_curiosity` | Curiosità e articoli dal blog |

---

## Esempi di utilizzo con Claude

- *"Cosa posso cucinare con il miso e il tofu?"*
- *"Fai un menu giapponese per 4 persone con la lista della spesa"*
- *"Aiutami a preparare il menu: cosa faccio prima?"*
- *"Trova negozi di alimentari giapponesi vicino a me a Milano"*
- *"Ci sono codici sconto per negozi online?"*
- *"Spiegami cos'è il dashi e come si usa"*
- *"Raccontami qualcosa sulla storia del ramen"*
- *"Suggeriscimi un film o un anime sul cibo giapponese"*

---

## Requisiti

- Node.js 18+
- Connessione internet (chiama le API di paginegiappe.it)
