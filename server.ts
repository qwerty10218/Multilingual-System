import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// ── MyMemory Translation API (Free backup) ──────────────────────────
// Maps our app's target language display names to ISO codes for MyMemory
const TARGET_LANG_TO_CODE: Record<string, string> = {
  '繁體中文': 'zh-TW', '簡體中文': 'zh-CN', 'English': 'en',
  '日本語': 'ja', '한국어': 'ko', 'Français': 'fr',
  'Deutsch': 'de', 'Español': 'es', 'Tiếng Việt': 'vi', 'ภาษาไทย': 'th',
};

// Converts sourceLanguage codes like 'ja-JP' to MyMemory format
function toMyMemoryCode(code: string): string {
  if (!code) return 'Autodetect';
  if (code.startsWith('zh-')) return code;   // keep zh-TW / zh-CN as-is
  return code.split('-')[0];                 // ja-JP → ja, en-US → en
}

// Translate a single text string via MyMemory API (free, no key needed)
async function translateWithMyMemory(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!text.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 500))}&langpair=${sourceLang}|${targetLang}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
  const data = await res.json() as any;
  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    const translated = data.responseData.translatedText;
    // MyMemory sometimes returns all-caps "QUERY LENGTH LIMIT..." error text
    if (translated.startsWith('QUERY LENGTH LIMIT') || translated.startsWith('NO QUERY SPECIFIED')) {
      return text;
    }
    return translated;
  }
  return text;
}

// Helper to safely extract clean base64 string and proper MIME type from any data URL or SVG input
function parseAndNormalizeImage(input: string, fallbackMime: string = 'image/jpeg'): { cleanBase64: string; mimeType: string } {
  const trimmed = (input || '').trim();
  const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

  let mime = fallbackMime;
  let body = '';

  if (trimmed.startsWith('data:')) {
    const commaIndex = trimmed.indexOf(',');
    if (commaIndex !== -1) {
      const header = trimmed.slice(0, commaIndex);
      body = trimmed.slice(commaIndex + 1);

      const mimeMatch = header.match(/^data:([^;,]+)/);
      if (mimeMatch && mimeMatch[1]) {
        mime = mimeMatch[1].toLowerCase();
      }

      if (!header.toLowerCase().includes('base64')) {
        try {
          const decodedText = decodeURIComponent(body);
          body = Buffer.from(decodedText, 'utf-8').toString('base64');
        } catch {
          body = Buffer.from(body, 'utf-8').toString('base64');
        }
      }
    }
  } else if (trimmed.startsWith('<svg') || trimmed.startsWith('<?xml')) {
    body = Buffer.from(trimmed, 'utf-8').toString('base64');
    mime = 'image/png';
  } else {
    body = trimmed.replace(/^data:[^;]+;(base64|utf8)?,?/i, '');
  }

  // Gemini API strictly requires raster mimes: image/jpeg, image/png, image/webp, image/heic, image/heif
  if (!ALLOWED_MIMES.includes(mime) || mime === 'image/svg+xml') {
    mime = 'image/png';
  }

  return { cleanBase64: body.trim(), mimeType: mime };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Initialize Gemini client lazily or handle missing key gracefully
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 尚未設定，請在 AI Studio 的 Secrets 面板設定 GEMINI_API_KEY。');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. Multimodal Visual OCR & Translation API
  app.post('/api/ocr-translate', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', targetLanguage = '繁體中文', customNote, scene = 'auto', model = 'gemini-3.6-flash' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: '請提供圖片 Data URL 或 Base64 字串' });
      }

      // Valid model check
      const validModels = ['gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
      const selectedModel = validModels.includes(model) ? model : 'gemini-3.6-flash';

      // Clean base64 string and resolve actual MIME type
      const { cleanBase64, mimeType: detectedMimeType } = parseAndNormalizeImage(imageBase64, mimeType);

      const ai = getAiClient();

      let sceneRule = '';
      if (scene === 'food') {
        sceneRule = `【強制情境設定：美食菜單】
使用者已明確指定此圖片為『美食菜單/餐飲』場景。請全面使用餐飲、料理食材專業術語進行翻譯。精準辨識烹調方式（如：炙燒、燉煮、揚物、刺身）、特色食材、醬汁、套餐與份量。專有名詞與經典菜名保留原文拼音並加上括號解說（例如：Omakase (主廚推薦無菜單)、Tonkotsu (濃豚骨)），嚴禁無意義的機械字面直譯。`;
      } else if (scene === 'shopping') {
        sceneRule = `【強制情境設定：藥妝購物】
使用者已明確指定此圖片為『藥妝購物/商品標籤』場景。請全面使用美妝保養、藥品成分、保健食品、容量規格與使用警語專業術語進行翻譯。對應日本/韓國/西洋藥品分類（如：指定第2類醫藥品）、功效、成份、適用症狀請精準翻出，拒絕一般口語或錯誤直譯。`;
      } else if (scene === 'travel') {
        sceneRule = `【強制情境設定：交通路標】
使用者已明確指定此圖片為『交通指標/旅遊景點』場景。請全面使用地名、車站名稱、路線標示、出口方向與時刻表用語進行翻譯。地名與站名請保留通用拼音/英文譯名並加註中文，嚴禁將地名錯誤意譯（例如：將「東京」意譯，應維持「東京 (Tokyo)」）。`;
      } else if (scene === 'document') {
        sceneRule = `【強制情境設定：說明/文件】
使用者已明確指定此圖片為『學術說明/產品手冊/告示文件』場景。請使用正式公務、技術手冊、操作規程與嚴謹繁體中文進行翻譯。條款、步驟與警語須清晰連貫，句式通順，嚴禁碎字拆解。`;
      } else {
        sceneRule = `【場景專業用語自動推斷】
請根據視覺內容自動推斷圖片場景（如日料菜單、藥妝成分說明、交通指標、歷史古蹟解說等），並強制使用符合該場景的專業術語與在地道地習慣，嚴禁字面直譯。`;
      }

      const systemPrompt = `你是一個專為「旅遊與生活場景」設計的專業多語系 OCR 兼視覺翻譯系統。
你的任務是讀取提供的照片（如：菜單、商品包裝、藥妝成分標示、路標、公車時刻表、告示牌、收據等），自動辨識圖中語言（日文、韓文、英文、法文、德文、泰文等），並將其翻譯為指定的目標語言。

${sceneRule}

【翻譯與場景推斷核心法則（務必嚴格遵守）】
1. 專有名詞格式規範：特色料理、景點地名、知名品牌等專有名詞，必須保留原文或拼音，並加上精簡括號註解。例如：Omakase (主廚推薦無菜單)、Ichiran (一蘭拉麵)、Tsukiji (築地市場)。
2. 強制合併邏輯區塊：連續的說明文字、成分說明、注意條款，必須將其合併為單一邏輯區塊 (description 或 notice)，絕不可拆成碎字或單字邊界框。
3. 雜訊嚴格排除：無意義的純數字條碼、裝飾線條、圖示符號、重複的底紋背景字，請嚴格直接忽略，絕對不要輸出為 OCR 區塊。

【輸出規範】
1. 請嚴格僅回傳標準 JSON 格式（JSON Array），切勿包含任何 markdown 標記（如 \`\`\`json）、引言或結語。
2. 請依據圖片中的「視覺區域」或「邏輯區塊」（例如菜單上的一道菜、告示牌的一段警語）進行分段。

【JSON 結構要求】
陣列中的每個物件必須包含以下 4 個欄位：
- "original": 辨識出的原始文字（保留原文排版與標點，連續說明請合併完整）。
- "translation": 翻譯成流暢、符合該目標語言與專業場景用語習慣的譯文。
- "box_2d": 該段文字在圖片中的二維邊界框座標，格式嚴格為 [ymin, xmin, ymax, xmax]，數值必須是 0 到 1000 之間的標準化整數（Normalized Coordinates）。
- "category": 該區塊的屬性類別，嚴格限定為以下四者之一：["title", "item", "description", "notice"]
  - title: 標題 / 店名 / 類別名
  - item: 主要品項 / 欄位名 / 路標地名
  - description: 說明文 / 成分 / 附註說明
  - notice: 警告 / 注意事項 / 營業時間
- "sourceLanguage": 辨識出原文的語言代碼（例如：日文為 ja-JP，韓文為 ko-KR，繁體中文為 zh-TW，英文為 en-US 等）。

【本次執行指令】
目標語言：${targetLanguage}
所選場景模式：${scene}
${customNote ? `特別補充需求：${customNote}` : ''}
請讀取隨附的圖片，並嚴格遵守上述規範，僅輸出 JSON Array 格式結果。`;

      const requestPayload = {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: detectedMimeType,
                data: cleanBase64,
              },
            },
            {
              text: systemPrompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'List of OCR text blocks with bounding boxes and translations',
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING, description: 'Original text in picture' },
                translation: { type: Type.STRING, description: 'Translation in target language' },
                box_2d: {
                  type: Type.ARRAY,
                  description: 'Normalized bounding box [ymin, xmin, ymax, xmax] integers 0-1000',
                  items: { type: Type.INTEGER },
                },
                category: {
                  type: Type.STRING,
                  description: 'Category: title, item, description, notice',
                },
                sourceLanguage: {
                  type: Type.STRING,
                  description: 'Detected language code of the original text (e.g., ja-JP, ko-KR, en-US, zh-TW)',
                },
              },
              required: ['original', 'translation', 'box_2d', 'category', 'sourceLanguage'],
            },
          },
        },
      };

      // Helper to add timeout to promise
      const withTimeout = (promise: Promise<any>, ms: number) => {
        let timeoutHandle: any;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error('TIMEOUT')), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
      };

      // Fast fallback chain without long delays (but realistic for multimodal OCR)
      const modelChain = [
        { model: selectedModel, timeout: 12000 },
        { model: 'gemini-3.1-flash-lite', timeout: 8000 }
      ];
      
      let response;
      let lastError: any = null;

      for (const config of modelChain) {
        try {
          const apiCall = ai.models.generateContent({
            model: config.model,
            ...requestPayload
          });
          response = await withTimeout(apiCall, config.timeout);
          if (response) break; // Success
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${config.model} failed or timed out:`, err.message || err);
          continue;
        }
      }

      // ── Last resort: OCR-only Gemini + MyMemory translation ──
      if (!response) {
        console.warn('All Gemini full-pipeline attempts failed. Trying OCR-only + MyMemory fallback...');
        try {
          const ocrOnlyApiCall = ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: {
              parts: [
                { inlineData: { mimeType: detectedMimeType, data: cleanBase64 } },
                { text: `從這張圖片中提取所有文字區塊。只做文字辨識，不需要翻譯。每個區塊包含：original（原文）、box_2d（[ymin,xmin,ymax,xmax] 0-1000）、category（title/item/description/notice）、sourceLanguage（偵測到的語言代碼如 ja-JP、en-US）。回傳 JSON Array。` },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    box_2d: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                    category: { type: Type.STRING },
                    sourceLanguage: { type: Type.STRING },
                  },
                  required: ['original', 'box_2d', 'category', 'sourceLanguage'],
                },
              },
            },
          });
          const ocrOnlyResponse = await withTimeout(ocrOnlyApiCall, 8000);

          const ocrRaw = ocrOnlyResponse.text || '[]';
          const ocrItems = JSON.parse(ocrRaw);
          const targetCode = TARGET_LANG_TO_CODE[targetLanguage] || 'en';

          // Translate each item in parallel via MyMemory
          const translatedItems = await Promise.all(
            (Array.isArray(ocrItems) ? ocrItems : []).map(async (item: any) => {
              const srcCode = toMyMemoryCode(item.sourceLanguage || '');
              try {
                const translated = await translateWithMyMemory(item.original, srcCode, targetCode);
                return { ...item, translation: translated };
              } catch {
                return { ...item, translation: item.original };
              }
            })
          );

          // Synthesize a response object compatible with the downstream parser
          response = { text: JSON.stringify(translatedItems) } as any;
          console.log(`MyMemory fallback succeeded: ${translatedItems.length} items translated.`);
        } catch (fallbackErr: any) {
          console.error('MyMemory fallback also failed:', fallbackErr);
          throw lastError || fallbackErr || new Error('所有翻譯服務皆無法回應');
        }
      }

      const rawText = response.text || '[]';
      let items = [];

      try {
        items = JSON.parse(rawText);
      } catch (parseError) {
        console.warn('JSON direct parse failed, attempting regex cleanup:', rawText);
        const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        items = JSON.parse(cleaned);
      }

      // Add unique IDs and strictly validate box_2d coordinates
      const processedItems = (Array.isArray(items) ? items : [])
        .filter((item: any) => {
          if (!item || typeof item !== 'object') return false;
          if (!item.original || typeof item.original !== 'string' || !item.original.trim()) return false;
          
          // Must have box_2d as an array of 4 items
          if (!Array.isArray(item.box_2d) || item.box_2d.length !== 4) return false;

          // Check all 4 coordinate values are valid numbers (not NaN / Infinity)
          const validCoords = item.box_2d.every((val: any) => {
            const num = Number(val);
            return typeof num === 'number' && Number.isFinite(num) && !isNaN(num);
          });

          if (!validCoords) return false;

          // Ensure box coordinates make basic logical sense (ymax > ymin and xmax > xmin)
          const coords = item.box_2d.map((val: any) => Math.max(0, Math.min(1000, Math.round(Number(val)))));
          const [ymin, xmin, ymax, xmax] = coords;
          if (ymax <= ymin || xmax <= xmin) return false;

          return true;
        })
        .map((item: any, index: number) => {
          const coords = item.box_2d.map((val: any) => Math.max(0, Math.min(1000, Math.round(Number(val)))));
          return {
            id: `ocr-${Date.now()}-${index}`,
            original: item.original.trim(),
            translation: (item.translation || '').trim() || item.original.trim(),
            box_2d: coords,
            category: ['title', 'item', 'description', 'notice'].includes(item.category)
              ? item.category
              : 'item',
            sourceLanguage: item.sourceLanguage || 'zh-TW',
          };
        });

      res.json({
        success: true,
        targetLanguage,
        items: processedItems,
        totalDetected: processedItems.length,
      });
    } catch (err: any) {
      console.error('OCR Translate API Error:', err);
      
      let errorMessage = '無法處理圖片，請稍後再試。';
      if (err.message) {
        if (err.message.includes('503')) {
          errorMessage = 'Google AI 伺服器目前過度擁擠（503），請稍後再試。';
        } else if (err.message.includes('429')) {
          errorMessage = 'API 請求次數已達上限，請稍後再試。';
        } else if (err.message.includes('400')) {
          errorMessage = '圖片格式或內容無法解析，請換一張圖片試試。';
        }
      }

      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // 3. Text Translation API (Pure Text)
  app.post('/api/text-translate', async (req, res) => {
    try {
      const { text, targetLanguage = '繁體中文', customNote = '', model = 'gemini-3.6-flash' } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: '請提供欲翻譯的文字' });
      }

      const ai = getAiClient();
      const validModels = ['gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
      const selectedModel = validModels.includes(model) ? model : 'gemini-3.6-flash';

      const systemPrompt = `你是一個專業的多語系翻譯官。
請將以下文字翻譯成：${targetLanguage}。
${customNote ? `特別補充需求：${customNote}` : ''}
請注意保留原文的語氣與格式。
請只輸出翻譯後的文字，不要包含任何其他解釋或 markdown 標籤。

欲翻譯文字：
${text}`;

      let translatedText = '';
      let lastError: any = null;

      // Helper to add timeout to promise
      const withTimeout = (promise: Promise<any>, ms: number) => {
        let timeoutHandle: any;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error('TIMEOUT')), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
      };

      // Fast fallback chain without long delays
      const modelChain = [
        { model: selectedModel, timeout: 5000 },
        { model: 'gemini-3.1-flash-lite', timeout: 3500 }
      ];

      for (const config of modelChain) {
        try {
          const apiCall = ai.models.generateContent({
            model: config.model,
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
          });
          const response = await withTimeout(apiCall, config.timeout);
          translatedText = (response.text || '').trim();
          if (translatedText) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Text Translation: Model ${config.model} failed or timed out:`, err.message || err);
          continue;
        }
      }

      // Last resort: MyMemory API Fallback
      if (!translatedText) {
        console.warn('Text Translation: All Gemini attempts failed. Trying MyMemory fallback...');
        try {
          const targetCode = TARGET_LANG_TO_CODE[targetLanguage] || 'en';
          // auto detect source via MyMemory using 'Autodetect'
          translatedText = await translateWithMyMemory(text, 'Autodetect', targetCode);
          if (translatedText === text && text.length > 3) {
             throw new Error('MyMemory failed to translate.');
          }
        } catch (fallbackErr: any) {
          console.error('MyMemory text fallback also failed:', fallbackErr);
          throw lastError || fallbackErr || new Error('所有翻譯服務皆無法回應');
        }
      }

      res.json({ success: true, translation: translatedText });
    } catch (err: any) {
      console.error('Text Translate API Error:', err);
      let errorMessage = '無法翻譯文字，請稍後再試。';
      if (err.message) {
        if (err.message.includes('503')) errorMessage = 'Google AI 伺服器目前過度擁擠（503），請稍後再試。';
        else if (err.message.includes('429')) errorMessage = 'API 請求次數已達上限，請稍後再試。';
      }
      res.status(500).json({ success: false, error: errorMessage });
    }
  });

  // 4. Cultural & Dietary Context Detail Generator API
  app.post('/api/cultural-explain', async (req, res) => {
    try {
      const { original, translation, category, targetLanguage = '繁體中文' } = req.body;

      if (!original) {
        return res.status(400).json({ error: '請提供欲解說的原文文字' });
      }

      const ai = getAiClient();

      const prompt = `你是一個專業的各國旅遊文化、美食知識與飲食過敏提示小幫手。
使用者在旅遊或生活照片中辨識出了以下文字：
- 原文：${original}
- 翻譯（${targetLanguage}）：${translation}
- 屬性類別：${category}

請為旅遊者提供一份簡潔實用的【文化與實用知識指南】，以 ${targetLanguage} 回覆，請包含：
1. 【專有名詞與背景由來】：簡單解釋這個品項或告示在當地文化中的意義（例如這道料理的口感、成分、特定祭典背景、或是站牌/機構名稱）。
2. 【過敏與飲食禁忌提示】：說明這項食品或產品是否可能包含常見過敏原（如蛋、奶、大豆、小麥/麩質、海鮮、花生、牛肉、豬肉、酒精、甲殼類等）或特定使用禁忌。
3. 【旅遊實用句點餐/溝通語】：提供 1~2 句在現場可以直接向店員或路人說的在地短句（附帶羅馬拼音或注音/發音指南），例如如何點這道菜、詢問是否有不含特定成分版本等。`;

      // Helper to add timeout to promise
      const withTimeout = (promise: Promise<any>, ms: number) => {
        let timeoutHandle: any;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error('TIMEOUT')), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
      };

      const modelChain = [
        { model: 'gemini-3.6-flash', timeout: 8000 },
        { model: 'gemini-3.1-flash-lite', timeout: 5000 }
      ];
      
      let explanation = '';
      let lastError: any = null;

      for (const config of modelChain) {
        try {
          const apiCall = ai.models.generateContent({
            model: config.model,
            contents: prompt,
          });
          const response = await withTimeout(apiCall, config.timeout);
          explanation = (response.text || '').trim();
          if (explanation) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Cultural Explain: Model ${config.model} failed or timed out:`, err.message || err);
          continue;
        }
      }

      if (!explanation) {
        throw lastError || new Error('All models failed');
      }

      res.json({
        success: true,
        explanation,
      });
    } catch (err: any) {
      console.error('Cultural Explain Error:', err);
      let errorMessage = '無法產生文化解說，請稍後再試。';
      if (err.message) {
        if (err.message.includes('503')) errorMessage = 'Google AI 伺服器目前過度擁擠（503），請稍後再試。';
        else if (err.message.includes('429')) errorMessage = 'API 請求次數已達上限，請稍後再試。';
      }
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // 4. Interactive Gemini AI Travel & Translation Assistant API
  app.post('/api/gemini-assistant', async (req, res) => {
    try {
      const { userMessage, imageBase64, ocrItems = [], history = [], targetLanguage = '繁體中文' } = req.body;

      if (!userMessage) {
        return res.status(400).json({ error: '請提供提問內容' });
      }

      const ai = getAiClient();

      const itemsSummary = ocrItems.length > 0
        ? ocrItems.map((item: any, i: number) => `${i + 1}. [${item.category}] 原文: "${item.original}" -> 譯文: "${item.translation}"`).join('\n')
        : '（目前尚未辨識文字）';

      const systemInstruction = `你是一位專業親切、經驗豐富的「隨身 AI 旅遊翻譯與生活智慧顧問」，配備強大的 Gemini 3.6 Flash 多模態能力。
目前使用者上傳了一張圖片，系統已辨識出以下區域文字：
${itemsSummary}

使用者選擇的偏好語言為：${targetLanguage}。

【你的職責】：
1. 根據辨識出的文字與圖片內容，親切解答使用者的疑問（例如：推薦菜色、成分過敏分析、在地文化由來、交通指引、購物比價）。
2. 若使用者要求「幫我寫點餐日語/韓語/英語句」或「怎麼跟店員說？」，請提供對應當地語言的在地句型、注音或羅馬拼音、以及翻譯說明，並提醒發音要點。
3. 回覆請保持條理清晰、排版優雅、適當使用 Markdown 粗體與條列點，閱讀體驗流暢舒適。`;

      let contents: any[] = [];

      // If base64 image provided, pass image in the prompt
      if (imageBase64) {
        const { cleanBase64, mimeType: detectedMime } = parseAndNormalizeImage(imageBase64);
        contents.push({
          parts: [
            {
              inlineData: {
                mimeType: detectedMime,
                data: cleanBase64,
              },
            },
            {
              text: `使用者提問：${userMessage}`,
            },
          ],
        });
      } else {
        contents.push({
          parts: [{ text: `使用者提問：${userMessage}` }],
        });
      }

      // Helper to add timeout to promise
      const withTimeout = (promise: Promise<any>, ms: number) => {
        let timeoutHandle: any;
        const timeoutPromise = new Promise((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error('TIMEOUT')), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
      };

      const modelChain = [
        { model: 'gemini-3.6-flash', timeout: 10000 },
        { model: 'gemini-3.1-flash-lite', timeout: 7000 }
      ];
      
      let reply = '';
      let lastError: any = null;

      for (const config of modelChain) {
        try {
          const apiCall = ai.models.generateContent({
            model: config.model,
            contents,
            config: { systemInstruction },
          });
          const response = await withTimeout(apiCall, config.timeout);
          reply = (response.text || '').trim();
          if (reply) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Gemini Assistant: Model ${config.model} failed or timed out:`, err.message || err);
          continue;
        }
      }

      if (!reply) {
        throw lastError || new Error('All models failed');
      }

      res.json({
        success: true,
        reply,
      });
    } catch (err: any) {
      console.error('Gemini Assistant API Error:', err);
      let errorMessage = 'Gemini 隨身助手暫時無法回應，請稍後再試。';
      if (err.message) {
        if (err.message.includes('503')) errorMessage = 'Google AI 伺服器目前過度擁擠（503），請稍後再試。';
        else if (err.message.includes('429')) errorMessage = 'API 請求次數已達上限，請稍後再試。';
      }
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  });

  // 5. Unofficial High-Quality TTS Proxy (Google Translate API)
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, lang } = req.body;
      if (!text || !lang) {
        return res.status(400).json({ error: 'Missing text or lang' });
      }

      // Google TTS has a ~200 char limit. Split into safe chunks
      const chunks = text.match(/.{1,200}(\s|。|，|、|！|？|,|\.|$)/g) || [text];
      
      const buffers = [];
      for (const chunk of chunks) {
        if (!chunk.trim()) continue;
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(chunk.trim())}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://translate.google.com/'
          }
        });
        
        if (!response.ok) {
          throw new Error(`TTS fetch failed with status ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        buffers.push(Buffer.from(arrayBuffer));
      }

      const finalBuffer = Buffer.concat(buffers);
      
      res.set('Content-Type', 'audio/mpeg');
      res.set('Cache-Control', 'public, max-age=3600');
      res.send(finalBuffer);
    } catch (err: any) {
      console.error('TTS Proxy Error:', err);
      res.status(500).json({ error: 'TTS Generation failed' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Serve sw.js with no-cache so browser always checks for updates
    app.get('/sw.js', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Type', 'application/javascript');
      res.sendFile(path.join(distPath, 'sw.js'));
    });

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
