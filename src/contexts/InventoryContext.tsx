import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { mockInventory } from '../data/mockData';
import type { InventoryItem } from '../data/mockData';
import { getExpiryStatus } from '../utils/expiry';

interface InventoryContextType {
  inventory: InventoryItem[];
  addItems: (items: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'expiryStatus'>[]) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  consumeItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  getUrgentItems: () => InventoryItem[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY = 'receipt_app_inventory';

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage or use mock data on first load
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setInventory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse inventory from localStorage', e);
        setInventory(mockInventory);
      }
    } else {
      setInventory(mockInventory);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    }
  }, [inventory, isLoaded]);

  const computedInventory = useMemo(() => {
    return inventory.map(item => ({
      ...item,
      expiryStatus: getExpiryStatus(item.actualExpiryDate || item.estimatedExpiryDate)
    }));
  }, [inventory]);

  const addItems = (newItems: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'expiryStatus'>[]) => {
    const now = new Date().toISOString();
    const itemsWithIds: InventoryItem[] = newItems.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }));
    setInventory(prev => [...prev, ...itemsWithIds]);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date().toISOString() } 
        : item
    ));
  };

  const consumeItem = (id: string, quantityToConsume: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity - quantityToConsume);
        return { ...item, quantity: newQuantity, updatedAt: new Date().toISOString() };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const getUrgentItems = () => {
    return computedInventory.filter(item => 
      item.expiryStatus === 'urgent' || item.expiryStatus === 'warning' || item.expiryStatus === 'expired'
    );
  };

  if (!isLoaded) return null; // Avoid hydration mismatch or empty flashes

  return (
    <InventoryContext.Provider value={{ 
      inventory: computedInventory, 
      addItems, 
      updateItem, 
      consumeItem, 
      removeItem,
      getUrgentItems
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
