import React from 'react';
import {
  Camera,
  Languages,
  Sparkles,
  Bot,
  Bookmark,
  Sun,
  Moon,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import { TranslationScene, SCENE_OPTIONS } from '../types';
import { TARGET_LANGUAGES } from '../data/samples';

interface DesktopHeaderProps {
  appMode: 'image' | 'text';
  onAppModeChange: (mode: 'image' | 'text') => void;
  targetLanguage: string;
  onTargetLanguageChange: (lang: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  selectedScene: TranslationScene;
  onSceneChange: (scene: TranslationScene) => void;
  pocketCount: number;
  onOpenPocketbook: () => void;
  onOpenGeminiAssistant: () => void;
  onReset: () => void;
  isProcessing: boolean;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (t: 'light' | 'dark' | 'system') => void;
}

const AI_MODELS = [
  { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
  { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite' },
];

const THEME_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const THEME_CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  appMode,
  onAppModeChange,
  targetLanguage,
  onTargetLanguageChange,
  selectedModel,
  onModelChange,
  selectedScene,
  onSceneChange,
  pocketCount,
  onOpenPocketbook,
  onOpenGeminiAssistant,
  onReset,
  isProcessing,
  theme,
  onThemeChange,
}) => {
  const ThemeIcon = THEME_ICONS[theme];

  const handleThemeCycle = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    onThemeChange(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };

  const themeLabel = { light: '亮色', dark: '暗色', system: '系統' }[theme];

  return (
    <header className="sticky top-0 z-40 h-[60px] bg-page border-b border-[var(--text-main)]/10">
      <div className="max-w-[1440px] mx-auto h-full px-4 lg:px-6 flex items-center gap-4">

        {/* ── 左區：品牌 Logo ── */}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 shrink-0 group mr-4"
          title="返回首頁"
        >
          <div className="w-6 h-6 flex items-center justify-center text-[var(--accent-red)]">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-lg font-serif font-bold text-[var(--text-main)] whitespace-nowrap hidden lg:block">
            視覺翻譯官
          </span>
        </button>

        {/* ── 雙模式切換 Tabs ── */}
        <div className="flex bg-[var(--text-main)]/5 p-1 rounded-lg shrink-0 border border-[var(--text-main)]/10">
          <button
            onClick={() => onAppModeChange('image')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              appMode === 'image'
                ? 'bg-white dark:bg-[#28211d] text-[var(--text-main)] shadow-sm'
                : 'text-[var(--text-main)]/50 hover:text-[var(--text-main)]'
            }`}
          >
            📸 視覺翻譯
          </button>
          <button
            onClick={() => onAppModeChange('text')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
              appMode === 'text'
                ? 'bg-white dark:bg-[#28211d] text-[var(--text-main)] shadow-sm'
                : 'text-[var(--text-main)]/50 hover:text-[var(--text-main)]'
            }`}
          >
            📝 文字翻譯
          </button>
        </div>

        <div className="w-px h-4 bg-[var(--text-main)]/20 shrink-0 mx-2 hidden md:block" />

        {/* ── 中間：場景選擇 chips ── */}
        <div className="flex-1 min-w-0 flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {SCENE_OPTIONS.map((scene) => {
            const isActive = selectedScene === scene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => onSceneChange(scene.id)}
                title={scene.desc}
                className={`text-[13px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  isActive
                    ? 'text-[var(--accent-red)] border-b border-[var(--accent-red)]'
                    : 'text-[var(--text-main)]/60 hover:text-[var(--text-main)]'
                }`}
              >
                {isActive && <span className="text-[10px] -ml-2 -mt-0.5 opacity-80">「</span>}
                {scene.label}
                {isActive && <span className="text-[10px] -mr-2 -mt-0.5 opacity-80">」</span>}
              </button>
            );
          })}
        </div>

        <div className="w-px h-4 bg-[var(--text-main)]/20 shrink-0" />

        {/* ── 右區：工具列 ── */}
        <div className="flex items-center gap-3 shrink-0">

          {/* 語言選擇 */}
          <label className="flex items-center gap-1 cursor-pointer group">
            <Languages className="w-3.5 h-3.5 text-[var(--text-main)]/60 group-hover:text-[var(--text-main)] shrink-0" />
            <select
              value={targetLanguage}
              onChange={(e) => onTargetLanguageChange(e.target.value)}
              className="bg-transparent text-[13px] font-bold text-[var(--text-main)] outline-none cursor-pointer pr-1 underline decoration-[0.5px] underline-offset-4 decoration-[var(--text-main)]/30 group-hover:decoration-[var(--text-main)] transition-colors"
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-[var(--text-main)] bg-white dark:bg-[#28211d]">
                  {lang.name}
                </option>
              ))}
            </select>
          </label>

          {/* AI 模型選擇 */}
          <label className="flex items-center gap-1 cursor-pointer group ml-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--text-main)]/60 group-hover:text-[var(--text-main)] shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-transparent text-[13px] font-bold text-[var(--text-main)] outline-none cursor-pointer pr-1 underline decoration-[0.5px] underline-offset-4 decoration-[var(--text-main)]/30 group-hover:decoration-[var(--text-main)] transition-colors"
            >
              {AI_MODELS.map((m) => (
                <option key={m.value} value={m.value} className="text-[var(--text-main)] bg-white dark:bg-[#28211d]">
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <div className="w-px h-3 bg-[var(--text-main)]/20 shrink-0 mx-1" />

          {/* AI 助手 */}
          <button
            type="button"
            onClick={onOpenGeminiAssistant}
            title="開啟 Gemini AI 助手"
            className="flex items-center justify-center text-[var(--text-main)]/60 hover:text-[var(--accent-blue)] transition-colors"
          >
            <Bot className="w-4 h-4" />
          </button>

          {/* 口袋書 */}
          <button
            type="button"
            onClick={onOpenPocketbook}
            title="開啟隨身口袋書"
            className="relative flex items-center justify-center text-[var(--text-main)]/60 hover:text-[var(--accent-red)] transition-colors mx-1"
          >
            <Bookmark className="w-4 h-4" />
            {pocketCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-[var(--accent-red)] text-white text-[9px] font-bold px-1">
                {pocketCount > 99 ? '99+' : pocketCount}
              </span>
            )}
          </button>

          {/* 主題切換 */}
          <button
            type="button"
            onClick={handleThemeCycle}
            title={`目前：${themeLabel}模式，點擊切換`}
            className="flex items-center justify-center text-[var(--text-main)]/60 hover:text-[var(--text-main)] transition-colors mx-1"
          >
            <ThemeIcon className="w-4 h-4" />
          </button>

          {/* 重置 */}
          <button
            type="button"
            onClick={onReset}
            disabled={isProcessing}
            title="重置，重新開始"
            className="flex items-center justify-center text-[var(--text-main)]/60 hover:text-[var(--accent-red)] transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
