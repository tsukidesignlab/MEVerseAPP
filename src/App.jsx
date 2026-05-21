import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bell, ArrowLeft, Camera, Image as ImageIcon, FileText, Mic,
  Pencil, Sticker, Plus, ChevronLeft, ChevronRight, Search,
  Calendar, Sparkles, Star, Eye, BookOpen, Users, Target,
  TrendingUp, Download, Heart, X, Check, Upload, Headphones,
  Hand, MessageCircle, PenTool, Music, Type, Brush, Hammer,
  Package, Compass, Zap, Globe, Home as HomeIcon, Settings,
  User, Smile, Frown, Meh, Battery, Coffee, AlertCircle,
  ArrowRight, Save, RotateCcw, Trash2, Share2, Award, Map,
  Lightbulb, Activity, Layers, Filter, Mic2, Hash, Play
} from 'lucide-react';

// ============== localStorage hook ==============
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return initialValue;
      return JSON.parse(stored);
    } catch (e) {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // 容量已滿等等問題就靜默處理
    }
  }, [key, value]);
  return [value, setValue];
}

// 清除所有 ME:Verse 資料（profile 頁面用）
function clearAllData() {
  ['meverse:profile', 'meverse:records', 'meverse:diaries', 'meverse:missions', 'meverse:holland']
    .forEach(k => window.localStorage.removeItem(k));
}

// ============== 圖片壓縮 utility ==============
/**
 * 把使用者上傳的圖片壓縮成可以塞進 localStorage 的尺寸
 * - 長邊縮到 maxSize px
 * - JPEG quality 0.7
 * - 回傳 base64 data URL（可直接放在 <img src> 與 localStorage）
 */
async function compressImage(file, maxSize = 900, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('讀取檔案失敗'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('解析圖片失敗'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * ImagePicker — 包裝隱藏的 <input type="file">，提供
 * - 拍照按鈕（手機會直接開後鏡頭）
 * - 從相簿選擇按鈕（手機會開相簿）
 * - 桌面瀏覽器則兩個按鈕都會開檔案總管
 *
 * onPick 收到 { dataUrl, name } 物件。
 */
function ImagePicker({ onPick, open, onClose }) {
  const cameraRef = useRef(null);
  const albumRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await compressImage(file);
      onPick({ dataUrl, name: file.name.replace(/\.[^.]+$/, '').slice(0, 20) });
      onClose();
    } catch (err) {
      alert('圖片處理失敗：' + err.message);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full bg-black rounded-t-3xl p-5"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 rounded-full mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <div className="text-center mb-4">
          <span className="font-pixel uppercase tracking-wider text-sm" style={{ color: '#C8FF00', fontFamily: "'Press Start 2P', monospace" }}>
            ADD MEDIA
          </span>
          <div className="text-[11px] text-white mt-1">{loading ? '處理中…' : '選擇方式'}</div>
        </div>

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handle} className="hidden" />
        <input ref={albumRef} type="file" accept="image/*" onChange={handle} className="hidden" />

        <div className="grid grid-cols-2 gap-3">
          <button disabled={loading} onClick={() => cameraRef.current?.click()}
            className="py-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition"
            style={{ background: '#C8FF00', color: '#000', fontWeight: 700, opacity: loading ? 0.5 : 1 }}>
            <Camera size={26} />
            <span className="text-xs">拍照</span>
          </button>
          <button disabled={loading} onClick={() => albumRef.current?.click()}
            className="py-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition"
            style={{ background: '#4F4FF5', color: '#fff', fontWeight: 700, opacity: loading ? 0.5 : 1 }}>
            <ImageIcon size={26} />
            <span className="text-xs">從相簿選</span>
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-3 py-2 text-xs"
          style={{ color: 'rgba(255,255,255,0.5)' }}>取消</button>
      </div>
    </div>
  );
}

// ============== 設計系統常數 ==============
const C = {
  bg: '#000000',
  primary: '#4F4FF5',
  primaryDark: '#3A3AD4',
  accent: '#C8FF00',
  accent2: '#D4FF3D',
  white: '#FFFFFF',
  gray: '#1A1A1A',
  textDim: '#888',
};

// ============== Demo 資料 ==============
const HARUKA_DEMO_RECORDS = [
  {
    id: 'r1', date: '2026-03-13', mood: '專注',
    discoveries: ['我發現自己很喜歡拍植物細節', '光影會讓葉子顏色不一樣', '今天的雲移動得很快'],
    interests: ['植物', '光影變化', '攝影'],
    flowMoment: '在公園拍葉脈的時候',
    stuckPoint: '數學的因式分解還是看不懂',
    schoolReflection: { 生物: 9, 國文: 7, 數學: 4, custom: '美術', customScore: 8, mood: '生物課最有感覺' },
    expressionModes: ['拍攝', '看', '寫'],
    mediaUploads: [{ name: '葉脈特寫', emoji: '🌿' }],
    summary: '我發現自己很喜歡拍植物細節。',
  },
  {
    id: 'r2', date: '2026-03-15', mood: '開心',
    discoveries: ['路邊的苔蘚很漂亮', '不同光線下顏色差很多', '想試試微距攝影'],
    interests: ['苔蘚', '自然', '微距'],
    flowMoment: '蹲在地上觀察苔蘚一個多小時',
    stuckPoint: '相機沒辦法拍很近',
    schoolReflection: { 生物: 10, 國文: 6, 數學: 5, custom: '', customScore: 5, mood: '今天生物老師講演化超有趣' },
    expressionModes: ['拍攝', '觀察', '畫'],
    mediaUploads: [{ name: '苔蘚田', emoji: '🍃' }],
    summary: '蹲在地上觀察苔蘚一整個下午。',
  },
  {
    id: 'r3', date: '2026-03-18', mood: '有成就感',
    discoveries: ['海邊撿到海星', '潮間帶生物超多', '海水溫度不同'],
    interests: ['海洋生物', '潮間帶', '生態'],
    flowMoment: '在海邊看到海星，忍不住拍了很多張',
    stuckPoint: '不知道海星怎麼分類',
    schoolReflection: { 生物: 10, 國文: 7, 數學: 5, custom: '地科', customScore: 9, mood: '想去查海洋生物的書' },
    expressionModes: ['拍攝', '觀察', '寫', '作品'],
    mediaUploads: [{ name: '海星', emoji: '⭐' }],
    summary: '今天在海邊看到海星，忍不住拍了很多張。',
  },
];

const FRIENDS_DATA = [
  { name: 'Andy', avatar: '🧑', color: '#4F4FF5', activity: '正在進行「7 天植物觀察任務」', day: 'DAY 3', tag: '#自然觀察' },
  { name: 'Cindy', avatar: '👧', color: '#C8FF00', activity: '發現了雨後葉片上的水珠', day: 'NEW', tag: '#微距' },
  { name: 'Yuchen', avatar: '🧒', color: '#4F4FF5', activity: '完成了「訪問朋友的興趣」任務', day: '完成', tag: '#互動' },
  { name: 'Mira', avatar: '👩', color: '#C8FF00', activity: '寫了 100 字角色日記', day: '完成', tag: '#寫作' },
  { name: 'Kai', avatar: '🧑‍🎨', color: '#4F4FF5', activity: '正在挑戰光影攝影', day: 'DAY 2', tag: '#影像' },
  { name: 'Lin', avatar: '👨', color: '#C8FF00', activity: '完成了「興趣關鍵字地圖」', day: '完成', tag: '#分析' },
];

const HOLLAND_QUESTIONS = [
  { q: '我喜歡動手做東西或修理物品。', type: 'R' },
  { q: '我喜歡觀察自然、生物或現象。', type: 'I' },
  { q: '我喜歡畫畫、設計、音樂或創作。', type: 'A' },
  { q: '我喜歡幫助別人、教別人或陪伴別人。', type: 'S' },
  { q: '我喜歡說服、帶領或組織活動。', type: 'E' },
  { q: '我喜歡整理資料、分類、規劃。', type: 'C' },
  { q: '我喜歡研究問題背後的原因。', type: 'I' },
  { q: '我喜歡參與社團或團體活動。', type: 'S' },
  { q: '我喜歡用影像、文字或作品表達想法。', type: 'A' },
  { q: '我喜歡按照清楚規則完成事情。', type: 'C' },
  { q: '我喜歡規劃活動或推動一件事發生。', type: 'E' },
  { q: '我喜歡戶外、自然、實作型活動。', type: 'R' },
];

const HOLLAND_LABELS = {
  R: { name: 'Realistic 實作型', desc: '喜歡動手做、實際操作', color: '#C8FF00' },
  I: { name: 'Investigative 研究型', desc: '喜歡觀察、研究、分析', color: '#4F4FF5' },
  A: { name: 'Artistic 藝術型', desc: '喜歡創作、表達、設計', color: '#C8FF00' },
  S: { name: 'Social 社會型', desc: '喜歡互動、幫助、陪伴', color: '#4F4FF5' },
  E: { name: 'Enterprising 企業型', desc: '喜歡帶領、推動、組織', color: '#C8FF00' },
  C: { name: 'Conventional 常規型', desc: '喜歡規劃、整理、執行', color: '#4F4FF5' },
};

const MOOD_OPTIONS = [
  { label: '開心', emoji: '😊' },
  { label: '普通', emoji: '😐' },
  { label: '焦慮', emoji: '😰' },
  { label: '疲憊', emoji: '😴' },
  { label: '有成就感', emoji: '✨' },
  { label: '卡住', emoji: '😵' },
];

const EXPRESSION_MODES = ['聽', '身體', '說', '看', '寫', '唱', '打字', '畫', '拍攝', '手作', '錄音', '作品'];

// ============== 關鍵字分析 ==============
const KEYWORDS = {
  observe: ['觀察', '植物', '動物', '自然', '紀錄', '拍照', '散步', '發現', '細節', '研究', '光影', '風景', '環境', '昆蟲', '生物', '葉', '花', '海', '苔蘚'],
  create: ['畫畫', '設計', '音樂', '寫作', '影片', '攝影', '手作', '創作', '排版', '角色', '作品', '草稿', '顏色', '構圖', '拍', '寫'],
  interact: ['朋友', '聊天', '分享', '討論', '活動', '合作', '社團', '教人', '帶領', '聚會', '團隊', '同學'],
  explore: ['旅行', '嘗試', '新東西', '體驗', '展覽', '未知', '冒險', '挑戰', '第一次', '走走', '參觀', '海邊'],
  analyze: ['整理', '資料', '邏輯', '數據', '分析', '計畫', '比較', '問題', '解決', '分類', '歸納'],
  feel: ['情緒', '感覺', '喜歡', '討厭', '舒服', '壓力', '焦慮', '開心', '低落', '放鬆', '觸動', '有感覺'],
};

function analyzeRecords(records) {
  if (!records || records.length === 0) {
    return {
      counts: { observe: 8, create: 6, explore: 3, interact: 2, analyze: 4, feel: 5 },
      total: 28, primary: 'observe', secondary: 'create',
      hollandGuess: { R: 56, I: 86, A: 81, S: 32, E: 28, C: 45 },
      topInterests: ['自然 / 生物', '影像紀錄', '研究探索'],
      expressionBreakdown: { 拍攝: 40, 寫: 25, 觀察: 20, 畫: 10, 作品: 5 },
    };
  }
  const counts = { observe: 0, create: 0, interact: 0, explore: 0, analyze: 0, feel: 0 };
  const allText = records.flatMap(r => [
    ...(r.discoveries || []), ...(r.interests || []),
    r.flowMoment || '', r.stuckPoint || '', r.summary || ''
  ]).join(' ');
  Object.entries(KEYWORDS).forEach(([k, words]) => {
    words.forEach(w => { if (allText.includes(w)) counts[k] += 1; });
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1][0];
  const expCount = {};
  records.forEach(r => (r.expressionModes || []).forEach(m => {
    expCount[m] = (expCount[m] || 0) + 1;
  }));
  const expTotal = Object.values(expCount).reduce((a, b) => a + b, 0) || 1;
  const expressionBreakdown = {};
  Object.entries(expCount).forEach(([k, v]) => {
    expressionBreakdown[k] = Math.round((v / expTotal) * 100);
  });
  return {
    counts, total, primary, secondary,
    hollandGuess: {
      R: 40 + counts.observe * 3 + counts.create * 2,
      I: 50 + counts.observe * 4 + counts.analyze * 3,
      A: 45 + counts.create * 5,
      S: 30 + counts.interact * 6,
      E: 25 + counts.explore * 4 + counts.interact * 2,
      C: 35 + counts.analyze * 5,
    },
    topInterests: ['自然 / 生物', '影像紀錄', '研究探索'],
    expressionBreakdown: Object.keys(expressionBreakdown).length ? expressionBreakdown : { 拍攝: 40, 寫: 30, 畫: 20, 作品: 10 },
  };
}

// ============== UI 元件 ==============
const PixelText = ({ children, className = '', size = 'base' }) => (
  <span className={`font-pixel uppercase tracking-wider ${className}`} style={{ fontFamily: "'Press Start 2P', 'VT323', monospace" }}>
    {children}
  </span>
);

const GlowOrb = ({ color = '#C8FF00', size = 300, opacity = 0.4, top = '50%', left = '50%' }) => (
  <div className="absolute pointer-events-none" style={{
    width: size, height: size, top, left,
    transform: 'translate(-50%, -50%)',
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    opacity, filter: 'blur(30px)',
  }} />
);

const TornCard = ({ children, color = '#4F4FF5', className = '' }) => (
  <div className={`relative ${className}`} style={{
    background: color,
    clipPath: 'polygon(0% 6%, 3% 0%, 8% 5%, 14% 0%, 20% 5%, 27% 0%, 33% 5%, 40% 0%, 46% 5%, 53% 0%, 60% 5%, 66% 0%, 73% 5%, 80% 0%, 86% 5%, 92% 0%, 100% 6%, 100% 94%, 97% 100%, 92% 95%, 86% 100%, 80% 95%, 73% 100%, 66% 95%, 60% 100%, 53% 95%, 46% 100%, 40% 95%, 33% 100%, 27% 95%, 20% 100%, 14% 95%, 8% 100%, 3% 95%, 0% 94%)',
    padding: '20px 18px',
  }}>{children}</div>
);

const FloatingIcon = ({ children, bg = '#4F4FF5' }) => (
  <div className="relative flex flex-col items-center">
    <div className="relative" style={{ background: bg, borderRadius: 18, padding: 18, boxShadow: '0 0 0 1px rgba(255,255,255,0.06)' }}>
      {children}
    </div>
    <div className="mt-1 w-8 h-1.5 rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)' }} />
  </div>
);

const TopBar = ({ title, onBack, onHome }) => (
  <div className="flex items-center justify-between px-5 pt-3 pb-2">
    {onBack ? (
      <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <ArrowLeft size={18} color="white" />
      </button>
    ) : <div className="w-9" />}
    <PixelText className="text-white text-xs">{title}</PixelText>
    {onHome ? (
      <button onClick={onHome} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <HomeIcon size={16} color="white" />
      </button>
    ) : <div className="w-9" />}
  </div>
);

const PrimaryBtn = ({ children, onClick, full = false, variant = 'primary' }) => {
  const bg = variant === 'primary' ? C.primary : variant === 'accent' ? C.accent : 'transparent';
  const color = variant === 'accent' ? '#000' : '#fff';
  const border = variant === 'ghost' ? '1px solid rgba(255,255,255,0.2)' : 'none';
  return (
    <button onClick={onClick} className={`${full ? 'w-full' : ''} py-3 px-5 rounded-2xl font-bold text-sm transition active:scale-95`}
      style={{ background: bg, color, border, boxShadow: variant === 'accent' ? `0 0 30px ${C.accent}55` : variant === 'primary' ? `0 0 30px ${C.primary}55` : 'none' }}>
      {children}
    </button>
  );
};

// ============== 主元件 ==============
export default function MEVerse() {
  const [page, setPage] = useState('login');
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useLocalStorage('meverse:profile', null);
  const [records, setRecords] = useLocalStorage('meverse:records', []);
  const [diaries, setDiaries] = useLocalStorage('meverse:diaries', []);
  const [missions, setMissions] = useLocalStorage('meverse:missions', []);
  const [holland, setHolland] = useLocalStorage('meverse:holland', {
    preTest: { R: 46, I: 72, A: 68, S: 35, E: 30, C: 50 },
    current: null,
  });
  const [insightTab, setInsightTab] = useState('weekly');

  // 已有 profile 時，自動跳過登入頁
  useEffect(() => {
    if (profile && page === 'login') setPage('home');
  }, []); // eslint-disable-line

  const goto = (p) => { setHistory(h => [...h, page]); setPage(p); };
  const back = () => {
    setHistory(h => {
      if (h.length === 0) { setPage('home'); return h; }
      const prev = h[h.length - 1];
      setPage(prev);
      return h.slice(0, -1);
    });
  };
  const home = () => { setHistory([]); setPage('home'); };

  // 載入 Haruka demo
  const loadHarukaDemo = () => {
    setProfile({
      name: 'Haruka', grade: '國三', avatar: '🌙',
      style: '安靜觀察型', tags: ['自然感知型', '影像記錄型', '研究探索型'],
    });
    setRecords(HARUKA_DEMO_RECORDS);
    setDiaries([{ id: 'd1', date: '2026-03-15', text: '今天在公園待了好久，光線從葉子間穿過來的樣子讓我停下來。', bg: 'dot', emoji: '🌿' }]);
    setMissions([
      { id: 'm1', title: '7 天植物觀察挑戰', difficulty: 'high', time: '7 天', tag: '觀察', status: 'in-progress', day: 3, why: '你近期最常拍植物與光影細節' },
      { id: 'm2', title: '生物微距記錄', difficulty: 'mid', time: '1-2 天', tag: '影像', status: 'pending', why: '你對自然細節敏感度高' },
      { id: 'm3', title: '光照變化小實驗', difficulty: 'low', time: '10 分鐘', tag: '探索', status: 'completed', why: '延伸你對光影變化的興趣' },
    ]);
    setHolland({
      preTest: { R: 46, I: 72, A: 68, S: 35, E: 30, C: 50 },
      current: { R: 59, I: 86, A: 81, S: 38, E: 32, C: 55 },
    });
    home();
  };

  const analysis = useMemo(() => analyzeRecords(records), [records]);

  return (
    <div className="min-h-screen w-full flex items-start justify-center py-6 px-4" style={{
      background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f1a 50%, #000 100%)',
      fontFamily: "'Noto Sans TC', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Silkscreen:wght@400;700&family=Noto+Sans+TC:wght@400;500;700;900&display=swap');
        .font-pixel { font-family: 'Press Start 2P', monospace; }
        .font-mono-pixel { font-family: 'VT323', monospace; font-size: 1.2em; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .float-anim { animation: float 4s ease-in-out infinite; }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      <div className="flex flex-col items-center gap-3">
        {/* 標題 */}
        <div className="text-center mb-2">
          <PixelText className="text-white text-lg">ME:VERSE</PixelText>
          <div className="text-xs mt-1" style={{ color: C.textDim }}>人格探索數位養成手帳 · Prototype</div>
        </div>

        {/* 手機框架 */}
        <div className="relative" style={{
          width: 390, height: 820, background: '#000',
          borderRadius: 44, border: '6px solid #1a1a1a',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
          overflow: 'hidden',
        }}>
          {/* 動態島 */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-black z-50" />

          <div className="h-full overflow-y-auto scrollbar-hide" style={{ background: '#000' }}>
            {page === 'login' && <LoginPage goto={goto} loadDemo={loadHarukaDemo} />}
            {page === 'character' && <CharacterPage goto={goto} setProfile={setProfile} loadDemo={loadHarukaDemo} />}
            {page === 'home' && <HomePage goto={goto} profile={profile} records={records} loadDemo={loadHarukaDemo} />}
            {page === 'daily' && <DailyRecordPage back={back} home={home} records={records} setRecords={setRecords} goto={goto} />}
            {page === 'free' && <FreeSharePage back={back} home={home} diaries={diaries} setDiaries={setDiaries} />}
            {page === 'weekly' && <WeeklyReviewPage back={back} home={home} records={records} diaries={diaries} goto={goto} analysis={analysis} />}
            {page === 'holland' && <HollandPage back={back} home={home} holland={holland} setHolland={setHolland} />}
            {page === 'mission' && <MissionPage back={back} home={home} missions={missions} setMissions={setMissions} analysis={analysis} />}
            {page === 'insight' && <InsightPage back={back} home={home} records={records} missions={missions} analysis={analysis} tab={insightTab} setTab={setInsightTab} goto={goto} />}
            {page === 'poster' && <PosterPage back={back} home={home} profile={profile} analysis={analysis} holland={holland} />}
            {page === 'friends' && <FriendsPage back={back} home={home} />}
            {page === 'profile' && <ProfilePage back={back} home={home} profile={profile} setProfile={setProfile} />}
          </div>
        </div>

        {/* Demo 按鈕 */}
        <div className="flex gap-2 mt-3 flex-wrap justify-center max-w-[420px]">
          <button onClick={loadHarukaDemo} className="px-3 py-1.5 text-xs rounded-full font-bold"
            style={{ background: C.accent, color: '#000' }}>
            🌙 載入 Haruka 範例資料
          </button>
          <button onClick={() => goto('insight')} className="px-3 py-1.5 text-xs rounded-full font-bold"
            style={{ background: C.primary, color: '#fff' }}>
            ✨ 一鍵產生 Demo Insight
          </button>
          <button onClick={home} className="px-3 py-1.5 text-xs rounded-full font-bold"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            🏠 回首頁
          </button>
        </div>
      </div>
    </div>
  );
}

// ============== 1. 登入頁 ==============
function LoginPage({ goto, loadDemo }) {
  return (
    <div className="h-full relative flex flex-col items-center justify-between p-6 pt-16 overflow-hidden">
      <GlowOrb color={C.primary} size={400} top="40%" left="50%" opacity={0.5} />
      <GlowOrb color={C.accent} size={200} top="20%" left="80%" opacity={0.3} />

      <div className="text-center z-10 mt-8">
        <div className="mb-3" style={{ filter: `drop-shadow(0 0 20px ${C.accent}88)` }}>
          <PixelText className="text-white text-3xl block">ME:</PixelText>
          <PixelText className="text-white text-3xl block" style={{ color: C.accent }}>VERSE</PixelText>
        </div>
        <div className="text-white text-base font-bold mt-6">人格探索數位養成手帳</div>
        <div className="text-xs mt-2 px-4" style={{ color: C.textDim, lineHeight: 1.6 }}>
          How do you express yourself?<br />Let's explore the future together.
        </div>
      </div>

      {/* 星球 */}
      <div className="relative z-10 my-4 float-anim">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <defs>
            <radialGradient id="planet" cx="40%" cy="40%">
              <stop offset="0%" stopColor={C.accent} />
              <stop offset="50%" stopColor={C.primary} />
              <stop offset="100%" stopColor="#1a1a3a" />
            </radialGradient>
          </defs>
          <circle cx="90" cy="90" r="60" fill="url(#planet)" />
          <ellipse cx="90" cy="90" rx="85" ry="20" fill="none" stroke={C.accent} strokeWidth="1.5" opacity="0.6" transform="rotate(-20 90 90)" />
          <ellipse cx="90" cy="90" rx="85" ry="20" fill="none" stroke={C.primary} strokeWidth="1.5" opacity="0.6" transform="rotate(20 90 90)" />
          <circle cx="40" cy="40" r="2" fill={C.accent} />
          <circle cx="150" cy="50" r="1.5" fill="white" />
          <circle cx="160" cy="130" r="2" fill={C.accent} />
          <circle cx="30" cy="140" r="1.5" fill="white" />
        </svg>
      </div>

      <div className="w-full space-y-3 z-10 mb-2">
        <PrimaryBtn full onClick={() => goto('character')} variant="accent">登入 LOGIN</PrimaryBtn>
        <PrimaryBtn full onClick={() => goto('character')} variant="ghost">註冊 SIGN UP</PrimaryBtn>
        <button onClick={loadDemo} className="w-full py-2 text-xs" style={{ color: C.accent }}>
          → DEMO MODE：直接以 Haruka 進入
        </button>
      </div>
    </div>
  );
}

// ============== 2. 角色建立頁 ==============
function CharacterPage({ goto, setProfile, loadDemo }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('國三');
  const [style, setStyle] = useState('安靜觀察型');
  const [createMethod, setCreateMethod] = useState('photo');

  const styles = ['安靜觀察型', '創作表達型', '行動探索型', '互動分享型', '分析研究型'];
  const grades = ['國一', '國二', '國三', '高一', '高二', '高三'];

  const create = () => {
    setProfile({
      name: name || 'YOU', grade, style, avatar: '✨',
      tags: [style],
    });
    goto('home');
  };

  return (
    <div className="relative min-h-full pb-6">
      <GlowOrb color={C.primary} size={350} top="20%" opacity={0.3} />
      <TopBar title="CREATE YOUR CHARACTER" onBack={() => goto('login')} />

      <div className="px-5 z-10 relative">
        <div className="text-center mb-4 mt-2">
          <PixelText className="text-base" style={{ color: C.accent }}>CHARACTER CREATION</PixelText>
          <div className="text-xs mt-2" style={{ color: C.textDim }}>建立你的人格宇宙化身</div>
        </div>

        {/* 建立方式 */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { k: 'photo', icon: Camera, label: '拍照' },
            { k: 'text', icon: Type, label: '文字' },
            { k: 'image', icon: ImageIcon, label: '影像' },
            { k: 'style', icon: Sparkles, label: '風格' },
          ].map(m => {
            const I = m.icon;
            const active = createMethod === m.k;
            return (
              <button key={m.k} onClick={() => setCreateMethod(m.k)}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center transition"
                style={{
                  background: active ? C.primary : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${active ? C.accent : 'rgba(255,255,255,0.1)'}`,
                }}>
                <I size={18} color={active ? C.accent : '#fff'} />
                <div className="text-[10px] mt-1 text-white">{m.label}</div>
              </button>
            );
          })}
        </div>

        {/* 上傳區 / 角色預覽 */}
        <div className="relative rounded-2xl p-4 mb-4 flex flex-col items-center" style={{
          background: 'linear-gradient(135deg, rgba(79,79,245,0.15) 0%, rgba(200,255,0,0.1) 100%)',
          border: '1px dashed rgba(255,255,255,0.2)',
        }}>
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center mb-2 float-anim"
            style={{ background: C.primary, boxShadow: `0 0 40px ${C.primary}88` }}>
            <Upload size={28} color="white" />
          </div>
          <div className="text-xs text-white">點擊上傳照片 / 拖曳檔案</div>
          <div className="text-[10px] mt-1" style={{ color: C.textDim }}>支援 JPG / PNG · 最大 5MB</div>
        </div>

        {/* 名稱 */}
        <div className="mb-3">
          <div className="text-[11px] mb-1" style={{ color: C.accent }}>NAME · 角色名稱</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="例如：Haruka"
            className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>

        {/* 年級 */}
        <div className="mb-3">
          <div className="text-[11px] mb-1" style={{ color: C.accent }}>GRADE · 年級</div>
          <div className="grid grid-cols-3 gap-2">
            {grades.map(g => (
              <button key={g} onClick={() => setGrade(g)} className="py-2 rounded-lg text-xs font-bold"
                style={{
                  background: grade === g ? C.primary : 'rgba(255,255,255,0.05)',
                  color: grade === g ? '#fff' : C.textDim,
                  border: grade === g ? `1px solid ${C.accent}` : '1px solid rgba(255,255,255,0.08)',
                }}>{g}</button>
            ))}
          </div>
        </div>

        {/* 風格 */}
        <div className="mb-4">
          <div className="text-[11px] mb-1" style={{ color: C.accent }}>STYLE · 角色風格</div>
          <div className="space-y-1.5">
            {styles.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className="w-full px-4 py-2.5 rounded-xl text-xs text-left flex items-center justify-between"
                style={{
                  background: style === s ? C.primary : 'rgba(255,255,255,0.04)',
                  border: style === s ? `1px solid ${C.accent}` : '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}>
                <span>{s}</span>
                {style === s && <Check size={14} color={C.accent} />}
              </button>
            ))}
          </div>
        </div>

        {/* Demo 選擇 */}
        <div className="mb-4 p-3 rounded-2xl" style={{ background: 'rgba(200,255,0,0.05)', border: `1px solid ${C.accent}44` }}>
          <div className="text-[11px] font-bold mb-2" style={{ color: C.accent }}>OR · 使用 DEMO 角色</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={loadDemo} className="p-3 rounded-xl text-left" style={{ background: 'rgba(79,79,245,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-2xl mb-1">🌙</div>
              <div className="text-xs text-white font-bold">Haruka</div>
              <div className="text-[10px]" style={{ color: C.textDim }}>國三 · 觀察型</div>
            </button>
            <button onClick={() => {
              setProfile({ name: 'Yuchen', grade: '高一', style: '互動分享型', avatar: '⚡', tags: ['行動體驗型', '社交互動型'] });
              goto('home');
            }} className="p-3 rounded-xl text-left" style={{ background: 'rgba(200,255,0,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs text-white font-bold">Yuchen</div>
              <div className="text-[10px]" style={{ color: C.textDim }}>高一 · 互動型</div>
            </button>
          </div>
        </div>

        <PrimaryBtn full onClick={create} variant="accent">建立角色 CREATE</PrimaryBtn>
      </div>
    </div>
  );
}

// ============== 3. 主頁 ==============
function HomePage({ goto, profile, records, loadDemo }) {
  const today = new Date();
  const dateStr = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
  const p = profile || { name: 'GUEST', avatar: '🌙', grade: '訪客' };

  const menuItems = [
    { k: 'daily', icon: '⭐', label: '新發現', sub: 'Discovery', target: 'daily' },
    { k: 'daily2', icon: '🔍', label: '新興趣', sub: 'Interest', target: 'daily' },
    { k: 'weekly', icon: '📔', label: '我的手帳', sub: 'Diary', target: 'free' },
    { k: 'study', icon: '📚', label: '課業手帳', sub: 'Study', target: 'daily' },
    { k: 'insight', icon: '✨', label: 'AI星象', sub: 'Insight', target: 'insight' },
    { k: 'holland', icon: 'H', label: 'Holland', sub: '測驗', target: 'holland' },
    { k: 'review', icon: '📅', label: '本週回顧', sub: 'Review', target: 'weekly' },
    { k: 'mission', icon: '🎯', label: '任務探索', sub: 'Mission', target: 'mission' },
    { k: 'friends', icon: '🌐', label: '世界連線', sub: 'Friends', target: 'friends' },
  ];

  return (
    <div className="relative min-h-full pb-6">
      {/* Top: 頭像 + 通知 */}
      <div className="flex items-start justify-between p-5 pt-8">
        <div className="flex items-center gap-3">
          <button onClick={() => goto('profile')} className="relative">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ background: `radial-gradient(circle, ${C.primary}, ${C.accent}33)`, border: `2px solid ${C.accent}` }}>
              {p.avatar || '🌙'}
            </div>
          </button>
          <div>
            <PixelText className="text-white text-sm">Hi, {p.name?.toUpperCase()}</PixelText>
            <div className="text-xs mt-1 text-white">{dateStr} {weekday}</div>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Bell size={16} color="white" />
        </button>
      </div>

      {/* 兔子 + 對話泡泡 */}
      <div className="relative px-5 mb-4">
        <div className="absolute right-2 top-0">
          <div className="text-5xl float-anim" style={{ filter: `drop-shadow(0 0 20px ${C.primary}aa)` }}>🐰</div>
        </div>
        <div className="bg-white rounded-2xl px-4 py-3 mt-12 mr-12 relative">
          <div className="absolute -top-2 right-4 w-3 h-3 bg-white rotate-45" />
          <div className="text-black text-sm font-bold">「今天有什麼新的發現？」</div>
          <div className="text-xs text-neutral-500 mt-1">"今天不用很努力，記得記錄就好！"</div>
        </div>
      </div>

      {/* 3x3 icon grid */}
      <div className="px-5 grid grid-cols-3 gap-3 mb-5">
        {menuItems.map((m, i) => {
          const isAccent = i % 4 === 1 || i % 5 === 3;
          return (
            <button key={i} onClick={() => goto(m.target)} className="aspect-square rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition active:scale-95"
              style={{
                background: C.primary,
                boxShadow: `0 8px 20px ${C.primary}44, 0 0 0 1px rgba(255,255,255,0.05) inset`,
              }}>
              <div className="absolute top-2 left-2.5 text-[10px] text-white font-bold">{m.label}</div>
              <div className="text-3xl mt-3" style={{ filter: `drop-shadow(0 0 8px ${C.accent})` }}>
                {m.icon === 'H' ? (
                  <div className="w-9 h-9 flex items-center justify-center text-base font-bold rounded-md"
                    style={{ background: C.accent, color: '#000', clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}>H</div>
                ) : m.icon}
              </div>
              <div className="absolute bottom-1.5 right-2 text-[8px] uppercase tracking-wider" style={{ color: C.accent }}>{m.sub}</div>
              {/* 漂浮陰影 */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)' }} />
            </button>
          );
        })}
      </div>

      {/* 成長星圖 */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <PixelText className="text-xs text-white">YOUR GROWTH MAP</PixelText>
          <div className="text-[10px]" style={{ color: C.textDim }}>你的成長星圖</div>
        </div>
        <div className="relative h-32 rounded-2xl overflow-hidden flex items-end justify-around px-4 py-3"
          style={{ background: 'linear-gradient(180deg, rgba(79,79,245,0.05) 0%, rgba(200,255,0,0.05) 100%)' }}>
          {/* 波浪線 */}
          <svg viewBox="0 0 300 100" className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M0,50 Q75,20 150,50 T300,50" stroke={C.accent} strokeWidth="1.5" fill="none" opacity="0.5" />
          </svg>
          {['觀察', '拍攝', '寫作', '互動', '實作'].map((label, i) => {
            const heights = [85, 70, 55, 35, 50];
            const colors = [C.accent, C.accent, C.primary, C.primary, C.accent];
            return (
              <div key={i} className="relative flex flex-col items-center z-10 group">
                <div className="relative w-10 h-24 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="absolute bottom-0 left-0 right-0 rounded-full transition-all"
                    style={{ height: `${heights[i]}%`, background: `linear-gradient(180deg, ${colors[i]} 0%, ${C.primary} 100%)` }} />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full"
                    style={{ background: colors[i], boxShadow: `0 0 12px ${colors[i]}` }} />
                </div>
                <div className="text-[9px] text-white mt-1">{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {records.length === 0 && (
        <div className="px-5">
          <button onClick={loadDemo} className="w-full py-3 rounded-2xl text-xs font-bold"
            style={{ background: 'rgba(200,255,0,0.1)', color: C.accent, border: `1px dashed ${C.accent}66` }}>
            🌙 載入 Haruka 範例資料快速預覽
          </button>
        </div>
      )}
    </div>
  );
}

// ============== 4. Daily Record ==============
function DailyRecordPage({ back, home, records, setRecords, goto }) {
  const [discoveries, setDiscoveries] = useState(['', '', '']);
  const [interests, setInterests] = useState(['', '', '']);
  const [bioScore, setBioScore] = useState(7);
  const [chineseScore, setChineseScore] = useState(6);
  const [mathScore, setMathScore] = useState(5);
  const [customSubject, setCustomSubject] = useState('');
  const [customScore, setCustomScore] = useState(5);
  const [schoolMood, setSchoolMood] = useState('');
  const [mood, setMood] = useState('');
  const [flowMoment, setFlowMoment] = useState('');
  const [stuckPoint, setStuckPoint] = useState('');
  const [media, setMedia] = useState([]);
  const [expressions, setExpressions] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const toggleExp = (m) => {
    setExpressions(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const save = (andAnalyze) => {
    const newRecord = {
      id: 'r' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      discoveries: discoveries.filter(Boolean),
      interests: interests.filter(Boolean),
      mood, flowMoment, stuckPoint,
      schoolReflection: { 生物: bioScore, 國文: chineseScore, 數學: mathScore, custom: customSubject, customScore, mood: schoolMood },
      mediaUploads: media,
      expressionModes: expressions,
      summary: discoveries.find(Boolean) || '今日紀錄',
    };
    setRecords([...records, newRecord]);
    if (andAnalyze) goto('insight'); else home();
  };

  const onPickImage = ({ dataUrl, name }) => {
    if (media.length >= 3) return;
    setMedia([...media, { name: name || '新素材', dataUrl }]);
  };

  return (
    <div className="min-h-full pb-6">
      <TopBar title="DAILY RECORD" onBack={back} onHome={home} />
      <div className="px-5 space-y-4">
        <div className="text-center">
          <PixelText className="text-base" style={{ color: C.accent }}>NEW RECORD</PixelText>
          <div className="text-[11px] mt-1" style={{ color: C.textDim }}>{new Date().toISOString().slice(0, 10)}</div>
        </div>

        {/* 1. 三個新發現 */}
        <Section title="①  今日三個新發現" sub="3 Discoveries">
          {discoveries.map((v, i) => (
            <input key={i} value={v} onChange={e => {
              const a = [...discoveries]; a[i] = e.target.value; setDiscoveries(a);
            }} placeholder={[
              '放學路上看到一隻蝴蝶停在花上',
              '發現光影會讓葉子的顏色變不一樣',
              '今天注意到朋友說話的方式'
            ][i]} className="w-full px-3 py-2 rounded-lg text-white text-xs mb-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          ))}
        </Section>

        {/* 2. 興趣 */}
        <Section title="②  今日感興趣的事" sub="3 Interests">
          {interests.map((v, i) => (
            <input key={i} value={v} onChange={e => {
              const a = [...interests]; a[i] = e.target.value; setInterests(a);
            }} placeholder={['昆蟲', '光影變化', '拍攝自然細節'][i]}
              className="w-full px-3 py-2 rounded-lg text-white text-xs mb-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          ))}
        </Section>

        {/* 3. 課業 */}
        <Section title="③  課業感受" sub="Learning Reflection">
          <SubjectSlider label="生物課" tag="興趣程度" value={bioScore} setValue={setBioScore} />
          <SubjectSlider label="國文課" tag="興趣程度" value={chineseScore} setValue={setChineseScore} />
          <SubjectSlider label="數學課" tag="理解程度" value={mathScore} setValue={setMathScore} />
          <div className="flex gap-2 items-center mt-2">
            <input value={customSubject} onChange={e => setCustomSubject(e.target.value)} placeholder="自訂科目"
              className="flex-1 px-3 py-2 rounded-lg text-white text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          {customSubject && <SubjectSlider label={customSubject} tag="自訂" value={customScore} setValue={setCustomScore} />}
          <textarea value={schoolMood} onChange={e => setSchoolMood(e.target.value)} placeholder="今天課堂的心情補充..."
            rows={2} className="w-full px-3 py-2 rounded-lg text-white text-xs outline-none mt-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </Section>

        {/* 4. 心情 */}
        <Section title="④  今日心情" sub="Mood">
          <div className="grid grid-cols-3 gap-2">
            {MOOD_OPTIONS.map(m => (
              <button key={m.label} onClick={() => setMood(m.label)}
                className="py-2 rounded-xl text-xs flex flex-col items-center"
                style={{
                  background: mood === m.label ? C.primary : 'rgba(255,255,255,0.05)',
                  border: mood === m.label ? `1px solid ${C.accent}` : '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}>
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[10px] mt-0.5">{m.label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* 5. 心流 */}
        <Section title="⑤  心流時刻" sub="Flow Moment">
          <textarea value={flowMoment} onChange={e => setFlowMoment(e.target.value)}
            placeholder="今天什麼時候最投入、最忘記時間？"
            rows={2} className="w-full px-3 py-2 rounded-lg text-white text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </Section>

        {/* 6. 卡關 */}
        <Section title="⑥  卡關點" sub="Stuck Point">
          <textarea value={stuckPoint} onChange={e => setStuckPoint(e.target.value)}
            placeholder="今天哪件事讓你覺得卡住？"
            rows={2} className="w-full px-3 py-2 rounded-lg text-white text-xs outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </Section>

        {/* 7. 媒體 */}
        <Section title="⑦  媒體上傳" sub="Media (1-3)">
          <div className="grid grid-cols-3 gap-2">
            {media.map((m, i) => (
              <div key={i} className="aspect-square rounded-xl flex flex-col items-center justify-center relative overflow-hidden"
                style={{ background: 'rgba(79,79,245,0.2)', border: `1px solid ${C.primary}55` }}>
                {m.dataUrl ? (
                  <img src={m.dataUrl} alt={m.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="text-2xl">{m.emoji || '📷'}</div>
                )}
                <input value={m.name} onChange={e => {
                  const a = [...media]; a[i] = { ...a[i], name: e.target.value }; setMedia(a);
                }} placeholder="一句描述..."
                  className="absolute bottom-0 left-0 right-0 text-[9px] text-center text-white outline-none px-1 py-1"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
                <button onClick={() => setMedia(media.filter((_, x) => x !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <X size={10} color="white" />
                </button>
              </div>
            ))}
            {media.length < 3 && (
              <button onClick={() => setPickerOpen(true)} className="aspect-square rounded-xl flex flex-col items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                <Plus size={20} color={C.accent} />
                <div className="text-[9px] text-white mt-1">上傳</div>
              </button>
            )}
          </div>
          {media.length > 0 && (
            <div className="text-[9px] mt-2" style={{ color: C.textDim }}>
              · 已上傳 {media.length} / 3 · 圖片自動壓縮儲存
            </div>
          )}
        </Section>

        {/* 8. 產出方式 */}
        <Section title="⑧  產出方式" sub="Expression Modes">
          <div className="flex flex-wrap gap-1.5">
            {EXPRESSION_MODES.map(m => (
              <button key={m} onClick={() => toggleExp(m)}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{
                  background: expressions.includes(m) ? C.accent : 'rgba(255,255,255,0.05)',
                  color: expressions.includes(m) ? '#000' : '#fff',
                  border: expressions.includes(m) ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontWeight: expressions.includes(m) ? 700 : 400,
                }}>{m}</button>
            ))}
          </div>
        </Section>

        <div className="flex gap-2 pt-2">
          <PrimaryBtn full onClick={() => save(false)} variant="ghost">儲存紀錄</PrimaryBtn>
          <PrimaryBtn full onClick={() => save(true)} variant="accent">儲存並分析</PrimaryBtn>
        </div>
      </div>

      <ImagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={onPickImage} />
    </div>
  );
}

const Section = ({ title, sub, children }) => (
  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="flex items-baseline justify-between mb-3">
      <div className="text-xs text-white font-bold">{title}</div>
      <PixelText className="text-[9px]" style={{ color: C.accent }}>{sub}</PixelText>
    </div>
    {children}
  </div>
);

const SubjectSlider = ({ label, tag, value, setValue }) => (
  <div className="mb-2">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-white">{label}</span>
      <span className="text-[10px]" style={{ color: C.accent }}>{tag} · {value}/10</span>
    </div>
    <input type="range" min="1" max="10" value={value} onChange={e => setValue(+e.target.value)}
      className="w-full" style={{ accentColor: C.accent }} />
  </div>
);

// ============== 5. 自由手帳 ==============
function FreeSharePage({ back, home, diaries, setDiaries }) {
  const [text, setText] = useState('');
  const [bg, setBg] = useState('dot');
  const [stickers, setStickers] = useState([]);
  const [images, setImages] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState('both'); // 'camera' | 'album' | 'both'
  const cameraOnlyRef = useRef(null);
  const albumOnlyRef = useRef(null);
  const fileRef = useRef(null);

  const bgStyles = {
    grid: { background: '#fafaf5', backgroundImage: 'linear-gradient(#0001 1px, transparent 1px), linear-gradient(90deg, #0001 1px, transparent 1px)', backgroundSize: '20px 20px', color: '#000' },
    dot: { background: '#fafaf5', backgroundImage: 'radial-gradient(#0002 1px, transparent 1px)', backgroundSize: '16px 16px', color: '#000' },
    dark: { background: '#1a1a2e', color: '#fff' },
    blue: { background: '#e8edff', color: '#1a1a3a' },
  };

  const save = () => {
    if (!text.trim() && images.length === 0) return;
    setDiaries([...diaries, {
      id: 'd' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      text, bg, stickers, images,
    }]);
    setText('');
    setStickers([]);
    setImages([]);
    home();
  };

  const addSticker = (s) => setStickers([...stickers, { emoji: s, x: Math.random() * 70 + 10, y: Math.random() * 60 + 10 }]);

  // 直接從相機 / 相簿挑（不走 ImagePicker 的 sheet）
  const handleQuickPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setImages([...images, { dataUrl, id: 'img' + Date.now() }]);
    } catch (err) {
      alert('圖片處理失敗：' + err.message);
    }
    e.target.value = '';
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      try {
        const dataUrl = await compressImage(file);
        setImages([...images, { dataUrl, id: 'img' + Date.now() }]);
      } catch (err) {
        alert('處理失敗：' + err.message);
      }
    } else {
      // 其他檔案就附加到文字中
      setText(t => t + (t ? '\n' : '') + `📎 附檔：${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-full pb-6">
      <TopBar title="FREE DIARY" onBack={back} onHome={home} />
      <div className="px-5">
        <div className="text-center mb-3">
          <PixelText className="text-sm" style={{ color: C.accent }}>MY NOTEBOOK</PixelText>
          <div className="text-[11px] mt-1" style={{ color: C.textDim }}>自由形式手帳紀錄</div>
        </div>

        {/* 紙張風格選擇 */}
        <div className="flex gap-2 mb-3">
          {['grid', 'dot', 'dark', 'blue'].map(b => (
            <button key={b} onClick={() => setBg(b)}
              className="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase"
              style={{
                background: bg === b ? C.primary : 'rgba(255,255,255,0.05)',
                color: bg === b ? '#fff' : C.textDim,
                border: bg === b ? `1px solid ${C.accent}` : '1px solid rgba(255,255,255,0.08)',
              }}>{b}</button>
          ))}
        </div>

        {/* 紙張區 */}
        <div className="relative rounded-2xl p-4 mb-3" style={{ ...bgStyles[bg], minHeight: 280 }}>
          {stickers.map((s, i) => (
            <div key={i} className="absolute text-2xl pointer-events-none" style={{ left: `${s.x}%`, top: `${s.y}%` }}>{s.emoji}</div>
          ))}
          {/* 已插入的圖片 */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {images.map(img => (
                <div key={img.id} className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setImages(images.filter(x => x.id !== img.id))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <X size={11} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="今天的紀錄..."
            rows={8}
            className="w-full bg-transparent outline-none text-sm resize-none"
            style={{ color: bgStyles[bg].color, fontFamily: "'Noto Sans TC', sans-serif" }} />
        </div>

        {/* 隱藏的檔案選擇器 */}
        <input ref={cameraOnlyRef} type="file" accept="image/*" capture="environment" onChange={handleQuickPick} className="hidden" />
        <input ref={albumOnlyRef} type="file" accept="image/*" onChange={handleQuickPick} className="hidden" />
        <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />

        {/* 工具列 */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          {[
            { icon: Camera, label: '相機', onClick: () => cameraOnlyRef.current?.click() },
            { icon: ImageIcon, label: '相簿', onClick: () => albumOnlyRef.current?.click() },
            { icon: FileText, label: '檔案', onClick: () => fileRef.current?.click() },
            { icon: Mic, label: '錄音', onClick: () => alert('錄音功能尚未實作（PWA 可呼叫 MediaRecorder API）') },
            { icon: Brush, label: '畫筆', onClick: () => alert('畫筆功能尚未實作（建議用 Canvas API）') },
            { icon: Sticker, label: '貼紙', onClick: () => addSticker(['🌿', '✨', '🌙', '⭐', '🍃', '🌸'][stickers.length % 6]) },
          ].map((t, i) => {
            const I = t.icon;
            return (
              <button key={i} onClick={t.onClick}
                className="aspect-square rounded-xl flex flex-col items-center justify-center active:scale-95 transition"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <I size={14} color={C.accent} />
                <div className="text-[8px] text-white mt-0.5">{t.label}</div>
              </button>
            );
          })}
        </div>

        <PrimaryBtn full onClick={save} variant="accent">儲存日記</PrimaryBtn>

        {diaries.length > 0 && (
          <div className="mt-4">
            <PixelText className="text-[10px] text-white">RECENT DIARIES · {diaries.length}</PixelText>
            <div className="space-y-2 mt-2">
              {diaries.slice(-3).reverse().map(d => (
                <div key={d.id} className="rounded-xl p-3 text-xs"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px]" style={{ color: C.accent }}>{d.date}</div>
                    {d.images?.length > 0 && (
                      <div className="text-[9px]" style={{ color: C.textDim }}>📷 {d.images.length} 張圖</div>
                    )}
                  </div>
                  {d.images?.length > 0 && (
                    <div className="flex gap-1 mb-1">
                      {d.images.slice(0, 3).map(img => (
                        <img key={img.id} src={img.dataUrl} alt="" className="w-10 h-10 rounded object-cover" />
                      ))}
                    </div>
                  )}
                  <div className="text-white line-clamp-2">{d.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============== 6. 週紀錄回顧 ==============
function WeeklyReviewPage({ back, home, records, diaries, goto, analysis }) {
  const [weekNum, setWeekNum] = useState(14);
  const allItems = [...records, ...diaries.map(d => ({ ...d, summary: d.text?.slice(0, 30) }))];

  return (
    <div className="min-h-full pb-6 relative">
      <TopBar title="WEEKLY REVIEW" onBack={back} onHome={home} />

      {/* 週次選擇 */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-center gap-3 rounded-full px-4 py-2 mx-auto w-fit"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setWeekNum(w => Math.max(1, w - 1))}><ChevronLeft size={18} color="white" /></button>
          <PixelText className="text-white text-sm">2026 WEEK {weekNum}</PixelText>
          <button onClick={() => setWeekNum(w => w + 1)}><ChevronRight size={18} color="white" /></button>
        </div>
      </div>

      <div className="px-5 space-y-3 mb-4">
        {/* 紀錄卡片時間軸 */}
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
          {(allItems.length > 0 ? allItems : HARUKA_DEMO_RECORDS).slice(0, 5).map((r, i) => (
            <div key={i} className="relative mb-3">
              <div className="absolute -left-6 top-3">
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path d="M7 0 L8.5 5.5 L14 7 L8.5 8.5 L7 14 L5.5 8.5 L0 7 L5.5 5.5 Z" fill={C.primary} stroke={C.accent} strokeWidth="0.5" />
                </svg>
              </div>
              <div className="bg-white rounded-2xl p-3 flex gap-2 shadow-lg">
                <div className="flex-1">
                  <div className="text-xs font-bold" style={{ color: C.primary }}>{r.date?.slice(5) || '03/' + (10 + i)}</div>
                  <div className="text-xs text-neutral-700 mt-1 line-clamp-2">{r.summary || r.text || '今日紀錄'}</div>
                  {r.mood && <div className="text-[10px] mt-1" style={{ color: C.textDim }}>心情：{r.mood}</div>}
                </div>
                {(r.mediaUploads?.[0] || r.images?.[0] || r.emoji) && (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${C.primary}33, ${C.accent}33)` }}>
                    {r.mediaUploads?.[0]?.dataUrl ? (
                      <img src={r.mediaUploads[0].dataUrl} alt="" className="w-full h-full object-cover" />
                    ) : r.images?.[0]?.dataUrl ? (
                      <img src={r.images[0].dataUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      r.mediaUploads?.[0]?.emoji || r.emoji || '📷'
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 本週重點 */}
        <div className="relative rounded-2xl p-5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <GlowOrb color={C.accent} size={280} top="80%" left="50%" opacity={0.4} />
          <div className="relative z-10 text-center">
            <PixelText className="text-white text-base">本周重點</PixelText>
            <div className="space-y-2 mt-4 text-left">
              <BulletRow text="你這週最常透過觀察與影像紀錄來理解世界。" />
              <BulletRow text="你對自然、生物與細節變化的敏感度正在增加。" />
              <BulletRow text="本週心情趨勢：以專注與成就感為主。" />
              <BulletRow text="探索任務：完成 1 / 3" />
            </div>
          </div>
        </div>

        {/* 輸出入口 */}
        <div className="space-y-2 pt-2">
          <PrimaryBtn full onClick={() => goto('insight')} variant="primary">
            <span className="flex items-center justify-center gap-2"><Sparkles size={14} />生成本週 Insight</span>
          </PrimaryBtn>
          <PrimaryBtn full onClick={() => goto('poster')} variant="accent">
            <span className="flex items-center justify-center gap-2"><Layers size={14} />生成手帳鎖屏</span>
          </PrimaryBtn>
          <PrimaryBtn full onClick={() => goto('poster')} variant="ghost">
            <span className="flex items-center justify-center gap-2"><Award size={14} />生成月份成長海報 →</span>
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

const BulletRow = ({ text }) => (
  <div className="flex gap-2 text-xs text-white">
    <span style={{ color: C.accent }}>·</span>
    <span>{text}</span>
  </div>
);

// ============== 7. Holland 測驗 ==============
function HollandPage({ back, home, holland, setHolland }) {
  const [mode, setMode] = useState(holland.current ? 'result' : 'intro');
  const [answers, setAnswers] = useState(Array(12).fill(3));
  const [qIdx, setQIdx] = useState(0);

  const calcScores = () => {
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    HOLLAND_QUESTIONS.forEach((q, i) => {
      scores[q.type] += answers[i];
      counts[q.type] += 1;
    });
    Object.keys(scores).forEach(k => {
      scores[k] = Math.round((scores[k] / (counts[k] * 5)) * 100);
    });
    return scores;
  };

  const finish = () => {
    const s = calcScores();
    setHolland({ ...holland, current: s });
    setMode('result');
  };

  if (mode === 'intro') {
    return (
      <div className="min-h-full pb-6 relative">
        <TopBar title="HOLLAND CODE TEST" onBack={back} onHome={home} />
        <div className="px-6 pt-4 relative">
          <GlowOrb color={C.primary} size={300} top="30%" opacity={0.4} />
          <div className="text-center relative z-10">
            <div className="text-5xl mb-3">🧭</div>
            <PixelText className="text-white text-lg block mb-2">RIASEC TEST</PixelText>
            <div className="text-xs px-4 mt-3" style={{ color: '#ccc', lineHeight: 1.7 }}>
              透過 12 題簡單評分，初步了解你的興趣傾向。Holland Code 不是最終答案，而是跟日常紀錄一起變化的探索參考。
            </div>
            <div className="mt-6 space-y-2">
              <PrimaryBtn full onClick={() => setMode('test')} variant="accent">開始測驗</PrimaryBtn>
              {holland.current && <PrimaryBtn full onClick={() => setMode('result')} variant="ghost">查看上次結果</PrimaryBtn>}
              <PrimaryBtn full onClick={() => { setHolland({ ...holland, current: { R: 59, I: 86, A: 81, S: 38, E: 32, C: 55 } }); setMode('result'); }} variant="ghost">
                載入 Haruka demo 結果
              </PrimaryBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'test') {
    const q = HOLLAND_QUESTIONS[qIdx];
    return (
      <div className="min-h-full pb-6 relative">
        <TopBar title={`Q ${qIdx + 1} / 12`} onBack={() => setMode('intro')} onHome={home} />
        <div className="px-6 pt-4">
          {/* 進度條 */}
          <div className="w-full h-1.5 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${((qIdx + 1) / 12) * 100}%`, background: C.accent }} />
          </div>

          <div className="text-center mb-8">
            <PixelText className="text-xs" style={{ color: C.accent }}>QUESTION {qIdx + 1}</PixelText>
            <div className="text-white text-base font-bold mt-3 leading-relaxed">{q.q}</div>
          </div>

          <div className="space-y-2">
            {[
              { v: 1, label: '非常不同意' }, { v: 2, label: '不同意' },
              { v: 3, label: '普通' }, { v: 4, label: '同意' }, { v: 5, label: '非常同意' }
            ].map(o => (
              <button key={o.v} onClick={() => {
                const a = [...answers]; a[qIdx] = o.v; setAnswers(a);
                if (qIdx < 11) setTimeout(() => setQIdx(qIdx + 1), 200);
                else setTimeout(finish, 200);
              }} className="w-full py-3 rounded-xl text-sm flex items-center justify-between px-4"
                style={{
                  background: answers[qIdx] === o.v ? C.primary : 'rgba(255,255,255,0.05)',
                  border: answers[qIdx] === o.v ? `1px solid ${C.accent}` : '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}>
                <span>{o.label}</span>
                <span className="text-[11px]" style={{ color: C.accent }}>{o.v}</span>
              </button>
            ))}
          </div>

          {qIdx > 0 && (
            <button onClick={() => setQIdx(qIdx - 1)} className="text-xs mt-4 mx-auto block" style={{ color: C.textDim }}>
              ← 上一題
            </button>
          )}
        </div>
      </div>
    );
  }

  // RESULT
  const scores = holland.current || calcScores();
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const code = sorted.slice(0, 3).map(s => s[0]).join('');

  return (
    <div className="min-h-full pb-6 relative">
      <TopBar title="YOUR HOLLAND CODE" onBack={back} onHome={home} />
      <div className="px-5">
        {/* Code 大顯示 */}
        <div className="text-center mb-4 relative">
          <GlowOrb color={C.accent} size={250} top="50%" opacity={0.3} />
          <div className="text-[11px] mb-1" style={{ color: C.textDim }}>YOUR CODE</div>
          <PixelText className="text-white text-4xl block" style={{ filter: `drop-shadow(0 0 20px ${C.accent})` }}>{code}</PixelText>
        </div>

        {/* 雷達圖 */}
        <RadarChart scores={scores} prev={holland.preTest} />

        {/* 前三高 */}
        <div className="mt-4 space-y-2">
          {sorted.slice(0, 3).map(([k, v], i) => {
            const L = HOLLAND_LABELS[k];
            return (
              <div key={k} className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: i === 0 ? `${C.primary}33` : 'rgba(255,255,255,0.04)', border: `1px solid ${i === 0 ? C.accent : 'rgba(255,255,255,0.08)'}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                  style={{ background: i === 0 ? C.accent : C.primary, color: i === 0 ? '#000' : '#fff' }}>{k}</div>
                <div className="flex-1">
                  <div className="text-xs text-white font-bold">{L.name}</div>
                  <div className="text-[10px]" style={{ color: C.textDim }}>{L.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: C.accent }}>{v}</div>
                  {holland.preTest && (
                    <div className="text-[9px]" style={{ color: C.textDim }}>
                      {holland.preTest[k]} → {v}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 前後測比較 */}
        {holland.preTest && (
          <div className="mt-4 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-white font-bold">前測 → 後測比較</div>
              <PixelText className="text-[9px]" style={{ color: C.accent }}>3 MONTHS</PixelText>
            </div>
            {Object.entries(scores).map(([k, v]) => {
              const prev = holland.preTest[k];
              const diff = v - prev;
              return (
                <div key={k} className="flex items-center gap-2 mb-1.5 text-[10px]">
                  <div className="w-5 font-bold text-white">{k}</div>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${v}%`, background: diff >= 0 ? C.accent : C.primary }} />
                  </div>
                  <div className="w-20 text-right" style={{ color: diff >= 0 ? C.accent : '#ff8888' }}>
                    {prev} → {v} {diff >= 0 ? '↑' : '↓'}{Math.abs(diff)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 p-3 rounded-xl text-[11px]" style={{ background: `${C.accent}11`, border: `1px solid ${C.accent}44`, color: '#fff', lineHeight: 1.6 }}>
          💡 Holland Code 不是最終答案。它會跟著你每天的紀錄一起變化，更像是探索方向的羅盤，而不是命運的決定書。
        </div>

        <div className="mt-3 space-y-2">
          <PrimaryBtn full onClick={() => setMode('intro')} variant="ghost">重新測驗</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

const RadarChart = ({ scores, prev }) => {
  const keys = ['R', 'I', 'A', 'S', 'E', 'C'];
  const angles = keys.map((_, i) => (Math.PI * 2 * i) / 6 - Math.PI / 2);
  const cx = 140, cy = 140, maxR = 100;
  const points = keys.map((k, i) => {
    const r = (scores[k] / 100) * maxR;
    return `${cx + Math.cos(angles[i]) * r},${cy + Math.sin(angles[i]) * r}`;
  }).join(' ');
  const prevPoints = prev ? keys.map((k, i) => {
    const r = (prev[k] / 100) * maxR;
    return `${cx + Math.cos(angles[i]) * r},${cy + Math.sin(angles[i]) * r}`;
  }).join(' ') : '';

  return (
    <div className="relative flex justify-center">
      <svg width="280" height="280" viewBox="0 0 280 280">
        {/* 網格 */}
        {[0.25, 0.5, 0.75, 1].map((scale, idx) => (
          <polygon key={idx}
            points={keys.map((_, i) => `${cx + Math.cos(angles[i]) * maxR * scale},${cy + Math.sin(angles[i]) * maxR * scale}`).join(' ')}
            fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
        {/* 軸 */}
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * maxR} y2={cy + Math.sin(a) * maxR}
            stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
        {/* 前測 */}
        {prev && <polygon points={prevPoints} fill={`${C.primary}33`} stroke={C.primary} strokeWidth="1" strokeDasharray="3 3" />}
        {/* 當前 */}
        <polygon points={points} fill={`${C.accent}55`} stroke={C.accent} strokeWidth="2" style={{ filter: `drop-shadow(0 0 10px ${C.accent}99)` }} />
        {/* 點 */}
        {keys.map((k, i) => {
          const r = (scores[k] / 100) * maxR;
          return <circle key={k} cx={cx + Math.cos(angles[i]) * r} cy={cy + Math.sin(angles[i]) * r} r="4" fill={C.accent} />;
        })}
        {/* 標籤 */}
        {keys.map((k, i) => {
          const x = cx + Math.cos(angles[i]) * (maxR + 18);
          const y = cy + Math.sin(angles[i]) * (maxR + 18);
          return <text key={k} x={x} y={y} fill={C.accent} fontSize="14" fontWeight="700" textAnchor="middle" dominantBaseline="middle"
            style={{ fontFamily: 'Press Start 2P, monospace' }}>{k}</text>;
        })}
      </svg>
    </div>
  );
};

// ============== 8. 任務推薦 ==============
function MissionPage({ back, home, missions, setMissions, analysis }) {
  const [feedbackMission, setFeedbackMission] = useState(null);
  const [filter, setFilter] = useState('all');

  const defaultMissions = [
    { id: 'dm1', title: '7 天植物觀察挑戰', desc: '連續 7 天記錄同一株植物的變化', difficulty: 'high', time: '7 天', tag: '觀察', status: 'pending', why: '你近期最常拍植物與光影細節' },
    { id: 'dm2', title: '生物微距記錄', desc: '拍下 5 張自然細節照片，例如葉脈、花瓣、苔蘚或昆蟲', difficulty: 'mid', time: '1-2 天', tag: '影像', status: 'pending', why: '你對自然細節敏感度高' },
    { id: 'dm3', title: '光照變化小實驗', desc: '觀察不同光照條件下植物狀態的差異', difficulty: 'low', time: '10 分鐘', tag: '探索', status: 'pending', why: '延伸你對光影變化的興趣' },
    { id: 'dm4', title: '把今天卡住的問題拆成 3 個原因', desc: '練習結構化思考', difficulty: 'low', time: '10 分鐘', tag: '分析', status: 'pending', why: '幫助你整理思緒' },
    { id: 'dm5', title: '寫一段 100 字的角色日記', desc: '用第三人稱寫自己的一天', difficulty: 'mid', time: '30 分鐘', tag: '創作', status: 'pending', why: '練習文字表達' },
    { id: 'dm6', title: '訪問一位同學的興趣', desc: '記錄他喜歡什麼、為什麼', difficulty: 'mid', time: '1 天', tag: '互動', status: 'pending', why: '幫助你看見他人視角' },
  ];

  const allMissions = missions.length > 0 ? missions : defaultMissions;
  const filtered = filter === 'all' ? allMissions : allMissions.filter(m => m.difficulty === filter);

  const updateStatus = (id, status) => {
    if (missions.length === 0) setMissions(defaultMissions.map(m => m.id === id ? { ...m, status } : m));
    else setMissions(missions.map(m => m.id === id ? { ...m, status } : m));
  };

  const submitFeedback = (fb) => {
    if (missions.length === 0) setMissions(defaultMissions.map(m => m.id === feedbackMission.id ? { ...m, status: 'completed', feedback: fb } : m));
    else setMissions(missions.map(m => m.id === feedbackMission.id ? { ...m, status: 'completed', feedback: fb } : m));
    setFeedbackMission(null);
  };

  const diffColor = { low: C.accent, mid: C.primary, high: '#FF6B9D' };
  const diffLabel = { low: '低 · 5-10分鐘', mid: '中 · 1-2天', high: '高 · 一週挑戰' };

  return (
    <div className="min-h-full pb-6 relative">
      <TopBar title="MISSION RECOMMENDATION" onBack={back} onHome={home} />
      <div className="px-5">
        <div className="text-center mb-3">
          <PixelText className="text-base" style={{ color: C.accent }}>為你推薦的探索任務</PixelText>
          <div className="text-[11px] mt-2 px-4" style={{ color: C.textDim, lineHeight: 1.6 }}>
            根據你最近對自然觀察、影像紀錄與研究探索的偏好，系統為你準備了以下任務。
          </div>
        </div>

        {/* 難度篩選 */}
        <div className="flex gap-2 mb-4">
          {[
            { k: 'all', label: '全部' },
            { k: 'low', label: '低' },
            { k: 'mid', label: '中' },
            { k: 'high', label: '高' },
          ].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className="flex-1 py-2 rounded-lg text-xs font-bold"
              style={{
                background: filter === f.k ? C.primary : 'rgba(255,255,255,0.05)',
                color: filter === f.k ? '#fff' : C.textDim,
                border: filter === f.k ? `1px solid ${C.accent}` : '1px solid rgba(255,255,255,0.08)',
              }}>{f.label}</button>
          ))}
        </div>

        {/* 任務卡 */}
        <div className="space-y-3">
          {filtered.map((m, i) => (
            <div key={m.id} className="relative">
              <div className="absolute -top-2 left-3 z-10">
                <PixelText className="text-xs px-2 py-1 rounded-md" style={{ background: '#000', color: C.accent, border: `1px solid ${C.accent}` }}>
                  任務卡 {i + 1}
                </PixelText>
              </div>
              <TornCard color={C.primary} className="mt-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm mb-1">{m.title}</div>
                    <div className="text-[11px] text-white/80 mb-2">{m.desc}</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: diffColor[m.difficulty], color: '#000', fontWeight: 700 }}>
                        {diffLabel[m.difficulty]}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(0,0,0,0.3)' }}>#{m.tag}</span>
                      {m.status === 'in-progress' && <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: C.accent, color: '#000', fontWeight: 700 }}>DAY {m.day || 1}</span>}
                      {m.status === 'completed' && <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: C.accent, color: '#000', fontWeight: 700 }}>✓ 完成</span>}
                    </div>
                    <div className="text-[10px] text-white/70 mt-2 italic">💡 {m.why}</div>
                  </div>
                  <div className="text-3xl flex-shrink-0">{['🌿', '🔭', '💡', '📊', '✍️', '👥'][i % 6]}</div>
                </div>
                <div className="flex gap-2 mt-3">
                  {m.status !== 'in-progress' && m.status !== 'completed' && (
                    <button onClick={() => updateStatus(m.id, 'in-progress')} className="flex-1 py-2 rounded-lg text-[11px] font-bold"
                      style={{ background: C.accent, color: '#000' }}>開始任務</button>
                  )}
                  {m.status === 'in-progress' && (
                    <button onClick={() => setFeedbackMission(m)} className="flex-1 py-2 rounded-lg text-[11px] font-bold"
                      style={{ background: C.accent, color: '#000' }}>完成任務</button>
                  )}
                  {m.status === 'completed' && (
                    <div className="flex-1 py-2 rounded-lg text-[11px] text-center text-white/70">已完成 ⭐</div>
                  )}
                </div>
              </TornCard>
            </div>
          ))}
        </div>
      </div>

      {/* 回饋表單 modal */}
      {feedbackMission && (
        <FeedbackModal mission={feedbackMission} onClose={() => setFeedbackMission(null)} onSubmit={submitFeedback} />
      )}
    </div>
  );
}

function FeedbackModal({ mission, onClose, onSubmit }) {
  const [like, setLike] = useState(4);
  const [diff, setDiff] = useState(3);
  const [time, setTime] = useState('30 分鐘');
  const [thought, setThought] = useState('');
  const [retry, setRetry] = useState(true);

  return (
    <div className="absolute inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full bg-black rounded-t-3xl p-5 max-h-[80%] overflow-y-auto"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 rounded-full mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <div className="text-center mb-4">
          <PixelText className="text-sm" style={{ color: C.accent }}>MISSION COMPLETE</PixelText>
          <div className="text-xs text-white mt-1">{mission.title}</div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-[11px] text-white mb-1">喜歡程度</div>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setLike(n)} className="flex-1 py-2 rounded-lg text-xs"
                style={{ background: like >= n ? C.accent : 'rgba(255,255,255,0.05)', color: like >= n ? '#000' : '#fff' }}>★</button>
            ))}</div>
          </div>
          <div>
            <div className="text-[11px] text-white mb-1">困難程度</div>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setDiff(n)} className="flex-1 py-2 rounded-lg text-xs"
                style={{ background: diff >= n ? C.primary : 'rgba(255,255,255,0.05)', color: '#fff' }}>●</button>
            ))}</div>
          </div>
          <div>
            <div className="text-[11px] text-white mb-1">花費時間</div>
            <input value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 rounded-lg text-white text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div>
            <div className="text-[11px] text-white mb-1">一句心得</div>
            <textarea value={thought} onChange={e => setThought(e.target.value)} rows={2}
              placeholder="你最有感的一個瞬間..."
              className="w-full px-3 py-2 rounded-lg text-white text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <label className="flex items-center gap-2 text-xs text-white">
            <input type="checkbox" checked={retry} onChange={e => setRetry(e.target.checked)} />
            想再嘗試類似任務
          </label>
        </div>

        <div className="flex gap-2 mt-4">
          <PrimaryBtn full onClick={onClose} variant="ghost">取消</PrimaryBtn>
          <PrimaryBtn full onClick={() => onSubmit({ like, diff, time, thought, retry })} variant="accent">送出</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ============== 9. AI Insight ==============
function InsightPage({ back, home, records, missions, analysis, tab, setTab, goto }) {
  const tabs = [
    { k: 'daily', label: 'Daily' },
    { k: 'weekly', label: 'Weekly' },
    { k: 'monthly', label: 'Monthly' },
    { k: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="min-h-full pb-6 relative">
      <TopBar title="AI INSIGHT" onBack={back} onHome={home} />

      {/* Tabs */}
      <div className="px-5 mb-3">
        <div className="flex gap-1 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} className="flex-1 py-2 rounded-full text-[10px] font-bold uppercase"
              style={{
                background: tab === t.k ? C.primary : 'transparent',
                color: tab === t.k ? '#fff' : C.textDim,
              }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="relative px-5">
        <GlowOrb color={C.primary} size={300} top="15%" opacity={0.4} />
        <GlowOrb color={C.accent} size={200} top="50%" left="80%" opacity={0.3} />

        <div className="relative z-10 text-center mb-4">
          <PixelText className="text-white text-xl block" style={{ filter: `drop-shadow(0 0 10px ${C.accent}aa)` }}>WEEKLY INSIGHT</PixelText>
          <div className="text-xs text-white mt-3 px-2" style={{ lineHeight: 1.7 }}>
            你最近最容易被自然、生物與細節觀察吸引，並傾向透過拍攝與比較來理解事物。
          </div>
        </div>

        {/* 興趣 Top 3 */}
        <SectionTitle title="興趣主題 TOP 3" sub="Top Interests" />
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: '自然 / 生物', icon: '🔬' },
            { label: '影像紀錄', icon: '📷' },
            { label: '研究探索', icon: '🌿' },
          ].map((t, i) => (
            <div key={i} className="rounded-2xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-[10px] text-white">{t.label}</div>
            </div>
          ))}
        </div>

        {/* Donut Chart - 興趣比例 */}
        <SectionTitle title="興趣分布" sub="Interest Distribution" />
        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <DonutChart data={analysis.counts} />
          <div className="flex-1 space-y-1">
            {Object.entries(analysis.counts).map(([k, v], i) => {
              const labels = { observe: '觀察', create: '創作', interact: '互動', explore: '探索', analyze: '分析', feel: '感受' };
              const total = Object.values(analysis.counts).reduce((a, b) => a + b, 0);
              const pct = Math.round((v / total) * 100);
              return (
                <div key={k} className="flex items-center gap-2 text-[10px]">
                  <div className="w-2 h-2 rounded-full" style={{ background: ['#C8FF00', '#4F4FF5', '#FF6B9D', '#7DD3FC', '#FBBF24', '#A78BFA'][i] }} />
                  <span className="text-white flex-1">{labels[k]}</span>
                  <span style={{ color: C.accent }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 探索方式 */}
        <SectionTitle title="你常用的探索方式" sub="Exploration Modes" />
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: '🔭', label: '觀察' },
            { icon: '📸', label: '拍攝' },
            { icon: '🔨', label: '實作' },
          ].map((m, i) => (
            <div key={i} className="rounded-2xl p-3 text-center relative"
              style={{ background: 'rgba(79,79,245,0.15)', border: `1px solid ${C.primary}44` }}>
              <div className="text-3xl mb-1">{m.icon}</div>
              <div className="text-[10px] text-white">{m.label}</div>
            </div>
          ))}
        </div>

        {/* 產出方式 bar chart */}
        <SectionTitle title="產出方式偏好" sub="Expression Breakdown" />
        <div className="rounded-2xl p-4 mb-4 space-y-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {Object.entries(analysis.expressionBreakdown).slice(0, 5).map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-white">{k}</span>
                <span style={{ color: C.accent }}>{v}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: `${v}%`, background: `linear-gradient(90deg, ${C.primary}, ${C.accent})` }} />
              </div>
            </div>
          ))}
        </div>

        {/* 本週發現 */}
        <SectionTitle title="本週發現" sub="This Week's Discoveries" />
        <div className="space-y-2 mb-4">
          {[
            '你會主動停下來看細節',
            '你喜歡記錄差異，而不只是看表面',
            '你對文字背誦型學習投入較低',
          ].map((t, i) => (
            <div key={i} className="rounded-xl p-3 flex items-start gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                style={{ background: C.accent, color: '#000' }}>{i + 1}</div>
              <div className="text-[11px] text-white" style={{ lineHeight: 1.6 }}>{t}</div>
            </div>
          ))}
        </div>

        {/* 潛在發現 */}
        <SectionTitle title="潛在發現與特質" sub="Hidden Traits" />
        <div className="rounded-2xl p-4 mb-4 space-y-2 text-[11px] text-white"
          style={{ background: `linear-gradient(135deg, ${C.primary}22, ${C.accent}11)`, border: `1px solid ${C.accent}44`, lineHeight: 1.7 }}>
          <div>· 你不是沒有方向，而是比較需要透過真實觀察累積方向感。</div>
          <div>· 你在生物與自然主題上有穩定興趣，但在數學學習上容易因理解卡住而產生壓力。</div>
          <div>· 你適合用影像與手帳紀錄來整理想法。</div>
        </div>

        {/* Data Source */}
        <SectionTitle title="DATA SOURCE" sub="分析資料來源" />
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: '📝', label: '使用者輸入', n: records.length || 3 },
            { icon: '📊', label: '行為數據', n: 12 },
            { icon: '🎯', label: '任務回饋', n: missions.filter(m => m.status === 'completed').length || 1 },
            { icon: '🖼', label: '上傳內容', n: 4 },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-3 flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xl">{s.icon}</div>
              <div className="flex-1">
                <div className="text-[10px] text-white">{s.label}</div>
                <div className="text-[9px]" style={{ color: C.accent }}>{s.n} 筆</div>
              </div>
            </div>
          ))}
        </div>

        {/* 分析流程 */}
        <SectionTitle title="ANALYSIS FLOW" sub="分析原理" />
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="space-y-2">
            {['關鍵字 / 語意分析', '行為模式分析', '偏好權重計算', '主題聚類', '洞察生成'].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <div className="w-5 h-5 rounded-md flex items-center justify-center font-bold"
                  style={{ background: i === 4 ? C.accent : C.primary, color: i === 4 ? '#000' : '#fff' }}>{i + 1}</div>
                <div className="text-white">{s}</div>
                {i < 4 && <ArrowRight size={10} color={C.accent} className="ml-auto" />}
              </div>
            ))}
          </div>
        </div>

        {/* 下週任務入口 */}
        <SectionTitle title="下週任務" sub="Next Missions" />
        <div className="space-y-2 mb-4">
          <button onClick={() => goto('mission')} className="w-full rounded-xl p-3 text-left flex items-center justify-between"
            style={{ background: 'rgba(79,79,245,0.2)', border: `1px solid ${C.primary}55` }}>
            <div>
              <div className="text-xs text-white font-bold">🌿 生物微距記錄</div>
              <div className="text-[10px]" style={{ color: C.textDim }}>探索任務 · 1-2 天</div>
            </div>
            <ChevronRight size={16} color={C.accent} />
          </button>
          <button onClick={() => goto('mission')} className="w-full rounded-xl p-3 text-left flex items-center justify-between"
            style={{ background: 'rgba(79,79,245,0.2)', border: `1px solid ${C.primary}55` }}>
            <div>
              <div className="text-xs text-white font-bold">💡 光照變化小實驗</div>
              <div className="text-[10px]" style={{ color: C.textDim }}>探索任務 · 10 分鐘</div>
            </div>
            <ChevronRight size={16} color={C.accent} />
          </button>
          <button onClick={() => goto('mission')} className="w-full rounded-xl p-3 text-left flex items-center justify-between"
            style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}` }}>
            <div>
              <div className="text-xs text-white font-bold">⭐ 7 天植物觀察挑戰</div>
              <div className="text-[10px]" style={{ color: C.accent }}>挑戰任務 · 一週</div>
            </div>
            <ChevronRight size={16} color={C.accent} />
          </button>
        </div>

        <PrimaryBtn full onClick={() => goto('poster')} variant="accent">
          <span className="flex items-center justify-center gap-2"><Share2 size={14} />生成 Insight 海報</span>
        </PrimaryBtn>
      </div>
    </div>
  );
}

const SectionTitle = ({ title, sub }) => (
  <div className="flex items-baseline justify-between mb-2 mt-3">
    <div className="text-xs text-white font-bold">{title}</div>
    <PixelText className="text-[9px]" style={{ color: C.accent }}>{sub}</PixelText>
  </div>
);

const DonutChart = ({ data }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const colors = ['#C8FF00', '#4F4FF5', '#FF6B9D', '#7DD3FC', '#FBBF24', '#A78BFA'];
  let offset = 0;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
      {Object.entries(data).map(([k, v], i) => {
        const pct = (v / total);
        const circumference = 2 * Math.PI * 36;
        const len = pct * circumference;
        const seg = (
          <circle key={k} cx="50" cy="50" r="36" fill="none" stroke={colors[i]} strokeWidth="14"
            strokeDasharray={`${len} ${circumference}`}
            strokeDashoffset={-offset} transform="rotate(-90 50 50)" />
        );
        offset += len;
        return seg;
      })}
      <text x="50" y="50" fill={C.accent} fontSize="14" fontWeight="700" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: 'Press Start 2P, monospace' }}>{total}</text>
      <text x="50" y="65" fill="white" fontSize="6" textAnchor="middle">DATA POINTS</text>
    </svg>
  );
};

// ============== 10. Growth Poster ==============
function PosterPage({ back, home, profile, analysis, holland }) {
  const [template, setTemplate] = useState('weekly');

  const templates = [
    { k: 'weekly', label: 'Weekly Insight' },
    { k: 'monthly', label: 'Monthly Poster' },
    { k: 'holland', label: 'Holland Poster' },
  ];

  return (
    <div className="min-h-full pb-6">
      <TopBar title="GROWTH POSTER" onBack={back} onHome={home} />

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-1 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {templates.map(t => (
            <button key={t.k} onClick={() => setTemplate(t.k)} className="flex-1 py-2 rounded-full text-[10px] font-bold"
              style={{
                background: template === t.k ? C.primary : 'transparent',
                color: template === t.k ? '#fff' : C.textDim,
              }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Poster */}
      <div className="px-5">
        {template === 'weekly' && <WeeklyInsightCard profile={profile} />}
        {template === 'monthly' && <MonthlyPoster profile={profile} />}
        {template === 'holland' && <HollandPoster profile={profile} holland={holland} />}

        {/* 動作按鈕 */}
        <div className="flex gap-2 mt-4">
          <PrimaryBtn full onClick={() => alert('已複製到剪貼簿（mock）')} variant="ghost">
            <span className="flex items-center justify-center gap-2"><Share2 size={14} />分享</span>
          </PrimaryBtn>
          <PrimaryBtn full onClick={() => alert('已下載到相簿（mock）')} variant="accent">
            <span className="flex items-center justify-center gap-2"><Download size={14} />下載海報</span>
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function WeeklyInsightCard({ profile }) {
  return (
    <div className="relative rounded-2xl overflow-hidden p-5" style={{
      background: 'linear-gradient(180deg, #1a1a3a 0%, #000 100%)',
      aspectRatio: '9 / 16', border: `1px solid ${C.accent}33`,
    }}>
      <GlowOrb color={C.accent} size={220} top="20%" opacity={0.4} />
      <GlowOrb color={C.primary} size={250} top="70%" left="80%" opacity={0.4} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <PixelText className="text-white text-[10px]">WEEK 14 · 2026</PixelText>
          <PixelText className="text-[10px]" style={{ color: C.accent }}>{profile?.name?.toUpperCase() || 'HARUKA'}</PixelText>
        </div>

        <div className="text-center mb-4">
          <PixelText className="text-white text-xl block">WEEKLY</PixelText>
          <PixelText className="text-2xl block" style={{ color: C.accent }}>INSIGHT</PixelText>
        </div>

        <div className="mb-4">
          <div className="text-[10px] mb-1" style={{ color: C.accent }}>本週三個發現</div>
          {['看到光影會讓葉子顏色不一樣', '蹲在地上觀察苔蘚一個下午', '海邊看到海星'].map((t, i) => (
            <div key={i} className="text-[11px] text-white mb-1 flex gap-2">
              <span style={{ color: C.accent }}>0{i + 1}</span>{t}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-[10px] mb-1" style={{ color: C.accent }}>興趣主題</div>
          <div className="flex gap-1 flex-wrap">
            {['#自然', '#生物', '#影像紀錄', '#光影', '#微距'].map(t => (
              <span key={t} className="text-[9px] px-2 py-0.5 rounded-full text-white" style={{ background: `${C.primary}77` }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${C.accent}44` }}>
          <div className="text-[10px]" style={{ color: C.accent }}>隱藏發現</div>
          <div className="text-[11px] text-white mt-1" style={{ lineHeight: 1.5 }}>
            你比想像中更喜歡待在大自然裡，並會主動停下來觀察細節。
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}` }}>
          <div className="text-[10px]" style={{ color: C.accent }}>下週任務</div>
          <div className="text-[11px] text-white mt-1">🌿 7 天植物觀察挑戰</div>
        </div>

        <div className="text-center mt-3">
          <PixelText className="text-[8px]" style={{ color: C.textDim }}>ME:VERSE · KEEP EXPLORING</PixelText>
        </div>
      </div>
    </div>
  );
}

function MonthlyPoster({ profile }) {
  return (
    <div className="relative rounded-2xl overflow-hidden p-5" style={{
      background: 'linear-gradient(135deg, #4F4FF5 0%, #000 60%, #1a1a3a 100%)',
      aspectRatio: '9 / 16', border: `1px solid ${C.accent}55`,
    }}>
      <GlowOrb color={C.accent} size={250} top="40%" opacity={0.5} />

      <div className="relative z-10">
        <div className="text-center mb-3">
          <PixelText className="text-white text-[10px]">ME IN MARCH</PixelText>
          <PixelText className="text-3xl block mt-1" style={{ color: C.accent }}>2026</PixelText>
        </div>

        <div className="rounded-2xl p-3 mb-3 text-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="text-5xl mb-2 float-anim">{profile?.avatar || '🌙'}</div>
          <div className="text-white text-sm font-bold">{profile?.name || 'Haruka'}</div>
          <div className="text-[10px]" style={{ color: C.accent }}>觀察者 · 國三</div>
        </div>

        <PosterRow label="本月關鍵興趣" value="自然觀察 · 影像紀錄 · 生態" />
        <PosterRow label="成長變化" value="I 研究型 72 → 86 · A 藝術型 68 → 81" />
        <PosterRow label="主要產出方式" value="拍攝 40% · 寫作 25%" />
        <PosterRow label="本月新發現" value="比想像中更愛大自然" />

        <div className="rounded-xl p-3 mt-3" style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}` }}>
          <div className="text-[10px]" style={{ color: C.accent }}>下個月任務</div>
          <div className="text-[11px] text-white mt-1">→ 7 天植物觀察挑戰</div>
          <div className="text-[11px] text-white">→ 訪問一位生物老師</div>
        </div>

        <div className="text-center mt-3">
          <PixelText className="text-[8px]" style={{ color: C.textDim }}>ME:VERSE · MONTHLY POSTER</PixelText>
        </div>
      </div>
    </div>
  );
}

const PosterRow = ({ label, value }) => (
  <div className="mb-1.5">
    <div className="text-[9px]" style={{ color: C.accent }}>{label}</div>
    <div className="text-[11px] text-white">{value}</div>
  </div>
);

function HollandPoster({ profile, holland }) {
  const scores = holland.current || { R: 59, I: 86, A: 81, S: 38, E: 32, C: 55 };
  const top3 = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const code = top3.map(s => s[0]).join('');

  return (
    <div className="relative rounded-2xl overflow-hidden p-5" style={{
      background: 'radial-gradient(circle at 50% 30%, #4F4FF5 0%, #000 70%)',
      aspectRatio: '9 / 16', border: `1px solid ${C.accent}66`,
    }}>
      <GlowOrb color={C.accent} size={220} top="20%" opacity={0.5} />

      <div className="relative z-10 text-center">
        <PixelText className="text-white text-[10px]">YOUR HOLLAND CODE</PixelText>
        <PixelText className="text-5xl block mt-3" style={{ color: C.accent, filter: `drop-shadow(0 0 20px ${C.accent}aa)` }}>{code}</PixelText>

        <div className="rounded-full w-20 h-20 mx-auto mt-4 flex items-center justify-center text-4xl"
          style={{ background: 'rgba(0,0,0,0.4)', border: `2px solid ${C.accent}` }}>
          {profile?.avatar || '🌙'}
        </div>
        <div className="text-white text-sm font-bold mt-2">{profile?.name || 'Haruka'}</div>

        <div className="mt-4 space-y-2">
          {top3.map(([k, v], i) => {
            const L = HOLLAND_LABELS[k];
            return (
              <div key={k} className="rounded-xl p-2 text-left flex items-center gap-2"
                style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${i === 0 ? C.accent : 'rgba(255,255,255,0.1)'}` }}>
                <div className="w-8 h-8 rounded-md flex items-center justify-center font-bold"
                  style={{ background: i === 0 ? C.accent : C.primary, color: i === 0 ? '#000' : '#fff' }}>{k}</div>
                <div className="flex-1">
                  <div className="text-[10px] text-white">{L.name}</div>
                  <div className="text-[9px]" style={{ color: C.textDim }}>{L.desc}</div>
                </div>
                <div className="text-sm font-bold" style={{ color: C.accent }}>{v}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-xl p-2 text-left" style={{ background: `${C.accent}11`, border: `1px solid ${C.accent}44` }}>
          <div className="text-[9px]" style={{ color: C.accent }}>適合探索方向</div>
          <div className="text-[10px] text-white mt-1">生態調查、自然攝影、博物館實習、生物學研究</div>
        </div>

        <PixelText className="text-[8px] mt-3 block" style={{ color: C.textDim }}>ME:VERSE · HOLLAND POSTER</PixelText>
      </div>
    </div>
  );
}

// ============== 11. Verse With Friends ==============
function FriendsPage({ back, home }) {
  const [savedTasks, setSavedTasks] = useState([]);

  return (
    <div className="min-h-full pb-6 relative">
      <TopBar title="VERSE WITH FRIENDS" onBack={back} onHome={home} />

      <div className="px-5 relative">
        <GlowOrb color={C.primary} size={350} top="20%" opacity={0.3} />

        <div className="text-center mb-4 relative z-10">
          <PixelText className="text-white text-2xl block">VERSE</PixelText>
          <PixelText className="text-white text-2xl block">WITH</PixelText>
          <PixelText className="text-2xl block" style={{ color: C.accent }}>FRIENDS</PixelText>
          <div className="text-[11px] mt-2" style={{ color: C.textDim }}>世界青少年正在做什麼？</div>
        </div>

        {/* 角色頭像 grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
          {FRIENDS_DATA.map((f, i) => (
            <div key={i} className="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ background: f.color, border: '2px solid rgba(255,255,255,0.1)' }}>
              <div className="text-4xl">{f.avatar}</div>
              <div className="absolute bottom-1 right-1 text-[8px] px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(0,0,0,0.6)', color: f.day === 'NEW' ? C.accent : '#fff' }}>{f.day}</div>
            </div>
          ))}
        </div>

        {/* 留言泡泡 */}
        <div className="space-y-2 relative z-10">
          {FRIENDS_DATA.slice(0, 4).map((f, i) => (
            <div key={i} className="rounded-2xl p-3 flex items-start gap-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: f.color }}>{f.avatar}</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <div className="text-xs text-white font-bold">{f.name}</div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: f.color === C.accent ? `${C.accent}33` : `${C.primary}55`, color: 'white' }}>{f.day}</span>
                </div>
                <div className="text-[11px] text-white mt-1" style={{ lineHeight: 1.5 }}>{f.activity}</div>
                <div className="text-[9px] mt-1" style={{ color: C.accent }}>{f.tag}</div>
              </div>
              <button onClick={() => setSavedTasks([...savedTasks, f.name])} className="flex-shrink-0">
                <Heart size={14} color={savedTasks.includes(f.name) ? C.accent : C.textDim} fill={savedTasks.includes(f.name) ? C.accent : 'none'} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl p-4 text-center"
          style={{ background: `linear-gradient(135deg, ${C.primary}22, ${C.accent}11)`, border: `1px solid ${C.accent}55` }}>
          <div className="text-[11px] text-white" style={{ lineHeight: 1.6 }}>
            ✨ 看看世界各地的青少年正在探索什麼，獲得新靈感
          </div>
          <button onClick={() => alert('已加入靈感收藏')} className="mt-3 px-4 py-2 rounded-full text-xs font-bold"
            style={{ background: C.accent, color: '#000' }}>獲得靈感</button>
        </div>

        {savedTasks.length > 0 && (
          <div className="mt-3 text-[10px] text-center" style={{ color: C.textDim }}>
            ⭐ 已收藏 {savedTasks.length} 個朋友的任務
          </div>
        )}
      </div>
    </div>
  );
}

// ============== 12. Profile / Settings ==============
function ProfilePage({ back, home, profile, setProfile }) {
  const p = profile || { name: 'GUEST', grade: '訪客', style: '尚未設定', avatar: '🌙', tags: [] };

  return (
    <div className="min-h-full pb-6 relative">
      <TopBar title="PROFILE" onBack={back} onHome={home} />

      <div className="px-5 relative">
        <GlowOrb color={C.primary} size={300} top="20%" opacity={0.3} />

        <div className="text-center mb-4 relative z-10">
          <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl mb-3 float-anim"
            style={{ background: `radial-gradient(circle, ${C.primary}, ${C.accent}33)`, border: `2px solid ${C.accent}`, boxShadow: `0 0 40px ${C.primary}88` }}>
            {p.avatar}
          </div>
          <PixelText className="text-white text-lg">{p.name?.toUpperCase()}</PixelText>
          <div className="text-xs mt-1" style={{ color: C.textDim }}>{p.grade} · {p.style}</div>
        </div>

        <div className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-xs text-white font-bold mb-2">標籤</div>
          <div className="flex flex-wrap gap-1.5">
            {(p.tags || []).map(t => (
              <span key={t} className="text-[10px] px-2 py-1 rounded-full text-white" style={{ background: `${C.primary}55` }}>#{t}</span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {[
            { icon: Settings, label: '帳戶設定' },
            { icon: Bell, label: '通知' },
            { icon: Layers, label: '隱私與資料' },
            { icon: Hash, label: '個人化標籤' },
            { icon: AlertCircle, label: '關於 ME:Verse' },
          ].map((s, i) => {
            const I = s.icon;
            return (
              <button key={i} className="w-full rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <I size={16} color={C.accent} />
                <div className="text-xs text-white flex-1 text-left">{s.label}</div>
                <ChevronRight size={14} color={C.textDim} />
              </button>
            );
          })}

          <button onClick={() => {
            if (confirm('確定清除所有資料並登出？')) {
              clearAllData();
              window.location.reload();
            }
          }} className="w-full rounded-xl p-3 flex items-center gap-3 mt-4"
            style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)' }}>
            <Trash2 size={16} color="#ff8888" />
            <div className="text-xs flex-1 text-left" style={{ color: '#ff8888' }}>清除所有資料並登出</div>
          </button>
        </div>

        <div className="mt-4 text-center">
          <PixelText className="text-[9px]" style={{ color: C.textDim }}>ME:VERSE PROTOTYPE · 2026</PixelText>
        </div>
      </div>
    </div>
  );
}
