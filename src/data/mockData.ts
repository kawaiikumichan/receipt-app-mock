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

export const mockInventory: InventoryItem[] = [
  { 
    id: '1', name: '豚バラ肉', category: 'meat', quantity: 300, unit: 'g', price: 580,
    purchaseDate: '2026-06-15', estimatedExpiryDate: '2026-06-20', actualExpiryDate: '',
    storageType: 'refrigerated', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z'
  },
  { 
    id: '2', name: 'キャベツ', category: 'vegetable', quantity: 0.5, unit: '玉', price: 150,
    purchaseDate: '2026-06-15', estimatedExpiryDate: '2026-06-25', actualExpiryDate: '',
    storageType: 'refrigerated', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-15T10:00:00Z'
  },
  { 
    id: '3', name: '卵', category: 'dairy', quantity: 6, unit: '個', price: 220,
    purchaseDate: '2026-06-14', estimatedExpiryDate: '2026-06-28', actualExpiryDate: '',
    storageType: 'refrigerated', createdAt: '2026-06-14T15:30:00Z', updatedAt: '2026-06-14T15:30:00Z'
  },
  { 
    id: '4', name: '牛乳', category: 'dairy', quantity: 1, unit: '本', price: 198,
    purchaseDate: '2026-06-12', estimatedExpiryDate: '2026-06-19', actualExpiryDate: '',
    storageType: 'refrigerated', createdAt: '2026-06-12T18:45:00Z', updatedAt: '2026-06-12T18:45:00Z'
  },
  { 
    id: '5', name: '玉ねぎ', category: 'vegetable', quantity: 3, unit: '個', price: 100,
    purchaseDate: '2026-06-10', estimatedExpiryDate: '2026-07-10', actualExpiryDate: '',
    storageType: 'room', createdAt: '2026-06-10T12:00:00Z', updatedAt: '2026-06-10T12:00:00Z'
  },
  { 
    id: '6', name: 'トイレットペーパー', category: 'daily', quantity: 4, unit: 'ロール', price: 400,
    purchaseDate: '2026-06-01', estimatedExpiryDate: '', actualExpiryDate: '',
    storageType: 'room', createdAt: '2026-06-01T09:15:00Z', updatedAt: '2026-06-01T09:15:00Z'
  },
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
