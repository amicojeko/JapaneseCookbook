/** Widget find_recipes: griglia di card ricetta. */
import { CARD_CSS, mount, RecipeCard, useToolOutput, type Recipe } from './_shared';

interface RecipesOutput {
  total?: number;
  returned?: number;
  servings?: number | null;
  results?: Recipe[];
}

function App() {
  const data = useToolOutput<RecipesOutput>();
  const results = data?.results ?? [];

  if (!results.length) {
    return <p class="pg-empty">Nessuna ricetta trovata su paginegiappe.it.</p>;
  }

  const total = data?.total ?? results.length;
  const eyebrow =
    total > results.length
      ? `${total} ricette · prime ${results.length}`
      : `${results.length} ricett${results.length === 1 ? 'a' : 'e'}`;

  return (
    <div>
      <p class="pg-eyebrow">
        paginegiappe.it · {eyebrow}
        {data?.servings ? ` · dosi per ${data.servings}` : ''}
      </p>
      <div class="pg-grid">
        {results.map((r) => (
          <RecipeCard r={r} />
        ))}
      </div>
    </div>
  );
}

mount(<App />, CARD_CSS);
