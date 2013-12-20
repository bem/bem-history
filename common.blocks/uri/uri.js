modules.define('uri', function(provide) {

/*!
 * Library for uri parsing and changing.
 * Based on jsUri but mostly refactored and rewritten
 * 
 * Includes parts of jsUri 
 * https://github.com/derek-watson/jsUri
 * Copyright 2012, Derek Watson
 * Released under the MIT license.
 *
 * Includes parseUri regular expressions
 * http://blog.stevenlevithan.com/archives/parseuri
 * Copyright 2007, Steven Levithan
 * Released under the MIT license.
 */

// @TODO
// 1.+ param values as arrays (get, set, replace methods)
// 2.+ query params as object { key1: [value], key2: [value1, value2] }
// 3.+ license
// 4. normalization. Создание копии объекта по uriParts через extend


    /**
     * unescape a query param value
     * @param  {string} s encoded value
     * @return {string}   decoded value
     */
/*
    function decode(s) {
        return decodeURIComponent(s).replace('+', ' ');
    }
*/
/**
 * Creates a new Uri object
 * @constructor
 * @param {string} str
 */
function Uri(str) {
    this.uriParts = this.parseUri(str);
    this.queryParams = this.parseQuery(this.uriParts.query);
}

/**
 * Breaks a uri string down into its individual parts
 * @param  {string} str uri
 * @return {object}     parts
 */
Uri.prototype.parseUri = function(str) {
    var regexpParts = [
            '^(?:(?![^:@]+:[^:@\\/]*@)([^:\\/?#.]+):)?(?:\\/\\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)',
            '?([^:\\/?#]*)(?::(\\d*))?)',
            '(((\\/(?:[^?#](?![^?#\\/]*\\.[^?#\\/.]+(?:[?#]|$)))*\\/?)',
            '?([^?#\\/]*))(?:\\?([^#]*))?(?:#(.*))?)'
        ],
        parser = new RegExp(regexpParts.join('')),
        parserKeys = ['source', 'protocol', 'authority',
                      'userInfo', 'user', 'password', 'host', 'port',
                      'relative', 'path', 'directory', 'file', 'query', 'anchor'],
        m = parser.exec(str || ''),
        parts = {};

    parserKeys.forEach(function(key, i) {
        parts[key] = m[i] || '';
    });

    return parts;
};

/**
 * Breaks a query string down into an array of key/value pairs
 * @param  {string} str query
 * @return {array}      array of arrays (key/value pairs)
 */
Uri.prototype.parseQuery = function parseQuery(str) {
    var i, ps, kvp, k, v,
        params = {};

    if (typeof str !== 'string' || str === '') {
        return params;
    }

    ps = str.replace('?', '').split(/[&;]/);

    for (i = 0; i < ps.length; i++) {
        kvp = ps[i].split('=');
        k = kvp[0];
        v = kvp[1] || null;
        if (params[k]) {
            params[k].push(v);
        } else {
            params[k] = [v];
        }
    }
    return params;
};

/**
 * Define getter/setter methods
 */
['protocol', 'host', 'port', 'path', 'anchor'].forEach(function(key) {
    Uri.prototype[key] = function(val) {
        if (typeof val !== 'undefined') {
            this.uriParts[key] = val;
        }
    
        return this.uriParts[key];
    };
});

/**
 * Serializes the internal state of the query pairs
 * @param  {string} [val]   set a new query string
 * @return {string}         query string
 */
Uri.prototype.query = function(val) {
    var s = '';

    if (typeof val !== 'undefined') {
        this.queryParams = this.parseQuery(val);
    }

    var params = this.queryParams,
        queryKeys = Object.keys(params);

    queryKeys.forEach(function(key, index) {
        if (index > 0) {
            s += '&';
        }
        if (params[key] === null) {
            s += key;
        } else {
            params[key].forEach(function(v, i) {
                if (i > 0) {
                    s += '&';
                }
                s += key + '=' + v;
            });
        }
    });

    return s.length > 0 ? '?' + s : s;
};

/**
 * returns an array of query param values for the key
 * @param  {string} key query key
 * @return {array}      array of values
 */
Uri.prototype.getQueryParamValues = function(key) {
    return this.queryParams[key];
};

/**
 * removes query parameters
 * @param  {string} key     remove values for key
 * @param  {val}    [val]   remove a specific value, otherwise removes all
 * @return {Uri}            returns self for fluent chaining
 */
Uri.prototype.deleteQueryParam = function(key, val) {
    var newParams = [];

    if (typeof val !== 'undefined') {
        this.queryParams[key].forEach(function(paramValue) {
            if (paramValue !== val) {
                newParams.push(paramValue);
            }
        });
        this.queryParams[key] = newParams;
    }

    if (typeof val === 'undefined' || newParams.length === 0) {
        delete this.queryParams[key];
    }

    return this;
};

/**
 * adds a query parameter
 * @param  {string}  key        add values for key
 * @param  {string}  val        value to add
 * @param  {integer} [index]    specific index to add the value at
 * @return {Uri}                returns self for fluent chaining
 */
Uri.prototype.addQueryParam = function(key, val) {
    this.queryParams[key] = (this.queryParams[key] || []).concat(val);

    return this;
};

/**
 * replaces query param values
 * @param  {string} key         key to replace value for
 * @param  {string} newVal      new value
 * @param  {string} [oldVal]    replace only one specific value (otherwise replaces all)
 * @return {Uri}                returns self for fluent chaining
 */
Uri.prototype.replaceQueryParam = function(key, newVal, oldVal) {
    return this.deleteQueryParam(key, oldVal)
               .addQueryParam(key, newVal);
};

/**
 * Scheme name, colon and doubleslash, as required
 * @return {string} http:// or possibly just //
 */
Uri.prototype.scheme = function() {
    var s = '';

    if (this.protocol()) {
        s += this.protocol();
        if (this.protocol().indexOf(':') !== this.protocol().length - 1) {
            s += ':';
        }
        s += '//';
    }
    // else {
    //     if (this.host()) {
    //         s += '//';
    //     }
    // }

    return s;
};

/**
 * Same as Mozilla nsIURI.prePath
 * @return {string} scheme://user:password@host:port
 * @see  https://developer.mozilla.org/en/nsIURI
 */
Uri.prototype.origin = function() {
    var s = this.scheme();

    if (this.host()) {
        s += this.host();
        if (this.port()) {
            s += ':' + this.port();
        }
    }

    return s;
};

/**
 * Serializes the internal state of the Uri object
 * @return {string}
 */
Uri.prototype.toString = function() {
    var s = this.origin();

    if (this.path()) {
        if (this.path().indexOf('/') !== 0 && s[s.length - 1] !== '/') {
            s += '/' + this.path();
        } else {
            s += this.path();
        }
    } else {
        if (this.host() && (this.query().toString() || this.anchor())) {
            s += '/';
        }
    }
    if (this.query().toString()) {
        if (this.query().toString().indexOf('?') !== 0) {
            s += '?';
        }
        s += this.query().toString();
    }

    if (this.anchor()) {
        if (this.anchor().indexOf('#') !== 0) {
            s += '#';
        }
        s += this.anchor();
    }

    return s;
};

/**
 * Serializes the internal state of the Uri object
 * and replaces empty parts from current page state
 * @return {string}
 */
Uri.prototype.build = function() {
    var s = '';

    // Нет протокола/хоста – ставим текущие
    s += this.protocol() ? this.protocol() : window.location.protocol;
    s += (s.indexOf(':') !== s.length - 1) ? '://' : '//';

    s += this.host() ? this.host() : window.location.hostname;

    // TODO remove :80 if http, :443 https
    if (this.port()) {
        s += ':' + this.port();
    } else if (!this.host()) {
        s += ':' + window.location.port;
    }

    if (this.path()) {
        s += this.path();
    } else if (!this.host()) {
        s += window.location.pathname;
    } else {
        s += '/';
    }

    if (this.query()) {
        if (this.query().indexOf('?') !== 0) {
            s += '?';
        }
        s += this.query();
    }

    if (this.anchor()) {
        if (this.anchor().indexOf('#') !== 0) {
            s += '#';
        }
        s += this.anchor();
    }

    return s;
};

provide(Uri);

});