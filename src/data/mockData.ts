export type Category = 
  | 'meat' 
  | 'fish' 
  | 'vegetable' 
  | 'fruit' 
  | 'dairy' 
  | 'frozen' 
  | 'drink' 
  | 'pantry' 
  | 'seasoning' 
  | 'daily' 
  | 'other';

export interface ParsedItem {
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  price: number;
  expiry_date_estimate: string;
  ingredientKey?: string;
}

export interface ParsedReceipt {
  store_name: string;
  purchase_date: string;
  items: ParsedItem[];
}

export type StorageType = 'refrigerated' | 'frozen' | 'room';
export type ExpiryStatus = 'expired' | 'urgent' | 'warning' | 'safe';

export interface InventoryItem {
  id: string;
  name: string;
  ingredientKey?: string;
  category: Category;
  quantity: number;
  unit: string;
  purchaseDate: string;
  estimatedExpiryDate: string;
  actualExpiryDate: string;
  storageType: StorageType;
  price: number;
  createdAt: string;
  updatedAt: string;
  expiryStatus?: ExpiryStatus;
}

export interface RecipeIngredient {
  ingredientKey: string;
  name: string;
  quantity: number;
  unit: string;
  category?: Category;
}

export interface Recipe {
  id: string;
  name: string;
  title: string;
  image: string;
  time: number;
  matchScore: number;
  baseServings: number;
  ingredients: RecipeIngredient[];
}

export interface MealRecord {
  id: string;
  recipeId: string;
  actualServings: number;
  cookedAt: string;
}

export interface InventoryConsumption {
  id: string;
  inventoryItemId: string;
  quantity: number;
  unit: string;
  source: 'recipe' | 'manual';
  recipeId?: string;
  mealRecordId?: string;
  createdAt: string;
}

export const mockInventory: InventoryItem[] = [
  { 
    id: '1', name: '豚バラ肉', ingredientKey: '豚肉', category: 'meat', quantity: 300, unit: 'g', price: 580,
    purchaseDate: '2026-06-15', estimatedExpiryDate: '2026-06-20', actualExpiryDate: '', storageType: 'refrigerated',
    createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z'
  },
  { 
    id: '2', name: 'キャベツ', ingredientKey: 'キャベツ', category: 'vegetable', quantity: 0.5, unit: '玉', price: 150,
    purchaseDate: '2026-06-15', estimatedExpiryDate: '2026-06-25', actualExpiryDate: '', storageType: 'refrigerated',
    createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z'
  },
  { 
    id: '3', name: '卵', ingredientKey: '卵', category: 'dairy', quantity: 6, unit: '個', price: 220,
    purchaseDate: '2026-06-14', estimatedExpiryDate: '2026-06-28', actualExpiryDate: '', storageType: 'refrigerated',
    createdAt: '2026-06-14T15:30:00Z', updatedAt: '2026-06-14T15:30:00Z'
  },
  { 
    id: '4', name: '牛乳', ingredientKey: '牛乳', category: 'dairy', quantity: 1, unit: '本', price: 198,
    purchaseDate: '2026-06-12', estimatedExpiryDate: '2026-06-19', actualExpiryDate: '', storageType: 'refrigerated',
    createdAt: '2026-06-12T18:45:00Z', updatedAt: '2026-06-12T18:45:00Z'
  },
  { 
    id: '5', name: '玉ねぎ', ingredientKey: '玉ねぎ', category: 'vegetable', quantity: 3, unit: '個', price: 100,
    purchaseDate: '2026-06-10', estimatedExpiryDate: '2026-07-10', actualExpiryDate: '', storageType: 'room',
    createdAt: '2026-06-10T12:00:00Z', updatedAt: '2026-06-10T12:00:00Z'
  },
  { 
    id: '6', name: 'トイレットペーパー', ingredientKey: 'トイレットペーパー', category: 'daily', quantity: 4, unit: 'ロール', price: 400,
    purchaseDate: '2026-06-01', estimatedExpiryDate: '', actualExpiryDate: '', storageType: 'room',
    createdAt: '2026-06-01T09:15:00Z', updatedAt: '2026-06-01T09:15:00Z'
  }
];

export const mockRecipes: Recipe[] = [
  {
    id: 'r1',
    name: '豚バラとキャベツの塩炒め',
    title: '豚バラとキャベツの塩炒め',
    image: 'https://images.unsplash.com/photo-1544378730-1b510107297e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    time: 15,
    matchScore: 100,
    baseServings: 2,
    ingredients: [
      { ingredientKey: '豚肉', name: '豚肉（薄切り）', quantity: 150, unit: 'g', category: 'meat' },
      { ingredientKey: 'キャベツ', name: 'キャベツ', quantity: 0.25, unit: '玉', category: 'vegetable' }
    ]
  },
  {
    id: 'r2',
    name: '親子丼',
    title: '親子丼',
    image: 'https://images.unsplash.com/photo-1614548483832-6899b1a5105d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    time: 20,
    matchScore: 80,
    baseServings: 2,
    ingredients: [
      { ingredientKey: '卵', name: '卵', quantity: 4, unit: '個', category: 'dairy' },
      { ingredientKey: '玉ねぎ', name: '玉ねぎ', quantity: 0.5, unit: '個', category: 'vegetable' },
      { ingredientKey: '鶏肉', name: '鶏肉', quantity: 150, unit: 'g', category: 'meat' }
    ]
  }
];
