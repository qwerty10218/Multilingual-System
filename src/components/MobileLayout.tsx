import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { BottomTabBar, TabId } from './BottomTabBar';
import { GalleryPage } from '../pages/GalleryPage';
import { CameraPage } from '../pages/CameraPage';
import { PocketbookPage } from '../pages/PocketbookPage';
import { AssistantPage } from '../pages/AssistantPage';
import { CulturalModal } from './CulturalModal';
import { OCRItem, SavedItem, SampleImage, TranslationScene } from '../types';

interface MobileLayoutProps {
  imageUrl: string | null;
  ocrItems: OCRItem[];
  isProcessing: boolean;
  errorMessage: string | null;
  selectedItem: OCRItem | null;
  savedItems: SavedItem[];
  savedItemIds: Set<string>;
  culturalModalItem: OCRItem | null;
  targetLanguage: string;
  selectedModel: string;
  selectedScene: TranslationScene;
  theme: 'light' | 'dark' | 'system';
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
  onCloseCulturalModal: () => void;
  onRequestOcr: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  imageUrl,
  ocrItems,
  isProcessing,
  errorMessage,
  selectedItem,
  savedItems,
  savedItemIds,
  culturalModalItem,
  targetLanguage,
  selectedScene,
  theme,
  onImageSelected,
  onTargetLanguageChange,
  onSceneChange,
  onThemeChange,
  onSelectItem,
  onSaveToPocketbook,
  onRemoveSavedItem,
  onClearAllSaved,
  onReset,
  onOpenCulturalNote,
  onCloseCulturalModal,
  onRequestOcr,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('gallery');

  const handleTabChange = (tab: TabId) => {
    // When there's an image loaded, camera tab becomes back button
    if (tab === 'camera' && imageUrl) {
      setActiveTab('gallery');
    } else {
      setActiveTab(tab);
    }
  };

  const handleOpenCamera = () => setActiveTab('camera');

  const handleCapture = (dataUrl: string) => {
    onImageSelected(dataUrl);
    setActiveTab('gallery');
  };

  const handleBack = () => setActiveTab('gallery');

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-page">
      <TopBar
        targetLanguage={targetLanguage}
        onTargetLanguageChange={onTargetLanguageChange}
        theme={theme}
        onThemeChange={onThemeChange}
        isProcessing={isProcessing}
      />

      {/* relative so the FAB's absolute positioning works */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'gallery' && (
          <GalleryPage
            imageUrl={imageUrl}
            ocrItems={ocrItems}
            isProcessing={isProcessing}
            errorMessage={errorMessage}
            selectedItem={selectedItem}
            savedItemIds={savedItemIds}
            targetLanguage={targetLanguage}
            selectedScene={selectedScene}
            onImageSelected={onImageSelected}
            onOpenCamera={handleOpenCamera}
            onSceneChange={onSceneChange}
            onSelectItem={onSelectItem}
            onSaveToPocketbook={onSaveToPocketbook}
            onOpenCulturalNote={onOpenCulturalNote}
            onRequestOcr={onRequestOcr}
            onReset={onReset}
          />
        )}

        {activeTab === 'camera' && (
          <CameraPage onCapture={handleCapture} onBack={handleBack} />
        )}

        {activeTab === 'pocketbook' && (
          <PocketbookPage
            items={savedItems}
            targetLanguage={targetLanguage}
            onRemoveItem={onRemoveSavedItem}
            onClearAll={onClearAllSaved}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantPage
            imageUrl={imageUrl}
            ocrItems={ocrItems}
            targetLanguage={targetLanguage}
          />
        )}
      </main>

      <BottomTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pocketCount={savedItems.length}
        hasImage={!!imageUrl}
      />

      {/* Cultural Modal — shared across all tabs */}
      <CulturalModal
        isOpen={!!culturalModalItem}
        onClose={onCloseCulturalModal}
        item={culturalModalItem}
        targetLanguage={targetLanguage}
      />
    </div>
  );
};
