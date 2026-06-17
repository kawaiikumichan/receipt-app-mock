import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Check, Edit2, X, Camera } from 'lucide-react';
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const handleCaptureClick = () => {
    cameraInputRef.current?.click();
  };

  const handleLibraryClick = () => {
    libraryInputRef.current?.click();
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
