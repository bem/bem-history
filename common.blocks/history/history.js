/**
 * Polyfill for History API.
 * @see https://developer.mozilla.org/en-US/docs/DOM/window.history
 *
 * @property {Object} state Current state.
 */
BEM.decl('history', history.pushState ? {

    onSetMod: {

        'js': function () {

            this.__base.apply(this, arguments);
            // replace null with undefined to catch initial popstate
            if (history.state === null) {
                history.replaceState(undefined, document.title);
            }
            jQuery(window).on('popstate', this._onPopState.bind(this));
        }

    },

    destruct: function () {
        jQuery(window).off('popstate', this._onPopState);
        this.__base.apply(this, arguments);
    },

    /**
     * Adds new state to browsing history.
     *
     * @param {Object} state New state.
     * @param {String} title Document title.
     * @param {String} [url] Location url.
     * @returns {Object}
     */
    pushState: function (state, title, url) {
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
    replaceState: function (state, title, url) {
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
    _changeState: function (method, args) {
        var state = this.state = args[0];

        try {
            history[method + 'State'].apply(history, args);
        } catch (e) {
            this.trigger('error', { state: state, error: e });
            return this;
        }

        this.trigger('statechange', { state: state });
        return this;
    },

    /**
     * Reaction for popstate jQuery event.
     *
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

} :
{

    pushState: function (state, title, url) {
        if (url) window.location.href = url;
    },

    replaceState: function (state, title, url) {
        if (url) window.location.href = url;
    }

});
