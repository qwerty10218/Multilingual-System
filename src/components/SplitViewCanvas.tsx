import React, { useRef, useEffect } from 'react';
import { Volume2, Bookmark, Sparkles, Eye, ArrowRightLeft } from 'lucide-react';
import { OCRItem, OCRCategory } from '../types';
import { boxToPercent, CATEGORY_STYLES, speakText } from '../utils/canvas';

interface SplitViewCanvasProps {
  imageUrl: string;
  items: OCRItem[];
  selectedItem: OCRItem | null;
  onSelectItem: (item: OCRItem | null) => void;
  hoveredItem: OCRItem | null;
  onHoverItem: (item: OCRItem | null) => void;
  targetLanguage: string;
  onOpenCulturalNote: (item: OCRItem) => void;
  onSaveToPocketbook: (item: OCRItem) => void;
  savedItemIds: Set<string>;
  activeCategoryFilter: string;
}

export const SplitViewCanvas: React.FC<SplitViewCanvasProps> = ({
  imageUrl,
  items,
  selectedItem,
  onSelectItem,
  hoveredItem,
  onHoverItem,
  targetLanguage,
  onOpenCulturalNote,
  onSaveToPocketbook,
  savedItemIds,
  activeCategoryFilter,
}) => {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filteredItems = items.filter((item) => {
    if (activeCategoryFilter === 'all') return true;
    return item.category === activeCategoryFilter;
  });

  // Scroll right-side card into view when selected
  useEffect(() => {
    if (selectedItem && cardRefs.current[selectedItem.id]) {
      cardRefs.current[selectedItem.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedItem]);

  return (
    <div className="bg-white/60 dark:bg-[#28211d]/90 border border-[#e8e4db] dark:border-[#382f29] rounded-3xl overflow-hidden shadow-xs flex flex-col h-full min-h-[560px] transition-colors">
      {/* Top Banner Header */}
      <div className="px-5 py-3.5 bg-[#f5f3ef]/90 dark:bg-[#1a1513]/90 border-b border-[#e8e4db] dark:border-[#382f29] flex items-center justify-between text-xs font-bold text-[#4a3b32] dark:text-[#e8e4db]">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#748c69] dark:text-[#d48c46]" />
          <span>獨立對照模式：左側原圖標註 • 右側平行譯文對照</span>
        </div>
        <span className="text-[#8a7f76] dark:text-[#9c938c] font-medium">
          共 {filteredItems.length} 個對照區域
        </span>
      </div>

      {/* 50 / 50 Dual Pane Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e8e4db] dark:divide-[#382f29] overflow-hidden">
        {/* Left Pane: Original Image with Numbered Pin Markers */}
        <div className="relative bg-[#f0ede6] dark:bg-[#171311] p-4 flex items-center justify-center overflow-auto min-h-[360px]">
          <div className="relative inline-block max-w-full">
            <img
              src={imageUrl}
              alt="Original photo"
              className="max-w-full h-auto max-h-[65vh] object-contain rounded-2xl shadow-sm block border border-[#e8e4db] dark:border-[#382f29] select-none"
            />

            {/* Pin Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredItems.map((item, index) => {
                const { top, left, width, height } = boxToPercent(item.box_2d);
                const isHovered = hoveredItem?.id === item.id;
                const isSelected = selectedItem?.id === item.id;
                const categoryStyle = CATEGORY_STYLES[item.category as OCRCategory] || CATEGORY_STYLES.item;

                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                    onMouseEnter={() => onHoverItem(item)}
                    onMouseLeave={() => onHoverItem(null)}
                    style={{ top, left, width, height }}
                    className={`absolute rounded-lg border transition-all cursor-pointer pointer-events-auto group ${
                      isSelected || isHovered
                        ? 'bg-white/35 dark:bg-black/35 border-[#8da384] dark:border-[#d48c46] ring-2 ring-[#8da384] dark:ring-[#d48c46] z-30 opacity-100'
                        : 'bg-black/5 dark:bg-white/5 border-white/60 dark:border-white/40 hover:border-[#8da384] dark:hover:border-[#d48c46] z-10'
                    }`}
                  >
                    <span
                      style={{ backgroundColor: categoryStyle.borderColor }}
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-md ring-1.5 ring-white/90 dark:ring-[#1a1513] pointer-events-none transition-all ${
                        isSelected || isHovered ? 'scale-125 ring-2 z-50' : 'scale-100 opacity-95 group-hover:scale-110 z-40'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Pane: Synchronized Parallel Translation Cards */}
        <div className="bg-[#fcfbf9] dark:bg-[#1a1513] p-4 overflow-y-auto space-y-3.5 max-h-[65vh] md:max-h-full">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-[#8a7f76] dark:text-[#9c938c] text-xs">
              目前無此類別的文字對照資料
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = selectedItem?.id === item.id;
              const isHovered = hoveredItem?.id === item.id;
              const isSaved = savedItemIds.has(item.id);
              const style = CATEGORY_STYLES[item.category as OCRCategory] || CATEGORY_STYLES.item;

              return (
                <div
                  key={item.id}
                  ref={(el) => (cardRefs.current[item.id] = el)}
                  onClick={() => onSelectItem(item)}
                  onMouseEnter={() => onHoverItem(item)}
                  onMouseLeave={() => onHoverItem(null)}
                  style={{ borderLeftColor: style.borderColor }}
                  className={`p-4 rounded-2xl border border-l-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#28211d] border-[#8da384] dark:border-[#d48c46] shadow-md ring-2 ring-[#8da384]/30 dark:ring-[#d48c46]/40 scale-[1.01]'
                      : isHovered
                      ? 'bg-white/90 dark:bg-[#241e1b] border-[#e8e4db] dark:border-[#382f29]'
                      : 'bg-white/70 dark:bg-[#201a17] border-[#e8e4db]/80 dark:border-[#382f29]/80 hover:border-[#8da384]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: style.borderColor }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-xs"
                      >
                        {index + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${style.badgeBg} ${style.badgeText} border`}>
                        {style.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(item.translation, targetLanguage);
                        }}
                        className="p-1 rounded-lg text-[#5a7051] dark:text-[#e5a86c] hover:bg-[#8da384]/20 dark:hover:bg-[#d48c46]/20 transition-colors"
                        title="朗讀譯文"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveToPocketbook(item);
                        }}
                        className={`p-1 rounded-lg transition-colors ${
                          isSaved ? 'text-[#c88d51]' : 'text-[#8a7f76] hover:text-[#4a3b32] dark:hover:text-[#e8e4db]'
                        }`}
                        title={isSaved ? '已在口袋書' : '加入口袋書'}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Parallel Original vs Translation Layout */}
                  <div className="space-y-1.5 mt-2">
                    <div className="bg-[#f5f3ef]/80 dark:bg-[#1a1513] p-2.5 rounded-xl border border-[#e8e4db] dark:border-[#382f29]">
                      <span className="text-[10px] font-bold text-[#8a7f76] dark:text-[#9c938c] block mb-0.5">照片原文：</span>
                      <p className="text-xs font-medium text-[#4a3b32] dark:text-[#e8e4db] leading-relaxed break-words">
                        {item.original}
                      </p>
                    </div>

                    <div className="bg-[#8da384]/10 dark:bg-[#d48c46]/15 p-2.5 rounded-xl border border-[#8da384]/30 dark:border-[#d48c46]/30">
                      <span className="text-[10px] font-extrabold text-[#748c69] dark:text-[#e5a86c] block mb-0.5">{targetLanguage} 譯文：</span>
                      <p className="text-xs sm:text-sm font-extrabold text-[#4a3b32] dark:text-[#e8e4db] leading-relaxed break-words">
                        {item.translation}
                      </p>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-2.5 pt-2 border-t border-[#e8e4db] dark:border-[#382f29] flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCulturalNote(item);
                      }}
                      className="text-[11px] font-bold text-[#748c69] dark:text-[#e5a86c] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>查看文化/過敏分析</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
