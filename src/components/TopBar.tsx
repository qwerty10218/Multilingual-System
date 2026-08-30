import React from 'react';
import { Camera, Sun, Moon, Monitor } from 'lucide-react';
import { TARGET_LANGUAGES } from '../data/samples';

interface TopBarProps {
  appMode: 'image' | 'text';
  onAppModeChange: (mode: 'image' | 'text') => void;
  targetLanguage: string;
  onTargetLanguageChange: (lang: string) => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (t: 'light' | 'dark' | 'system') => void;
  isProcessing: boolean;
}

const THEME_CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

export const TopBar: React.FC<TopBarProps> = ({
  appMode,
  onAppModeChange,
  targetLanguage,
  onTargetLanguageChange,
  theme,
  onThemeChange,
  isProcessing,
}) => {
  const handleThemeCycle = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    onThemeChange(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header
      className="sticky top-0 z-40 w-full bg-[var(--bg-page)]/95 border-b border-[var(--text-main)]/10"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-3 sm:px-4 h-14">
        {/* Left: Logo (hidden on very small screens to make room for tabs) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 flex items-center justify-center text-[var(--accent-red)]">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-base font-serif font-bold text-[var(--text-main)] tracking-tight">
            視覺翻譯官
          </span>
          {isProcessing && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent-red)] border border-[var(--accent-red)]/30 animate-pulse">
              解讀中...
            </span>
          )}
        </div>

        {/* Center: Mode Segmented Control */}
        <div className="flex-1 flex justify-start sm:justify-center">
          <div className="flex bg-[var(--text-main)]/5 p-0.5 rounded-lg border border-[var(--text-main)]/10">
            <button
              onClick={() => onAppModeChange('image')}
              className={`px-3 py-1 rounded-md text-[13px] font-bold transition-all ${
                appMode === 'image'
                  ? 'bg-white dark:bg-[#28211d] text-[var(--text-main)] shadow-sm'
                  : 'text-[var(--text-main)]/50'
              }`}
            >
              📸 視覺
            </button>
            <button
              onClick={() => onAppModeChange('text')}
              className={`px-3 py-1 rounded-md text-[13px] font-bold transition-all ${
                appMode === 'text'
                  ? 'bg-white dark:bg-[#28211d] text-[var(--text-main)] shadow-sm'
                  : 'text-[var(--text-main)]/50'
              }`}
            >
              📝 文字
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Language Select */}
          <div className="relative flex items-center">
            <select
              value={targetLanguage}
              onChange={(e) => onTargetLanguageChange(e.target.value)}
              className="appearance-none pl-1 pr-4 py-1 text-xs font-bold bg-transparent text-[var(--text-main)] focus:outline-none cursor-pointer underline decoration-[0.5px] underline-offset-4 decoration-[var(--text-main)]/30"
              aria-label="選擇目標語言"
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-main)]/50 text-[10px]">
              ▾
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={handleThemeCycle}
            aria-label={`切換主題（目前：${theme === 'light' ? '淺色' : theme === 'dark' ? '深色' : '跟隨系統'}）`}
            className="flex items-center justify-center text-[var(--text-main)]/60 hover:text-[var(--text-main)] transition-colors min-w-[32px] min-h-[32px]"
          >
            <ThemeIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
