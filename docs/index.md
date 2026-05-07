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
import DocsByIdGrid from '@site/src/components/DocsByIdGrid';

export const CATEGORIES = [
  'ricette/preparazioni_di_base/index',
  'ricette/agemono/index',
  'ricette/antipasti/index',
  'ricette/fish/index',
  'ricette/menrui/index',
  'ricette/nimono/index',
  'ricette/riso/index',
  'ricette/sides/index',
  'ricette/tsukemono/index',
  'ricette/yakimono/index',
  'ricette/zuppe/index',
];

export const FEATURED_RECIPES = [
  'ricette/agemono/kara-age',
  'ricette/yakimono/gyoza',
  'ricette/preparazioni_di_base/brodi/dashi',
  'ricette/preparazioni_di_base/brodi/mentsuyu',
  'ricette/fish/teriyaki_salmon',
  'ricette/zuppe/misoshiru',
  'ricette/riso/gyudon',
  'ricette/menrui/yakisoba',
];

export const KEY_INGREDIENTS = [
  'ingredienti/rice',
  'ingredienti/miso',
  'ricette/preparazioni_di_base/brodi/dashi',
  'ingredienti/katsuobushi',
  'ingredienti/nori',
  'ingredienti/kombu',
  'ingredienti/sesamo',
  'ingredienti/shiitake',
];

Questa è la mia raccolta di **ricette giapponesi**, frutto di anni di studio su libri, confronti con maestri straordinari e prove infinite ai fornelli. Ogni piatto è stato testato, rifatto e perfezionato da me, con l'idea di rendere la **cucina giapponese** autentica semplice e accessibile a tutti. Dalle basi fondamentali come [dashi](/ricette/dashi/) e salse, fino ad agemono, menrui, nimono, tsukemono, yakimono e piatti di riso.

Qui trovi cucina casalinga e da izakaya, niente fusion e niente piatti da all you can eat. In più trovi guide su ingredienti e strumenti, le mie [fonti di ispirazione](/libri/) e una lista collaborativa di [negozi giapponesi in Italia](/negozi_orientali/), in continua evoluzione.

<div className="paypal-container">
  <div className="paypal-icon">☕</div>
  <div className="paypal-content">
    <h3>Offrimi un caffè</h3>
    <p>Se il sito ti è stato utile e ti va di supportarmi, puoi offrirmi un caffè — grazie! Il sito è e resterà gratuito. <strong>@amicojeko</strong></p>
  </div>
  <a
    className="paypal-cta"
    href="https://paypal.me/jeko23"
    target="_blank"
    rel="noopener noreferrer"
  >Supporta con PayPal →</a>
</div>

## 🔥 Ricette più cercate

<DocsByIdGrid ids={FEATURED_RECIPES} />

## 🍱 Le categorie

<DocsByIdGrid ids={CATEGORIES} />

## 🍅 Ingredienti chiave della cucina giapponese

<DocsByIdGrid ids={KEY_INGREDIENTS} />

## 🏪 Trova ingredienti vicino a te

Cucinare giapponese a casa parte dalla materia prima. Per riso giapponese, miso, mirin, alghe, salsa di soia di qualità e tutto il resto serve un buon **negozio asiatico**. Su [paginegiappe.it/negozi_orientali](/negozi_orientali/) tengo una lista collaborativa di **negozi giapponesi e asiatici in Italia**, regione per regione, con [mappa interattiva](/negozi_orientali/mappa/) e [shop online](/negozi_orientali/online/).

Regioni con più negozi: [Lombardia](/negozi_orientali/lombardia/) · [Lazio](/negozi_orientali/lazio/) · [Piemonte](/negozi_orientali/piemonte/) · [Emilia-Romagna](/negozi_orientali/emilia_romagna/) · [Veneto](/negozi_orientali/veneto/) · [tutte le regioni →](/negozi_orientali/)

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
