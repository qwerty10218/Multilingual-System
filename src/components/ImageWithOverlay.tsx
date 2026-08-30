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
            // Text Replacement Mode - Minimalist highlight
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
                style={{ top, left, width, height }}
                className={`absolute transition-all cursor-pointer pointer-events-auto flex items-center justify-center overflow-hidden p-1 bg-[var(--bg-panel)]/95 backdrop-blur-md border-l-2 border-[var(--accent-red)] ${
                  isSelected ? 'z-20 scale-[1.02] shadow-sm' : 'z-10'
                }`}
              >
                <span className="text-[var(--text-main)] font-sans font-bold text-center leading-tight flex items-center justify-center w-full h-full" style={{ fontSize: 'min(14px, max(11px, 2.5cqi))', containerType: 'inline-size' }}>
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
                className={`absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-serif transition-transform border border-[var(--accent-red)] bg-transparent ${
                  isSelected 
                    ? 'scale-125 text-[var(--accent-red)] font-bold border-2' 
                    : 'text-[var(--accent-red)] border-[1.5px]'
                }`}
                style={{ transform: `rotate(${Math.sin(index) * 15}deg)` }} // Slight random rotation for hand-drawn feel
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
