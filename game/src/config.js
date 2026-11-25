// Warung Nasi Goreng — configuration: canvas layout, ingredients, recipes, timings.
// Every number the game uses lives here, so tuning never touches the rules.
export const CANVAS = { width: 960, height: 640 };

export const ROUND_SECONDS = 120;
export const MAX_HEARTS = 3;
export const MAX_CUSTOMERS = 3;
export const MAX_PLATES = 2;
export const MAX_WOK_ITEMS = 4;
export const COMBO_WINDOW_SECONDS = 8;

export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', color: '#f5f0dc', dark: '#cbbf9a', hint: 'nasi putih' },
  { id: 'telur', name: 'Telur', key: '2', color: '#ffd94d', dark: '#e0a800', hint: 'telur ayam' },
  { id: 'ayam', name: 'Ayam', key: '3', color: '#c47a3a', dark: '#8a4f1d', hint: 'ayam goreng' },
  { id: 'mie', name: 'Mie', key: '4', color: '#f2c14e', dark: '#c9930a', hint: 'mie kuning' },
  { id: 'sayur', name: 'Sayur', key: '5', color: '#58b368', dark: '#2e7d32', hint: 'sayur hijau' },
  { id: 'kecap', name: 'Kecap', key: '6', color: '#5b3a29', dark: '#3a2418', hint: 'kecap manis' },
];

export const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['nasi', 'telur', 'kecap'], points: 20, cookSeconds: 4 },
  { id: 'mie-goreng', name: 'Mie Goreng', needs: ['mie', 'telur', 'sayur'], points: 20, cookSeconds: 4 },
  { id: 'nasi-ayam', name: 'Nasi Ayam', needs: ['nasi', 'ayam', 'kecap'], points: 25, cookSeconds: 5 },
  { id: 'mie-ayam', name: 'Mie Ayam', needs: ['mie', 'ayam', 'kecap'], points: 25, cookSeconds: 5 },
  { id: 'spesial', name: 'Spesial Warung', needs: ['nasi', 'telur', 'ayam', 'kecap'], points: 30, cookSeconds: 5 },
];

export const CAMPUR = { id: 'campur', name: 'Masakan Campur', points: 5, cookSeconds: 3 };

// Layout (canvas 960x640). All hit areas derive from these rects.
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 960, h: 56 },
  orderBoard: { x: 16, y: 64, w: 544, h: 92 },
  menuBoard: { x: 576, y: 64, w: 368, h: 92 },
  customers: { y: 168, h: 96, centres: [140, 330, 520] },
  counter: { x: 16, y: 276, w: 928, h: 132 },
  wok: { x: 330, y: 428, w: 300, h: 108 },
  plates: { x: 656, y: 428, w: 288, h: 108, slots: [{ x: 690, y: 466 }, { x: 830, y: 466 }] },
  chefLane: { y: 556, h: 56 },
  hint: { x: 0, y: 616, w: 960, h: 24 },
};

// Ingredient station rects, laid out across the counter in INGREDIENTS order.
export const STATION_WIDTH = 148;
export const STATION_GAP = 6;
export function stationRect(index) {
  const x = LAYOUT.counter.x + 6 + index * (STATION_WIDTH + STATION_GAP);
  return { x, y: LAYOUT.counter.y + 8, w: STATION_WIDTH, h: LAYOUT.counter.h - 16 };
}

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) || null;
}

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id) || null;
}

/** The recipe whose ingredient set exactly matches `ids` (order-free), or null. */
export function matchRecipe(ids) {
  const sorted = [...ids].sort().join(',');
  for (const recipe of RECIPES) {
    if ([...recipe.needs].sort().join(',') === sorted) return recipe;
  }
  return null;
}
