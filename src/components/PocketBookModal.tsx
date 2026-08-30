import React, { useState } from 'react';
import { Bookmark, X, Trash2, Volume2, Download, Copy, Check } from 'lucide-react';
import { SavedItem, OCRCategory } from '../types';
import { CATEGORY_STYLES, speakText } from '../utils/canvas';

interface PocketBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SavedItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  targetLanguage: string;
}

export const PocketBookModal: React.FC<PocketBookModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
  targetLanguage,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPocketbook = () => {
    const text = items
      .map(
        (i, idx) =>
          `${idx + 1}. [${CATEGORY_STYLES[i.category]?.label || i.category}]\n原文：${
            i.original
          }\n譯文：${i.translation}\n`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    const text = `=== 隨身旅遊翻譯口袋書 (${targetLanguage}) ===\n儲存時間：${new Date().toLocaleString()}\n\n` +
      items
        .map(
          (i, idx) =>
            `[${idx + 1}] (${CATEGORY_STYLES[i.category]?.label || i.category})\n` +
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
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fcfbf9] dark:bg-[#231c19] border border-[#e8e4db] dark:border-[#382f29] rounded-3xl max-w-2xl w-full overflow-hidden shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e8e4db] dark:border-[#382f29] flex items-center justify-between bg-[#f5f3ef]/80 dark:bg-[#1a1513]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c88d51]/20 text-[#a86522] dark:text-[#e5a86c] flex items-center justify-center border border-[#c88d51]/30">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#4a3b32] dark:text-[#e8e4db]">隨身口袋對照備忘錄</h3>
              <p className="text-xs text-[#8a7f76] dark:text-[#9c938c]">已收錄 {items.length} 個重要菜單、路標或告示品項</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[#8a7f76] dark:text-[#9c938c]">
              <Bookmark className="w-12 h-12 mx-auto mb-3 text-[#d8d2c6] dark:text-[#423730]" />
              <p className="text-sm font-bold text-[#4a3b32] dark:text-[#e8e4db] mb-1">口袋書目前空空如也</p>
              <p className="text-xs text-[#8a7f76] dark:text-[#9c938c]">
                點擊視覺圖片或結果清單中的「存口袋書」按鈕即可在此備忘
              </p>
            </div>
          ) : (
            items.map((item, idx) => {
              const style = CATEGORY_STYLES[item.category as OCRCategory] || CATEGORY_STYLES.item;
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#28211d] border border-[#e8e4db] dark:border-[#382f29] rounded-2xl p-4 flex flex-col justify-between gap-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#c88d51] dark:text-[#e5a86c] font-bold">#{idx + 1}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${style.badgeBg} ${style.badgeText} border`}>
                        {style.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => speakText(item.original, item.sourceLanguage)}
                        className="text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] p-1"
                        title="唸原文"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[#8a7f76] dark:text-[#9c938c] hover:text-[#c84d31] p-1"
                        title="刪除此項目"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[#8a7f76] dark:text-[#9c938c] font-medium">{item.original}</p>
                    <p className="text-sm font-extrabold text-[#4a3b32] dark:text-[#e8e4db]">{item.translation}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-[#f5f3ef] dark:bg-[#1a1513] border-t border-[#e8e4db] dark:border-[#382f29] flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={onClearAll}
              className="text-xs text-[#c84d31] dark:text-[#f2a594] hover:underline font-bold"
            >
              清空口袋書
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPocketbook}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#28211d] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] text-[#4a3b32] dark:text-[#e8e4db] text-xs font-bold rounded-xl border border-[#e8e4db] dark:border-[#382f29]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#748c69] dark:text-[#e5a86c]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已複製' : '複製全部'}</span>
              </button>

              <button
                onClick={handleExportTxt}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#8da384] dark:bg-[#d48c46] hover:bg-[#798e71] dark:hover:bg-[#c27d3b] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>匯出純文字檔</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

