import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

/**
 * PWA install banner — listens for `beforeinstallprompt` and shows
 * a dismissible invite to add the app to the home screen.
 */
export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 z-50 animate-in slide-in-from-bottom-3 fade-in">
      <div className="bg-white dark:bg-[#28211d] border border-[#e8e4db] dark:border-[#382f29] rounded-2xl p-4 shadow-xl flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#8da384] dark:bg-[#d48c46] flex items-center justify-center shrink-0 shadow-xs">
          <Download className="w-5 h-5 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-[#2d2319] dark:text-[#f0ece3] leading-tight mb-0.5">
            加入主畫面
          </p>
          <p className="text-xs text-[#8a7f76] dark:text-[#9c938c] leading-relaxed">
            出國旅遊隨時開啟，即拍即翻
          </p>
          <button
            type="button"
            onClick={handleInstall}
            className="mt-2 px-4 py-1.5 bg-[#8da384] dark:bg-[#d48c46] hover:bg-[#798e71] dark:hover:bg-[#c27d3b] text-white text-xs font-bold rounded-xl transition-colors"
          >
            安裝到主畫面
          </button>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] p-0.5 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
