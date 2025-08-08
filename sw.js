const CACHE_NAME = 'draftwise-ai-cache-v3';
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/fonts/inter-v13-latin-regular.woff2',
    '/fonts/inter-v13-latin-500.woff2',
    '/fonts/inter-v13-latin-600.woff2',
    '/fonts/inter-v13-latin-700.woff2',
    '/fonts/teko-v20-latin-regular.woff2',
    '/fonts/teko-v20-latin-600.woff2',
];

const DYNAMIC_CACHE_PATTERNS = [
    /^https:\/\/esm\.sh\//,
    /^https:\/\/ddragon\.leagueoflegends\.com\/cdn\//,
    /^https:\/\/ddragon\.leagueoflegends\.com\/api\//,
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching app shell');
            return cache.addAll(APP_SHELL_URLS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // App shell: Stale-while-revalidate
    if (APP_SHELL_URLS.some(path => url.pathname === path)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return response || fetchPromise;
                });
            })
        );
        return;
    }
    
    // Dynamic assets (CDNs): Network-first, then cache fallback for offline
    if (DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
         event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                try {
                    const response = await fetch(event.request);
                    cache.put(event.request, response.clone());
                    return response;
                } catch (error) {
                    const response = await cache.match(event.request);
                    if (response) {
                         return response;
                    }
                    console.error('Fetch failed; resource not in cache.', event.request.url, error);
                }
            })
        );
        return;
    }
    
    // Default: network only for other requests (e.g., Riot API) to prevent caching sensitive data
    event.respondWith(fetch(event.request));
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});