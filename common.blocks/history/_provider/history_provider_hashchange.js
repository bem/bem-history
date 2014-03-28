/**
 * Modificator for BEM-block history which provides history API support
 * through hashchange fallback.
 */
modules.define('history', ['inherit', 'jquery', 'uri'], function(provide, inherit, $, Uri, Base) {

if (!('onhashchange' in window) || (window.history && 'pushState' in window.history)) {
    provide(Base);
    return;
}

provide(inherit(Base, {
    /**
     * @constructor
     */
    _onHashChange: function() {
        this.state = this._normalizeState(undefined, document.title, this._removeHashbang(window.location.href));
        
        this.emit('statechange', { state: this.state, nativeApi: false });
    },
    
    _bindEvents: function() {
        $(window).on('hashchange', $.proxy(this._onHashChange, this));
        
        return this;
    },
    
    _syncState: function() {
        this.state = this._normalizeState(undefined, document.title, this._removeHashbang(window.location.href));
        return this;
    },
    
    /**
     * Generates hashbang from url.
     * ../search?p=1 => ..#!/search?p=1.
     *
     * @param {String} url
     * @returns {String}
     * @private
     */
    _generateHashbang: function(url) {
        var uri = Uri.parse(url),
            path = uri.getPathParts();
        
        return ('!/' + path[path.length - 1] + uri.getQuery());
    },
    
    _resetUrl: function() {
        var uri = Uri.parse(window.location.href);
        
        if (!uri.getAnchor()) {
            window.location.hash = this._generateHashbang(window.location.href);
        }
        return this;
    },
    
    changeState: function(method, state) {
        var uri = Uri.parse(state.url);
        
        if ((uri.getHost() && uri.getHost() !== window.location.hostname) ||
            (uri.getPort() && uri.getPort() !== window.location.port) ||
            (uri.getProtocol() && uri.getProtocol() !== window.location.protocol.replace(':', ''))) {
        
            throw new Error('SECURITY_ERR: DOM Exception 18');
        } else {
            this.state = state;
            window.location.hash = this._generateHashbang(state.url);
        }
    }
    
}));

});
