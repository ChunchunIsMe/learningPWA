const cacheStorageKey = "minimal-pwa-16";
const cacheList = [
  '/',
  'index.html',
  'main.css',
  'test.png',
  'run.js',
  'https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheStorageKey)
      .then(cache => cache.addAll(cacheList))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      if (res != null) {
        return res;
      }
      return fetch(e.request.url)
    })
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cachename => cachename !== cacheStorageKey)
          .map(cachename => caches.delete(cachename))
      )
    }).then(() => {
      return self.clients.claim();
    })
  )
})