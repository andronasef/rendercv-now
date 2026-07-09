// Service worker: cache-first for the big, immutable, version-pinned CDN assets
// so REPEAT loads serve them from Cache Storage instead of re-downloading every
// visit (the browser HTTP cache for these hosts is evictable and unreliable).
//
// Only these CDN hosts are cached — never same-origin app assets — because every
// URL here is version- or content-pinned (pyscript 2026.7.1, jsdelivr @0.7.0,
// pythonhosted wheels are immutable), so "cache forever" is correct. Leaving
// same-origin files to the browser means a `npm run build` is never served stale.
const CACHE = "rendercv-cdn-v1";
const HOSTS = [
  "pyscript.net",
  "files.pythonhosted.org",
  "cdn.jsdelivr.net",
  "fonts.gstatic.com",
];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  ),
);

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const cacheable =
    e.request.method === "GET" && HOSTS.some((h) => url.hostname.endsWith(h));
  if (!cacheable) return; // fall through to the network normally

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(e.request);
      if (hit) return hit;
      const resp = await fetch(e.request);
      // Cache successful and opaque (cross-origin no-cors) responses alike.
      if (resp && (resp.ok || resp.type === "opaque")) {
        cache.put(e.request, resp.clone());
      }
      return resp;
    }),
  );
});
