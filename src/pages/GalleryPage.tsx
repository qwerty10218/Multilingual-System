import React, { useRef, useState } from 'react';
import { Camera, ImageIcon, UploadCloud, RefreshCw, AlertTriangle, Loader2, ScanText, Layers, Type } from 'lucide-react';
import { ImageWithOverlay } from '../components/ImageWithOverlay';
import { TranslationCard } from '../components/TranslationCard';
import { OCRItem, SampleImage, TranslationScene, SCENE_OPTIONS } from '../types';
import { SAMPLE_IMAGES } from '../data/samples';

interface GalleryPageProps {
  imageUrl: string | null;
  ocrItems: OCRItem[];
  isProcessing: boolean;
  errorMessage: string | null;
  selectedItem: OCRItem | null;
  savedItemIds: Set<string>;
  targetLanguage: string;
  selectedScene: TranslationScene;
  onImageSelected: (dataUrl: string, preset?: SampleImage) => void;
  onOpenCamera: () => void;
  onSceneChange: (scene: TranslationScene) => void;
  onSelectItem: (item: OCRItem | null) => void;
  onSaveToPocketbook: (item: OCRItem) => void;
  onOpenCulturalNote: (item: OCRItem) => void;
  onRequestOcr: () => void;
  onReset: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  imageUrl,
  ocrItems,
  isProcessing,
  errorMessage,
  selectedItem,
  savedItemIds,
  targetLanguage,
  selectedScene,
  onImageSelected,
  onOpenCamera,
  onSceneChange,
  onSelectItem,
  onSaveToPocketbook,
  onOpenCulturalNote,
  onRequestOcr,
  onReset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [viewMode, setViewMode] = useState<'dots' | 'text'>('dots');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) onImageSelected(dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) onImageSelected(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectItem = (item: OCRItem) => {
    onSelectItem(item);
    // Scroll card into view
    setTimeout(() => {
      const el = cardRefs.current.get(item.id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleSampleClick = (sample: SampleImage) => {
    onImageSelected(sample.dataUrl, sample);
  };

  // ── No Image: Upload Screen ───────────────────────────────────────────────
  if (!imageUrl) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
          {/* Hero Header */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8da384]/15 text-[#5a7051] dark:bg-[#d48c46]/20 dark:text-[#e5a86c] border border-[#8da384]/30 dark:border-[#d48c46]/40">
              ✨ Gemini 3.6 多模態視覺
            </span>
            <h1 className="text-2xl font-black text-[#2d2319] dark:text-[#f0ece3] leading-tight">
              拍照即時翻譯<br />
              <span className="text-[#8da384] dark:text-[#d48c46]">菜單・路標・包裝</span>
            </h1>
            <p className="text-sm text-[#8a7f76] dark:text-[#9c938c]">
              上傳照片，AI 自動辨識並翻譯圖中所有文字
            </p>
          </div>

          {/* Upload Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-2xl border-2 border-dashed border-[#e8e4db] dark:border-[#382f29] bg-white dark:bg-[#28211d] p-6 space-y-4"
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#8da384]/10 dark:bg-[#d48c46]/15 flex items-center justify-center mb-1">
                <UploadCloud className="w-7 h-7 text-[#8da384] dark:text-[#d48c46]" />
              </div>
              <p className="text-sm font-bold text-[#2d2319] dark:text-[#f0ece3]">
                拖曳圖片到此處，或選擇方式上傳
              </p>
              <p className="text-xs text-[#8a7f76] dark:text-[#9c938c]">
                支援 JPG、PNG、WEBP 格式
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Camera Button */}
              <button
                type="button"
                onClick={onOpenCamera}
                className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 rounded-xl bg-[#2d2319] dark:bg-[#f0ece3] text-white dark:text-[#1a1513] text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4" />
                開啟相機
              </button>

              {/* Gallery Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 rounded-xl bg-[#8da384] dark:bg-[#d48c46] text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <ImageIcon className="w-4 h-4" />
                選擇相簿
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              aria-label="選擇圖片檔案"
            />
          </div>

          {/* Scene Chips */}
          <div>
            <p className="text-xs font-bold text-[#8a7f76] dark:text-[#9c938c] mb-2 px-0.5">
              翻譯場景
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {SCENE_OPTIONS.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => onSceneChange(scene.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors min-h-[36px] whitespace-nowrap ${
                    selectedScene === scene.id
                      ? 'bg-[#8da384] dark:bg-[#d48c46] text-white border-transparent shadow-sm'
                      : 'bg-white dark:bg-[#28211d] text-[#4a3b32] dark:text-[#e8e4db] border-[#e8e4db] dark:border-[#382f29]'
                  }`}
                >
                  {scene.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Grid */}
          <div>
            <p className="text-xs font-bold text-[#8a7f76] dark:text-[#9c938c] mb-2 px-0.5">
              快速體驗範例
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSampleClick(sample)}
                  className="group relative rounded-2xl overflow-hidden border border-[#e8e4db] dark:border-[#382f29] bg-white dark:bg-[#28211d] shadow-xs hover:shadow-md active:scale-95 transition-all text-left"
                >
                  <div className="aspect-video overflow-hidden bg-[#f5f3ef] dark:bg-[#1a1513]">
                    <img
                      src={sample.dataUrl}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-base leading-none">{sample.flag}</span>
                      <span className="text-[10px] font-bold text-[#8a7f76] dark:text-[#9c938c]">
                        {sample.category}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#2d2319] dark:text-[#f0ece3] leading-snug line-clamp-2">
                      {sample.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Has Image: Results Screen ─────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Image Preview with AR overlay */}
      <div className="relative shrink-0">
        <ImageWithOverlay
          imageUrl={imageUrl}
          items={ocrItems}
          selectedItemId={selectedItem?.id ?? null}
          onSelectItem={handleSelectItem}
          heightClass="h-[42vh]"
          viewMode={viewMode}
        />

        {/* 底部置中懸浮列 (Proofreading Style) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[var(--bg-panel)]/90 backdrop-blur-md p-2 rounded-none border border-[var(--text-main)]/10 transition-all w-max max-w-[90%] shadow-sm">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[var(--text-main)] hover:text-[var(--accent-red)] active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重新上傳
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

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-[var(--bg-page)]/70 flex flex-col items-center justify-center gap-3 backdrop-blur-sm z-40">
            <Loader2 className="w-8 h-8 text-[var(--accent-red)] animate-spin" />
            <p className="text-[var(--text-main)] text-sm font-bold tracking-widest font-serif">解讀中…</p>
          </div>
        )}
      </div>

      {/* Scene Chips — small */}
      <div className="shrink-0 px-4 py-2 border-b border-[var(--text-main)]/10 flex gap-4 overflow-x-auto scrollbar-none bg-page">
        {SCENE_OPTIONS.map((scene) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => onSceneChange(scene.id)}
            className={`shrink-0 flex items-center gap-1 py-1 text-[12px] font-bold transition-colors whitespace-nowrap ${
              selectedScene === scene.id
                ? 'text-[var(--accent-red)] border-b-2 border-[var(--accent-red)]'
                : 'text-[var(--text-main)]/50 hover:text-[var(--text-main)]'
            }`}
          >
            {scene.label}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="shrink-0 mx-3 mt-2 rounded-xl bg-[#fff0ed] dark:bg-[#3b1b14] border border-[#f4b8a9] dark:border-[#8c3820] p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#c84d31] dark:text-[#f2a594] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#c84d31] dark:text-[#f2a594] mb-1">辨識失敗</p>
            <p className="text-xs text-[#8a7f76] dark:text-[#9c938c] line-clamp-2">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={onRequestOcr}
            className="shrink-0 text-xs font-bold text-[#8da384] dark:text-[#d48c46] hover:underline min-h-[36px] px-1"
          >
            重試
          </button>
        </div>
      )}

      {/* Translation Cards List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {ocrItems.length === 0 && !isProcessing && !errorMessage && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
            <ScanText className="w-12 h-12 text-[#d8d2c6] dark:text-[#423730]" />
            <p className="text-sm font-bold text-[#4a3b32] dark:text-[#e8e4db]">尚未辨識</p>
            <p className="text-xs text-[#8a7f76] dark:text-[#9c938c]">點擊下方按鈕開始 AI OCR 翻譯</p>
            <button
              type="button"
              onClick={onRequestOcr}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8da384] dark:bg-[#d48c46] text-white text-sm font-bold rounded-xl shadow-sm min-h-[44px]"
            >
              <ScanText className="w-4 h-4" />
              開始辨識翻譯
            </button>
          </div>
        )}

        {ocrItems.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => {
              if (el) cardRefs.current.set(item.id, el);
              else cardRefs.current.delete(item.id);
            }}
          >
            <TranslationCard
              item={item}
              index={index}
              targetLanguage={targetLanguage}
              isSaved={savedItemIds.has(item.id)}
              isHighlighted={selectedItem?.id === item.id}
              onSelect={handleSelectItem}
              onSaveToPocketbook={onSaveToPocketbook}
              onOpenCulturalNote={onOpenCulturalNote}
            />
          </div>
        ))}
      </div>


    </div>
  );
};
