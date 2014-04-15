/**
 * Modificator for BEM-block history which provides native history API support.
 */
BEM.decl({ block: 'history', modName: 'provider', modVal: 'history-api' }, {

    /**
     * Reaction for the window popstate event.
     * @private
     */
    _onPopState: function(e) {
        var state = e.originalEvent.state;

        // Ignore initial popstate
        if (state === null) {
            return;
        }

        this.state = this.normalizeState(state, document.title, window.location.href);
        
        // Remove trigger param to fix back-forward buttons work
        // after location trigger=false flag usage
        this.state.data && delete this.state.data.trigger;
        
        this.trigger('statechange', this.state);
    },

    bindEvents: function() {
        this.__base.apply(this, arguments);
        BEM.DOM.win.on('popstate', this.changeThis(this._onPopState));

        return this;
    },

    unbindEvents: function() {
        this.__base.apply(this, arguments);
        BEM.DOM.win.off('popstate', this._onPopState);

        return this;
    },
    
    _resetUrl: function() {
        var uri = BEM.blocks.uri.parse(window.location.href);
        
        if (uri.anchor()) {
            window.history.replaceState(null, document.title, this._removeHashbang(window.location.href));
        }
        return this;
    },

    syncState: function() {
        // Replace null with undefined to catch initial popstate
        if (window.history.state === null) {
            window.history.replaceState(undefined, document.title, window.location.href);
        }
        if (this.state === null || this.state === undefined) {
            this.state = this.normalizeState(undefined, document.title, window.location.href);
        }

        return this;
    },

    changeState: function(method, state) {
        window.history[method + 'State'](state.data, state.title || document.title, state.url);
        this.state = state;
        this.trigger('statechange', { state: state, nativeApi: true });
        
        return this;
    }

});
