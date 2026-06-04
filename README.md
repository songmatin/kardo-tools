# Kardo Tools

Kardo Tools 是里卡豆空拍作業使用的飛行儀表板，線上網址為：

```text
https://tools.songmatin.com/
```

此專案目前採用靜態單頁網站架構，主要功能集中在 `index.html`，並搭配多個 `GeoJSON` 資料檔顯示台灣空域、限制區、國家公園、商港與臨時空域資訊。

## 主要功能

| 功能 | 說明 |
| --- | --- |
| 飛行地圖 | 使用 Leaflet 顯示底圖、定位與空域圖層。 |
| 空域圖層 | 顯示紅區、黃區、國家公園、商港與臨時限制區。 |
| KML 匯入 | 匯入活動許可空域 KML，輔助現場判讀。 |
| 活動計劃書 PDF 匯入 | 使用 pdf.js 解析民航局活動計劃書 PDF。 |
| 天氣與風況 | 顯示即時天氣、逐時預報、風速、陣風與飛行評估。 |
| 日照資訊 | 顯示日出、日落、黃金時刻、藍調時刻與陰影方位。 |
| 潮汐與空品 | 串接外部資料來源，顯示潮汐與空氣品質。 |
| 航班資訊 | 查詢主要機場航班，輔助空拍作業時間判斷。 |
| NOTAM 紀錄 | 使用瀏覽器 `localStorage` 暫存作業 NOTAM。 |

## 檔案結構

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 主要介面、樣式與 JavaScript。 |
| `sw.js` | Service Worker 快取設定。 |
| `CNAME` | GitHub Pages 自訂網域設定。 |
| `robots.txt` | 降低一般搜尋引擎與 AI 爬蟲收錄。 |
| `*.geojson` | 空域與限制區資料。 |
| `config/public-config.js` | 前端公開設定，部署 Worker 後可切換 API proxy。 |
| `.env.example` | 後續後台或代理服務使用的環境變數範本。 |
| `.gitignore` | 排除本機暫存檔與真實環境變數。 |
| `docs/` | 維護、設定、金鑰治理、防爬與重構規劃文件。 |
| `templates/` | 後端代理與部署範本。 |

## 本機預覽

在專案根目錄執行：

```bash
python3 -m http.server 8000
```

接著開啟：

```text
http://localhost:8000
```

若出現 `favicon.ico 404`，代表瀏覽器正在自動尋找網站小圖示。這不影響主功能。

## 維護原則

目前先維持靜態網站架構，避免過早重寫。第一階段目標是讓專案可讀、可備份、可測試、可安全維護。

後續若要處理 API key、安全限制或資料管理，應優先參考：

```text
docs/configuration.md
docs/security.md
docs/protection_strategy.md
docs/cloudflare_worker_deployment.md
docs/refactor_roadmap.md
```

## 部署

`CNAME` 目前設定為：

```text
tools.songmatin.com
```

若使用 GitHub Pages，請確認 GitHub repo 的 Pages 設定、DNS 設定與自訂網域一致。
