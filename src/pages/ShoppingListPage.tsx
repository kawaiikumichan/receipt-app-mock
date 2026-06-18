import React from 'react';
import { useShoppingList } from '../contexts/ShoppingListContext';
import { CheckCircle2, Circle, Trash2, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ShoppingListPage: React.FC = () => {
  const { items, updateItemStatus, removeItem } = useShoppingList();
  const navigate = useNavigate();

  const pendingItems = items.filter(i => i.status === 'pending').sort((a, b) => {
    // High priority first
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const purchasedItems = items.filter(i => i.status === 'purchased').sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <header className="px-4 py-4 bg-white flex items-center shadow-sm relative z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-2">買い物リスト</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center">
            買うべきもの <span className="ml-2 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">{pendingItems.length}</span>
          </h2>
          
          {pendingItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
              <p className="text-gray-500 text-sm">買うべきものはありません</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {pendingItems.map((item, i) => (
                <div key={item.id} className={`p-4 flex items-center gap-3 ${i !== pendingItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <button 
                    onClick={() => updateItemStatus(item.id, 'purchased')}
                    className="text-gray-300 hover:text-primary-500 transition-colors"
                  >
                    <Circle size={24} />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{item.name}</span>
                      {item.priority === 'high' && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">優先</span>
                      )}
                      {item.source === 'recipe' && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">献立</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{item.quantity}{item.unit}</p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {purchasedItems.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center">
              購入済み・連携待ち <span className="ml-2 bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full text-xs">{purchasedItems.length}</span>
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-75">
              {purchasedItems.map((item, i) => (
                <div key={item.id} className={`p-4 flex items-center gap-3 ${i !== purchasedItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <button 
                    onClick={() => updateItemStatus(item.id, 'pending')}
                    className="text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    <CheckCircle2 size={24} />
                  </button>
                  <div className="flex-1">
                    <span className="font-medium text-gray-500 line-through">{item.name}</span>
                    <p className="text-xs text-gray-400">{item.quantity}{item.unit}</p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-blue-50 text-blue-700 text-xs p-3 rounded-xl border border-blue-100">
              💡 レシートを読み取ると、購入済みの食材は自動的に在庫へ登録され、リストから削除されます（※次回以降のアップデートで対応予定）。
            </div>
          </section>
        )}
      </div>

      <button 
        className="fixed bottom-6 right-4 w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 active:scale-95 transition-all z-20"
        title="手動で買い物リストに追加"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default ShoppingListPage;
