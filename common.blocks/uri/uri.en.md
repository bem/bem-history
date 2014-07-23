## uri

Module for an url parsing.

### Usage

```js
modules.require(['uri'], function(Uri) {

    // Parse url
    var u = Uri.parse('http://example.org:8080/path?test=1&test=2&param2=22');

    // Change port
    u.setPort(80);

    // Change query params
    u.deleteParam('test', '2');
    u.replaceParam('param2', 2);

    // Serialize url
    u.toString(); // "http://example.org:8080/path?test=1&param2=2"

});
```
