BEM.decl({ block: 'history', modName: 'provider', modVal: 'history-api' }, {

    /**
     * Reaction for popstate jQuery event.
     *
     */
    _onPopState: function (e) {
        // console.log('########## _onPopState fired');
        // console.log('    event:', e);
        
        var state = e.originalEvent.state;

        // ignore initial popstate
        if (state === null) {
            return;
        }

        this.state = this.normalizeState(state, document.title, window.location.href);

        this.trigger('statechange', this.state);
    },

    bindEvents: function() {
        this.__base();
        BEM.DOM.win.on('popstate', this.changeThis(this._onPopState));

        return this;
    },

    unbindEvents: function() {
        this.__base();
        BEM.DOM.win.off('popstate', this._onPopState);

        return this;
    },
    
    _resetUrl: function() {
        var uri = BEM.blocks['uri'].parse(window.location.href);
        
        if (uri.anchor()) {
            window.history.replaceState(null, document.title, this._removeHashbang(window.location.href));
        }
        return this;
    },

    syncState: function() {
        // replace null with undefined to catch initial popstate
        if (window.history.state === null) {
            window.history.replaceState(undefined, document.title, window.location.href);
        }
        if (this.state === null || this.state === undefined) {
            this.state = this.normalizeState(undefined, document.title, window.location.href);
        }

        return this;
    },

    changeState: function (method, state) {
        window.history[method + 'State'](state.data, state.title || document.title, state.url);
        this.state = state;
        this.trigger('statechange', { state: state, nativeApi: true });
        
        return this;
    }

});
