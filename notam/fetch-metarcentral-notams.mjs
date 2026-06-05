import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.dirname(new URL(import.meta.url).pathname);
const sourcePath = path.join(root, 'source', 'metarcentral-notams.txt');
const outputPath = path.join(root, 'notam-data.js');
const icaos = (process.argv.slice(2).length ? process.argv.slice(2) : [
  'RCSS',
  'RCTP',
  'RCGM',
  'RCMQ',
  'RCNN',
  'RCKH',
  'RCYU',
  'RCQC',
]).map((item) => item.toUpperCase());

const blocks = [];
for (const icao of icaos) {
  try {
    const html = await fetchAirportNotams(icao);
    const notices = parseMetarCentralHtml(html, icao);
    blocks.push(...notices.map(toNotamBlock));
    console.log(`${icao}: ${notices.length} unmanned aircraft NOTAM(s)`);
  } catch (error) {
    console.warn(`${icao}: skipped (${error.message})`);
  }
}

if (!blocks.length) {
  throw new Error('No unmanned aircraft NOTAMs fetched. Check source availability or ICAO list.');
}

fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
fs.writeFileSync(sourcePath, `${blocks.join('\n\n')}\n`);

execFileSync(process.execPath, [
  path.join(root, 'build-notam-data.mjs'),
  sourcePath,
  outputPath,
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    KARDO_NOTAM_SOURCE_MODE: 'public-aggregator',
    KARDO_NOTAM_SOURCE_NOTE: 'Generated from public MetarCentral NOTAM pages. Verify against official AIS/AES before flight.',
  },
});

async function fetchAirportNotams(icao) {
  const url = `https://metarcentral.com/airport/${encodeURIComponent(icao)}/notam`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'KardoToolsNotamBot/0.1 (+https://tools.songmatin.com/notam/)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  if (!response.ok) throw new Error(`${icao}: ${response.status} ${response.statusText}`);
  return response.text();
}

function parseMetarCentralHtml(html, icao) {
  const text = htmlToText(html);
  const pieces = text.split(/(?=NOTAM:\s+[A-Z]\d{4}\/\d{2}\s+\|\s+Q-Code:)/g);
  return pieces
    .map((piece) => parseNotice(piece, icao))
    .filter((notice) => notice && isUnmannedNotice(notice));
}

function parseNotice(text, fallbackIcao) {
  const id = text.match(/NOTAM:\s+([A-Z]\d{4}\/\d{2})/)?.[1];
  if (!id) return null;
  const qCode = text.match(/Q-Code:\s+([A-Z0-9]+)/)?.[1] || '';
  const icao = text.match(/(?:Airport\/Aerodrome|Flight Information Region)\s+([A-Z]{4})/)?.[1] || fallbackIcao;
  const start = text.match(/Effective From\s+(.+?)\s+Expires/s)?.[1]?.trim() || '';
  const end = text.match(/Expires\s+(.+?)\s+NOTAM Description/s)?.[1]?.trim() || '';
  const description = text.match(/NOTAM Description\s+([\s\S]*?)(?=\s+#####|\s+NOTAM:\s+[A-Z]\d{4}\/\d{2}|$)/)?.[1]?.trim() || '';
  return { id, qCode, icao, start, end, description };
}

function isUnmannedNotice(notice) {
  return notice.qCode === 'QWULW' || /UNMANNED\s+ACFT|UAS|UA\s+ACT/i.test(notice.description);
}

function toNotamBlock(notice) {
  const start = toNotamTimestamp(notice.start);
  const end = toNotamTimestamp(notice.end);
  const qLine = makeQLine(notice);
  return `(${notice.id} NOTAMN
Q) ${qLine}
A) ${notice.icao} B) ${start} C) ${end}
E) ${notice.description}
F) GND G) 400FT AMSL)`;
}

function makeQLine(notice) {
  const center = notice.description.match(/(\d{4,6}[NS])\s*(\d{5,7}[EW])/)?.[0]?.replace(/\s+/g, '');
  if (!center) return 'RCAA/QWULW/IV/BO/W/000/004/0000N00000E001';
  const qCoord = toQCoordinate(center);
  const radius = notice.description.match(/(\d+(?:\.\d+)?)\s*(KM|M|NM)\s+RADIUS/i);
  const nm = radius ? toNm(radius[1], radius[2]) : 1;
  return `RCAA/QWULW/IV/BO/W/000/004/${qCoord}${String(nm).padStart(3, '0')}`;
}

function toQCoordinate(coord) {
  const match = coord.match(/(\d{2})(\d{2})(?:\d{2})?([NS])(\d{3})(\d{2})(?:\d{2})?([EW])/);
  return match ? `${match[1]}${match[2]}${match[3]}${match[4]}${match[5]}${match[6]}` : '0000N00000E';
}

function toNm(value, unit) {
  const amount = Number(value);
  const normalized = unit.toUpperCase();
  if (normalized === 'NM') return Math.max(1, Math.round(amount));
  if (normalized === 'KM') return Math.max(1, Math.round(amount / 1.852));
  return Math.max(1, Math.round(amount / 1852));
}

function toNotamTimestamp(value) {
  const date = Date.parse(value);
  if (!Number.isFinite(date)) return '2601010000';
  const d = new Date(date);
  const pad = (item) => String(item).padStart(2, '0');
  return `${pad(d.getUTCFullYear() % 100)}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}
