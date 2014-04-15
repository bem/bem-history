bem-history Library
===================

### What is this?
BEM wrap for History API:
* supports browsers with native History API and hashchange event;
* provides manipulations with url, browser location and history in the terms of BEM (http://bem.info/).

### Components
* `uri` block for an url parsing;
* `history` block provides work with browser History with two modificators:
 * `provider_history-api` supports native History API;
 * `provider_hashchange` supports fallback on hashchange event;
* `location` high-level block for a `window.location` change.

### Usage
#####uri
Parse url:
```js
u = BEM.blocks.uri.parse('http://127.0.0.1:8080/desktop.bundles/index/index.html?test=1&test=2&param2=22');
```

Change `port`:
```js
u.port(80);
```

Change query params:
```js
u.deleteParam('test', '2');
u.replaceParam('param2', 2);
```

Serialize url:
```js
u.toString(); // "http://127.0.0.1:80/desktop.bundles/index/index.html?test=1&param2=2"
```

#####history
Get `history` block instance:
```js
h = BEM.blocks.history.getInstance();
```

Push new or replace history state:
```js
h.pushState({}, 'Title', 'http://127.0.0.1:8080/desktop.bundles/index/index.html');
h.replaceState({}, 'Title', 'http://127.0.0.1:8080/desktop.bundles/index/index.html');
```

#####location
Get `location` block instance:
```js
l = BEM.blocks.location.getInstance();
```

Change `window.location` using a full url:
```js
l.change({ url: 'http://127.0.0.1:8080/desktop.bundles/index/index.html' });
```

Change current location using only the new query params:
```js
l.change({ params: { param1: [11,12], param2: 'ololo' } });
window.location.href; // "http://127.0.0.1:8080/desktop.bundles/index/index.html?param1=11&param1=12&param2=ololo"
```


----------------------

### Что это?
БЭМ-обертка над браузерным History API:
* поддержка браузеров с history API (`provider_history-api`);
* деградация до `#!` для браузеров без history API (`provider_hashchange`);
* работа с блоком в терминах БЭМ.

### Требования
* единое событие при появление новой записи в истории и при переходе к предыдущему;
* поддержка браузеров с [`hashchange`](http://caniuse.com/hashchange) для плавной деградации;
* поддержать возможность изменения `document.title`, `state object` без изменения URL;
* предоставить хелперы для манипуляции с URL.

### URL
* автоматическое исправление адреса `/search?query` на `#!/search?query` при загрузке в браузере с реализацией `provider_hashchange`;
* автоматическое исправление адреса `#!/search?query` на `/search?query` для браузеров с `provider_history-api`;
* получение всех значимых частей URL (path, query), в том числе работа с множественными значениями `queryParams`;
* возможность изменения всех значимых частей URL;
* использована в качестве основы и сильно переписана библиотека https://github.com/derek-watson/jsUri.

### Документация и другие полифилы
* https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Manipulating_the_browser_history#Adding_and_modifying_history_entries
* https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#html5-history-api-pushstate-replacestate-popstate

### Реализация
* Блок `uri` для работы с URL;
* Блок `history` с двумя модификаторами для работы с историей:
 * `provider_history-api` с поддержкой history api;
 * `provider_hashchange` с поддержкой hashchange;
* Блок `location` в качестве дополнительного уровня абстракции над `history`.
