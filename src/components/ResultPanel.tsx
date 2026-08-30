import React, { useState } from 'react';
import {
  Search,
  Volume2,
  Bookmark,
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
} from 'lucide-react';
import { OCRItem, OCRCategory } from '../types';
import { CATEGORY_STYLES, speakText } from '../utils/canvas';

interface ResultPanelProps {
  items: OCRItem[];
  selectedItem: OCRItem | null;
  onSelectItem: (item: OCRItem | null) => void;
  hoveredItem: OCRItem | null;
  onHoverItem: (item: OCRItem | null) => void;
  targetLanguage: string;
  activeCategoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  onOpenCulturalNote: (item: OCRItem) => void;
  onSaveToPocketbook: (item: OCRItem) => void;
  savedItemIds: Set<string>;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  items,
  selectedItem,
  onSelectItem,
  hoveredItem,
  onHoverItem,
  targetLanguage,
  activeCategoryFilter,
  onCategoryFilterChange,
  onOpenCulturalNote,
  onSaveToPocketbook,
  savedItemIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Category counts
  const categoryCounts = {
    all: items.length,
    title: items.filter((i) => i.category === 'title').length,
    item: items.filter((i) => i.category === 'item').length,
    description: items.filter((i) => i.category === 'description').length,
    notice: items.filter((i) => i.category === 'notice').length,
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyAll = () => {
    const text = items
      .map(
        (i, idx) =>
          `[${idx + 1}] (${CATEGORY_STYLES[i.category]?.label || i.category})\n原文：${
            i.original
          }\n譯文：${i.translation}\n`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_translation_${targetLanguage}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    let md = `# 視覺 OCR 翻譯對照表 (${targetLanguage})\n\n`;
    md += `| 類別 | 辨識原文 | ${targetLanguage} 譯文 |\n`;
    md += `| --- | --- | --- |\n`;
    items.forEach((item) => {
      md += `| ${CATEGORY_STYLES[item.category]?.label || item.category} | ${item.original.replace(
        /\|/g,
        '\\|'
      )} | ${item.translation.replace(/\|/g, '\\|')} |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_translation_${targetLanguage}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/60 dark:bg-[#28211d]/90 border border-[#e8e4db] dark:border-[#382f29] rounded-3xl p-5 flex flex-col h-full shadow-xs backdrop-blur-xs transition-colors">
      {/* Search & Filter Header */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8a7f76] dark:text-[#9c938c] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="搜尋原文或譯文關鍵字..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#1a1513] text-[#4a3b32] dark:text-[#e8e4db] text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-2.5 border border-[#e8e4db] dark:border-[#382f29] focus:outline-none focus:border-[#8da384] dark:focus:border-[#d48c46] placeholder-[#8a7f76]/60 dark:placeholder-[#9c938c]/60 font-medium"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => onCategoryFilterChange('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'all'
                ? 'bg-[#8da384] dark:bg-[#d48c46] text-white shadow-xs'
                : 'bg-white/80 dark:bg-[#241e1b] text-[#8a7f76] dark:text-[#9c938c] border border-[#e8e4db] dark:border-[#382f29] hover:text-[#4a3b32] dark:hover:text-[#e8e4db]'
            }`}
          >
            全部 ({categoryCounts.all})
          </button>

          <button
            onClick={() => onCategoryFilterChange('title')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'title'
                ? 'bg-[#8da384] dark:bg-[#d48c46] text-white shadow-xs'
                : 'bg-white/80 dark:bg-[#241e1b] text-[#8a7f76] dark:text-[#9c938c] border border-[#e8e4db] dark:border-[#382f29] hover:text-[#4a3b32] dark:hover:text-[#e8e4db]'
            }`}
          >
            標題 ({categoryCounts.title})
          </button>

          <button
            onClick={() => onCategoryFilterChange('item')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'item'
                ? 'bg-[#8da384] dark:bg-[#d48c46] text-white shadow-xs'
                : 'bg-white/80 dark:bg-[#241e1b] text-[#8a7f76] dark:text-[#9c938c] border border-[#e8e4db] dark:border-[#382f29] hover:text-[#4a3b32] dark:hover:text-[#e8e4db]'
            }`}
          >
            品項 ({categoryCounts.item})
          </button>

          <button
            onClick={() => onCategoryFilterChange('description')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'description'
                ? 'bg-[#8da384] dark:bg-[#d48c46] text-white shadow-xs'
                : 'bg-white/80 dark:bg-[#241e1b] text-[#8a7f76] dark:text-[#9c938c] border border-[#e8e4db] dark:border-[#382f29] hover:text-[#4a3b32] dark:hover:text-[#e8e4db]'
            }`}
          >
            說明文 ({categoryCounts.description})
          </button>

          <button
            onClick={() => onCategoryFilterChange('notice')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategoryFilter === 'notice'
                ? 'bg-[#8da384] dark:bg-[#d48c46] text-white shadow-xs'
                : 'bg-white/80 dark:bg-[#241e1b] text-[#8a7f76] dark:text-[#9c938c] border border-[#e8e4db] dark:border-[#382f29] hover:text-[#4a3b32] dark:hover:text-[#e8e4db]'
            }`}
          >
            警語 ({categoryCounts.notice})
          </button>
        </div>
      </div>

      {/* Roomy Hand-drawn Style Items List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[280px]">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-[#8a7f76] dark:text-[#9c938c] text-xs">
            查無符合關鍵字「{searchTerm}」的區域內容
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isSelected = selectedItem?.id === item.id;
            const isHovered = hoveredItem?.id === item.id;
            const isSaved = savedItemIds.has(item.id);
            const style = CATEGORY_STYLES[item.category as OCRCategory] || CATEGORY_STYLES.item;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                onMouseEnter={() => onHoverItem(item)}
                onMouseLeave={() => onHoverItem(null)}
                style={{ borderLeftColor: style.borderColor }}
                className={`p-3.5 sm:p-4 rounded-2xl border border-l-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#322a25] border-[#8da384] dark:border-[#d48c46] shadow-md ring-2 ring-[#8da384]/30 dark:ring-[#d48c46]/40'
                    : isHovered
                    ? 'bg-white/90 dark:bg-[#2f2722] border-[#e8e4db] dark:border-[#423730]'
                    : 'bg-white/60 dark:bg-[#241e1b] border-[#e8e4db]/80 dark:border-[#382f29]/80 hover:border-[#8da384]/50'
                }`}
              >
                {/* Header Row: Minimalist Index Circle & Handy Pronunciation Buttons */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span
                      style={{ backgroundColor: style.borderColor }}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-xs mt-0.5"
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      {/* Highlighted Translation */}
                      <p className="text-sm sm:text-base font-extrabold text-[#4a3b32] dark:text-[#e8e4db] leading-snug break-words">
                        {item.translation}
                      </p>
                      {/* Secondary Low-key Original */}
                      <p className="text-xs text-[#8a7f76] dark:text-[#9c938c] font-normal leading-relaxed mt-1 break-words">
                        {item.original}
                      </p>
                    </div>
                  </div>

                  {/* Handy TTS Pronunciation Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(item.translation, targetLanguage);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-[#5a7051] dark:text-[#e5a86c] bg-[#8da384]/15 dark:bg-[#d48c46]/20 hover:bg-[#8da384]/30 dark:hover:bg-[#d48c46]/35 border border-[#8da384]/30 dark:border-[#d48c46]/40 transition-colors"
                      title="朗讀中文譯文"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#748c69] dark:text-[#e5a86c]" />
                      <span className="hidden sm:inline">譯文</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(item.original);
                      }}
                      className="p-1.5 rounded-lg text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="朗讀原文發音"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Action Links */}
                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#e8e4db] dark:border-[#382f29] text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCulturalNote(item);
                    }}
                    className="flex items-center gap-1.5 text-[#748c69] dark:text-[#e5a86c] hover:underline font-bold text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>文化過敏解說</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveToPocketbook(item);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isSaved
                        ? 'text-[#c88d51] dark:text-[#e5a86c] bg-[#c88d51]/15 dark:bg-[#d48c46]/20'
                        : 'text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[#c88d51] dark:text-[#e5a86c]" />
                    <span>{isSaved ? '已收錄' : '收錄'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Global Export Footer Bar */}
      <div className="mt-4 pt-3.5 border-t border-[#e8e4db] dark:border-[#382f29] flex items-center justify-between gap-2">
        <button
          onClick={handleCopyAll}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-[#241e1b] hover:bg-[#f5f3ef] dark:hover:bg-[#2f2722] text-[#4a3b32] dark:text-[#e8e4db] text-xs font-bold rounded-xl border border-[#e8e4db] dark:border-[#382f29] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#748c69] dark:text-[#e5a86c]" /> : <Copy className="w-3.5 h-3.5 text-[#748c69] dark:text-[#d48c46]" />}
          <span>{copied ? '已複製' : '複製全文字'}</span>
        </button>

        <button
          onClick={handleExportMarkdown}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-[#241e1b] hover:bg-[#f5f3ef] dark:hover:bg-[#2f2722] text-[#4a3b32] dark:text-[#e8e4db] text-xs font-bold rounded-xl border border-[#e8e4db] dark:border-[#382f29] transition-colors"
          title="匯出 Markdown 格式檔"
        >
          <FileText className="w-3.5 h-3.5 text-[#748c69] dark:text-[#e5a86c]" />
          <span>Markdown</span>
        </button>

        <button
          onClick={handleExportJson}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-[#241e1b] hover:bg-[#f5f3ef] dark:hover:bg-[#2f2722] text-[#4a3b32] dark:text-[#e8e4db] text-xs font-bold rounded-xl border border-[#e8e4db] dark:border-[#382f29] transition-colors"
          title="下載 JSON 格式檔"
        >
          <Download className="w-3.5 h-3.5 text-[#748c69] dark:text-[#e5a86c]" />
          <span>JSON</span>
        </button>
      </div>
    </div>
  );
};

