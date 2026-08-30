import React from 'react';
import { ImageIcon, Camera, Bookmark, Bot, ArrowLeft } from 'lucide-react';

export type TabId = 'gallery' | 'camera' | 'pocketbook' | 'assistant';

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  pocketCount: number;
  hasImage: boolean; // 有圖片時拍照 Tab 換成返回 icon
}

interface TabConfig {
  id: TabId;
  label: string;
  Icon: React.ElementType;
  isMain?: boolean;
}

const TABS: TabConfig[] = [
  { id: 'gallery', label: '相簿', Icon: ImageIcon },
  { id: 'camera', label: '拍照', Icon: Camera, isMain: true },
  { id: 'pocketbook', label: '口袋書', Icon: Bookmark },
  { id: 'assistant', label: 'AI 助手', Icon: Bot },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  pocketCount,
  hasImage,
}) => {
  return (
    <nav
      className="shrink-0 w-full bg-[var(--bg-page)]/95 border-t border-[var(--text-main)]/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="主要導覽"
    >
      <div className="flex items-end justify-around h-[68px]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isCamera = tab.id === 'camera';
          const Icon = isCamera && hasImage ? ArrowLeft : tab.Icon;
          const label = isCamera && hasImage ? '返回' : tab.label;

          if (tab.isMain) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-4 transition-transform active:scale-95 mb-1"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isActive
                      ? 'border-[var(--accent-red)] bg-[var(--accent-red)]/10 text-[var(--accent-red)]'
                      : 'border-[var(--text-main)] text-[var(--text-main)] hover:bg-[var(--text-main)]/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-label={`${label}${tab.id === 'pocketbook' && pocketCount > 0 ? `（${pocketCount} 項）` : ''}`}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 transition-colors active:scale-95 mb-1"
            >
              {tab.id === 'pocketbook' && pocketCount > 0 && (
                <span className="absolute top-1 right-2 min-w-[16px] h-[16px] rounded-full bg-[var(--accent-red)] text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none">
                  {pocketCount > 99 ? '99+' : pocketCount}
                </span>
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-main)]/40'
                }`}
              />
              <span
                className={`text-[10px] font-bold transition-colors ${
                  isActive ? 'text-[var(--text-main)] underline decoration-[1px] underline-offset-4 decoration-[var(--accent-red)]' : 'text-[var(--text-main)]/40'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
