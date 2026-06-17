import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Check, Edit2, X, Camera } from 'lucide-react';
import { type ParsedReceipt, type Category } from '../data/mockData';

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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStep('processing');
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch('/api/parse-receipt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageBase64: base64 })
        });

        if (!response.ok) {
          throw new Error('読み取りに失敗しました。');
        }

        const data: ParsedReceipt = await response.json();
        setParsedData(data);
        setStep('confirm');
      };
      reader.onerror = () => {
        throw new Error('ファイルの読み込みに失敗しました。');
      };
    } catch (err: any) {
      console.error(err);
      setError(err.message);
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

  if (step === 'confirm' && parsedData) {
    return (
      <div className="p-4 h-full flex flex-col">
        <header className="pt-4 pb-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">読み取り結果</h1>
          <button onClick={() => setStep('camera')} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 pb-20">
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-sm text-blue-800">
            内容を確認し、必要に応じて修正してください。
            {parsedData.store_name && <div className="mt-1 font-semibold">店舗: {parsedData.store_name}</div>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            {parsedData.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{item.name}</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium cursor-pointer flex items-center">
                      {categoryLabels[item.category] || item.category} <Edit2 size={10} className="ml-1" />
                    </span>
                    {item.expiry_date_estimate && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        推定賞味期限: {item.expiry_date_estimate}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1 shrink-0">
                  <button className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-600 shadow-sm">-</button>
                  <span className="font-medium w-4 text-center">{item.quantity}</span>
                  <button className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-600 shadow-sm">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-20 left-0 w-full px-4">
          <button className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-primary-700 flex items-center justify-center active:scale-95 transition-transform">
            <Check size={20} className="mr-2" />
            在庫に登録する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="flex-1 relative flex items-center justify-center">
        <div className="w-64 h-80 border-2 border-white/50 rounded-2xl relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl"></div>
          <p className="text-white/70 text-center mt-32 text-sm">レシートを枠内に収めてください</p>
          {error && <p className="text-red-400 text-center mt-4 text-sm font-medium">{error}</p>}
        </div>
      </div>

      <div className="bg-black/80 pb-24 pt-6 px-8 flex justify-between items-center rounded-t-3xl">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          capture="environment"
        />
        
        <button className="text-white flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-1">
            <ImageIcon size={20} />
          </div>
          <span className="text-xs">ライブラリ</span>
        </button>
        
        <button 
          onClick={handleCaptureClick}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform"
        >
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-gray-900">
            <Camera size={24} />
          </div>
        </button>

        <button className="text-white flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-1">
            <Upload size={20} />
          </div>
          <span className="text-xs">手動入力</span>
        </button>
      </div>
    </div>
  );
};

export default ScannerPage;
