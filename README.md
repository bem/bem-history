bem-history
===========

### Что это?
BEM-wrap for history API:
* поддержка браузеров с history API (`provider_history-api`);
* деградация до `#!` для браузеров без history API (`provider_hashchange`);
* работа с блоком в терминах БЭМ.

### Требования
* единое событие при появление новой записи в истории и при переходе к предыдущему;
* поддержка браузеров с [`hashchange`](http://caniuse.com/hashchange) для плавной деградации;
* поддержать возможность изменения `document.title`, `state object` без изменения URL;
* предоставить хелперы для манипуляции с URL.

### URL
* перенаправление с адреса `/search?query` на `#!/search?query` при загрузке в браузере с реализацией `provider_hashchange`;
* автоматическое исправление адреса `#!/search?query` на `/search?query` для браузеров с `provider_history-api`, `provider_none`;
* получение всех значимых частей URL (path, query), в том числе работа с множественными значениями `queryArgs` ;
* возможность изменения всех значимых частей URL;
* использована в качестве основы и сильно переписана библиотека https://github.com/derek-watson/jsUri;

### Документация и другие полифилы
* https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Manipulating_the_browser_history#Adding_and_modifying_history_entries
* https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills#html5-history-api-pushstate-replacestate-popstate

### Реализация
* Блок `history` с тремя модификаторами для работы с историей:
 * `provider_history-api` с поддержкой history api;
 * `provider_hashchange` с поддержкой hashchange;
* Блок `url` и/или `jquery__url` для работы с URL;
* Блок `location` в качестве дополнительного уровня абстракции над `history`.
