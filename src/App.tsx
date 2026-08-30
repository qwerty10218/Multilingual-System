import React, { useState, useEffect, useCallback } from 'react';
import { useBreakpoint } from './hooks/useBreakpoint';
import { OCRItem, SavedItem, SampleImage, TranslationScene } from './types';
import { ensureRasterImageDataUrl } from './utils/image';
import { PWAInstallBanner } from './components/PWAInstallBanner';

// Lazy-loaded layout components (split bundle for faster initial load)
import { MobileLayout } from './components/MobileLayout';
import { DesktopLayout } from './components/DesktopLayout';

export type AppTheme = 'light' | 'dark' | 'system';

export default function App() {
  // ─── Theme ────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<AppTheme>(() => {
    try { return (localStorage.getItem('app_theme_v1') as AppTheme) || 'light'; }
    catch { return 'light'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.remove('dark');
    else {
      const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (sys) root.classList.add('dark'); else root.classList.remove('dark');
    }
    try { localStorage.setItem('app_theme_v1', theme); } catch { /* noop */ }
  }, [theme]);

  // ─── App state ────────────────────────────────────────────────────────────
  const [targetLanguage, setTargetLanguage] = useState<string>('繁體中文');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');
  const [selectedScene, setSelectedScene] = useState<TranslationScene>('auto');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrItems, setOcrItems] = useState<OCRItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<OCRItem | null>(null);
  const [culturalModalItem, setCulturalModalItem] = useState<OCRItem | null>(null);
  const [customNote, setCustomNote] = useState<string>('');

  // ─── Pocketbook (persisted) ────────────────────────────────────────────────
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const s = localStorage.getItem('ocr_pocketbook_v1');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('ocr_pocketbook_v1', JSON.stringify(savedItems)); }
    catch { /* noop */ }
  }, [savedItems]);

  const savedItemIds = new Set(savedItems.map((s) => s.id));

  // ─── OCR / Translation API ────────────────────────────────────────────────
  const requestServerOcr = useCallback(async (
    dataUrl: string,
    lang: string = targetLanguage,
    note: string = customNote,
    sceneMode: TranslationScene = selectedScene,
    modelName: string = selectedModel
  ) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ocr-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          targetLanguage: lang,
          customNote: note,
          scene: sceneMode,
          model: modelName,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOcrItems(data.items || []);
        if ((data.items?.length ?? 0) === 0) {
          setErrorMessage('圖片中未辨識出明顯文字區域，請嘗試上傳清晰的照片。');
        }
      } else {
        setErrorMessage(data.error || 'OCR 辨識失敗，請稍後重試。');
      }
    } catch {
      setErrorMessage('無法連線至 AI 伺服器，請確認網路或 GEMINI_API_KEY 設定。');
    } finally {
      setIsProcessing(false);
    }
  }, [targetLanguage, customNote, selectedScene, selectedModel]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleImageSelected = async (dataUrl: string, preset?: SampleImage) => {
    const rasterUrl = await ensureRasterImageDataUrl(dataUrl);
    setImageUrl(rasterUrl);
    setSelectedItem(null);
    setErrorMessage(null);

    if (preset?.presetItems && targetLanguage === '繁體中文' && !customNote && selectedScene === 'auto') {
      setOcrItems(preset.presetItems);
      return;
    }
    await requestServerOcr(rasterUrl);
  };

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    if (imageUrl) requestServerOcr(imageUrl, targetLanguage, customNote, selectedScene, newModel);
  };

  const handleTargetLanguageChange = (newLang: string) => {
    setTargetLanguage(newLang);
    if (imageUrl) requestServerOcr(imageUrl, newLang, customNote, selectedScene, selectedModel);
  };

  const handleSceneChange = (newScene: TranslationScene) => {
    setSelectedScene(newScene);
    if (imageUrl) requestServerOcr(imageUrl, targetLanguage, customNote, newScene, selectedModel);
  };

  const handleSaveToPocketbook = (item: OCRItem) => {
    if (savedItems.some((s) => s.id === item.id)) return;
    setSavedItems((prev) => [{
      id: item.id,
      original: item.original,
      translation: item.translation,
      category: item.category,
      savedAt: Date.now(),
    }, ...prev]);
  };

  const handleRemoveSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((s) => s.id !== id));
  };

  const handleReset = () => {
    setImageUrl(null);
    setOcrItems([]);
    setSelectedItem(null);
    setErrorMessage(null);
    setCustomNote('');
  };

  // ─── Breakpoint & Layout Switch ───────────────────────────────────────────
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile' || breakpoint === 'tablet';

  // Shared props for both layouts
  const sharedProps = {
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
    culturalModalItem,
    onImageSelected: handleImageSelected,
    onTargetLanguageChange: handleTargetLanguageChange,
    onModelChange: handleModelChange,
    onSceneChange: handleSceneChange,
    onThemeChange: setTheme,
    onSelectItem: setSelectedItem,
    onSaveToPocketbook: handleSaveToPocketbook,
    onRemoveSavedItem: handleRemoveSavedItem,
    onClearAllSaved: () => setSavedItems([]),
    onReset: handleReset,
    onOpenCulturalNote: setCulturalModalItem,
    onCloseCulturalModal: () => setCulturalModalItem(null),
    onRequestOcr: () => imageUrl && requestServerOcr(imageUrl),
  };

  return (
    <>
      {isMobile ? (
        <MobileLayout {...sharedProps} />
      ) : (
        <DesktopLayout {...sharedProps} />
      )}
      <PWAInstallBanner />
    </>
  );
}
