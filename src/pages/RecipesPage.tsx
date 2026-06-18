import React, { useState } from 'react';
import { Utensils, Clock, CheckCircle, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useShoppingList } from '../contexts/ShoppingListContext';
import { type Recipe } from '../data/mockData';

const RecipesPage: React.FC = () => {
  const { inventory, getUrgentItems, getRescueItems, recordMealAndConsume } = useInventory();
  const { addItems: addShoppingItems } = useShoppingList();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings state
  const [familySize, setFamilySize] = useState(2);
  const [maxCookingTime, setMaxCookingTime] = useState(30);

  const suggestRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const urgentItems = getUrgentItems();
      const rescueItems = getRescueItems();
      const res = await fetch('/api/suggest-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory,
          urgentItems,
          rescueItems,
          settings: { familySize, maxCookingTime, planDays: 1 }
        })
      });

      if (!res.ok) {
        throw new Error('レシピの提案に失敗しました');
      }

      const data: Recipe[] = await res.json();
      setRecipes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <header className="pt-4 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">献立提案</h1>
        <p className="text-sm text-gray-500 mb-4">在庫と設定から最適なレシピを提案します。</p>

        {/* Settings */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">人数</label>
              <select 
                value={familySize} 
                onChange={e => setFamilySize(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-primary-500"
              >
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}人前</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">最大調理時間</label>
              <select 
                value={maxCookingTime} 
                onChange={e => setMaxCookingTime(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value={15}>15分以内</option>
                <option value={30}>30分以内</option>
                <option value={45}>45分以内</option>
                <option value={60}>60分以内</option>
              </select>
            </div>
          </div>
          <button
            onClick={suggestRecipes}
            disabled={loading || inventory.length === 0}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-medium flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Wand2 size={18} className="mr-2" />}
            {inventory.length === 0 ? '在庫を登録してください' : 'AIに献立を提案してもらう'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            {error}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {recipe.image && (
              <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900">{recipe.title}</h3>
                <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2">
                  総合 {recipe.matchScore}点
                </span>
              </div>
              
              {recipe.recommendationReasons && recipe.recommendationReasons.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.recommendationReasons.map(r => {
                    if (r === 'urgent') return <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">期限間近をレスキュー</span>;
                    if (r === 'rescue') return <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">余りがち食材を消費</span>;
                    if (r === 'high_utilization') return <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">在庫をたっぷり活用</span>;
                    if (r === 'quick') return <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-600 border border-green-100">時短でサクッと</span>;
                    if (r === 'less_shopping') return <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">買い足し最小限</span>;
                    return null;
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                  <Clock size={12} className="mr-1" />
                  <span>{recipe.time}分</span>
                </div>
                <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                  <Utensils size={12} className="mr-1" />
                  <span>{recipe.baseServings}人前</span>
                </div>
              </div>

              <div className="bg-blue-50/50 p-3 rounded-lg text-sm text-gray-700 mb-4 border border-blue-100">
                <p className="font-medium text-blue-900 mb-1">提案の理由</p>
                {recipe.reason}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">在庫から使う食材</h4>
                {recipe.availableIngredients && recipe.availableIngredients.length > 0 ? (
                  <ul className="text-sm space-y-1">
                    {recipe.availableIngredients.map((ing, i) => (
                      <li key={i} className="flex justify-between text-gray-600">
                        <span>{ing.name} <span className="text-xs text-gray-400">({ing.ingredientKey})</span></span>
                        <span>{ing.quantity}{ing.unit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">なし</p>
                )}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-orange-700 mb-2 border-b pb-1 border-orange-100">買い足しが必要な食材</h4>
                {recipe.missingIngredients && recipe.missingIngredients.length > 0 ? (
                  <>
                    <ul className="text-sm space-y-1 mb-3">
                      {recipe.missingIngredients.map((ing, i) => (
                        <li key={i} className="flex justify-between text-gray-600">
                          <span>{ing.name} <span className="text-xs text-gray-400">({ing.ingredientKey})</span></span>
                          <span>{ing.quantity}{ing.unit}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        const itemsToAdd = recipe.missingIngredients!.map(ing => ({
                          name: ing.name,
                          ingredientKey: ing.ingredientKey,
                          quantity: ing.quantity,
                          unit: ing.unit,
                          priority: 'high' as const,
                          source: 'recipe' as const
                        }));
                        addShoppingItems(itemsToAdd);
                        alert('不足食材を買い物リストに追加しました！');
                      }}
                      className="w-full py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-sm font-bold transition-colors"
                    >
                      不足分を買い物リストに追加
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-green-600 font-medium">すべて在庫で作れます！</p>
                )}
              </div>

              <button
                onClick={() => {
                  if (window.confirm(`「${recipe.title}」を作りましたか？\n在庫食材を自動消費します。`)) {
                    recordMealAndConsume(recipe, recipe.baseServings);
                    window.alert('実績を登録し、在庫を消費しました！');
                  }
                }}
                className="w-full py-3 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm"
              >
                <CheckCircle size={18} className="mr-2" />
                このレシピの実績を登録
              </button>
            </div>
          </div>
        ))}

        {!loading && recipes.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <Utensils size={48} className="mx-auto mb-3 text-gray-300" />
            <p>ボタンを押すと、AIが献立を提案します</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipesPage;
