bem-history Library
===================

### What is this?
BEM wrap for History API:
* supports browsers with native History API and hashchange event;
* provides manipulations with url, browser location and history in the terms of BEM (http://bem.info/).

### Components
* `uri` module for an url parsing;
* `history` module provides work with browser History with two modificators:
 * `provider_history-api` supports native History API;
 * `provider_hashchange` supports fallback on hashchange event;
* `location` high-level module for a `window.location` change.

### Usage

```js
// Require modules
modules.require(['uri', 'history', 'location'], function(Uri, History, location) {
    // Create history instance
    var history = new History();
    
    // Parse url
    var u = Uri.parse('http://example.org:8080/path?test=1&test=2&param2=22');
    
    // Change port
    u.port(80);
    
    // Change query params
    u.deleteParam('test', '2');
    u.replaceParam('param2', 2);
    
    // Serialize url
    u.toString(); // "http://example.org:8080/path?test=1&param2=2"
    
    
    // Push new or replace history state
    history.pushState({}, 'Title', 'http://example.org:8080/path');
    history.replaceState({}, 'Title', 'http://example.org:8080/path?test=1');
    
    
    // Change `window.location` using a full url
    location.change({ url: 'http://example.org:8080/path' });

    // Change current location using only the new query params
    location.change({ params: { param1: [11,12], param2: 'ololo' } });
    window.location.href; // "http://example.org:8080/path?param1=11&param1=12&param2=ololo"    
    
});
```
