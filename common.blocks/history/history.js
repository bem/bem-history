modules.define('history', ['inherit', 'events', 'jquery'], function(provide, inherit, events, $) {

// Fallback for old browsers
if (history.pushState) {
    provide({
        pushState: function (state, title, url) {
            if (url) window.location.href = url;
        },
        replaceState: function (state, title, url) {
            if (url) window.location.href = url;
        }
    });
    return;
}

provide(new (inherit(events.Emitter, {

    __constructor : function() {
        if (history.state === null) {
            history.replaceState(undefined, document.title);
        }
        $(window).on('popstate', $.proxy(this._onPopState, this));
    },

    /**
     * Adds new state to browsing history.
     *
     * @param {Object} state New state.
     * @param {String} title Document title.
     * @param {String} [url] Location url.
     * @returns {Object}
     */
    pushState: function(state, title, url) {
        return this._changeState('push', arguments);
    },

    /**
     * Replaces current state.
     *
     * @param {Object} state New state.
     * @param {String} title Document title.
     * @param {String} [url] Location url.
     * @returns {Object}
     */
    replaceState: function(state, title, url) {
        return this._changeState('replace', arguments);
    },

    /**
     * Changes current state.
     *
     * @param {String} method Push or replace method.
     * @param {Array} args Real method params.
     * @returns {Object}
     * @private
     */
    _changeState: function(method, args) {
        var state = this.state = args[0];

        try {
            history[method + 'State'].apply(history, args);
        } catch (e) {
            return this.trigger('error', { state: state, error: e });
        }

        return this.trigger('statechange', { state: state });
    },

    /**
     * Reaction for popstate jQuery event.
     */
    _onPopState: function (e) {
        var state = e.originalEvent.state;
        // ignore initial popstate
        if (state === null) {
            return;
        }
        this.state = state;
        this.trigger('statechange', { state: state });
    }
}))());

});
