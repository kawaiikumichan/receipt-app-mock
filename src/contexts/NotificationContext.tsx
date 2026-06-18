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
  const { inventory } = useInventory();

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

  // Auto-generate expiry notifications
  useEffect(() => {
    if (!isLoaded || inventory.length === 0) return;

    setNotifications(prev => {
      let changed = false;
      const next = [...prev];

      inventory.forEach(item => {
        if (!item.expiryStatus || item.expiryStatus === 'safe') return;
        
        // Ensure we only notify once per expiry status for a specific item
        // Check for active or resolved notifications to prevent spamming
        const existingSameStatus = next.find(n => n.relatedItemId === item.id && n.type === 'expiry' && n.severity === item.expiryStatus);
        if (existingSameStatus) return; // already notified for this specific severity state

        let message = '';
        let title = '';
        if (item.expiryStatus === 'expired') {
          title = '期限目安越えのお知らせ';
          message = `${item.name}の期限目安を過ぎています。状態を確認の上、早めのご利用をおすすめします。`;
        } else if (item.expiryStatus === 'urgent') {
          title = 'お早めにどうぞ';
          message = `${item.name}の期限目安が明日までです。お早めのご利用をおすすめします。`;
        } else if (item.expiryStatus === 'warning') {
          title = '期限目安が近づいています';
          message = `${item.name}の期限目安が近づいています（残り3日以内）。`;
        }

        // Expiry notifications expire in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        changed = true;
        next.push({
          id: crypto.randomUUID(),
          type: 'expiry',
          severity: item.expiryStatus,
          status: 'active',
          read: false,
          title,
          message,
          relatedType: 'inventory',
          relatedItemId: item.id,
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
        });
      });

      return changed ? next : prev;
    });
  }, [inventory, isLoaded]);

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
