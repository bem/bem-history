## location

Высокоуровневый блок для изменения `window.location`.

### Использование

```js
modules.require(['location'], function(location) {

    // Изменяем `window.location` с помощью полного url
    location.change({ url: 'http://example.org:8080/path' });

    // Изменяем текущий location, используя только новые параметры запроса
    location.change({ params: { param1: [11,12], param2: 'ololo' } });
    window.location.href; // "http://example.org:8080/path?param1=11&param1=12&param2=ololo"

});
```
