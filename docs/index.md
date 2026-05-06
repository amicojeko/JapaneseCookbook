---
  title: "Ricette Giapponesi · 90+ ricette autentiche in italiano"
  sidebar_label: 🏠 Home
  description: "90+ ricette giapponesi autentiche in italiano, con foto e video: dal ramen al sushi, dai contorni alle salse. Spiegate passo passo da chi le ha imparate dai libri giapponesi."
  pagination_next: null
  pagination_prev: null
  hide_table_of_contents: true
  sidebar_position: 0
---
import '../src/css/homepage.css';
import DocCardGrid from '@site/src/components/DocCardGrid';

export const CATEGORIES = [
  { id: 'ricette/agemono/kara-age',                       title: '🍤 Agemono',          description: 'Fritti giapponesi: tempura, kara-age, korokke',       permalink: '/ricette/agemono/' },
  { id: 'ricette/antipasti/hiyashi_nasu',                 title: '🍽️ Antipasti',         description: "Piatti d'apertura e stuzzichini da izakaya",         permalink: '/ricette/antipasti/' },
  { id: 'ricette/fish/teriyaki_salmon',                   title: '🐟 Pesce',             description: 'Salmone, pesce alla griglia, sashimi e altri secondi',permalink: '/ricette/fish/' },
  { id: 'ricette/menrui/yakisoba',                        title: '🍜 Menrui',            description: 'Noodles giapponesi: udon, soba, somen, ramen',        permalink: '/ricette/menrui/' },
  { id: 'ricette/nimono/nikujaga',                        title: '🍲 Nimono',            description: 'Stufati e brasati a fuoco lento',                     permalink: '/ricette/nimono/' },
  { id: 'ricette/riso/gyudon',                            title: '🍚 Riso',              description: 'Onigiri, donburi, takikomi gohan e gohan mono',       permalink: '/ricette/riso/' },
  { id: 'ricette/sides/bieta_gialla_ohitashi',            title: '🥗 Contorni',          description: 'Verdure, insalate e piccoli piatti di accompagnamento', permalink: '/ricette/sides/' },
  { id: 'ricette/tsukemono/daikon_shiokombuzuke',         title: '🥒 Tsukemono',         description: 'Marinati e fermentati alla giapponese',               permalink: '/ricette/tsukemono/' },
  { id: 'ricette/yakimono/gyoza',                         title: '🍖 Yakimono',          description: 'Cotture alla griglia, in padella e in piastra',       permalink: '/ricette/yakimono/' },
  { id: 'ricette/zuppe/misoshiru',                        title: '🍲 Zuppe',             description: 'Misoshiru, suimono e zuppe stagionali',               permalink: '/ricette/zuppe/' },
  { id: 'ricette/preparazioni_di_base/brodi/dashi',       title: '👨🏻‍🍳 Preparazioni di base', description: 'Brodi, salse, condimenti e tecniche di sushi',        permalink: '/ricette/preparazioni_di_base/' },
];

export const FEATURED_RECIPES = [
  { id: 'ricette/agemono/kara-age',                       title: 'Kara-Age',         description: 'Pollo fritto giapponese, croccante fuori e succoso dentro', permalink: '/ricette/kara-age/' },
  { id: 'ricette/yakimono/gyoza',                         title: 'Gyoza',            description: 'Ravioli giapponesi alla piastra',                           permalink: '/ricette/gyoza/' },
  { id: 'ricette/preparazioni_di_base/brodi/dashi',       title: 'Dashi',            description: 'Il brodo madre della cucina giapponese',                    permalink: '/ricette/dashi/' },
  { id: 'ricette/preparazioni_di_base/brodi/mentsuyu',    title: 'Mentsuyu',         description: 'Salsa concentrata per soba e udon',                         permalink: '/ricette/mentsuyu/' },
  { id: 'ricette/fish/teriyaki_salmon',                   title: 'Salmone Teriyaki', description: 'Salmone glassato in salsa teriyaki',                        permalink: '/ricette/salmone_teriyaki/' },
  { id: 'ricette/riso/onigiri',                           title: 'Onigiri',          description: 'Polpette di riso giapponesi',                               permalink: '/ricette/onigiri/' },
  { id: 'ricette/riso/gyudon',                            title: 'Gyudon',           description: 'Donburi di manzo e cipolla',                                permalink: '/ricette/gyudon/' },
  { id: 'ricette/preparazioni_di_base/salse/teriyaki',    title: 'Salsa Teriyaki',   description: 'La salsa teriyaki classica fatta in casa',                  permalink: '/ricette/salsa_teriyaki/' },
  { id: 'ricette/preparazioni_di_base/salse/ponzu',       title: 'Salsa Ponzu',      description: 'Salsa di soia e agrumi, fresca e versatile',                permalink: '/ricette/salsa_ponzu/' },
  { id: 'ricette/yakimono/takoyaki',                      title: 'Takoyaki',         description: 'Polpettine di polpo dello street food di Osaka',            permalink: '/ricette/takoyaki/' },
];

export const KEY_INGREDIENTS = [
  { id: 'ingredienti/rice',                                title: 'Riso',         description: 'La base assoluta della cucina giapponese',     permalink: '/ingredienti/rice/' },
  { id: 'ingredienti/miso',                                title: 'Miso',         description: 'Pasta di soia fermentata, tipi e usi',         permalink: '/ingredienti/miso/' },
  { id: 'ricette/preparazioni_di_base/brodi/dashi',        title: 'Dashi',        description: 'Il brodo madre con kombu e katsuobushi',       permalink: '/ricette/dashi/' },
  { id: 'ingredienti/katsuobushi',                         title: 'Katsuobushi',  description: 'Scaglie di tonnetto essiccato, anima del dashi', permalink: '/ingredienti/katsuobushi/' },
  { id: 'ingredienti/nori',                                title: 'Alga Nori',    description: "L'alga in fogli per onigiri e sushi",         permalink: '/ingredienti/nori/' },
  { id: 'ingredienti/kombu',                               title: 'Alga Kombu',   description: 'Alga essenziale per dashi e brodi',            permalink: '/ingredienti/kombu/' },
  { id: 'ingredienti/sesamo',                              title: 'Sesamo',       description: 'Semi e olio: aroma in tutto il menu',          permalink: '/ingredienti/sesamo/' },
  { id: 'ingredienti/shiitake',                            title: 'Shiitake',     description: 'Il fungo umami della cucina giapponese',       permalink: '/ingredienti/shiitake/' },
];

Questa è la mia raccolta di **ricette giapponesi**, frutto di anni di studio su libri, confronti con maestri straordinari e prove infinite ai fornelli. Ogni piatto è stato testato, rifatto e perfezionato da me, con l'idea di rendere la **cucina giapponese** autentica semplice e accessibile a tutti. Dalle basi fondamentali come [dashi](/ricette/dashi/) e salse, fino ad agemono, menrui, nimono, tsukemono, yakimono e piatti di riso.

Qui trovi cucina casalinga e da izakaya, niente fusion e niente piatti da all you can eat. In più trovi guide su ingredienti e strumenti, le mie [fonti di ispirazione](/libri/) e una lista collaborativa di [negozi giapponesi in Italia](/negozi_orientali/), in continua evoluzione.

## 🍱 Le categorie

<DocCardGrid docs={CATEGORIES} />

## 🔥 Ricette più cercate

<DocCardGrid docs={FEATURED_RECIPES} />

## 🍅 Ingredienti chiave della cucina giapponese

<DocCardGrid docs={KEY_INGREDIENTS} />

## 🏪 Trova ingredienti vicino a te

Cucinare giapponese a casa parte dalla materia prima. Per riso giapponese, miso, mirin, alghe, salsa di soia di qualità e tutto il resto serve un buon **negozio asiatico**. Su [paginegiappe.it/negozi_orientali](/negozi_orientali/) tengo una lista collaborativa di **negozi giapponesi e asiatici in Italia**, regione per regione, con [mappa interattiva](/negozi_orientali/mappa/) e [shop online](/negozi_orientali/online/).

Regioni con più negozi: [Lombardia](/negozi_orientali/lombardia/) · [Lazio](/negozi_orientali/lazio/) · [Piemonte](/negozi_orientali/piemonte/) · [Emilia-Romagna](/negozi_orientali/emilia_romagna/) · [Veneto](/negozi_orientali/veneto/) · [tutte le regioni →](/negozi_orientali/)

<div className="paypal-mini">
  <span className="paypal-mini-icon">☕</span>
  <span className="paypal-mini-text">Se il sito ti è utile, <a href="https://paypal.me/jeko23" target="_blank" rel="noopener noreferrer">offrimi un caffè su PayPal</a> — grazie!</span>
</div>

<div className="social-container">
  <span>@amicojeko</span>

  <a href="https://www.instagram.com/amicojeko/" target="_blank" rel="noopener noreferrer" title="Instagram">
    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" alt="Instagram" width={36} className="social-icon" />
  </a>

  <a href="https://www.tiktok.com/@amicojeko" target="_blank" rel="noopener noreferrer" title="TikTok">
    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg" alt="TikTok" width={36} className="social-icon" />
  </a>

  <a href="https://chatgpt.com/g/g-6820cb0fed508191adafb39249db35f0-jeko-s-japanese-recipes-assistant/" target="_blank" rel="noopener noreferrer" title="Jeko's GPT">
    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg" alt="ChatGPT" width={36} className="social-icon" />
  </a>
</div>
