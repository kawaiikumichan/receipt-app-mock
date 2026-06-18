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
  opened: boolean;
  openedAt: string | null;
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
  wasteReductionScore: number;
  inventoryUsageScore: number;
  shoppingNeedScore: number;
  reason: string;
  baseServings: number;
  availableIngredients: RecipeIngredient[];
  missingIngredients: RecipeIngredient[];
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

export type ShoppingListPriority = 'high' | 'normal' | 'low';
export type ShoppingListSource = 'recipe' | 'forecast' | 'manual';
export type ShoppingListStatus = 'pending' | 'purchased' | 'receipt_pending' | 'completed';

export interface ShoppingListItem {
  id: string;
  name: string;
  ingredientKey: string;
  quantity: number;
  unit: string;
  priority: ShoppingListPriority;
  source: ShoppingListSource;
  status: ShoppingListStatus;
  createdAt: string;
}

export interface ConsumptionRecord {
  id: string;
  inventoryItemId?: string;
  ingredientKey: string;
  name: string;
  quantity: number;
  unit: string;
  action: 'consumed' | 'wasted';
  source: 'recipe' | 'manual';
  wasteReason?: 'expired' | 'spoiled' | 'overpurchase' | 'other';
  createdAt: string;
}

export const mockInventory: InventoryItem[] = [
  { 
    id: '1', name: '豚バラ肉', ingredientKey: '豚肉', category: 'meat', quantity: 300, unit: 'g', price: 580,
    purchaseDate: '2026-06-15', estimatedExpiryDate: '2026-06-20', actualExpiryDate: '', storageType: 'refrigerated',
    createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z',
    opened: false, openedAt: null
  },
  { 
    id: '2', name: 'キャベツ', ingredientKey: 'キャベツ', category: 'vegetable', quantity: 0.5, unit: '玉', price: 150,
    purchaseDate: '2026-06-15', estimatedExpiryDate: '2026-06-25', actualExpiryDate: '', storageType: 'refrigerated',
    createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z',
    opened: false, openedAt: null
  },
  { 
    id: '3', name: '卵', ingredientKey: '卵', category: 'dairy', quantity: 6, unit: '個', price: 220,
    purchaseDate: '2026-06-14', estimatedExpiryDate: '2026-06-28', actualExpiryDate: '', storageType: 'refrigerated',
    createdAt: '2026-06-14T15:30:00Z', updatedAt: '2026-06-14T15:30:00Z',
    opened: false, openedAt: null
  },
  { 
    id: '4', name: '牛乳', ingredientKey: '牛乳', category: 'dairy', quantity: 1, unit: '本', price: 198,
    purchaseDate: '2026-06-12', estimatedExpiryDate: '2026-06-19', actualExpiryDate: '', storageType: 'refrigerated',
    createdAt: '2026-06-12T18:45:00Z', updatedAt: '2026-06-12T18:45:00Z',
    opened: false, openedAt: null
  },
  { 
    id: '5', name: '玉ねぎ', ingredientKey: '玉ねぎ', category: 'vegetable', quantity: 3, unit: '個', price: 100,
    purchaseDate: '2026-06-10', estimatedExpiryDate: '2026-07-10', actualExpiryDate: '', storageType: 'room',
    createdAt: '2026-06-10T12:00:00Z', updatedAt: '2026-06-10T12:00:00Z',
    opened: false, openedAt: null
  },
  { 
    id: '6', name: 'トイレットペーパー', ingredientKey: 'トイレットペーパー', category: 'daily', quantity: 4, unit: 'ロール', price: 400,
    purchaseDate: '2026-06-01', estimatedExpiryDate: '', actualExpiryDate: '', storageType: 'room',
    createdAt: '2026-06-01T09:15:00Z', updatedAt: '2026-06-01T09:15:00Z',
    opened: false, openedAt: null
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
    wasteReductionScore: 90,
    inventoryUsageScore: 100,
    shoppingNeedScore: 0,
    reason: '賞味期限が近い豚肉とキャベツを優先的に消費できます。',
    baseServings: 2,
    availableIngredients: [
      { ingredientKey: '豚肉', name: '豚肉（薄切り）', quantity: 150, unit: 'g', category: 'meat' },
      { ingredientKey: 'キャベツ', name: 'キャベツ', quantity: 0.25, unit: '玉', category: 'vegetable' }
    ],
    missingIngredients: []
  },
  {
    id: 'r2',
    name: '親子丼',
    title: '親子丼',
    image: 'https://images.unsplash.com/photo-1614548483832-6899b1a5105d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    time: 20,
    matchScore: 80,
    wasteReductionScore: 70,
    inventoryUsageScore: 80,
    shoppingNeedScore: 20,
    reason: '在庫の卵と玉ねぎを使えます。鶏肉のみ買い足しが必要です。',
    baseServings: 2,
    availableIngredients: [
      { ingredientKey: '卵', name: '卵', quantity: 4, unit: '個', category: 'dairy' },
      { ingredientKey: '玉ねぎ', name: '玉ねぎ', quantity: 0.5, unit: '個', category: 'vegetable' }
    ],
    missingIngredients: [
      { ingredientKey: '鶏肉', name: '鶏肉', quantity: 150, unit: 'g', category: 'meat' }
    ]
  }
];
