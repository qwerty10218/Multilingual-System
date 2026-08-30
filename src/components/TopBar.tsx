import React from 'react';
import { Camera, Sun, Moon, Monitor } from 'lucide-react';
import { TARGET_LANGUAGES } from '../data/samples';

interface TopBarProps {
  targetLanguage: string;
  onTargetLanguageChange: (lang: string) => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (t: 'light' | 'dark' | 'system') => void;
  isProcessing: boolean;
}

const THEME_CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

export const TopBar: React.FC<TopBarProps> = ({
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
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 flex items-center justify-center text-[var(--accent-red)]">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-base font-serif font-bold text-[var(--text-main)] tracking-tight">
            視覺翻譯官
          </span>
          {isProcessing && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent-red)] border border-[var(--accent-red)]/30 animate-pulse">
              辨識中
            </span>
          )}
        </div>

        {/* Right: Language Selector + Theme Toggle */}
        <div className="flex items-center gap-3">
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
