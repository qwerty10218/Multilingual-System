export type OCRCategory = 'title' | 'item' | 'description' | 'notice';

export type TranslationScene = 'auto' | 'food' | 'shopping' | 'travel' | 'document';

export interface SceneOption {
  id: TranslationScene;
  label: string;
  icon: string;
  desc: string;
}

export const SCENE_OPTIONS: SceneOption[] = [
  { id: 'auto', label: '自動判斷', icon: 'Sparkles', desc: 'AI 自動識別圖片場景與專業語境' },
  { id: 'food', label: '美食菜單', icon: 'Utensils', desc: '菜名、食材、醬汁、烹調手法專業翻譯' },
  { id: 'shopping', label: '藥妝購物', icon: 'ShoppingBag', desc: '美妝、成分、劑量、用途標籤翻譯' },
  { id: 'travel', label: '交通路標', icon: 'MapPin', desc: '站名、路標、出口、班次與告示翻譯' },
  { id: 'document', label: '說明文件', icon: 'FileText', desc: '手冊、警語、正式條款與說明書翻譯' },
];

export interface OCRItem {
  id: string;
  original: string;
  translation: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  category: OCRCategory;
}

export interface TranslationResponse {
  detectedLanguage?: string;
  items: OCRItem[];
  rawJsonResponse?: string;
}

export interface TargetLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  flag: string;
  dataUrl: string;
  description: string;
  presetItems?: OCRItem[];
}

export interface SavedItem {
  id: string;
  original: string;
  translation: string;
  category: OCRCategory;
  note?: string;
  savedAt: number;
  sourceTitle?: string;
}

export type ViewMode = 'ar' | 'inspector' | 'split';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
