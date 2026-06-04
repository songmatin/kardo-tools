# 安全與金鑰治理

此文件列出目前需要優先治理的安全項目。短期先不直接移除前端 key，避免功能中斷；應先完成限制、替換與代理流程，再逐步搬遷。

## 目前高風險項目

| 項目 | 風險 | 建議處理 |
| --- | --- | --- |
| Google Maps API key 位於前端 | 公開 repo 與瀏覽器可讀取。 | 先限制可用網域與 API 類型，再評估改由 Worker 代理。 |
| AirLabs API key 位於前端 | 可能被外部呼叫消耗額度。 | 建議移至 Cloudflare Worker，前端只呼叫自家 endpoint。 |
| 中央氣象署 API key 位於前端 | 可能被外部重複使用。 | 建議移至 Cloudflare Worker，並加快取。 |
| Worker endpoint 公開 | 可能被非本站大量呼叫。 | 建議檢查來源限制、速率限制與快取策略。 |
| Service Worker cache 名稱固定 | 改版後可能殘留舊檔。 | 重要部署時更新 cache 版本。 |

## 金鑰處理原則

1. 不在文件、截圖或對話中貼出完整真實 key。
2. 新增服務時，先建立 `.env.example` 的變數名稱。
3. 若 key 已公開，應先限制權限，再安排替換。
4. 可公開使用的 key 也要限制來源網域、API 類型與額度。
5. 高頻資料應由 Worker 快取，避免瀏覽器端重複打外部 API。

## 建議搬遷順序

| 階段 | 工作 | 目的 |
| --- | --- | --- |
| 1 | 檢查 Google Maps key 限制。 | 降低外部濫用風險。 |
| 2 | 將 AirLabs 航班查詢移至 Worker。 | 保護付費或額度型 key。 |
| 3 | 將中央氣象署潮汐查詢移至 Worker。 | 保護 key 並改善快取。 |
| 4 | 整理現有 Worker。 | 統一雷達、空品、航班、潮汐代理策略。 |
| 5 | 建立監控與錯誤紀錄。 | 讓 API 失效時能快速定位。 |

## Google Maps key 建議限制

Google Cloud Console 中建議設定：

| 項目 | 建議 |
| --- | --- |
| Application restrictions | HTTP referrers。 |
| Website restrictions | `https://tools.songmatin.com/*`。 |
| 本機測試 | 可暫時加入 `http://localhost:8000/*`。 |
| API restrictions | 僅允許 Geocoding API。 |

## Worker 建議限制

若使用 Cloudflare Worker，建議加入：

1. `Access-Control-Allow-Origin` 僅允許正式網域與本機測試網址。
2. 對外部 API 回應加上短時間快取。
3. 對錯誤回應提供一致格式。
4. 避免把上游完整錯誤與 key 資訊回傳給前端。
