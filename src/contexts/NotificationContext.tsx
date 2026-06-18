import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useInventory } from './InventoryContext';

export interface AppNotification {
  id: string;
  type: 'expiry' | 'shopping' | 'menu';
  severity: 'safe' | 'warning' | 'urgent' | 'expired';
  itemId?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
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

  // Auto-generate expiry notifications
  useEffect(() => {
    if (!isLoaded || inventory.length === 0) return;

    setNotifications(prev => {
      let changed = false;
      const next = [...prev];

      inventory.forEach(item => {
        if (!item.expiryStatus || item.expiryStatus === 'safe') return;
        
        // Ensure only one unread expiry notification per item exists
        const existingUnread = next.find(n => n.itemId === item.id && n.type === 'expiry' && !n.read);
        if (existingUnread) return; // already notified

        let message = '';
        if (item.expiryStatus === 'expired') {
          message = `${item.name}の賞味期限が切れています！`;
        } else if (item.expiryStatus === 'urgent') {
          message = `${item.name}の賞味期限が明日までです。`;
        } else if (item.expiryStatus === 'warning') {
          message = `${item.name}の賞味期限が近づいています（残り3日以内）。`;
        }

        changed = true;
        next.push({
          id: crypto.randomUUID(),
          type: 'expiry',
          severity: item.expiryStatus,
          itemId: item.id,
          message,
          createdAt: new Date().toISOString(),
          read: false,
        });
      });

      return changed ? next : prev;
    });
  }, [inventory, isLoaded]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
