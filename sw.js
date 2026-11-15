
/* =========================================
   SACRO CIFRAS 2.0
   SERVICE WORKER
   Controle de cache e atualizações
========================================= */

/* =========================================
   VERSÃO DO CACHE
   Altere a versão quando atualizar o PWA
========================================= */

const CACHE_NAME = 'sacro-cifras-shell-v2';

/* =========================================
   ARQUIVOS PRINCIPAIS DO APLICATIVO
========================================= */

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

/* =========================================
   INSTALAÇÃO DO SERVICE WORKER
========================================= */

self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => cache.addAll(APP_SHELL))

      .then(() => self.skipWaiting())

  );

});

/* =========================================
   ATIVAÇÃO E LIMPEZA DE CACHE ANTIGO
========================================= */

self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys()

      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })

      .then(() => self.clients.claim())

  );

});

/* =========================================
   ATUALIZAÇÃO DAS PÁGINAS
   Prioriza sempre a versão online
========================================= */

self.addEventListener('fetch', event => {

  const request = event.request;

  const url = new URL(request.url);

  /* Ignora outras origens e métodos */

  if (
    url.origin !== self.location.origin ||
    request.method !== 'GET'
  ) {
    return;
  }

  /* Trata apenas a abertura das páginas */

  if (request.mode === 'navigate') {

    event.respondWith(

      fetch(request)

        .then(response => {

          if (response && response.ok) {

            const copia = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(
                  new URL('./index.html', self.registration.scope),
                  copia
                );
              });

          }

          return response;

        })

        .catch(async () => {

          const cache = await caches.open(CACHE_NAME);

          const pagina = await cache.match(
            new URL('./index.html', self.registration.scope)
          );

          return pagina || Response.error();

        })

    );

  }

});
