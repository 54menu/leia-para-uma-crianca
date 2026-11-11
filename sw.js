const VERSION = 'leia-v6';
const SHELL_CACHE = `${VERSION}-shell`;
const CONTENT_CACHE = `${VERSION}-content`;
const scopeUrl = new URL(self.registration.scope);
const shellFiles = [
  './', 'index.html', '404.html', 'manifest.json',
  'assets/icons/book-moon.svg',
  'css/style.css', 'css/components.css', 'css/reader.css',
  'js/app.js', 'js/stories.js', 'js/reader.js', 'js/audio.js',
  'js/favorites.js', 'js/preferences.js', 'js/storage.js',
  'data/stories.json'
].map(path => new URL(path, scopeUrl).href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(shellFiles)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('leia-') && ![SHELL_CACHE, CONTENT_CACHE].includes(key)).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(scopeUrl.href)) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(SHELL_CACHE).then(cache => cache.put(new URL('index.html', scopeUrl), response.clone()));
      return response;
    }).catch(async () => (await caches.match(new URL('index.html', scopeUrl)) || await caches.match(new URL('./', scopeUrl)))));
    return;
  }

  event.respondWith(caches.match(request).then(cached => {
    const update = fetch(request).then(response => {
      if (response.ok && response.type === 'basic') caches.open(CONTENT_CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    });
    return cached || update.catch(() => new Response('', { status: 503, statusText: 'Offline' }));
  }));
});

