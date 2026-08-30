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
let currentAudio: HTMLAudioElement | null = null;
let currentSpeakId = 0; // 用於追蹤最新的朗讀任務，防止重複播放

export async function speakText(text: string, langHint?: string) {
  const speakId = ++currentSpeakId;

  // Stop existing playback
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
  if (!text) return;

  // Small delay to fix iOS Safari bug where immediate speak() after cancel() is ignored
  setTimeout(async () => {
    // 1. Resolve Language Locale
    const langMap: Record<string, string> = {
      '繁體中文': 'zh-TW',
      '簡體中文': 'zh-CN',
      'English': 'en-US',
      '日本語': 'ja-JP',
      '한국어': 'ko-KR',
      'Français': 'fr-FR',
      'Deutsch': 'de-DE',
      'Español': 'es-ES',
      'Tiếng Việt': 'vi-VN',
      'ภาษาไทย': 'th-TH',
    };
    
    let lang = 'en-US';

    // 強制特徵字元偵測 (優先級最高，防止 AI 語言辨識錯誤)
    if (/[\uac00-\ud7af]/.test(text)) {
      lang = 'ko-KR'; // 包含韓文
    } else if (/[\u3040-\u30ff]/.test(text)) {
      lang = 'ja-JP'; // 包含日文假名
    } else if (langHint && langMap[langHint]) {
      lang = langMap[langHint];
    } else if (langHint && /^[a-z]{2}(-[A-Z]{2})?$/.test(langHint)) {
      lang = langHint;
    } else if (/[\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) {
      lang = 'zh-TW'; // 包含中文字但沒被辨識出語系
    }

    try {
      // 嘗試使用自建的高品質 TTS 代理 (Google Translate Neural Voices)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang })
      });

      // 檢查是否在此請求期間又有新的朗讀請求
      if (speakId !== currentSpeakId) return;

      if (res.ok) {
        const blob = await res.blob();
        if (speakId !== currentSpeakId) return; // double check

        const url = URL.createObjectURL(blob);
        currentAudio = new Audio(url);
        
        currentAudio.onended = () => {
          URL.revokeObjectURL(url);
          if (currentAudio && currentAudio.src === url) {
            currentAudio = null;
          }
        };

        await currentAudio.play();
        return; // 成功播放 MP3，直接返回，不執行下方瀏覽器原生語音
      }
    } catch (err) {
      console.warn('High-quality TTS failed, falling back to browser synthesis', err);
    }

    // 檢查是否在此請求期間又有新的朗讀請求
    if (speakId !== currentSpeakId) return;

    // --- Fallback: Web Speech API ---
    if (!('speechSynthesis' in window)) {
      alert('您的瀏覽器不支援語音合成朗讀功能');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;

    // 嘗試尋找較佳的瀏覽器語音 (如 Google 雲端語音)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // 優先尋找 Google 的雲端語音 (品質較好)
      let bestVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && v.name.includes('Google'));
      // 其次尋找 Premium 語音 (如 iOS/macOS 的 Premium)
      if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && v.name.includes('Premium'));
      // 否則就拿第一個符合語言的
      if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
    }

    // 處理長文字切分，防止 Chrome 唸到一半卡死
    if (text.length > 200) {
      const chunks = text.match(/.{1,200}(\s|。|，|、|！|？|,|\.|$)/g) || [text];
      chunks.forEach((chunk) => {
        const u = new SpeechSynthesisUtterance(chunk.trim());
        u.lang = utterance.lang;
        u.rate = utterance.rate;
        if (utterance.voice) u.voice = utterance.voice;
        window.speechSynthesis.speak(u);
      });
    } else {
      window.speechSynthesis.speak(utterance);
    }
  }, 50);
}
