import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

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

【本次執行指令】
目標語言：${targetLanguage}
所選場景模式：${scene}
${customNote ? `特別補充需求：${customNote}` : ''}
請讀取隨附的圖片，並嚴格遵守上述規範，僅輸出 JSON Array 格式結果。`;

      const response = await ai.models.generateContent({
        model: selectedModel,
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
              },
              required: ['original', 'translation', 'box_2d', 'category'],
            },
          },
        },
      });

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
      res.status(500).json({
        success: false,
        error: err.message || '無法處理圖片，請稍後再試。',
      });
    }
  });

  // 3. Cultural & Dietary Context Detail Generator API
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({
        success: true,
        explanation: response.text,
      });
    } catch (err: any) {
      console.error('Cultural Explain Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || '無法產生文化解說，請稍後再試。',
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      res.json({
        success: true,
        reply: response.text,
      });
    } catch (err: any) {
      console.error('Gemini Assistant API Error:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Gemini 隨身助手暫時無法回應，請稍後再試。',
      });
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
