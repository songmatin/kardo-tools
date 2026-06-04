window.KARDO_NOTAM_DATA = {
  updatedAt: '2026-06-05 06:30',
  airports: [
    { icao: 'RCSS', name: 'RCSS 松山', city: '台北', lat: 25.0694, lng: 121.5521 },
    { icao: 'RCTP', name: 'RCTP 桃園', city: '桃園', lat: 25.0777, lng: 121.2327 },
    { icao: 'RCGM', name: 'RCGM 新竹', city: '新竹', lat: 24.8179, lng: 120.9382 },
    { icao: 'RCMQ', name: 'RCMQ 台中', city: '台中', lat: 24.2647, lng: 120.6219 },
    { icao: 'RCNN', name: 'RCNN 台南', city: '台南', lat: 22.9503, lng: 120.2063 },
    { icao: 'RCKH', name: 'RCKH 高雄', city: '高雄', lat: 22.5773, lng: 120.3500 },
    { icao: 'RCYU', name: 'RCYU 花蓮', city: '花蓮', lat: 24.0231, lng: 121.6175 },
    { icao: 'RCQC', name: 'RCQC 澎湖', city: '澎湖', lat: 23.5687, lng: 119.6283 },
    { icao: 'RCAA', name: 'RCAA 臺北飛航情報區', city: 'FIR', lat: 23.7, lng: 121.0 }
  ],
  notices: [
    {
      id: 'U0857/26',
      icao: 'RCSS',
      title: '松山機場周邊無人機活動公告',
      status: 'active',
      type: 'circle',
      center: [25.0586, 121.5486],
      radius: 1600,
      lower: 'GND',
      upper: '400FT',
      start: '2026-06-05 00:00',
      end: '2026-06-05 23:59',
      summary: '示範資料：松山機場附近臨時空域提示，飛行前請以官方 NOTAM 為準。'
    },
    {
      id: 'U0861/26',
      icao: 'RCSS',
      title: '基隆河沿線航拍作業提示',
      status: 'planned',
      type: 'polygon',
      points: [[25.0720,121.5330],[25.0784,121.5581],[25.0644,121.5740],[25.0552,121.5432]],
      lower: 'GND',
      upper: '300FT',
      start: '2026-06-06 08:00',
      end: '2026-06-06 18:00',
      summary: '示範資料：多邊形 NOTAM 範圍，用於驗證地圖與座標命中邏輯。'
    },
    {
      id: 'U0832/26',
      icao: 'RCTP',
      title: '桃園機場外圍臨時活動範圍',
      status: 'active',
      type: 'circle',
      center: [25.0652, 121.2521],
      radius: 2200,
      lower: 'GND',
      upper: '500FT',
      start: '2026-06-05 06:00',
      end: '2026-06-05 20:00',
      summary: '示範資料：桃園機場周邊查詢卡片。'
    },
    {
      id: 'U0808/26',
      icao: 'RCAA',
      title: '臺北飛航情報區無人機活動參考',
      status: 'active',
      type: 'circle',
      center: [24.1600, 120.6500],
      radius: 3000,
      lower: 'GND',
      upper: '400FT',
      start: '2026-06-05 00:00',
      end: '2026-06-07 23:59',
      summary: '示範資料：FIR 層級公告卡片，後續可接官方 Series U NOTAM。'
    }
  ]
};
