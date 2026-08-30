import React, { useState } from 'react';
import { Copy, Volume2, X, RefreshCw } from 'lucide-react';
import { speakText } from '../utils/canvas';

interface TextTranslationPageProps {
  targetLanguage: string;
  selectedModel: string;
}

export const TextTranslationPage: React.FC<TextTranslationPageProps> = ({
  targetLanguage,
  selectedModel,
}) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setError(null);
    try {
      const res = await fetch('/api/text-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLanguage,
          model: selectedModel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTranslatedText(data.translation);
      } else {
        setError(data.error || '翻譯失敗');
      }
    } catch {
      setError('網路連線錯誤');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setError(null);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-4 lg:p-6 bg-page overflow-hidden">
      {/* ── 原文輸入區 ── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#28211d] rounded-xl border border-[var(--text-main)]/10 shadow-sm overflow-hidden min-h-[40vh] md:min-h-0 relative group">
        <div className="flex items-center justify-between p-3 border-b border-[var(--text-main)]/5 bg-[var(--text-main)]/5">
          <span className="text-xs font-mono font-bold text-[var(--text-main)]/60">自動偵測語言</span>
          {sourceText && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full text-[var(--text-main)]/40 hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-colors"
              title="清除文字"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="輸入要翻譯的文字..."
          className="flex-1 w-full p-5 bg-transparent border-none resize-none focus:ring-0 text-[var(--text-main)] placeholder:text-[var(--text-main)]/30 font-sans text-lg leading-relaxed outline-none"
        />
        {/* 翻譯按鈕 (懸浮於右下角) */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={handleTranslate}
            disabled={!sourceText.trim() || isTranslating}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-full font-bold shadow-md transition-all
              ${!sourceText.trim() ? 'bg-[var(--text-main)]/10 text-[var(--text-main)]/40 cursor-not-allowed' : ''}
              ${sourceText.trim() && !isTranslating ? 'bg-[var(--accent-red)] text-white hover:scale-105 active:scale-95' : ''}
              ${isTranslating ? 'bg-[var(--accent-red)]/70 text-white cursor-wait' : ''}
            `}
          >
            {isTranslating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                翻譯中...
              </>
            ) : (
              '翻譯'
            )}
          </button>
        </div>
      </div>

      {/* ── 翻譯結果區 ── */}
      <div className="flex-1 flex flex-col bg-[#faf8f5] dark:bg-[#221c19] rounded-xl border border-[var(--text-main)]/10 shadow-sm overflow-hidden min-h-[40vh] md:min-h-0">
        <div className="flex items-center justify-between p-3 border-b border-[var(--text-main)]/5 bg-[var(--accent-red)]/5">
          <span className="text-xs font-mono font-bold text-[var(--accent-red)]">
            {targetLanguage}
          </span>
          {translatedText && (
            <div className="flex gap-1">
              <button
                onClick={() => navigator.clipboard.writeText(translatedText)}
                className="p-1.5 rounded-md text-[var(--text-main)]/50 hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-colors"
                title="複製"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => speakText(translatedText, targetLanguage === '英文' ? 'en-US' : 'zh-TW')}
                className="p-1.5 rounded-md text-[var(--text-main)]/50 hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-colors"
                title="朗讀"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto">
          {error ? (
            <div className="text-[var(--accent-red)] flex items-center gap-2">
              <X className="w-5 h-5" />
              {error}
            </div>
          ) : translatedText ? (
            <div className="text-[var(--text-main)] font-sans text-lg leading-relaxed whitespace-pre-wrap">
              {translatedText}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--text-main)]/20 font-mono text-sm">
              翻譯結果將顯示於此
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
