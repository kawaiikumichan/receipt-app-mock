import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Check, Edit2, X } from 'lucide-react';

const ScannerPage: React.FC = () => {
  const [step, setStep] = useState<'camera' | 'processing' | 'confirm'>('camera');

  const handleCapture = () => {
    setStep('processing');
    // Simulate processing delay
    setTimeout(() => {
      setStep('confirm');
    }, 1500);
  };

  if (step === 'processing') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 flex-col">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium">レシートを解析中...</p>
        <p className="text-sm text-gray-400 mt-2">Geminiが項目を分類しています</p>
      </div>
    );
  }

  if (step === 'confirm') {
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
          </div>

          {/* Mock Extracted Data */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <div>
                <div className="font-semibold text-gray-900 mb-1">国産豚バラ肉</div>
                <div className="flex space-x-2">
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium cursor-pointer flex items-center">
                    お肉 <Edit2 size={10} className="ml-1" />
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    賞味期限: +3日 (自動)
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1">
                <button className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-600 shadow-sm">-</button>
                <span className="font-medium w-4 text-center">1</span>
                <button className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-600 shadow-sm">+</button>
              </div>
            </div>

            <div className="flex items-center justify-between pb-1">
              <div>
                <div className="font-semibold text-gray-900 mb-1">キャベツ 1/2</div>
                <div className="flex space-x-2">
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium cursor-pointer flex items-center">
                    野菜 <Edit2 size={10} className="ml-1" />
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    賞味期限: +7日 (自動)
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1">
                <button className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-600 shadow-sm">-</button>
                <span className="font-medium w-4 text-center">1</span>
                <button className="w-8 h-8 rounded-md bg-white border border-gray-200 text-gray-600 shadow-sm">+</button>
              </div>
            </div>
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
        {/* Viewfinder Mock */}
        <div className="w-64 h-80 border-2 border-white/50 rounded-2xl relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl"></div>
          <p className="text-white/70 text-center mt-32 text-sm">レシートを枠内に収めてください</p>
        </div>
      </div>

      <div className="bg-black/80 pb-24 pt-6 px-8 flex justify-between items-center rounded-t-3xl">
        <button className="text-white flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-1">
            <ImageIcon size={20} />
          </div>
          <span className="text-xs">ライブラリ</span>
        </button>
        
        <button 
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform"
        >
          <div className="w-full h-full bg-white rounded-full"></div>
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
