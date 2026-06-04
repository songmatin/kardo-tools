# 防爬、防濫用與功能保護策略

此專案是前端靜態網站。只要 JavaScript、HTML 與資料檔送到瀏覽器，使用者就可以讀取這些前端內容。因此，真正需要保護的部分不應放在前端，而應移到 Cloudflare Worker、後台服務或受權限控管的 API。

## 核心原則

| 目標 | 正確做法 | 不建議依賴 |
| --- | --- | --- |
| 防止 API key 被濫用 | 移到 Worker，前端只呼叫自家 endpoint。 | 只把程式碼壓縮或混淆。 |
| 降低爬蟲收錄 | `robots.txt`、`noindex`、Cloudflare WAF。 | 期待所有爬蟲自律。 |
| 保護核心功能 | 把重要資料處理、付費 API、限制邏輯放後端。 | 把所有演算法留在前端。 |
| 降低大量請求 | Worker 快取、速率限制、來源檢查。 | 只檢查瀏覽器 User-Agent。 |
| 防止嵌入盜用 | Cloudflare response header 加 `frame-ancestors`。 | 只靠前端 JavaScript 判斷。 |

## 已加入的第一層防護

| 防護 | 位置 | 說明 |
| --- | --- | --- |
| 搜尋與 AI 爬蟲規則 | `robots.txt` | 要求一般爬蟲不要抓取此網站。 |
| noindex 設定 | `index.html` | 要求搜尋引擎不要索引、快取或摘要頁面。 |
| Referrer 限制 | `index.html` | 降低外部網址取得完整來源資訊。 |
| Content Security Policy | `index.html` | 限制可載入與可連線的來源。 |
| Worker 代理範本 | `templates/cloudflare-worker/` | 作為 API key 搬遷與來源限制的基礎。 |
| API proxy 切換開關 | `config/public-config.js` | Worker 部署前保持 fallback，部署後切換到自家 endpoint。 |
| Worker 部署計畫 | `docs/cloudflare_worker_deployment.md` | 定義部署、驗證與切換順序。 |

## 仍需要的第二層防護

| 項目 | 建議 |
| --- | --- |
| Google Maps API key | 在 Google Cloud Console 限制 HTTP referrer 與 API 類型。 |
| AirLabs key | 移到 Cloudflare Worker，前端不可再直接看到 key。 |
| 中央氣象署 key | 移到 Cloudflare Worker，並加上快取。 |
| Cloudflare Worker | 加入來源檢查、快取、錯誤格式與 WAF 規則。 |
| GitHub repo | 若不希望程式碼公開，需改為 private repo；公開 repo 無法防止複製。 |

## 前端切換策略

目前 `index.html` 已支援 `config/public-config.js` 的 `apiProxyBase` 設定。當值為空字串時，前端仍會走原本外部 API。當值改成正式網域時，雷達、空品、潮汐、航班與地址搜尋會優先呼叫自家 Worker proxy。

這種設計可降低部署風險，避免 Worker 尚未完成時造成儀表板中斷。

## Cloudflare 建議設定

| 功能 | 建議 |
| --- | --- |
| WAF rule | 阻擋非預期國家、異常 User-Agent 或高頻請求。 |
| Rate limiting | 對 `/api/*` 設定每分鐘請求上限。 |
| Bot Fight Mode | 可啟用，降低常見機器流量。 |
| Cache Rules | 對潮汐、空品、雷達等資料加短時間快取。 |
| Security headers | 由 Worker 或 Pages 加上 `X-Frame-Options`、`X-Content-Type-Options`、`Permissions-Policy`。 |

## 重要限制

`robots.txt` 與 `noindex` 是給守規矩的爬蟲看的，不是安全邊界。若對方刻意抓取，仍可讀取公開網站與公開 repo。真正的保護方式，是把有價值的 key、資料轉換邏輯、額度型 API 與內部後台功能放到伺服器端。
