/**
 * Modificator for BEM-block history which provides native history API support.
 *
 * @module history
 */
modules.define('history', ['inherit', 'jquery', 'uri'], function(provide, inherit, $, Uri, Base) {

if(!Base.hasNativeAPI()) {
    provide(Base);
    return;
}

/**
 * @exports
 * @class history
 * @augments Base
 */
provide(inherit(Base, /** @lends history.prototype */{

    /**
     * Reaction for the window popstate event.
     * @private
     */
    _onPopState : function(e) {
        var state = e.originalEvent.state;

        // Ignore initial popstate
        if(state === null) {
            return;
        }

        this.state = this._normalizeState(state, document.title, window.location.href);

        // Remove silent param to fix back-forward buttons work
        // after location silent=true flag usage
        this.state.data && delete this.state.data.silent;

        this.emit('statechange', { state : state, nativeApi : true });
    },

    _bindEvents : function() {
        $(window).on('popstate', $.proxy(this._onPopState, this));

        return this;
    },

    _resetUrl : function() {
        var uri = Uri.parse(window.location.href);

        if(uri.getAnchor()) {
            window.history.replaceState({}, document.title, this._removeHashbang(window.location.href));
        }
        return this;
    },

    _syncState : function() {
        var state = window.history.state;

        // Replace null with empty object to catch initial popstate.
        // Initial val must be null (in specification).
        // But in the UC browser for Android history.state is always undefined.
        if(state === null || typeof state === 'undefined') {
            // In the Chrome browser for iOS when history.state
            // replaced with undefined the popstate event will not be triggered.
            // So, we can replace it with empty object.
            window.history.replaceState({}, document.title, window.location.href);
        }

        if(!this.state) {
            this.state = this._normalizeState(undefined, document.title, window.location.href);
        }

        return this;
    },

    /**
     * Change window location hash
     *
     * @param {String} method
     * @param {Object} state
     * @returns {event} 'statechange' event with data
     */
    changeState : function(method, state) {
        window.history[method + 'State'](state, state.title || document.title, state.url);
        this.state = state;

        return this.emit('statechange', { state : state, nativeApi : true });
    }

}));

});
