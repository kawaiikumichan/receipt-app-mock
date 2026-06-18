import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Search, Filter } from 'lucide-react';
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
  const { inventory } = useInventory();
  const [activeTab, setActiveTab] = useState<'food' | 'daily'>('food');

  const filteredInventory = inventory.filter(item => 
    activeTab === 'food' ? item.category !== 'daily' : item.category === 'daily'
  );

  return (
    <div className="p-4 h-full flex flex-col">
      <header className="pt-4 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">在庫管理</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm shadow-sm" 
            placeholder="食材・日用品を検索..." 
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Filter size={18} />
            </button>
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
                <span className="text-gray-500">
                  {item.actualExpiryDate || item.estimatedExpiryDate ? `期限: ${item.actualExpiryDate || item.estimatedExpiryDate}` : ''}
                </span>
                <div className="flex gap-2">
                  <button className="text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1 rounded-full font-medium">消費</button>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform">
                -
              </button>
              <button className="w-8 h-8 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-100 active:scale-95 transition-transform">
                +
              </button>
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
