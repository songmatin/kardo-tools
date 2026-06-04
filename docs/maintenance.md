# 維護流程

此文件定義每次調整 Kardo Tools 時的基本流程，確保修改、測試、備份與部署可以被追蹤。

## 每次修改前

1. 確認目前分支與 Git 狀態。
2. 若要做較大調整，先建立新分支。
3. 確認 `backups/` 是否已有目前基準快照。
4. 確認本機預覽可啟動。

## 本機檢查

在 repo 根目錄執行：

```bash
python3 -m http.server 8000
```

開啟：

```text
http://localhost:8000
```

至少檢查：

| 項目 | 檢查內容 |
| --- | --- |
| 主畫面 | 頁面是否正常載入。 |
| 地圖 | 地圖、縮放與定位按鈕是否顯示。 |
| 空域 | 紅區、黃區、國家公園、商港是否顯示。 |
| 天氣 | 天氣卡片是否載入。 |
| 航班 | 機場頁籤與航班列表是否正常。 |
| PDF 匯入 | 若有測試檔，確認解析流程沒有壞。 |
| KML 匯入 | 若有測試檔，確認空域可顯示。 |
| Console | 不應出現新的 error 或 warn。 |

## 部署前

部署前應確認：

1. `README.md` 是否需要更新。
2. `sw.js` cache 版本是否需要更新。
3. API endpoint 或 key 是否有變更。
4. GeoJSON 資料是否可解析。
5. 手機版與桌機版是否都可用。

## 備份節奏

| 時機 | 動作 |
| --- | --- |
| 初次接管 | 建立 GitHub 快照。 |
| 大改前 | 建立修改前快照。 |
| 部署後 | 記錄部署版本與提交。 |
| 回復前 | 先備份目前狀態，再還原。 |

## 建議提交訊息

| 類型 | 範例 |
| --- | --- |
| 文件 | `docs: add maintenance guide` |
| 設定 | `config: document api key handling` |
| 樣式 | `style: refine dashboard layout` |
| 功能 | `feat: add flight data proxy` |
| 修正 | `fix: update service worker cache version` |
