/** Widget suggest_menu: portate come card + lista spesa consolidata + ordine di preparazione. */
import { CARD_CSS, mount, RecipeCard, useToolOutput, type Recipe } from './_shared';

interface MenuOutput {
  occasion?: string;
  servings?: number;
  courses?: Recipe[];
  note?: string | null;
}

const MENU_CSS = `
.pg-menu__head { margin-bottom: 12px; }
.pg-menu__title { font-size: 22px; }
.pg-shop { margin-top: 20px; background: var(--pg-paper-2); border: 1px solid var(--pg-rule-soft); border-radius: 12px; padding: 14px 16px; }
.pg-shop h3, .pg-prep h3 { font-size: 16px; margin-bottom: 8px; }
.pg-shop ul { columns: 2; column-gap: 24px; margin: 0; padding-left: 18px; font-size: 13.5px; color: var(--pg-ink-soft); }
.pg-shop li { break-inside: avoid; margin-bottom: 3px; }
.pg-prep { margin-top: 16px; }
.pg-prep p { font-size: 13.5px; color: var(--pg-ink-soft); white-space: pre-wrap; margin: 0; }
@media (max-width: 460px) { .pg-shop ul { columns: 1; } }
`;

const roleLabel = (role?: string | null) =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : null;

/** Lista spesa consolidata: unione deduplicata degli ingredienti di tutte le portate. */
function shoppingList(courses: Recipe[]): string[] {
  const seen = new Map<string, string>();
  for (const c of courses) {
    for (const ing of c.ingredients ?? []) {
      const key = ing.trim().toLowerCase().replace(/\s+/g, ' ');
      if (key && !seen.has(key)) seen.set(key, ing.trim());
    }
  }
  return [...seen.values()];
}

function App() {
  const data = useToolOutput<MenuOutput>();
  const courses = data?.courses ?? [];

  if (!courses.length) {
    return <p class="pg-empty">Non sono riuscito a comporre un menu.</p>;
  }

  const servings = data?.servings ?? 2;
  const occasion = data?.occasion ?? 'cena';
  const list = shoppingList(courses);

  return (
    <div>
      <div class="pg-menu__head">
        <p class="pg-eyebrow">paginegiappe.it · menu</p>
        <h1 class="pg-menu__title">
          Menu {occasion} per {servings} {servings === 1 ? 'persona' : 'persone'}
        </h1>
      </div>

      <div class="pg-grid">
        {courses.map((c) => (
          <RecipeCard r={c} badge={roleLabel(c.role)} />
        ))}
      </div>

      {list.length ? (
        <section class="pg-shop">
          <h3>🛒 Lista della spesa ({list.length})</h3>
          <ul>
            {list.map((i) => (
              <li>{i}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {data?.note ? (
        <section class="pg-prep">
          <h3>👨‍🍳 Ordine di preparazione</h3>
          <p>{data.note}</p>
        </section>
      ) : null}
    </div>
  );
}

mount(<App />, CARD_CSS + MENU_CSS);
