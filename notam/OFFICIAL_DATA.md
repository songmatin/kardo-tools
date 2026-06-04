# NOTAM 正式資料接入說明

## 目前接入策略

第一階段採用「官方 NOTAM 原文匯入」：

1. 從 AIS System 或 AES 查詢 Series U / Airspace NOTAM。
2. 將官方 NOTAM 原文貼入 `notam/source/raw-notam.txt`。
3. 執行 `notam/build-notam-data.mjs`。
4. 產出 `notam/notam-data.js`，供 `notam/index.html` 與 `notam/map.html` 使用。

這個方法避免直接抓取未授權頁面，也能先建立正式資料格式、解析流程與人工校核流程。

## 使用方式

建立來源檔：

```bash
cp notam/source/raw-notam.example.txt notam/source/raw-notam.txt
```

將官方查到的 NOTAM 原文貼入 `notam/source/raw-notam.txt` 後執行：

```bash
node notam/build-notam-data.mjs
```

產出檔：

```text
notam/notam-data.js
```

## 解析能力

目前支援：

- NOTAM 編號，例如 `U0857/26`。
- `A)` 地點代碼。
- `B)` 生效時間。
- `C)` 結束時間。
- `E)` 原文摘要。
- `F)` 下限高度。
- `G)` 上限高度。
- 座標格式，例如 `250314N1213255E`。
- `Q)` 行中的中心點與半徑，例如 `2504N12133E002`。
- `KM`、`M`、`NM` 半徑。
- 單一座標加半徑轉圓形。
- 三個以上座標轉多邊形。

## 需要卡豆申請或確認的項目

若要做全自動正式接入，需要向飛航服務總臺或 AIS System 管理單位確認：

1. 是否可申請 `ais.anws.gov.tw` 帳號。
2. 是否有 NOTAM / Series U / Navigation Warning 的 API 或資料匯出權限。
3. 是否允許自動化程式定時讀取資料。
4. 是否可公開再呈現於 `tools.songmatin.com`。
5. 是否有資料延遲、免責文字、引用標示要求。

建議詢問窗口：

- Taipei Flight Information Center：`fic@anws.gov.tw`
- AIS / CAA Air Traffic Services Division：`ais@mail.caa.gov.tw`

## 後續自動化方向

取得授權後再做第二階段：

1. Cloudflare Worker 或 GitHub Actions 定時抓取官方資料。
2. 轉換成 `notam-data.js` 或 JSON。
3. 自動提交或上傳到 Cloudflare KV / R2。
4. 前端每次開啟讀取最新資料。

在未取得授權前，不建議直接爬取登入後頁面或未公開 endpoint。
