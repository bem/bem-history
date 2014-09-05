## location

High-level module for a `window.location` change.

### Usage

```js
modules.require(['location'], function(location) {

    // Change `window.location` using a full url
    location.change({ url: 'http://example.org:8080/path' });

    // Change current location using only the new query params
    location.change({ params: { param1: [11,12], param2: 'ololo' } });
    window.location.href; // "http://example.org:8080/path?param1=11&param1=12&param2=ololo"

});
```
