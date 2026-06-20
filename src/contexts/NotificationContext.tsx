import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useInventory } from './InventoryContext';

export interface AppNotification {
  id: string;
  type: 'expiry' | 'shopping' | 'recipe' | 'inventory' | 'system';
  severity: 'safe' | 'warning' | 'urgent' | 'expired';
  status: 'active' | 'resolved' | 'archived';
  read: boolean;
  title: string;
  message: string;
  relatedType?: 'inventory' | 'shopping' | 'recipe';
  relatedItemId?: string;
  createdAt: string;
  expiresAt?: string;
  resolvedAt?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'status'>) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'receipt_app_notifications';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { inventory, consumptions } = useInventory();

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications, isLoaded]);

  // Auto-resolve expiry notifications when inventory item is safe or gone
  // Auto-archive expired notifications
  useEffect(() => {
    if (!isLoaded) return;

    setNotifications(prev => {
      let changed = false;
      const nowTime = Date.now();
      const nowIso = new Date().toISOString();

      const next = prev.map(n => {
        let updated = { ...n };

        // 1. Auto-archive
        if (updated.status !== 'archived' && updated.expiresAt) {
          if (nowTime > new Date(updated.expiresAt).getTime()) {
            updated.status = 'archived';
            changed = true;
          }
        }

        // 2. Auto-resolve expiry
        if (updated.status === 'active' && updated.type === 'expiry' && updated.relatedItemId) {
          const currentItem = inventory.find(i => i.id === updated.relatedItemId);
          // If item is deleted OR item is no longer in a warning/urgent/expired state
          if (!currentItem || !currentItem.expiryStatus || currentItem.expiryStatus === 'safe') {
            updated.status = 'resolved';
            updated.resolvedAt = nowIso;
            changed = true;
          }
        }

        return updated;
      });

      return changed ? next : prev;
    });
  }, [inventory, isLoaded]);

  // Daily Digest Notification
  useEffect(() => {
    if (!isLoaded || inventory.length === 0) return;

    setNotifications(prev => {
      const today = new Date().toLocaleDateString('ja-JP'); // e.g. "2026/6/20"
      
      // Check if we already generated a digest today
      const alreadyGeneratedToday = prev.some(n => 
        n.type === 'system' && 
        n.title === `本日のお知らせ (${today})`
      );

      if (alreadyGeneratedToday) return prev;

      // Calculate stockout predictions
      const itemDays: Record<string, number[]> = {};
      consumptions.filter(c => c.action === 'consumed' && c.inventoryItemId).forEach(c => {
        const invItem = inventory.find(i => i.id === c.inventoryItemId);
        if (invItem) {
          const days = (new Date(c.createdAt).getTime() - new Date(invItem.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          if (days > 0) {
            if (!itemDays[c.ingredientKey]) itemDays[c.ingredientKey] = [];
            itemDays[c.ingredientKey].push(days);
          }
        }
      });

      const avgDaysDict: Record<string, number> = {};
      for (const [key, daysArray] of Object.entries(itemDays)) {
        if (daysArray.length >= 1) {
          avgDaysDict[key] = daysArray.reduce((a, b) => a + b, 0) / daysArray.length;
        }
      }

      let expiredCount = 0;
      let urgentCount = 0;
      let warningCount = 0;
      let stockoutCount = 0;

      const nowTime = Date.now();

      inventory.forEach(item => {
        if (item.expiryStatus === 'expired') expiredCount++;
        else if (item.expiryStatus === 'urgent') urgentCount++;
        else if (item.expiryStatus === 'warning') warningCount++;

        const key = item.ingredientKey || item.name;
        const avgDays = avgDaysDict[key];
        if (avgDays) {
          const daysSinceAdded = (nowTime - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceAdded >= avgDays * 0.8) {
            stockoutCount++;
          }
        }
      });

      if (expiredCount === 0 && urgentCount === 0 && warningCount === 0 && stockoutCount === 0) {
        return prev;
      }

      const lines = [];
      if (expiredCount > 0) lines.push(`・期限目安越え: ${expiredCount}件`);
      if (urgentCount > 0) lines.push(`・期限間近 (明日まで): ${urgentCount}件`);
      if (warningCount > 0) lines.push(`・期限注意 (3日以内): ${warningCount}件`);
      if (stockoutCount > 0) lines.push(`・在庫切れ予測: ${stockoutCount}件`);

      const next = [...prev];
      next.push({
        id: crypto.randomUUID(),
        type: 'system',
        severity: expiredCount > 0 ? 'expired' : urgentCount > 0 ? 'urgent' : warningCount > 0 ? 'warning' : 'safe',
        status: 'active',
        read: false,
        title: `本日のお知らせ (${today})`,
        message: `在庫の確認をお願いします！\n${lines.join('\n')}`,
        relatedType: 'inventory',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expires in 1 day
      });

      return next;
    });
  }, [inventory, consumptions, isLoaded]);

  const addNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'status'>) => {
    setNotifications(prev => [
      {
        ...notification,
        id: crypto.randomUUID(),
        status: 'active',
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev
    ]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => n.status === 'active' && !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, markAllAsRead, addNotification, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
