modules.define('history', ['inherit', 'jquery', 'uri'], function(provide, inherit, $, Uri, Base) {

if (!window.history && !window.onhashchange) {
    provide(Base);
    return;
}

provide(inherit(Base, {
    
    _onHashChange: function() {
        // console.log('########## _onHashChange fired');
        // console.log('    event:', event);
        // console.log('    ' + event.originalEvent.oldURL + '    ->    ' + event.originalEvent.newURL + '\n');
        
        this.state = this.normalizeState(undefined, document.title, this._removeHashbang(window.location.href));

        this.trigger('statechange', { state: this.state, nativeApi: false });
    },
    
    bindEvents: function() {
        this.__base();
        $(window).on('hashchange', this.changeThis(this._onHashChange));
        
        return this;
    },
    
    unbindEvents: function() {
        this.__base();
        $(window).off('hashchange', this._onHashChange);

        return this;
    },
    
    syncState: function() {
        this.state = this.normalizeState(undefined, document.title, this._removeHashbang(window.location.href));
        return this;
    },
    
    /**
     * Adds hashbang to url.
     * ../search?p=1 => ../#!/search?p=1.
     *
     * @param {String} url
     * @returns {String}
     */
    _addHashbang: function(url) {
        var uri = new Uri(url),
            path = uri.path().split('/');
        
        uri.anchor('!/' + path[path.length - 1] + uri.query());
        uri.query('');
        
        return uri.build();
    },
    
    _resetUrl: function() {
        var uri = new Uri(window.location.href);
        
        if (!uri.anchor()) {
            window.location.replace(this._addHashbang(window.location.href));
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
            window.location.hash = this._addHashbang(state.url).replace(/^[^#]+#/, '');
        }
    }
    
}));

});
