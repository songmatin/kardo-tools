# Cloudflare Worker 部署計畫

此文件說明如何部署 Kardo API Proxy Worker，目標是把 AirLabs、中央氣象署、Google Maps 等 key 從前端逐步移到 Worker。

## 前置條件

| 項目 | 狀態 |
| --- | --- |
| Cloudflare 帳號 | 需要卡豆登入確認。 |
| `songmatin.com` DNS | 需確認是否由 Cloudflare 管理。 |
| Wrangler | 需要在 cmux 終端機安裝。 |
| API key | 需要在 Cloudflare Worker Secrets 設定，不可寫入 repo。 |

## 部署位置

Worker 專案位置：

```text
templates/cloudflare-worker/kardo-api-proxy
```

## 建議部署流程

```bash
cd /Users/songmatin/Documents/Kardo-Agent/KardoAgent_Codex/01_software_development/kardo_tools_dashboard/repo/templates/cloudflare-worker/kardo-api-proxy
npm install
npx wrangler login
npm run check
```

設定 secrets：

```bash
npx wrangler secret put CWA_API_KEY
npx wrangler secret put AIRLABS_API_KEY
npx wrangler secret put GOOGLE_MAPS_API_KEY
npx wrangler secret put UPSTREAM_RADAR_URL
npx wrangler secret put UPSTREAM_AQI_URL
```

部署：

```bash
npm run deploy
```

## 目前部署狀態

2026-06-04 已完成第一次部署。

| 項目 | 內容 |
| --- | --- |
| Cloudflare 帳號 | `songmatin@hotmail.com` |
| Account ID | `2e5a7e99e427531125e57e13bc325382` |
| Worker 名稱 | `kardo-api-proxy` |
| workers.dev URL | `https://kardo-api-proxy.songmatin-2e5.workers.dev` |
| Version ID | `2a977408-0266-489f-ad70-fde0ccf3398d` |
| 狀態 | 已部署，尚未切換正式前端流量。 |

目前 `wrangler.toml` 保留 `workers_dev = true` 作為測試入口，並設定 `preview_urls = false` 減少額外預覽網址。

## 路由策略

若 `songmatin.com` 由 Cloudflare DNS 管理，建議使用：

```text
https://tools.songmatin.com/api/*
```

這樣前端只要把：

```js
apiProxyBase: ''
```

改成：

```js
apiProxyBase: 'https://tools.songmatin.com'
```

即可切換到 Worker proxy。

## 驗證項目

部署後依序檢查：

| URL | 期待 |
| --- | --- |
| `/api/tides` | 回傳中央氣象署潮汐 JSON。 |
| `/api/flights?iata=TSA&kind=arr` | 回傳 AirLabs 抵達航班 JSON。 |
| `/api/flights?iata=TSA&kind=dep` | 回傳 AirLabs 離場航班 JSON。 |
| `/api/geocode?address=台北101` | 回傳 Google Maps geocode JSON。 |
| `/api/aqi` | 回傳空品資料。 |
| `/api/radar` | 回傳雷達影像或上游雷達資料。 |

workers.dev 測試時，請帶上允許的 `Origin` header。範例：

```bash
curl -s -o /tmp/kardo-tides.json -w "tides %{http_code}\n" -H "Origin: https://tools.songmatin.com" "https://kardo-api-proxy.songmatin-2e5.workers.dev/api/tides"
curl -s -o /tmp/kardo-flights-arr.json -w "flights-arr %{http_code}\n" -H "Origin: https://tools.songmatin.com" "https://kardo-api-proxy.songmatin-2e5.workers.dev/api/flights?iata=TSA&kind=arr"
curl -s -o /tmp/kardo-geocode.json -w "geocode %{http_code}\n" -H "Origin: https://tools.songmatin.com" "https://kardo-api-proxy.songmatin-2e5.workers.dev/api/geocode?address=%E5%8F%B0%E5%8C%97101"
curl -s -o /tmp/kardo-aqi.json -w "aqi %{http_code}\n" -H "Origin: https://tools.songmatin.com" "https://kardo-api-proxy.songmatin-2e5.workers.dev/api/aqi"
curl -I -H "Origin: https://tools.songmatin.com" "https://kardo-api-proxy.songmatin-2e5.workers.dev/api/radar"
```

直接在終端機輸入網址會被 shell 當成指令，應使用 `curl` 或貼到瀏覽器網址列。

若需要查看回應摘要，可以用：

```bash
node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('/tmp/kardo-tides.json','utf8')); console.log(Object.keys(j));"
```

## 切換原則

1. 先部署 Worker，不改前端設定。
2. 測試 `/api/*` 全部正常。
3. 再修改 `config/public-config.js` 的 `apiProxyBase`。
4. 本機與正式站檢查無誤後，再提交與推送。

## 注意事項

`robots.txt`、`noindex` 與 CSP 只能降低一般收錄與濫用風險。API key 必須移到 Worker Secrets，才算真正從前端移除。

`Origin` 檢查與 CORS 是濫用風險控制，不是完整身份驗證。正式切換後仍建議搭配 Cloudflare WAF、Rate limiting 與快取規則。
