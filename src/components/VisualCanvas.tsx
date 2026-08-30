import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Volume2,
  Bookmark,
  Sparkles,
  Eye,
  X,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { OCRItem, ViewMode, OCRCategory } from '../types';
import { boxToPercent, CATEGORY_STYLES, speakText } from '../utils/canvas';

interface VisualCanvasProps {
  imageUrl: string;
  items: OCRItem[];
  selectedItem: OCRItem | null;
  onSelectItem: (item: OCRItem | null) => void;
  hoveredItem: OCRItem | null;
  onHoverItem: (item: OCRItem | null) => void;
  viewMode: ViewMode;
  targetLanguage: string;
  onOpenCulturalNote: (item: OCRItem) => void;
  onSaveToPocketbook: (item: OCRItem) => void;
  savedItemIds: Set<string>;
  activeCategoryFilter: string;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  imageUrl,
  items,
  selectedItem,
  onSelectItem,
  hoveredItem,
  onHoverItem,
  viewMode,
  targetLanguage,
  onOpenCulturalNote,
  onSaveToPocketbook,
  savedItemIds,
  activeCategoryFilter,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [hideAllOverlays, setHideAllOverlays] = useState<boolean>(false);
  const [arBgOpacity, setArBgOpacity] = useState<number>(0.85);
  const [showOriginalInAr, setShowOriginalInAr] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter items by category
  const filteredItems = items.filter((item) => {
    if (activeCategoryFilter === 'all') return true;
    return item.category === activeCategoryFilter;
  });

  return (
    <div className="relative bg-white/60 dark:bg-[#28211d]/90 border border-[#e8e4db] dark:border-[#382f29] rounded-3xl overflow-hidden shadow-xs flex flex-col h-full min-h-[520px] transition-colors">
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-[#f5f3ef]/90 dark:bg-[#1a1513]/90 border-b border-[#e8e4db] dark:border-[#382f29] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8a7f76] dark:text-[#9c938c] z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#4a3b32] dark:text-[#e8e4db] flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#748c69] dark:text-[#d48c46]" />
            <span>原圖照片辨識 ({filteredItems.length} 區)</span>
          </span>
          <span className="text-[#e8e4db] dark:text-[#382f29]">•</span>
          <span className="text-[#8a7f76] dark:text-[#9c938c] font-medium">
            {viewMode === 'inspector'
              ? '原圖無遮擋標註 (點擊對照)'
              : viewMode === 'split'
              ? '獨立點陣對照'
              : 'AR 實境譯文覆蓋'}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* AR Mode Special Controls */}
          {viewMode === 'ar' && (
            <>
              {/* Opacity Slider */}
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-[#28211d] px-2.5 py-1 rounded-xl border border-[#e8e4db] dark:border-[#382f29] text-[11px]">
                <span className="font-bold text-[#4a3b32] dark:text-[#e8e4db]">透明度:</span>
                <input
                  type="range"
                  min="0.2"
                  max="0.98"
                  step="0.05"
                  value={arBgOpacity}
                  onChange={(e) => setArBgOpacity(parseFloat(e.target.value))}
                  className="w-16 accent-[#8da384] dark:accent-[#d48c46] cursor-pointer"
                  title="調整 AR 卡片背景透明度"
                />
              </div>

              {/* Flip Text Button */}
              <button
                onClick={() => setShowOriginalInAr((prev) => !prev)}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/80 dark:bg-[#28211d] text-[#4a3b32] dark:text-[#e8e4db] border border-[#e8e4db] dark:border-[#382f29] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] transition-colors"
                title="切換顯示原文或譯文"
              >
                <span>{showOriginalInAr ? '顯示譯文' : '切換原文'}</span>
              </button>
            </>
          )}

          {/* Quick Toggle Pure Original Photo View */}
          <button
            onClick={() => setHideAllOverlays((h) => !h)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              hideAllOverlays
                ? 'bg-[#c88d51]/20 text-[#a86522] dark:text-[#e5a86c] border-[#c88d51]/40'
                : 'bg-white/80 dark:bg-[#28211d] text-[#4a3b32] dark:text-[#e8e4db] border-[#e8e4db] dark:border-[#382f29]'
            }`}
            title="暫時隱藏所有標籤，查看純淨原圖"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#c88d51] dark:text-[#e5a86c]" />
            <span>{hideAllOverlays ? '顯示地標針' : '隱藏標籤看原圖'}</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-white/80 dark:bg-[#241e1b] rounded-xl p-1 border border-[#e8e4db] dark:border-[#382f29]">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1 text-[#4a3b32] dark:text-[#e8e4db] hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[10px] text-[#8a7f76] dark:text-[#9c938c] font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-1 text-[#4a3b32] dark:text-[#e8e4db] hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
              title="縮小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 text-[#4a3b32] dark:text-[#e8e4db] hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
              title="重設縮放"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-[#f0ede6] dark:bg-[#171311] p-4 sm:p-6 flex items-center justify-center min-h-[460px]"
        onClick={() => onSelectItem(null)}
      >
        <div
          className="relative inline-block transition-transform duration-200 ease-out max-w-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          {/* Base Original Image - Pure and Clear */}
          <img
            src={imageUrl}
            alt="Source original photo"
            className="max-w-full h-auto max-h-[72vh] object-contain rounded-2xl shadow-sm block border border-[#e8e4db] dark:border-[#382f29] select-none"
          />

          {/* OVERLAY LAYER (Only rendered if hideAllOverlays is false) */}
          {!hideAllOverlays && (
            <div className="absolute inset-0 pointer-events-none">
              {filteredItems.map((item, index) => {
                const { top, left, width, height } = boxToPercent(item.box_2d);
                const isHovered = hoveredItem?.id === item.id;
                const isSelected = selectedItem?.id === item.id;
                const categoryStyle = CATEGORY_STYLES[item.category as OCRCategory] || CATEGORY_STYLES.item;

                // 1. INSPECTOR & SPLIT MODE - MINIMALIST PINPOINT TAGS
                if (viewMode === 'inspector' || viewMode === 'split') {
                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      onMouseEnter={() => onHoverItem(item)}
                      onMouseLeave={() => onHoverItem(null)}
                      style={{
                        top,
                        left,
                        width,
                        height,
                      }}
                      className={`absolute rounded-lg border transition-all cursor-pointer pointer-events-auto group ${
                        isSelected || isHovered
                          ? 'bg-white/35 dark:bg-black/35 border-[#8da384] dark:border-[#d48c46] ring-2 ring-[#8da384] dark:ring-[#d48c46] z-30 opacity-100'
                          : 'bg-black/5 dark:bg-white/5 border-white/60 dark:border-white/40 hover:border-[#8da384] dark:hover:border-[#d48c46] z-10'
                      }`}
                    >
                      {/* Minimalist Pinpoint Badge Circle */}
                      <span
                        style={{ backgroundColor: categoryStyle.borderColor }}
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-md ring-1.5 ring-white/90 dark:ring-[#1a1513] pointer-events-none transition-all ${
                          isSelected || isHovered ? 'scale-125 ring-2 z-50' : 'scale-100 opacity-95 group-hover:scale-110 z-40'
                        }`}
                      >
                        {index + 1}
                      </span>

                      {/* Tooltip on Hover */}
                      {isHovered && !isSelected && (
                        <div className="absolute left-0 top-full mt-2 bg-[#fcfbf9] dark:bg-[#231c19] border border-[#e8e4db] dark:border-[#382f29] text-[#4a3b32] dark:text-[#e8e4db] rounded-2xl p-3 shadow-lg text-xs w-64 z-50 pointer-events-none animate-in fade-in slide-in-from-top-1">
                          <p className="text-[10px] font-bold text-[#8a7f76] dark:text-[#9c938c] line-clamp-1">
                            原文: {item.original}
                          </p>
                          <p className="text-xs font-extrabold text-[#748c69] dark:text-[#e5a86c] mt-0.5">
                            譯文: {item.translation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }

                // 2. AR DIRECT OVERLAY MODE - BLOCK LAYOUT WITHOUT SQUEEZING FLEX
                const displayText = showOriginalInAr ? item.original : item.translation;

                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(item);
                    }}
                    onMouseEnter={() => onHoverItem(item)}
                    onMouseLeave={() => onHoverItem(null)}
                    style={{
                      top,
                      left,
                      width,
                      height,
                      backgroundColor: `rgba(26, 21, 19, ${arBgOpacity})`,
                      borderColor: categoryStyle.borderColor,
                      containerType: 'size',
                    }}
                    className={`absolute rounded-md border backdrop-blur-xs transition-all cursor-pointer p-1 sm:p-1.5 overflow-hidden break-words pointer-events-auto block shadow-xs ${
                      isSelected || isHovered
                        ? 'ring-2 ring-[#8da384] dark:ring-[#d48c46] z-30 opacity-100 border-[#8da384]'
                        : 'z-10 hover:border-white opacity-95'
                    }`}
                  >
                    <p
                      style={{
                        fontSize: 'clamp(10px, 1.2cqw + 0.5vh, 16px)',
                        lineHeight: '1.2',
                        wordBreak: 'break-all',
                        overflowWrap: 'anywhere',
                      }}
                      className="font-extrabold text-[#e8e4db] text-center w-full h-full overflow-hidden flex items-center justify-center"
                    >
                      <span className="line-clamp-2 leading-tight block w-full overflow-hidden">
                        {displayText}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FLOATING INTERACTIVE JOURNAL POPUP CARD FOR SELECTED ITEM */}
      {selectedItem && (
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-md bg-[#fcfbf9]/95 dark:bg-[#231c19]/95 backdrop-blur-md border border-[#e8e4db] dark:border-[#382f29] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_10px_40px_rgba(74,59,50,0.12)] dark:shadow-2xl z-40 max-h-[35vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between gap-3 mb-2 sm:mb-2.5 sticky top-0 bg-[#fcfbf9]/95 dark:bg-[#231c19]/95 py-0.5 z-10">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${CATEGORY_STYLES[selectedItem.category]?.badgeBg} ${CATEGORY_STYLES[selectedItem.category]?.badgeText} border`}>
                {CATEGORY_STYLES[selectedItem.category]?.label}
              </span>
            </div>
            <button
              onClick={() => onSelectItem(null)}
              className="text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="關閉卡片"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-3.5">
            <div>
              <p className="text-[10px] font-bold text-[#8a7f76] dark:text-[#9c938c] mb-0.5">照片原文：</p>
              <p className="text-xs font-semibold text-[#4a3b32] dark:text-[#e8e4db] bg-white dark:bg-[#1a1513] p-2 sm:p-2.5 rounded-xl border border-[#e8e4db] dark:border-[#382f29]">
                {selectedItem.original}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#748c69] dark:text-[#e5a86c] mb-0.5">{targetLanguage} 譯文：</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#4a3b32] dark:text-[#e8e4db] bg-[#8da384]/10 dark:bg-[#d48c46]/15 p-2.5 sm:p-3 rounded-xl border border-[#8da384]/30 dark:border-[#d48c46]/30">
                {selectedItem.translation}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t border-[#e8e4db] dark:border-[#382f29]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => speakText(selectedItem.original)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-white dark:bg-[#28211d] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] text-[#4a3b32] dark:text-[#e8e4db] text-xs font-bold rounded-xl border border-[#e8e4db] dark:border-[#382f29] transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#8a7f76] dark:text-[#9c938c]" />
                <span>唸原文</span>
              </button>

              <button
                onClick={() => speakText(selectedItem.translation, targetLanguage)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-white dark:bg-[#28211d] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] text-[#4a3b32] dark:text-[#e8e4db] text-xs font-bold rounded-xl border border-[#e8e4db] dark:border-[#382f29] transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#748c69] dark:text-[#e5a86c]" />
                <span>唸譯文</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenCulturalNote(selectedItem)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-[#8da384]/15 dark:bg-[#d48c46]/20 hover:bg-[#8da384]/25 dark:hover:bg-[#d48c46]/30 text-[#5a7051] dark:text-[#e5a86c] text-xs font-bold rounded-xl border border-[#8da384]/30 dark:border-[#d48c46]/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#748c69] dark:text-[#e5a86c]" />
                <span>文化指南</span>
              </button>

              <button
                onClick={() => onSaveToPocketbook(selectedItem)}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-bold rounded-xl border transition-colors ${
                  savedItemIds.has(selectedItem.id)
                    ? 'bg-[#c88d51]/20 text-[#a86522] dark:text-[#e5a86c] border-[#c88d51]/40'
                    : 'bg-white dark:bg-[#28211d] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] text-[#4a3b32] dark:text-[#e8e4db] border-[#e8e4db] dark:border-[#382f29]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#c88d51] dark:text-[#e5a86c]" />
                <span>{savedItemIds.has(selectedItem.id) ? '已收錄' : '存口袋書'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

