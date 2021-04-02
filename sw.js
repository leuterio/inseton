// Set a name for the current cache
var cacheName = 'v1'; 

// Default files to always cache
var cacheFiles = [
	'/',
	'index.html',
	'/assets/css/grid.css',
	'/assets/css/main.css',
	'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@1,700&display=swap',
    'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&display=swap',
    'https://kit.fontawesome.com/e8f2de5d88.js'
]

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
});

self.addEventListener('fetch', function(e) {

	// e.respondWidth Responds to the fetch event
	e.respondWith(

		// Check in cache for the request being made
		caches.match(e.request)


			.then(function(response) {

				// If the request is in the cache
				if ( response ) {
					// Return the cached version
					return response;
				}

				// If the request is NOT in the cache, fetch and cache

				var requestClone = e.request.clone();
				return fetch(requestClone)
					.then(function(response) {

						if ( !response ) {
							return response;
						}

						var responseClone = response.clone();

						//  Open the cache
						caches.open(cacheName).then(function(cache) {

							// Put the fetched response in the cache
							cache.put(e.request, responseClone);

							// Return the response
							return response;
			
				        }); // end caches.open

					})
					.catch(function(err) {
						console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
					});


			}) // end caches.match(e.request)
	); // end e.respondWith
});