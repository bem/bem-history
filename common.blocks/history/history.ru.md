## history

Блок, обеспечивающий взаимодействие с браузерным History API с помощью двух модификаторов:
 * `provider_history-api` – если есть встроенная поддержка History API;
 * `provider_hashchange` – реализация с помощью фолбэка hashchange.

### Использование

```js
modules.require(['history'], function(History) {

    // Создаем инстанс history
    var history = new History();

    // Добавляем запись или заменяем текущее состояние с помощью методов pushState/replaceState
    history.changeState('push', { title: 'Title', url: 'http://example.org:8080/path' });
    history.changeState('replace', { title: 'Title', url: 'http://example.org:8080/path?test=1' });

});
```
