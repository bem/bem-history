## uri__querystring

Модуль для парсинга url. Расширяет базовый модуль из `bem-core` дополнительным классом `Uri`.

### Использование

```js
modules.require(['uri__querystring'], function(Querystring) {

    // Парсим url
    var u = Querystring.Uri.parse('http://example.org:8080/path?test=1&test=2&param2=22');

    // Изменяем порт
    u.setPort(80);

    // Изменяем параметры запроса
    u.deleteParam('test', '2');
    u.replaceParam('param2', 2);

    // Обратно сериализуем url
    u.toString(); // "http://example.org:8080/path?test=1&param2=2"

});
```
