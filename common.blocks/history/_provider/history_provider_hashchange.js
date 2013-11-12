/* globals console, Uri */

BEM.decl({ block: 'history', modName: 'provider', modVal: 'hashchange' }, {
    
    _onHashChange: function(event) {
        console.log('########## _onHashChange fired');
        // console.log('    event:', event);
        console.log('    ' + event.originalEvent.oldURL + '    ->    ' + event.originalEvent.newURL + '\n');
        
        this.state = this.normalizeState(undefined, document.title, this._removeHashbang(window.location.href));

        this.trigger('statechange', { state: this.state, nativeApi: false });
    },
    
    bindEvents: function() {
        this.__base();
        BEM.DOM.win.on('hashchange', this.changeThis(this._onHashChange));
        
        return this;
    },
    
    unbindEvents: function() {
        this.__base();
        BEM.DOM.win.off('hashchange', this._onHashChange);

        return this;
    },
    
    syncState: function() {
        this.state = this.normalizeState(undefined, document.title, this._removeHashbang(window.location.href));
        return this;
    },
    
    /**
     * Adds hashbang to url.
     * ../search?p=1=> ../#!/search?p=1.
     *
     * @param {String} url
     * @returns {String}
     */
    _addHashbang: function(url) {
        var uri = new Uri(url),
            path = uri.path().split('/');
        
        uri.anchor('!/' + path[path.length - 1] + uri.query());
        uri.query('');
        
        return uri.normalized();
    },
    
    _resetUrl: function() {
        var uri = new Uri(window.location.href);
        
        if (!uri.anchor()) {
            window.location.assign(this._addHashbang(window.location.href));
        }
        return this;
    },
    
    changeState: function(method, state) {
        var uri = new Uri(state.url);
        
        // TODO full origin check
        if (uri.host() && uri.host() !== window.location.hostname) {
            throw new Error('SECURITY_ERR: DOM Exception 18');
        } else {
            this.state = state;
            window.location.hash = this._addHashbang(state.url).replace(/^[^#]+#/,'');
        }
    }

});