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
            // Text Replacement Mode — dark semi-transparent overlay with white text
            const style = CATEGORY_STYLES[item.category as OCRCategory] || CATEGORY_STYLES.item;
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
                style={{ top, left, width, height }}
                className={`absolute transition-all cursor-pointer pointer-events-auto flex items-center justify-center overflow-hidden ${
                  isSelected ? 'z-20 ring-2 ring-white/80 shadow-lg' : 'z-10'
                }`}
              >
                {/* Dark overlay background */}
                <div className="absolute inset-0 bg-black/70" />

                {/* Numbered badge — top-left corner */}
                <span
                  className="absolute top-0.5 left-0.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-sans font-bold text-white z-10"
                  style={{ backgroundColor: style.borderColor }}
                >
                  {index + 1}
                </span>

                {/* Translation text */}
                <span
                  className="relative z-10 text-white font-sans font-bold text-center leading-snug px-1 drop-shadow-sm"
                  style={{ fontSize: `clamp(9px, ${Math.min(parseFloat(height), parseFloat(width)) * 0.35}vw, 14px)` }}
                >
                  {item.translation}
                </span>
              </div>
            );
          }

          // Dots Mode (Default)
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item);
              }}
              style={{ top, left, width, height }}
              className={`absolute border transition-all cursor-pointer pointer-events-auto flex items-center justify-center ${
                isSelected
                  ? 'border-[var(--accent-red)] z-20 bg-[var(--accent-red)]/10'
                  : 'border-[var(--accent-red)]/40 hover:border-[var(--accent-red)]/80 z-10'
              }`}
            >
              {/* Proofreading mark style numbered badge */}
              <span
                className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-sans font-bold transition-transform border-[1.5px] border-[var(--accent-red)] ${
                  isSelected 
                    ? 'scale-125 text-white bg-[var(--accent-red)] z-30 shadow-md' 
                    : 'text-[var(--accent-red)] bg-page z-20 shadow-sm'
                }`}
                style={{ transform: `rotate(${Math.sin(index) * 15}deg)` }}
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
