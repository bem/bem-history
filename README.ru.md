bem-history
===========

## Что это?
БЭМ-обертка над History API:
* работает в браузерах со встроенной поддержкой History API и с возможностью фолбэка на событие `hashchange`;
* позволяет работать с `url`, `location` и `history` браузера в терминах [БЭМ](http://ru.bem.info/).

## Состав

### Блоки
* `uri` – блок для парсинга url;
* `history` – блок, обеспечивающий взаимодействие с браузерным History API с помощью двух модификаторов:
 * `provider_history-api` – если есть встроенная поддержка History API;
 * `provider_hashchange` – реализация с помощью фолбэка hashchange;
* `location` – высокоуровневый блок для изменения `window.location`.

## Схема работы

![bem-history workflow](https://dl.dropboxusercontent.com/u/1122837/bem-history_from-browser.svg)

## Использование

### uri
```js
modules.require(['uri'], function(Uri) {

    // Парсим url
    var u = Uri.parse('http://example.org:8080/path?test=1&test=2&param2=22');
    
    // Изменяем порт
    u.setPort(80);
    
    // Изменяем параметры запроса
    u.deleteParam('test', '2');
    u.replaceParam('param2', 2);
    
    // Обратно сериализуем url
    u.toString(); // "http://example.org:80/path?test=1&param2=2"
    
});
```

### history
```js
modules.require(['history'], function(History) {

    // Создаем инстанс history
    var history = new History();

    // Добавляем запись или заменяем текущее состояние с помощью методов pushState/replaceState
    history.changeState('push', { title: 'Title', url: 'http://example.org:8080/path' });
    history.changeState('replace', { title: 'Title', url: 'http://example.org:8080/path?test=1' });
    
});
```

### location
```js
modules.require(['location'], function(location) {

    // Изменяем `window.location` с помощью полного url
    location.change({ url: 'http://example.org:8080/path' });

    // Изменяем текущий location, используя только новые параметры запроса
    location.change({ params: { param1: [11,12], param2: 'ololo' } });
    window.location.href; // "http://example.org:8080/path?param1=11&param1=12&param2=ololo"
    
});
```
