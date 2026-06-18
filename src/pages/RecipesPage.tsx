import React from 'react';
import { Utensils, Clock, CheckCircle } from 'lucide-react';
import { mockRecipes } from '../data/mockData';
import { useInventory } from '../contexts/InventoryContext';

const RecipesPage: React.FC = () => {
  const { recordMealAndConsume } = useInventory();

  return (
    <div className="p-4 h-full flex flex-col">
      <header className="pt-4 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">献立提案 (モック)</h1>
        <p className="text-sm text-gray-500">Step4: 提案されたレシピを作って実績を登録するテスト画面</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        {mockRecipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {recipe.image && (
              <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{recipe.title}</h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{recipe.time}分</span>
                </div>
                <div className="flex items-center">
                  <Utensils size={16} className="mr-1" />
                  <span>基本 {recipe.baseServings}人前</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">必要食材</h4>
                <ul className="text-sm space-y-1">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between text-gray-600">
                      <span>{ing.name} <span className="text-xs text-gray-400">({ing.ingredientKey})</span></span>
                      <span>{ing.quantity}{ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  const input = window.prompt(`何人前作りましたか？ (基本: ${recipe.baseServings}人前)\n半角数字で入力してください。`);
                  if (input !== null) {
                    const servings = parseFloat(input);
                    if (!isNaN(servings) && servings > 0) {
                      recordMealAndConsume(recipe, servings);
                      window.alert(`「${recipe.title}」を ${servings} 人前作りました。\n在庫から食材を自動消費しました！`);
                    }
                  }
                }}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium flex items-center justify-center transition-colors shadow-sm"
              >
                <CheckCircle size={18} className="mr-2" />
                料理実績を登録して消費
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipesPage;
