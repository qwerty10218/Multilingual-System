import React from 'react';
import { Camera, Languages, Sparkles, Bookmark, Eye, Columns3, Layers, RefreshCw, Bot, Sun, Moon, Monitor } from 'lucide-react';
import { TARGET_LANGUAGES } from '../data/samples';
import { ViewMode } from '../types';

export type AppTheme = 'light' | 'dark' | 'system';

interface HeaderProps {
  targetLanguage: string;
  onTargetLanguageChange: (lang: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  pocketCount: number;
  onOpenPocketbook: () => void;
  onOpenGeminiAssistant: () => void;
  onReset: () => void;
  isProcessing: boolean;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  targetLanguage,
  onTargetLanguageChange,
  selectedModel,
  onModelChange,
  viewMode,
  onViewModeChange,
  pocketCount,
  onOpenPocketbook,
  onOpenGeminiAssistant,
  onReset,
  isProcessing,
  theme,
  onThemeChange,
}) => {
  const cycleTheme = () => {
    if (theme === 'light') onThemeChange('dark');
    else if (theme === 'dark') onThemeChange('system');
    else onThemeChange('light');
  };

  return (
    <header className="sticky top-0 z-40 h-14 sm:h-16 max-h-16 bg-[#f5f3ef]/90 dark:bg-[#1a1513]/90 backdrop-blur-md border-b border-[#e8e4db] dark:border-[#382f29] text-[#4a3b32] dark:text-[#e8e4db] shadow-xs transition-colors duration-200 flex items-center">
      <div className="max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Brand Logo & App Name */}
        <div className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0" onClick={onReset}>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl bg-[#8da384] dark:bg-[#d48c46] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 shrink-0">
            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs sm:text-base font-extrabold tracking-tight text-[#4a3b32] dark:text-[#e8e4db] whitespace-nowrap">
              <span className="hidden md:inline">多語系視覺 OCR 隨身翻譯官</span>
              <span className="md:hidden">視覺 OCR 翻譯官</span>
            </h1>
          </div>
        </div>

        {/* Action Controls Group - Single Row No Wrap */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* AI Model Selector */}
          <div className="flex items-center bg-white/80 dark:bg-[#28211d] rounded-xl px-1.5 sm:px-2 py-1 border border-[#e8e4db] dark:border-[#382f29] shadow-xs">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#748c69] dark:text-[#d48c46] mr-1 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-transparent text-[10px] sm:text-xs text-[#4a3b32] dark:text-[#e8e4db] font-bold focus:outline-none cursor-pointer max-w-[82px] sm:max-w-none text-ellipsis whitespace-nowrap"
              disabled={isProcessing}
            >
              <option value="gemini-3.6-flash" className="bg-[#f5f3ef] dark:bg-[#1a1513] text-[#4a3b32] dark:text-[#e8e4db]">
                ⚡ 3.6 Flash
              </option>
              <option value="gemini-3.1-pro-preview" className="bg-[#f5f3ef] dark:bg-[#1a1513] text-[#4a3b32] dark:text-[#e8e4db]">
                🧠 3.1 Pro
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-[#f5f3ef] dark:bg-[#1a1513] text-[#4a3b32] dark:text-[#e8e4db]">
                🍃 3.1 Lite
              </option>
            </select>
          </div>

          {/* Target Language Dropdown */}
          <div className="flex items-center bg-white/80 dark:bg-[#28211d] rounded-xl px-1.5 sm:px-2 py-1 border border-[#e8e4db] dark:border-[#382f29] shadow-xs">
            <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#748c69] dark:text-[#d48c46] mr-1 shrink-0" />
            <select
              value={targetLanguage}
              onChange={(e) => onTargetLanguageChange(e.target.value)}
              className="bg-transparent text-[10px] sm:text-xs text-[#4a3b32] dark:text-[#e8e4db] font-bold focus:outline-none cursor-pointer whitespace-nowrap"
              disabled={isProcessing}
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#f5f3ef] dark:bg-[#1a1513] text-[#4a3b32] dark:text-[#e8e4db]">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Segmented Control */}
          <div className="flex items-center bg-white/70 dark:bg-[#241e1b] rounded-xl p-0.5 border border-[#e8e4db] dark:border-[#382f29] text-xs shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('inspector')}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'inspector'
                  ? 'bg-[#8da384] dark:bg-[#d48c46] text-white shadow-xs'
                  : 'text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="原圖純淨標註：不遮擋原文照片，點擊對照"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">原圖標註</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('split')}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'split'
                  ? 'bg-[#8da384] dark:bg-[#d48c46] text-white shadow-xs'
                  : 'text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="獨立對照模式"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">獨立對照</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('ar')}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'ar'
                  ? 'bg-[#8da384] dark:bg-[#d48c46] text-white shadow-xs'
                  : 'text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="AR 覆蓋模式"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">AR 覆蓋</span>
            </button>
          </div>

          {/* Gemini AI Assistant Button */}
          <button
            type="button"
            onClick={onOpenGeminiAssistant}
            className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold bg-[#8da384]/15 hover:bg-[#8da384]/25 dark:bg-[#d48c46]/20 dark:hover:bg-[#d48c46]/35 text-[#5a7051] dark:text-[#e5a86c] border border-[#8da384]/30 dark:border-[#d48c46]/40 transition-all shadow-xs shrink-0"
            title="開啟 AI 隨身顧問"
          >
            <Bot className="w-3.5 h-3.5 text-[#748c69] dark:text-[#d48c46]" />
            <span className="hidden md:inline text-[11px]">AI 顧問</span>
          </button>

          {/* PocketBook Button */}
          <button
            type="button"
            onClick={onOpenPocketbook}
            className="relative flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold bg-white/80 dark:bg-[#28211d] hover:bg-white dark:hover:bg-[#322a25] text-[#4a3b32] dark:text-[#e8e4db] border border-[#e8e4db] dark:border-[#382f29] transition-colors shrink-0"
            title="口袋書"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#c88d51] dark:text-[#e5a86c]" />
            {pocketCount > 0 && (
              <span className="bg-[#8da384] dark:bg-[#d48c46] text-white px-1.5 py-0.2 rounded-full font-bold text-[10px]">
                {pocketCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={cycleTheme}
            className="p-1 sm:p-1.5 rounded-xl text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-white bg-white/80 dark:bg-[#28211d] hover:bg-white dark:hover:bg-[#322a25] border border-[#e8e4db] dark:border-[#382f29] transition-colors shrink-0"
            title={`主題：${theme === 'light' ? '燕麥日系' : theme === 'dark' ? '深夜濃縮' : '隨系統'}`}
          >
            {theme === 'light' && <Sun className="w-3.5 h-3.5 text-[#d48c46]" />}
            {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-[#e5a86c]" />}
            {theme === 'system' && <Monitor className="w-3.5 h-3.5 text-[#748c69]" />}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onReset}
            className="p-1 sm:p-1.5 rounded-xl text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-white bg-white/80 dark:bg-[#28211d] hover:bg-white dark:hover:bg-[#322a25] border border-[#e8e4db] dark:border-[#382f29] transition-colors shrink-0"
            title="換一張照片"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

