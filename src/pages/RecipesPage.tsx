import React from 'react';
import { mockRecipes } from '../data/mockData';
import { Clock, ChefHat, CheckCircle2, Circle } from 'lucide-react';

const RecipesPage: React.FC = () => {
  return (
    <div className="p-4">
      <header className="pt-4 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">レシピ提案</h1>
        <p className="text-sm text-gray-500">現在の在庫から作れるレシピです</p>
      </header>

      <div className="space-y-6">
        {mockRecipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="h-48 bg-gray-200 relative">
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary-600 shadow-sm">
                マッチ度 {recipe.matchScore}%
              </div>
            </div>
            
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h2>
              
              <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>約{recipe.time}分</span>
                </div>
                <div className="flex items-center">
                  <ChefHat size={16} className="mr-1" />
                  <span>簡単</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">手持ちの食材</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.usedIngredients.map(ing => (
                      <span key={ing} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 size={12} className="mr-1" />
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {recipe.missingIngredients.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">足りない食材（買い足し推奨）</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.missingIngredients.map(ing => (
                        <span key={ing} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                          <Circle size={12} className="mr-1" />
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button className="w-full mt-5 bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors">
                このレシピを作る
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipesPage;
