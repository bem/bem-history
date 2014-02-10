/**
 * Modificator for BEM-block history which provides native history API support.
 */
modules.define('history', ['inherit', 'jquery', 'uri'], function(provide, inherit, $, Uri, Base) {
    
if (!(window.history && 'pushState' in window.history)) {
    provide(Base);
    return;
}

provide(inherit(Base, {

    /**
     * Reaction for the window popstate event.
     * @private
     */
    _onPopState: function (e) {
        var state = e.originalEvent.state;

        // Ignore initial popstate
        if (state === null) {
            return;
        }

        this.state = this.normalizeState(state, document.title, window.location.href);
        
        // Remove trigger param to fix back-forward buttons work
        // after location trigger=false flag usage
        this.state.data && delete this.state.data.trigger;
        
        this.emit('statechange', { state: state, nativeApi: true });
    },
    
    bindEvents: function() {
        $(window).on('popstate', $.proxy(this._onPopState, this));

        return this;
    },

    unbindEvents: function() {
        $(window).off('popstate', this._onPopState);

        return this;
    },
    
    _resetUrl: function() {
        var uri = Uri.parse(window.location.href);
        
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
        
        return this.emit('statechange', { state: state, nativeApi: true });
    }
    
}));

});
