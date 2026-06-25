#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新全台灣無人機禁航/限航圖資 -> GeoJSON (WGS84)，供 kardo-tools 前端載入。

資料來源：民航局 dronegis.caa.gov.tw (ArcGIS Enterprise，公開查詢，免 Token)
用法：  python3 update_geojson.py [輸出資料夾]
       預設輸出到目前目錄；前端從 raw.githubusercontent.com/songmatin/kardo-tools/main/ 載入。

註：沙箱環境無法外連，本腳本需在「有網路」的環境執行（你的電腦 / GitHub Actions / Cloudflare）。
"""
import json, sys, time, urllib.parse, urllib.request, os

BASE = "https://dronegis.caa.gov.tw/server/rest/services/Hosted"

# 輸出檔名 -> (service, layerId)  與前端 index.html 的 fetch 對應
LAYERS = {
    "uav_red":         ("UAV_fs/FeatureServer", 1),   # 縣市政府紅區 (含飛航情報限航/機場四周)
    "uav_yellow":      ("UAV_fs/FeatureServer", 2),   # 縣市政府黃區
    "uav_ry":          ("UAV_fs/FeatureServer", 3),   # 紅黃混合
    "national_park":   ("National_Park_fs/FeatureServer", 0),
    "commercial_port": ("Commercial_Port_fs/FeatureServer", 4),
    "temporary":       ("Temporary_Area/FeatureServer", 19),
}

PAGE = 1000  # 伺服器 maxRecordCount=2000

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "kardo-tools-updater/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))

def count(service, lid):
    q = urllib.parse.urlencode({"where": "1=1", "returnCountOnly": "true", "f": "json"})
    return get(f"{BASE}/{service}/{lid}/query?{q}").get("count", 0)

def fetch_layer(name, service, lid):
    total = count(service, lid)
    feats, offset = [], 0
    while True:
        q = urllib.parse.urlencode({
            "where": "1=1",
            "outFields": "*",
            "outSR": "4326",
            "geometryPrecision": "6",
            "f": "geojson",                 # ArcGIS 直接輸出 GeoJSON，免轉換
            "resultRecordCount": PAGE,
            "resultOffset": offset,
        })
        fc = get(f"{BASE}/{service}/{lid}/query?{q}")
        page = fc.get("features", [])
        feats.extend(page)
        got = len(page)
        print(f"  {name:16s} offset={offset:<5d} +{got}  ({len(feats)}/{total})")
        if got < PAGE or fc.get("properties", {}).get("exceededTransferLimit") is False and got == 0:
            break
        if got == 0:
            break
        offset += PAGE
        time.sleep(0.3)
    return total, feats

def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out_dir, exist_ok=True)
    print(f"輸出到: {os.path.abspath(out_dir)}\n")
    summary, ok = [], True
    for name, (service, lid) in LAYERS.items():
        try:
            total, feats = fetch_layer(name, service, lid)
        except Exception as e:
            print(f"  !! {name} 失敗: {e}")
            summary.append((name, "ERROR", 0, 0)); ok = False
            continue
        fc = {
            "type": "FeatureCollection",
            "name": name,
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "features": feats,
        }
        path = os.path.join(out_dir, f"{name}.geojson")
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(fc, fh, ensure_ascii=False)
        match = "OK" if len(feats) == total else f"!! 數量不符 (got {len(feats)}, expect {total})"
        if len(feats) != total:
            ok = False
        print(f"  -> {name}.geojson  {len(feats)} features  {os.path.getsize(path)//1024}KB  {match}\n")
        summary.append((name, "OK" if len(feats) == total else "MISMATCH", len(feats), total))
    print("=== 摘要 ===")
    for n, s, g, t in summary:
        print(f"  {n:16s} {s:9s} {g}/{t}")
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
