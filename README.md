bem-history
===========

## What is this?
BEM wrap for History API:
* supports browsers with a native History API and hashchange event;
* provides manipulations with url, browser location and history in the terms of [BEM](http://bem.info/).

## Components

### Blocks
* `uri` – module for an url parsing;
* `history` – module provides work with a browser History with two modificators:
 * `provider_history-api` – supports a native History API;
 * `provider_hashchange` – supports fallback on the hashchange event;
* `location` – high-level module for a `window.location` change.

## Scheme of library work

![bem-history workflow](https://dl.dropboxusercontent.com/u/1122837/bem-history_from-browser.svg)

## Usage

### uri
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
    u.toString(); // "http://example.org:80/path?test=1&param2=2"

});
```

### history
```js
modules.require(['history'], function(History) {

    // Create history instance
    var history = new History();

    // Push new or replace history state
    history.changeState('push', { title: 'Title', url: 'http://example.org:8080/path' });
    history.changeState('replace', { title: 'Title', url: 'http://example.org:8080/path?test=1' });

});
```

### location
```js
modules.require(['location'], function(location) {

    // Change `window.location` using a full url
    location.change({ url: 'http://example.org:8080/path' });

    // Change current location using only the new query params
    location.change({ params: { param1: [11,12], param2: 'ololo' } });
    window.location.href; // "http://example.org:8080/path?param1=11&param1=12&param2=ololo"

});
```
