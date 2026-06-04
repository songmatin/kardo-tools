const DEFAULT_ALLOWED_ORIGINS = [
  'https://tools.songmatin.com',
  'http://localhost:8000',
];

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = getAllowedOrigin(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(allowedOrigin) });
    }

    if (!allowedOrigin) {
      return json({ error: 'origin_not_allowed' }, 403);
    }

    try {
      if (url.pathname === '/api/tides') {
        return withCors(await proxyTides(env, ctx), allowedOrigin);
      }

      if (url.pathname === '/api/flights') {
        return withCors(await proxyFlights(url, env, ctx), allowedOrigin);
      }

      if (url.pathname === '/api/geocode') {
        return withCors(await proxyGeocode(url, env, ctx), allowedOrigin);
      }

      if (url.pathname === '/api/radar') {
        return withCors(await proxyUpstream(env.UPSTREAM_RADAR_URL, 'radar', ctx), allowedOrigin);
      }

      if (url.pathname === '/api/aqi') {
        return withCors(await proxyUpstream(env.UPSTREAM_AQI_URL, 'aqi', ctx), allowedOrigin);
      }

      return withCors(json({ error: 'not_found' }, 404), allowedOrigin);
    } catch (error) {
      return withCors(json({ error: 'proxy_error', message: String(error.message || error) }, 502), allowedOrigin);
    }
  },
};

function getAllowedOrigin(origin, env) {
  const configured = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const allowed = configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
  return allowed.includes(origin) ? origin : '';
}

function corsHeaders(origin) {
  return {
    ...JSON_HEADERS,
    'Access-Control-Allow-Origin': origin || 'null',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
  };
}

function withCors(response, origin) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(origin)).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...extraHeaders,
    },
  });
}

async function cachedFetch(url, ctx, ttlSeconds) {
  const cache = caches.default;
  const cacheKey = new Request(url, { method: 'GET' });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'KardoTools/1.0',
    },
  });

  const cached = new Response(response.body, response);
  cached.headers.set('Cache-Control', `public, max-age=${ttlSeconds}`);
  ctx.waitUntil(cache.put(cacheKey, cached.clone()));
  return cached;
}

async function proxyTides(env, ctx) {
  if (!env.CWA_API_KEY) return json({ error: 'missing_cwa_api_key' }, 500);
  const url = new URL('https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-A0021-001');
  url.searchParams.set('Authorization', env.CWA_API_KEY);
  url.searchParams.set('format', 'JSON');
  return cachedFetch(url.toString(), ctx, 1800);
}

async function proxyFlights(url, env, ctx) {
  if (!env.AIRLABS_API_KEY) return json({ error: 'missing_airlabs_api_key' }, 500);
  const iata = String(url.searchParams.get('iata') || '').toUpperCase();
  if (!/^[A-Z]{3}$/.test(iata)) return json({ error: 'invalid_iata' }, 400);

  const kind = String(url.searchParams.get('kind') || 'arr');
  const param = kind === 'dep' ? 'dep_iata' : 'arr_iata';
  const upstream = new URL('https://airlabs.co/api/v9/schedules');
  upstream.searchParams.set(param, iata);
  upstream.searchParams.set('api_key', env.AIRLABS_API_KEY);
  return cachedFetch(upstream.toString(), ctx, 120);
}

async function proxyGeocode(url, env, ctx) {
  if (!env.GOOGLE_MAPS_API_KEY) return json({ error: 'missing_google_maps_api_key' }, 500);
  const address = String(url.searchParams.get('address') || '').trim();
  if (address.length < 2 || address.length > 120) return json({ error: 'invalid_address' }, 400);

  const upstream = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  upstream.searchParams.set('address', address);
  upstream.searchParams.set('region', 'tw');
  upstream.searchParams.set('language', 'zh-TW');
  upstream.searchParams.set('key', env.GOOGLE_MAPS_API_KEY);
  return cachedFetch(upstream.toString(), ctx, 86400);
}

async function proxyUpstream(upstreamUrl, type, ctx) {
  if (!upstreamUrl) return json({ error: `missing_${type}_upstream` }, 500);
  return cachedFetch(upstreamUrl, ctx, type === 'radar' ? 600 : 900);
}
