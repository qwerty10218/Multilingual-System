import { OCRCategory } from '../types';

export interface CategoryStyle {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  overlayBg: string;
  hoverBorder: string;
  iconName: string;
  dotColor: string;
}

export const CATEGORY_STYLES: Record<OCRCategory, CategoryStyle> = {
  title: {
    label: '標題/店名',
    badgeBg: 'bg-[#8da384]/15 dark:bg-[#d48c46]/20',
    badgeText: 'text-[#5a7051] dark:text-[#e5a86c] border-[#8da384]/30 dark:border-[#d48c46]/40',
    borderColor: '#8da384',
    overlayBg: 'rgba(141, 163, 132, 0.90)',
    hoverBorder: 'border-[#8da384] ring-2 ring-[#8da384]/50',
    iconName: 'heading',
    dotColor: '#8da384',
  },
  item: {
    label: '品項/地名',
    badgeBg: 'bg-[#789c8a]/15 dark:bg-[#d48c46]/20',
    badgeText: 'text-[#4e6e5d] dark:text-[#e5a86c] border-[#789c8a]/30 dark:border-[#d48c46]/40',
    borderColor: '#789c8a',
    overlayBg: 'rgba(120, 156, 138, 0.90)',
    hoverBorder: 'border-[#789c8a] ring-2 ring-[#789c8a]/50',
    iconName: 'utensils',
    dotColor: '#789c8a',
  },
  description: {
    label: '說明/成分',
    badgeBg: 'bg-[#b09680]/15 dark:bg-[#b09680]/20',
    badgeText: 'text-[#735e4d] dark:text-[#d9c4b3] border-[#b09680]/30 dark:border-[#b09680]/40',
    borderColor: '#b09680',
    overlayBg: 'rgba(176, 150, 128, 0.90)',
    hoverBorder: 'border-[#b09680] ring-2 ring-[#b09680]/50',
    iconName: 'file-text',
    dotColor: '#b09680',
  },
  notice: {
    label: '警告/須知',
    badgeBg: 'bg-[#c86d51]/15 dark:bg-[#c86d51]/20',
    badgeText: 'text-[#a14b32] dark:text-[#e89d87] border-[#c86d51]/30 dark:border-[#c86d51]/40',
    borderColor: '#c86d51',
    overlayBg: 'rgba(200, 109, 81, 0.90)',
    hoverBorder: 'border-[#c86d51] ring-2 ring-[#c86d51]/50',
    iconName: 'alert-triangle',
    dotColor: '#c86d51',
  },
};

/**
 * Normalizes box_2d [ymin, xmin, ymax, xmax] (0..1000) into CSS top, left, width, height percentages.
 */
export function boxToPercent(box: [number, number, number, number]) {
  const [ymin, xmin, ymax, xmax] = box;
  const top = (ymin / 10).toFixed(2);
  const left = (xmin / 10).toFixed(2);
  const width = Math.max(2, ((xmax - xmin) / 10)).toFixed(2);
  const height = Math.max(2, ((ymax - ymin) / 10)).toFixed(2);

  return {
    top: `${top}%`,
    left: `${left}%`,
    width: `${width}%`,
    height: `${height}%`,
    rawTop: ymin / 10,
    rawLeft: xmin / 10,
    rawWidth: (xmax - xmin) / 10,
    rawHeight: (ymax - ymin) / 10,
  };
}

/**
 * Speech synthesis helper
 */
export function speakText(text: string, langHint?: string) {
  if (!('speechSynthesis' in window)) {
    alert('您的瀏覽器不支援語音合成朗讀功能');
    return;
  }

  window.speechSynthesis.cancel(); // Stop current

  // Small delay to fix iOS Safari bug where immediate speak() after cancel() is ignored
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 1. Strong Auto-Detection for CJK (Overrides hallucinated langHints from AI)
    if (/[\uac00-\ud7af]/.test(text)) {
      // Contains Korean Hangul
      utterance.lang = 'ko-KR';
    } else if (/[\u3040-\u30ff]/.test(text)) {
      // Contains Japanese Hiragana/Katakana
      utterance.lang = 'ja-JP';
    } else if (langHint && /^[a-z]{2}(-[A-Z]{2})?$/.test(langHint)) {
      // 2. Trust langHint if valid format
      utterance.lang = langHint;
    } else if (langHint === '日本語') {
      utterance.lang = 'ja-JP';
    } else if (langHint === '한국어') {
      utterance.lang = 'ko-KR';
    } else if (langHint === '繁體中文' || langHint === '簡體中文') {
      utterance.lang = 'zh-TW';
    } else {
      // 3. Fallback check for Chinese characters
      if (/[\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) {
        utterance.lang = 'zh-TW';
      } else {
        utterance.lang = 'en-US';
      }
    }

    utterance.rate = 0.95;

    // Split very long text into chunks to prevent Chrome TTS timeout bug (limit ~200 chars)
    if (text.length > 200) {
      const chunks = text.match(/.{1,200}(\s|。|，|、|！|？|,|\.|$)/g) || [text];
      chunks.forEach((chunk) => {
        const u = new SpeechSynthesisUtterance(chunk.trim());
        u.lang = utterance.lang;
        u.rate = utterance.rate;
        window.speechSynthesis.speak(u);
      });
    } else {
      window.speechSynthesis.speak(utterance);
    }
  }, 50);
}
