import React, { useState, useMemo } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { type Category } from '../data/mockData';

const categoryLabels: Record<Category, string> = {
  meat: 'お肉',
  fish: '魚介類',
  vegetable: '野菜',
  fruit: '果物',
  dairy: '乳製品',
  frozen: '冷凍食品',
  drink: '飲料',
  pantry: '保存食',
  seasoning: '調味料',
  daily: '日用品',
  other: 'その他'
};

const InventoryPage: React.FC = () => {
  const { inventory, consumeManually, updateItem } = useInventory();
  const [activeTab, setActiveTab] = useState<'food' | 'daily'>('food');
  const [sortOption, setSortOption] = useState<'expiry' | 'added' | 'category' | 'name'>('expiry');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filteredInventory = useMemo(() => {
    let items = inventory.filter(item => 
      activeTab === 'food' ? item.category !== 'daily' : item.category === 'daily'
    );

    return items.sort((a, b) => {
      if (sortOption === 'added') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOption === 'category') {
        return a.category.localeCompare(b.category);
      } else if (sortOption === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // expiry (default)
        const dateA = a.actualExpiryDate || a.estimatedExpiryDate;
        const dateB = b.actualExpiryDate || b.estimatedExpiryDate;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      }
    });
  }, [inventory, activeTab, sortOption]);

  return (
    <div className="p-4 h-full flex flex-col">
      <header className="pt-4 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">在庫管理</h1>
        
        {/* Search Bar & Sort */}
        <div className="flex space-x-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm shadow-sm" 
              placeholder="検索..." 
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center space-x-1 px-3 py-2 border border-gray-200 bg-white rounded-xl text-gray-600 text-sm shadow-sm hover:bg-gray-50"
            >
              <Filter size={16} />
              <ChevronDown size={14} />
            </button>
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                <button onClick={() => { setSortOption('expiry'); setIsSortOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm ${sortOption === 'expiry' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>賞味期限が近い順</button>
                <button onClick={() => { setSortOption('added'); setIsSortOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm ${sortOption === 'added' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>登録日が新しい順</button>
                <button onClick={() => { setSortOption('category'); setIsSortOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm ${sortOption === 'category' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>カテゴリ順</button>
                <button onClick={() => { setSortOption('name'); setIsSortOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm ${sortOption === 'name' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>名前順</button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'food' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('food')}
          >
            食品
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'daily' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('daily')}
          >
            日用品
          </button>
        </div>
      </header>

      {/* Inventory List */}
      <div className="flex-1 overflow-y-auto pb-4 space-y-3">
        {filteredInventory.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-900">{item.name}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {categoryLabels[item.category]}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                在庫: {item.quantity}{item.unit}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className={`font-medium ${item.expiryStatus === 'expired' ? 'text-red-600' : item.expiryStatus === 'urgent' || item.expiryStatus === 'warning' ? 'text-orange-600' : 'text-gray-500'}`}>
                  {item.actualExpiryDate || item.estimatedExpiryDate ? `期限: ${item.actualExpiryDate || item.estimatedExpiryDate}` : ''}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const input = window.prompt(`「${item.name}」をどれくらい消費しますか？ (単位: ${item.unit})\n現在の在庫: ${item.quantity}${item.unit}`);
                      if (input !== null) {
                        const num = parseFloat(input);
                        if (!isNaN(num) && num > 0) {
                          consumeManually(item.id, num);
                        }
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform"
                    title="消費する"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => {
                      const input = window.prompt(`「${item.name}」をどれくらい追加しますか？ (単位: ${item.unit})\n現在の在庫: ${item.quantity}${item.unit}`);
                      if (input !== null) {
                        const num = parseFloat(input);
                        if (!isNaN(num) && num > 0) {
                          updateItem(item.id, { quantity: item.quantity + num });
                        }
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-100 active:scale-95 transition-transform"
                    title="追加する"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 active:scale-95 transition-all">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default InventoryPage;
