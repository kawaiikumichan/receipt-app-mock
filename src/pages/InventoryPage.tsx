import React, { useState, useMemo } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Search, Filter, ChevronDown, X } from 'lucide-react';
import { type Category, type StorageType } from '../data/mockData';

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
  const { inventory, updateItem, addItems, consumeOrWasteItem } = useInventory();
  const [activeTab, setActiveTab] = useState<'food' | 'daily'>('food');
  const [sortOption, setSortOption] = useState<'expiry' | 'added' | 'category' | 'name'>('expiry');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [manualItem, setManualItem] = useState({
    name: '',
    ingredientKey: '',
    category: 'vegetable' as Category,
    quantity: 1 as number | string,
    unit: '個',
    price: 0,
    storageType: 'refrigerated' as StorageType,
    estimatedExpiryDate: '',
    actualExpiryDate: ''
  });

  const [actionItem, setActionItem] = useState<{ id: string, name: string, quantity: number, unit: string } | null>(null);
  const [wasteReasonOpen, setWasteReasonOpen] = useState(false);
  const [quantityToProcess, setQuantityToProcess] = useState<number>(0);

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

  const handleActionClick = (item: { id: string, name: string, quantity: number, unit: string }) => {
    const input = window.prompt(`「${item.name}」をどれくらい処理しますか？ (単位: ${item.unit})\n現在の在庫: ${item.quantity}${item.unit}`, String(item.quantity));
    if (input !== null) {
      const num = parseFloat(input);
      if (!isNaN(num) && num > 0) {
        setActionItem(item);
        setQuantityToProcess(num);
      }
    }
  };

  const openEditModal = (item: any) => {
    setEditingItemId(item.id);
    setManualItem({
      name: item.name,
      ingredientKey: item.ingredientKey || item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price || 0,
      storageType: item.storageType,
      estimatedExpiryDate: item.estimatedExpiryDate || '',
      actualExpiryDate: item.actualExpiryDate || ''
    });
    setIsManualAddOpen(true);
  };

  const processAction = (action: 'consumed' | 'wasted', reason?: 'expired' | 'spoiled' | 'overpurchase' | 'other') => {
    if (actionItem && quantityToProcess > 0) {
      consumeOrWasteItem(actionItem.id, action, quantityToProcess, reason);
    }
    setActionItem(null);
    setWasteReasonOpen(false);
    setQuantityToProcess(0);
  };

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
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base shadow-sm" 
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
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-primary-300 transition-colors" onClick={(e) => {
            // Prevent opening modal if clicking on the + / - buttons
            if ((e.target as HTMLElement).closest('button')) return;
            openEditModal(item);
          }}>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-900">{item.name}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {categoryLabels[item.category]}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                在庫: {item.quantity}{item.unit}
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className={`font-medium ${item.expiryStatus === 'expired' ? 'text-red-600' : item.expiryStatus === 'urgent' || item.expiryStatus === 'warning' ? 'text-orange-600' : 'text-gray-500'}`}>
                  {item.actualExpiryDate || item.estimatedExpiryDate ? `期限: ${item.actualExpiryDate || item.estimatedExpiryDate}` : ''}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleActionClick(item); }}
                    className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform"
                    title="消費・廃棄する"
                  >
                    -
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
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
      <button 
        onClick={() => {
          setEditingItemId(null);
          setManualItem({ name: '', ingredientKey: '', category: 'vegetable', quantity: 1, unit: '個', price: 0, storageType: 'refrigerated', estimatedExpiryDate: '', actualExpiryDate: '' });
          setIsManualAddOpen(true);
        }}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 active:scale-95 transition-all"
        title="手動で追加"
      >
        <Plus size={24} />
      </button>

      {/* Manual Add / Edit Modal */}
      {isManualAddOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <header className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-900">{editingItemId ? '食材の編集' : '手動で食材を追加'}</h2>
              <button onClick={() => setIsManualAddOpen(false)} className="text-gray-500 hover:text-gray-700 p-1">
                <X size={20} />
              </button>
            </header>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">商品名</label>
                <input type="text" value={manualItem.name} onChange={e => setManualItem({...manualItem, name: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-primary-500" placeholder="例: キャベツ" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
                  <select value={manualItem.category} onChange={e => setManualItem({...manualItem, category: e.target.value as Category})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-primary-500">
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">保存場所</label>
                  <select value={manualItem.storageType} onChange={e => setManualItem({...manualItem, storageType: e.target.value as StorageType})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-primary-500">
                    <option value="refrigerated">冷蔵</option>
                    <option value="frozen">冷凍</option>
                    <option value="room">常温</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-xs text-gray-500 mb-1">数量</label>
                  <input type="number" step="0.1" value={manualItem.quantity} onChange={e => setManualItem({...manualItem, quantity: e.target.value === '' ? '' : parseFloat(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-primary-500" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs text-gray-500 mb-1">単位</label>
                  <input type="text" value={manualItem.unit} onChange={e => setManualItem({...manualItem, unit: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-primary-500" placeholder="個, g, 本 etc" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">期限 (任意)</label>
                <input type="date" value={manualItem.estimatedExpiryDate} onChange={e => setManualItem({...manualItem, estimatedExpiryDate: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-primary-500" />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => {
                  if (!manualItem.name) return alert('食材名を入力してください');
                  const finalQuantity = typeof manualItem.quantity === 'number' ? manualItem.quantity : parseFloat(manualItem.quantity) || 0;
                  
                  if (editingItemId) {
                    updateItem(editingItemId, {
                      ...manualItem,
                      quantity: finalQuantity
                    });
                  } else {
                    addItems([
                      {
                        ...manualItem,
                        quantity: finalQuantity,
                        ingredientKey: manualItem.name, // Simplified for manual add
                        purchaseDate: new Date().toISOString().split('T')[0]
                      }
                    ]);
                  }
                  setIsManualAddOpen(false);
                }}
                className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 active:scale-95 transition-transform"
              >
                {editingItemId ? '保存する' : '登録する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Consume/Waste) */}
      {actionItem && !wasteReasonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 text-center">
            <h3 className="font-bold text-lg mb-2">この在庫をどう処理しますか？</h3>
            <p className="text-gray-500 text-sm mb-6">
              {actionItem.name} ({quantityToProcess}{actionItem.unit})
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => processAction('consumed')}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600"
              >
                使い切った
              </button>
              <button 
                onClick={() => setWasteReasonOpen(true)}
                className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600"
              >
                廃棄した
              </button>
              <button 
                onClick={() => setActionItem(null)}
                className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waste Reason Modal */}
      {actionItem && wasteReasonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 text-center">
            <h3 className="font-bold text-lg mb-2">廃棄の理由</h3>
            <p className="text-gray-500 text-sm mb-6">今後の予測に活用されます</p>
            <div className="space-y-3">
              <button onClick={() => processAction('wasted', 'expired')} className="w-full bg-orange-50 text-orange-700 border border-orange-200 font-bold py-3 rounded-xl hover:bg-orange-100">期限切れ</button>
              <button onClick={() => processAction('wasted', 'spoiled')} className="w-full bg-orange-50 text-orange-700 border border-orange-200 font-bold py-3 rounded-xl hover:bg-orange-100">傷んだ・腐った</button>
              <button onClick={() => processAction('wasted', 'overpurchase')} className="w-full bg-orange-50 text-orange-700 border border-orange-200 font-bold py-3 rounded-xl hover:bg-orange-100">買いすぎた</button>
              <button onClick={() => processAction('wasted', 'other')} className="w-full bg-gray-50 text-gray-700 border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-100">その他</button>
              
              <button 
                onClick={() => setWasteReasonOpen(false)}
                className="w-full bg-transparent text-gray-500 py-3 mt-2 text-sm"
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
