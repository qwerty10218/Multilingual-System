import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2, Lightbulb, Compass } from 'lucide-react';
import { OCRItem, ChatMessage } from '../types';

interface GeminiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  ocrItems: OCRItem[];
  targetLanguage: string;
}

export const GeminiAssistantDrawer: React.FC<GeminiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  ocrItems,
  targetLanguage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是 Gemini 3.6 隨身 AI 旅遊顧問。我可以幫您解讀照片菜單/告示、推薦熱門品項、分析成分過敏原、或是生成在地點餐溝通句，請問有什麼想了解的嗎？',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputValue.trim();
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
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${data.error || 'Gemini 服務回應異常，請確認 API Key 設定後重試。'}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      console.error('Gemini Assistant drawer error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ 網路連線失敗，請稍後重試。',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    '推薦這份菜單中最具在地特色的招牌品項',
    '裡面有不含牛肉、豬肉或海鮮的選擇嗎？',
    '請幫我寫出向店員點餐的在地常用對話句',
    '總結這張照片主要講述的注意事項或規定',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 dark:bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-lg bg-[#fcfbf9] dark:bg-[#231c19] border-l border-[#e8e4db] dark:border-[#382f29] text-[#4a3b32] dark:text-[#e8e4db] flex flex-col h-full shadow-2xl relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e8e4db] dark:border-[#382f29] flex items-center justify-between bg-[#f5f3ef]/80 dark:bg-[#1a1513]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8da384] dark:bg-[#d48c46] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#4a3b32] dark:text-[#e8e4db] flex items-center gap-1.5">
                Gemini 3.6 隨身 AI 顧問
              </h3>
              <p className="text-xs text-[#8a7f76] dark:text-[#9c938c]">
                多模態智慧對話 • 支援菜單點餐、過敏分析與景點問答
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Context Info Bar */}
        {imageUrl && (
          <div className="px-4 py-2 bg-[#8da384]/15 dark:bg-[#d48c46]/20 border-b border-[#8da384]/30 dark:border-[#d48c46]/30 flex items-center justify-between text-xs text-[#5a7051] dark:text-[#e5a86c] font-bold">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#748c69] dark:text-[#e5a86c]" />
              <span>已載入照片上下文 ({ocrItems.length} 個辨識區域)</span>
            </span>
            <span>{targetLanguage}</span>
          </div>
        )}

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f5f3ef]/50 dark:bg-[#1a1513]/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-[#8da384] dark:bg-[#d48c46] text-white shadow-xs'
                    : 'bg-white dark:bg-[#28211d] border border-[#e8e4db] dark:border-[#382f29] text-[#748c69] dark:text-[#e5a86c]'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed whitespace-pre-wrap font-medium ${
                  msg.role === 'user'
                    ? 'bg-[#8da384] dark:bg-[#d48c46] text-white rounded-tr-none shadow-xs'
                    : 'bg-white dark:bg-[#28211d] border border-[#e8e4db] dark:border-[#382f29] text-[#4a3b32] dark:text-[#e8e4db] rounded-tl-none shadow-xs'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-[#28211d] border border-[#e8e4db] dark:border-[#382f29] text-[#748c69] dark:text-[#e5a86c] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white dark:bg-[#28211d] border border-[#e8e4db] dark:border-[#382f29] rounded-2xl p-3.5 text-[#8a7f76] dark:text-[#9c938c] text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#748c69] dark:text-[#e5a86c]" />
                <span>Gemini 思考與檢索中...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-[#f5f3ef]/80 dark:bg-[#1a1513]/80 border-t border-[#e8e4db] dark:border-[#382f29]">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#8a7f76] dark:text-[#9c938c] mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-[#c88d51] dark:text-[#e5a86c]" />
            <span>快捷問答靈感：</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleSend(promptText)}
                disabled={isSending}
                className="text-xs bg-white dark:bg-[#28211d] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] text-[#4a3b32] dark:text-[#e8e4db] px-2.5 py-1.5 rounded-xl border border-[#e8e4db] dark:border-[#382f29] transition-colors text-left font-medium"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-[#fcfbf9] dark:bg-[#231c19] border-t border-[#e8e4db] dark:border-[#382f29] flex items-center gap-2">
          <input
            type="text"
            placeholder="詢問 Gemini 關於這張照片的任何問題..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending}
            className="flex-1 bg-white dark:bg-[#1a1513] text-[#4a3b32] dark:text-[#e8e4db] text-sm rounded-xl px-4 py-2.5 border border-[#e8e4db] dark:border-[#382f29] focus:outline-none focus:border-[#8da384] dark:focus:border-[#d48c46] placeholder-[#8a7f76]/60 dark:placeholder-[#9c938c]/60 font-medium"
          />
          <button
            onClick={() => handleSend()}
            disabled={isSending || !inputValue.trim()}
            className="p-2.5 bg-[#8da384] dark:bg-[#d48c46] hover:bg-[#798e71] dark:hover:bg-[#c27d3b] disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center justify-center shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

