import React, { useState, useEffect } from 'react';
import { Sparkles, X, Volume2, Loader2 } from 'lucide-react';
import { OCRItem } from '../types';
import { speakText } from '../utils/canvas';

interface CulturalModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OCRItem | null;
  targetLanguage: string;
}

export const CulturalModal: React.FC<CulturalModalProps> = ({
  isOpen,
  onClose,
  item,
  targetLanguage,
}) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !item) {
      setExplanation(null);
      setError(null);
      return;
    }

    fetchExplanation();
  }, [isOpen, item]);

  const fetchExplanation = async () => {
    if (!item) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/cultural-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: item.original,
          translation: item.translation,
          category: item.category,
          targetLanguage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setExplanation(data.explanation);
      } else {
        setError(data.error || '無法取得解說資訊');
      }
    } catch (err: any) {
      console.error('Cultural explain fetch error:', err);
      setError('網路連線失敗或伺服器異常');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fcfbf9] dark:bg-[#231c19] border border-[#e8e4db] dark:border-[#382f29] rounded-3xl max-w-xl w-full overflow-hidden shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e8e4db] dark:border-[#382f29] flex items-center justify-between bg-[#f5f3ef]/80 dark:bg-[#1a1513]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8da384]/20 text-[#5a7051] dark:text-[#e5a86c] flex items-center justify-center border border-[#8da384]/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#4a3b32] dark:text-[#e8e4db]">旅遊文化與飲食過敏解說指南</h3>
              <p className="text-xs text-[#748c69] dark:text-[#e5a86c] font-bold">Gemini 3.6 實時知識檢索</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Item Summary Header */}
        <div className="bg-white/80 dark:bg-[#1a1513]/80 p-4 border-b border-[#e8e4db] dark:border-[#382f29]">
          <p className="text-xs text-[#8a7f76] dark:text-[#9c938c] font-bold mb-1">對應品項：</p>
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-xs text-[#8a7f76] dark:text-[#9c938c] font-medium">{item.original}</p>
              <p className="text-base font-extrabold text-[#748c69] dark:text-[#e5a86c]">{item.translation}</p>
            </div>
            <button
              onClick={() => speakText(item.original)}
              className="flex items-center gap-1.5 text-xs text-[#4a3b32] dark:text-[#e8e4db] bg-white dark:bg-[#28211d] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] px-3 py-1.5 rounded-xl border border-[#e8e4db] dark:border-[#382f29] font-bold"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#748c69] dark:text-[#e5a86c]" />
              <span>發音</span>
            </button>
          </div>
        </div>

        {/* AI Output Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-[#8a7f76] dark:text-[#9c938c]">
              <Loader2 className="w-8 h-8 text-[#8da384] dark:text-[#d48c46] animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-[#4a3b32] dark:text-[#e8e4db] mb-1">
                正在為您分析當地文化起源、過敏原與旅遊實用語...
              </p>
              <p className="text-xs text-[#8a7f76] dark:text-[#9c938c]">此過程約需 2~3 秒</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-[#fcebe6] dark:bg-[#38231c] border border-[#f5b8a6] dark:border-[#523026] rounded-2xl text-center">
              <p className="text-sm text-[#732f1f] dark:text-[#f2a594] mb-3">{error}</p>
              <button
                onClick={fetchExplanation}
                className="px-4 py-1.5 bg-[#c84d31] text-white text-xs font-bold rounded-xl"
              >
                重新產生
              </button>
            </div>
          ) : (
            <div className="text-sm text-[#4a3b32] dark:text-[#e8e4db] leading-relaxed whitespace-pre-wrap font-medium">
              {explanation}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f5f3ef] dark:bg-[#1a1513] border-t border-[#e8e4db] dark:border-[#382f29] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white dark:bg-[#28211d] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] text-[#4a3b32] dark:text-[#e8e4db] text-xs font-bold rounded-xl border border-[#e8e4db] dark:border-[#382f29]"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};

