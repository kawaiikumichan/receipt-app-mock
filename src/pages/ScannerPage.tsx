import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Check, X, Camera, Plus, Minus } from 'lucide-react';
import { type ParsedReceipt, type Category, type StorageType, type InventoryItem } from '../data/mockData';
import { useInventory } from '../contexts/InventoryContext';
import { useNavigate } from 'react-router-dom';

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

const ScannerPage: React.FC = () => {
  const [step, setStep] = useState<'camera' | 'processing' | 'confirm'>('camera');
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [editableItems, setEditableItems] = useState<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'expiryStatus' | 'opened' | 'openedAt'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const { addItems } = useInventory();
  const navigate = useNavigate();

  const handleCaptureClick = () => {
    cameraInputRef.current?.click();
  };

  const handleLibraryClick = () => {
    libraryInputRef.current?.click();
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_DIMENSION = 1200;
          if (width > height && width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context not available'));
          ctx.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStep('processing');
    setError(null);

    try {
      const base64 = await compressImage(file);
      
      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageBase64: base64 })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const errorMessage = errData?.details 
          ? `${errData.error}: ${errData.details}` 
          : (errData?.error || 'サーバーエラーが発生しました。');
        throw new Error(errorMessage);
      }

      const data: ParsedReceipt = await response.json();
      
      const today = new Date().toISOString().split('T')[0];
      const itemsForEdit = data.items.map(item => {
        let expiry = item.expiry_date_estimate || '';
        const match = expiry.match(/20\d{2}[-\/]\d{1,2}[-\/]\d{1,2}/);
        if (match) {
          const dateObj = new Date(match[0].replace(/\//g, '-'));
          if (!isNaN(dateObj.getTime())) {
            expiry = dateObj.toISOString().split('T')[0];
          } else {
            expiry = '';
          }
        } else {
          expiry = '';
        }

        return {
          name: item.name,
          ingredientKey: item.ingredientKey || item.name,
          category: item.category as Category,
          quantity: item.quantity,
          unit: item.unit || '個',
          price: item.price || 0,
          purchaseDate: today,
          estimatedExpiryDate: expiry,
          actualExpiryDate: '',
          storageType: (item.category === 'meat' || item.category === 'fish' || item.category === 'dairy' ? 'refrigerated' : 'room') as StorageType
        };
      });
      setEditableItems(itemsForEdit);
      setParsedData(data);
      setStep('confirm');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'エラーが発生しました');
      setStep('camera');
    }
  };

  if (step === 'processing') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 flex-col">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">レシートを解析中...</p>
        <p className="text-sm text-gray-400 mt-2">Geminiが項目を分類・賞味期限を推定しています</p>
      </div>
    );
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    setEditableItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRegister = () => {
    addItems(editableItems);
    navigate('/inventory');
  };

  if (step === 'confirm' && parsedData) {
    return (
      <div className="p-4 h-full flex flex-col bg-gray-50">
        <header className="pt-4 pb-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">内容の確認・編集</h1>
          <button onClick={() => setStep('camera')} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 pb-24">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-sm text-blue-800">
            内容を確認・修正してから登録してください。
            {parsedData.store_name && <div className="mt-1 font-semibold">店舗: {parsedData.store_name}</div>}
          </div>

          <div className="space-y-4">
            {editableItems.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-2 space-y-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">レシート印字の商品名</label>
                      <input 
                        type="text" 
                        value={item.name} 
                        onChange={e => handleItemChange(index, 'name', e.target.value)}
                        className="font-semibold text-gray-900 border border-gray-200 rounded-md bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none w-full px-2 py-1.5"
                        placeholder="商品名"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-primary-600 mb-0.5">献立AI用の食材名（推測）</label>
                      <input 
                        type="text" 
                        value={item.ingredientKey || ''} 
                        onChange={e => handleItemChange(index, 'ingredientKey', e.target.value)}
                        className="text-sm text-gray-700 border border-primary-200 bg-primary-50/30 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none w-full px-2 py-1.5"
                        placeholder="検索キー (例: 玉ねぎ)"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1 shrink-0">
                    <button 
                      onClick={() => handleItemChange(index, 'quantity', Math.max(0, item.quantity - 1))}
                      className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-600 shadow-sm flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => handleItemChange(index, 'quantity', item.quantity + 1)}
                      className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-600 shadow-sm flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 text-sm">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
                    <select 
                      value={item.category} 
                      onChange={e => handleItemChange(index, 'category', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary-500"
                    >
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">保存場所</label>
                    <select 
                      value={item.storageType} 
                      onChange={e => handleItemChange(index, 'storageType', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary-500"
                    >
                      <option value="refrigerated">冷蔵</option>
                      <option value="frozen">冷凍</option>
                      <option value="room">常温</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 text-sm">
                  <div className="flex-1">
                    <label className={`block text-xs font-medium mb-1 ${(['meat', 'fish', 'dairy'].includes(item.category) || ['豆腐', '麺', '惣菜'].some(k => item.name.includes(k))) ? 'text-orange-600' : 'text-gray-500'}`}>
                      {(['meat', 'fish', 'dairy'].includes(item.category) || ['豆腐', '麺', '惣菜'].some(k => item.name.includes(k))) ? '推定期限 (確認推奨)' : '推定期限'}
                    </label>
                    <input 
                      type="date" 
                      value={item.estimatedExpiryDate} 
                      onChange={e => handleItemChange(index, 'estimatedExpiryDate', e.target.value)}
                      className={`w-full bg-gray-50 border rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary-500 ${(['meat', 'fish', 'dairy'].includes(item.category) || ['豆腐', '麺', '惣菜'].some(k => item.name.includes(k))) ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'}`}
                    />
                    {(['meat', 'fish', 'dairy'].includes(item.category) || ['豆腐', '麺', '惣菜'].some(k => item.name.includes(k))) && (
                      <p className="text-[10px] text-orange-600 mt-1">
                        ※推定値です。必要に応じて正確な日付に修正してください。
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-20 left-0 w-full px-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-4 pb-2">
          <button 
            onClick={handleRegister}
            className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-primary-700 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Check size={20} className="mr-2" />
            在庫に登録する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col p-4">
      <header className="pt-4 pb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">レシート読み取り</h1>
        <p className="text-gray-500 mt-2 text-sm">レシートを撮影するか、画像を選んでください</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6 pb-20">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={cameraInputRef} 
          onChange={handleFileChange}
          capture="environment"
        />
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={libraryInputRef} 
          onChange={handleFileChange}
        />

        {error && (
          <div className="w-full bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm font-medium mb-4">
            {error}
          </div>
        )}

        <button 
          onClick={handleCaptureClick}
          className="w-full max-w-sm bg-primary-600 hover:bg-primary-700 text-white p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-3 transition-transform active:scale-95"
        >
          <Camera size={48} className="text-white/90" />
          <span className="font-bold text-lg">カメラで撮影する</span>
        </button>

        <button 
          onClick={handleLibraryClick}
          className="w-full max-w-sm bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-3 transition-transform active:scale-95"
        >
          <ImageIcon size={48} className="text-gray-400" />
          <span className="font-bold text-lg">ライブラリから選ぶ</span>
        </button>
      </div>
    </div>
  );
};

export default ScannerPage;
