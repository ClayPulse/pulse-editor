/* A service worker to cache all requests to http://localhost:3001.  */

// Establish a cache name
const cacheName = "ExtensionCache";

self.addEventListener("fetch", (event) => {
  if (
    event.request.url.startsWith("http://localhost:3001") &&
    event.request.method === "GET"
  ) {
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        // Go to the cache first
        return cache.match(event.request.url).then((cachedResponse) => {
          // Return a cached response if we have one
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise, hit the network
          return fetch(event.request).then((fetchedResponse) => {
            // Add the network response to the cache for later visits
            cache.put(event.request, fetchedResponse.clone());

            // Return the network response
            return fetchedResponse;
          });
        });
      }),
    );
  } else {
    return;
  }
});
