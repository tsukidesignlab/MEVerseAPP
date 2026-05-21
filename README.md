# ME:Verse — 人格探索數位養成手帳

> Record → Try → Review → Evolve
> 紀錄、嘗試、回顧、成長

---

## 這是什麼

ME:Verse 的 Web App prototype，基於 React + Vite，支援 PWA（可加入手機主畫面，全螢幕運作）。
本地資料以 `localStorage` 儲存，刷新或關閉瀏覽器不會消失。

---

## 啟動：本地開發

### 一次性安裝
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```

預設會跑在 `http://localhost:5173`
終端機會同時印出區網 IP（例如 `http://192.168.x.x:5173`）—— 這個網址可以**直接用手機（同 Wi-Fi）打開預覽**，省去部署的功夫。

### 編譯成正式版
```bash
npm run build
```
產物會在 `dist/` 資料夾。

### 預覽編譯後的正式版
```bash
npm run preview
```

---

## 部署到網路（讓任何手機都能開）

### 推薦做法：Vercel（最簡單）

1. 把這個資料夾推上 GitHub
   ```bash
   git init
   git add .
   git commit -m "init meverse"
   git remote add origin <你的 github repo>
   git push -u origin main
   ```

2. 到 [vercel.com](https://vercel.com) 註冊（免費），點「Import Project」選你的 repo
3. Vercel 會自動偵測 Vite 設定，按 Deploy → 等 30 秒
4. 拿到一個網址，例如 `meverse.vercel.app`

### 替代方案：Netlify、Cloudflare Pages
流程類似，把 build 指令設為 `npm run build`、發佈目錄 `dist`。

---

## 加到手機主畫面（PWA）

部署完拿到網址後，用手機打開：

### iPhone (Safari)
1. 用 **Safari** 打開網址（重要：Chrome 不行）
2. 點下方分享圖示 (□↑)
3. 滾到「加入主畫面」(Add to Home Screen)
4. 點「新增」

開啟主畫面 icon 後，就會以**全螢幕模式**運作，沒有 Safari 網址列，跟原生 App 一樣。

### Android (Chrome)
1. Chrome 開啟網址
2. 通常會自動跳出「加到主畫面」提示
3. 沒跳出的話：右上角 ⋮ → 「加到主畫面」

---

## 展場使用建議

1. 部署到 Vercel，拿到網址
2. 展場 iPad / 手機事先「加到主畫面」
3. 預先點 [🌙 載入 Haruka 範例資料] 讓資料就緒
4. 展示流程：Home → Daily Record → AI Insight → Mission → Growth Poster
5. 想要清空資料：Profile → 「清除所有資料並登出」

iPad 在橫向也可以用，畫面會置中。

---

## 專案結構

```
meverse/
├── src/
│   ├── App.jsx          # 主程式（12 頁全在這）
│   ├── main.jsx         # React 入口
│   └── index.css        # 全域樣式 + Tailwind
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── apple-touch-icon.png
├── index.html           # 含手機 viewport / PWA meta
├── vite.config.js       # Vite + PWA 設定
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 自訂

### 換 logo / icon
覆蓋 `public/` 內的 png 與 favicon.svg 即可，建議用同樣的尺寸與格式。

### 改 PWA 名稱
修改 `vite.config.js` 中的 `manifest.name` 與 `manifest.short_name`，以及 `index.html` 的 `apple-mobile-web-app-title`。

### 改顏色主題
集中在 `src/App.jsx` 開頭的 `C` 物件，修改後全站套用。

### 加更多頁面 / 功能
在 `App.jsx` 的 `MEVerse` 元件中加新的 `page` 字串 case，再寫對應的元件。

---

## 已知限制

- 字體（Press Start 2P）首次載入需要 Google Fonts，無網時會 fallback 到系統字體
- localStorage 上限約 5MB，圖片會自動壓縮（長邊 900px、JPEG 0.7）每張約 100-200KB，**可存約 20-30 張照片**。容量滿時需要清除舊紀錄
- 錄音與畫筆功能尚未實作（按鈕會跳提示），日後可用 MediaRecorder API / Canvas 加上
- 不支援 iOS 14 以下的 Safari（CSS clip-path 與 backdrop-filter）

---

## 照片上傳功能

### Daily Record 第 ⑦ 區「媒體上傳」
- 點 + 號 → 跳出選單：**📷 拍照** / **🖼 從相簿選**
- 手機 PWA 模式下：拍照會直接開後鏡頭、相簿會開系統相簿
- 桌面瀏覽器：兩者都會開檔案總管
- 上傳後自動壓縮、顯示縮圖、可加描述、可刪除
- 上限 3 張

### Free Share 自由手帳的工具列
- **相機**：直接開後鏡頭拍照
- **相簿**：從系統相簿選照片
- **檔案**：可選任何檔案，圖片會插入手帳，其他類型會以附檔形式記在文字裡
- 已插入的圖片會以 2 欄縮圖顯示在文字區上方，可單獨刪除

### 隱私
所有照片只存在使用者**自己的瀏覽器 localStorage**，沒有上傳到任何伺服器。清除瀏覽器資料或點 Profile 頁的「清除所有資料」即可完全刪除。

---

## License

僅供 ME:Verse 專案使用。
