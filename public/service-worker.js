//create array of files to be cached
const filesToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/manifest.json',
    '/index.js',
    '/indexeddb.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'
    
]

const CACHE_NAME = 'my-site-cache-v1'
const DATA_CACHE_NAME = "data-cache-v1"; 

//install event to open cache with previous const declared
self.addEventListener("install", function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Cache opened.")
        return cache.addAll(filesToCache);
      })
    );
  
    self.skipWaiting();
  });

//activate event to remove any old cache data not called for
  self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });

  self.addEventListener("fetch", function(evt) {
    // cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // if the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              //offline meaning network fetch will fail so pull stored valued from cache
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
    evt.respondWith(
      caches.match(evt.request).then(function(response) {
        return response || fetch(evt.request);
      })
    );
  });
  