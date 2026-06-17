export type Category = 'meat' | 'vegetable' | 'dairy' | 'pantry' | 'daily';

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  expiryDate?: string;
  addedAt: string;
}

export const mockInventory: InventoryItem[] = [
  { id: '1', name: '豚バラ肉', category: 'meat', quantity: 300, unit: 'g', expiryDate: '2026-06-20', addedAt: '2026-06-15' },
  { id: '2', name: 'キャベツ', category: 'vegetable', quantity: 0.5, unit: '玉', expiryDate: '2026-06-25', addedAt: '2026-06-15' },
  { id: '3', name: '卵', category: 'dairy', quantity: 6, unit: '個', expiryDate: '2026-06-28', addedAt: '2026-06-14' },
  { id: '4', name: '牛乳', category: 'dairy', quantity: 1, unit: '本', expiryDate: '2026-06-19', addedAt: '2026-06-12' },
  { id: '5', name: '玉ねぎ', category: 'vegetable', quantity: 3, unit: '個', addedAt: '2026-06-10' },
  { id: '6', name: 'トイレットペーパー', category: 'daily', quantity: 4, unit: 'ロール', addedAt: '2026-06-01' },
];

export interface Recipe {
  id: string;
  title: string;
  image: string;
  time: number;
  matchScore: number;
  missingIngredients: string[];
  usedIngredients: string[];
}

export const mockRecipes: Recipe[] = [
  {
    id: 'r1',
    title: '豚バラとキャベツの塩炒め',
    image: 'https://images.unsplash.com/photo-1544378730-1b510107297e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    time: 15,
    matchScore: 100,
    missingIngredients: [],
    usedIngredients: ['豚バラ肉', 'キャベツ']
  },
  {
    id: 'r2',
    title: '親子丼',
    image: 'https://images.unsplash.com/photo-1614548483832-6899b1a5105d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    time: 20,
    matchScore: 80,
    missingIngredients: ['鶏肉'],
    usedIngredients: ['卵', '玉ねぎ']
  }
];
