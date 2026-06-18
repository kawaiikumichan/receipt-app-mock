import React, { useMemo } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { PieChart, TrendingDown, Clock, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnalyticsPage: React.FC = () => {
  const { consumptions, inventory } = useInventory();
  const navigate = useNavigate();

  // 今月のデータに絞り込む
  const thisMonthConsumptions = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return consumptions.filter(c => new Date(c.createdAt).getTime() >= startOfMonth);
  }, [consumptions]);

  const stats = useMemo(() => {
    const consumed = thisMonthConsumptions.filter(c => c.action === 'consumed');
    const wasted = thisMonthConsumptions.filter(c => c.action === 'wasted');
    
    const consumedCount = consumed.length;
    const wastedCount = wasted.length;
    
    // ロス率 (件数ベース。将来的には金額や重量ベースも考えられる)
    const totalCount = consumedCount + wastedCount;
    const wasteRatio = totalCount === 0 ? 0 : Math.round((wastedCount / totalCount) * 100);

    return { consumedCount, wastedCount, wasteRatio };
  }, [thisMonthConsumptions]);

  // よく使う食材（消費回数ベース）
  const topConsumed = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    consumptions.filter(c => c.action === 'consumed').forEach(c => {
      if (!counts[c.ingredientKey]) {
        counts[c.ingredientKey] = { name: c.name, count: 0 };
      }
      counts[c.ingredientKey].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [consumptions]);

  // よく余らせる食材（廃棄回数ベース）
  const topWasted = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    consumptions.filter(c => c.action === 'wasted').forEach(c => {
      if (!counts[c.ingredientKey]) {
        counts[c.ingredientKey] = { name: c.name, count: 0 };
      }
      counts[c.ingredientKey].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [consumptions]);

  // 平均消費日数の計算
  const avgConsumptionDays = useMemo(() => {
    const itemDays: Record<string, number[]> = {};
    
    consumptions.filter(c => c.action === 'consumed' && c.inventoryItemId).forEach(c => {
      // 在庫から該当アイテムを探す（残っている場合のみ正確な日数がわかる）
      const invItem = inventory.find(i => i.id === c.inventoryItemId);
      if (invItem) {
        const days = (new Date(c.createdAt).getTime() - new Date(invItem.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (!itemDays[c.ingredientKey]) itemDays[c.ingredientKey] = [];
        itemDays[c.ingredientKey].push(days);
      }
    });

    const averages = Object.entries(itemDays).map(([key, daysArray]) => {
      const avg = daysArray.reduce((a, b) => a + b, 0) / daysArray.length;
      return { key, name: topConsumed.find(t => t.name.includes(key))?.name || key, avgDays: Math.max(1, Math.round(avg)) };
    }).sort((a, b) => a.avgDays - b.avgDays).slice(0, 5); // 短い順

    return averages;
  }, [consumptions, inventory, topConsumed]);

  return (
    <div className="p-4 space-y-6 relative h-full flex flex-col bg-gray-50 overflow-y-auto pb-20">
      <header className="pt-4 pb-2 flex items-center mb-2">
        <button onClick={() => navigate(-1)} className="mr-3 p-2 bg-white rounded-full shadow-sm text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">消費履歴分析</h1>
          <p className="text-gray-500 text-sm">無駄をなくし、次回の買い物を最適化</p>
        </div>
      </header>

      {/* サマリー（今月） */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <PieChart size={16} className="mr-1 text-primary-600" />
          今月の実績
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-medium">消費件数</span>
              <CheckCircle size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.consumedCount} <span className="text-sm font-medium text-gray-500">件</span></p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-medium">廃棄件数</span>
              <Trash2 size={16} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.wastedCount} <span className="text-sm font-medium text-red-400">件</span></p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl shadow-sm text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold mb-1 opacity-90 text-sm">現在のロス率</h3>
            <p className="text-xs opacity-75">購入に対する廃棄の割合</p>
          </div>
          <div className="text-3xl font-black">
            {stats.wasteRatio}%
          </div>
        </div>
      </section>

      {/* よく使う食材 */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <TrendingDown size={16} className="mr-1 text-green-600 transform scale-y-[-1]" />
          よく使う食材（トップ5）
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {topConsumed.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {topConsumed.map((item, i) => (
                <li key={i} className="p-3 flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{item.count} 回消費</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm">データがありません</div>
          )}
        </div>
      </section>

      {/* 要注意食材 */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <AlertTriangle size={16} className="mr-1 text-orange-500" />
          要注意！よく余らせる食材
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
          {topWasted.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {topWasted.map((item, i) => (
                <li key={i} className="p-3 flex justify-between items-center hover:bg-orange-50">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">{item.count} 回廃棄</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-green-500 text-sm">すばらしい！現在ロスしている食材はありません。</div>
          )}
        </div>
      </section>

      {/* 平均消費日数 */}
      <section>
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
          <Clock size={16} className="mr-1 text-blue-500" />
          平均消費日数（目安）
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-3">購入してから使い切るまでの平均日数です。次回の買い物量の参考にしてください。</p>
          {avgConsumptionDays.length > 0 ? (
            <div className="space-y-3">
              {avgConsumptionDays.map((item, i) => (
                <div key={i} className="flex justify-between items-end border-b border-gray-50 pb-2">
                  <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                  <span className="text-xs text-gray-600">平均 <span className="font-bold text-lg text-blue-600">{item.avgDays}</span> 日で消費</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm py-4">データが蓄積されていません</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
