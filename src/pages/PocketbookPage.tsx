import React, { useState } from 'react';
import { Bookmark, Trash2, Volume2, Download, Copy, Check } from 'lucide-react';
import { SavedItem, OCRCategory } from '../types';
import { CATEGORY_STYLES, speakText } from '../utils/canvas';

interface PocketbookPageProps {
  items: SavedItem[];
  targetLanguage: string;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const PocketbookPage: React.FC<PocketbookPageProps> = ({
  items,
  targetLanguage,
  onRemoveItem,
  onClearAll,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = items
      .map(
        (i, idx) =>
          `${idx + 1}. [${CATEGORY_STYLES[i.category as OCRCategory]?.label || i.category}]\n原文：${i.original}\n譯文：${i.translation}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    const text =
      `=== 隨身旅遊翻譯口袋書 (${targetLanguage}) ===\n儲存時間：${new Date().toLocaleString()}\n\n` +
      items
        .map(
          (i, idx) =>
            `[${idx + 1}] (${CATEGORY_STYLES[i.category as OCRCategory]?.label || i.category})\n` +
            `原文：${i.original}\n` +
            `譯文：${i.translation}\n` +
            `-----------------------------------\n`
        )
        .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel_pocketbook_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-page">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-[var(--text-main)]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-[var(--accent-red)]" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[var(--text-main)]">
                隨身口袋書
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-main)]/60">
                已收錄 {items.length} 筆
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-bold text-[var(--accent-red)] underline decoration-[0.5px] underline-offset-2 min-h-[36px] px-2"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center px-6">
            <Bookmark className="w-10 h-10 text-[var(--text-main)]/20" />
            <p className="text-sm font-serif font-bold text-[var(--text-main)]/70 tracking-widest">
              尚無備忘
            </p>
            <p className="text-xs font-mono text-[var(--text-main)]/50 max-w-xs">
              在翻譯結果頁面點擊書籤，即可將重要內容加入這裡。
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {items.map((item, idx) => {
              const style =
                CATEGORY_STYLES[item.category as OCRCategory] || CATEGORY_STYLES.item;
              return (
                <div
                  key={item.id}
                  className="bg-transparent border-t border-[var(--text-main)]/10 pt-3 pb-1"
                >
                  {/* Top row: index + badge + actions */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[var(--accent-red)]">
                        #{idx + 1}
                      </span>
                      <span
                        className="text-[10px] font-bold text-[var(--text-main)]"
                      >
                        「{style.label}」
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speakText(item.original, item.sourceLanguage)}
                        aria-label="朗讀原文"
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[var(--text-main)]/50 hover:text-[var(--text-main)] transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label="刪除此項目"
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[var(--text-main)]/50 hover:text-[var(--accent-red)] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Original */}
                  <p className="text-[13px] font-mono text-[var(--text-main)]/80 font-medium mb-1.5 leading-relaxed break-all">
                    {item.original}
                  </p>
                  {/* Translation */}
                  <p className="text-[15px] font-sans font-bold text-[var(--text-main)] leading-snug">
                    {item.translation}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {items.length > 0 && (
        <div className="shrink-0 px-4 py-3 bg-page border-t border-[var(--text-main)]/10 flex gap-4">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] text-[var(--text-main)] text-xs font-bold transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[var(--accent-green)]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="underline decoration-[0.5px] underline-offset-2">{copied ? '已複製' : '複製全部'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportTxt}
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] text-[var(--text-main)] text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="underline decoration-[0.5px] underline-offset-2">匯出 TXT</span>
          </button>
        </div>
      )}
    </div>
  );
};
