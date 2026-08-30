import { SampleImage, TargetLanguage } from '../types';

export const TARGET_LANGUAGES: TargetLanguage[] = [
  { code: '繁體中文', name: '繁體中文', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: '簡體中文', name: '簡體中文', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'English', name: '英文', nativeName: 'English', flag: '🇺🇸' },
  { code: '日本語', name: '日文', nativeName: '日本語', flag: '🇯🇵' },
  { code: '한국어', name: '韓文', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'Français', name: '法文', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'Deutsch', name: '德文', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'Español', name: '西班牙文', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'Tiếng Việt', name: '越南文', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ภาษาไทย', name: '泰文', nativeName: 'ไทย', flag: '🇹🇭' },
];

// SVG generator helper for crisp preset sample photos
function createMenuSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
    <rect width="800" height="1000" fill="#1f1815" />
    <rect x="30" y="30" width="740" height="940" fill="#2d2420" rx="16" stroke="#cfa972" stroke-width="6"/>
    
    <!-- Title -->
    <rect x="220" y="70" width="360" height="80" fill="#8c2318" rx="8"/>
    <text x="400" y="125" font-family="'Hiragino Mincho ProN', serif" font-size="38" font-weight="bold" fill="#fff" text-anchor="middle">居酒屋 櫻花亭</text>

    <!-- Subtitle / Notice -->
    <text x="400" y="180" font-family="sans-serif" font-size="18" fill="#e6c280" text-anchor="middle">【営業時間】17:00〜23:00 (L.O. 22:30) 周一定休</text>

    <!-- Items Section -->
    <line x1="80" y1="210" x2="720" y2="210" stroke="#cfa972" stroke-width="2" stroke-dasharray="8 4"/>

    <!-- Section Title 1 -->
    <rect x="70" y="235" width="200" height="40" fill="#3a2f2a" rx="4"/>
    <text x="170" y="262" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffd700" text-anchor="middle">◆ 名物拉麵 &amp; 串燒 ◆</text>

    <!-- Item 1 -->
    <text x="80" y="330" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">特製豚骨濃厚ラーメン</text>
    <text x="620" y="330" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffd700">¥1,200</text>
    <text x="80" y="365" font-family="sans-serif" font-size="16" fill="#b3a59e">自家製8時間煮込み濃厚豚骨スープ・特製叉焼2枚付き</text>

    <!-- Item 2 -->
    <text x="80" y="430" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">炭火焼き鳥 5本盛り合わせ</text>
    <text x="620" y="430" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffd700">¥980</text>
    <text x="80" y="465" font-family="sans-serif" font-size="16" fill="#b3a59e">秘伝のタレまたは天日塩を選べます (鶏ねぎま・かわ・つくね)</text>

    <!-- Item 3 -->
    <text x="80" y="530" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">和牛ステーキ 鉄板焼き</text>
    <text x="620" y="530" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffd700">¥2,480</text>
    <text x="80" y="565" font-family="sans-serif" font-size="16" fill="#b3a59e">A5等級黒毛和牛サーロイン・わさび醤油添え</text>

    <!-- Section Title 2 -->
    <rect x="70" y="615" width="200" height="40" fill="#3a2f2a" rx="4"/>
    <text x="170" y="642" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ffd700" text-anchor="middle">◆ お飲み物 ◆</text>

    <!-- Item 4 -->
    <text x="80" y="700" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffffff">生ビール (アサヒスーパードライ)</text>
    <text x="620" y="700" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffd700">¥550</text>

    <!-- Item 5 -->
    <text x="80" y="760" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffffff">純米大吟醸 獺祭 (グラス)</text>
    <text x="620" y="760" font-family="sans-serif" font-size="26" font-weight="bold" fill="#ffd700">¥880</text>

    <!-- Notice Box -->
    <rect x="70" y="820" width="660" height="120" fill="#421a18" stroke="#e74c3c" stroke-width="2" rx="8"/>
    <text x="90" y="855" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ff7675">【ご注意・お会計について】</text>
    <text x="90" y="890" font-family="sans-serif" font-size="16" fill="#fab1a0">※ お通し代としてお一人様 350円を頂戴いたします。</text>
    <text x="90" y="920" font-family="sans-serif" font-size="16" fill="#fab1a0">※ 食物アレルギー（小麦・大豆・卵）をお持ちのお客様はスタッフにお申し付けください。</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function createCosmeticsSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
    <rect width="800" height="1000" fill="#f4f0ea" />
    <rect x="40" y="40" width="720" height="920" fill="#ffffff" rx="20" stroke="#d4c3b3" stroke-width="4"/>
    
    <!-- Brand Title -->
    <text x="400" y="110" font-family="serif" font-size="34" font-weight="bold" fill="#4a3b32" text-anchor="middle">SEOUL GLOW CLINIC</text>
    <text x="400" y="155" font-family="sans-serif" font-size="28" font-weight="bold" fill="#b8860b" text-anchor="middle">시카 히알루론 수분 세럼</text>
    <text x="400" y="190" font-family="sans-serif" font-size="18" fill="#887265" text-anchor="middle">Cica Hyaluronic Hydrating Serum (50ml)</text>

    <line x1="80" y1="220" x2="720" y2="220" stroke="#e0d5c9" stroke-width="2"/>

    <!-- Section 1 -->
    <text x="80" y="270" font-family="sans-serif" font-size="22" font-weight="bold" fill="#2c3e50">[제품 특징 및 효능]</text>
    <text x="80" y="310" font-family="sans-serif" font-size="18" fill="#34495e">민감해진 피부를 빠르게 진정시키고 깊은 수분을 공급하는 고농축 세럼입니다.</text>
    <text x="80" y="340" font-family="sans-serif" font-size="18" fill="#34495e">병풀추출물 82% 함유로 피부 장벽 강화에 도움을 줍니다.</text>

    <!-- Section 2 -->
    <text x="80" y="410" font-family="sans-serif" font-size="22" font-weight="bold" fill="#2c3e50">[사용 방법]</text>
    <text x="80" y="450" font-family="sans-serif" font-size="18" fill="#34495e">토너 사용 후, 적당량을 덜어 얼굴 전체에 부드럽게 펼쳐 발라 흡수시켜 줍니다.</text>
    <text x="80" y="480" font-family="sans-serif" font-size="18" fill="#34495e">건조함이 느껴지는 부위에는 한번 더 레이어링하여 발라줍니다.</text>

    <!-- Section 3 -->
    <text x="80" y="550" font-family="sans-serif" font-size="22" font-weight="bold" fill="#2c3e50">[전성분]</text>
    <text x="80" y="590" font-family="sans-serif" font-size="15" fill="#7f8c8d">병풀추출물, 정제수, 글리세린, 부틸렌글라이콜, 1,2-헥산다이올, 소듐하이알루로네이트,</text>
    <text x="80" y="615" font-family="sans-serif" font-size="15" fill="#7f8c8d">마데카소사이드, 아시아티코사이드, 나이아신아마이드, 판테놀, 알란토인, 카보머.</text>

    <!-- Caution Notice -->
    <rect x="70" y="670" width="660" height="230" fill="#fff5f5" stroke="#feb2b2" rx="10" stroke-width="2"/>
    <text x="100" y="710" font-family="sans-serif" font-size="20" font-weight="bold" fill="#c53030">⚠️ [사용 시 주의사항]</text>
    <text x="100" y="750" font-family="sans-serif" font-size="16" fill="#742a2a">1. 화장품 사용 시 직사광선에 의하여 사용부위가 붉은 반점, 부종 등의 증상이 있는 경우 전문의 등과 상담할 것.</text>
    <text x="100" y="785" font-family="sans-serif" font-size="16" fill="#742a2a">2. 상처가 있는 부위 등에는 사용을 자제할 것.</text>
    <text x="100" y="820" font-family="sans-serif" font-size="16" fill="#742a2a">3. 어린이의 손이 닿지 않는 곳에 보관할 것.</text>
    <text x="100" y="855" font-family="sans-serif" font-size="16" fill="#742a2a">4. 직사광선을 피해서 보관할 것.</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function createSignboardSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
    <rect width="800" height="1000" fill="#111827" />
    
    <!-- Top Bar -->
    <rect x="0" y="0" width="800" height="120" fill="#1e3a8a"/>
    <text x="60" y="75" font-family="sans-serif" font-size="38" font-weight="bold" fill="#ffffff">新宿駅 Shinjuku Station</text>
    <text x="680" y="75" font-family="sans-serif" font-size="28" font-weight="bold" fill="#facc15">西口 West Exit</text>

    <!-- Direction Board 1 -->
    <rect x="40" y="160" width="720" height="180" fill="#1f2937" stroke="#3b82f6" stroke-width="4" rx="12"/>
    <text x="80" y="220" font-family="sans-serif" font-size="32" font-weight="bold" fill="#60a5fa">⬅ JR山手線 ・ 中央線 乗り場</text>
    <text x="80" y="260" font-family="sans-serif" font-size="20" fill="#9ca3af">Yamanote Line &amp; Chuo Line Platforms</text>
    <text x="80" y="300" font-family="sans-serif" font-size="18" fill="#fbbf24">※ 1番〜4番線ホームへは階段をご利用ください</text>

    <!-- Direction Board 2 -->
    <rect x="40" y="370" width="720" height="180" fill="#1f2937" stroke="#10b981" stroke-width="4" rx="12"/>
    <text x="80" y="430" font-family="sans-serif" font-size="32" font-weight="bold" fill="#34d399">➡ 小田急線 ・ 京王線 連絡口</text>
    <text x="80" y="470" font-family="sans-serif" font-size="20" fill="#9ca3af">Odakyu &amp; Keio Line Transfer Gate</text>
    <text x="80" y="510" font-family="sans-serif" font-size="18" fill="#d1d5db">箱根・江の島方面 ロマンスカー特急券乗り場</text>

    <!-- Notice Box -->
    <rect x="40" y="580" width="720" height="360" fill="#374151" rx="12"/>
    <rect x="40" y="580" width="720" height="60" fill="#dc2626" rx="12"/>
    <text x="400" y="622" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">🚨 工事に伴う構内通行止めのお知らせ</text>

    <text x="80" y="680" font-family="sans-serif" font-size="20" font-weight="bold" fill="#f87171">【期間】2026年8月1日 〜 10月31日</text>
    <text x="80" y="720" font-family="sans-serif" font-size="18" fill="#f3f4f6">中央地下通路改修工事のため、夜間（23:00〜翌5:00）は</text>
    <text x="80" y="755" font-family="sans-serif" font-size="18" fill="#f3f4f6">B1F 西口改札前通路が一部通行止めとなります。</text>
    <text x="80" y="800" font-family="sans-serif" font-size="18" font-weight="bold" fill="#facc15">【迂回路】南口改札外通路をご利用ください。</text>
    <text x="80" y="850" font-family="sans-serif" font-size="16" fill="#9ca3af">ご不便をおかけしますが、ご理解とご協力をお願い申し上げます。</text>
    <text x="80" y="890" font-family="sans-serif" font-size="16" fill="#9ca3af">お問い合わせ：JR東日本 新宿駅事務室 (03-3342-xxxx)</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'izakaya-menu',
    title: '日式居酒屋菜單 (Japanese Izakaya Menu)',
    category: '菜單翻譯',
    flag: '🇯🇵',
    description: '包含招牌拉麵、炭火串燒、和牛及清酒，並有日文結帳與小菜費提示',
    dataUrl: createMenuSvg(),
    presetItems: [
      {
        id: 'preset-1',
        original: '居酒屋 櫻花亭',
        translation: '居酒屋 櫻花亭',
        box_2d: [70, 220, 150, 580],
        category: 'title',
      },
      {
        id: 'preset-2',
        original: '【営業時間】17:00〜23:00 (L.O. 22:30) 周一定休',
        translation: '【營業時間】17:00〜23:00 (最後點餐 22:30) 週一公休',
        box_2d: [160, 100, 200, 700],
        category: 'notice',
      },
      {
        id: 'preset-3',
        original: '特製豚骨濃厚ラーメン ¥1,200',
        translation: '特製濃郁豚骨拉麵 1,200日圓',
        box_2d: [300, 80, 340, 720],
        category: 'item',
      },
      {
        id: 'preset-4',
        original: '自家製8時間煮込み濃厚豚骨スープ・特製叉焼2枚付き',
        translation: '自家燉煮 8 小時濃郁豚骨湯頭，附 2 片特製叉燒',
        box_2d: [350, 80, 380, 680],
        category: 'description',
      },
      {
        id: 'preset-5',
        original: '炭火焼き鳥 5本盛り合わせ ¥980',
        translation: '炭火燒鳥 5 串綜合拼盤 980日圓',
        box_2d: [400, 80, 440, 720],
        category: 'item',
      },
      {
        id: 'preset-6',
        original: '秘伝のタレまたは天日塩を選べます (鶏ねぎま・かわ・つくね)',
        translation: '可選擇秘傳醬汁或天日鹽（含蔥醬雞肉串、雞皮、雞肉丸）',
        box_2d: [450, 80, 480, 700],
        category: 'description',
      },
      {
        id: 'preset-7',
        original: '和牛ステーキ 鉄板焼き ¥2,480',
        translation: '鐵板燒和牛牛排 2,480日圓',
        box_2d: [500, 80, 540, 720],
        category: 'item',
      },
      {
        id: 'preset-8',
        original: 'A5等級黒毛和牛サーロイン・わさび醤油添え',
        translation: 'A5 等級黑毛和牛沙朗，附山葵醬油',
        box_2d: [550, 80, 580, 650],
        category: 'description',
      },
      {
        id: 'preset-9',
        original: '生ビール (アサヒスーパードライ) ¥550',
        translation: '生啤酒 (朝日 Asahi Super Dry) 550日圓',
        box_2d: [680, 80, 720, 720],
        category: 'item',
      },
      {
        id: 'preset-10',
        original: '純米大吟醸 獺祭 (グラス) ¥880',
        translation: '純米大吟釀 獺祭 (單杯) 880日圓',
        box_2d: [740, 80, 780, 720],
        category: 'item',
      },
      {
        id: 'preset-11',
        original: '※ お通し代としてお一人様 350円を頂戴いたします。',
        translation: '※ 將收取每位顧客 350 日圓開胃小菜費 (Otoshi)。',
        box_2d: [875, 90, 905, 680],
        category: 'notice',
      },
      {
        id: 'preset-12',
        original: '※ 食物アレルギー（小麦・大豆・卵）をお持ちのお客様はスタッフにお申し付けください。',
        translation: '※ 食物過敏（小麥、大豆、雞蛋）的顧客請告知服務人員。',
        box_2d: [905, 90, 935, 720],
        category: 'notice',
      },
    ],
  },
  {
    id: 'korean-cosmetic',
    title: '韓系美妝外盒 (Korean Cosmetic Box)',
    category: '商品成分與警語',
    flag: '🇰🇷',
    description: '積雪草玻尿酸精華液之成分、功效、使用方法與皮膚過敏警告',
    dataUrl: createCosmeticsSvg(),
    presetItems: [
      {
        id: 'kr-1',
        original: 'SEOUL GLOW CLINIC',
        translation: '首爾光采診所 SEOUL GLOW CLINIC',
        box_2d: [80, 100, 130, 700],
        category: 'title',
      },
      {
        id: 'kr-2',
        original: '시카 히알루론 수분 세럼',
        translation: '積雪草玻尿酸水潤保濕精華液',
        box_2d: [130, 100, 170, 700],
        category: 'item',
      },
      {
        id: 'kr-3',
        original: '[제품 특징 및 효능] 민감해진 피부를 빠르게 진정시키고 깊은 수분을 공급하는 고농축 세럼입니다.',
        translation: '【產品特色與功效】能快速舒緩敏感肌膚並深層補水的高濃縮精華液。',
        box_2d: [250, 80, 320, 720],
        category: 'description',
      },
      {
        id: 'kr-4',
        original: '[사용 방법] 토너 사용 후, 적당량을 덜어 얼굴 전체에 부드럽게 펼쳐 발라 흡수시켜 줍니다.',
        translation: '【使用方法】使用化妝水後，取適量輕柔塗抹於全臉至吸收。',
        box_2d: [390, 80, 460, 720],
        category: 'description',
      },
      {
        id: 'kr-5',
        original: '[전성분] 병풀추출물, 정제수, 글리세린, 부틸렌글라이콜, 1,2-헥산다이올, 소듐하이알루로네이트, 마데카소사이드...',
        translation: '【全成分】積雪草萃取物、純淨水、甘油、丁二醇、1,2-己二醇、透明質酸鈉、羥基積雪草苷...',
        box_2d: [530, 80, 630, 720],
        category: 'description',
      },
      {
        id: 'kr-6',
        original: '⚠️ [사용 시 주의사항] 1. 화장품 사용 시 직사광선에 의하여 사용부위가 붉은 반점, 부종 등의 증상이 있는 경우 전문의 등과 상담할 것.',
        translation: '⚠️【使用注意事項】1. 使用後若因陽光直射出現紅斑、腫脹等異常症狀，請諮詢皮膚科專業醫師。',
        box_2d: [670, 70, 900, 730],
        category: 'notice',
      },
    ],
  },
  {
    id: 'tokyo-sign',
    title: '新宿車站路標與施工告示 (Shinjuku Signboard)',
    category: '路標與告示',
    flag: '🇯🇵',
    description: '轉乘月台指示、小田急特急券處與深夜通道封閉繞行警告',
    dataUrl: createSignboardSvg(),
    presetItems: [
      {
        id: 'sign-1',
        original: '新宿駅 Shinjuku Station 西口 West Exit',
        translation: '新宿站 Shinjuku Station 西口',
        box_2d: [0, 0, 120, 800],
        category: 'title',
      },
      {
        id: 'sign-2',
        original: '⬅ JR山手線 ・ 中央線 乗り場',
        translation: '⬅ JR 山手線・中央線 搭乘處',
        box_2d: [160, 40, 340, 760],
        category: 'item',
      },
      {
        id: 'sign-3',
        original: '➡ 小田急線 ・ 京王線 連絡口 (箱根・江の島方面 ロマンスカー特急券乗り場)',
        translation: '➡ 小田急線・京王線 轉乘聯絡口 (箱根/江之島方向 浪漫特快車票售票處)',
        box_2d: [370, 40, 550, 760],
        category: 'item',
      },
      {
        id: 'sign-4',
        original: '🚨 工事に伴う構内通行止めのお知らせ (中央地下通路改修工事)',
        translation: '🚨 配合工程站內施工封閉通知 (中央地下通道改建工程)',
        box_2d: [580, 40, 640, 760],
        category: 'title',
      },
      {
        id: 'sign-5',
        original: '【期間】2026年8月1日 〜 10月31日 夜間（23:00〜翌5:00）B1F 西口改札前通路一部通行止め',
        translation: '【期間】2026/8/1〜10/31 夜間 (23:00〜次日05:00) B1F 西口剪票口前通道部分封閉',
        box_2d: [650, 40, 770, 760],
        category: 'notice',
      },
      {
        id: 'sign-6',
        original: '【迂回路】南口改札外通路をご利用ください。',
        translation: '【替代路線】請改為改用南口改札外通道通行。',
        box_2d: [780, 40, 840, 760],
        category: 'notice',
      },
    ],
  },
];
