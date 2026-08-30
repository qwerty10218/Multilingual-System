import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Volume2, Bookmark, Sparkles } from 'lucide-react';
import { OCRItem } from '../types';
import { speakText, CATEGORY_STYLES } from '../utils/canvas';

interface TranslationCardProps {
  item: OCRItem;
  index: number;
  targetLanguage: string;
  isSaved: boolean;
  isHighlighted?: boolean;
  compact?: boolean;
  onSelect?: (item: OCRItem) => void;
  onSaveToPocketbook: (item: OCRItem) => void;
  onOpenCulturalNote: (item: OCRItem) => void;
}


export const TranslationCard: React.FC<TranslationCardProps> = ({
  item,
  index,
  targetLanguage,
  isSaved,
  isHighlighted = false,
  compact = false,
  onSelect,
  onSaveToPocketbook,
  onOpenCulturalNote,
}) => {
  const [expanded, setExpanded] = useState(false);
  const catLabel = CATEGORY_STYLES[item.category as keyof typeof CATEGORY_STYLES]?.label || '一般文字';

  const handleToggle = () => {
    setExpanded((prev) => !prev);
    onSelect?.(item);
  };

  return (
    <div
      className={`border-t border-[var(--text-main)]/10 bg-[var(--bg-panel)] transition-all ${
        isHighlighted ? 'ring-1 ring-[var(--text-main)]/20 -mx-2 px-2' : ''
      }`}
    >
      {/* Collapsed Row */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-start gap-4 text-left ${compact ? 'py-3' : 'py-4'}`}
      >
        {/* Proofreading mark style numbered badge */}
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-serif shrink-0 mt-0.5 border border-[var(--accent-red)] bg-transparent ${
            isHighlighted 
              ? 'text-[var(--accent-red)] font-bold border-2' 
              : 'text-[var(--accent-red)] border-[1.5px]'
          }`}
          style={{ transform: `rotate(${Math.sin(index) * -15}deg)` }}
        >
          {index + 1}
        </span>

        {/* Text Block */}
        <div className="flex-1 min-w-0">
          {/* Translation — Sans-serif for body text */}
          <p className={`font-sans font-bold text-[var(--text-main)] leading-snug break-words ${compact ? 'text-[15px]' : 'text-lg'}`}>
            {item.translation}
          </p>
          {/* Original — Monospace */}
          <p className={`font-mono text-[var(--text-main)]/80 leading-relaxed mt-1.5 break-words ${compact ? 'text-[13px]' : 'text-[15px]'}`}>
            {item.original}
          </p>
        </div>

        {/* Category Label + Toggle Icon */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          <span className="text-[11px] font-bold text-[var(--text-main)] hidden sm:inline-flex">
            「{catLabel}」
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-main)]/50" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-main)]/50" />
          )}
        </div>
      </button>

      {/* Expanded Action Row */}
      {expanded && (
        <div className={`border-t border-dashed border-[var(--text-main)]/10 ${compact ? 'py-2.5 mb-2' : 'py-3 mb-2'} flex flex-wrap items-center gap-3`}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); speakText(item.original, item.sourceLanguage); }}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-main)] hover:text-[var(--accent-blue)] transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="underline decoration-[0.5px] underline-offset-2">唸原文</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); speakText(item.translation, targetLanguage); }}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-main)] hover:text-[var(--accent-red)] transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="underline decoration-[0.5px] underline-offset-2">唸譯文</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenCulturalNote(item); }}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-main)] hover:text-[var(--accent-green)] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="underline decoration-[0.5px] underline-offset-2">文化指南</span>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSaveToPocketbook(item); }}
            className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ml-auto ${
              isSaved
                ? 'text-[var(--accent-red)]'
                : 'text-[var(--text-main)] hover:opacity-70'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            <span className={isSaved ? '' : 'underline decoration-[0.5px] underline-offset-2'}>
              {isSaved ? '已收錄' : '存口袋書'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
