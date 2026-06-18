import React, { useState } from 'react';
import { AlertCircle, Clock, Bell, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useShoppingList } from '../contexts/ShoppingListContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { inventory, getUrgentItems } = useInventory();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const urgentItems = getUrgentItems();

  const expiredCount = inventory.filter(i => i.expiryStatus === 'expired').length;
  const warningCount = inventory.filter(i => i.expiryStatus === 'urgent' || i.expiryStatus === 'warning').length;
  const totalCount = inventory.length;

  const { items: shoppingItems } = useShoppingList();
  const pendingShoppingCount = shoppingItems.filter(i => i.status === 'pending').length;

  return (
    <div className="p-4 space-y-6 relative h-full">
      <header className="pt-4 pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ようこそ</h1>
          <p className="text-gray-500">現在の在庫状況を確認しましょう</p>
        </div>
        <button 
          onClick={() => setShowNotifications(true)}
          className="relative p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-primary-600 transition-colors"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 shadow-sm border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Shopping List Summary */}
      <section>
        <div 
          onClick={() => navigate('/shopping-list')}
          className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">買い物リスト</h2>
              <p className="text-xs text-gray-500">
                {pendingShoppingCount > 0 ? `買うべきものが ${pendingShoppingCount} 件あります` : '買うべきものはありません'}
              </p>
            </div>
          </div>
          <div className="text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-red-700">{expiredCount}</span>
            <span className="text-xs text-red-600 mt-1 font-medium text-center">期限目安越え</span>
          </div>
          <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-orange-700">{warningCount}</span>
            <span className="text-xs text-orange-600 mt-1 font-medium text-center">早めに</span>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{totalCount}</span>
            <span className="text-xs text-gray-500 mt-1 font-medium text-center">在庫総数</span>
          </div>
        </div>
      </section>

      {/* Alert Section */}
      {urgentItems.length > 0 && (
        <section className="bg-white border border-red-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-red-700 mb-3">
            <AlertCircle size={20} />
            <h2 className="font-semibold text-gray-900">消費が必要な食材</h2>
          </div>
          <div className="space-y-2">
            {urgentItems.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="font-medium text-gray-800">{item.name}</span>
                <div className={`flex items-center text-sm font-medium ${item.expiryStatus === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
                  <Clock size={14} className="mr-1" />
                  <span>{item.actualExpiryDate || item.estimatedExpiryDate}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notification Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
          <header className="px-4 py-4 bg-white flex justify-between items-center border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">お知らせ</h2>
            <button onClick={() => setShowNotifications(false)} className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">お知らせはありません</div>
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <button onClick={markAllAsRead} className="text-sm text-primary-600 hover:text-primary-700 font-medium">すべて既読にする</button>
                </div>
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 rounded-xl border transition-colors ${n.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100 cursor-pointer'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${n.severity === 'expired' ? 'bg-red-100 text-red-700' : n.severity === 'urgent' || n.severity === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                        {n.type === 'expiry' ? '期限通知' : 'お知らせ'}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.message}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
