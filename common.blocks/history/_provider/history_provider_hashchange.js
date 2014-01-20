/**
 * Modificator for BEM-block history which provides history-api support
 * through hashchange fallback
 */
BEM.decl({ block: 'history', modName: 'provider', modVal: 'hashchange' }, {
    
    _onHashChange: function() {
        this.state = this.normalizeState(undefined, document.title, this._removeHashbang(window.location.href));

        this.trigger('statechange', { state: this.state, nativeApi: false });
    },
    
    bindEvents: function() {
        this.__base.apply(this, arguments);
        BEM.DOM.win.on('hashchange', this.changeThis(this._onHashChange));
        
        return this;
    },
    
    unbindEvents: function() {
        this.__base.apply(this, arguments);
        BEM.DOM.win.off('hashchange', this._onHashChange);

        return this;
    },
    
    syncState: function() {
        this.state = this.normalizeState(undefined, document.title, this._removeHashbang(window.location.href));
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
        var uri = BEM.blocks.uri.parse(url),
            path = uri.pathParts();
        
        return ('!/' + path[path.length - 1] + uri.query());
    },
    
    _resetUrl: function() {
        var uri = BEM.blocks.uri.parse(window.location.href);
        
        if (!uri.anchor()) {
            window.location.hash = this._generateHashbang(window.location.href);
        }
        return this;
    },
    
    changeState: function(method, state) {
        var uri = BEM.blocks.uri.parse(state.url);
        
        if ((uri.host() && uri.host() !== window.location.hostname) ||
            (uri.port() && uri.port() !== window.location.port) ||
            (uri.protocol() && uri.protocol() !== window.location.protocol.replace(':', ''))) {

            throw new Error('SECURITY_ERR: DOM Exception 18');
        } else {
            this.state = state;
            window.location.hash = this._generateHashbang(state.url);
        }
    }

});
