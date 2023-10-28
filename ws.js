importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();
  workbox.core.setCacheNameDetails({
    prefix: 'thn-sw',
    suffix: 'v22',
    precache: 'install-time',
    runtime: 'run-time'
  });

  const FALLBACK_HTML_URL = '/offline.html';
  const version = workbox.core.cacheNames.suffix;

  // تعريف الملفات المطلوبة للمرحلة الأولية
  workbox.precaching.precacheAndRoute([
    { url: FALLBACK_HTML_URL, revision: null },
    { url: '/manifest.json', revision: null },
    { url: '/main/favicon.ico', revision: null }
  ]);

  // إعداد استراتيجية الذاكرة المؤقتة
  workbox.routing.registerRoute(
    new RegExp('.(css|js|png|gif|jpg|svg|ico)$'),
    new workbox.strategies.CacheFirst({
      cacheName: 'images-js-css-' + version,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 24 * 60 * 60,
          maxEntries: 200,
          purgeOnQuotaError: true
        })
      ]
    }),
    'GET'
  );

  // إعداد معالج الأخطاء
  workbox.routing.setCatchHandler(({ event }) => {
    switch (event.request.destination) {
      case 'document':
        return caches.match(FALLBACK_HTML_URL);
      default:
        return Response.error();
    }
  });

  // إعداد معالج النشاط
  self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches
        .keys()
        .then(keys => keys.filter(key => !key.endsWith(version)))
        .then(keys => Promise.all(keys.map(key => caches.delete(key)))
        )
      );
  });
} else {
  console.log('Oops! Workbox did not load');
}