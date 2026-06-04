# 設定與外部服務

此文件整理 Kardo Tools 目前使用的外部服務、設定來源與後續建議搬遷方向。

## 目前設定位置

目前多數設定集中於 `index.html` 內，包括資料來源網址、API key、機場資料、無人機抗風參考、地圖底圖與 Cloudflare Worker endpoint。

此做法適合快速發布靜態網站，但不利於長期維護。後續應逐步將設定拆出，並將敏感服務移到 Worker 或後台代理。

## 外部服務

| 服務 | 用途 | 目前狀態 | 建議 |
| --- | --- | --- | --- |
| Leaflet | 地圖互動與圖層顯示。 | 由 CDN 載入。 | 可保留，但應固定版本。 |
| Carto Basemap | 地圖底圖。 | 由遠端 tile server 載入。 | 可保留，需注意使用條款。 |
| SunCalc | 日照與太陽位置計算。 | 由 CDN 載入。 | 可保留，後續可本地化依賴。 |
| pdf.js | PDF 解析。 | 由 CDN 載入。 | 可保留，後續可固定 worker 版本。 |
| Open-Meteo | 天氣資料。 | 前端直接呼叫。 | 可保留，因不需 key。 |
| 中央氣象署 | 潮汐資料。 | 前端直接帶 key 呼叫。 | 建議移至 Worker。 |
| AirLabs | 航班資料。 | 前端直接帶 key 呼叫。 | 建議移至 Worker。 |
| Google Maps Geocoding | 地址搜尋。 | 前端直接帶 key 呼叫。 | 建議限制網域，或移至 Worker。 |
| Cloudflare Worker | 雷達與空品代理。 | 前端直接呼叫。 | 建議加上來源限制與快取策略。 |

## 建議設定檔

第一階段可先建立前端可讀的設定檔，例如：

```text
config/public-config.js
```

此檔只放非敏感設定，例如：

```js
window.KARDO_CONFIG = {
  siteUrl: 'https://tools.songmatin.com',
  geojsonBaseUrl: 'https://raw.githubusercontent.com/songmatin/kardo-tools/main/',
};
```

敏感 key 不應放入前端設定檔。

## 本機與正式環境

| 環境 | 網址 | 用途 |
| --- | --- | --- |
| 本機 | `http://localhost:8000` | 修改與檢查畫面。 |
| 正式 | `https://tools.songmatin.com/` | 對外使用。 |

若未來加入 Worker 或後台，應使用 `.env.example` 作為變數命名基準。
