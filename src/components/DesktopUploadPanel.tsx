import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Compass,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Layers,
  Type,
} from 'lucide-react';
import { OCRItem, TranslationScene, SCENE_OPTIONS, SampleImage } from '../types';
import { SAMPLE_IMAGES } from '../data/samples';
import { ImageWithOverlay } from './ImageWithOverlay';

interface DesktopUploadPanelProps {
  imageUrl: string | null;
  ocrItems: OCRItem[];
  isProcessing: boolean;
  selectedItemId: string | null;
  selectedScene: TranslationScene;
  onImageSelected: (dataUrl: string, preset?: SampleImage) => void;
  onSceneChange: (scene: TranslationScene) => void;
  onSelectItem: (item: OCRItem | null) => void;
  onReset: () => void;
}

export const DesktopUploadPanel: React.FC<DesktopUploadPanelProps> = ({
  imageUrl,
  ocrItems,
  isProcessing,
  selectedItemId,
  selectedScene,
  onImageSelected,
  onSceneChange,
  onSelectItem,
  onReset,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewMode, setViewMode] = useState<'dots' | 'text'>('dots');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        onImageSelected(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        onImageSelected(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── 有圖片：顯示 ImageWithOverlay ─────────────────────────────────────
  if (imageUrl) {
    return (
      <div className="relative w-full overflow-hidden border border-[var(--text-main)]/10 bg-page h-[calc(100vh-108px)] flex flex-col">
        {/* 圖片 + AR 標注 */}
        <div className="flex-1 min-h-0 relative">
          <ImageWithOverlay
            imageUrl={imageUrl}
            items={ocrItems}
            selectedItemId={selectedItemId}
            onSelectItem={onSelectItem}
            heightClass="h-full"
            viewMode={viewMode}
          />

          {/* 處理中遮罩 */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-page)]/70 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-3">
                <Sparkles className="w-6 h-6 text-[var(--accent-red)] animate-pulse" />
                <span className="text-sm font-serif font-bold text-[var(--text-main)] tracking-widest">
                  解讀中…
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 底部置中懸浮列 (Proofreading Style) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[var(--bg-panel)]/90 backdrop-blur-md p-2 rounded-none border border-[var(--text-main)]/10 transition-all w-max max-w-[90%] shadow-sm">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-[var(--text-main)] hover:text-[var(--accent-red)] active:scale-95 transition-all whitespace-nowrap shrink-0"
            title="重新上傳圖片"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重新上傳</span>
          </button>

          {ocrItems.length > 0 && (
            <>
              {/* 分隔線 */}
              <div className="w-[1px] h-4 bg-[var(--text-main)]/20 mx-2 shrink-0" />
              
              {/* 顯示模式切換 */}
              <div className="flex items-center gap-3 px-2 shrink-0">
                <span className="text-[11px] font-bold text-[var(--text-main)]/60 tracking-widest whitespace-nowrap">
                  顯示
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('dots')}
                    className={`flex items-center gap-1 text-xs font-bold transition-all whitespace-nowrap ${
                      viewMode === 'dots'
                        ? 'text-[var(--text-main)] underline decoration-[1.5px] underline-offset-4 decoration-[var(--accent-red)]'
                        : 'text-[var(--text-main)]/50 hover:text-[var(--text-main)]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    對照
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('text')}
                    className={`flex items-center gap-1 text-xs font-bold transition-all whitespace-nowrap ${
                      viewMode === 'text'
                        ? 'text-[var(--text-main)] underline decoration-[1.5px] underline-offset-4 decoration-[var(--accent-red)]'
                        : 'text-[var(--text-main)]/50 hover:text-[var(--text-main)]'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    覆蓋
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── 無圖片：Dropzone + 場景選擇 + Sample Grid ─────────────────────────
  return (
    <div className="flex flex-col gap-8 py-2">
      {/* 場景選擇 */}
      <div className="border-b border-dashed border-[var(--text-main)]/20 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-serif font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[var(--accent-red)]" />
            場景預選
          </span>
          <span className="text-xs text-[var(--text-main)]/70 font-mono">
            已套用：「{SCENE_OPTIONS.find((s) => s.id === selectedScene)?.label}」
          </span>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
          {SCENE_OPTIONS.map((s) => {
            const isActive = selectedScene === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSceneChange(s.id)}
                title={s.desc}
                className={`text-[13px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  isActive
                    ? 'text-[var(--accent-red)] border-b border-[var(--accent-red)]'
                    : 'text-[var(--text-main)]/60 hover:text-[var(--text-main)]'
                }`}
              >
                {isActive && <span className="text-[10px] -ml-2 -mt-0.5 opacity-80">「</span>}
                {s.label}
                {isActive && <span className="text-[10px] -mr-2 -mt-0.5 opacity-80">」</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative border-[1.5px] border-dashed p-10 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-[var(--accent-red)] bg-[var(--accent-red)]/5 scale-[1.01]'
            : 'border-[var(--text-main)]/30 hover:border-[var(--text-main)] hover:bg-[var(--text-main)]/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className={`w-14 h-14 flex items-center justify-center mx-auto mb-4 transition-all ${
          isDragOver
            ? 'text-[var(--accent-red)] scale-110'
            : 'text-[var(--text-main)]/60 group-hover:scale-110 group-hover:text-[var(--text-main)]'
        }`}>
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-serif font-bold text-[var(--text-main)] mb-2">
          {isDragOver ? '放開以上傳' : '點擊或拖曳檔案至此處'}
        </h3>
        <p className="text-sm font-mono text-[var(--text-main)]/50 max-w-sm mx-auto mb-6">
          支援 JPG、PNG、WEBP 格式
        </p>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-6 py-2 border border-[var(--text-main)]/20 hover:border-[var(--text-main)] text-[var(--text-main)] font-bold text-sm bg-transparent transition-colors"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        >
          <ImageIcon className="w-4 h-4 text-[var(--text-main)]/60" />
          選擇檔案
        </button>
      </div>

      {/* Sample 圖片 Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--text-main)]/20 pb-2">
          <h3 className="text-sm font-serif font-bold text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2">
            <Compass className="w-4 h-4 text-[var(--text-main)]/60" />
            快速測試
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {SAMPLE_IMAGES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onImageSelected(sample.dataUrl, sample)}
              className="group border border-[var(--text-main)]/10 hover:border-[var(--text-main)]/50 p-4 flex flex-col justify-between cursor-pointer transition-all bg-[var(--bg-panel)]/30 hover:bg-[var(--bg-panel)]"
            >
              <div>
                <div className="aspect-[4/3] overflow-hidden bg-page mb-3 border border-[var(--text-main)]/10 relative">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 bg-[var(--bg-panel)]/90 px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-main)] border border-[var(--text-main)]/20 flex items-center gap-1 shadow-sm">
                    <span className="font-mono text-[var(--accent-red)]">「{sample.category}」</span>
                  </div>
                </div>
                <h4 className="text-[13px] font-serif font-bold text-[var(--text-main)] group-hover:text-[var(--accent-red)] transition-colors mb-1 leading-snug">
                  {sample.title}
                </h4>
                <p className="text-[11px] text-[var(--text-main)]/70 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[var(--text-main)]/10 flex items-center justify-between text-[11px] text-[var(--text-main)] font-bold group-hover:text-[var(--accent-red)] group-hover:translate-x-1 transition-all">
                <span className="underline decoration-[0.5px] underline-offset-2">載入</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
