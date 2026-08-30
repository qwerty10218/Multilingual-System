import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  FileDown,
  Braces,
  Loader2,
  AlertTriangle,
  RefreshCw,
  X,
} from 'lucide-react';
import { OCRItem, OCRCategory } from '../types';
import { TranslationCard } from './TranslationCard';
import { CATEGORY_STYLES } from '../utils/canvas';

interface DesktopResultPanelProps {
  items: OCRItem[];
  isProcessing: boolean;
  errorMessage: string | null;
  selectedItemId: string | null;
  savedItemIds: Set<string>;
  targetLanguage: string;
  onSelectItem: (item: OCRItem | null) => void;
  onSaveToPocketbook: (item: OCRItem) => void;
  onOpenCulturalNote: (item: OCRItem) => void;
  onRetry: () => void;
}

// All filterable categories
const CATEGORY_FILTER_OPTIONS: Array<{ value: OCRCategory | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'title', label: CATEGORY_STYLES.title.label },
  { value: 'item', label: CATEGORY_STYLES.item.label },
  { value: 'description', label: CATEGORY_STYLES.description.label },
  { value: 'notice', label: CATEGORY_STYLES.notice.label },
];

export const DesktopResultPanel: React.FC<DesktopResultPanelProps> = ({
  items,
  isProcessing,
  errorMessage,
  selectedItemId,
  savedItemIds,
  targetLanguage,
  onSelectItem,
  onSaveToPocketbook,
  onOpenCulturalNote,
  onRetry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<OCRCategory | 'all'>('all');
  const [copiedAll, setCopiedAll] = useState(false);

  // Ref map for scrolling highlighted card into view
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll selected card into view
  useEffect(() => {
    if (!selectedItemId) return;
    const el = cardRefs.current.get(selectedItemId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedItemId]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.original.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [items, searchQuery, categoryFilter]);

  // ── 複製全文字 ────────────────────────────────────────────────────────
  const handleCopyAll = () => {
    const text = items
      .map((item, idx) => `${idx + 1}. ${item.translation}\n   （${item.original}）`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // ── Markdown 匯出 ─────────────────────────────────────────────────────
  const handleExportMarkdown = () => {
    const md =
      `# 翻譯結果（${targetLanguage}）\n\n` +
      `> 匯出時間：${new Date().toLocaleString()}\n\n` +
      items
        .map(
          (item, idx) =>
            `## ${idx + 1}. ${item.translation}\n\n` +
            `**原文：** ${item.original}\n\n` +
            `**類別：** ${CATEGORY_STYLES[item.category]?.label || item.category}\n\n---\n`
        )
        .join('\n');
    downloadFile(md, `ocr_translation_${Date.now()}.md`, 'text/markdown;charset=utf-8');
  };


  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Empty / Loading / Error states ────────────────────────────────────
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <Loader2 className="w-8 h-8 text-[var(--accent-red)] animate-spin" />
        <p className="text-[13px] font-serif font-bold text-[var(--text-main)] tracking-widest">
          解讀中…
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col gap-3 p-4 border-l-2 border-[var(--accent-red)] bg-[var(--accent-red)]/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--accent-red)] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--accent-red)] mb-1">
              解讀發生錯誤
            </p>
            <p className="text-xs text-[var(--text-main)]/80 leading-relaxed break-words font-mono">
              {errorMessage}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="self-end flex items-center gap-1.5 px-3 py-1.5 border border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[var(--accent-red)] hover:text-[var(--bg-page)] text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          重新解讀
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center text-[var(--text-main)]/50">
        <Search className="w-8 h-8 opacity-50" />
        <p className="text-sm font-serif font-bold text-[var(--text-main)]/70 tracking-widest">
          尚無內容
        </p>
        <p className="text-xs font-mono">等待上傳圖片後解讀</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── 搜尋列 ── */}
      <div className="relative border-b border-[var(--text-main)]/10 pb-3 mb-2 shrink-0">
        <Search className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-main)]/50 pointer-events-none -mt-1.5" />
        <input
          type="text"
          placeholder="搜尋原文或譯文…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-7 pr-8 py-1.5 bg-transparent text-[13px] text-[var(--text-main)] placeholder-[var(--text-main)]/30 focus:outline-none focus:border-b focus:border-[var(--text-main)] transition-colors font-medium rounded-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-main)]/50 hover:text-[var(--text-main)] -mt-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── 類別過濾 tabs ── */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-3 shrink-0">
        {CATEGORY_FILTER_OPTIONS.map((opt) => {
          const isActive = categoryFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategoryFilter(opt.value as OCRCategory | 'all')}
              className={`text-[13px] font-bold whitespace-nowrap transition-colors flex items-center ${
                isActive
                  ? 'text-[var(--accent-red)]'
                  : 'text-[var(--text-main)]/50 hover:text-[var(--text-main)]'
              }`}
            >
              {isActive && <span className="text-[11px] opacity-80 -ml-1">「</span>}
              {opt.label}
              {opt.value !== 'all' && (
                <span className="ml-1 opacity-70 font-mono text-[11px]">
                  {items.filter((i) => i.category === opt.value).length}
                </span>
              )}
              {opt.value === 'all' && (
                <span className="ml-1 opacity-70 font-mono text-[11px]">{items.length}</span>
              )}
              {isActive && <span className="text-[11px] opacity-80">」</span>}
            </button>
          );
        })}
      </div>

      {/* ── 卡片列表 ── */}
      <div className="flex-1 overflow-y-auto space-y-0 min-h-0 -mx-4 px-4 scroll-smooth-ios">
        {filteredItems.length === 0 ? (
          <div className="py-10 text-center text-xs text-[var(--text-main)]/50 font-mono">
            沒有符合條件的結果
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) cardRefs.current.set(item.id, el);
                else cardRefs.current.delete(item.id);
              }}
            >
              <TranslationCard
                item={item}
                index={items.indexOf(item)} // keep original index for numbering
                targetLanguage={targetLanguage}
                isSaved={savedItemIds.has(item.id)}
                isHighlighted={selectedItemId === item.id}
                compact={true}
                onSelect={onSelectItem}
                onSaveToPocketbook={onSaveToPocketbook}
                onOpenCulturalNote={onOpenCulturalNote}
              />
            </div>
          ))
        )}
      </div>

      {/* ── 底部工具列 ── */}
      <div className="border-t border-[var(--text-main)]/10 py-3 flex items-center justify-between gap-2 shrink-0">
        <span className="text-[11px] font-mono text-[var(--text-main)]/50">
          共 {items.length} 筆項目
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-main)]/70 hover:text-[var(--text-main)] transition-colors"
          >
            {copiedAll ? (
              <Check className="w-3.5 h-3.5 text-[var(--accent-green)]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="underline decoration-[0.5px] underline-offset-2">{copiedAll ? '已複製' : '複製全文'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-main)]/70 hover:text-[var(--text-main)] transition-colors"
            title="匯出 Markdown 格式"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="underline decoration-[0.5px] underline-offset-2">MD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
