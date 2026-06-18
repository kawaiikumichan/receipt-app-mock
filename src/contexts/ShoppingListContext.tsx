import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { type ShoppingListItem, type ShoppingListStatus } from '../data/mockData';

interface ShoppingListContextType {
  items: ShoppingListItem[];
  addItems: (newItems: Omit<ShoppingListItem, 'id' | 'createdAt' | 'status'>[]) => void;
  updateItemStatus: (id: string, status: ShoppingListStatus) => void;
  removeItem: (id: string) => void;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

const STORAGE_KEY = 'receipt_app_shopping_list';

export const ShoppingListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse shopping list', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItems = (newItems: Omit<ShoppingListItem, 'id' | 'createdAt' | 'status'>[]) => {
    const now = new Date().toISOString();
    
    setItems(prev => {
      const next = [...prev];
      
      newItems.forEach(newItem => {
        // Try to find existing pending item with same ingredientKey
        const existingIndex = next.findIndex(item => item.ingredientKey === newItem.ingredientKey && item.status === 'pending');
        
        if (existingIndex >= 0) {
          // Merge quantities
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + newItem.quantity,
            // Upgrade priority to high if new item is high
            priority: (next[existingIndex].priority === 'high' || newItem.priority === 'high') ? 'high' : next[existingIndex].priority,
          };
        } else {
          // Add new
          next.push({
            ...newItem,
            id: crypto.randomUUID(),
            status: 'pending',
            createdAt: now,
          });
        }
      });
      
      return next;
    });
  };

  const updateItemStatus = (id: string, status: ShoppingListStatus) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <ShoppingListContext.Provider value={{ items, addItems, updateItemStatus, removeItem }}>
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (context === undefined) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
};
