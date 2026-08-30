import React from 'react';
import { OCRItem, OCRCategory } from '../types';
import { boxToPercent, CATEGORY_STYLES } from '../utils/canvas';

interface ImageWithOverlayProps {
  imageUrl: string;
  items: OCRItem[];
  selectedItemId?: string | null;
  onSelectItem: (item: OCRItem) => void;
  /** Optional height class, e.g. 'h-[45vh]' or 'max-h-[70vh]' */
  heightClass?: string;
  viewMode?: 'dots' | 'text';
}

export const ImageWithOverlay: React.FC<ImageWithOverlayProps> = ({
  imageUrl,
  items,
  selectedItemId,
  onSelectItem,
  heightClass = 'h-[45vh]',
  viewMode = 'dots',
}) => {
  return (
    <div className={`relative w-full ${heightClass} bg-page overflow-hidden`}>
      {/* Base image — fills the box, object-contain */}
      <img
        src={imageUrl}
        alt="辨識原圖"
        className="w-full h-full object-contain select-none"
        draggable={false}
      />

      {/* AR Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {items.map((item, index) => {
          const { top, left, width, height } = boxToPercent(item.box_2d);
          const isSelected = selectedItemId === item.id;

          if (viewMode === 'text') {
            // Text Replacement Mode — solid dark overlay, large white text
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
                style={{ top, left, width, height }}
                className={`absolute transition-all cursor-pointer pointer-events-auto overflow-hidden ${
                  isSelected ? 'z-20 ring-2 ring-yellow-400 shadow-lg' : 'z-10'
                }`}
              >
                {/* Solid dark background for maximum readability */}
                <div className="absolute inset-0 bg-black/85" />

                {/* Translation text — fill the entire box */}
                <div className="relative z-10 w-full h-full flex items-center justify-center p-1">
                  <span
                    className="text-white font-sans font-bold text-center leading-tight drop-shadow-md"
                    style={{ fontSize: 'clamp(10px, 3vw, 15px)' }}
                  >
                    {item.translation}
                  </span>
                </div>
              </div>
            );
          }

          // Dots Mode (Default) — badge sits INSIDE the box, vertically centered on the left edge
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item);
              }}
              style={{ top, left, width, height }}
              className={`absolute border transition-all cursor-pointer pointer-events-auto ${
                isSelected
                  ? 'border-[var(--accent-red)] z-20 bg-[var(--accent-red)]/10'
                  : 'border-[var(--accent-red)]/40 hover:border-[var(--accent-red)]/80 z-10'
              }`}
            >
              {/* Numbered badge — centered vertically on the left edge, INSIDE the box */}
              <span
                className={`absolute left-1 top-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-sans font-bold shadow-md ${
                  isSelected 
                    ? 'text-white bg-[var(--accent-red)] scale-110' 
                    : 'text-white bg-[var(--accent-red)]/80'
                }`}
              >
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
