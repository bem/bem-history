/*!
 * Library for uri parsing and changing.
 * Based on jsUri but mostly refactored and rewritten.
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

/* jshint maxlen:175 */

BEM.decl('uri', {

    onSetMod: {
        js: function() {
            /**
             * Defines getter/setter methods.
             */
            var _this = this;
            
            ['protocol', 'host', 'port', 'path', 'anchor'].forEach(function(key) {
                _this[key] = function(val) {
                    if (typeof val !== 'undefined') {
                        this.uriParts[key] = val;
                        return this;
                    }
        
                    return this.uriParts[key];
                };
            });
        }
    },
    
    /**
     * Encode string.
     * @param  {String} str raw string
     * @returns {String}    encoded string
     */
    encode: function(str) {
        return encodeURIComponent(str);
    },
    
    /**
     * Decode string.
     * @param  {String} str encoded string
     * @returns {String}    original string
     */
    decode: function(str) {
        try {
            str = decodeURIComponent(str);
        } catch (e1) {
            try {
                str = decodeURIComponent(this.convert(str));
            } catch (e2) {}
        }
        return str;
    },
    
    /**
     * Converts cp1251 encoded string to UTF-8.
     * @param  {String} str encoded string
     * @returns {String}    decoded string
     */
    convert: function(str) {
        // Equivalency table for cp1251 and utf8.
        var map = { '%D0': '%D0%A0', '%C0': '%D0%90', '%C1': '%D0%91', '%C2': '%D0%92', '%C3': '%D0%93', '%C4': '%D0%94', '%C5': '%D0%95', '%A8': '%D0%81', '%C6': '%D0%96',
                    '%C7': '%D0%97', '%C8': '%D0%98', '%C9': '%D0%99', '%CA': '%D0%9A', '%CB': '%D0%9B', '%CC': '%D0%9C', '%CD': '%D0%9D', '%CE': '%D0%9E', '%CF': '%D0%9F',
                    '%D1': '%D0%A1', '%D2': '%D0%A2', '%D3': '%D0%A3', '%D4': '%D0%A4', '%D5': '%D0%A5', '%D6': '%D0%A6', '%D7': '%D0%A7', '%D8': '%D0%A8', '%D9': '%D0%A9',
                    '%DA': '%D0%AA', '%DB': '%D0%AB', '%DC': '%D0%AC', '%DD': '%D0%AD', '%DE': '%D0%AE', '%DF': '%D0%AF', '%E0': '%D0%B0', '%E1': '%D0%B1', '%E2': '%D0%B2',
                    '%E3': '%D0%B3', '%E4': '%D0%B4', '%E5': '%D0%B5', '%B8': '%D1%91', '%E6': '%D0%B6', '%E7': '%D0%B7', '%E8': '%D0%B8', '%E9': '%D0%B9', '%EA': '%D0%BA',
                    '%EB': '%D0%BB', '%EC': '%D0%BC', '%ED': '%D0%BD', '%EE': '%D0%BE', '%EF': '%D0%BF', '%F0': '%D1%80', '%F1': '%D1%81', '%F2': '%D1%82', '%F3': '%D1%83',
                    '%F4': '%D1%84', '%F5': '%D1%85', '%F6': '%D1%86', '%F7': '%D1%87', '%F8': '%D1%88', '%F9': '%D1%89', '%FA': '%D1%8A', '%FB': '%D1%8B', '%FC': '%D1%8C',
                    '%FD': '%D1%8D', '%FE': '%D1%8E', '%FF': '%D1%8F' };
        
        // Symbol code in cp1251 (hex) : symbol code in utf8.
        str = str.replace(/%.{2}/g, function($0) { return map[$0] || $0; });
        return str;
    },
    
    /**
     * Normalizes spaces in the url string to percentage encoding.
     * @param  {String} str original url
     * @returns {String}    normalized string
     */
    normalize: function(str) {
        return (str || '').replace(/\+/g, '%20');
    },
    
    /**
     * Breaks a uri string down into its individual parts.
     * @param  {String} str uri
     * @returns {Object}    parts
     */
    parseUri: function(str) {
        /*
        DO NOT split parser regex into parts because it can seriously affect performance!
        jsHint maxlen changed to fix maxlength warning at this line.
        */
        var parser = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            parserKeys = ['source', 'protocol', 'authority',
                          'userInfo', 'user', 'password', 'host', 'port',
                          'relative', 'path', 'directory', 'file', 'query', 'anchor'],
            m = parser.exec(str || ''),
            parts = {};

        parserKeys.forEach(function(key, i) {
            parts[key] = m[i] || '';
        });
        
        return parts;
    },
    
    /**
     * Breaks a query string down into an array of key/value pairs.
     * ?param=11 -> { param: ['11'] }
     * ?param=   -> { param: [''] }
     * ?param    -> { param: [] }
     * @param  {String} str query
     * @returns {Array}     array of arrays (key/value pairs)
     */
    parseQuery: function(str) {
        var i, ps, kvp, k, v,
            params = {};

        if (typeof str !== 'string' || str === '') {
            return params;
        }

        ps = str.replace('?', '').split('&');

        for (i = 0; i < ps.length; i++) {
            // Split only by first occurrence of =
            kvp = ps[i].split('=');
            kvp = [kvp.shift(), kvp[0] !== undefined ? kvp.join('=') : null];
            
            k = this.decode(kvp[0]);
            v = (kvp[1] || kvp[1] === '') ? this.decode(kvp[1]) : null;
            
            if (params[k]) {
                (v || v === '') && params[k].push(v);
            } else {
                params[k] = (v === null) ? [] : [v];
            }
        }
        return params;
    },

    /**
     * Serializes the internal state of the query pairs.
     * @param  {String} [val]  set a new query string
     * @returns {String}       query string
     */
    query: function(val) {
        var s = '';

        if (typeof val !== 'undefined') {
            this.queryParams = this.parseQuery(val);
        }
        
        var params = this.queryParams,
            queryKeys = Object.keys(params),
            _this = this;

        queryKeys.forEach(function(key, index) {
            if (index > 0) {
                s += '&';
            }
            if (typeof params[key] === 'object' && !params[key].length) {
                s += key;
            } else {
                params[key].forEach(function(v, i) {
                    if (i > 0) {
                        s += '&';
                    }
                    s += _this.encode(key) + '=' + _this.encode(v);
                });
            }
        });

        return s.length > 0 ? '?' + s : s;
    },

    /**
     * Returns an array of query param values for the key.
     * @param  {String} key query key
     * @returns {Array}     array of values
     */
    getParam: function(key) {
        return this.queryParams[key];
    },

    /**
     * Removes query parameters.
     * @param  {String} key     remove values for key
     * @param  {val}    [val]   remove a specific value, otherwise removes all
     * @returns {Uri}           returns self for fluent chaining
     */
    deleteParam: function(key, val) {
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
    },

    /**
     * Adds a query parameter.
     * @param  {String}  key        add values for key
     * @param  {String}  val        value to add
     * @param  {integer} [index]    specific index to add the value at
     * @returns {Uri}               returns self for fluent chaining
     */
    addParam: function(key, val) {
        this.queryParams[key] = (this.queryParams[key] || []).concat(val);
        
        return this;
    },

    /**
     * Replaces query param values.
     * @param  {String} key         key to replace value for
     * @param  {String} newVal      new value
     * @param  {String} [oldVal]    replace only one specific value (otherwise replaces all)
     * @returns {Uri}               returns self for fluent chaining
     */
    replaceParam: function(key, newVal, oldVal) {
        return this.deleteParam(key, oldVal)
                   .addParam(key, newVal);
    },

    /**
     * Scheme name, colon and doubleslash, as required.
     * @returns {String} http:// or simply //
     */
    scheme: function() {
        var s = '';

        if (this.protocol()) {
            s += this.protocol();
            if (this.protocol().indexOf(':') !== this.protocol().length - 1) {
                s += ':';
            }
            s += '//';
        } else if (this.host()) {
            s += '//';
        }

        return s;
    },

    /**
     * Same as Mozilla nsIURI.prePath.
     * @see  https://developer.mozilla.org/en/nsIURI
     * @returns {String} scheme://host:port
     */
    origin: function() {
        var s = this.scheme();

        if (this.host()) {
            s += this.host();
            if (this.port()) {
                s += ':' + this.port();
            }
        }

        return s;
    },
    
    /**
     * Returns url root.
     * @returns {String} scheme://host:port + path without last
     */
    getRoot: function() {
        var s = this.origin();

        if (this.path()) {
            s += this.path().replace(/\/[^\/]*$/, '');
        }

        return s;
    },
    
    /**
     * Returns an array of path parts.
     * @returns {Object} path parts
     */
    pathParts: function() {
        return this.path().split('/');
    },

    /**
     * Serializes the internal state of the Uri object.
     * @returns {String}
     */
    toString: function() {
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
    },
    
    /**
     * Serializes the internal state of the Uri object
     * and replaces empty parts from current page state.
     * @returns {String}
     */
    build: function() {
        var s = '';
        
        // No protocol/host – set current
        s += this.protocol() ? this.protocol() : window.location.protocol;
        s += (s.indexOf(':') !== s.length - 1) ? '://' : '//';
        
        s += this.host() ? this.host() : window.location.hostname;
        
        if (this.port()) {
            s += ':' + this.port();
        } else if (!this.host() && window.location.hostname) {
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
    }

}, {

    /**
     * Parses an input url and returns Uri instance.
     * @param  {String}  str input url
     * @returns {String}
     */
    parse: function(str) {
        var uri = BEM.create({ block: 'uri' });
        
        uri.uriParts = uri.parseUri(uri.normalize(str));
        uri.queryParams = uri.parseQuery(uri.uriParts.query);
        
        return uri;
    },
    
    /**
     * Normalizes a full url to percentage encoding.
     * @param  {String}  str input url
     * @returns {String}
     */
    normalize: function(str) {
        return this.parse(str).toString();
    }

}

);
