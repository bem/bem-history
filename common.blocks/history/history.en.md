## history

Module provides work with browser History with two modificators:
 * `provider_history-api` – supports native History API;
 * `provider_hashchange` – supports fallback on hashchange event.

### Usage

```js
modules.require(['history'], function(History) {

    // Create history instance
    var history = new History();

    // Push new or replace history state
    history.changeState('push', { title: 'Title', url: 'http://example.org:8080/path' });
    history.changeState('replace', { title: 'Title', url: 'http://example.org:8080/path?test=1' });

});
```
