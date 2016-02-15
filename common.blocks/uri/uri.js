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

/**
 * @module uri
 */
modules.define('uri', ['querystring__uri'], function(provide, decoder) {

/**
 * Creates a new Uri object.
 * @constructor
 * @param {String} str
 */
function Uri(str) {
    this.uriParts = this.parseUri(str);
    this.queryParams = this.parseQuery(this.normalize(this.uriParts.query));
}

/**
 * Parse string and return Uri instance.
 * @param {String} str
 * @returns {Uri}  Uri instance
 */
Uri.parse = function(str) {
    return new Uri(str);
};

/**
 * Normalizes a full url to percentage encoding.
 * @param  {String}  str input url
 * @returns {String}
 */
Uri.normalize = function(str) {
    return Uri.parse(str).toString();
};

/**
 * Encode string.
 * @param  {String} str raw string
 * @returns {String}    encoded string
 */
Uri.prototype.encode = function(str) {
    return encodeURIComponent(str);
};

/**
 * Decode string.
 * @param  {String} str encoded string
 * @returns {String}    original string
 */
Uri.prototype.decode = function(str) {
    return decoder.decodeURIComponent(str);
};

/**
 * Normalizes url string to percentage encoding.
 * @param  {String} str original url
 * @returns {String}    normalized string
 */
Uri.prototype.normalize = function(str) {
    return (str || '').replace(/\+/g, '%20');
};

/**
* Breaks a uri string down into its individual parts.
* @param  {String} str uri
* @returns {Object}    parts
*/
Uri.prototype.parseUri = function(str) {
    var parser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*)(?::([^:@\/]*))?)?@)?(\[[0-9a-fA-F:.]+\]|[^:\/?#]*)(?::(\d+|(?=:)))?:?)((((?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, /* jshint ignore:line */
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
 * Breaks a query string down into an array of key/value pairs.
 * ?param=11 -> { param: ['11'] }
 * ?param=   -> { param: [''] }
 * ?param    -> { param: [] }
 * @param  {String} str query
 * @returns {Array}     array of arrays (key/value pairs)
 */
Uri.prototype.parseQuery = function parseQuery(str) {
    var i, ps, kvp, k, v,
        params = {};

    if(typeof str !== 'string' || str === '') {
        return params;
    }

    ps = str.replace('?', '').split('&');

    for(i = 0; i < ps.length; i++) {
        // Split only by first occurrence of =
        kvp = ps[i].split('=');
        kvp = [kvp.shift(), kvp[0] !== undefined ? kvp.join('=') : null];

        k = this.decode(kvp[0]);
        v = (kvp[1] || kvp[1] === '') ? this.decode(kvp[1]) : null;

        if(params[k]) {
            (v || v === '') && params[k].push(v);
        } else {
            params[k] = (v === null) ? [] : [v];
        }
    }
    return params;
};

/**
 * Define getter/setter methods.
 */
['Protocol', 'Host', 'Port', 'Path', 'Anchor'].forEach(function(key) {
    Uri.prototype['get' + key] = function(val) {
        return this.uriParts[key.toLowerCase()];
    };

    Uri.prototype['set' + key] = function(val) {
        this.uriParts[key.toLowerCase()] = val;
        return this;
    };
});

/**
 * Returns an object of query params.
 * @returns {Object}
 */
Uri.prototype.getParams = function(val) {
    return this.queryParams;
};

/**
 * Serializes the internal state of the query pairs.
 * @returns {String}       query string
 */
Uri.prototype.getQuery = function(val) {
    var s = '',
        params = this.queryParams,
        queryKeys = Object.keys(params),
        _this = this;

    queryKeys.forEach(function(key, index) {
        if(index > 0) {
            s += '&';
        }
        if(typeof params[key] === 'object' && !params[key].length) {
            s += _this.encode(key);
        } else {
            params[key].forEach(function(v, i) {
                if(i > 0) {
                    s += '&';
                }
                s += _this.encode(key) + '=' + _this.encode(v);
            });
        }
    });

    return s.length > 0 ? '?' + s : s;
};

/**
 * Url query setter.
 * @param  {String} [val] set a new query string
 * @returns {uri}
 */
Uri.prototype.setQuery = function(val) {
    if(typeof val !== 'undefined') {
        this.queryParams = this.parseQuery(val);
    }

    return this;
};

/**
 * Returns an array of query param values for the key.
 * @param  {String} key query key
 * @returns {Array}     array of values
 */
Uri.prototype.getParam = function(key) {
    return this.queryParams[key];
};

/**
 * Removes query parameters.
 * @param  {String} key     remove values for key
 * @param  {val}    [val]   remove a specific value, otherwise removes all
 * @returns {uri}           returns self for fluent chaining
 */
Uri.prototype.deleteParam = function(key, val) {
    var newParams = [];

    if(typeof val !== 'undefined') {
        this.queryParams[key].forEach(function(paramValue) {
            if(paramValue !== val) {
                newParams.push(paramValue);
            }
        });
        this.queryParams[key] = newParams;
    }

    if(typeof val === 'undefined' || newParams.length === 0) {
        delete this.queryParams[key];
    }

    return this;
};

/**
 * Adds a query parameter.
 * @param  {String}  key        add values for key
 * @param  {String}  val        value to add
 * @returns {uri}               returns self for fluent chaining
 */
Uri.prototype.addParam = function(key, val) {
    this.queryParams[key] = (this.queryParams[key] || []).concat(val);

    return this;
};

/**
 * Replaces query param values.
 * @param  {String} key         key to replace value for
 * @param  {String} newVal      new value
 * @param  {String} [oldVal]    replace only one specific value (otherwise replaces all)
 * @returns {uri}               returns self for fluent chaining
 */
Uri.prototype.replaceParam = function(key, newVal, oldVal) {
    return this.deleteParam(key, oldVal)
               .addParam(key, newVal);
};

/**
 * Scheme name, colon and doubleslash, as required.
 * @returns {String} http:// or simply //
 */
Uri.prototype.getScheme = function() {
    var s = '';

    if(this.getProtocol()) {
        s += this.getProtocol();
        if(this.getProtocol().indexOf(':') !== this.getProtocol().length - 1) {
            s += ':';
        }
        s += '//';
    } else if(this.getHost()) {
        s += '//';
    }

    return s;
};

/**
 * Same as Mozilla nsIURI.prePath.
 * @see  https://developer.mozilla.org/en/nsIURI
 * @returns {String} scheme://host:port
 */
Uri.prototype.getOrigin = function() {
    var s = this.getScheme();

    if(this.getHost()) {
        s += this.getHost();
        if(this.getPort()) {
            s += ':' + this.getPort();
        }
    }

    return s;
};

/**
 * Returns url root.
 * @returns {String} scheme://host:port + path without last
 */
Uri.prototype.getRoot = function() {
    var s = this.getOrigin();

    if(this.getPath()) {
        s += this.getPath().replace(/\/[^\/]*$/, '');
    }

    return s;
};

/**
 * Returns an array of path parts.
 * @returns {Object} path parts
 */
Uri.prototype.getPathParts = function() {
    return this.getPath().split('/');
};

/**
 * Serializes the internal state of the Uri object.
 * @returns {String}
 */
Uri.prototype.toString = function() {
    var s = this.getOrigin();

    if(this.getPath()) {
        if(this.getPath().indexOf('/') !== 0 && s[s.length - 1] !== '/') {
            s += '/' + this.getPath();
        } else {
            s += this.getPath();
        }
    } else {
        if(this.getHost() && (this.getQuery().toString() || this.getAnchor())) {
            s += '/';
        }
    }
    if(this.getQuery().toString()) {
        if(this.getQuery().toString().indexOf('?') !== 0) {
            s += '?';
        }
        s += this.getQuery().toString();
    }

    if(this.getAnchor()) {
        if(this.getAnchor().indexOf('#') !== 0) {
            s += '#';
        }
        s += this.getAnchor();
    }

    return s;
};

/**
 * Serializes the internal state of the Uri object
 * and replaces empty parts from current page state.
 * @returns {String}
 */
Uri.prototype.build = function() {
    var s = '';

    // No protocol/host – set current
    s += this.getProtocol() ? this.getProtocol() : window.location.protocol;
    s += (s.indexOf(':') !== s.length - 1) ? '://' : '//';

    s += this.getHost() ? this.getHost() : window.location.hostname;

    if(this.getPort()) {
        s += ':' + this.getPort();
    } else if(!this.getHost() && window.location.port) {
        s += ':' + window.location.port;
    }

    if(this.getPath()) {
        s += this.getPath();
    } else if(!this.getHost()) {
        s += window.location.pathname;
    } else {
        s += '/';
    }

    if(this.getQuery()) {
        if(this.getQuery().indexOf('?') !== 0) {
            s += '?';
        }
        s += this.getQuery();
    }

    if(this.getAnchor()) {
        if(this.getAnchor().indexOf('#') !== 0) {
            s += '#';
        }
        s += this.getAnchor();
    }

    return s;
};

provide(Uri);

});
