const CACHE_NAME = 'wedding-audio-v1';
const AUDIO_FILES = [
    'story-song1.mp3',
    'story-song2.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(AUDIO_FILES))
    );
});

self.addEventListener('fetch', event => {
    if (event.request.url.match(/\.mp3$/)) {
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request))
        );
    }
});
