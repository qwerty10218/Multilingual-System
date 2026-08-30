import React, { useState } from 'react';
import { OCRItem, SavedItem, TranslationScene, SampleImage } from '../types';
import { DesktopHeader } from './DesktopHeader';
import { DesktopUploadPanel } from './DesktopUploadPanel';
import { DesktopResultPanel } from './DesktopResultPanel';
import { PocketBookModal } from './PocketBookModal';
import { GeminiAssistantDrawer } from './GeminiAssistantDrawer';
import { CulturalModal } from './CulturalModal';

interface DesktopLayoutProps {
  // 核心狀態
  imageUrl: string | null;
  ocrItems: OCRItem[];
  isProcessing: boolean;
  errorMessage: string | null;
  selectedItem: OCRItem | null;
  savedItems: SavedItem[];
  savedItemIds: Set<string>;
  // 設定
  targetLanguage: string;
  selectedModel: string;
  selectedScene: TranslationScene;
  theme: 'light' | 'dark' | 'system';
  // Callbacks
  onImageSelected: (dataUrl: string, preset?: SampleImage) => void;
  onTargetLanguageChange: (lang: string) => void;
  onModelChange: (model: string) => void;
  onSceneChange: (scene: TranslationScene) => void;
  onThemeChange: (t: 'light' | 'dark' | 'system') => void;
  onSelectItem: (item: OCRItem | null) => void;
  onSaveToPocketbook: (item: OCRItem) => void;
  onRemoveSavedItem: (id: string) => void;
  onClearAllSaved: () => void;
  onReset: () => void;
  onOpenCulturalNote: (item: OCRItem) => void;
  onRequestOcr: () => void;
  culturalModalItem: OCRItem | null;
  onCloseCulturalModal: () => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  imageUrl,
  ocrItems,
  isProcessing,
  errorMessage,
  selectedItem,
  savedItems,
  savedItemIds,
  targetLanguage,
  selectedModel,
  selectedScene,
  theme,
  onImageSelected,
  onTargetLanguageChange,
  onModelChange,
  onSceneChange,
  onThemeChange,
  onSelectItem,
  onSaveToPocketbook,
  onRemoveSavedItem,
  onClearAllSaved,
  onReset,
  onOpenCulturalNote,
  onRequestOcr,
  culturalModalItem,
  onCloseCulturalModal,
}) => {
  const [isPocketbookOpen, setIsPocketbookOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-page">
      {/* ── 頂部導覽列 ── */}
      <DesktopHeader
        targetLanguage={targetLanguage}
        onTargetLanguageChange={onTargetLanguageChange}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        selectedScene={selectedScene}
        onSceneChange={onSceneChange}
        pocketCount={savedItems.length}
        onOpenPocketbook={() => setIsPocketbookOpen(true)}
        onOpenGeminiAssistant={() => setIsAssistantOpen(true)}
        onReset={onReset}
        isProcessing={isProcessing}
        theme={theme}
        onThemeChange={onThemeChange}
      />

      {/* ── 主內容區 ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {!imageUrl ? (
          /* 無圖片：單欄置中布局 */
          <div className="max-w-2xl mx-auto">
            <DesktopUploadPanel
              imageUrl={null}
              ocrItems={[]}
              isProcessing={isProcessing}
              selectedItemId={null}
              selectedScene={selectedScene}
              onImageSelected={onImageSelected}
              onSceneChange={onSceneChange}
              onSelectItem={onSelectItem}
              onReset={onReset}
            />
          </div>
        ) : (
          /* 有圖片：左右雙欄 */
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* 左欄：上傳 / 圖片預覽 */}
            <div className="col-span-7">
              <DesktopUploadPanel
                imageUrl={imageUrl}
                ocrItems={ocrItems}
                isProcessing={isProcessing}
                selectedItemId={selectedItem?.id ?? null}
                selectedScene={selectedScene}
                onImageSelected={onImageSelected}
                onSceneChange={onSceneChange}
                onSelectItem={onSelectItem}
                onReset={onReset}
              />

              {/* OCR 觸發按鈕（有圖但無結果時顯示） */}
              {!isProcessing && ocrItems.length === 0 && !errorMessage && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={onRequestOcr}
                    className="flex items-center gap-2 px-6 py-2.5 border border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[var(--accent-red)] hover:text-[var(--bg-page)] font-bold text-[13px] transition-colors"
                  >
                    <span>✨</span>
                    <span>開始解讀與校對</span>
                  </button>
                </div>
              )}
            </div>

            {/* 右欄：翻譯結果 */}
            <div className="col-span-5 sticky top-[76px] max-h-[calc(100vh-92px)] flex flex-col">
              <div className="bg-transparent border border-[var(--text-main)]/10 shadow-none p-4 flex flex-col" style={{ maxHeight: 'calc(100vh - 92px)' }}>
                {/* 面板標題列 */}
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <h2 className="text-sm font-serif font-bold text-[var(--text-main)] flex items-center gap-2">
                    <span>🌐</span>
                    翻譯結果
                    {ocrItems.length > 0 && (
                      <span className="text-[10px] font-mono text-[var(--text-main)]/70">
                        ({ocrItems.length} 筆)
                      </span>
                    )}
                  </h2>
                  <span className="text-xs font-mono text-[var(--text-main)]/70">
                    {targetLanguage}
                  </span>
                </div>

                {/* 結果面板主體 */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <DesktopResultPanel
                    items={ocrItems}
                    isProcessing={isProcessing}
                    errorMessage={errorMessage}
                    selectedItemId={selectedItem?.id ?? null}
                    savedItemIds={savedItemIds}
                    targetLanguage={targetLanguage}
                    onSelectItem={onSelectItem}
                    onSaveToPocketbook={onSaveToPocketbook}
                    onOpenCulturalNote={onOpenCulturalNote}
                    onRetry={onRequestOcr}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--text-main)]/10 bg-transparent py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between text-[10px] font-mono text-[var(--text-main)]/50">
          <p>
            多語系田野圖鑑校對系統
          </p>
          <p>
            Powered by Gemini 3.6
          </p>
        </div>
      </footer>

      {/* ── Overlay 元件 ── */}
      <PocketBookModal
        isOpen={isPocketbookOpen}
        onClose={() => setIsPocketbookOpen(false)}
        items={savedItems}
        onRemoveItem={onRemoveSavedItem}
        onClearAll={onClearAllSaved}
        targetLanguage={targetLanguage}
      />

      <GeminiAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        imageUrl={imageUrl}
        ocrItems={ocrItems}
        targetLanguage={targetLanguage}
      />

      <CulturalModal
        isOpen={!!culturalModalItem}
        onClose={onCloseCulturalModal}
        item={culturalModalItem}
        targetLanguage={targetLanguage}
      />
    </div>
  );
};
