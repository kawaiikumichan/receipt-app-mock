import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { mockInventory } from '../data/mockData';
import type { InventoryItem, Recipe, MealRecord, ConsumptionRecord } from '../data/mockData';
import { getExpiryStatus } from '../utils/expiry';

interface InventoryContextType {
  inventory: InventoryItem[];
  consumptions: ConsumptionRecord[];
  mealRecords: MealRecord[];
  addItems: (items: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'expiryStatus' | 'opened' | 'openedAt'>[]) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  consumeManually: (id: string, quantity: number) => void;
  consumeOrWasteItem: (id: string, action: 'consumed' | 'wasted', quantityToConsume: number, wasteReason?: 'expired' | 'spoiled' | 'overpurchase' | 'other') => void;
  recordMealAndConsume: (recipe: Recipe, actualServings: number) => void;
  removeItem: (id: string) => void;
  getUrgentItems: () => InventoryItem[];
  getRescueItems: () => InventoryItem[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [consumptions, setConsumptions] = useState<ConsumptionRecord[]>([]);
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('receipt_app_inventory');
    if (saved) {
      try {
        setInventory(JSON.parse(saved));
      } catch (e) {
        setInventory(mockInventory);
      }
    } else {
      setInventory(mockInventory);
    }
    
    const savedC = localStorage.getItem('receipt_app_consumptions');
    if (savedC) setConsumptions(JSON.parse(savedC));
    
    const savedM = localStorage.getItem('receipt_app_mealrecords');
    if (savedM) setMealRecords(JSON.parse(savedM));

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('receipt_app_inventory', JSON.stringify(inventory));
      localStorage.setItem('receipt_app_consumptions', JSON.stringify(consumptions));
      localStorage.setItem('receipt_app_mealrecords', JSON.stringify(mealRecords));
    }
  }, [inventory, consumptions, mealRecords, isLoaded]);

  const computedInventory = useMemo(() => {
    return inventory.map(item => ({
      ...item,
      expiryStatus: getExpiryStatus(item.actualExpiryDate || item.estimatedExpiryDate)
    }));
  }, [inventory]);

  const addItems = (newItems: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'expiryStatus' | 'opened' | 'openedAt'>[]) => {
    const now = new Date().toISOString();
    const itemsWithIds: InventoryItem[] = newItems.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      opened: false,
      openedAt: null
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

  const consumeManually = (id: string, quantityToConsume: number) => {
    consumeOrWasteItem(id, 'consumed', quantityToConsume);
  };

  const consumeOrWasteItem = (id: string, action: 'consumed' | 'wasted', quantityToConsume: number, wasteReason?: 'expired' | 'spoiled' | 'overpurchase' | 'other') => {
    let consumedItem: InventoryItem | undefined;
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        consumedItem = { ...item };
        const newQuantity = Math.max(0, item.quantity - quantityToConsume);
        return { ...item, quantity: newQuantity, updatedAt: new Date().toISOString() };
      }
      return item;
    }).filter(item => item.quantity > 0));
    
    if (consumedItem) {
      setConsumptions(prev => [...prev, {
        id: crypto.randomUUID(),
        inventoryItemId: id,
        ingredientKey: consumedItem!.ingredientKey || consumedItem!.name,
        name: consumedItem!.name,
        quantity: quantityToConsume,
        unit: consumedItem!.unit,
        action,
        source: 'manual',
        wasteReason,
        createdAt: new Date().toISOString()
      }]);
    }
  };

  const recordMealAndConsume = (recipe: Recipe, actualServings: number) => {
    const now = new Date().toISOString();
    const mealRecordId = crypto.randomUUID();
    
    const newMeal: MealRecord = {
      id: mealRecordId,
      recipeId: recipe.id,
      actualServings,
      cookedAt: now
    };
    setMealRecords(prev => [...prev, newMeal]);

    const ratio = actualServings / recipe.baseServings;
    const newConsumptions: ConsumptionRecord[] = [];

    setInventory(prev => {
      let nextInventory = [...prev];

      recipe.availableIngredients.forEach(ri => {
        const requiredQuantity = ri.quantity * ratio;
        
        // Match candidates
        const candidates = nextInventory.filter(item => item.quantity > 0 && (
          (item.ingredientKey && item.ingredientKey === ri.ingredientKey) ||
          (item.name.includes(ri.ingredientKey || ri.name)) ||
          (item.category === ri.category)
        ));

        // Sort candidates
        candidates.sort((a, b) => {
          const aKeyMatch = a.ingredientKey === ri.ingredientKey;
          const bKeyMatch = b.ingredientKey === ri.ingredientKey;
          if (aKeyMatch && !bKeyMatch) return -1;
          if (!aKeyMatch && bKeyMatch) return 1;

          const dateA = a.actualExpiryDate || a.estimatedExpiryDate || '9999-12-31';
          const dateB = b.actualExpiryDate || b.estimatedExpiryDate || '9999-12-31';
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });

        if (candidates.length > 0) {
          const target = candidates[0];
          const actualConsumed = Math.min(target.quantity, requiredQuantity);
          
          nextInventory = nextInventory.map(item => 
            item.id === target.id ? { ...item, quantity: item.quantity - actualConsumed } : item
          ).filter(item => item.quantity > 0);

          newConsumptions.push({
            id: crypto.randomUUID(),
            inventoryItemId: target.id,
            ingredientKey: target.ingredientKey || target.name,
            name: target.name,
            quantity: actualConsumed,
            unit: target.unit,
            action: 'consumed',
            source: 'recipe',
            createdAt: now
          });
        }
      });

      return nextInventory;
    });

    setConsumptions(prev => [...prev, ...newConsumptions]);
  };

  const removeItem = (id: string) => {
    // Treat removal as manual waste unless specified otherwise
    const target = inventory.find(i => i.id === id);
    if (target) {
      consumeOrWasteItem(id, 'wasted', target.quantity, 'other');
    } else {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const getUrgentItems = () => {
    return computedInventory.filter(item => 
      item.expiryStatus === 'urgent' || item.expiryStatus === 'warning' || item.expiryStatus === 'expired'
    );
  };

  const getRescueItems = () => {
    // Determine frequently wasted items (e.g. more than 1 waste in history)
    const wasteCounts: Record<string, number> = {};
    consumptions.filter(c => c.action === 'wasted').forEach(c => {
      wasteCounts[c.ingredientKey] = (wasteCounts[c.ingredientKey] || 0) + 1;
    });
    
    // Return items currently in inventory that match these high-waste keys
    return computedInventory.filter(item => {
      const key = item.ingredientKey || item.name;
      return (wasteCounts[key] || 0) >= 1;
    });
  };

  if (!isLoaded) return null; // Avoid hydration mismatch or empty flashes

  return (
    <InventoryContext.Provider value={{ 
      inventory: computedInventory, 
      consumptions,
      mealRecords,
      addItems, 
      updateItem, 
      consumeManually,
      consumeOrWasteItem, 
      recordMealAndConsume,
      removeItem,
      getUrgentItems,
      getRescueItems
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
