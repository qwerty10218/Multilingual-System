import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Loader2, Lightbulb, Compass } from 'lucide-react';
import { OCRItem, ChatMessage } from '../types';

interface AssistantPageProps {
  imageUrl: string | null;
  ocrItems: OCRItem[];
  targetLanguage: string;
}

const QUICK_PROMPTS = [
  '推薦這份菜單中最具在地特色的招牌品項',
  '裡面有不含牛肉、豬肉或海鮮的選擇嗎？',
  '請幫我寫出向店員點餐的在地常用對話句',
  '總結這張照片主要講述的注意事項或規定',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    '你好！我是 Gemini 3.6 隨身 AI 旅遊顧問。我可以幫您解讀照片菜單/告示、推薦熱門品項、分析成分過敏原、或是生成在地點餐溝通句，請問有什麼想了解的嗎？',
  timestamp: Date.now(),
};

export const AssistantPage: React.FC<AssistantPageProps> = ({
  imageUrl,
  ocrItems,
  targetLanguage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend ?? inputValue.trim();
    if (!prompt || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsSending(true);

    try {
      const res = await fetch('/api/gemini-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: prompt,
          imageBase64: imageUrl,
          ocrItems,
          targetLanguage,
        }),
      });

      const data = await res.json();

      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ast-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: Date.now(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ ${data.error || 'Gemini 服務回應異常，請確認 API Key 設定後重試。'}`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      console.error('Gemini Assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ 網路連線失敗，請稍後重試。',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-page">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-[var(--text-main)]/10 bg-page/90">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center text-[var(--accent-red)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-serif font-bold text-[var(--text-main)]">
              Gemini 3.6 隨身 AI 顧問
            </h2>
            <p className="text-[11px] font-mono text-[var(--text-main)]/60">
              多模態智慧對話 · 菜單點餐、過敏分析、景點問答
            </p>
          </div>
        </div>

        {/* Context info bar */}
        {imageUrl && (
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[var(--text-main)]/70 bg-[var(--bg-panel)]/50 border border-[var(--text-main)]/10 px-3 py-1.5">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              已載入照片上下文 ({ocrItems.length} 筆)
            </span>
            <span className="text-[10px]">
              {targetLanguage}
            </span>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-6 h-6 flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'text-[var(--text-main)]'
                  : 'text-[var(--accent-red)]'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] p-3 text-[13px] leading-relaxed whitespace-pre-wrap font-medium ${
                msg.role === 'user'
                  ? 'bg-[var(--text-main)]/5 border border-[var(--text-main)]/20 text-[var(--text-main)]'
                  : 'bg-transparent border border-l-2 border-transparent border-l-[var(--accent-red)] text-[var(--text-main)] pl-4'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isSending && (
          <div className="flex gap-3 flex-row">
            <div className="w-6 h-6 text-[var(--accent-red)] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="border border-l-2 border-transparent border-l-[var(--accent-red)] pl-4 p-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-red)]" />
              <span className="text-xs font-serif text-[var(--text-main)]/60">解讀中…</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="shrink-0 px-4 py-3 border-t border-[var(--text-main)]/10 bg-page">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-main)]/60 mb-2">
          <Lightbulb className="w-3 h-3 text-[var(--accent-red)]" />
          快捷靈感
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(p)}
              disabled={isSending}
              className="shrink-0 text-[11px] font-bold text-[var(--text-main)] bg-transparent hover:bg-[var(--text-main)]/5 px-2 py-1 border border-[var(--text-main)]/20 transition-colors text-left disabled:opacity-50"
            >
              「{p}」
            </button>
          ))}
        </div>
      </div>

      {/* Input Footer */}
      <div className="shrink-0 px-4 py-3 bg-page border-t border-[var(--text-main)]/10 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="詢問這張照片的相關細節..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isSending}
          className="flex-1 min-h-[44px] bg-transparent text-[var(--text-main)] text-sm px-1 py-2 border-b border-[var(--text-main)]/30 focus:outline-none focus:border-[var(--text-main)] placeholder-[var(--text-main)]/40 font-medium"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={isSending || !inputValue.trim()}
          aria-label="送出"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-main)] disabled:opacity-30 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
