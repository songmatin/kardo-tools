# Kardo API Proxy Worker

此範本用於將前端目前直接呼叫的敏感 API 搬到 Cloudflare Worker。

## 目的

1. 避免 AirLabs、中央氣象署、Google Maps 等 key 長期暴露在前端。
2. 統一來源限制，只允許 `tools.songmatin.com` 與本機測試網址呼叫。
3. 對上游 API 加上快取，降低額度消耗。
4. 提供一致的錯誤格式，方便前端判斷。

## 需要設定的 secrets

請使用 Cloudflare Wrangler 設定，不要寫入 repo：

```bash
wrangler secret put CWA_API_KEY
wrangler secret put AIRLABS_API_KEY
wrangler secret put GOOGLE_MAPS_API_KEY
wrangler secret put ALLOWED_ORIGINS
wrangler secret put UPSTREAM_RADAR_URL
wrangler secret put UPSTREAM_AQI_URL
```

`ALLOWED_ORIGINS` 建議值：

```text
https://tools.songmatin.com,http://localhost:8000
```

## 安裝與部署

第一次部署前，在此資料夾執行：

```bash
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

部署到 Cloudflare：

```bash
npm run deploy
```

若 `songmatin.com` 由 Cloudflare DNS 管理，測試通過後可在 `wrangler.toml` 啟用：

```toml
routes = [
  { pattern = "tools.songmatin.com/api/*", zone_name = "songmatin.com" }
]
```

## 路由

| 路由 | 用途 |
| --- | --- |
| `/api/tides` | 中央氣象署潮汐資料代理。 |
| `/api/flights?iata=TSA` | AirLabs 航班資料代理。 |
| `/api/geocode?address=台北101` | Google Maps Geocoding 代理。 |
| `/api/radar` | 雷達資料代理。 |
| `/api/aqi` | 空品資料代理。 |

此範本尚未接入前端。部署前應先在 Cloudflare 測試，再逐步替換 `index.html` 中的直接 API 呼叫。

## 前端切換

前端已支援 `config/public-config.js`。Worker 部署並綁定正式網域後，將：

```js
apiProxyBase: ''
```

改為：

```js
apiProxyBase: 'https://tools.songmatin.com'
```

即可讓支援的 API 優先走 Worker proxy。若 Worker 未部署或設定為空，前端會沿用原本的外部 API fallback。
