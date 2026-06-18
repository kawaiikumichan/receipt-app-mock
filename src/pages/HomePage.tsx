import React from 'react';
import { AlertCircle, Clock, Package } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';

const HomePage: React.FC = () => {
  const { inventory } = useInventory();

  // 賞味期限が3日以内のアイテムを抽出
  const soonToExpire = inventory.filter(item => {
    const targetDate = item.actualExpiryDate || item.estimatedExpiryDate;
    if (!targetDate) return false;
    const daysUntilExpiry = (new Date(targetDate).getTime() - new Date('2026-06-17').getTime()) / (1000 * 3600 * 24);
    return daysUntilExpiry <= 3;
  });

  const foodItemsCount = inventory.filter(item => item.category !== 'daily').length;
  const dailyItemsCount = inventory.filter(item => item.category === 'daily').length;

  return (
    <div className="p-4 space-y-6">
      <header className="pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">ようこそ</h1>
        <p className="text-gray-500">現在の在庫状況を確認しましょう</p>
      </header>

      {/* Alert Section */}
      {soonToExpire.length > 0 && (
        <section className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-red-700 mb-3">
            <AlertCircle size={20} />
            <h2 className="font-semibold">賞味期限が近い食材</h2>
          </div>
          <div className="space-y-2">
            {soonToExpire.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                <span className="font-medium text-gray-800">{item.name}</span>
                <div className="flex items-center text-red-600 text-sm font-medium">
                  <Clock size={14} className="mr-1" />
                  <span>{item.actualExpiryDate || item.estimatedExpiryDate}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">在庫サマリー</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-2">
              <Package size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{foodItemsCount}</span>
            <span className="text-sm text-gray-500">食品アイテム</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <Package size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{dailyItemsCount}</span>
            <span className="text-sm text-gray-500">日用品アイテム</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
